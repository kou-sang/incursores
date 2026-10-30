# Registro por email con verificación por código (token)

Objetivo: cuando alguien se registra con correo y contraseña (sin Google), primero recibe un **código de 6 dígitos** por email; recién al validarlo se crea la cuenta.

## Por qué no se puede hacer solo desde el frontend

- Firebase Auth **no envía códigos OTP por email**: sus plantillas solo mandan *enlaces* (verificación, reset, login sin contraseña).
- Generar, guardar y validar un código exige un **servidor de confianza**: si el código se genera o se compara en el navegador, cualquiera lo lee desde DevTools.
- Cloud Functions requiere el plan **Blaze** (con tarjeta). Para seguir en $0 se usan las **Serverless Functions de Vercel** (plan Hobby) + **Resend** para enviar el correo.

> ⚠️ Límites gratuitos: Resend Free = **100 emails/día y 3.000/mes**, 1 dominio verificado. Cada reenvío de código consume 1 email → hace falta rate-limit (ver abajo). Vercel Hobby es para uso no comercial.

## Arquitectura

```
Navegador                         Vercel /api (Node)                     Firebase
─────────                         ─────────────────                      ────────
1. email ───────────────────────► POST /api/auth/request-code
                                   · valida email y que no exista  ─────► Auth (Admin SDK)
                                   · rate-limit                    ─────► Firestore emailVerifications/{hash(email)}
                                   · genera código, guarda HASH
                                   · envía email (Resend)
2. código + usuario + contraseña ► POST /api/auth/register
                                   · compara hash (timing-safe), vencimiento, intentos
                                   · createUser({ emailVerified: true }) ► Auth
                                   · crea profiles/{uid} y users/{uid} ► Firestore
                                   · borra la verificación
                                   ◄── customToken
3. signInWithCustomToken(customToken)
```

## Paso a paso

### 1. Servicios externos (gratis)
1. **Resend**: crear cuenta → verificar tu dominio (registros DNS) → crear API key. Sin dominio verificado solo puedes enviarte correos a ti mismo (modo prueba).
2. **Firebase**: Consola → Configuración del proyecto → Cuentas de servicio → *Generar nueva clave privada* (JSON). **No** se commitea (ya está en `.gitignore` como `service-account*.json`).
3. **Vercel** → Settings → Environment Variables:
   - `FIREBASE_SERVICE_ACCOUNT` = contenido del JSON en una línea
   - `RESEND_API_KEY`
   - `CODE_PEPPER` = cadena aleatoria larga (se mezcla en el hash del código)
   - `MAIL_FROM` = `Colossus <no-reply@tu-dominio.com>`

### 2. Dependencias
`firebase-admin` ya está en `devDependencies`; en Vercel las funciones de `/api` necesitan que esté en **dependencies**. Agregar también `resend`:
```bash
npm install firebase-admin resend
```

### 3. Código del servidor (`/api`, en la raíz del repo)

`api/_lib/admin.js`
```js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

// Inicialización única entre invocaciones "calientes" de la función.
const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutos
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');
export const hashCode = (email, code) => sha256(`${email}:${code}:${process.env.CODE_PEPPER}`);
export const safeEqual = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
```

`api/auth/request-code.js`
```js
import { Resend } from 'resend';
import { adminAuth, adminDb, CODE_TTL_MS, generateCode, hashCode, normalizeEmail, RESEND_COOLDOWN_MS, sha256 } from '../_lib/admin.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const email = normalizeEmail(req.body?.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid-email' });

    // Si ya existe, se responde igual que en éxito (no revela qué correos están registrados).
    const exists = await adminAuth.getUserByEmail(email).then(() => true).catch(() => false);
    if (exists) return res.status(200).json({ ok: true });

    const ref = adminDb.collection('emailVerifications').doc(sha256(email));
    const previous = await ref.get();
    if (previous.exists && Date.now() - previous.data().lastSentAt < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: 'cooldown' }); // Protege la cuota de 100 emails/día
    }

    const code = generateCode();
    await ref.set({ codeHash: hashCode(email, code), expiresAt: Date.now() + CODE_TTL_MS, attempts: 0, lastSentAt: Date.now() });
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Tu código de Colossus: ${code}`,
      text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[request-code]', error);
    return res.status(500).json({ error: 'internal' });
  }
}
```

`api/auth/register.js`
```js
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb, hashCode, MAX_ATTEMPTS, normalizeEmail, safeEqual, sha256 } from '../_lib/admin.js';

const USERNAME = /^[\p{L}\p{N}_ ]{2,24}$/u;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const email = normalizeEmail(req.body?.email);
    const { code, password, username, gender } = req.body ?? {};
    if (!/^\d{6}$/.test(String(code)) || String(password ?? '').length < 6
      || !USERNAME.test(String(username ?? '').trim()) || !['masculino', 'femenino'].includes(gender)) {
      return res.status(400).json({ error: 'invalid-input' });
    }

    const ref = adminDb.collection('emailVerifications').doc(sha256(email));
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(400).json({ error: 'code-invalid' });
    const data = snapshot.data();
    if (Date.now() > data.expiresAt || data.attempts >= MAX_ATTEMPTS) {
      await ref.delete();
      return res.status(400).json({ error: 'code-expired' });
    }
    if (!safeEqual(data.codeHash, hashCode(email, String(code)))) {
      await ref.update({ attempts: FieldValue.increment(1) }); // Anti fuerza bruta: 5 intentos
      return res.status(400).json({ error: 'code-invalid' });
    }

    const cleanName = String(username).replace(/\s+/g, ' ').trim();
    const user = await adminAuth.createUser({ email, password, displayName: cleanName, emailVerified: true });
    const batch = adminDb.batch();
    batch.set(adminDb.doc(`profiles/${user.uid}`), { username: cleanName, usernameLower: cleanName.toLowerCase(), gender, createdAt: FieldValue.serverTimestamp() });
    batch.set(adminDb.doc(`users/${user.uid}`), { email, activeRoutineId: null, createdAt: FieldValue.serverTimestamp() });
    batch.delete(ref);
    await batch.commit();

    return res.status(200).json({ token: await adminAuth.createCustomToken(user.uid) });
  } catch (error) {
    if (error?.code === 'auth/email-already-exists') return res.status(409).json({ error: 'email-in-use' });
    console.error('[register]', error);
    return res.status(500).json({ error: 'internal' });
  }
}
```

### 4. Cambios en el frontend
- `authService.js`: reemplazar `registerWithEmail` por dos funciones:
  ```js
  export const requestSignupCode = (email) => postJson('/api/auth/request-code', { email: sanitizeEmail(email) });
  export const registerWithCode = async ({ email, code, password, username, gender }) => {
    const { token } = await postJson('/api/auth/register', { email: sanitizeEmail(email), code, password, username, gender });
    await signInWithCustomToken(auth, token); // El perfil ya lo creó el servidor
  };
  ```
  (`postJson` = `fetch` con `try/catch`, `res.ok` y mapeo de `error` a mensajes de `utils/errors.js`.)
- `LoginScreen.jsx`, modo *Crear perfil* en 2 pasos: **(1)** correo → "Enviar código" (spinner: "Enviando código a tu correo…"); **(2)** código + usuario + contraseña + sexo → "Crear perfil" (spinner: "Verificando código y creando tu cuenta…"), con botón "Reenviar código" deshabilitado 60 s.

### 5. Reglas de Firestore
```
// Solo el Admin SDK (servidor) toca esta colección; el Admin SDK ignora las reglas.
match /emailVerifications/{id} { allow read, write: if false; }
```
Y para que nadie salte el flujo creando cuentas directamente con el SDK del cliente, exigir correo verificado al crear el perfil (las cuentas de Google ya vienen verificadas):
```
match /profiles/{uid} {
  allow create: if isOwner(uid) && request.auth.token.email_verified == true && ...;
}
```

## Alternativa sin backend (más simple, también $0)
Si un **enlace** en lugar de un código alcanza: crear la cuenta con `createUserWithEmailAndPassword`, llamar `sendEmailVerification(user)`, mostrar una pantalla "Revisa tu correo" hasta que `user.reload()` devuelva `emailVerified === true`, y aplicar la misma regla `email_verified` en Firestore. Contra: la cuenta de Auth existe antes de verificarse (sin perfil ni acceso a datos).

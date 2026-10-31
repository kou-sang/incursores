import { AlertTriangle, CheckCircle2, KeyRound, Mail, Moon, Palette, RotateCcw, Sun, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { version as APP_VERSION } from '../../../package.json';
import { ColorPicker } from '../../components/ColorPicker';
import { FieldLabel, InlineSpinner, SectionCard, SegmentedControl } from '../../components/ui';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { colorsKey, contrastRatio, CUSTOM_COLOR_FIELDS, markLocalColorsWrite, sanitizeRecentColors, useTheme } from '../../context/ThemeContext';
import { changeEmail, changePassword, hasPasswordProvider, updateDisplayName } from '../../services/authService';
import { savePreferences, updateProfileData } from '../../services/userService';
import { playClick } from '../../utils/audio';
import { logError, toUserMessage, ValidationError } from '../../utils/errors';

const MIN_TEXT_CONTRAST = 4.5; // WCAG AA para texto normal

// Estado de envío + errores por formulario (cada sección es independiente).
const useFormAction = () => {
  const { notify } = useFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = async (context, action, successMessage) => {
    playClick();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await action();
      if (successMessage) notify(typeof successMessage === 'function' ? successMessage(result) : successMessage, 'success');
      return true;
    } catch (actionError) {
      if (actionError?.code === 'auth/popup-closed-by-user' || actionError?.code === 'auth/cancelled-popup-request') return false;
      logError(context, actionError);
      setError(toUserMessage(actionError));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  return { isSubmitting, error, submit };
};

const FormError = ({ message }) => (message ? <p role="alert" className="text-sm font-semibold text-accent">{message}</p> : null);

const ProfileDataSection = () => {
  const { user } = useAppData();
  const { isSubmitting, error, submit } = useFormAction();
  const [form, setForm] = useState({ username: user.username, gender: user.gender });
  const isDirty = form.username !== user.username || form.gender !== user.gender;

  const handleSubmit = (event) => {
    event.preventDefault();
    submit('profile:update', async () => {
      await updateProfileData(user.id, form);
      // displayName de Auth es secundario (el perfil público es la fuente de verdad): un fallo no revierte.
      updateDisplayName(form.username.trim()).catch((nameError) => logError('profile:display-name', nameError));
    }, 'Perfil actualizado');
  };

  return (
    <SectionCard title={<span className="flex items-center gap-2"><UserRound size={18} aria-hidden /> Datos del perfil</span>}
      subtitle="Tu nombre es visible para tus grupos y en el ranking.">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel htmlFor="profile-username">Nombre de usuario</FieldLabel>
          <input id="profile-username" className="input" maxLength={24} autoComplete="nickname" value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </div>
        <div>
          <FieldLabel htmlFor="profile-gender">Sexo (define el mapa corporal)</FieldLabel>
          <select id="profile-gender" className="input" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <FormError message={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? <><InlineSpinner /> Guardando perfil…</> : 'Guardar cambios'}
        </button>
      </form>
    </SectionCard>
  );
};

const EmailSection = () => {
  const { user } = useAppData();
  const { isSubmitting, error, submit } = useFormAction();
  const [form, setForm] = useState({ newEmail: '', currentPassword: '' });
  const [pendingEmail, setPendingEmail] = useState('');
  const usesPassword = hasPasswordProvider();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await submit('profile:email', async () => {
      const email = await changeEmail(form);
      setPendingEmail(email);
    });
    if (ok) setForm({ newEmail: '', currentPassword: '' });
  };

  return (
    <SectionCard title={<span className="flex items-center gap-2"><Mail size={18} aria-hidden /> Correo</span>}
      subtitle={`Actual: ${user.email ?? '—'}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel htmlFor="profile-new-email">Nuevo correo</FieldLabel>
          <input id="profile-new-email" type="email" inputMode="email" autoComplete="email" className="input" required
            value={form.newEmail} onChange={(event) => setForm({ ...form, newEmail: event.target.value })} />
        </div>
        {usesPassword && (
          <div>
            <FieldLabel htmlFor="profile-email-password">Contraseña actual</FieldLabel>
            <input id="profile-email-password" type="password" autoComplete="current-password" className="input" required
              value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} />
          </div>
        )}
        {!usesPassword && <p className="text-xs text-muted">Se abrirá Google para confirmar que eres tú.</p>}
        <FormError message={error} />
        {pendingEmail && (
          <p role="status" className="badge-good rounded-xl p-3 text-sm font-semibold">
            Te enviamos un enlace a {pendingEmail}. El cambio se aplica cuando lo confirmes (revisa spam).
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !form.newEmail}>
          {isSubmitting ? <><InlineSpinner /> Enviando verificación…</> : 'Cambiar correo'}
        </button>
      </form>
    </SectionCard>
  );
};

const PasswordSection = () => {
  const { isSubmitting, error, submit } = useFormAction();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const usesPassword = hasPasswordProvider();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await submit('profile:password', async () => {
      if (form.newPassword !== form.confirmPassword) throw new ValidationError('Las contraseñas nuevas no coinciden.');
      return changePassword(form);
    }, (result) => (result === 'linked' ? 'Contraseña creada: ya puedes ingresar también con correo.' : 'Contraseña actualizada'));
    if (ok) setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <SectionCard title={<span className="flex items-center gap-2"><KeyRound size={18} aria-hidden /> {usesPassword ? 'Cambiar contraseña' : 'Crear contraseña'}</span>}
      subtitle={usesPassword ? 'Mínimo 6 caracteres.' : 'Tu cuenta usa Google. Puedes agregar una contraseña para ingresar también con correo.'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Campo oculto de usuario: ayuda a los gestores de contraseñas a asociar la credencial correcta. */}
        <input type="email" autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden readOnly value="" />
        {usesPassword && (
          <div>
            <FieldLabel htmlFor="profile-current-password">Contraseña actual</FieldLabel>
            <input id="profile-current-password" type="password" autoComplete="current-password" className="input" required
              value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="profile-new-password">Nueva contraseña</FieldLabel>
            <input id="profile-new-password" type="password" autoComplete="new-password" minLength={6} className="input" required
              value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} />
          </div>
          <div>
            <FieldLabel htmlFor="profile-confirm-password">Repetir contraseña</FieldLabel>
            <input id="profile-confirm-password" type="password" autoComplete="new-password" minLength={6} className="input" required
              aria-invalid={Boolean(form.confirmPassword) && form.confirmPassword !== form.newPassword}
              value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
          </div>
        </div>
        <FormError message={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !form.newPassword}>
          {isSubmitting ? <><InlineSpinner /> Actualizando contraseña…</> : usesPassword ? 'Cambiar contraseña' : 'Crear contraseña'}
        </button>
      </form>
    </SectionCard>
  );
};

const AUTOSAVE_DELAY_MS = 1200;

/*
 * Autoguardado de colores y recientes en la cuenta (antes había que tocar "Guardar" y, si no, al recargar
 * los colores de la cuenta pisaban los últimos elegidos). Debounce para no escribir en cada arrastre del selector;
 * si se sale de Perfil con cambios pendientes, se guardan igual.
 */
const useColorAutosave = () => {
  const { user } = useAppData();
  const { customColors, recentColors } = useTheme();
  const [status, setStatus] = useState('saved'); // 'saved' | 'pending' | 'error'
  const pendingSaveRef = useRef(null);

  const localKey = JSON.stringify({ colors: colorsKey(customColors), recent: sanitizeRecentColors(recentColors) });
  const remoteKey = JSON.stringify({ colors: colorsKey(user.preferences?.colors), recent: sanitizeRecentColors(user.preferences?.recentColors) });
  const isSynced = localKey === remoteKey;

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (isSynced) {
      pendingSaveRef.current = null;
      setStatus('saved');
      return undefined;
    }
    const save = async () => {
      pendingSaveRef.current = null;
      const { colors, recent } = JSON.parse(localKey);
      try {
        markLocalColorsWrite(colors);
        await savePreferences(userRef.current.id, { ...userRef.current.preferences, colors: JSON.parse(colors), recentColors: recent });
        setStatus('saved');
      } catch (saveError) {
        logError('profile:colors-autosave', saveError);
        setStatus('error');
      }
    };
    pendingSaveRef.current = save;
    setStatus('pending');
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localKey, isSynced]);

  // Al salir de Perfil: guarda lo pendiente en vez de perderlo (se lee el ref al desmontar a propósito).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => pendingSaveRef.current?.(), []);

  return status;
};

const AutosaveStatus = ({ status }) => {
  if (status === 'pending') return <span className="flex items-center gap-1.5 text-xs font-semibold text-muted"><InlineSpinner /> Guardando en tu cuenta…</span>;
  if (status === 'error') return <span className="flex items-center gap-1.5 text-xs font-semibold text-accent"><AlertTriangle size={14} aria-hidden /> No se pudo guardar; se reintentará con el próximo cambio.</span>;
  return <span className="flex items-center gap-1.5 text-xs font-semibold text-muted"><CheckCircle2 size={14} aria-hidden /> Guardado en tu cuenta</span>;
};

const AppearanceSection = () => {
  const { theme, toggleTheme, customColors, setCustomColor, resetCustomColors, replaceCustomColors, recentColors, rememberColor } = useTheme();
  const saveStatus = useColorAutosave();
  const [editMode, setEditMode] = useState(theme);
  const modeColors = customColors[editMode] ?? {};
  const resolved = Object.fromEntries(CUSTOM_COLOR_FIELDS.map((field) => [field.key, modeColors[field.key] ?? field.defaults[editMode]]));

  // Avisos de legibilidad: el usuario puede elegir cualquier color, pero se le advierte si el texto no se lee.
  const contrastChecks = [
    { label: 'Texto sobre fondo', ratio: contrastRatio(resolved.text, resolved.bg) },
    { label: 'Texto sobre tarjetas', ratio: contrastRatio(resolved.text, resolved.surface) },
    { label: 'Texto secundario sobre tarjetas', ratio: contrastRatio(resolved['text-2'], resolved.surface) },
  ];
  const failingChecks = contrastChecks.filter(({ ratio }) => ratio !== null && ratio < MIN_TEXT_CONTRAST);

  const resetField = (key) => {
    playClick();
    const next = { ...customColors, [editMode]: { ...modeColors } };
    delete next[editMode][key];
    replaceCustomColors(next);
  };

  return (
    <SectionCard title={<span className="flex items-center gap-2"><Palette size={18} aria-hidden /> Apariencia</span>}
      subtitle="Los cambios se ven al instante y se guardan solos en tu cuenta (todos tus dispositivos)."
      actions={
        <button type="button" className="btn btn-ghost" onClick={() => { playClick(); toggleTheme(); setEditMode(theme === 'dark' ? 'light' : 'dark'); }}>
          {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />} Modo {theme === 'dark' ? 'claro' : 'oscuro'}
        </button>
      }>
      <SegmentedControl label="Modo a personalizar" value={editMode} onChange={setEditMode}
        options={[{ value: 'light', label: 'Modo claro' }, { value: 'dark', label: 'Modo oscuro' }]} />
      {editMode !== theme && (
        <p className="mt-2 text-xs text-muted">Estás editando el modo {editMode === 'dark' ? 'oscuro' : 'claro'}; cámbiate a ese modo para previsualizarlo.</p>
      )}

      <div className="mt-3 divide-y divide-[var(--border)]">
        {CUSTOM_COLOR_FIELDS.map((field) => (
          <ColorPicker
            key={`${editMode}-${field.key}`}
            label={field.label}
            value={resolved[field.key]}
            isCustom={Boolean(modeColors[field.key])}
            recentColors={recentColors}
            onChange={(hex) => setCustomColor(editMode, field.key, hex)}
            onCommit={rememberColor}
            onReset={() => resetField(field.key)}
          />
        ))}
      </div>

      {failingChecks.length > 0 && (
        <div role="status" className="mt-3 flex gap-2 rounded-xl bg-[var(--accent-soft)] p-3 text-sm">
          <AlertTriangle size={18} className="shrink-0 text-accent" aria-hidden />
          <p>
            Contraste bajo (mínimo recomendado {MIN_TEXT_CONTRAST}:1):{' '}
            {failingChecks.map(({ label, ratio }) => `${label} ${ratio}:1`).join(', ')}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <AutosaveStatus status={saveStatus} />
        <button type="button" className="btn btn-ghost" onClick={() => { playClick(); resetCustomColors(editMode); }}>
          <RotateCcw size={16} aria-hidden /> Restablecer modo {editMode === 'dark' ? 'oscuro' : 'claro'}
        </button>
      </div>
    </SectionCard>
  );
};

// Versión vigente (fuente única: package.json, ver CHANGELOG.md).
const AppVersion = () => (
  <p className="text-center text-xs font-semibold text-muted lg:col-span-2" data-testid="app-version">
    Colossus v{APP_VERSION}
  </p>
);

/*
 * Columnas con minmax(0, 1fr) y min-w-0: una columna `auto` crece hasta el min-content de sus hijos
 * (p. ej. los botones sin salto de línea del selector de modo) y estiraba la página más que la pantalla en el celular.
 */
export const ProfileTab = () => (
  <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
    <div className="min-w-0 space-y-4 md:space-y-6">
      <ProfileDataSection />
      <EmailSection />
      <PasswordSection />
    </div>
    <div className="min-w-0">
      <AppearanceSection />
    </div>
    <AppVersion />
  </div>
);

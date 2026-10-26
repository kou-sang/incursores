import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, doc, getDoc, deleteDoc, updateDoc, setDoc 
} from 'firebase/firestore';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Trophy, Activity, Dumbbell, Sun, Moon, Plus, Home, Calendar, Edit2, Copy, Trash2, Share2, Check, X, Filter, Sparkles, Mail, Lock, User, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuración de Firebase ---
const getEnv = (key) => {
  try { return import.meta.env[key]; } catch (e) { return null; }
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || "AIzaSyBjTwVy9P7kHc4jlQcfdiI8k9XGYcnNxMI",
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "incursores.firebaseapp.com",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || "incursores",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "incursores.firebasestorage.app",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "977966837929",
  appId: getEnv('VITE_FIREBASE_APP_ID') || "1:977966837929:web:ad9f2ea6702a39d37f39b8",
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || "G-Q9GJ1QTRT6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Días y Mapeo de Categorías Musculares ---
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const CATEGORY_MAP = {
  'PRESS BANCA': { cat: 'PECHO', muscle: 'pecho' },
  'PRESS INCLINADO': { cat: 'PECHO', muscle: 'pecho' },
  'MARIPOSA': { cat: 'PECHO', muscle: 'pecho' },
  'PRESS MAQUINA': { cat: 'PECHO', muscle: 'pecho' },
  'FLEXIONES': { cat: 'PECHO', muscle: 'pecho' },
  'PULLOVER': { cat: 'PECHO', muscle: 'pecho' },
  'PRESS HOMBRO': { cat: 'HOMBRO', muscle: 'hombros' },
  'PRESS HOMBRO BARRAS': { cat: 'HOMBRO', muscle: 'hombros' },
  'VUELOS LATERALES': { cat: 'HOMBRO', muscle: 'hombros' },
  'VUELOS ANTERIORES': { cat: 'HOMBRO', muscle: 'hombros' },
  'VUELOS POSTERIORES': { cat: 'HOMBRO', muscle: 'hombros' },
  'REMO MENTON': { cat: 'HOMBRO', muscle: 'hombros' },
  'FACE PULL': { cat: 'HOMBRO', muscle: 'hombros' },
  'PESO MUERTO': { cat: 'ESPALDA', muscle: 'espalda' },
  'JALON AL PECHO': { cat: 'ESPALDA', muscle: 'espalda' },
  'REMO CON BARRA': { cat: 'ESPALDA', muscle: 'espalda' },
  'REMO BAJO': { cat: 'ESPALDA', muscle: 'espalda' },
  'REMO T': { cat: 'ESPALDA', muscle: 'espalda' },
  'REMO UNILATERAL': { cat: 'ESPALDA', muscle: 'espalda' },
  'DOMINADAS': { cat: 'ESPALDA', muscle: 'espalda' },
  'CURL CON BARRA': { cat: 'BICEPS', muscle: 'biceps' },
  'CURL POLEA': { cat: 'BICEPS', muscle: 'biceps' },
  'SCOTT': { cat: 'BICEPS', muscle: 'biceps' },
  'BICEP CONCENTRADO': { cat: 'BICEPS', muscle: 'biceps' },
  'ALT CON MANCUERNA': { cat: 'BICEPS', muscle: 'biceps' },
  'BAYESIANA': { cat: 'BICEPS', muscle: 'biceps' },
  'CURL BICEPS INCLINADO': { cat: 'BICEPS', muscle: 'biceps' },
  'EXT POLEA ALTA': { cat: 'TRICEPS', muscle: 'triceps' },
  'FONDOS': { cat: 'TRICEPS', muscle: 'triceps' },
  'PRESS FRANCES': { cat: 'TRICEPS', muscle: 'triceps' },
  'EXT CON MANCUERNA': { cat: 'TRICEPS', muscle: 'triceps' },
  'EXT COPA': { cat: 'TRICEPS', muscle: 'triceps' },
  'TRASNUCA': { cat: 'TRICEPS', muscle: 'triceps' },
  'SENTADILLA': { cat: 'PIERNAS', muscle: 'cuadriceps' },
  'HACK': { cat: 'PIERNAS', muscle: 'cuadriceps' },
  'CUADRICEPS': { cat: 'PIERNAS', muscle: 'cuadriceps' },
  'PRENSA 45°': { cat: 'PIERNAS', muscle: 'cuadriceps' },
  'ESTOCADAS': { cat: 'PIERNAS', muscle: 'cuadriceps' },
  'ISQUIOTIBIALES': { cat: 'PIERNAS', muscle: 'isquiotibiales' },
  'PATADA DE GLUTEO': { cat: 'PIERNAS', muscle: 'gluteos' },
  'HIP THRUST': { cat: 'PIERNAS', muscle: 'gluteos' },
  'MULTICADERA': { cat: 'PIERNAS', muscle: 'gluteos' },
  'SOLEO': { cat: 'PIERNAS', muscle: 'gemelos' },
  'ABDUCTOR': { cat: 'PIERNAS', muscle: 'aductores' },
  'ADUCTOR': { cat: 'PIERNAS', muscle: 'aductores' }
};

const getCategory = (ej) => CATEGORY_MAP[ej?.toUpperCase()]?.cat || 'OTROS';
const getMuscle = (ej) => CATEGORY_MAP[ej?.toUpperCase()]?.muscle || 'otros';
const ejerciciosListaInicial = Object.keys(CATEGORY_MAP);

// --- Sonidos ---
const playClickSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const playSuccessSound = (isNewPr = false) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = isNewPr ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
    });
  } catch (e) {}
};

// --- Colores Musculares (Gradiente Dinámico según Días) ---
const getMuscleColorByDays = (lastTrainedDate) => {
  if (!lastTrainedDate) return '#ef4444'; // Rojo si nunca se entrenó o hace mucho
  const diffDays = (new Date() - new Date(lastTrainedDate)) / (1000 * 3600 * 24);
  
  if (diffDays <= 9) {
    // 0 días = Verde brillante (120), 9 días = Verde amarillento (60)
    const hue = 120 - (diffDays / 9) * 60;
    return `hsl(${hue}, 85%, 45%)`;
  } else if (diffDays <= 18) {
    // 9 días = Amarillo (60), 18 días = Naranja (30)
    const hue = 60 - ((diffDays - 9) / 9) * 30;
    return `hsl(${hue}, 90%, 50%)`;
  } else if (diffDays <= 27) {
    // 18 días = Naranja (30), 27 días = Rojo (0)
    const hue = 30 - ((diffDays - 18) / 9) * 30;
    return `hsl(${hue}, 90%, 50%)`;
  }
  return '#ef4444'; // >27 días = Rojo
};

// VECTORES ANATÓMICOS SUAVIZADOS
const ANATOMY_PATHS = {
  frente: [
    { id: 'pecho', label: 'Pecho', d: 'M 75 55 C 85 55, 95 62, 100 62 C 105 62, 115 55, 125 55 C 130 65, 125 75, 100 75 C 75 75, 70 65, 75 55 Z' },
    { id: 'hombros', label: 'Hombros', d: 'M 55 50 C 65 45, 75 50, 75 55 C 70 65, 60 70, 52 65 C 50 60, 50 55, 55 50 Z M 145 50 C 135 45, 125 50, 125 55 C 130 65, 140 70, 148 65 C 150 60, 150 55, 145 50 Z' },
    { id: 'biceps', label: 'Bíceps', d: 'M 52 65 C 60 70, 65 80, 65 90 C 65 100, 55 105, 48 95 C 45 85, 48 70, 52 65 Z M 148 65 C 140 70, 135 80, 135 90 C 135 100, 145 105, 152 95 C 155 85, 152 70, 148 65 Z' },
    { id: 'abdominales', label: 'Abdominales', d: 'M 78 78 C 100 82, 100 82, 122 78 C 120 100, 115 135, 100 140 C 85 135, 80 100, 78 78 Z' },
    { id: 'cuadriceps', label: 'Cuádriceps', d: 'M 72 145 C 95 145, 95 160, 95 185 C 95 200, 80 205, 75 185 C 70 165, 68 150, 72 145 Z M 128 145 C 105 145, 105 160, 105 185 C 105 200, 120 205, 125 185 C 130 165, 132 150, 128 145 Z' },
    { id: 'aductores', label: 'Aductores', d: 'M 95 145 C 100 150, 98 175, 95 185 C 92 175, 90 155, 95 145 Z M 105 145 C 100 150, 102 175, 105 185 C 108 175, 110 155, 105 145 Z' }
  ],
  espalda: [
    { id: 'espalda', label: 'Espalda (Dorsales)', d: 'M 75 55 C 100 65, 100 65, 125 55 C 130 80, 115 110, 100 120 C 85 110, 70 80, 75 55 Z' },
    { id: 'triceps', label: 'Tríceps', d: 'M 52 65 C 60 70, 68 85, 65 100 C 55 105, 45 90, 48 75 C 48 70, 50 67, 52 65 Z M 148 65 C 140 70, 132 85, 135 100 C 145 105, 155 90, 152 75 C 152 70, 150 67, 148 65 Z' },
    { id: 'gluteos', label: 'Glúteos', d: 'M 75 125 C 100 120, 100 120, 125 125 C 130 145, 115 155, 100 155 C 85 155, 70 145, 75 125 Z' },
    { id: 'isquiotibiales', label: 'Isquiotibiales', d: 'M 75 155 C 95 155, 95 170, 95 195 C 95 210, 80 205, 75 195 C 70 180, 70 165, 75 155 Z M 125 155 C 105 155, 105 170, 105 195 C 105 210, 120 205, 125 195 C 130 180, 130 165, 125 155 Z' },
    { id: 'gemelos', label: 'Gemelos', d: 'M 75 200 C 95 200, 95 215, 90 235 C 85 245, 75 245, 70 235 C 65 220, 65 210, 75 200 Z M 125 200 C 105 200, 105 215, 110 235 C 115 245, 125 245, 130 235 C 135 220, 135 210, 125 200 Z' }
  ]
};

// ==============================================================================
// TRADUCTOR DE ERRORES FIREBASE
// ==============================================================================
const translateFirebaseError = (error) => {
  if (!error || !error.code) return "Ocurrió un error inesperado.";
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo electrónico o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está asociado a otra cuenta.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico es inválido.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
    case 'auth/unauthorized-domain':
      return 'Dominio no autorizado. Configura tu URL en la consola de Firebase.';
    case 'auth/popup-closed-by-user':
      return 'Se canceló el inicio de sesión con Google.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google.';
    case 'auth/network-request-failed':
      return 'Fallo de red. Verifica tu conexión a internet.';
    default:
      return `Error: ${error.message}`;
  }
};

// ==============================================================================
// COMPONENTES EXTRAÍDOS
// ==============================================================================

const LoginScreen = ({ t }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [form, setForm] = useState({ username: '', email: '', password: '', gender: 'masculino' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSwitchMode = (targetMode) => {
    playClickSound();
    setError(''); setSuccessMsg(''); setMode(targetMode);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    playClickSound();
    setError('');

    if (!/^[a-zA-Z]+$/.test(form.username)) return setError("El usuario solo debe contener letras (sin espacios ni números).");
    if (form.password.length < 6) return setError("Mínimo 6 caracteres en la contraseña.");

    setLoadingMessage("Creando perfil y validando correo...");
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      
      // 2. Update Auth Profile
      await updateProfile(user, { displayName: form.username });

      // 3. Save extra user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: form.username,
        email: form.email,
        gender: form.gender,
        activeRoutineId: null
      });

      // User will be automatically signed in, triggering the onAuthStateChanged in App.
    } catch (err) {
      setError(translateFirebaseError(err));
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    playClickSound();
    setError('');
    setLoadingMessage("Autenticando...");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      // Success will trigger onAuthStateChanged in App
    } catch (err) {
      setError(translateFirebaseError(err));
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    playClickSound();
    setError('');
    
    if (!form.email) return setError("Ingresa tu correo electrónico.");
    setLoadingMessage("Enviando enlace...");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, form.email);
      setSuccessMsg("¡Enlace enviado! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.");
      setForm({ ...form, password: '' });
    } catch (err) {
      setError(translateFirebaseError(err));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    playClickSound();
    setError('');
    setLoadingMessage("Conectando con Google...");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verificar si es la primera vez que entra para crearle su perfil en la app
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          gender: 'masculino', // Valor por defecto, analíticas lo pueden usar
          activeRoutineId: null
        });
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(translateFirebaseError(err));
      }
    }
    setLoading(false);
  };

  if (loading) return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${t.bg} ${t.text}`}>
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${t.accentBorder}`}></div>
      <p className={`font-bold animate-pulse ${t.textMuted}`}>{loadingMessage}</p>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${t.bg} ${t.text}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${t.card}`}>
        <div className="flex justify-center mb-4"><Dumbbell className={t.accentText} size={48} /></div>
        <h2 className={`text-2xl font-black text-center mb-1 ${t.text}`}>Incursores PR</h2>
        <p className={`text-center text-xs mb-6 ${t.textMuted}`}>Registra tus rutinas y compara tus marcas</p>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm text-center font-medium">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded-xl text-sm text-center font-medium">{successMsg}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Contraseña</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
                <div className="text-right"><button type="button" onClick={() => handleSwitchMode('forgot')} className={`text-xs font-bold ${t.accentText} hover:underline`}>¿Olvidaste tu contraseña?</button></div>
            <button type="submit" className={`w-full p-3 mt-2 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>Ingresar</button>
            
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-500/20"></div>
              <span className={`flex-shrink-0 mx-4 text-xs font-bold ${t.textMuted}`}>O continuar con</span>
              <div className="flex-grow border-t border-slate-500/20"></div>
            </div>
            <button type="button" onClick={handleGoogleLogin} className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${t.card}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>

            <div className="mt-6 text-center border-t pt-4 border-slate-500/20"><button type="button" onClick={() => handleSwitchMode('register')} className={`text-sm font-bold ${t.accentText} hover:underline`}>¿Nuevo aquí? Crea tu perfil</button></div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Usuario (Solo letras)</label><input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Contraseña</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Sexo Biológico</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`}>
                <option value="masculino">Masculino</option><option value="femenino">Femenino</option>
              </select>
            </div>
            <button type="submit" className={`w-full p-3 mt-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>Crear Perfil</button>
            
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-500/20"></div>
              <span className={`flex-shrink-0 mx-4 text-xs font-bold ${t.textMuted}`}>O crear con</span>
              <div className="flex-grow border-t border-slate-500/20"></div>
            </div>
            <button type="button" onClick={handleGoogleLogin} className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${t.card}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>

            <div className="text-center mt-4"><button type="button" onClick={() => handleSwitchMode('login')} className={`text-sm font-bold ${t.textMuted} hover:underline flex items-center justify-center gap-1 mx-auto`}><ArrowLeft size={16}/> Volver</button></div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className={`text-sm ${t.textMuted} text-center`}>Te enviaremos un correo con un enlace seguro para restablecer tu contraseña.</p>
            <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} /></div>
            <button type="submit" className={`w-full p-3 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-95 ${t.accentBg}`}>Enviar enlace de recuperación</button>
            <div className="text-center mt-4"><button type="button" onClick={() => handleSwitchMode('login')} className={`text-sm font-bold ${t.textMuted} hover:underline flex items-center justify-center gap-1 mx-auto`}><ArrowLeft size={16}/> Volver al Inicio de Sesión</button></div>
          </form>
        )}
      </motion.div>
    </div>
  );
};


const InicioTab = ({ currentUser, routines, prs, t, theme, onTriggerAnimation }) => {
  const [completingIdx, setCompletingIdx] = useState(null);
  const [kgInput, setKgInput] = useState('');

  const todayNum = new Date().getDay();
  const mappedDay = todayNum === 0 ? 'domingo' : DAYS[todayNum - 1];
  const activeRoutine = routines.find(r => r.id === currentUser?.activeRoutineId);
  const todayISO = new Date().toISOString().split('T')[0];
  const userTodayPrs = prs.filter(pr => pr.nombre === currentUser?.username && pr.fecha?.startsWith(todayISO));

  const checkAndSubmitExercise = async (ejercicio) => {
    playClickSound();
    const pesoNum = kgInput ? parseFloat(kgInput) : null;
    let isNewPr = false;

    if (pesoNum) {
      const prevPrs = prs.filter(p => p.nombre === currentUser.username && p.ejercicio === ejercicio && p.peso !== null);
      const maxPrev = prevPrs.length > 0 ? Math.max(...prevPrs.map(p => p.peso)) : 0;
      if (pesoNum > maxPrev) isNewPr = true;
    }

    await addDoc(collection(db, 'prs'), {
      nombre: currentUser.username, ejercicio: ejercicio, peso: pesoNum, fecha: new Date().toISOString()
    });

    playSuccessSound(isNewPr);
    onTriggerAnimation(isNewPr ? 'pr' : 'random');
    setCompletingIdx(null);
    setKgInput('');
  };

  if (!activeRoutine) return (
    <div className={`p-8 text-center rounded-2xl border ${t.card} ${t.textMuted}`}>
      <h3 className="text-xl font-bold mb-2">Sin rutina activa</h3>
      <p>Ve a la pestaña Rutinas para seleccionar o crear una.</p>
    </div>
  );

  const todayExercises = activeRoutine.exercises[mappedDay] || [];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${t.card}`}>
        <h2 className="text-2xl font-bold mb-1">¡A entrenar, {currentUser.username}!</h2>
        <p className={`capitalize ${t.textMuted}`}>Hoy es {mappedDay} • {activeRoutine.name}</p>
      </div>

      {todayExercises.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${t.card} ${t.textMuted}`}>Día de descanso programado. ¡Disfruta!</div>
      ) : (
        <div className="grid gap-4">
          {todayExercises.map((ex, idx) => {
            const isDone = userTodayPrs.some(pr => pr.ejercicio === ex.ejercicio);
            return (
              <motion.div key={idx} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: idx*0.1}} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${t.card} ${isDone ? 'opacity-50' : ''}`}>
                <div>
                  <h3 className="font-bold text-lg">{ex.ejercicio}</h3>
                  <p className={`text-sm ${t.textMuted}`}>{ex.series} series {ex.reps && `x ${ex.reps} reps`}</p>
                </div>
                
                {isDone ? (
                  <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg self-start md:self-auto"><Check size={20}/> Hecho</div>
                ) : completingIdx === idx ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <input type="number" step="0.5" placeholder="Kg (Opcional)" value={kgInput} onChange={e => setKgInput(e.target.value)} className={`p-2 rounded-lg border w-full sm:w-32 ${t.input}`} />
                    <div className="flex gap-2">
                      <button onClick={() => checkAndSubmitExercise(ex.ejercicio)} className={`flex-1 px-4 py-2 rounded-lg font-bold text-white transition-all hover:brightness-110 active:scale-95 ${t.accentBg}`}>Guardar</button>
                      <button onClick={() => { playClickSound(); setCompletingIdx(null); }} className={`px-3 py-2 rounded-lg border hover:brightness-90 transition-all ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-slate-100'}`}><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { playClickSound(); setCompletingIdx(idx); }} className={`px-6 py-2 rounded-lg font-bold border transition-all hover:brightness-110 active:scale-95 self-start md:self-auto ${t.accentBorder} ${t.accentText} ${t.accentLightBg}`}>Completar</button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const RutinasTab = ({ currentUser, routines, ejerciciosLista, setEjerciciosLista, setCurrentUser, t, theme, setLoading, setLoadingMessage }) => {
  const [editingRoutine, setEditingRoutine] = useState(null);
  const myRoutines = routines.filter(r => r.authorId === currentUser?.id);

  const openCreate = () => {
    playClickSound();
    setEditingRoutine({ name: '', exercises: DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}) });
  };
  
  const saveRoutine = async () => {
    playClickSound();
    if (!editingRoutine.name.trim()) return alert("El nombre es requerido");
    setLoadingMessage("Guardando rutina...");
    setLoading(true);
    try {
      const payload = { ...editingRoutine, authorId: currentUser.id, authorName: currentUser.username };
      if (editingRoutine.id) await updateDoc(doc(db, 'routines', editingRoutine.id), payload);
      else await addDoc(collection(db, 'routines'), payload);
      setEditingRoutine(null);
    } catch(e){}
    setLoading(false);
  };

  const deleteRoutine = async (id) => {
    playClickSound();
    if (window.confirm("¿Eliminar esta rutina para siempre?")) {
      try {
        await deleteDoc(doc(db, 'routines', id));
        if (currentUser.activeRoutineId === id) {
          await setActive(null);
        }
      } catch (err) { console.error("Error borrando:", err); }
    }
  };

  const copyRoutine = async (rutina) => {
    playClickSound();
    setLoadingMessage("Duplicando rutina...");
    setLoading(true);
    try {
      const { id, ...dataCopy } = rutina;
      await addDoc(collection(db, 'routines'), { ...dataCopy, name: `${rutina.name} (Copia)` });
    } catch (e) {}
    setLoading(false);
  };

  const setActive = async (id) => {
    playClickSound();
    await updateDoc(doc(db, 'users', currentUser.id), { activeRoutineId: id });
    setCurrentUser(prev => ({ ...prev, activeRoutineId: id }));
  };

  if (editingRoutine) return (
    <div className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{editingRoutine.id ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
        <button onClick={() => { playClickSound(); setEditingRoutine(null); }} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${t.textMuted}`}><X/></button>
      </div>
      <input type="text" placeholder="Nombre de la rutina" value={editingRoutine.name} onChange={e => setEditingRoutine({...editingRoutine, name: e.target.value})} className={`w-full p-3 mb-6 rounded-xl border text-lg font-bold ${t.input}`} />
      <div className="space-y-6">
        {DAYS.map(day => (
          <div key={day} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="font-bold capitalize mb-3 text-lg">{day}</h3>
            {editingRoutine.exercises[day].map((ex, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 mb-3">
                <input type="text" list="lista-ejercicios-rutina" placeholder="Ejercicio" value={ex.ejercicio} 
                  onChange={e => {
                    const newEx = [...editingRoutine.exercises[day]]; newEx[idx].ejercicio = e.target.value.toUpperCase();
                    setEditingRoutine({...editingRoutine, exercises: {...editingRoutine.exercises, [day]: newEx}});
                  }} 
                  onBlur={(e) => {
                    const val = e.target.value.trim().toUpperCase();
                    if (val && !ejerciciosLista.includes(val)) setEjerciciosLista(prev => [...prev, val]);
                  }}
                  className={`flex-1 p-2.5 rounded-lg border ${t.input}`} />
                <input type="number" placeholder="Series" value={ex.series} 
                  onChange={e => {
                    const newEx = [...editingRoutine.exercises[day]]; newEx[idx].series = e.target.value;
                    setEditingRoutine({...editingRoutine, exercises: {...editingRoutine.exercises, [day]: newEx}});
                  }} className={`w-full md:w-24 p-2.5 rounded-lg border ${t.input}`} />
                <input type="text" placeholder="Reps" value={ex.reps} 
                  onChange={e => {
                    const newEx = [...editingRoutine.exercises[day]]; newEx[idx].reps = e.target.value;
                    setEditingRoutine({...editingRoutine, exercises: {...editingRoutine.exercises, [day]: newEx}});
                  }} className={`w-full md:w-32 p-2.5 rounded-lg border ${t.input}`} />
                <button onClick={() => { playClickSound(); const newEx = editingRoutine.exercises[day].filter((_, i) => i !== idx); setEditingRoutine({...editingRoutine, exercises: {...editingRoutine.exercises, [day]: newEx}}); }} className="p-2.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 size={20}/></button>
              </div>
            ))}
            <button onClick={() => { playClickSound(); const newEx = [...editingRoutine.exercises[day], { ejercicio: '', series: '', reps: '' }]; setEditingRoutine({...editingRoutine, exercises: {...editingRoutine.exercises, [day]: newEx}}); }} className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${t.accentBorder} ${t.accentText} hover:bg-opacity-10`}>+ Ejercicio</button>
          </div>
        ))}
      </div>
      <button onClick={saveRoutine} className={`w-full mt-6 p-4 rounded-xl font-bold text-white text-lg transition-all hover:brightness-110 active:scale-95 ${t.accentBg}`}>Guardar Rutina</button>
      <datalist id="lista-ejercicios-rutina">{ejerciciosLista.map(e => <option key={e} value={e}/>)}</datalist>
    </div>
  );

  return (
    <div className="space-y-4">
      <button onClick={openCreate} className={`w-full p-4 rounded-2xl border border-dashed flex justify-center items-center gap-2 font-bold transition-all hover:bg-black/5 active:scale-95 ${theme === 'dark' ? 'border-slate-600 hover:bg-white/5' : 'border-slate-300'}`}><Plus/> Crear Nueva Rutina</button>
      {myRoutines.length === 0 ? <p className={`text-center p-8 ${t.textMuted}`}>No tienes rutinas. Crea la primera.</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {myRoutines.map(r => {
            const isActive = currentUser?.activeRoutineId === r.id;
            return (
              <div key={r.id} className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${t.card} ${isActive ? `ring-2 ring-opacity-100 ring-[#e53935]` : ''}`}>
                {isActive && <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg ${t.accentBg}`}>ACTIVA</div>}
                <h3 className="text-xl font-bold mb-1 pr-16">{r.name}</h3>
                <p className={`text-xs mb-4 ${t.textMuted}`}>Por {r.authorName}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { playClickSound(); setEditingRoutine(r); }} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors`}><Edit2 size={16}/></button>
                  <button onClick={() => copyRoutine(r)} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors`}><Copy size={16}/></button>
                  <button onClick={() => { 
                    playClickSound(); 
                    const url = `${window.location.origin}?shareRoutine=${r.id}`;
                    navigator.clipboard.writeText(url).then(() => alert("¡Link de rutina copiado!\nCompártelo con tus amigos para que la importen.")); 
                  }} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors`}><Share2 size={16}/></button>
                  <button onClick={() => deleteRoutine(r.id)} className={`p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors`}><Trash2 size={16}/></button>
                  {!isActive && <button onClick={() => setActive(r.id)} className={`ml-auto px-4 py-1.5 text-sm font-bold rounded-lg border transition-all hover:brightness-110 active:scale-95 ${t.accentText} ${t.accentBorder}`}>Activar</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const RankingTab = ({ prs, t, theme }) => {
  const [subTab, setSubTab] = useState('ejercicios');
  const usersSet = Array.from(new Set(prs.map(p => p.nombre)));

  const renderTable = () => {
    if (subTab === 'ejercicios') {
      const grouped = {};
      prs.forEach(pr => {
        if (!grouped[pr.ejercicio]) grouped[pr.ejercicio] = {};
        if (pr.peso !== null) {
          const current = grouped[pr.ejercicio][pr.nombre] || 0;
          if (pr.peso > current) grouped[pr.ejercicio][pr.nombre] = pr.peso;
        }
      });
      return Object.keys(grouped).sort().map(ej => {
        const stats = usersSet.map(u => ({ name: u, max: grouped[ej][u] || null })).sort((a,b) => (b.max||0) - (a.max||0));
        return (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={ej} className={`rounded-2xl border mb-6 overflow-hidden ${t.card}`}>
            <div className={`px-4 py-3 bg-black/5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}><h3 className="font-bold">{ej}</h3></div>
            {stats.map((s, i) => (
              <div key={s.name} className={`flex justify-between p-3 px-4 border-b last:border-b-0 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'} ${i===0 && s.max ? t.accentLightBg : ''}`}>
                <div className="flex gap-3 items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0 && s.max ? `${t.accentBg} text-white` : 'bg-black/10'}`}>{i===0 && s.max ? <Trophy size={12}/> : i+1}</span>
                  <span className={`font-bold ${i===0 && s.max ? t.accentText : ''}`}>{s.name}</span>
                </div>
                <span className="font-black opacity-80">{s.max ? `${s.max} kg` : <span className="text-xs font-normal opacity-50">Sin información</span>}</span>
              </div>
            ))}
          </motion.div>
        );
      });
    }

    if (subTab === 'musculos') {
      const muscles = Array.from(new Set(Object.values(CATEGORY_MAP).map(v => v.muscle))).sort();
      return muscles.map(m => {
        const counts = {};
        prs.filter(p => getMuscle(p.ejercicio) === m).forEach(p => counts[p.nombre] = (counts[p.nombre] || 0) + 1);
        const stats = usersSet.map(u => ({ name: u, count: counts[u] || 0 })).sort((a,b) => b.count - a.count);
        return (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={m} className={`rounded-2xl border mb-6 overflow-hidden ${t.card}`}>
            <div className={`px-4 py-3 bg-black/5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}><h3 className="font-bold capitalize">{m}</h3></div>
            {stats.map((s, i) => (
              <div key={s.name} className={`flex justify-between p-3 px-4 border-b last:border-b-0 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'} ${i===0 && s.count>0 ? t.accentLightBg : ''}`}>
                <span className="font-bold">{s.name}</span>
                <span className="opacity-80">{s.count} ejercicios</span>
              </div>
            ))}
          </motion.div>
        );
      });
    }

    if (subTab === 'consistencia') {
      const d8 = new Date(); d8.setDate(d8.getDate() - 8);
      const counts = {};
      prs.filter(p => new Date(p.fecha) >= d8).forEach(p => counts[p.nombre] = (counts[p.nombre] || 0) + 1);
      const stats = usersSet.map(u => ({ name: u, count: counts[u] || 0 })).sort((a,b) => b.count - a.count);
      return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`rounded-2xl border overflow-hidden ${t.card}`}>
          <div className={`px-4 py-3 bg-black/5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}><h3 className="font-bold">Ejercicios últimos 8 días</h3></div>
          {stats.map((s, i) => (
            <div key={s.name} className={`flex justify-between p-3 px-4 border-b last:border-b-0 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'} ${i===0 && s.count>0 ? t.accentLightBg : ''}`}>
              <div className="flex gap-3 items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0 && s.count>0 ? `${t.accentBg} text-white` : 'bg-black/10'}`}>{i===0 && s.count>0 ? <Trophy size={12}/> : i+1}</span>
                <span className="font-bold">{s.name}</span>
              </div>
              <span className="font-black opacity-80">{s.count} <span className="text-xs font-normal">ejercicios</span></span>
            </div>
          ))}
        </motion.div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-black/5 p-1 rounded-xl w-full max-w-md mx-auto">
        {['ejercicios', 'musculos', 'consistencia'].map(tab => (
          <button key={tab} onClick={() => { playClickSound(); setSubTab(tab); }} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg capitalize transition-all active:scale-95 ${subTab === tab ? `${t.accentBg} text-white shadow-md` : 'opacity-60 hover:opacity-100'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div>{renderTable()}</div>
    </div>
  );
};


const AnalyticsTab = ({ prs, currentUser, ejerciciosLista, t, theme }) => {
  const allUsers = Array.from(new Set(prs.map(p => p.nombre))).sort();
  
  // States
  const [selectedUsers, setSelectedUsers] = useState([]); // [] = Todos
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [selectedExercise, setSelectedExercise] = useState('TODOS');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('TODOS');
  const [timeRange, setTimeRange] = useState('TODOS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [clickedMuscle, setClickedMuscle] = useState(null);

  const toggleUser = (u) => {
    playClickSound();
    setSelectedUsers(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]);
  };

  // Base Data Filter
  const filteredPrs = useMemo(() => {
    return prs.filter(p => {
      if (selectedUsers.length > 0 && !selectedUsers.includes(p.nombre)) return false;
      if (selectedCategory !== 'TODOS' && getCategory(p.ejercicio) !== selectedCategory) return false;
      if (selectedExercise !== 'TODOS' && p.ejercicio !== selectedExercise) return false;
      if (selectedMuscleFilter !== 'TODOS' && getMuscle(p.ejercicio) !== selectedMuscleFilter) return false;
      
      const prDate = new Date(p.fecha);
      if (timeRange === '7D') {
        const d7 = new Date(); d7.setDate(d7.getDate() - 7);
        if (prDate < d7) return false;
      } else if (timeRange === '30D') {
        const d30 = new Date(); d30.setDate(d30.getDate() - 30);
        if (prDate < d30) return false;
      } else if (timeRange === '1Y') {
        const d1y = new Date(); d1y.setFullYear(d1y.getFullYear() - 1);
        if (prDate < d1y) return false;
      } else if (timeRange === 'CUSTOM') {
        if (startDate && new Date(startDate) > prDate) return false;
        if (endDate && new Date(endDate) < prDate) return false;
      }
      return true;
    });
  }, [prs, selectedUsers, selectedCategory, selectedExercise, selectedMuscleFilter, timeRange, startDate, endDate]);

  // Heatmap Data (Last trained dates for colors, counts for tooltip)
  const muscleLastTrained = useMemo(() => {
    const dates = {};
    filteredPrs.forEach(p => {
      const m = getMuscle(p.ejercicio);
      if (!dates[m] || new Date(p.fecha) > new Date(dates[m])) dates[m] = p.fecha;
    });
    return dates;
  }, [filteredPrs]);

  const muscleCounts = useMemo(() => {
    const counts = {};
    filteredPrs.forEach(p => {
      const m = getMuscle(p.ejercicio);
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [filteredPrs]);

  // Chart 1: Evolution (Stars)
  const chart1Data = useMemo(() => {
    const datesMap = {};
    const cumulativeMaxes = {};
    
    // Process chronologically to find exact PR moments
    const sortedPrs = [...filteredPrs].sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    
    sortedPrs.forEach(p => {
      const dKey = p.fecha.split('T')[0];
      if (!datesMap[dKey]) datesMap[dKey] = { date: dKey, count: 0, prCount: 0 };
      datesMap[dKey].count += 1; // Count all exercises done this day

      if (p.peso !== null) {
        // Track max by user AND exercise to be accurate
        const userExKey = `${p.nombre}-${p.ejercicio}`;
        const currentMax = cumulativeMaxes[userExKey] || 0;
        if (p.peso > currentMax) {
          datesMap[dKey].prCount += 1;
          cumulativeMaxes[userExKey] = p.peso;
        }
      }
    });
    return Object.values(datesMap).map(d => ({
      ...d, dateFormatted: new Date(d.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
    }));
  }, [filteredPrs]);

  // Chart 2: Histogram
  const chart2Data = useMemo(() => {
    const exerciseMaxes = {};
    filteredPrs.forEach(p => {
      if (p.peso !== null) {
        if (!exerciseMaxes[p.ejercicio] || p.peso > exerciseMaxes[p.ejercicio]) {
          exerciseMaxes[p.ejercicio] = p.peso;
        }
      }
    });
    return Object.keys(exerciseMaxes).map(ex => ({ ejercicio: ex, peso: exerciseMaxes[ex] })).sort((a,b) => b.peso - a.peso);
  }, [filteredPrs]);

  // Chart 4: Muscle specific
  const chart4Data = useMemo(() => {
    if (!clickedMuscle) return [];
    const datesMap = {};
    filteredPrs.filter(p => getMuscle(p.ejercicio) === clickedMuscle).forEach(p => {
      const dKey = p.fecha.split('T')[0];
      if (!datesMap[dKey]) datesMap[dKey] = { date: dKey, count: 0 };
      datesMap[dKey].count += 1;
    });
    return Object.values(datesMap).sort((a,b) => new Date(a.date) - new Date(b.date)).map(d => ({
      ...d, dateFormatted: new Date(d.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
    }));
  }, [filteredPrs, clickedMuscle]);

  const renderStarDot = (props) => {
    const { cx, cy, payload, index } = props;
    const uniqueKey = `star-dot-${index}-${cx}`;
    if (!payload || payload.prCount === 0) return <circle key={uniqueKey} cx={cx} cy={cy} r={4} fill={theme === 'dark' ? '#e53935' : '#1565c0'} />;
    
    let starColor = '#FFD700'; // Oro (1 PR)
    if (payload.prCount === 2) starColor = '#E5E4E2'; // Platino (2 PR)
    if (payload.prCount >= 3) starColor = '#FF00FF'; // Cósmica (3+ PR)

    return (
      <g key={uniqueKey} transform={`translate(${cx - 10}, ${cy - 10})`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={starColor} stroke="#000" strokeWidth="1" className="drop-shadow-md animate-pulse">
          <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
        </svg>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className={`p-4 md:p-6 rounded-2xl border ${t.card} space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-slate-500/20">
          <Filter className={t.accentText} size={20} />
          <h3 className="font-bold text-lg">Filtros Avanzados</h3>
        </div>
        
        <div>
          <label className={`block text-xs font-bold mb-2 ${t.textMuted}`}>Perfiles Analizados (Múltiple Selección)</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { playClickSound(); setSelectedUsers([]); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedUsers.length === 0 ? `${t.accentBg} text-white` : 'bg-black/10'}`}>Todos</button>
            {allUsers.map(u => (
              <button key={u} onClick={() => toggleUser(u)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedUsers.includes(u) ? `${t.accentBg} text-white` : 'bg-black/10'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Categoría</label><select value={selectedCategory} onChange={e => { playClickSound(); setSelectedCategory(e.target.value); setSelectedExercise('TODOS'); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}><option value="TODOS">TODAS</option>{Array.from(new Set(Object.values(CATEGORY_MAP).map(v => v.cat))).sort().map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Músculo Particular</label><select value={selectedMuscleFilter} onChange={e => { playClickSound(); setSelectedMuscleFilter(e.target.value); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}><option value="TODOS">TODOS</option>{Array.from(new Set(Object.values(CATEGORY_MAP).map(v => v.muscle))).sort().map(m => <option key={m} value={m} className="capitalize">{m}</option>)}</select></div>
          <div><label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Ejercicio</label><select value={selectedExercise} onChange={e => { playClickSound(); setSelectedExercise(e.target.value); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}><option value="TODOS">TODOS</option>{ejerciciosLista.filter(e => selectedCategory === 'TODOS' || getCategory(e) === selectedCategory).sort().map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-slate-500/10 mt-2">
          <span className={`text-xs font-bold ${t.textMuted}`}>Tiempo:</span>
          {['TODOS', '7D', '30D', '1Y', 'CUSTOM'].map(r => (
            <button key={r} onClick={() => { playClickSound(); setTimeRange(r); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${timeRange === r ? `${t.accentBg} text-white` : 'bg-black/5 hover:bg-black/10'}`}>
              {r === 'TODOS' ? 'Todos' : r === '7D' ? 'Últimos 7d' : r === '30D' ? 'Último mes' : r === '1Y' ? 'Último año' : 'Personalizado'}
            </button>
          ))}
          {timeRange === 'CUSTOM' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`p-1.5 rounded-lg border text-xs ${t.input}`} /><span>a</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`p-1.5 rounded-lg border text-xs ${t.input}`} />
            </div>
          )}
        </div>
      </div>

      {/* CHART 1 */}
      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-lg">Evolución (Ejercicios x Día) y Récords</h3>
          <div className="flex gap-3 text-xs bg-black/10 px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1 font-bold"><span className="text-[#FFD700]">★</span> Oro (1 PR)</span>
            <span className="flex items-center gap-1 font-bold"><span className="text-[#E5E4E2]">★</span> Platino (2 PR)</span>
            <span className="flex items-center gap-1 font-bold"><span className="text-[#FF00FF]">★</span> Cósmica (3+ PR)</span>
          </div>
        </div>
        <div className="h-64 w-full">
          {chart1Data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart1Data} margin={{ top: 15, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', borderColor: '#475569', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val, name, item) => [`${val} ejercicios (Récords: ${item.payload.prCount})`, 'Volumen']} />
                <Line type="monotone" dataKey="count" stroke={theme === 'dark' ? '#e53935' : '#1565c0'} strokeWidth={3} dot={renderStarDot} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center mt-20 opacity-50 font-bold">No hay datos en este filtro.</p>}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CHART 2 */}
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col`}>
          <h3 className="font-bold text-lg mb-4">Histograma Invertido (PRs Actuales)</h3>
          {chart2Data.length === 0 ? (
            <div className={`my-auto text-center p-8 ${t.textMuted}`}>Sin datos de peso registrados en el filtro.</div>
          ) : (
            <div className="h-80 w-full overflow-y-auto pr-2 custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(320, chart2Data.length * 30)}>
                <BarChart data={chart2Data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="ejercicio" type="category" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={9} axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{fill: theme==='dark'?'#ffffff10':'#00000010'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val) => [`${val} kg`, 'Récord']} />
                  <Bar dataKey="peso" radius={[0, 8, 8, 0]}>
                    {chart2Data.map((_, index) => <Cell key={`cell-${index}`} fill={theme === 'dark' ? `hsl(${350 - index * (60/chart2Data.length)}, 75%, 50%)` : `hsl(${210 + index * (60/chart2Data.length)}, 75%, 50%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* MAPA ANATÓMICO */}
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col items-center relative overflow-hidden`}>
          <div className="w-full mb-4">
            <h3 className="font-bold text-lg text-center">Estado Muscular Actual</h3>
            <div className="flex justify-center gap-1 text-[10px] font-bold mt-2 bg-black/5 p-1 rounded-full w-max mx-auto">
              <span className="text-green-500 px-2 py-0.5">&le; 9d</span>
              <span className="text-yellow-500 px-2 py-0.5">10-18d</span>
              <span className="text-orange-500 px-2 py-0.5">19-27d</span>
              <span className="text-red-500 px-2 py-0.5">&gt; 27d</span>
            </div>
          </div>

          {hoveredMuscle && (
            <div className="absolute top-24 bg-black/90 text-white px-4 py-2 rounded-xl text-sm font-bold z-20 pointer-events-none shadow-2xl border border-white/20">
              {hoveredMuscle.label}: {muscleCounts[hoveredMuscle.id] || 0} series totales
            </div>
          )}

          <div className="flex w-full justify-around py-2 gap-4">
            {/* Frente */}
            <svg viewBox="0 0 200 260" className="w-1/2 max-w-[160px] drop-shadow-xl overflow-visible">
              <g stroke={theme === 'dark' ? '#222' : '#fff'} strokeWidth="1.5" strokeLinejoin="round">
                <ellipse cx="100" cy="25" rx="15" ry="20" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Cabeza */}
                <path d="M 85 40 Q 100 45 115 40 L 125 50 L 75 50 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Cuello/Trapecio */}
                <path d="M 72 218 L 82 250 L 68 250 Z M 128 218 L 118 250 L 132 250 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Pies */}
                {ANATOMY_PATHS.frente.map(p => {
                  const isSelected = clickedMuscle === p.id;
                  const muscleColor = getMuscleColorByDays(muscleLastTrained[p.id]);
                  return (
                    <path key={p.id} d={p.d} fill={muscleColor} stroke={isSelected ? '#fff' : (theme === 'dark' ? '#222' : '#fff')} strokeWidth={isSelected ? '3' : '1.5'}
                      onMouseEnter={() => setHoveredMuscle(p)} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { playClickSound(); setClickedMuscle(p.id); }}
                      className="transition-all duration-300 cursor-pointer hover:brightness-125 transform origin-center hover:scale-105"
                    />
                  );
                })}
              </g>
            </svg>
            
            {/* Espalda */}
            <svg viewBox="0 0 200 260" className="w-1/2 max-w-[160px] drop-shadow-xl overflow-visible">
              <g stroke={theme === 'dark' ? '#222' : '#fff'} strokeWidth="1.5" strokeLinejoin="round">
                <ellipse cx="100" cy="25" rx="15" ry="20" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Cabeza */}
                <path d="M 85 40 Q 100 45 115 40 L 125 50 L 75 50 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Cuello/Trapecio */}
                <path d="M 72 218 L 82 250 L 68 250 Z M 128 218 L 118 250 L 132 250 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} /> {/* Pies */}
                {ANATOMY_PATHS.espalda.map(p => {
                  const isSelected = clickedMuscle === p.id;
                  const muscleColor = getMuscleColorByDays(muscleLastTrained[p.id]);
                  return (
                    <path key={p.id} d={p.d} fill={muscleColor} stroke={isSelected ? '#fff' : (theme === 'dark' ? '#222' : '#fff')} strokeWidth={isSelected ? '3' : '1.5'}
                      onMouseEnter={() => setHoveredMuscle(p)} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { playClickSound(); setClickedMuscle(p.id); }}
                      className="transition-all duration-300 cursor-pointer hover:brightness-125 transform origin-center hover:scale-105"
                    />
                  );
                })}
              </g>
            </svg>
          </div>
          <p className={`text-xs mt-4 ${t.textMuted} text-center`}>Click en un músculo para aislar su historial.</p>
        </motion.div>
      </div>

      {/* CHART 4 (Specific Muscle) */}
      <AnimatePresence>
        {clickedMuscle && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className={`p-4 md:p-6 mt-6 rounded-2xl border ${t.card}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 capitalize"><Sparkles className={t.accentText} size={20} /> Evolución Aislda: {clickedMuscle}</h3>
                <button onClick={() => { playClickSound(); setClickedMuscle(null); }} className="text-xs px-2 py-1 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"><X size={16}/></button>
              </div>
              {chart4Data.length === 0 ? (
                <p className={`text-center p-8 ${t.textMuted}`}>No hay registros en el filtro seleccionado.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart4Data} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                      <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{fill: theme==='dark'?'#ffffff10':'#00000010'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val) => [`${val} ejercicios`, 'Volumen']} />
                      <Bar dataKey="count" fill={theme === 'dark' ? '#e53935' : '#1565c0'} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ==============================================================================
// APP ROOT
// ==============================================================================
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Cargando aplicación...');
  
  const [prs, setPrs] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [ejerciciosLista, setEjerciciosLista] = useState(ejerciciosListaInicial);
  const [animations, setAnimations] = useState([]);

  const t = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#181a1b]' : 'bg-[#f8fafc]',
    text: theme === 'dark' ? 'text-slate-100' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-[#222528] border-slate-700/60' : 'bg-white border-slate-200',
    accentText: theme === 'dark' ? 'text-[#e53935]' : 'text-[#1565c0]',
    accentBg: theme === 'dark' ? 'bg-[#e53935]' : 'bg-[#1565c0]',
    accentBorder: theme === 'dark' ? 'border-[#e53935]' : 'border-[#1565c0]',
    accentLightBg: theme === 'dark' ? 'bg-[#e53935]/15' : 'bg-[#1565c0]/10',
    input: theme === 'dark' ? 'bg-[#141617] border-slate-700 text-white focus:border-[#e53935]' : 'bg-slate-50 border-slate-300 text-black focus:border-[#1565c0]'
  }), [theme]);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoadingMessage('Descargando tu perfil...');
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCurrentUser({ id: user.uid, ...snap.data(), email: user.email });
        } else {
          // Fallback if data missing
          setCurrentUser({ id: user.uid, username: user.displayName || 'Atleta', email: user.email });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Data Listeners
  useEffect(() => {
    const unsubPrs = onSnapshot(collection(db, 'prs'), snap => setPrs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubRoutines = onSnapshot(collection(db, 'routines'), snap => setRoutines(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubPrs(); unsubRoutines(); };
  }, []);

  // Routine Import Listener (Sharing)
  useEffect(() => {
    if (!currentUser) return;
    const checkImport = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('shareRoutine');
      if (shareId) {
        setLoadingMessage('Importando rutina compartida...');
        setLoading(true);
        try {
          const snap = await getDoc(doc(db, 'routines', shareId));
          if (snap.exists()) {
            const data = snap.data();
            await addDoc(collection(db, 'routines'), {
              ...data,
              authorId: currentUser.id,
              authorName: currentUser.username,
              name: `${data.name} (Importada)`
            });
            alert(`¡Rutina "${data.name}" importada exitosamente a tu perfil!`);
          }
        } catch (e) {
          console.error(e);
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          setActiveTab('rutinas');
        }
      }
    };
    checkImport();
  }, [currentUser]);

  const triggerFunAnimation = (type = 'random') => {
    const emojis = {
      confetti: ['🎊', '🎉', '✨', '🎈'],
      gimbros: ['🦍', '💪', '🏋️', '🔥'],
      applause: ['👏', '🙌', '⭐', '😎'],
      pr: ['🏆', '👑', '🥇', '🚀']
    };
    
    let chosenKey = type;
    if (type === 'random') {
      const keys = ['confetti', 'gimbros', 'applause'];
      chosenKey = keys[Math.floor(Math.random() * keys.length)];
    }

    const newAnims = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i, 
      emoji: emojis[chosenKey][Math.floor(Math.random() * emojis[chosenKey].length)],
      x: (Math.random() - 0.5) * window.innerWidth * 0.8, 
      y: chosenKey === 'gimbros' ? Math.random() * 200 : -Math.random() * 400 - 100, // Gimbros float up, others fall down
      direction: chosenKey === 'gimbros' ? -1 : 1, // 1 for falling down, -1 for floating up
      rotation: (Math.random() - 0.5) * 360
    }));
    
    setAnimations(prev => [...prev, ...newAnims]);
    setTimeout(() => setAnimations(prev => prev.filter(a => !newAnims.includes(a))), 3000);
  };

  const handleLogout = () => {
    playClickSound();
    auth.signOut();
  };

  if (loading) return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${t.bg} ${t.text}`}>
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${t.accentBorder}`}></div>
      <p className={`font-bold animate-pulse ${t.textMuted}`}>{loadingMessage}</p>
    </div>
  );

  if (!currentUser) return <LoginScreen t={t} />;

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => { playClickSound(); setActiveTab(id); }} className={`flex-1 py-3 md:py-0 md:px-4 md:h-10 rounded-xl md:rounded-lg flex flex-col md:flex-row items-center justify-center gap-1 text-xs md:text-sm font-bold transition-all active:scale-95 ${activeTab === id ? `${t.accentBg} text-white shadow-md` : `opacity-60 hover:opacity-100 hover:bg-black/5`}`}>
      <Icon size={18} /> <span className="hidden sm:inline md:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.bg} ${t.text} pb-24 md:pb-0`}>
      <nav className={`fixed bottom-0 md:sticky md:top-0 w-full z-40 p-2 md:p-4 border-t md:border-t-0 md:border-b ${t.card} backdrop-blur-md bg-opacity-95 md:bg-opacity-90`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2">
            <Dumbbell className={t.accentText} size={28} />
            <h1 className="text-xl font-black tracking-tight">Incursores</h1>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto md:gap-4 flex-1 md:flex-none">
            <div className="flex gap-1 md:gap-2 w-full md:w-auto bg-black/5 p-1 rounded-2xl md:rounded-xl">
              <TabButton id="inicio" icon={Home} label="Inicio" />
              <TabButton id="rutinas" icon={Calendar} label="Rutinas" />
              <TabButton id="ranking" icon={Trophy} label="Ranking" />
              <TabButton id="analytics" icon={Activity} label="Analíticas" />
            </div>
            <div className="hidden md:flex items-center gap-4 border-l pl-4 border-slate-500/20">
              <div className="text-right flex flex-col items-end">
                <span className="flex items-center gap-1 text-sm font-bold"><User size={14}/> {currentUser.username}</span>
                <button onClick={handleLogout} className={`text-[10px] ${t.textMuted} hover:underline`}>Cerrar Sesión</button>
              </div>
              <button onClick={() => { playClickSound(); setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="p-2 rounded-full hover:bg-black/10 transition-transform active:scale-90">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {animations.map(anim => (
          <motion.div key={anim.id} initial={{ opacity: 1, x: 0, y: anim.direction === 1 ? -50 : window.innerHeight, rotate: 0, scale: 0.5 }} animate={{ opacity: 0, x: anim.x, y: anim.direction === 1 ? window.innerHeight : -100, rotate: anim.rotation, scale: 1.5 }} transition={{ duration: 2.5, ease: "easeOut" }} className="fixed text-4xl md:text-5xl pointer-events-none z-50 left-1/2 top-0">
            {anim.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto p-4 py-6 md:py-8 relative min-h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}}>
            {activeTab === 'inicio' && <InicioTab currentUser={currentUser} routines={routines} prs={prs} t={t} theme={theme} onTriggerAnimation={triggerFunAnimation} />}
            {activeTab === 'rutinas' && <RutinasTab currentUser={currentUser} routines={routines} ejerciciosLista={ejerciciosLista} setEjerciciosLista={setEjerciciosLista} setCurrentUser={setCurrentUser} t={t} theme={theme} setLoading={setLoading} setLoadingMessage={setLoadingMessage} />}
            {activeTab === 'ranking' && <RankingTab prs={prs} t={t} theme={theme} />}
            {activeTab === 'analytics' && <AnalyticsTab prs={prs} currentUser={currentUser} ejerciciosLista={ejerciciosLista} t={t} theme={theme} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
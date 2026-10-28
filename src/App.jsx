import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, doc, getDoc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove, query, where, getDocs 
} from 'firebase/firestore';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { 
  Trophy, Activity, Dumbbell, Sun, Moon, Plus, Home, Calendar, Edit2, Copy, Trash2, Share2, Check, X, Filter, Sparkles, User, Settings, Users, LogOut 
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
  appId: getEnv('VITE_FIREBASE_APP_ID') || "1:977966837929:web:ad9f2ea6702a39d37f39b8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Días y Mapeo de Categorías Musculares con Porcentajes (Términos Argentinos) ---
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Diccionario ampliado con porcentajes de activación muscular
const CATEGORY_MAP = {
  'PRESS BANCA PLANO': { cat: 'PECHO', muscles: { pecho: 0.7, triceps: 0.2, hombro_anterior: 0.1 } },
  'PRESS BANCA INCLINADO': { cat: 'PECHO', muscles: { pecho: 0.6, hombro_anterior: 0.3, triceps: 0.1 } },
  'APERTURAS CON MANCUERNAS': { cat: 'PECHO', muscles: { pecho: 0.9, hombro_anterior: 0.1 } },
  'PEC DEC': { cat: 'PECHO', muscles: { pecho: 0.95, hombro_anterior: 0.05 } },
  'CRUCES EN POLEA': { cat: 'PECHO', muscles: { pecho: 0.9, hombro_anterior: 0.1 } },
  'PRESS MILITAR': { cat: 'HOMBRO', muscles: { hombro_anterior: 0.6, hombro_lateral: 0.2, triceps: 0.2 } },
  'VUELOS LATERALES': { cat: 'HOMBRO', muscles: { hombro_lateral: 0.85, trapecio: 0.15 } },
  'VUELOS FRONTALES': { cat: 'HOMBRO', muscles: { hombro_anterior: 0.9, pecho: 0.1 } },
  'FACE PULL': { cat: 'HOMBRO', muscles: { hombro_posterior: 0.6, trapecio: 0.3, dorsal: 0.1 } },
  'REMO AL MENTON': { cat: 'HOMBRO', muscles: { trapecio: 0.6, hombro_lateral: 0.4 } },
  'DOMINADAS': { cat: 'ESPALDA', muscles: { dorsal: 0.7, biceps: 0.2, trapecio: 0.1 } },
  'JALON AL PECHO': { cat: 'ESPALDA', muscles: { dorsal: 0.75, biceps: 0.15, trapecio: 0.1 } },
  'SERRUCHO': { cat: 'ESPALDA', muscles: { dorsal: 0.7, trapecio: 0.15, biceps: 0.15 } },
  'REMO EN POLEA BAJA': { cat: 'ESPALDA', muscles: { dorsal: 0.6, trapecio: 0.3, biceps: 0.1 } },
  'PESO MUERTO CONVENCIONAL': { cat: 'ESPALDA', muscles: { lumbar: 0.4, gluteos: 0.3, isquios: 0.2, trapecio: 0.1 } },
  'PESO MUERTO RUMANO': { cat: 'PIERNAS', muscles: { isquios: 0.6, gluteos: 0.3, lumbar: 0.1 } },
  'BUENOS DIAS': { cat: 'PIERNAS', muscles: { lumbar: 0.5, isquios: 0.3, gluteos: 0.2 } },
  'SILLON DE CUADRICEPS': { cat: 'PIERNAS', muscles: { cuadriceps: 1.0 } },
  'CAMILLA DE ISQUIOS': { cat: 'PIERNAS', muscles: { isquios: 1.0 } },
  'PRENSA 45': { cat: 'PIERNAS', muscles: { cuadriceps: 0.6, gluteos: 0.3, isquios: 0.1 } },
  'SENTADILLA LIBRE': { cat: 'PIERNAS', muscles: { cuadriceps: 0.5, gluteos: 0.3, isquios: 0.1, lumbar: 0.1 } },
  'ESTOCADAS': { cat: 'PIERNAS', muscles: { cuadriceps: 0.5, gluteos: 0.4, isquios: 0.1 } },
  'SENTADILLA BULGARA': { cat: 'PIERNAS', muscles: { gluteos: 0.5, cuadriceps: 0.4, isquios: 0.1 } },
  'GEMELOS EN MAQUINA': { cat: 'PIERNAS', muscles: { gemelos: 1.0 } },
  'CURL CON BARRA': { cat: 'BICEPS', muscles: { biceps: 0.9, antebrazo: 0.1 } },
  'CURL MARTILLO': { cat: 'BICEPS', muscles: { antebrazo: 0.6, biceps: 0.4 } },
  'CURL CONCENTRADO': { cat: 'BICEPS', muscles: { biceps: 1.0 } },
  'PRESS FRANCES': { cat: 'TRICEPS', muscles: { triceps: 1.0 } },
  'EXTENSIONES EN POLEA': { cat: 'TRICEPS', muscles: { triceps: 1.0 } },
  'FONDOS EN PARALELAS': { cat: 'TRICEPS', muscles: { triceps: 0.6, pecho: 0.3, hombro_anterior: 0.1 } },
  'CRUNCH ABDOMINAL': { cat: 'CORE', muscles: { abs: 1.0 } },
  'PLANCHA': { cat: 'CORE', muscles: { abs: 0.8, lumbar: 0.2 } },
};

const getCategory = (ej) => CATEGORY_MAP[ej?.toUpperCase()]?.cat || 'OTROS';
const ejerciciosListaInicial = Object.keys(CATEGORY_MAP);

// --- Sonidos ---
const playClickSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(500, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

// --- Colores y Utilidades ---
const CHART_COLORS = ['#58a6ff', '#3fb950', '#f85149', '#d2a8ff', '#e3b341', '#a371f7'];

const getHeatmapColor = (intensityRatio) => {
  // intensityRatio va de 0.0 (nada entrenado) a 1.0 (muy entrenado)
  if (intensityRatio === 0) return '#161b22'; // Fondo oscuro GitHub
  // Gradiente: 0.1 = #0e4429, 0.5 = #006d32, 0.8 = #26a641, 1.0 = #39d353 (GitHub heatmap)
  if (intensityRatio < 0.25) return '#0e4429';
  if (intensityRatio < 0.50) return '#006d32';
  if (intensityRatio < 0.75) return '#26a641';
  return '#39d353';
};

// VECTORES ANATÓMICOS REALISTAS POLIGONALES (ESTILO POP-ART REFERENCIA)
// Utilizando segmentos angulares cerrados (Z) y líneas (L) para imitar los bloques de la imagen.
const ANATOMY_PATHS = {
  masculino: {
    frente: [
      { id: 'pecho', label: 'Pecho Plana/Sup', d: 'M 72 50 L 98 55 L 98 75 L 85 80 L 70 65 Z M 128 50 L 102 55 L 102 75 L 115 80 L 130 65 Z' },
      { id: 'abs', label: 'Abdomen (Core)', d: 'M 85 82 L 98 82 L 98 95 L 85 92 Z M 102 82 L 115 82 L 115 92 L 102 95 Z M 85 95 L 98 98 L 98 110 L 85 108 Z M 102 98 L 115 95 L 115 108 L 102 110 Z M 87 111 L 98 113 L 98 125 L 92 130 Z M 102 113 L 113 111 L 108 130 L 102 125 Z' },
      { id: 'hombro_anterior', label: 'Deltoides Anterior', d: 'M 70 48 L 58 55 L 54 70 L 65 72 Z M 130 48 L 142 55 L 146 70 L 135 72 Z' },
      { id: 'hombro_lateral', label: 'Deltoides Lateral', d: 'M 58 55 L 48 65 L 50 82 L 54 70 Z M 142 55 L 152 65 L 150 82 L 146 70 Z' },
      { id: 'biceps', label: 'Bíceps', d: 'M 54 72 L 62 75 L 60 95 L 48 90 Z M 146 72 L 138 75 L 140 95 L 152 90 Z' },
      { id: 'antebrazo', label: 'Antebrazo', d: 'M 48 92 L 60 97 L 55 125 L 42 120 Z M 152 92 L 140 97 L 145 125 L 158 120 Z' },
      { id: 'cuadriceps', label: 'Cuádriceps', d: 'M 75 140 L 95 140 L 90 195 L 70 190 Z M 125 140 L 105 140 L 110 195 L 130 190 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 70 205 L 85 205 L 80 250 L 65 245 Z M 130 205 L 115 205 L 120 250 L 135 245 Z' }
    ],
    espalda: [
      { id: 'trapecio', label: 'Trapecio', d: 'M 100 35 L 115 48 L 100 70 L 85 48 Z' },
      { id: 'dorsal', label: 'Dorsales', d: 'M 82 50 L 98 72 L 95 110 L 72 80 Z M 118 50 L 102 72 L 105 110 L 128 80 Z' },
      { id: 'lumbar', label: 'Lumbares', d: 'M 95 112 L 105 112 L 110 128 L 90 128 Z' },
      { id: 'hombro_posterior', label: 'Deltoides Posterior', d: 'M 75 48 L 60 55 L 65 75 L 80 65 Z M 125 48 L 140 55 L 135 75 L 120 65 Z' },
      { id: 'triceps', label: 'Tríceps', d: 'M 65 78 L 50 82 L 55 105 L 68 100 Z M 135 78 L 150 82 L 145 105 L 132 100 Z' },
      { id: 'gluteos', label: 'Glúteos', d: 'M 90 130 L 110 130 L 115 160 L 100 165 L 85 160 Z' },
      { id: 'isquios', label: 'Isquiotibiales', d: 'M 82 165 L 98 165 L 92 205 L 75 200 Z M 118 165 L 102 165 L 108 205 L 125 200 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 75 210 L 90 210 L 85 255 L 70 250 Z M 125 210 L 110 210 L 115 255 L 130 250 Z' }
    ]
  },
  femenino: {
    frente: [
      { id: 'pecho', label: 'Pecho (Pectoral)', d: 'M 75 52 L 98 58 L 98 78 L 85 82 L 72 68 Z M 125 52 L 102 58 L 102 78 L 115 82 L 128 68 Z' },
      { id: 'abs', label: 'Abdomen (Core)', d: 'M 88 85 L 98 85 L 98 98 L 88 95 Z M 102 85 L 112 85 L 112 95 L 102 98 Z M 88 98 L 98 100 L 98 115 L 90 120 Z M 102 100 L 112 98 L 110 120 L 102 115 Z' },
      { id: 'hombro_anterior', label: 'Deltoides Anterior', d: 'M 72 48 L 62 55 L 58 70 L 68 72 Z M 128 48 L 138 55 L 142 70 L 132 72 Z' },
      { id: 'hombro_lateral', label: 'Deltoides Lateral', d: 'M 62 55 L 52 65 L 55 80 L 58 70 Z M 138 55 L 148 65 L 145 80 L 142 70 Z' },
      { id: 'biceps', label: 'Bíceps', d: 'M 58 72 L 65 75 L 62 95 L 52 90 Z M 142 72 L 135 75 L 138 95 L 148 90 Z' },
      { id: 'antebrazo', label: 'Antebrazo', d: 'M 52 92 L 62 97 L 58 120 L 45 115 Z M 148 92 L 138 97 L 142 120 L 155 115 Z' },
      { id: 'cuadriceps', label: 'Cuádriceps', d: 'M 78 140 L 95 140 L 92 195 L 72 190 Z M 122 140 L 105 140 L 108 195 L 128 190 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 72 205 L 85 205 L 82 250 L 68 245 Z M 128 205 L 115 205 L 118 250 L 132 245 Z' }
    ],
    espalda: [
      { id: 'trapecio', label: 'Trapecio', d: 'M 100 38 L 112 50 L 100 70 L 88 50 Z' },
      { id: 'dorsal', label: 'Dorsales', d: 'M 85 52 L 98 72 L 95 105 L 75 80 Z M 115 52 L 102 72 L 105 105 L 125 80 Z' },
      { id: 'lumbar', label: 'Lumbares', d: 'M 95 108 L 105 108 L 110 125 L 90 125 Z' },
      { id: 'hombro_posterior', label: 'Deltoides Posterior', d: 'M 78 48 L 65 55 L 68 75 L 82 65 Z M 122 48 L 135 55 L 132 75 L 118 65 Z' },
      { id: 'triceps', label: 'Tríceps', d: 'M 68 78 L 55 82 L 58 105 L 70 100 Z M 132 78 L 145 82 L 142 105 L 130 100 Z' },
      { id: 'gluteos', label: 'Glúteos', d: 'M 88 128 L 112 128 L 118 158 L 100 162 L 82 158 Z' },
      { id: 'isquios', label: 'Isquiotibiales', d: 'M 82 165 L 98 165 L 92 205 L 75 200 Z M 118 165 L 102 165 L 108 205 L 125 200 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 75 210 L 90 210 L 85 255 L 70 250 Z M 125 210 L 110 210 L 115 255 L 130 250 Z' }
    ]
  }
};

// ==============================================================================
// TRADUCTOR DE ERRORES FIREBASE
// ==============================================================================
const translateFirebaseError = (error) => {
  if (!error || !error.code) return "Ocurrió un error inesperado.";
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password': return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
    case 'auth/weak-password': return 'La contraseña es muy débil (mínimo 6 caracteres).';
    case 'auth/requires-recent-login': return 'Por seguridad, debes cerrar sesión y volver a entrar para realizar este cambio.';
    default: return `Error: ${error.message}`;
  }
};

// ==============================================================================
// PANTALLA DE LOGIN Y REGISTRO
// ==============================================================================
const LoginScreen = ({ t, theme, toggleTheme }) => {
  const [mode, setMode] = useState('login'); 
  const [form, setForm] = useState({ username: '', email: '', password: '', anatomy: 'masculino' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSwitchMode = (targetMode) => { playClickSound(); setError(''); setSuccessMsg(''); setMode(targetMode); };

  const handleAuthAction = async (e, actionType) => {
    e.preventDefault(); playClickSound(); setError(''); setSuccessMsg(''); setLoading(true);
    try {
      if (actionType === 'register') {
        if (!/^[a-zA-Z0-9_]+$/.test(form.username)) throw new Error("El usuario solo debe contener letras o números.");
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.username });
        await setDoc(doc(db, 'users', cred.user.uid), { username: form.username, email: form.email, anatomy: form.anatomy, activeRoutineId: null, groups: [] });
      } else if (actionType === 'login') {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else if (actionType === 'forgot') {
        await sendPasswordResetEmail(auth, form.email);
        setSuccessMsg("Enlace enviado a tu correo. Revisa tu bandeja de entrada o spam.");
      }
    } catch (err) { 
      setError(err.message === "El usuario solo debe contener letras o números." ? err.message : translateFirebaseError(err)); 
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    playClickSound(); setError(''); setLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), { username: result.user.displayName || result.user.email.split('@')[0], email: result.user.email, anatomy: 'masculino', activeRoutineId: null, groups: [] });
      }
    } catch (err) { if (err.code !== 'auth/popup-closed-by-user') setError(translateFirebaseError(err)); }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative ${t.bg} ${t.text}`}>
      <div className="absolute top-4 right-4">
        <button onClick={() => { playClickSound(); toggleTheme(); }} className={`p-2 rounded-full transition-transform active:scale-90 ${t.btn}`}>
          {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-blue-500" />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl ${t.card}`}>
        <div className="flex justify-center mb-4"><Dumbbell className={t.accentText} size={48} /></div>
        <h2 className="text-3xl font-black text-center mb-1 tracking-tight">COLOSSUS</h2>
        <p className={`text-center text-xs mb-8 ${t.textMuted}`}>Registra tus rutinas y rompe tus límites</p>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center font-bold">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg text-sm text-center font-bold">{successMsg}</div>}

        {mode === 'login' && (
          <form onSubmit={(e) => handleAuthAction(e, 'login')} className="space-y-4">
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none transition-colors ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Contraseña</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none transition-colors ${t.input}`} /></div>
            <div className="text-right"><button type="button" onClick={() => handleSwitchMode('forgot')} className={`text-xs font-bold ${t.accentText} hover:underline`}>¿Olvidaste tu contraseña?</button></div>
            <button type="submit" disabled={loading} className={`w-full p-3 rounded-lg font-bold text-white transition-all active:scale-95 shadow-md flex justify-center ${t.accentBg}`}>{loading ? <span className="animate-pulse">Cargando...</span> : 'Ingresar'}</button>
            <div className="relative flex py-4 items-center"><div className={`flex-grow border-t ${t.borderMuted}`}></div><span className={`flex-shrink-0 mx-4 text-xs font-bold ${t.textMuted}`}>o continuar con</span><div className={`flex-grow border-t ${t.borderMuted}`}></div></div>
            <button type="button" onClick={handleGoogleLogin} className={`w-full p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm text-sm ${t.btn}`}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <div className={`mt-6 text-center border-t pt-4 ${t.borderMuted}`}><button type="button" onClick={() => handleSwitchMode('register')} className={`text-sm font-bold ${t.accentText} hover:underline`}>¿Nuevo aquí? Crea tu perfil</button></div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={(e) => handleAuthAction(e, 'register')} className="space-y-4">
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Nombre de Usuario</label><input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Contraseña (Min. 6 char)</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Fisionomía Anatómica Base</label>
              <select value={form.anatomy} onChange={e => setForm({...form, anatomy: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`}>
                <option value="masculino">Físico Masculino</option><option value="femenino">Físico Femenino</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className={`w-full p-3 mt-2 rounded-lg font-bold text-white transition-all active:scale-95 shadow-md flex justify-center ${t.accentBg}`}>{loading ? 'Creando...' : 'Crear Perfil'}</button>
            <div className="text-center mt-4"><button type="button" onClick={() => handleSwitchMode('login')} className={`text-xs font-bold ${t.textMuted} hover:underline`}>Volver</button></div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={(e) => handleAuthAction(e, 'forgot')} className="space-y-4">
            <p className={`text-sm ${t.textMuted} text-center mb-4`}>Te enviaremos un enlace oficial de Firebase para restablecer tu acceso.</p>
            <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Correo Electrónico</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
            <button type="submit" disabled={loading} className={`w-full p-3 rounded-lg font-bold text-white transition-all active:scale-95 flex justify-center ${t.accentBg}`}>{loading ? 'Enviando...' : 'Enviar enlace'}</button>
            <div className="text-center mt-4"><button type="button" onClick={() => handleSwitchMode('login')} className={`text-xs font-bold ${t.textMuted} hover:underline`}>Volver al inicio</button></div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

// ==============================================================================
// PESTAÑAS (TABS) DE LA APLICACIÓN
// ==============================================================================

const InicioTab = ({ currentUser, routines, prs, t }) => {
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
    await addDoc(collection(db, 'prs'), { nombre: currentUser.username, ejercicio, peso: pesoNum, fecha: new Date().toISOString() });
    setCompletingIdx(null); setKgInput('');
  };

  if (!activeRoutine) return (
    <div className={`p-8 text-center rounded-xl border ${t.card} ${t.textMuted}`}>
      <h3 className="text-lg font-bold mb-2">Sin rutina activa</h3><p className="text-sm">Ve a la pestaña Rutinas para empezar.</p>
    </div>
  );

  const todayExercises = activeRoutine.exercises[mappedDay] || [];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl border ${t.card}`}>
        <h2 className="text-2xl font-bold tracking-tight">¡A entrenar, {currentUser.username}!</h2>
        <p className={`capitalize text-sm mt-1 ${t.textMuted}`}>Hoy es {mappedDay} • {activeRoutine.name}</p>
      </div>

      {todayExercises.length === 0 ? (
        <div className={`p-8 text-center rounded-xl border ${t.card} ${t.textMuted}`}>Día de descanso programado.</div>
      ) : (
        <div className="grid gap-3">
          {todayExercises.map((ex, idx) => {
            const isDone = userTodayPrs.some(pr => pr.ejercicio === ex.ejercicio);
            return (
              <motion.div key={idx} initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${t.card} ${isDone ? 'opacity-60 grayscale' : ''}`}>
                <div>
                  <h3 className="font-bold text-lg">{ex.ejercicio}</h3>
                  <p className={`text-sm font-medium ${t.textMuted}`}>{ex.series} series {ex.reps && `x ${ex.reps} reps`}</p>
                </div>
                {isDone ? (
                  <div className="flex items-center gap-1.5 text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-lg w-max"><Check size={16}/> Hecho</div>
                ) : completingIdx === idx ? (
                  <div className="flex gap-2">
                    <input type="number" min="0" step="0.5" placeholder="Kg..." value={kgInput} onChange={e => setKgInput(e.target.value)} className={`w-24 p-2 text-sm rounded-lg border ${t.input}`} />
                    <button onClick={() => checkAndSubmitExercise(ex.ejercicio)} className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all active:scale-95 ${t.accentBg}`}>Guardar</button>
                    <button onClick={() => { playClickSound(); setCompletingIdx(null); }} className={`px-3 py-2 rounded-lg transition-all active:scale-95 ${t.btn}`}><X size={16}/></button>
                  </div>
                ) : (
                  <button onClick={() => { playClickSound(); setCompletingIdx(idx); }} className={`px-4 py-2 text-sm rounded-lg font-bold border transition-all active:scale-95 self-start sm:self-auto ${t.btn}`}>Completar</button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RutinasTab = ({ currentUser, routines, ejerciciosLista, setEjerciciosLista, setCurrentUser, t }) => {
  const [editingRoutine, setEditingRoutine] = useState(null);
  const myRoutines = routines.filter(r => r.authorId === currentUser?.id);

  const openCreate = () => { playClickSound(); setEditingRoutine({ name: '', exercises: DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}) }); };
  
  const saveRoutine = async () => {
    playClickSound();
    if (!editingRoutine.name.trim()) return; // Validador silencioso
    const payload = { ...editingRoutine, authorId: currentUser.id, authorName: currentUser.username };
    if (editingRoutine.id) await updateDoc(doc(db, 'routines', editingRoutine.id), payload);
    else await addDoc(collection(db, 'routines'), payload);
    setEditingRoutine(null);
  };

  const deleteRoutine = async (id) => {
    playClickSound();
    await deleteDoc(doc(db, 'routines', id));
    if (currentUser.activeRoutineId === id) await setActive(null);
  };

  const setActive = async (id) => {
    playClickSound();
    await updateDoc(doc(db, 'users', currentUser.id), { activeRoutineId: id });
    setCurrentUser(prev => ({ ...prev, activeRoutineId: id }));
  };

  // Deep copy de ejercicios para evitar mutación directa del estado
  const updateExercise = (day, idx, field, value) => {
    const newDays = { ...editingRoutine.exercises };
    const newExList = [...newDays[day]];
    newExList[idx] = { ...newExList[idx], [field]: value };
    newDays[day] = newExList;
    setEditingRoutine({ ...editingRoutine, exercises: newDays });
  };
  const addExercise = (day) => { playClickSound(); updateExercise(day, editingRoutine.exercises[day].length, 'ejercicio', ''); };
  const removeExercise = (day, idx) => {
    playClickSound();
    const newDays = { ...editingRoutine.exercises };
    newDays[day] = newDays[day].filter((_, i) => i !== idx);
    setEditingRoutine({ ...editingRoutine, exercises: newDays });
  };

  if (editingRoutine) return (
    <div className={`p-4 md:p-6 rounded-xl border shadow-sm ${t.card}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">{editingRoutine.id ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
        <button onClick={() => { playClickSound(); setEditingRoutine(null); }} className={`p-2 rounded-lg transition-colors ${t.btn}`}><X size={18}/></button>
      </div>
      <input type="text" placeholder="Nombre de la rutina..." value={editingRoutine.name} onChange={e => setEditingRoutine({...editingRoutine, name: e.target.value})} className={`w-full p-3 mb-6 rounded-lg border text-lg font-bold outline-none ${t.input}`} />
      
      {/* GRID RESPONSIVO: Columnas en Ordenador, Filas en Móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-3">
        {DAYS.map(day => (
          <div key={day} className={`p-3 md:p-4 rounded-lg border ${t.borderMuted} bg-black/5`}>
            <h3 className="font-bold capitalize mb-3 text-sm text-center border-b pb-2 border-slate-500/20">{day}</h3>
            <div className="space-y-3">
              {editingRoutine.exercises[day].map((ex, idx) => (
                <div key={idx} className="flex flex-col gap-2 relative group p-2 bg-black/10 rounded-lg">
                  <input type="text" list="lista-ejercicios-rutina" placeholder="Ejercicio" value={ex.ejercicio} 
                    onChange={e => updateExercise(day, idx, 'ejercicio', e.target.value.toUpperCase())}
                    className={`w-full p-1.5 text-xs font-bold rounded border outline-none ${t.input}`} />
                  <div className="flex gap-2">
                    <input type="number" min="1" step="1" placeholder="Ser." value={ex.series} onChange={e => updateExercise(day, idx, 'series', e.target.value)} className={`w-1/2 p-1.5 text-xs rounded border outline-none ${t.input}`} />
                    <input type="number" min="1" step="1" placeholder="Rep." value={ex.reps} onChange={e => updateExercise(day, idx, 'reps', e.target.value)} className={`w-1/2 p-1.5 text-xs rounded border outline-none ${t.input}`} />
                  </div>
                  <button onClick={() => removeExercise(day, idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><Trash2 size={12}/></button>
                </div>
              ))}
              <button onClick={() => addExercise(day)} className={`w-full text-xs font-bold py-2 rounded-lg border transition-all active:scale-95 ${t.btn}`}>+ Añadir</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={saveRoutine} className={`w-full mt-6 p-3 rounded-lg font-bold text-white text-base transition-all active:scale-95 shadow-md ${t.accentBg}`}>Guardar Rutina</button>
      <datalist id="lista-ejercicios-rutina">{ejerciciosLista.map(e => <option key={e} value={e}/>)}</datalist>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={openCreate} className={`w-full p-4 rounded-xl border border-dashed flex justify-center items-center gap-2 font-bold transition-all active:scale-95 ${t.btn} ${t.borderMuted}`}><Plus size={18}/> Crear Nueva Rutina</button>
      {myRoutines.length === 0 ? <p className={`text-center p-6 text-sm ${t.textMuted}`}>No hay rutinas creadas.</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {myRoutines.map(r => {
            const isActive = currentUser?.activeRoutineId === r.id;
            return (
              <div key={r.id} className={`p-5 rounded-xl border relative transition-all ${t.card} ${isActive ? `ring-1 ring-offset-2 ${t.ringAccent}` : ''}`}>
                {isActive && <div className={`absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white rounded-bl-lg ${t.accentBg}`}>ACTIVA</div>}
                <h3 className="text-lg font-bold tracking-tight mb-1 pr-14">{r.name}</h3>
                <p className={`text-xs mb-4 ${t.textMuted}`}>Por {r.authorName}</p>
                <div className="flex gap-2 items-center">
                  <button onClick={() => { playClickSound(); setEditingRoutine(r); }} className={`p-2 rounded-lg transition-colors ${t.btn}`}><Edit2 size={14}/></button>
                  <button onClick={() => deleteRoutine(r.id)} className="p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"><Trash2 size={14}/></button>
                  {!isActive && <button onClick={() => setActive(r.id)} className={`ml-auto px-4 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-95 ${t.btn}`}>Activar</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = ({ prs, currentUser, usersDb, t, theme }) => {
  const allUsers = Array.from(new Set(prs.map(p => p.nombre))).sort();
  const [selectedUsers, setSelectedUsers] = useState([currentUser.username]); 
  
  const toggleUser = (u) => { playClickSound(); setSelectedUsers(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]); };

  // Filtrado general de Récords
  const filteredPrs = useMemo(() => prs.filter(p => selectedUsers.length === 0 || selectedUsers.includes(p.nombre)), [prs, selectedUsers]);

  // Gráfico 1: Multilínea de Progreso General
  const chart1Data = useMemo(() => {
    const datesMap = {};
    const datesSet = new Set(filteredPrs.map(p => p.fecha.split('T')[0]));
    const sortedDates = Array.from(datesSet).sort();
    
    // Inicializar cada fecha con contador 0 para cada usuario activo
    const usersToTrack = selectedUsers.length > 0 ? selectedUsers : allUsers;
    sortedDates.forEach(date => {
      datesMap[date] = { dateFormatted: new Date(date).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) };
      usersToTrack.forEach(u => datesMap[date][u] = 0);
    });

    // Sumar ejercicios
    filteredPrs.forEach(p => {
      const dKey = p.fecha.split('T')[0];
      if (datesMap[dKey][p.nombre] !== undefined) datesMap[dKey][p.nombre] += 1;
    });

    return Object.values(datesMap);
  }, [filteredPrs, selectedUsers, allUsers]);

  // Gráfico 2: Hitmap Muscular
  // Se pondera utilizando los porcentajes del CATEGORY_MAP
  const muscleIntensity = useMemo(() => {
    const counts = {};
    const dates = {};
    const targetPrs = selectedUsers.length === 1 ? prs.filter(p => p.nombre === selectedUsers[0]) : filteredPrs;
    
    targetPrs.forEach(p => {
      const dict = CATEGORY_MAP[p.ejercicio?.toUpperCase()] || { muscles: { otros: 1 } };
      Object.entries(dict.muscles).forEach(([m, pct]) => {
        counts[m] = (counts[m] || 0) + (1 * pct);
        if (!dates[m] || new Date(p.fecha) > new Date(dates[m])) dates[m] = p.fecha;
      });
    });
    
    const maxVal = Math.max(...Object.values(counts), 1);
    const ratios = {};
    Object.keys(counts).forEach(m => ratios[m] = counts[m] / maxVal);
    
    return { ratios, dates, raw: counts };
  }, [filteredPrs, prs, selectedUsers]);

  // Determinar anatomía base a renderizar
  let baseAnatomy = currentUser.anatomy || 'masculino';
  if (selectedUsers.length === 1) {
    const sUser = usersDb.find(u => u.username === selectedUsers[0]);
    if (sUser && sUser.anatomy) baseAnatomy = sUser.anatomy;
  }

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-xl border ${t.card}`}>
        <div className="flex items-center gap-2 mb-4"><Filter size={18} className={t.accentText}/><h3 className="font-bold">Perfiles a Comparar</h3></div>
        <div className="flex flex-wrap gap-2">
          {allUsers.map((u, i) => {
            const isActive = selectedUsers.includes(u);
            const userColor = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <button key={u} onClick={() => toggleUser(u)} style={isActive ? { backgroundColor: userColor, color: '#fff', borderColor: userColor } : {}} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive ? '' : t.btn}`}>
                {u}
              </button>
            );
          })}
        </div>
      </div>

      {/* CHART: Multilinea */}
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`p-5 rounded-xl border ${t.card}`}>
        <h3 className="font-bold mb-4 tracking-tight">Evolución de Actividad Diaria</h3>
        <div className="h-64 w-full">
          {chart1Data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart1Data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#30363d' : '#d0d7de'} vertical={false} />
                <XAxis dataKey="dateFormatted" stroke={t.textMutedColor} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={t.textMutedColor} fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0d1117' : '#fff', borderRadius: '8px', borderColor: theme === 'dark' ? '#30363d' : '#d0d7de', color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                {(selectedUsers.length > 0 ? selectedUsers : allUsers).map((u, i) => (
                  <Line key={u} type="monotone" dataKey={u} name={u} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : <p className={`text-center mt-20 text-sm font-bold ${t.textMuted}`}>Sin datos de actividad.</p>}
        </div>
      </motion.div>

      {/* CHART: Mapa Muscular Pop-Art */}
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`p-5 rounded-xl border ${t.card} flex flex-col items-center`}>
        <div className="w-full mb-4 text-center">
          <h3 className="font-bold tracking-tight">Impacto Anatómico</h3>
          <p className={`text-xs mt-1 ${t.textMuted}`}>Fisionomía: {baseAnatomy} | Colores miden el volumen relativo (Github Style).</p>
        </div>

        <div className="flex w-full max-w-lg justify-around py-4 gap-4">
          <svg viewBox="0 0 200 280" className="w-1/2 drop-shadow-lg max-h-[400px]">
            <g stroke={theme === 'dark' ? '#0d1117' : '#fff'} strokeWidth="1.5" strokeLinejoin="miter">
              <circle cx="100" cy="20" r="15" fill={theme === 'dark' ? '#161b22' : '#e2e8f0'} />
              <path d="M 85 35 L 115 35 L 120 45 L 80 45 Z" fill={theme === 'dark' ? '#161b22' : '#e2e8f0'} />
              {ANATOMY_PATHS[baseAnatomy].frente.map(p => (
                <path key={p.id} d={p.d} fill={getHeatmapColor(muscleIntensity.ratios[p.id] || 0)} className="transition-all duration-300 hover:brightness-125" >
                  <title>{p.label}: {Math.round(muscleIntensity.raw[p.id] || 0)} puntos de vol.</title>
                </path>
              ))}
            </g>
          </svg>
          <svg viewBox="0 0 200 280" className="w-1/2 drop-shadow-lg max-h-[400px]">
            <g stroke={theme === 'dark' ? '#0d1117' : '#fff'} strokeWidth="1.5" strokeLinejoin="miter">
              <circle cx="100" cy="20" r="15" fill={theme === 'dark' ? '#161b22' : '#e2e8f0'} />
              <path d="M 85 35 L 115 35 L 120 45 L 80 45 Z" fill={theme === 'dark' ? '#161b22' : '#e2e8f0'} />
              {ANATOMY_PATHS[baseAnatomy].espalda.map(p => (
                <path key={p.id} d={p.d} fill={getHeatmapColor(muscleIntensity.ratios[p.id] || 0)} className="transition-all duration-300 hover:brightness-125" >
                  <title>{p.label}: {Math.round(muscleIntensity.raw[p.id] || 0)} puntos de vol.</title>
                </path>
              ))}
            </g>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

const PerfilTab = ({ currentUser, t }) => {
  const [form, setForm] = useState({ username: currentUser.username, anatomy: currentUser.anatomy || 'masculino', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault(); playClickSound(); setMsg(''); setLoading(true);
    try {
      const updates = {};
      if (form.username !== currentUser.username) {
        await updateProfile(auth.currentUser, { displayName: form.username });
        updates.username = form.username;
      }
      if (form.anatomy !== currentUser.anatomy) updates.anatomy = form.anatomy;
      
      if (Object.keys(updates).length > 0) await updateDoc(doc(db, 'users', currentUser.id), updates);
      if (form.password) { await updatePassword(auth.currentUser, form.password); setForm({...form, password: ''}); }
      
      setMsg("¡Perfil actualizado con éxito!");
    } catch (err) { setMsg(translateFirebaseError(err)); }
    setLoading(false);
  };

  return (
    <div className={`max-w-md mx-auto p-6 rounded-xl border ${t.card}`}>
      <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2"><Settings size={20} className={t.accentText}/> Configuración</h2>
      {msg && <div className="mb-6 p-3 bg-black/10 rounded-lg text-sm font-bold text-center">{msg}</div>}
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Nombre Público</label><input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
        <div><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Fisionomía Anatómica Base</label>
          <select value={form.anatomy} onChange={e => setForm({...form, anatomy: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`}>
            <option value="masculino">Físico Masculino</option><option value="femenino">Físico Femenino</option>
          </select>
        </div>
        <div className={`pt-4 border-t ${t.borderMuted}`}><label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Cambiar Contraseña (Opcional)</label><input type="password" placeholder="Nueva contraseña..." value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 text-sm rounded-lg border outline-none ${t.input}`} /></div>
        <button type="submit" disabled={loading} className={`w-full p-3 mt-4 rounded-lg font-bold text-white transition-all active:scale-95 shadow-md ${t.accentBg}`}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
      </form>
    </div>
  );
};

const GruposTab = ({ currentUser, usersDb, t }) => {
  return (
    <div className={`p-10 text-center rounded-xl border ${t.card}`}>
      <div className="flex justify-center mb-4 text-blue-500/50"><Users size={56} /></div>
      <h3 className="text-2xl font-bold mb-2 tracking-tight">Clanes y Tribus</h3>
      <p className={`text-sm max-w-sm mx-auto ${t.textMuted}`}>Próximamente podrás generar un código de invitación para crear un Clan. Los miembros del mismo clan aparecerán automáticamente en tu pestaña de Analíticas para competir.</p>
      <button disabled className={`mt-6 px-6 py-2 rounded-lg font-bold border opacity-50 cursor-not-allowed ${t.btn}`}>Crear Clan (Pronto)</button>
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
  
  const [prs, setPrs] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [usersDb, setUsersDb] = useState([]);
  const [ejerciciosLista, setEjerciciosLista] = useState(ejerciciosListaInicial);

  const t = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#010409]' : 'bg-[#f6f8fa]', // GitHub bg
    text: theme === 'dark' ? 'text-[#c9d1d9]' : 'text-[#24292f]',
    textMuted: theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]',
    textMutedColor: theme === 'dark' ? '#8b949e' : '#57606a',
    card: theme === 'dark' ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]',
    borderMuted: theme === 'dark' ? 'border-[#30363d]' : 'border-[#d0d7de]',
    btn: theme === 'dark' ? 'bg-[#21262d] hover:bg-[#30363d] border-[#363b42] text-[#c9d1d9]' : 'bg-[#f3f4f6] hover:bg-[#e5e7eb] border-[#d0d7de] text-[#24292f]',
    accentText: theme === 'dark' ? 'text-[#39d353]' : 'text-[#1a7f37]',
    accentBg: theme === 'dark' ? 'bg-[#238636] hover:bg-[#2ea043]' : 'bg-[#1f883d] hover:bg-[#1a7f37]',
    accentBorder: theme === 'dark' ? 'border-[#2ea043]' : 'border-[#1f883d]',
    accentLightBg: theme === 'dark' ? 'bg-[#238636]/10' : 'bg-[#1f883d]/10',
    ringAccent: theme === 'dark' ? 'ring-[#2ea043]' : 'ring-[#1f883d]',
    input: theme === 'dark' ? 'bg-[#010409] border-[#30363d] focus:border-[#58a6ff] text-[#c9d1d9]' : 'bg-[#f6f8fa] border-[#d0d7de] focus:border-[#0969da] text-[#24292f]'
  }), [theme]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setCurrentUser({ id: user.uid, ...(snap.exists() ? snap.data() : { username: user.displayName || 'Atleta', anatomy: 'masculino' }) });
      } else setCurrentUser(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const uPrs = onSnapshot(collection(db, 'prs'), snap => setPrs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const uRts = onSnapshot(collection(db, 'routines'), snap => setRoutines(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const uUsr = onSnapshot(collection(db, 'users'), snap => setUsersDb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { uPrs(); uRts(); uUsr(); };
  }, []);

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${t.bg}`}><div className={`animate-spin h-8 w-8 border-2 rounded-full border-t-transparent ${t.accentBorder}`}></div></div>;
  if (!currentUser) return <LoginScreen t={t} theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />;

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button onClick={() => { playClickSound(); setActiveTab(id); }} className={`flex flex-col md:flex-row items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-1.5 rounded-lg text-[10px] md:text-sm font-bold transition-colors ${activeTab === id ? `${t.card} shadow-sm border` : `border border-transparent opacity-60 hover:opacity-100 hover:bg-black/5`}`}>
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${t.bg} ${t.text} pb-20 md:pb-0`}>
      <header className={`sticky top-0 z-40 p-2 md:p-3 border-b ${t.card} backdrop-blur bg-opacity-95`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className={t.accentText} size={24} />
            <h1 className="text-lg font-black tracking-tight hidden md:block">COLOSSUS</h1>
          </div>
          
          <div className="flex bg-black/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            <TabBtn id="inicio" icon={Home} label="Inicio" />
            <TabBtn id="rutinas" icon={Calendar} label="Rutinas" />
            <TabBtn id="analytics" icon={Activity} label="Analíticas" />
            <TabBtn id="grupos" icon={Users} label="Grupos" />
            <TabBtn id="perfil" icon={Settings} label="Perfil" />
          </div>
          
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-500/20">
            <button onClick={() => { playClickSound(); setTheme(theme === 'dark' ? 'light' : 'dark'); }} className={`p-1.5 rounded-md transition-colors ${t.btn}`}>
              {theme === 'dark' ? <Sun size={16} className="text-[#e3b341]" /> : <Moon size={16} className="text-[#0969da]" />}
            </button>
            <button onClick={() => { playClickSound(); signOut(auth); }} className={`p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors`}><LogOut size={16}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} transition={{duration:0.15}}>
            {activeTab === 'inicio' && <InicioTab currentUser={currentUser} routines={routines} prs={prs} t={t} />}
            {activeTab === 'rutinas' && <RutinasTab currentUser={currentUser} routines={routines} ejerciciosLista={ejerciciosLista} setEjerciciosLista={setEjerciciosLista} setCurrentUser={setCurrentUser} t={t} />}
            {activeTab === 'analytics' && <AnalyticsTab prs={prs} currentUser={currentUser} usersDb={usersDb} t={t} theme={theme} />}
            {activeTab === 'perfil' && <PerfilTab currentUser={currentUser} t={t} />}
            {activeTab === 'grupos' && <GruposTab currentUser={currentUser} usersDb={usersDb} t={t} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
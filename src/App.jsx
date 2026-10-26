import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Trophy, Activity, Dumbbell, Sun, Moon, Plus, Home, Calendar, Edit2, Copy, Trash2, Share2, Check, X, Filter, Sparkles, Mail, ShieldCheck, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration de Firebase ---
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
const ejerciciosLista = Object.keys(CATEGORY_MAP);

const hashPassword = async (pwd) => {
  if (!pwd) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const playClickSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
    });
  } catch (e) {}
};

// --- Anatomía Corporal SVGs ---
const ANATOMY_PATHS = {
  masculino: {
    frente: [
      { id: 'pecho', label: 'Pecho', d: 'M 74,52 Q 100,60 126,52 L 122,80 Q 100,85 78,80 Z' },
      { id: 'hombros', label: 'Hombros', d: 'M 54,50 Q 70,48 74,52 L 72,74 Q 52,70 54,50 Z M 146,50 Q 130,48 126,52 L 128,74 Q 148,70 146,50 Z' },
      { id: 'biceps', label: 'Bíceps', d: 'M 50,76 Q 66,74 68,98 Q 50,102 46,82 Z M 150,76 Q 134,74 132,98 Q 150,102 154,82 Z' },
      { id: 'abdominales', label: 'Abdominales', d: 'M 78,84 Q 100,86 122,84 L 118,138 Q 100,142 82,138 Z' },
      { id: 'cuadriceps', label: 'Cuádriceps', d: 'M 74,142 Q 96,144 96,188 L 74,188 Z M 126,142 Q 104,144 104,188 L 126,188 Z' },
      { id: 'aductores', label: 'Aductores', d: 'M 96,146 L 98,184 L 92,184 Z M 104,146 L 102,184 L 108,184 Z' }
    ],
    espalda: [
      { id: 'espalda', label: 'Espalda', d: 'M 70,50 Q 100,45 130,50 L 122,120 Q 100,126 78,120 Z' },
      { id: 'triceps', label: 'Tríceps', d: 'M 48,72 Q 64,70 66,94 Q 48,98 44,78 Z M 152,72 Q 136,70 134,94 Q 152,98 156,78 Z' },
      { id: 'gluteos', label: 'Glúteos', d: 'M 76,124 Q 100,126 100,154 L 74,150 Z M 124,124 Q 100,126 100,154 L 126,150 Z' },
      { id: 'isquiotibiales', label: 'Isquiotibiales', d: 'M 74,154 Q 96,156 96,194 L 74,194 Z M 126,154 Q 104,156 104,194 L 126,194 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 74,198 Q 94,198 90,230 L 76,230 Z M 126,198 Q 106,198 110,230 L 124,230 Z' }
    ]
  },
  femenino: {
    frente: [
      { id: 'pecho', label: 'Pecho', d: 'M 76,54 Q 100,60 124,54 L 120,78 Q 100,82 80,78 Z' },
      { id: 'hombros', label: 'Hombros', d: 'M 58,52 Q 72,50 76,54 L 74,72 Q 58,68 58,52 Z M 142,52 Q 128,50 124,54 L 126,72 Q 142,68 142,52 Z' },
      { id: 'biceps', label: 'Bíceps', d: 'M 54,74 Q 68,72 68,94 Q 54,98 50,80 Z M 146,74 Q 132,72 132,94 Q 146,98 150,80 Z' },
      { id: 'abdominales', label: 'Abdominales', d: 'M 80,80 Q 100,82 120,80 L 116,132 Q 100,136 84,132 Z' },
      { id: 'cuadriceps', label: 'Cuádriceps', d: 'M 72,136 Q 96,138 96,184 L 72,184 Z M 128,136 Q 104,138 104,184 L 128,184 Z' },
      { id: 'aductores', label: 'Aductores', d: 'M 96,138 L 98,180 L 90,180 Z M 104,138 L 102,180 L 110,180 Z' }
    ],
    espalda: [
      { id: 'espalda', label: 'Espalda', d: 'M 72,52 Q 100,48 128,52 L 120,116 Q 100,122 80,116 Z' },
      { id: 'triceps', label: 'Tríceps', d: 'M 52,70 Q 66,68 68,90 Q 52,94 48,76 Z M 148,70 Q 134,68 132,90 Q 148,94 152,76 Z' },
      { id: 'gluteos', label: 'Glúteos', d: 'M 74,120 Q 100,124 100,154 L 72,148 Z M 126,120 Q 100,124 100,154 L 128,148 Z' },
      { id: 'isquiotibiales', label: 'Isquiotibiales', d: 'M 72,152 Q 96,154 96,190 L 72,190 Z M 128,152 Q 104,154 104,190 L 128,190 Z' },
      { id: 'gemelos', label: 'Gemelos', d: 'M 72,194 Q 92,194 88,226 L 74,226 Z M 128,194 Q 108,194 112,226 L 126,226 Z' }
    ]
  }
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Cargando aplicación...');
  const [prs, setPrs] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [animations, setAnimations] = useState([]);

  // Estados Autenticación
  const [mode, setMode] = useState('login'); // login, register_info, register_otp, forgot_request, forgot_reset
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', sex: 'masculino' });
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [simulatedEmailBanner, setSimulatedEmailBanner] = useState(null);
  const [resetUserId, setResetUserId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#181a1b]' : 'bg-[#f8fafc]',
    text: theme === 'dark' ? 'text-slate-100' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-[#222528] border-slate-700/60' : 'bg-white border-slate-200',
    accentText: theme === 'dark' ? 'text-[#e53935]' : 'text-[#1565c0]',
    accentBg: theme === 'dark' ? 'bg-[#e53935]' : 'bg-[#1565c0]',
    accentHover: theme === 'dark' ? 'hover:bg-[#c62828]' : 'hover:bg-[#0d47a1]',
    accentBorder: theme === 'dark' ? 'border-[#e53935]' : 'border-[#1565c0]',
    accentLightBg: theme === 'dark' ? 'bg-[#e53935]/15' : 'bg-[#1565c0]/10',
    input: theme === 'dark' ? 'bg-[#141617] border-slate-700 text-white focus:border-[#e53935]' : 'bg-slate-50 border-slate-300 text-black focus:border-[#1565c0]'
  }), [theme]);

  // Chequeo Sesión y Sincronización Realtime
  useEffect(() => {
    signInAnonymously(auth).catch(() => {});

    const storedId = localStorage.getItem('gymTrackerSession');
    if (storedId) {
      getDoc(doc(db, 'users', storedId)).then(snap => {
        if (snap.exists()) setCurrentUser({ id: snap.id, ...snap.data() });
        else localStorage.removeItem('gymTrackerSession');
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const unsubPrs = onSnapshot(collection(db, 'prs'), snap => {
      setPrs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRoutines = onSnapshot(collection(db, 'routines'), snap => {
      setRoutines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubPrs(); unsubRoutines(); };
  }, []);

  const triggerFunAnimation = (isPr = false) => {
    const emojis = isPr ? ['🏆', '🔥', '👑', '💪', '🚀'] : ['👏', '✅', '⚡', '💯', '😎'];
    const newAnims = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * 300,
      y: -Math.random() * 400 - 100,
      rotation: (Math.random() - 0.5) * 360
    }));
    setAnimations(prev => [...prev, ...newAnims]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => !newAnims.includes(a)));
    }, 2500);
  };

  const LoginScreen = () => {
    const resetStates = () => {
      setError(''); setSuccessMsg(''); setOtpInput('');
    };

    const handleSwitchMode = (targetMode) => {
      playClickSound();
      resetStates();
      setMode(targetMode);
    };

    const sendOtpCode = async (recipientEmail, purpose) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setSimulatedEmailBanner({ email: recipientEmail, code, purpose });

      try {
        await sendPasswordResetEmail(auth, recipientEmail);
        setSuccessMsg(`Correo de verificación enviado a ${recipientEmail}. Revisa tu bandeja de entrada o Spam.`);
      } catch (err) {
        setSuccessMsg(`Código generado para ${recipientEmail}. Usa el código de verificación mostrado arriba.`);
      }
      playSuccessSound(false);
    };

    const handleRegisterStep1 = async (e) => {
      e.preventDefault();
      playClickSound();
      resetStates();

      if (!/^[a-zA-Z]+$/.test(form.username)) {
        setError("El usuario solo debe contener letras (sin espacios ni números).");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Por favor ingresa un correo electrónico válido.");
        return;
      }

      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      setLoadingMessage("Verificando disponibilidad de usuario y correo...");
      setLoading(true);

      try {
        const lowerUser = form.username.toLowerCase();
        const lowerEmail = form.email.toLowerCase();

        const qUser = query(collection(db, 'users'), where('username_lower', '==', lowerUser));
        const snapsUser = await getDocs(qUser);
        if (!snapsUser.empty) throw new Error("El nombre de usuario ya está registrado.");

        const qEmail = query(collection(db, 'users'), where('email_lower', '==', lowerEmail));
        const snapsEmail = await getDocs(qEmail);
        if (!snapsEmail.empty) throw new Error("Este correo ya está asociado a otra cuenta.");

        await sendOtpCode(form.email, 'registro');
        setMode('register_otp');
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    const handleVerifyRegisterOtp = async (e) => {
      e.preventDefault();
      playClickSound();
      resetStates();

      if (otpInput.trim() !== generatedOtp) {
        setError("El código de verificación es incorrecto. Revisa el código de 6 dígitos.");
        return;
      }

      setLoadingMessage("Creando tu perfil seguro...");
      setLoading(true);
      try {
        const lowerUser = form.username.toLowerCase();
        const lowerEmail = form.email.toLowerCase();
        const pHash = await hashPassword(form.password);

        const newUser = { 
          username: form.username, 
          username_lower: lowerUser, 
          email: form.email,
          email_lower: lowerEmail,
          passwordHash: pHash, 
          sex: form.sex, 
          activeRoutineId: null 
        };

        const docRef = await addDoc(collection(db, 'users'), newUser);
        playSuccessSound(true);
        triggerFunAnimation(true);
        setCurrentUser({ id: docRef.id, ...newUser });
        localStorage.setItem('gymTrackerSession', docRef.id);
      } catch (err) {
        setError("Error al crear el perfil: " + err.message);
      }
      setLoading(false);
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      playClickSound();
      resetStates();

      setLoadingMessage("Iniciando sesión...");
      setLoading(true);
      try {
        const lowerUser = form.username.toLowerCase();
        const pHash = await hashPassword(form.password);

        const q = query(collection(db, 'users'), where('username_lower', '==', lowerUser), where('passwordHash', '==', pHash));
        const snaps = await getDocs(q);

        if (snaps.empty) throw new Error("Usuario o contraseña incorrectos.");
        
        setCurrentUser({ id: snaps.docs[0].id, ...snaps.docs[0].data() });
        localStorage.setItem('gymTrackerSession', snaps.docs[0].id);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    const handleForgotRequest = async (e) => {
      e.preventDefault();
      playClickSound();
      resetStates();

      const identifier = form.username.trim().toLowerCase();
      if (!identifier) {
        setError("Ingresa tu usuario o correo electrónico.");
        return;
      }

      setLoadingMessage("Buscando tu cuenta...");
      setLoading(true);

      try {
        let q = query(collection(db, 'users'), where('username_lower', '==', identifier));
        let snaps = await getDocs(q);

        if (snaps.empty) {
          q = query(collection(db, 'users'), where('email_lower', '==', identifier));
          snaps = await getDocs(q);
        }

        if (snaps.empty) throw new Error("No encontramos ninguna cuenta vinculada.");

        const userDocData = snaps.docs[0].data();
        setResetUserId(snaps.docs[0].id);

        if (!userDocData.email) throw new Error("Esta cuenta no tiene un correo válido.");

        await sendOtpCode(userDocData.email, 'recuperación de contraseña');
        setMode('forgot_reset');
        setSuccessMsg(`Código enviado a ${userDocData.email}`);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    const handleResetPassword = async (e) => {
      e.preventDefault();
      playClickSound();
      setError('');

      if (otpInput.trim() !== generatedOtp) {
        setError("El código de verificación es incorrecto.");
        return;
      }

      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      setLoadingMessage("Actualizando contraseña...");
      setLoading(true);

      try {
        const newHash = await hashPassword(form.password);
        await updateDoc(doc(db, 'users', resetUserId), { passwordHash: newHash });

        playSuccessSound(true);
        triggerFunAnimation(false);
        setSuccessMsg("¡Contraseña actualizada exitosamente! Ya puedes ingresar.");
        setForm({ username: '', email: '', password: '', confirmPassword: '', sex: 'masculino' });
        setMode('login');
        setSimulatedEmailBanner(null);
      } catch (err) {
        setError("Error al restablecer la contraseña: " + err.message);
      }
      setLoading(false);
    };

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${t.bg}`}>
        <AnimatePresence>
          {simulatedEmailBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-2xl border border-white/20 backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Mail className="shrink-0 animate-bounce" size={28} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-100">Código OTP Generado</p>
                  <p className="text-xs">Para {simulatedEmailBanner.email}:</p>
                  <p className="text-xl font-black tracking-widest text-white mt-0.5">{simulatedEmailBanner.code}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  playClickSound();
                  navigator.clipboard.writeText(simulatedEmailBanner.code);
                  setOtpInput(simulatedEmailBanner.code);
                }}
                className="px-3 py-1.5 bg-white text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-50 transition-transform active:scale-95 shadow"
              >
                Copiar e Insertar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${t.card}`}>
          <div className="flex justify-center mb-4">
            <Dumbbell className={t.accentText} size={48} />
          </div>
          
          <h2 className={`text-2xl font-black text-center mb-1 ${t.text}`}>Incursores PR</h2>
          <p className={`text-center text-xs mb-6 ${t.textMuted}`}>
            {mode === 'login' && 'Ingresa para guardar tus entrenamientos y récords'}
            {mode === 'register_info' && 'Crea tu perfil seguro'}
            {mode === 'register_otp' && `Verifica tu código enviado a ${form.email}`}
            {mode === 'forgot_request' && 'Restablecer contraseña'}
            {mode === 'forgot_reset' && 'Ingresa el código OTP e introduce tu nueva clave'}
          </p>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm text-center font-medium">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded-xl text-sm text-center font-medium">{successMsg}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Usuario</label>
                <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="Ej: Tomas" />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Contraseña</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="••••••••" />
              </div>

              <div className="text-right">
                <button type="button" onClick={() => handleSwitchMode('forgot_request')} className={`text-xs font-bold ${t.accentText} hover:underline`}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button type="submit" className={`w-full p-3 mt-2 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>
                Ingresar
              </button>

              <div className="mt-6 text-center border-t pt-4 border-slate-500/20">
                <button type="button" onClick={() => handleSwitchMode('register_info')} className={`text-sm font-bold ${t.accentText} hover:underline`}>
                  ¿Nuevo aquí? Crea tu perfil
                </button>
              </div>
            </form>
          )}

          {mode === 'register_info' && (
            <form onSubmit={handleRegisterStep1} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Usuario (Solo letras)</label>
                <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="Ej: Tomas" />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Correo Electrónico</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Contraseña (Mínimo 6 caracteres)</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="••••••••" />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Sexo Biológico</label>
                <select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`}>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              <button type="submit" className={`w-full p-3 mt-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>
                Enviar Código de Verificación
              </button>

              <div className="mt-4 text-center">
                <button type="button" onClick={() => handleSwitchMode('login')} className={`text-sm font-bold ${t.textMuted} hover:underline flex items-center justify-center gap-1 mx-auto`}>
                  <ArrowLeft size={16}/> Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          )}

          {mode === 'register_otp' && (
            <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <ShieldCheck className="mx-auto text-amber-500 mb-1" size={32} />
                <p className="text-xs font-bold text-amber-500">Ingresa el código OTP enviado a tu correo</p>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Código de Verificación</label>
                <input type="text" maxLength={6} required value={otpInput} onChange={e => setOtpInput(e.target.value)} className={`w-full p-3 text-center text-2xl tracking-widest font-mono rounded-xl border outline-none ${t.input}`} placeholder="123456" />
              </div>

              <button type="submit" className={`w-full p-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>
                Verificar y Crear Perfil
              </button>

              <div className="flex justify-between text-xs pt-2">
                <button type="button" onClick={() => sendOtpCode(form.email, 'registro')} className={`font-bold ${t.accentText} hover:underline`}>
                  Reenviar código
                </button>
                <button type="button" onClick={() => handleSwitchMode('register_info')} className={`font-bold ${t.textMuted} hover:underline`}>
                  Cambiar correo
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot_request' && (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Usuario o Correo Registrado</label>
                <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="Tu usuario o correo" />
              </div>

              <button type="submit" className={`w-full p-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>
                Enviar Código de Recuperación
              </button>

              <div className="mt-4 text-center">
                <button type="button" onClick={() => handleSwitchMode('login')} className={`text-sm font-bold ${t.textMuted} hover:underline flex items-center justify-center gap-1 mx-auto`}>
                  <ArrowLeft size={16}/> Cancelar y Volver
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot_reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Código de Verificación (6 dígitos)</label>
                <input type="text" maxLength={6} required value={otpInput} onChange={e => setOtpInput(e.target.value)} className={`w-full p-3 text-center text-xl tracking-widest font-mono rounded-xl border outline-none ${t.input}`} placeholder="123456" />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Nueva Contraseña</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="••••••••" />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Confirmar Nueva Contraseña</label>
                <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="••••••••" />
              </div>

              <button type="submit" className={`w-full p-3 mt-2 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md ${t.accentBg} ${t.accentHover}`}>
                Restablecer Contraseña
              </button>

              <div className="mt-4 text-center">
                <button type="button" onClick={() => handleSwitchMode('login')} className={`text-sm font-bold ${t.textMuted} hover:underline flex items-center justify-center gap-1 mx-auto`}>
                  <ArrowLeft size={16}/> Volver al Inicio
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    );
  };

  const InicioTab = () => {
    const todayNum = new Date().getDay();
    const mappedDay = todayNum === 0 ? 'domingo' : DAYS[todayNum - 1];
    const activeRoutine = routines.find(r => r.id === currentUser?.activeRoutineId);
    const [completingIdx, setCompletingIdx] = useState(null);
    const [kgInput, setKgInput] = useState('');

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
        nombre: currentUser.username, 
        ejercicio: ejercicio, 
        peso: pesoNum, 
        fecha: new Date().toISOString()
      });

      playSuccessSound(isNewPr);
      triggerFunAnimation(isNewPr);
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
                        <button onClick={() => checkAndSubmitExercise(ex.ejercicio)} className={`flex-1 px-4 py-2 rounded-lg font-bold text-white transition-all hover:scale-105 active:scale-95 ${t.accentBg} ${t.accentHover}`}>Guardar</button>
                        <button onClick={() => { playClickSound(); setCompletingIdx(null); }} className={`px-3 py-2 rounded-lg border ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}><X size={20}/></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { playClickSound(); setCompletingIdx(idx); }} className={`px-6 py-2 rounded-lg font-bold border transition-all hover:scale-105 active:scale-95 self-start md:self-auto ${t.accentBorder} ${t.accentText} ${t.accentLightBg} hover:bg-opacity-20`}>Completar</button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const RutinasTab = () => {
    const [editing, setEditing] = useState(null);
    const myRoutines = routines.filter(r => r.authorId === currentUser?.id);

    const openCreate = () => {
      playClickSound();
      setEditing({ name: '', exercises: DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}) });
    };
    
    const saveRoutine = async () => {
      playClickSound();
      if (!editing.name.trim()) return alert("El nombre es requerido");
      setLoadingMessage("Guardando rutina...");
      setLoading(true);
      try {
        const payload = { ...editing, authorId: currentUser.id, authorName: currentUser.username };
        if (editing.id) await updateDoc(doc(db, 'routines', editing.id), payload);
        else await addDoc(collection(db, 'routines'), payload);
        setEditing(null);
      } catch(e){}
      setLoading(false);
    };

    const deleteRoutine = async (id) => {
      playClickSound();
      if (window.confirm("¿Eliminar esta rutina para siempre?")) await deleteDoc(doc(db, 'routines', id));
    };

    const copyRoutine = async (rutina) => {
      playClickSound();
      setLoadingMessage("Duplicando rutina...");
      setLoading(true);
      await addDoc(collection(db, 'routines'), { ...rutina, id: null, name: `${rutina.name} (Copia)` });
      setLoading(false);
    };

    const setActive = async (id) => {
      playClickSound();
      await updateDoc(doc(db, 'users', currentUser.id), { activeRoutineId: id });
      setCurrentUser(prev => ({ ...prev, activeRoutineId: id }));
    };

    if (editing) return (
      <div className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editing.id ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
          <button onClick={() => { playClickSound(); setEditing(null); }} className={t.textMuted}><X/></button>
        </div>
        <input type="text" placeholder="Nombre de la rutina" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className={`w-full p-3 mb-6 rounded-xl border text-lg font-bold ${t.input}`} />
        
        <div className="space-y-6">
          {DAYS.map(day => (
            <div key={day} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="font-bold capitalize mb-3 text-lg">{day}</h3>
              {editing.exercises[day].map((ex, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input type="text" list="lista-ejercicios" placeholder="Ejercicio" value={ex.ejercicio} 
                      onChange={e => {
                        const newEx = [...editing.exercises[day]]; newEx[idx].ejercicio = e.target.value;
                        setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
                      }} className={`w-full p-2.5 rounded-lg border ${t.input}`} />
                  </div>
                  <input type="number" placeholder="Series" value={ex.series} 
                    onChange={e => {
                      const newEx = [...editing.exercises[day]]; newEx[idx].series = e.target.value;
                      setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
                    }} className={`w-full md:w-24 p-2.5 rounded-lg border ${t.input}`} />
                  <input type="text" placeholder="Reps (ej 10)" value={ex.reps} 
                    onChange={e => {
                      const newEx = [...editing.exercises[day]]; newEx[idx].reps = e.target.value;
                      setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
                    }} className={`w-full md:w-32 p-2.5 rounded-lg border ${t.input}`} />
                  <button onClick={() => {
                    playClickSound();
                    const newEx = editing.exercises[day].filter((_, i) => i !== idx);
                    setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
                  }} className="p-2.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={20}/></button>
                </div>
              ))}
              <button onClick={() => {
                playClickSound();
                const newEx = [...editing.exercises[day], { ejercicio: '', series: '', reps: '' }];
                setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
              }} className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 ${t.accentBorder} ${t.accentText} hover:bg-opacity-10`}>+ Ejercicio</button>
            </div>
          ))}
        </div>
        <button onClick={saveRoutine} className={`w-full mt-6 p-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.01] active:scale-95 ${t.accentBg} ${t.accentHover}`}>Guardar Rutina</button>
        <datalist id="lista-ejercicios">{ejerciciosLista.map(e => <option key={e} value={e}/>)}</datalist>
      </div>
    );

    return (
      <div className="space-y-4">
        <button onClick={openCreate} className={`w-full p-4 rounded-2xl border border-dashed flex justify-center items-center gap-2 font-bold transition-all hover:scale-[1.01] active:scale-95 ${theme === 'dark' ? 'border-slate-600 hover:bg-white/5' : 'border-slate-300 hover:bg-black/5'}`}><Plus/> Crear Nueva Rutina</button>
        {myRoutines.length === 0 ? <p className={`text-center p-8 ${t.textMuted}`}>No tienes rutinas. Crea la primera.</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            {myRoutines.map(r => {
              const isActive = currentUser?.activeRoutineId === r.id;
              return (
                <div key={r.id} className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${t.card} ${isActive ? `ring-2 ring-${theme==='dark'?'red-500':'blue-600'}` : ''}`}>
                  {isActive && <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg ${t.accentBg}`}>ACTIVA</div>}
                  <h3 className="text-xl font-bold mb-1 pr-16">{r.name}</h3>
                  <p className={`text-xs mb-4 ${t.textMuted}`}>Por {r.authorName}</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { playClickSound(); setEditing(r); }} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-transform active:scale-90`}><Edit2 size={16}/></button>
                    <button onClick={() => copyRoutine(r)} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-transform active:scale-90`}><Copy size={16}/></button>
                    <button onClick={() => { playClickSound(); navigator.clipboard.writeText(`${window.location.origin}?shareRoutine=${r.id}`); alert("¡Link de rutina copiado!"); }} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-transform active:scale-90`}><Share2 size={16}/></button>
                    <button onClick={() => deleteRoutine(r.id)} className={`p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-transform active:scale-90`}><Trash2 size={16}/></button>
                    {!isActive && <button onClick={() => setActive(r.id)} className={`ml-auto px-4 py-1.5 text-sm font-bold rounded-lg border transition-all hover:scale-105 active:scale-95 ${t.accentText} ${t.accentBorder}`}>Activar</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const RankingTab = () => {
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
            <div key={ej} className={`rounded-2xl border mb-6 overflow-hidden ${t.card}`}>
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
            </div>
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
            <div key={m} className={`rounded-2xl border mb-6 overflow-hidden ${t.card}`}>
              <div className={`px-4 py-3 bg-black/5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}><h3 className="font-bold">{m}</h3></div>
              {stats.map((s, i) => (
                <div key={s.name} className={`flex justify-between p-3 px-4 border-b last:border-b-0 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'} ${i===0 && s.count>0 ? t.accentLightBg : ''}`}>
                  <span className="font-bold">{s.name}</span>
                  <span className="opacity-80">{s.count} ejercicios</span>
                </div>
              ))}
            </div>
          );
        });
      }

      if (subTab === 'consistencia') {
        const d8 = new Date(); d8.setDate(d8.getDate() - 8);
        const counts = {};
        prs.filter(p => new Date(p.fecha) >= d8).forEach(p => counts[p.nombre] = (counts[p.nombre] || 0) + 1);
        const stats = usersSet.map(u => ({ name: u, count: counts[u] || 0 })).sort((a,b) => b.count - a.count);
        return (
          <div className={`rounded-2xl border overflow-hidden ${t.card}`}>
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
          </div>
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

  const AnalyticsTab = () => {
    const allUsers = Array.from(new Set(prs.map(p => p.nombre))).sort();
    const [selectedUser, setSelectedUser] = useState(currentUser?.username || '');
    const [selectedCategory, setSelectedCategory] = useState('TODOS');
    const [selectedExercise, setSelectedExercise] = useState('TODOS');
    const [selectedMuscle, setSelectedMuscle] = useState('TODOS');
    const [timeRange, setTimeRange] = useState('TODOS');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [svgView, setSvgView] = useState('frente');
    const [hoveredMuscle, setHoveredMuscle] = useState(null);
    const [clickedMuscle, setClickedMuscle] = useState(null);

    const targetSex = selectedUser ? (selectedUser === currentUser?.username ? currentUser.sex : 'masculino') : 'masculino';
    const activePaths = ANATOMY_PATHS[targetSex][svgView];
    
    const filteredPrs = useMemo(() => {
      if (!selectedUser) return [];
      return prs.filter(p => {
        if (p.nombre !== selectedUser) return false;
        if (selectedCategory !== 'TODOS' && getCategory(p.ejercicio) !== selectedCategory) return false;
        if (selectedExercise !== 'TODOS' && p.ejercicio !== selectedExercise) return false;
        if (selectedMuscle !== 'TODOS' && getMuscle(p.ejercicio) !== selectedMuscle) return false;
        
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
    }, [prs, selectedUser, selectedCategory, selectedExercise, selectedMuscle, timeRange, startDate, endDate]);

    const muscleCounts = useMemo(() => {
      const counts = {};
      const userPrs = prs.filter(p => p.nombre === selectedUser);
      userPrs.forEach(p => {
        const m = getMuscle(p.ejercicio);
        counts[m] = (counts[m] || 0) + 1;
      });
      return counts;
    }, [prs, selectedUser]);

    const maxMuscleCount = useMemo(() => {
      const vals = Object.values(muscleCounts);
      return vals.length > 0 ? Math.max(...vals) : 1;
    }, [muscleCounts]);

    const getHeatmapColor = (muscleId) => {
      const count = muscleCounts[muscleId] || 0;
      if (count === 0) return '#475569';
      const ratio = Math.min(count / maxMuscleCount, 1);
      const hue = 120 - ratio * 120;
      return `hsl(${hue}, 85%, 50%)`;
    };

    const chart1Data = useMemo(() => {
      const datesMap = {};
      const cumulativeMaxes = {};

      filteredPrs.forEach(p => {
        const dKey = p.fecha.split('T')[0];
        if (!datesMap[dKey]) datesMap[dKey] = { date: dKey, count: 0, prCount: 0 };
        datesMap[dKey].count += 1;

        if (p.peso !== null) {
          const currentMax = cumulativeMaxes[p.ejercicio] || 0;
          if (p.peso > currentMax) {
            datesMap[dKey].prCount += 1;
            cumulativeMaxes[p.ejercicio] = p.peso;
          }
        }
      });

      return Object.values(datesMap).sort((a,b) => new Date(a.date) - new Date(b.date)).map(d => ({
        ...d,
        dateFormatted: new Date(d.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      }));
    }, [filteredPrs]);

    const chart2Data = useMemo(() => {
      const exercisePrs = {};
      filteredPrs.forEach(p => {
        if (p.peso !== null) {
          if (!exercisePrs[p.ejercicio] || p.peso > exercisePrs[p.ejercicio]) {
            exercisePrs[p.ejercicio] = p.peso;
          }
        }
      });
      return Object.keys(exercisePrs).map(ex => ({
        ejercicio: ex,
        peso: exercisePrs[ex]
      })).sort((a,b) => b.peso - a.peso);
    }, [filteredPrs]);

    const chart4Data = useMemo(() => {
      if (!clickedMuscle) return [];
      const userMusclePrs = prs.filter(p => p.nombre === selectedUser && getMuscle(p.ejercicio) === clickedMuscle);
      const datesMap = {};
      userMusclePrs.forEach(p => {
        const dKey = p.fecha.split('T')[0];
        if (!datesMap[dKey]) datesMap[dKey] = { date: dKey, count: 0 };
        datesMap[dKey].count += 1;
      });
      return Object.values(datesMap).sort((a,b) => new Date(a.date) - new Date(b.date)).map(d => ({
        ...d,
        dateFormatted: new Date(d.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      }));
    }, [prs, selectedUser, clickedMuscle]);

    const renderStarDot = (props) => {
      const { cx, cy, payload, index } = props;
      const uniqueKey = `star-dot-${cx}-${cy}-${index}`;

      if (!payload || payload.prCount === 0) {
        return <circle key={uniqueKey} cx={cx} cy={cy} r={4} fill={theme === 'dark' ? '#e53935' : '#1565c0'} />;
      }
      const starType = payload.prCount === 1 ? 'gold' : payload.prCount === 2 ? 'platinum' : 'cosmic';
      const colors = { gold: '#FFD700', platinum: '#E5E4E2', cosmic: '#FF00FF' };

      return (
        <g key={uniqueKey} transform={`translate(${cx - 10}, ${cy - 10})`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={colors[starType]} stroke="#000" strokeWidth="1" className="drop-shadow-md animate-pulse">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
          </svg>
        </g>
      );
    };

    return (
      <div className="space-y-6">
        <div className={`p-4 md:p-6 rounded-2xl border ${t.card} space-y-4`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-500/20">
            <Filter className={t.accentText} size={20} />
            <h3 className="font-bold text-lg">Filtros Avanzados</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Persona</label>
              <select value={selectedUser} onChange={e => { playClickSound(); setSelectedUser(e.target.value); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
                {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Categoría</label>
              <select value={selectedCategory} onChange={e => { playClickSound(); setSelectedCategory(e.target.value); setSelectedExercise('TODOS'); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
                <option value="TODOS">TODAS</option>
                {Array.from(new Set(Object.values(CATEGORY_MAP).map(v => v.cat))).sort().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Ejercicio</label>
              <select value={selectedExercise} onChange={e => { playClickSound(); setSelectedExercise(e.target.value); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
                <option value="TODOS">TODOS</option>
                {ejerciciosLista.filter(e => selectedCategory === 'TODOS' || getCategory(e) === selectedCategory).sort().map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Músculo</label>
              <select value={selectedMuscle} onChange={e => { playClickSound(); setSelectedMuscle(e.target.value); }} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
                <option value="TODOS">TODOS</option>
                {Array.from(new Set(Object.values(CATEGORY_MAP).map(v => v.muscle))).sort().map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <span className={`text-xs font-bold ${t.textMuted}`}>Tiempo:</span>
            {['TODOS', '7D', '30D', '1Y', 'CUSTOM'].map(r => (
              <button key={r} onClick={() => { playClickSound(); setTimeRange(r); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${timeRange === r ? `${t.accentBg} text-white` : 'bg-black/5 hover:bg-black/10'}`}>
                {r === 'TODOS' ? 'Todos' : r === '7D' ? 'Últimos 7d' : r === '30D' ? 'Último mes' : r === '1Y' ? 'Último año' : 'Personalizado'}
              </button>
            ))}

            {timeRange === 'CUSTOM' && (
              <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`p-1.5 rounded-lg border text-xs ${t.input}`} />
                <span>a</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`p-1.5 rounded-lg border text-xs ${t.input}`} />
              </div>
            )}
          </div>
        </div>

        <div className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-lg">Progreso de Actividad y Récords</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="text-amber-400">★</span> 1 PR</span>
              <span className="flex items-center gap-1"><span className="text-slate-300">★</span> 2 PRs</span>
              <span className="flex items-center gap-1"><span className="text-pink-500">★</span> 3+ PRs</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart1Data} margin={{ top: 15, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', borderColor: '#475569', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val, name, item) => [`${val} ejercicios (${item.payload.prCount} PRs)`, 'Actividad']} />
                <Line type="monotone" dataKey="count" stroke={theme === 'dark' ? '#e53935' : '#1565c0'} strokeWidth={3} dot={renderStarDot} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col`}>
            <h3 className="font-bold text-lg mb-4">Histograma Invertido de PRs (kg)</h3>
            {chart2Data.length === 0 ? (
              <div className={`my-auto text-center p-8 ${t.textMuted}`}>Sin datos registrados.</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart2Data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                    <XAxis type="number" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis dataKey="ejercicio" type="category" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={9} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val) => [`${val} kg`, 'Máximo PR']} />
                    <Bar dataKey="peso" radius={[0, 8, 8, 0]}>
                      {chart2Data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={theme === 'dark' ? `hsl(${350 - index * 10}, 75%, 50%)` : `hsl(${210 + index * 10}, 75%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col items-center relative overflow-hidden`}>
            <div className="flex justify-between w-full mb-4 items-center">
              <div>
                <h3 className="font-bold text-lg">Mapa Muscular Corporal</h3>
                <p className={`text-xs ${t.textMuted}`}>Verde = Menos Entrenado | Rojo = Más Entrenado</p>
              </div>
              <button onClick={() => { playClickSound(); setSvgView(svgView === 'frente' ? 'espalda' : 'frente'); }} className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all hover:scale-105 active:scale-95 ${t.accentBorder} ${t.accentText}`}>
                Ver {svgView === 'frente' ? 'Espalda' : 'Frente'}
              </button>
            </div>

            {hoveredMuscle && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-bold z-20 pointer-events-none backdrop-blur-md border border-white/20">
                {hoveredMuscle.label}: {muscleCounts[hoveredMuscle.id] || 0} ejercicios realizados
              </div>
            )}

            <div className="relative w-full flex justify-center py-4">
              <svg viewBox="0 0 200 260" className="w-full max-w-[200px] drop-shadow-2xl overflow-visible">
                <g stroke={theme === 'dark' ? '#111' : '#fff'} strokeWidth="1.5" strokeLinejoin="round">
                  <ellipse cx="100" cy="24" rx="14" ry="18" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} />
                  <path d="M 86,40 L 114,40 L 126,50 L 74,50 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} />
                  <path d="M 52,86 L 44,130 L 36,130 L 46,80 Z M 148,86 L 156,130 L 164,130 L 154,80 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} />
                  <path d="M 72,218 L 82,250 L 68,250 Z M 128,218 L 118,250 L 132,250 Z" fill={theme === 'dark' ? '#262626' : '#e2e8f0'} />

                  {activePaths.map(p => {
                    const isSelected = clickedMuscle === p.id;
                    return (
                      <path 
                        key={p.id} 
                        d={p.d} 
                        fill={getHeatmapColor(p.id)} 
                        stroke={isSelected ? '#00e676' : theme === 'dark' ? '#111' : '#fff'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        onMouseEnter={() => setHoveredMuscle(p)}
                        onMouseLeave={() => setHoveredMuscle(null)}
                        onClick={() => { playClickSound(); setClickedMuscle(p.id); }}
                        className="transition-all duration-300 cursor-pointer hover:brightness-125 hover:scale-105 transform origin-center"
                      >
                        <title>{p.label}</title>
                      </path>
                    );
                  })}
                </g>
              </svg>
            </div>

            <div className="mt-2 text-center text-xs">
              <span className={t.textMuted}>Haz click en un músculo para ver su evolución diaria.</span>
            </div>
          </div>
        </div>

        {clickedMuscle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className={t.accentText} size={20} />
                Evolución Diaria: Músculo {clickedMuscle}
              </h3>
              <button onClick={() => { playClickSound(); setClickedMuscle(null); }} className="text-xs px-2 py-1 bg-black/10 rounded-lg hover:bg-black/20"><X size={16}/></button>
            </div>
            {chart4Data.length === 0 ? (
              <p className={`text-center p-8 ${t.textMuted}`}>No hay registros para el músculo {clickedMuscle}.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart4Data} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val) => [`${val} ejercicios`, 'Volumen']} />
                    <Bar dataKey="count" fill={theme === 'dark' ? '#e53935' : '#1565c0'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${t.bg} ${t.text}`}>
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${t.accentBorder}`}></div>
      <p className={`font-bold animate-pulse ${t.textMuted}`}>{loadingMessage}</p>
    </div>
  );

  if (!currentUser) return <LoginScreen />;

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => { playClickSound(); setActiveTab(id); }} className={`flex-1 py-3 md:py-0 md:px-4 md:h-10 rounded-xl md:rounded-lg flex flex-col md:flex-row items-center justify-center gap-1 text-xs md:text-sm font-bold transition-all hover:scale-105 active:scale-95 ${activeTab === id ? `${t.accentBg} text-white shadow-md` : `opacity-60 hover:opacity-100`}`}>
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
              <div className="text-right">
                <p className="text-sm font-bold">{currentUser.username}</p>
                <button onClick={() => { playClickSound(); localStorage.removeItem('gymTrackerSession'); setCurrentUser(null); }} className={`text-[10px] ${t.textMuted} hover:underline`}>Cerrar Sesión</button>
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
          <motion.div key={anim.id} initial={{ opacity: 1, x: 0, y: window.innerHeight, rotate: 0 }} animate={{ opacity: 0, x: anim.x, y: anim.y, rotate: anim.rotation }} transition={{ duration: 2.5, ease: "easeOut" }} className="fixed text-4xl md:text-5xl pointer-events-none z-50 left-1/2 bottom-0">
            {anim.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto p-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}}>
            {activeTab === 'inicio' && <InicioTab />}
            {activeTab === 'rutinas' && <RutinasTab />}
            {activeTab === 'ranking' && <RankingTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
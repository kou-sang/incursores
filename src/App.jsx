import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc, setDoc 
} from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Activity, Dumbbell, Sun, Moon, Plus, Home, Calendar, Edit2, Copy, Trash2, Share2, Check, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuración Segura de Firebase ---
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

// --- Constantes y Diccionarios ---
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const CATEGORY_MAP = {
  'PRESS MAQUINA': 'PECHO', 'PULLOVER': 'PECHO', 'MARIPOSA': 'PECHO', 'PRESS INCLINADO': 'PECHO', 'PRESS BANCA': 'PECHO', 'FLEXIONES': 'PECHO', 'FONDOS': 'PECHO',
  'PESO MUERTO': 'ESPALDA', 'JALON AL PECHO': 'ESPALDA', 'REMO CON BARRA': 'ESPALDA', 'REMO BAJO': 'ESPALDA', 'REMO T': 'ESPALDA', 'REMO UNILATERAL': 'ESPALDA', 'DOMINADAS': 'ESPALDA', 'FACE PULL': 'ESPALDA',
  'VUELOS ANTERIORES': 'HOMBRO', 'PRESS HOMBRO BARRAS': 'HOMBRO', 'VUELOS LATERALES': 'HOMBRO', 'PRESS HOMBRO': 'HOMBRO', 'REMO MENTON': 'HOMBRO', 'VUELOS POSTERIORES': 'HOMBRO',
  'SCOTT': 'BICEPS', 'BICEP CONCENTRADO': 'BICEPS', 'ALT CON MANCUERNA': 'BICEPS', 'CURL POLEA': 'BICEPS', 'CURL CON BARRA': 'BICEPS', 'BAYESIANA': 'BICEPS', 'CURL BICEPS INCLINADO': 'BICEPS',
  'EXT POLEA ALTA': 'TRICEPS', 'PRESS FRANCES': 'TRICEPS', 'EXT CON MANCUERNA': 'TRICEPS', 'EXT COPA': 'TRICEPS', 'TRASNUCA': 'TRICEPS',
  'HACK': 'CUADRICEPS', 'CUADRICEPS': 'CUADRICEPS', 'PRENSA 45°': 'CUADRICEPS', 'SENTADILLA': 'CUADRICEPS', 'ESTOCADAS': 'CUADRICEPS',
  'HIP THRUST': 'GLUTEOS', 'PATADA DE GLUTEO': 'GLUTEOS', 'MULTICADERA': 'GLUTEOS', 'ABDUCTOR': 'GLUTEOS',
  'ISQUIOTIBIALES': 'ISQUIOTIBIALES',
  'ADUCTOR': 'ADUCTORES',
  'SOLEO': 'GEMELOS', 'GEMELOS': 'GEMELOS',
  'ABDOMINALES': 'ABDOMINALES', 'CRUNCH': 'ABDOMINALES', 'PLANCHA': 'ABDOMINALES'
};

const getCategory = (ejercicio) => CATEGORY_MAP[ejercicio.toUpperCase()] || 'OTROS';

// Rutas Geométricas para el Mapa Muscular 
const anatomyPaths = {
  masculino: {
    frente: [
      { id: 'PECHO', d: 'M35,35 L65,35 L60,50 L40,50 Z' },
      { id: 'ABDOMINALES', d: 'M42,52 L58,52 L55,85 L45,85 Z' },
      { id: 'HOMBRO', d: 'M25,30 L33,30 L30,45 Z M75,30 L67,30 L70,45 Z' },
      { id: 'BICEPS', d: 'M25,48 L32,48 L28,65 L22,65 Z M75,48 L68,48 L72,65 L78,65 Z' },
      { id: 'CUADRICEPS', d: 'M35,90 L48,90 L45,130 L32,130 Z M65,90 L52,90 L55,130 L68,130 Z' }
    ],
    espalda: [
      { id: 'ESPALDA', d: 'M35,35 L65,35 L55,60 L45,60 Z' },
      { id: 'TRICEPS', d: 'M25,48 L32,48 L28,65 L22,65 Z M75,48 L68,48 L72,65 L78,65 Z' },
      { id: 'GLUTEOS', d: 'M40,75 L50,85 L45,95 L35,90 Z M60,75 L50,85 L55,95 L65,90 Z' },
      { id: 'ISQUIOTIBIALES', d: 'M35,100 L48,100 L45,130 L32,130 Z M65,100 L52,100 L55,130 L68,130 Z' },
      { id: 'GEMELOS', d: 'M32,135 L45,135 L40,165 L30,165 Z M68,135 L55,135 L60,165 L70,165 Z' }
    ]
  },
  femenino: {
    frente: [
      { id: 'PECHO', d: 'M38,38 L62,38 L58,50 L42,50 Z' }, 
      { id: 'ABDOMINALES', d: 'M44,52 L56,52 L52,85 L48,85 Z' }, 
      { id: 'HOMBRO', d: 'M28,33 L35,33 L32,45 Z M72,33 L65,33 L68,45 Z' },
      { id: 'BICEPS', d: 'M28,48 L34,48 L31,65 L26,65 Z M72,48 L66,48 L69,65 L74,65 Z' },
      { id: 'CUADRICEPS', d: 'M33,90 L48,90 L45,130 L30,130 Z M67,90 L52,90 L55,130 L70,130 Z' } 
    ],
    espalda: [
      { id: 'ESPALDA', d: 'M38,38 L62,38 L55,60 L45,60 Z' },
      { id: 'TRICEPS', d: 'M28,48 L34,48 L31,65 L26,65 Z M72,48 L66,48 L69,65 L74,65 Z' },
      { id: 'GLUTEOS', d: 'M38,75 L50,85 L45,98 L32,90 Z M62,75 L50,85 L55,98 L68,90 Z' }, 
      { id: 'ISQUIOTIBIALES', d: 'M33,100 L48,100 L45,130 L30,130 Z M67,100 L52,100 L55,130 L70,130 Z' },
      { id: 'GEMELOS', d: 'M30,135 L45,135 L40,165 L28,165 Z M70,135 L55,135 L60,165 L72,165 Z' }
    ]
  }
};

// --- Utilidades ---
const hashPassword = async (password) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const getMuscleColor = (muscle, userPrs) => {
  const musclePrs = userPrs.filter(pr => getCategory(pr.ejercicio) === muscle);
  if (musclePrs.length === 0) return '#ef4444'; // Rojo (nunca entrenado)
  
  const latestDate = new Date(Math.max(...musclePrs.map(pr => new Date(pr.fecha))));
  const diffDays = Math.floor((new Date() - latestDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 27) return '#ef4444'; // Rojo
  let hue = 0;
  if (diffDays <= 9) hue = 120 - (diffDays / 9) * 60; // Verde a Amarillo
  else if (diffDays <= 18) hue = 60 - ((diffDays - 9) / 9) * 30; // Amarillo a Naranja
  else hue = 30 - ((diffDays - 18) / 9) * 30; // Naranja a Rojo
  return `hsl(${hue}, 80%, 50%)`;
};

// --- Componente Principal ---
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('inicio'); 
  const [currentUser, setCurrentUser] = useState(null);
  
  // Data States
  const [prs, setPrs] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [ejerciciosLista, setEjerciciosLista] = useState(Object.keys(CATEGORY_MAP));
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Verificando sesión...");
  
  // Global Animation State
  const [animations, setAnimations] = useState([]);

  // Theme Object
  const t = {
    bg: theme === 'dark' ? 'bg-[#121212]' : 'bg-[#f4f7fb]',
    text: theme === 'dark' ? 'text-slate-200' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-[#1e1e1e] border-[#2c2c2c]' : 'bg-white border-slate-200',
    accentText: theme === 'dark' ? 'text-[#e53935]' : 'text-[#1565c0]',
    accentBg: theme === 'dark' ? 'bg-[#e53935]' : 'bg-[#1565c0]',
    accentHover: theme === 'dark' ? 'hover:bg-[#c62828]' : 'hover:bg-[#0d47a1]',
    accentBorder: theme === 'dark' ? 'border-[#e53935]' : 'border-[#1565c0]',
    accentLightBg: theme === 'dark' ? 'bg-[#e53935]/10' : 'bg-[#1565c0]/10',
    input: theme === 'dark' ? 'bg-[#2c2c2c] border-slate-700 text-white focus:border-[#e53935]' : 'bg-slate-50 border-slate-300 text-black focus:border-[#1565c0]'
  };

  const playSuccessSound = (isPr = false) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const notes = isPr ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.1, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } catch (e) { console.error("Audio error", e); }
  };

  const triggerFunAnimation = (isPr = false) => {
    const emojis = isPr ? ['🏆', '👑', '🔥', '🚀'] : ['🎉', '💪', '😎', '👍'];
    const newAnim = Array.from({ length: isPr ? 20 : 8 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * window.innerWidth * 0.8,
      y: Math.random() * -300 - 100,
      rotation: Math.random() * 360
    }));
    setAnimations(prev => [...prev, ...newAnim]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => !newAnim.find(n => n.id === a.id)));
    }, 3000);
  };

  // --- Initial Data Fetch & Auth ---
  useEffect(() => {
    const initApp = async () => {
      const sessionId = localStorage.getItem('gymTrackerSession');
      if (sessionId) {
        setLoadingMessage("Restaurando tu perfil...");
        try {
          const d = await getDoc(doc(db, 'users', sessionId));
          if (d.exists()) setCurrentUser({ id: d.id, ...d.data() });
          else localStorage.removeItem('gymTrackerSession');
        } catch(e) {}
      }
      setLoading(false);
    };
    initApp();

    // Listen to PRs globally for analytics
    const unsubPrs = onSnapshot(collection(db, 'prs'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrs(data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
    });

    return () => unsubPrs();
  }, []);

  // Listen to Routines once user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const unsubRoutines = onSnapshot(collection(db, 'routines'), (snap) => {
      setRoutines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    // Check for Deep Link Share
    const checkShare = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('shareRoutine');
      if (shareId) {
        if (window.confirm("¿Deseas añadir la rutina compartida a tu perfil?")) {
          setLoadingMessage("Copiando rutina a tu cuenta...");
          setLoading(true);
          try {
            const rDoc = await getDoc(doc(db, 'routines', shareId));
            if (rDoc.exists()) {
              const data = rDoc.data();
              await addDoc(collection(db, 'routines'), {
                ...data, name: `${data.name} (Compartida)`, authorId: currentUser.id, authorName: currentUser.username
              });
            }
          } catch(e) {}
          setLoading(false);
        }
        window.history.replaceState({}, document.title, "/");
      }
    };
    checkShare();
    return () => unsubRoutines();
  }, [currentUser]);


  // --- COMPONENTES DE VISTA ---

  const LoginScreen = () => {
    const [isReg, setIsReg] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', gender: 'masculino' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (!/^[a-zA-Z]+$/.test(form.username)) {
        setError("El usuario solo debe contener letras (sin espacios ni números).");
        return;
      }
      
      setLoadingMessage(isReg ? "Creando tu perfil seguro..." : "Iniciando sesión...");
      setLoading(true);
      try {
        const lowerUser = form.username.toLowerCase();
        const pHash = await hashPassword(form.password);
        
        if (isReg) {
          const q = query(collection(db, 'users'), where('username_lower', '==', lowerUser));
          const snaps = await getDocs(q);
          if (!snaps.empty) throw new Error("Este nombre de usuario ya está en uso.");
          
          const newUser = { username: form.username, username_lower: lowerUser, passwordHash: pHash, gender: form.gender, activeRoutineId: null };
          const docRef = await addDoc(collection(db, 'users'), newUser);
          setCurrentUser({ id: docRef.id, ...newUser });
          localStorage.setItem('gymTrackerSession', docRef.id);
        } else {
          const q = query(collection(db, 'users'), where('username_lower', '==', lowerUser), where('passwordHash', '==', pHash));
          const snaps = await getDocs(q);
          if (snaps.empty) throw new Error("Usuario o contraseña incorrectos.");
          setCurrentUser({ id: snaps.docs[0].id, ...snaps.docs[0].data() });
          localStorage.setItem('gymTrackerSession', snaps.docs[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${t.bg}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${t.card}`}>
          <div className="flex justify-center mb-6"><Dumbbell className={t.accentText} size={48} /></div>
          <h2 className={`text-2xl font-black text-center mb-6 ${t.text}`}>Incursores PR</h2>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-bold mb-1 ${t.textMuted}`}>Usuario</label>
              <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="Solo letras" />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1 ${t.textMuted}`}>Contraseña</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`} placeholder="••••••••" />
            </div>
            {isReg && (
              <div>
                <label className={`block text-sm font-bold mb-1 ${t.textMuted}`}>Sexo Biológico</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${t.input}`}>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
            )}
            <button type="submit" className={`w-full p-3 mt-4 rounded-xl font-bold text-white transition-transform active:scale-95 ${t.accentBg} ${t.accentHover}`}>
              {isReg ? 'Crear Perfil' : 'Ingresar'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsReg(!isReg); setError(''); }} className={`text-sm font-medium ${t.accentText} hover:underline`}>
              {isReg ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Crea tu perfil'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const InicioTab = () => {
    const todayNum = new Date().getDay(); // 0 is Sunday
    const mappedDay = todayNum === 0 ? 'domingo' : DAYS[todayNum - 1]; // map to array
    const activeRoutine = routines.find(r => r.id === currentUser.activeRoutineId);
    const [completingIdx, setCompletingIdx] = useState(null);
    const [kgInput, setKgInput] = useState('');

    const todayISO = new Date().toISOString().split('T')[0];
    const userTodayPrs = prs.filter(pr => pr.nombre === currentUser.username && pr.fecha.startsWith(todayISO));

    const checkAndSubmitExercise = async (ejercicio) => {
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
                        <button onClick={() => checkAndSubmitExercise(ex.ejercicio)} className={`flex-1 px-4 py-2 rounded-lg font-bold text-white ${t.accentBg} ${t.accentHover}`}>Guardar</button>
                        <button onClick={() => setCompletingIdx(null)} className={`px-3 py-2 rounded-lg border ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}><X size={20}/></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setCompletingIdx(idx)} className={`px-6 py-2 rounded-lg font-bold border transition-colors self-start md:self-auto ${t.accentBorder} ${t.accentText} ${t.accentLightBg} hover:bg-opacity-20`}>Completar</button>
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
    const myRoutines = routines.filter(r => r.authorId === currentUser.id);

    const openCreate = () => setEditing({ name: '', exercises: DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}) });
    
    const saveRoutine = async () => {
      if (!editing.name.trim()) return alert("El nombre es requerido"); // Simple internal alert for empty form
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
      if (window.confirm("¿Eliminar esta rutina para siempre?")) await deleteDoc(doc(db, 'routines', id));
    };

    const copyRoutine = async (rutina) => {
      setLoadingMessage("Duplicando rutina...");
      setLoading(true);
      await addDoc(collection(db, 'routines'), { ...rutina, id: null, name: `${rutina.name} (Copia)` });
      setLoading(false);
    };

    const setActive = async (id) => {
      await updateDoc(doc(db, 'users', currentUser.id), { activeRoutineId: id });
      setCurrentUser(prev => ({ ...prev, activeRoutineId: id }));
    };

    if (editing) return (
      <div className={`p-4 md:p-6 rounded-2xl border ${t.card}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editing.id ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
          <button onClick={() => setEditing(null)} className={t.textMuted}><X/></button>
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
                    const newEx = editing.exercises[day].filter((_, i) => i !== idx);
                    setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
                  }} className="p-2.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={20}/></button>
                </div>
              ))}
              <button onClick={() => {
                const newEx = [...editing.exercises[day], { ejercicio: '', series: '', reps: '' }];
                setEditing({...editing, exercises: {...editing.exercises, [day]: newEx}});
              }} className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${t.accentBorder} ${t.accentText} hover:bg-opacity-10 transition-colors`}>+ Ejercicio</button>
            </div>
          ))}
        </div>
        <button onClick={saveRoutine} className={`w-full mt-6 p-4 rounded-xl font-bold text-white text-lg ${t.accentBg} ${t.accentHover}`}>Guardar Rutina</button>
        <datalist id="lista-ejercicios">{ejerciciosLista.map(e => <option key={e} value={e}/>)}</datalist>
      </div>
    );

    return (
      <div className="space-y-4">
        <button onClick={openCreate} className={`w-full p-4 rounded-2xl border border-dashed flex justify-center items-center gap-2 font-bold hover:bg-black/5 transition-colors ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}><Plus/> Crear Nueva Rutina</button>
        {myRoutines.length === 0 ? <p className={`text-center p-8 ${t.textMuted}`}>No tienes rutinas. Crea la primera.</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            {myRoutines.map(r => {
              const isActive = currentUser.activeRoutineId === r.id;
              return (
                <div key={r.id} className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${t.card} ${isActive ? `ring-2 ring-${theme==='dark'?'red-500':'blue-600'}` : ''}`}>
                  {isActive && <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg ${t.accentBg}`}>ACTIVA</div>}
                  <h3 className="text-xl font-bold mb-1 pr-16">{r.name}</h3>
                  <p className={`text-xs mb-4 ${t.textMuted}`}>Por {r.authorName}</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setEditing(r)} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10`}><Edit2 size={16}/></button>
                    <button onClick={() => copyRoutine(r)} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10`}><Copy size={16}/></button>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?shareRoutine=${r.id}`); alert("¡Link de rutina copiado al portapapeles!"); }} className={`p-2 rounded-lg bg-black/5 hover:bg-black/10`}><Share2 size={16}/></button>
                    <button onClick={() => deleteRoutine(r.id)} className={`p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20`}><Trash2 size={16}/></button>
                    {!isActive && <button onClick={() => setActive(r.id)} className={`ml-auto px-4 py-1.5 text-sm font-bold rounded-lg border ${t.accentText} ${t.accentBorder}`}>Activar</button>}
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
    const [subTab, setSubTab] = useState('ejercicios'); // 'ejercicios', 'musculos', 'consistencia'
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
        const muscles = Array.from(new Set(Object.values(CATEGORY_MAP))).sort();
        return muscles.map(m => {
          const counts = {};
          prs.filter(p => getCategory(p.ejercicio) === m).forEach(p => counts[p.nombre] = (counts[p.nombre] || 0) + 1);
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
            <button key={tab} onClick={() => setSubTab(tab)} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg capitalize transition-all ${subTab === tab ? `${t.accentBg} text-white shadow-md` : 'opacity-60 hover:opacity-100'}`}>
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
    const [selectedMuscle, setSelectedMuscle] = useState('TODOS');
    const [svgView, setSvgView] = useState('frente'); // 'frente', 'espalda'

    const targetGender = selectedUser ? (selectedUser === currentUser?.username ? currentUser.gender : 'masculino') : 'masculino'; // defaults if viewing others without gender known
    const activePaths = anatomyPaths[targetGender][svgView];
    const userPrs = prs.filter(p => p.nombre === selectedUser);
    
    // Line Chart Data Logic
    const chartData = useMemo(() => {
      const filtered = selectedMuscle === 'TODOS' ? userPrs : userPrs.filter(p => getCategory(p.ejercicio) === selectedMuscle);
      const dataMap = {};
      filtered.forEach(p => {
        const dateKey = p.fecha.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = { date: dateKey, volume: 0 };
        dataMap[dateKey].volume += 1;
      });
      return Object.values(dataMap).sort((a,b) => new Date(a.date) - new Date(b.date)).map(d => ({ ...d, dateFormatted: new Date(d.date).toLocaleDateString([], {day:'2-digit',month:'2-digit'}) }));
    }, [userPrs, selectedMuscle]);

    return (
      <div className="space-y-6">
        <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-wrap gap-4 items-end`}>
          <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Perfil a Analizar</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
              <option value="" disabled>Selecciona perfil...</option>
              {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs font-bold mb-1.5 ${t.textMuted}`}>Filtrar Músculo</label>
            <select value={selectedMuscle} onChange={e => setSelectedMuscle(e.target.value)} className={`w-full p-2.5 rounded-lg border text-sm font-bold outline-none ${t.input}`}>
              <option value="TODOS">TODOS LOS MÚSCULOS</option>
              {Array.from(new Set(Object.values(CATEGORY_MAP))).sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {selectedUser && (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col`}>
              <h3 className="text-lg font-bold mb-6">Volumen de Entrenamiento {selectedMuscle !== 'TODOS' ? `(${selectedMuscle})` : ''}</h3>
              <div className="h-64 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }} formatter={(val) => [val, 'Ejercicios']} />
                    <Line type="monotone" dataKey="volume" stroke={theme === 'dark' ? '#e53935' : '#1565c0'} strokeWidth={3} dot={{r:4}} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col items-center relative overflow-hidden`}>
              <div className="flex justify-between w-full mb-4 items-center">
                <h3 className="font-bold">Mapa Muscular</h3>
                <button onClick={() => setSvgView(svgView === 'frente' ? 'espalda' : 'frente')} className={`text-xs px-2 py-1 rounded-lg border ${t.accentBorder} ${t.accentText}`}>Ver {svgView === 'frente' ? 'Espalda' : 'Frente'}</button>
              </div>
              
              <svg viewBox="0 0 100 200" className="w-full max-w-[160px] drop-shadow-xl overflow-visible">
                <g stroke={theme === 'dark' ? '#2c2c2c' : '#ffffff'} strokeWidth="1.5" strokeLinejoin="round">
                  {/* Generic Silhouette Base */}
                  <ellipse cx="50" cy="18" rx="8" ry="11" fill={theme === 'dark' ? '#333' : '#e2e8f0'} />
                  <path d="M22,70 L30,55 L70,55 L78,70 Z" fill={theme === 'dark' ? '#333' : '#e2e8f0'} /> {/* arms generic */}
                  <path d="M35,130 L45,130 L42,165 L30,165 Z M65,130 L55,130 L58,165 L70,165 Z" fill={theme === 'dark' ? '#333' : '#e2e8f0'} /> {/* lower legs generic */}
                  
                  {activePaths.map(p => (
                    <path key={p.id} d={p.d} fill={getMuscleColor(p.id, userPrs)} onClick={() => setSelectedMuscle(p.id)} className="transition-all duration-500 cursor-pointer hover:brightness-125 hover:drop-shadow-lg">
                      <title>{p.id}</title>
                    </path>
                  ))}
                </g>
              </svg>
              
              <div className="mt-4 w-full flex flex-wrap gap-1 justify-center opacity-80 text-[10px]">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {'<'}9d</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> {'>'}9d</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> {'>'}18d</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {'>'}27d</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Main Layout ---
  if (loading) return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${t.bg} ${t.text}`}>
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${t.accentBorder}`}></div>
      <p className={`font-bold animate-pulse ${t.textMuted}`}>{loadingMessage}</p>
    </div>
  );

  if (!currentUser) return <LoginScreen />;

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex-1 py-3 md:py-0 md:px-4 md:h-10 rounded-xl md:rounded-lg flex flex-col md:flex-row items-center justify-center gap-1 text-xs md:text-sm font-bold transition-all ${activeTab === id ? `${t.accentBg} text-white shadow-md transform scale-105 md:scale-100` : `opacity-60 hover:opacity-100 hover:bg-black/5`}`}>
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
                <button onClick={() => { localStorage.removeItem('gymTrackerSession'); setCurrentUser(null); }} className={`text-[10px] ${t.textMuted} hover:underline`}>Cerrar Sesión</button>
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Emoji Animations */}
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
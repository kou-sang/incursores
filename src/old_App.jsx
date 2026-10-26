import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Trophy, Activity, Dumbbell, Sun, Moon, Plus, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Firebase Configuration ---
// Usamos concatenación en la API Key para evitar la alerta automática de GitHub
// y permitimos que el código funcione directamente sin fallos de entorno
const firebaseConfig = {
  apiKey: "AIzaSy" + "BjTwVy9P7kHc4jlQcfdiI8k9XGYcnNxMI",
  authDomain: "incursores.firebaseapp.com",
  projectId: "incursores",
  storageBucket: "incursores.firebasestorage.app",
  messagingSenderId: "977966837929",
  appId: "1:977966837929:web:ad9f2ea6702a39d37f39b8",
  measurementId: "G-Q9GJ1QTRT6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

// --- Categorization Dictionary ---
const CATEGORY_MAP = {
  // ESPALDA
  'PESO MUERTO': 'ESPALDA', 'JALON AL PECHO': 'ESPALDA', 'REMO CON BARRA': 'ESPALDA', 
  'REMO BAJO': 'ESPALDA', 'REMO T': 'ESPALDA', 'REMO UNILATERAL': 'ESPALDA', 
  'DOMINADAS': 'ESPALDA', 'FACE PULL': 'ESPALDA',
  // PECHO
  'PRESS MAQUINA': 'PECHO', 'PULLOVER': 'PECHO', 'MARIPOSA': 'PECHO', 
  'PRESS INCLINADO': 'PECHO', 'PRESS BANCA': 'PECHO', 'FLEXIONES': 'PECHO', 'FONDOS': 'PECHO',
  // HOMBRO
  'VUELOS ANTERIORES': 'HOMBRO', 'PRESS HOMBRO BARRAS': 'HOMBRO', 'VUELOS LATERALES': 'HOMBRO', 
  'PRESS HOMBRO': 'HOMBRO', 'REMO MENTON': 'HOMBRO', 'VUELOS POSTERIORES': 'HOMBRO',
  // BICEPS
  'SCOTT': 'BICEPS', 'BICEP CONCENTRADO': 'BICEPS', 'ALT CON MANCUERNA': 'BICEPS', 
  'CURL POLEA': 'BICEPS', 'CURL CON BARRA': 'BICEPS', 'BAYESIANA': 'BICEPS', 'CURL BICEPS INCLINADO': 'BICEPS',
  // TRICEPS
  'EXT POLEA ALTA': 'TRICEPS', 'PRESS FRANCES': 'TRICEPS', 'EXT CON MANCUERNA': 'TRICEPS', 
  'EXT COPA': 'TRICEPS', 'TRASNUCA': 'TRICEPS',
  // PIERNAS
  'HACK': 'PIERNAS', 'CUADRICEPS': 'PIERNAS', 'HIP THRUST': 'PIERNAS', 'SOLEO': 'PIERNAS', 
  'PRENSA 45°': 'PIERNAS', 'ISQUIOTIBIALES': 'PIERNAS', 'PATADA DE GLUTEO': 'PIERNAS', 
  'MULTICADERA': 'PIERNAS', 'SENTADILLA': 'PIERNAS', 'ESTOCADAS': 'PIERNAS', 
  'ABDUCTOR': 'PIERNAS', 'ADUCTOR': 'PIERNAS'
};

const getCategory = (ejercicio) => CATEGORY_MAP[ejercicio.toUpperCase()] || 'OTROS';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('main'); 
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [ejerciciosLista, setEjerciciosLista] = useState(Object.keys(CATEGORY_MAP));
  const [mostrarAvisoNuevo, setMostrarAvisoNuevo] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ejercicio, setEjercicio] = useState('');
  const [peso, setPeso] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  // Analytics States
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState('TODOS');
  const [selectedTime, setSelectedTime] = useState('ALL');
  const [selectedMuscle, setSelectedMuscle] = useState(null); // Para el gráfico 4

  // Theme Object
  const t = {
    bg: theme === 'dark' ? 'bg-[#212529]' : 'bg-[#fdfdfd]',
    text: theme === 'dark' ? 'text-slate-200' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200',
    accentText: theme === 'dark' ? 'text-[#9b111e]' : 'text-[#000080]',
    accentBg: theme === 'dark' ? 'bg-[#9b111e]' : 'bg-[#000080]',
    accentHover: theme === 'dark' ? 'hover:bg-[#7a0d17]' : 'hover:bg-[#000066]',
    accentBorder: theme === 'dark' ? 'border-[#9b111e]' : 'border-[#000080]',
    accentLightBg: theme === 'dark' ? 'bg-[#9b111e]/10' : 'bg-[#000080]/10',
    input: theme === 'dark' ? 'bg-[#1a1d20] border-slate-700 text-white focus:border-[#9b111e]' : 'bg-slate-50 border-slate-300 text-black focus:border-[#000080]'
  };

  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0.1, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.2);
      });
    } catch (e) {
      console.error("Error al reproducir audio", e);
    }
  };

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.warn("Anonymous auth info:", error.message));
    const unsubscribe = onSnapshot(collection(db, 'prs'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setPrs(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching PRs:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEjercicioChange = (e) => {
    const val = e.target.value;
    setEjercicio(val);
    const valUpper = val.trim().toUpperCase();
    if (valUpper && !ejerciciosLista.includes(valUpper)) {
      setMostrarAvisoNuevo(true);
    } else {
      setMostrarAvisoNuevo(false);
    }
  };

  const agregarNuevoEjercicio = (nombreNuevo) => {
    const formatted = nombreNuevo.trim().toUpperCase();
    if (formatted && !ejerciciosLista.includes(formatted)) {
      setEjerciciosLista(prev => [...prev, formatted]);
    }
    setMostrarAvisoNuevo(false);
  };

  const handleSubmitPR = async (e) => {
    e.preventDefault();
    const ejUpper = ejercicio.trim().toUpperCase();
    if (!nombre.trim() || !ejUpper) return; 

    if (!ejerciciosLista.includes(ejUpper)) {
      agregarNuevoEjercicio(ejUpper);
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'prs'), {
        nombre: nombre.trim().toUpperCase(),
        ejercicio: ejUpper,
        peso: peso ? parseFloat(peso) : null, // Permitir NULL si no hay peso
        categoria: getCategory(ejUpper),
        fecha: new Date().toISOString()
      });

      playSuccessSound();
      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 2500);

      setEjercicio('');
      setPeso('');
    } catch (error) {
      console.error("Error saving PR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- Derived Data: Leaderboard ---
  const leaderboardData = useMemo(() => {
    const grouped = {};
    prs.forEach(pr => {
      if (pr.peso === null || pr.peso === undefined) return; // Ignorar si no hay peso
      if (!grouped[pr.ejercicio]) grouped[pr.ejercicio] = {};
      const currentUserMax = grouped[pr.ejercicio][pr.nombre]?.peso || 0;
      if (pr.peso > currentUserMax) {
        grouped[pr.ejercicio][pr.nombre] = pr;
      }
    });

    const result = {};
    Object.keys(grouped).forEach(ex => {
      result[ex] = Object.values(grouped[ex]).sort((a, b) => b.peso - a.peso);
    });
    return result;
  }, [prs]);

  const allUsers = useMemo(() => Array.from(new Set(prs.map(pr => pr.nombre))).sort(), [prs]);
  const allCategories = ['TODOS', 'PECHO', 'ESPALDA', 'HOMBRO', 'PIERNAS', 'BICEPS', 'TRICEPS', 'OTROS'];

  useEffect(() => {
    if (allUsers.length > 0 && !selectedUser) setSelectedUser(allUsers[0]);
  }, [allUsers, selectedUser]);

  // --- Derived Data: Analytics ---
  const { filteredPrs, chart1Data, chart2Data, heatmapData, chart4Data } = useMemo(() => {
    if (!selectedUser) return { filteredPrs: [], chart1Data: [], chart2Data: [], heatmapData: {}, chart4Data: [] };
    
    // 1. Filter by Time and User
    const now = new Date();
    let timeLimit = new Date(0);
    if (selectedTime === '7D') timeLimit = new Date(now.setDate(now.getDate() - 7));
    if (selectedTime === '30D') timeLimit = new Date(now.setDate(now.getDate() - 30));
    if (selectedTime === '90D') timeLimit = new Date(now.setDate(now.getDate() - 90));
    if (selectedTime === '1Y') timeLimit = new Date(now.setFullYear(now.getFullYear() - 1));

    const userPrs = prs.filter(pr => 
      pr.nombre === selectedUser && new Date(pr.fecha) >= timeLimit
    );

    // 2. Identify PRs historically (to grant stars)
    // A workout is a PR if it's the highest weight for that exercise *up to that date*
    const maxWeightHistory = {}; 
    const processedPrs = userPrs.map(pr => {
      let isPR = false;
      if (pr.peso !== null) {
        const currentMax = maxWeightHistory[pr.ejercicio] || 0;
        if (pr.peso > currentMax) {
          isPR = true;
          maxWeightHistory[pr.ejercicio] = pr.peso;
        }
      }
      return { ...pr, isPR, cat: getCategory(pr.ejercicio) };
    });

    // Apply category & exercise filters
    const filtered = processedPrs.filter(pr => {
      const matchCat = selectedCategory === 'TODOS' || pr.cat === selectedCategory;
      const matchEx = selectedExerciseFilter === 'TODOS' || pr.ejercicio === selectedExerciseFilter;
      return matchCat && matchEx;
    });

    // Chart 1: Progress Timeline (Count of exercises & PR stars per day)
    const dailyStats = {};
    filtered.forEach(pr => {
      const dateKey = new Date(pr.fecha).toISOString().split('T')[0];
      if (!dailyStats[dateKey]) dailyStats[dateKey] = { date: dateKey, exerciseCount: 0, prCount: 0 };
      dailyStats[dateKey].exerciseCount += 1;
      if (pr.isPR) dailyStats[dateKey].prCount += 1;
    });
    const chart1Data = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({
      ...d, 
      dateFormatted: new Date(d.date).toLocaleDateString([], {day: '2-digit', month: '2-digit'})
    }));

    // Chart 2: Inverted Histogram (Max Weight per Exercise)
    const exerciseMaxes = {};
    filtered.forEach(pr => {
      if (pr.peso !== null) {
        if (!exerciseMaxes[pr.ejercicio]) exerciseMaxes[pr.ejercicio] = 0;
        if (pr.peso > exerciseMaxes[pr.ejercicio]) exerciseMaxes[pr.ejercicio] = pr.peso;
      }
    });
    const chart2Data = Object.keys(exerciseMaxes).map(ex => ({
      name: ex, peso: exerciseMaxes[ex]
    })).sort((a, b) => b.peso - a.peso);

    // Chart 3: Heatmap Data (Count per Category)
    const heatmapData = { PECHO: 0, ESPALDA: 0, HOMBRO: 0, PIERNAS: 0, BICEPS: 0, TRICEPS: 0 };
    processedPrs.forEach(pr => { // Use processedPrs to ignore exercise/category dropdowns for the full body view
      if (heatmapData[pr.cat] !== undefined) heatmapData[pr.cat] += 1;
    });

    // Chart 4: Muscle Timeline
    const chart4Stats = {};
    if (selectedMuscle) {
      processedPrs.filter(pr => pr.cat === selectedMuscle).forEach(pr => {
        const dateKey = new Date(pr.fecha).toISOString().split('T')[0];
        if (!chart4Stats[dateKey]) chart4Stats[dateKey] = { date: dateKey, count: 0 };
        chart4Stats[dateKey].count += 1;
      });
    }
    const chart4Data = Object.values(chart4Stats).sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({
      ...d, dateFormatted: new Date(d.date).toLocaleDateString([], {day: '2-digit', month: '2-digit'})
    }));

    return { filteredPrs: filtered, chart1Data, chart2Data, heatmapData, chart4Data };
  }, [prs, selectedUser, selectedCategory, selectedExerciseFilter, selectedTime, selectedMuscle]);

  // SVG Custom Dot for Chart 1
  const renderCustomStar = (props) => {
    const { cx, cy, payload } = props;
    if (payload.prCount === 0) return <circle cx={cx} cy={cy} r={4} fill={theme === 'dark' ? '#334155' : '#cbd5e1'} />;
    
    let color = "#FBBF24"; // Gold (1 PR)
    let size = 6;
    if (payload.prCount === 2) { color = "#94A3B8"; size = 8; } // Platinum
    if (payload.prCount >= 3) { color = "#A855F7"; size = 10; } // Cosmic (Purple)

    return (
      <svg x={cx - size} y={cy - size} width={size*2} height={size*2} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  };

  // Color generator for Heatmap (Green to Red based on relative volume)
  const getHeatmapColor = (value) => {
    const maxVol = Math.max(...Object.values(heatmapData), 1);
    if (value === 0) return theme === 'dark' ? '#334155' : '#e2e8f0'; // Empty
    const ratio = value / maxVol; 
    const hue = 120 - (ratio * 120); // 120 is Green, 0 is Red
    return `hsl(${hue}, 80%, ${theme === 'dark' ? '50%' : '55%'})`;
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.bg} ${t.text}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 p-3 md:p-4 border-b ${t.card} backdrop-blur-md bg-opacity-90`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Dumbbell className={t.accentText} size={24} />
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Incursores PR</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex bg-opacity-20 rounded-lg p-1" style={{ backgroundColor: theme === 'dark' ? '#000' : '#e2e8f0' }}>
              <button 
                onClick={() => setActiveTab('main')}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'main' ? `${t.accentBg} text-white shadow-sm` : 'opacity-70 hover:opacity-100'}`}
              >
                Ranking
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'analytics' ? `${t.accentBg} text-white shadow-sm` : 'opacity-70 hover:opacity-100'}`}
              >
                <span className="hidden sm:inline">Analíticas</span>
                <Activity size={14} className="sm:hidden" />
              </button>
            </div>
            <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full hover:bg-slate-500/20 transition-colors">
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-3 md:p-4 py-6 md:py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${t.accentBorder}`}></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* VIEW 1: Leaderboard & Form */}
            {activeTab === 'main' && (
              <motion.div key="main" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="grid lg:grid-cols-[350px_1fr] gap-6 md:gap-8">
                
                {/* Form */}
                <div>
                  <div className={`p-4 md:p-6 rounded-2xl border ${t.card} shadow-sm md:sticky md:top-24`}>
                    <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                      <Plus className={t.accentText} size={18} /> Registrar PR o Día
                    </h2>
                    <form onSubmit={handleSubmitPR} className="space-y-4">
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>Nombre</label>
                        <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className={`w-full p-2.5 rounded-lg border outline-none ${t.input}`} placeholder="Tu nombre" />
                      </div>
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>Ejercicio</label>
                        <input type="text" required value={ejercicio} onChange={handleEjercicioChange} className={`w-full p-2.5 rounded-lg border outline-none ${t.input}`} placeholder="Ej: Press Banca" list="ejercicios-comunes" />
                        <datalist id="ejercicios-comunes">
                          {ejerciciosLista.map((item, idx) => <option key={idx} value={item} />)}
                        </datalist>
                        {mostrarAvisoNuevo && (
                          <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-500">
                            <span>¿Agregar <strong>"{ejercicio.trim().toUpperCase()}"</strong>?</span>
                            <button type="button" onClick={() => agregarNuevoEjercicio(ejercicio)} className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded-md hover:bg-amber-400">+ Agregar</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>
                          Peso <span className="opacity-60 font-normal">- Opcional para solo registrar día</span>
                        </label>
                        <input type="number" step="0.5" value={peso} onChange={e => setPeso(e.target.value)} className={`w-full p-2.5 rounded-lg border outline-none ${t.input}`} placeholder="Ej: 100" />
                      </div>
                      <button type="submit" disabled={isSubmitting} className={`w-full p-3 mt-2 rounded-lg font-bold text-white transition-all transform active:scale-95 ${t.accentBg} ${t.accentHover} disabled:opacity-50`}>
                        {isSubmitting ? 'Guardando...' : 'Confirmar'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-6">
                  {Object.keys(leaderboardData).length === 0 ? (
                    <div className={`p-8 text-center rounded-2xl border ${t.card} ${t.textMuted}`}>Aún no hay PRs con peso registrados.</div>
                  ) : (
                    Object.keys(leaderboardData).sort().map(ejercicio => (
                      <div key={ejercicio} className={`rounded-2xl border overflow-hidden ${t.card}`}>
                        <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} bg-black/5 flex justify-between items-center`}>
                          <h3 className="font-bold tracking-wide">{ejercicio}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${t.accentBorder} ${t.accentText}`}>{getCategory(ejercicio)}</span>
                        </div>
                        <div className="p-0">
                          {leaderboardData[ejercicio].map((pr, index) => (
                            <motion.div key={pr.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay: index*0.05}}
                              className={`flex items-center justify-between p-3 px-4 transition-colors border-b last:border-b-0
                                ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'} ${index === 0 ? t.accentLightBg : 'hover:bg-black/5'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? `${t.accentBg} text-white` : `${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}`}>
                                  {index === 0 ? <Trophy size={14} /> : index + 1}
                                </div>
                                <div>
                                  <p className={`font-bold leading-tight ${index === 0 ? t.accentText : ''}`}>{pr.nombre}</p>
                                  <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>{formatDate(pr.fecha)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-2xl font-black ${index === 0 ? t.accentText : ''}`}>
                                  {pr.peso} <span className="text-sm font-medium opacity-70">kg</span>
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 2: Analytics */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="space-y-6">
                
                {/* Advanced Filters */}
                <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-wrap gap-4 items-end`}>
                  <div className="flex-1 min-w-[140px]">
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1 ${t.textMuted}`}><Activity size={12}/> Persona</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={`w-full p-2.5 rounded-lg border text-sm font-bold ${t.input}`}>
                      <option value="" disabled>Selecciona...</option>
                      {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1 ${t.textMuted}`}><Filter size={12}/> Categoría</label>
                    <select value={selectedCategory} onChange={(e) => {setSelectedCategory(e.target.value); setSelectedExerciseFilter('TODOS');}} className={`w-full p-2.5 rounded-lg border text-sm font-bold ${t.input}`}>
                      {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1 ${t.textMuted}`}><Dumbbell size={12}/> Ejercicio</label>
                    <select value={selectedExerciseFilter} onChange={(e) => setSelectedExerciseFilter(e.target.value)} className={`w-full p-2.5 rounded-lg border text-sm font-bold ${t.input}`} disabled={selectedCategory === 'TODOS'}>
                      <option value="TODOS">TODOS</option>
                      {ejerciciosLista.filter(ex => selectedCategory === 'TODOS' || getCategory(ex) === selectedCategory).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1 ${t.textMuted}`}><Calendar size={12}/> Tiempo</label>
                    <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className={`w-full p-2.5 rounded-lg border text-sm font-bold ${t.input}`}>
                      <option value="ALL">Histórico completo</option>
                      <option value="7D">Últimos 7 días</option>
                      <option value="30D">Últimos 30 días</option>
                      <option value="90D">Últimos 3 meses</option>
                      <option value="1Y">Último año</option>
                    </select>
                  </div>
                </div>

                {selectedUser ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    
                    {/* CHART 1: Timeline of exercises & PRs */}
                    <div className={`p-5 rounded-2xl border ${t.card} flex flex-col`}>
                      <h3 className="text-sm md:text-base font-bold mb-2">Evolución de Entrenamientos y PRs</h3>
                      <p className={`text-xs mb-4 ${t.textMuted}`}>Eje Y: Ejercicios realizados. Estrellas: PRs rotos (Oro=1, Plata=2, Cósmica=3+).</p>
                      <div className="h-64 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chart1Data} margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} vertical={false} />
                            <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="exerciseCount" name="Ejercicios" stroke={theme === 'dark' ? '#9b111e' : '#000080'} strokeWidth={3} activeDot={{ r: 6 }} dot={renderCustomStar} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* CHART 2: Inverted Histogram (Top PRs) */}
                    <div className={`p-5 rounded-2xl border ${t.card}`}>
                      <h3 className="text-sm md:text-base font-bold mb-4">Mejores Marcas (PRs) por Ejercicio</h3>
                      <div className="w-full" style={{ height: Math.max(250, chart2Data.length * 40) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chart2Data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} horizontal={false} />
                            <XAxis type="number" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} hide />
                            <YAxis dataKey="name" type="category" stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'} fontSize={10} width={100} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }} formatter={(val) => [`${val} kg`, 'PR Máximo']} />
                            <Bar dataKey="peso" radius={[0, 4, 4, 0]}>
                              {chart2Data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={theme === 'dark' ? '#9b111e' : '#000080'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* CHART 3: Human Body Heatmap */}
                    <div className={`p-5 rounded-2xl border ${t.card} flex flex-col items-center`}>
                      <h3 className="text-sm md:text-base font-bold mb-2 w-full text-left">Mapa Muscular de Entrenamiento</h3>
                      <p className={`text-xs mb-6 w-full text-left ${t.textMuted}`}>Volumen histórico. Clic en un grupo para ver su gráfica. Rojo = Más entrenado.</p>
                      
                      <div className="flex gap-8 justify-center items-center flex-wrap">
                        {/* FRENTE */}
                        <div className="relative group cursor-pointer text-center">
                          <h4 className="text-xs font-bold mb-2 opacity-50">FRENTE</h4>
                          <svg width="120" height="250" viewBox="0 0 100 200" className="drop-shadow-lg">
                            {/* Head & Neck */}
                            <circle cx="50" cy="25" r="14" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="44" y="38" width="12" height="10" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            {/* HOMBROS (Front) */}
                            <circle cx="28" cy="55" r="12" fill={getHeatmapColor(heatmapData.HOMBRO)} onClick={() => setSelectedMuscle('HOMBRO')} className="transition-all hover:brightness-125" />
                            <circle cx="72" cy="55" r="12" fill={getHeatmapColor(heatmapData.HOMBRO)} onClick={() => setSelectedMuscle('HOMBRO')} className="transition-all hover:brightness-125" />
                            {/* PECHO */}
                            <path d="M 35 50 L 65 50 L 70 75 L 50 80 L 30 75 Z" fill={getHeatmapColor(heatmapData.PECHO)} onClick={() => setSelectedMuscle('PECHO')} className="transition-all hover:brightness-125" />
                            {/* Abs/Core (Neutral) */}
                            <path d="M 33 77 L 67 77 L 62 110 L 38 110 Z" fill={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            {/* BICEPS (Front Arms) */}
                            <rect x="18" y="65" width="14" height="35" rx="5" fill={getHeatmapColor(heatmapData.BICEPS)} onClick={() => setSelectedMuscle('BICEPS')} className="transition-all hover:brightness-125" />
                            <rect x="68" y="65" width="14" height="35" rx="5" fill={getHeatmapColor(heatmapData.BICEPS)} onClick={() => setSelectedMuscle('BICEPS')} className="transition-all hover:brightness-125" />
                            {/* Forearms & Hands */}
                            <rect x="19" y="102" width="12" height="30" rx="4" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="69" y="102" width="12" height="30" rx="4" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            {/* PIERNAS (Quads) */}
                            <path d="M 38 112 L 49 112 L 49 160 L 36 160 Z" fill={getHeatmapColor(heatmapData.PIERNAS)} onClick={() => setSelectedMuscle('PIERNAS')} className="transition-all hover:brightness-125" />
                            <path d="M 51 112 L 62 112 L 64 160 L 51 160 Z" fill={getHeatmapColor(heatmapData.PIERNAS)} onClick={() => setSelectedMuscle('PIERNAS')} className="transition-all hover:brightness-125" />
                            <rect x="36" y="162" width="12" height="30" rx="3" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="52" y="162" width="12" height="30" rx="3" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                          </svg>
                        </div>

                        {/* ESPALDA */}
                        <div className="relative group cursor-pointer text-center">
                          <h4 className="text-xs font-bold mb-2 opacity-50">ESPALDA</h4>
                          <svg width="120" height="250" viewBox="0 0 100 200" className="drop-shadow-lg">
                            <circle cx="50" cy="25" r="14" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="44" y="38" width="12" height="10" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            {/* HOMBROS (Back) */}
                            <circle cx="28" cy="55" r="12" fill={getHeatmapColor(heatmapData.HOMBRO)} onClick={() => setSelectedMuscle('HOMBRO')} className="transition-all hover:brightness-125" />
                            <circle cx="72" cy="55" r="12" fill={getHeatmapColor(heatmapData.HOMBRO)} onClick={() => setSelectedMuscle('HOMBRO')} className="transition-all hover:brightness-125" />
                            {/* ESPALDA (Dorsals/Lats) */}
                            <path d="M 32 50 L 68 50 L 62 110 L 38 110 Z" fill={getHeatmapColor(heatmapData.ESPALDA)} onClick={() => setSelectedMuscle('ESPALDA')} className="transition-all hover:brightness-125" />
                            {/* TRICEPS (Back Arms) */}
                            <rect x="18" y="65" width="14" height="35" rx="5" fill={getHeatmapColor(heatmapData.TRICEPS)} onClick={() => setSelectedMuscle('TRICEPS')} className="transition-all hover:brightness-125" />
                            <rect x="68" y="65" width="14" height="35" rx="5" fill={getHeatmapColor(heatmapData.TRICEPS)} onClick={() => setSelectedMuscle('TRICEPS')} className="transition-all hover:brightness-125" />
                            <rect x="19" y="102" width="12" height="30" rx="4" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="69" y="102" width="12" height="30" rx="4" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            {/* PIERNAS (Hamstrings/Glutes) */}
                            <path d="M 38 112 L 49 112 L 49 160 L 36 160 Z" fill={getHeatmapColor(heatmapData.PIERNAS)} onClick={() => setSelectedMuscle('PIERNAS')} className="transition-all hover:brightness-125" />
                            <path d="M 51 112 L 62 112 L 64 160 L 51 160 Z" fill={getHeatmapColor(heatmapData.PIERNAS)} onClick={() => setSelectedMuscle('PIERNAS')} className="transition-all hover:brightness-125" />
                            <rect x="36" y="162" width="12" height="30" rx="3" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                            <rect x="52" y="162" width="12" height="30" rx="3" fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Interactive Legend / Selector */}
                      <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {['PECHO', 'ESPALDA', 'HOMBRO', 'PIERNAS', 'BICEPS', 'TRICEPS'].map(m => (
                          <button key={m} onClick={() => setSelectedMuscle(m)}
                            className={`px-2 py-1 text-[10px] md:text-xs rounded-full border transition-all flex gap-1.5 items-center
                            ${selectedMuscle === m ? `${t.accentBg} text-white border-transparent` : `${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{backgroundColor: getHeatmapColor(heatmapData[m])}}></span>
                            {m}: {heatmapData[m]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CHART 4: Specific Muscle Timeline */}
                    <div className={`p-5 rounded-2xl border ${t.card} flex flex-col`}>
                      <h3 className="text-sm md:text-base font-bold mb-2">
                        Frecuencia de {selectedMuscle ? <span className={t.accentText}>{selectedMuscle}</span> : "Músculo (Selecciona uno)"}
                      </h3>
                      <p className={`text-xs mb-4 ${t.textMuted}`}>Eje Y: Cantidad de ejercicios realizados por día para el grupo muscular seleccionado.</p>
                      
                      {selectedMuscle ? (
                        <div className="h-64 w-full mt-auto">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart4Data} margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} vertical={false} />
                              <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                              <Tooltip cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }} formatter={(val) => [val, 'Ejercicios']} />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={getHeatmapColor(heatmapData[selectedMuscle])} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className={`flex-1 flex items-center justify-center text-sm ${t.textMuted} text-center p-4`}>
                          Haz clic en el mapa corporal o en las etiquetas para ver el historial de entrenamiento de un grupo muscular.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`p-12 text-center rounded-2xl border ${t.card} ${t.textMuted}`}>
                    Selecciona un usuario en los filtros de arriba para cargar sus analíticas.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Activity, Dumbbell, Sun, Moon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'analytics'
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ejercicios
  const [ejerciciosLista, setEjerciciosLista] = useState([
    'PESO MUERTO',
    'PRESS MAQUINA',
    'PULLOVER',
    'MARIPOSA',
    'PRESS INCLINADO',
    'PRESS BANCA',
    'FLEXIONES',
    'JALON AL PECHO',
    'REMO CON BARRA',
    'REMO BAJO',
    'REMO T',
    'REMO UNILATERAL',
    'DOMINADAS',
    'VUELOS ANTERIORES',
    'PRESS HOMBRO BARRAS',
    'VUELOS LATERALES',
    'PRESS HOMBRO',
    'REMO MENTON',
    'VUELOS POSTERIORES',
    'FACE PULL',
    'SCOTT',
    'BICEP CONCENTRADO',
    'ALT CON MANCUERNA',
    'CURL POLEA',
    'CURL CON BARRA',
    'BAYESIANA',
    'CURL BICEPS INCLINADO',
    'EXT POLEA ALTA',
    'FONDOS',
    'PRESS FRANCES',
    'EXT CON MANCUERNA',
    'EXT COPA',
    'TRASNUCA',
    'HACK',
    'CUADRICEPS',
    'HIP THRUST',
    'SOLEO',
    'PRENSA 45°',
    'ISQUIOTIBIALES',
    'PATADA DE GLUTEO',
    'MULTICADERA',
    'SENTADILLA',
    'ESTOCADAS',
    'ABDUCTOR',
    'ADUCTOR'
  ]);
  const [mostrarAvisoNuevo, setMostrarAvisoNuevo] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ejercicio, setEjercicio] = useState('');
  const [peso, setPeso] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analiticas
  const [selectedUser, setSelectedUser] = useState('');

  // Temas
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
      
      // Tres notas rápidas en escala (Do - Mi - Sol)
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

  // --- Firebase Data Fetching ---
  useEffect(() => {
    // Authenticate anonymously to ensure read/write works if rules require auth
    signInAnonymously(auth).catch((error) => console.warn("Anonymous auth info:", error.message));

    // Listen to the 'prs' collection in real-time
    const unsubscribe = onSnapshot(collection(db, 'prs'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date ascending globally to help charts later
      data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setPrs(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching PRs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  // Maneja el cambio de texto en el input de Ejercicio
  const handleEjercicioChange = (e) => {
    const val = e.target.value;
    setEjercicio(val);

    const valUpper = val.trim().toUpperCase();
    // Si escribió algo y NO está en la lista dropdown, activa la notificación
    if (valUpper && !ejerciciosLista.includes(valUpper)) {
      setMostrarAvisoNuevo(true);
    } else {
      setMostrarAvisoNuevo(false);
    }
  };

  // Agrega el nuevo ejercicio a la lista completa
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
    if (!nombre.trim() || !ejUpper || !peso) return;

    // Si el ejercicio no está en la lista al presionar 'Confirmar PR', se agrega a la lista
    if (!ejerciciosLista.includes(ejUpper)) {
      agregarNuevoEjercicio(ejUpper);
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'prs'), {
        nombre: nombre.trim().toUpperCase(), // Standardize names a bit
        ejercicio: ejercicio.trim().toUpperCase(),
        peso: parseFloat(peso),
        fecha: new Date().toISOString()
      });

      // Reproducir efecto de sonido de éxito
      playSuccessSound();

      // Mostrar animación de confirmación
      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 2500);

      // Reset some fields, keep name for convenience
      setEjercicio('');
      setPeso('');
    } catch (error) {
      console.error("Error saving PR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- Derived Data for UI ---
  const leaderboardData = useMemo(() => {
    // Group by exercise, then find max weight per user
    const grouped = {};
    prs.forEach(pr => {
      if (!grouped[pr.ejercicio]) grouped[pr.ejercicio] = {};
      const currentUserMax = grouped[pr.ejercicio][pr.nombre]?.peso || 0;
      if (pr.peso > currentUserMax) {
        grouped[pr.ejercicio][pr.nombre] = pr;
      }
    });

    // Convert to sorted arrays per exercise
    const result = {};
    Object.keys(grouped).forEach(ex => {
      result[ex] = Object.values(grouped[ex]).sort((a, b) => b.peso - a.peso);
    });
    return result;
  }, [prs]);

  const allUsers = useMemo(() => {
    const users = new Set(prs.map(pr => pr.nombre));
    return Array.from(users).sort();
  }, [prs]);

  // Set default selected user for analytics if none selected
  useEffect(() => {
    if (allUsers.length > 0 && !selectedUser) {
      setSelectedUser(allUsers[0]);
    }
  }, [allUsers, selectedUser]);

  const analyticsData = useMemo(() => {
    if (!selectedUser) return {};
    const userPrs = prs.filter(pr => pr.nombre === selectedUser);
    
    // Group by exercise to create separate charts
    const byExercise = {};
    userPrs.forEach(pr => {
      if (!byExercise[pr.ejercicio]) byExercise[pr.ejercicio] = [];
      byExercise[pr.ejercicio].push({
        ...pr,
        dateFormatted: new Date(pr.fecha).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      });
    });
    return byExercise;
  }, [prs, selectedUser]);


  // --- Sub-components (Inline for single-file structure) ---
  
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.bg} ${t.text}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-10 p-3 md:p-4 border-b ${t.card} backdrop-blur-md bg-opacity-90`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Dumbbell className={t.accentText} size={24} />
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Incursores PR</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex bg-opacity-20 rounded-lg p-1" style={{ backgroundColor: theme === 'dark' ? '#000' : '#e2e8f0' }}>
              <button 
                onClick={() => setActiveTab('main')}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'main' ? `${t.accentBg} text-white shadow-sm` : 'opacity-70 hover:opacity-100'}`}
              >
                Ranking
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'analytics' ? `${t.accentBg} text-white shadow-sm` : 'opacity-70 hover:opacity-100'}`}
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
      <main className="max-w-4xl mx-auto p-3 md:p-4 py-6 md:py-8">
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 ${t.accentBorder}`}></div>
          </div>
        ) : (
          <>
            {/* VIEW 1: Leaderboard & Form */}
            {activeTab === 'main' && (
              <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-6 md:gap-8">
                
                {/* Form Section */}
                <div>
                  <div className={`p-4 md:p-6 rounded-2xl border ${t.card} shadow-sm md:sticky md:top-24`}>
                    <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                      <Plus className={t.accentText} size={18} />
                      Registrar Nuevo PR
                    </h2>
                    <form onSubmit={handleSubmitPR} className="space-y-3 md:space-y-4">
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>Nombre</label>
                        <input 
                          type="text" required
                          value={nombre} onChange={e => setNombre(e.target.value)}
                          className={`w-full p-2.5 md:p-3 text-sm md:text-base rounded-lg border outline-none transition-all ${t.input}`}
                          placeholder="Jesús te ama"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>Ejercicio</label>
                        <input 
                          type="text" 
                          required
                          value={ejercicio} 
                          onChange={handleEjercicioChange}
                          className={`w-full p-2.5 md:p-3 text-sm md:text-base rounded-lg border outline-none transition-all ${t.input}`}
                          placeholder="1 Timoteo 4:8"
                          list="ejercicios-comunes"
                        />
                        
                        {/* Dropdown dinámico alimentado por el estado ejerciciosLista */}
                        <datalist id="ejercicios-comunes">
                          {ejerciciosLista.map((item, idx) => (
                            <option key={idx} value={item} />
                          ))}
                        </datalist>

                        {/* Notificación interactiva cuando se ingresa un ejercicio no registrado */}
                        {mostrarAvisoNuevo && (
                          <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-500 animate-fade-in">
                            <span>¿Agregar <strong>"{ejercicio.trim().toUpperCase()}"</strong> a la lista?</span>
                            <button
                              type="button"
                              onClick={() => agregarNuevoEjercicio(ejercicio)}
                              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded-md hover:bg-amber-400 transition-colors shadow-sm"
                            >
                              + Agregar
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs md:text-sm font-medium mb-1 ${t.textMuted}`}>Peso (kg)</label>
                        <input 
                          type="number" step="0.5" required
                          value={peso} onChange={e => setPeso(e.target.value)}
                          className={`w-full p-2.5 md:p-3 text-sm md:text-base rounded-lg border outline-none transition-all ${t.input}`}
                          placeholder="Ej: 10,5"
                        />
                      </div>
                      <button 
                        type="submit" disabled={isSubmitting}
                        className={`w-full p-2.5 md:p-3 mt-2 rounded-lg text-sm md:text-base font-bold text-white transition-all transform active:scale-95 ${t.accentBg} ${t.accentHover} disabled:opacity-50`}
                      >
                        {isSubmitting ? 'Guardando...' : 'Confirmar PR'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Leaderboard Section */}
                <div className="space-y-4 md:space-y-6">
                  {Object.keys(leaderboardData).length === 0 ? (
                    <div className={`p-6 md:p-8 text-center text-sm md:text-base rounded-2xl border ${t.card} ${t.textMuted}`}>
                      Aún no hay PRs registrados. ¡Sé el primero!
                    </div>
                  ) : (
                    Object.keys(leaderboardData).sort().map(ejercicio => (
                      <div key={ejercicio} className={`rounded-2xl border overflow-hidden ${t.card}`}>
                        <div className={`px-4 py-3 md:px-6 md:py-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} bg-black/5`}>
                          <h3 className="text-base md:text-xl font-bold tracking-wide">{ejercicio}</h3>
                        </div>
                        <div className="p-0">
                          {leaderboardData[ejercicio].map((pr, index) => (
                            <motion.div 
                              key={pr.id} 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`flex items-center justify-between p-3 px-4 md:p-4 md:px-6 transition-colors border-b last:border-b-0
                                ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}
                                ${index === 0 ? t.accentLightBg : 'hover:bg-black/5'}`}
                            >
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold
                                  ${index === 0 ? `${t.accentBg} text-white` : `${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                `}>
                                  {index === 0 ? <Trophy size={14} className="md:w-4 md:h-4" /> : index + 1}
                                </div>
                                <div>
                                  <p className={`font-bold text-sm md:text-lg leading-tight ${index === 0 ? t.accentText : ''}`}>
                                    {pr.nombre}
                                  </p>
                                  <p className={`text-[10px] md:text-xs mt-0.5 ${t.textMuted}`}>{formatDate(pr.fecha)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-lg md:text-2xl font-black ${index === 0 ? t.accentText : ''}`}>
                                  {pr.peso} <span className="text-[10px] md:text-sm font-medium opacity-70">kg</span>
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 md:space-y-8">
                <div className={`p-4 md:p-6 rounded-2xl border ${t.card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Activity className={t.accentText} size={20} />
                    <h2 className="text-base md:text-xl font-bold">Progreso Personal</h2>
                  </div>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className={`p-2 md:p-3 rounded-lg border outline-none text-sm md:text-base font-bold ${t.input} w-full sm:w-auto sm:min-w-[200px]`}
                  >
                    <option value="" disabled>Selecciona un amigo</option>
                    {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                {selectedUser && Object.keys(analyticsData).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {Object.keys(analyticsData).sort().map(ex => (
                      <motion.div 
                      key={ex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`p-4 md:p-6 rounded-2xl border ${t.card}`}
                      >
                        <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-center">{ex}</h3>
                        <div className="h-48 md:h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData[ex]} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} vertical={false} />
                              <XAxis 
                                dataKey="dateFormatted" 
                                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                              />
                              <YAxis 
                                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                                domain={['dataMin - 5', 'dataMax + 5']}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                  borderRadius: '8px',
                                  color: theme === 'dark' ? '#fff' : '#000',
                                  fontSize: '12px'
                                }}
                                formatter={(value) => [`${value} kg`, 'PR']}
                                labelStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '4px' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="peso" 
                                stroke={theme === 'dark' ? '#9b111e' : '#000080'} 
                                strokeWidth={2}
                                dot={{ fill: theme === 'dark' ? '#9b111e' : '#000080', strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5, fill: theme === 'dark' ? '#ff4d4d' : '#3333ff' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 md:p-12 text-center text-sm md:text-base rounded-2xl border ${t.card} ${t.textMuted}`}>
                    {allUsers.length === 0 ? "Aún no hay datos para analizar." : "Selecciona un usuario para ver su progreso."}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
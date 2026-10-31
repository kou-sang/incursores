import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { Activity, BookOpen, CalendarDays, Home, LogOut, Moon, Sun, UserRound, Users, Volume2, VolumeX } from 'lucide-react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { CelebrationLayer } from './components/CelebrationLayer';
import { useCelebration } from './components/useCelebration';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrandMark, FullScreenLoader, IconButton, Spinner } from './components/ui';
import { AppDataProvider } from './context/AppDataProvider';
import { FeedbackProvider } from './context/FeedbackProvider';
import { colorsKey, isOwnColorsEcho, useTheme } from './context/ThemeContext';
import { ThemeProvider } from './context/ThemeProvider';
import { LoginScreen } from './features/auth/LoginScreen';
import { ProfileSetup } from './features/auth/ProfileSetup';
import { useGroupJoinLink } from './features/groups/useGroupJoinLink';
import { useRoutineImport } from './features/routines/useRoutineImport';
import { TodayTab } from './features/today/TodayTab';
import { SESSION_STATUS, useAuthSession } from './hooks/useAuthSession';
import { logout } from './services/authService';
import { isSoundEnabled, playClick, setSoundEnabled } from './utils/audio';
import { logError } from './utils/errors';
import { lazyWithPrefetch, runWhenIdle } from './utils/lazyWithPrefetch';

/*
 * Code-splitting por pestaña. "Hoy" va en el bundle inicial (es la pantalla de entrada).
 * El resto se descarga aparte y se PRECARGA para que abrirlas siga siendo instantáneo:
 *  - livianas → en reposo, apenas termina de cargar la app;
 *  - Analíticas (Recharts, ~120 KB gz) → solo ante intención (hover/foco/toque en la pestaña),
 *    para no gastar datos móviles de quien nunca la abre.
 */
const TAB_MODULES = Object.freeze({
  routines: lazyWithPrefetch(() => import('./features/routines/RoutinesTab'), 'RoutinesTab'),
  library: lazyWithPrefetch(() => import('./features/library/ExerciseLibraryTab'), 'ExerciseLibraryTab'),
  analytics: lazyWithPrefetch(() => import('./features/analytics/AnalyticsTab'), 'AnalyticsTab'),
  groups: lazyWithPrefetch(() => import('./features/groups/GroupsTab'), 'GroupsTab'),
  profile: lazyWithPrefetch(() => import('./features/profile/ProfileTab'), 'ProfileTab'),
});
const IDLE_PREFETCH_TABS = Object.freeze(['routines', 'library', 'groups', 'profile']);

const RoutinesTab = TAB_MODULES.routines.Component;
const ExerciseLibraryTab = TAB_MODULES.library.Component;
const AnalyticsTab = TAB_MODULES.analytics.Component;
const GroupsTab = TAB_MODULES.groups.Component;
const ProfileTab = TAB_MODULES.profile.Component;

const prefetchTab = (tabId) => TAB_MODULES[tabId]?.prefetch();

const TABS = Object.freeze([
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'routines', label: 'Rutinas', icon: CalendarDays },
  { id: 'library', label: 'Ejercicios', icon: BookOpen },
  { id: 'analytics', label: 'Analíticas', icon: Activity },
  { id: 'groups', label: 'Grupos', icon: Users },
  { id: 'profile', label: 'Perfil', icon: UserRound },
]);

// Texto del fallback de Suspense: explica qué módulo se está descargando.
const TAB_LOADING_LABELS = Object.freeze({
  analytics: 'Cargando el módulo de Analíticas (gráficos)…',
  routines: 'Cargando el módulo de Rutinas…',
  library: 'Cargando la biblioteca de ejercicios…',
  groups: 'Cargando tus grupos y rankings…',
  profile: 'Cargando el módulo de Perfil…',
});

// Definido fuera de App: antes TabButton se re-creaba en cada render (nueva identidad de componente → remount).
const NavItem = ({ tab, isActive, onSelect, compact }) => {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      className={`nav-item flex flex-1 flex-col items-center gap-0.5 rounded-xl font-bold transition-colors lg:flex-none lg:flex-row lg:gap-2 lg:px-3 ${
        compact ? 'py-1 text-[10px] leading-tight' : 'py-2 text-sm'
      } min-w-0 ${isActive ? '' : 'text-secondary hover:text-[var(--text)]'}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onSelect(tab.id)}
      // Intención de navegar → se adelanta la descarga (el click llega ~100–300 ms después).
      onPointerEnter={() => prefetchTab(tab.id)}
      onFocus={() => prefetchTab(tab.id)}
      onTouchStart={() => prefetchTab(tab.id)}
    >
      <span className="nav-pill flex items-center justify-center rounded-full px-2.5 py-1 lg:px-0 lg:py-0">
        <Icon size={20} aria-hidden />
      </span>
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
};

const HeaderActions = ({ username }) => {
  const { theme, toggleTheme } = useTheme();
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClick();
  };

  const handleLogout = () => {
    playClick();
    logout().catch((logoutError) => logError('auth:logout', logoutError));
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 hidden max-w-[140px] truncate text-sm font-bold xl:inline">{username}</span>
      <IconButton label={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'} icon={soundOn ? Volume2 : VolumeX} onClick={handleToggleSound} />
      <IconButton label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} icon={theme === 'dark' ? Sun : Moon} onClick={() => { playClick(); toggleTheme(); }} />
      <IconButton label="Cerrar sesión" icon={LogOut} onClick={handleLogout} />
    </div>
  );
};

const AuthenticatedApp = ({ user }) => {
  const [activeTab, setActiveTab] = useState('today');
  const { celebrations, celebrate } = useCelebration();
  const { replaceCustomColors, replaceRecentColors } = useTheme();

  // Colores guardados en la cuenta (otro dispositivo) → se aplican aquí. Se ignora el eco de lo que este
  // mismo dispositivo acaba de autoguardar (si no, revertiría cambios hechos mientras viajaba la escritura).
  const remoteColors = user.preferences?.colors;
  const remoteColorsKey = remoteColors ? colorsKey(remoteColors) : null;
  useEffect(() => {
    if (!remoteColorsKey || isOwnColorsEcho(remoteColorsKey)) return;
    try {
      replaceCustomColors(JSON.parse(remoteColorsKey));
    } catch (parseError) {
      logError('theme:remote-colors', parseError);
    }
  }, [remoteColorsKey, replaceCustomColors]);

  const remoteRecentKey = user.preferences?.recentColors ? JSON.stringify(user.preferences.recentColors) : null;
  useEffect(() => {
    if (!remoteRecentKey) return;
    try {
      replaceRecentColors(JSON.parse(remoteRecentKey));
    } catch (parseError) {
      logError('theme:remote-recent-colors', parseError);
    }
  }, [remoteRecentKey, replaceRecentColors]);

  // Precarga en reposo de las pestañas livianas (no compite con el primer render).
  useEffect(() => runWhenIdle(() => IDLE_PREFETCH_TABS.forEach(prefetchTab)), []);

  const selectTab = useCallback((tabId) => {
    playClick();
    setActiveTab(tabId);
    window.scrollTo({ top: 0 });
  }, []);

  const goToRoutines = useCallback(() => setActiveTab('routines'), []);
  useRoutineImport(user, goToRoutines);
  const goToGroups = useCallback(() => setActiveTab('groups'), []);
  useGroupJoinLink(user, goToGroups);

  return (
    <AppDataProvider user={user}>
      {/* Margen inferior = barra de navegación móvil + safe-area de iOS: el último elemento nunca queda tapado. */}
      <div className="min-h-[100dvh] pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        {/* Header único y responsive (antes había dos barras con marcas distintas: "Colossus" e "Incursores"). */}
        <header className="sticky top-0 z-40 border-b divider glass">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-3 py-2 md:px-4">
            <BrandMark />
            <nav className="hidden flex-1 justify-center gap-1 lg:flex" aria-label="Secciones">
              {TABS.map((tab) => <NavItem key={tab.id} tab={tab} isActive={activeTab === tab.id} onSelect={selectTab} />)}
            </nav>
            <HeaderActions username={user.username} />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-8">
          <AnimatePresence mode="wait">
            <m.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ErrorBoundary key={activeTab}>
                <Suspense fallback={<div className="flex justify-center py-16"><Spinner label={TAB_LOADING_LABELS[activeTab] ?? 'Cargando módulo…'} hint="Solo se descarga la primera vez que abres esta sección." /></div>}>
                  {activeTab === 'today' && <TodayTab onCelebrate={celebrate} />}
                  {activeTab === 'routines' && <RoutinesTab />}
                  {activeTab === 'library' && <ExerciseLibraryTab />}
                  {activeTab === 'analytics' && <AnalyticsTab />}
                  {activeTab === 'groups' && <GroupsTab />}
                  {activeTab === 'profile' && <ProfileTab />}
                </Suspense>
              </ErrorBoundary>
            </m.div>
          </AnimatePresence>
        </main>

        {/* Navegación inferior móvil con safe-area de iOS. */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t divider glass px-1 pt-1 lg:hidden" aria-label="Secciones">
          <div className="flex">
            {TABS.map((tab) => <NavItem key={tab.id} tab={tab} isActive={activeTab === tab.id} onSelect={selectTab} compact />)}
          </div>
        </nav>

        <CelebrationLayer celebrations={celebrations} />
      </div>
    </AppDataProvider>
  );
};

const SessionGate = () => {
  const session = useAuthSession();

  switch (session.status) {
    case SESSION_STATUS.SIGNED_OUT:
      return <LoginScreen />;
    case SESSION_STATUS.NEEDS_PROFILE:
      return <ProfileSetup authUser={session.authUser} />;
    case SESSION_STATUS.ERROR:
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-4 text-center">
          <p className="font-semibold">No se pudo cargar tu perfil.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
          <button type="button" className="btn btn-ghost" onClick={() => logout().catch((logoutError) => logError('auth:logout', logoutError))}>Cerrar sesión</button>
        </div>
      );
    case SESSION_STATUS.READY:
      return <AuthenticatedApp user={session.user} />;
    default:
      return <FullScreenLoader label={session.loadingLabel ?? 'Cargando…'} hint="Conectando con el servidor; en segundos estarás dentro." />;
  }
};

// LazyMotion + domAnimation: solo las capacidades que usa la app (aparición, salida, SVG).
// Carga síncrona → las animaciones no se demoran. `strict` falla en desarrollo si alguien usa `motion` (bundle completo).
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <ThemeProvider>
        <FeedbackProvider>
          <ErrorBoundary>
            <SessionGate />
          </ErrorBoundary>
        </FeedbackProvider>
      </ThemeProvider>
    </LazyMotion>
  );
}

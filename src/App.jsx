import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CalendarDays, Home, LogOut, Moon, Sun, Trophy, Volume2, VolumeX } from 'lucide-react';
import { lazy, Suspense, useCallback, useState } from 'react';
import { CelebrationLayer, useCelebration } from './components/Celebration';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrandMark, FullScreenLoader, IconButton, Spinner } from './components/ui';
import { AppDataProvider } from './context/AppDataContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LoginScreen } from './features/auth/LoginScreen';
import { ProfileSetup } from './features/auth/ProfileSetup';
import { RoutinesTab } from './features/routines/RoutinesTab';
import { useRoutineImport } from './features/routines/useRoutineImport';
import { TodayTab } from './features/today/TodayTab';
import { SESSION_STATUS, useAuthSession } from './hooks/useAuthSession';
import { logout } from './services/authService';
import { isSoundEnabled, playClick, setSoundEnabled } from './utils/audio';
import { logError } from './utils/errors';

// Code-splitting: Recharts (~100 KB gz) solo se descarga al abrir pestañas con gráficos.
const AnalyticsTab = lazy(() => import('./features/analytics/AnalyticsTab').then((module) => ({ default: module.AnalyticsTab })));
const RankingTab = lazy(() => import('./features/ranking/RankingTab').then((module) => ({ default: module.RankingTab })));

const TABS = Object.freeze([
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'routines', label: 'Rutinas', icon: CalendarDays },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'analytics', label: 'Analíticas', icon: Activity },
]);

// Definido fuera de App: antes TabButton se re-creaba en cada render (nueva identidad de componente → remount).
const NavItem = ({ tab, isActive, onSelect, compact }) => {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      className={`nav-item flex flex-1 flex-col items-center gap-0.5 rounded-xl font-bold transition-colors md:flex-none md:flex-row md:gap-2 md:px-3 ${
        compact ? 'py-1 text-xs' : 'py-2 text-sm'
      } ${isActive ? '' : 'text-secondary hover:text-[var(--text)]'}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onSelect(tab.id)}
    >
      <span className="nav-pill flex items-center justify-center rounded-full px-4 py-1 md:px-0 md:py-0">
        <Icon size={20} aria-hidden />
      </span>
      {tab.label}
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
      <span className="mr-1 hidden max-w-[140px] truncate text-sm font-bold sm:inline">{username}</span>
      <IconButton label={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'} icon={soundOn ? Volume2 : VolumeX} onClick={handleToggleSound} />
      <IconButton label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} icon={theme === 'dark' ? Sun : Moon} onClick={() => { playClick(); toggleTheme(); }} />
      <IconButton label="Cerrar sesión" icon={LogOut} onClick={handleLogout} />
    </div>
  );
};

const AuthenticatedApp = ({ user }) => {
  const [activeTab, setActiveTab] = useState('today');
  const { particles, celebrate } = useCelebration();

  const selectTab = useCallback((tabId) => {
    playClick();
    setActiveTab(tabId);
    window.scrollTo({ top: 0 });
  }, []);

  const goToRoutines = useCallback(() => setActiveTab('routines'), []);
  useRoutineImport(user, goToRoutines);

  return (
    <AppDataProvider user={user}>
      <div className="min-h-[100dvh] pb-24 md:pb-8">
        {/* Header único y responsive (antes había dos barras con marcas distintas: "Colossus" e "Incursores"). */}
        <header className="sticky top-0 z-40 border-b divider glass">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-3 py-2 md:px-4">
            <BrandMark />
            <nav className="hidden flex-1 justify-center gap-1 md:flex" aria-label="Secciones">
              {TABS.map((tab) => <NavItem key={tab.id} tab={tab} isActive={activeTab === tab.id} onSelect={selectTab} />)}
            </nav>
            <HeaderActions username={user.username} />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ErrorBoundary key={activeTab}>
                <Suspense fallback={<div className="flex justify-center py-16"><Spinner label="Cargando módulo…" /></div>}>
                  {activeTab === 'today' && <TodayTab onCelebrate={celebrate} />}
                  {activeTab === 'routines' && <RoutinesTab />}
                  {activeTab === 'ranking' && <RankingTab />}
                  {activeTab === 'analytics' && <AnalyticsTab />}
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navegación inferior móvil con safe-area de iOS. */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t divider glass px-2 pt-1 md:hidden" aria-label="Secciones">
          <div className="flex">
            {TABS.map((tab) => <NavItem key={tab.id} tab={tab} isActive={activeTab === tab.id} onSelect={selectTab} compact />)}
          </div>
        </nav>

        <CelebrationLayer particles={particles} />
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
      return <FullScreenLoader />;
  }
};

export default function App() {
  return (
    <ThemeProvider>
      <FeedbackProvider>
        <ErrorBoundary>
          <SessionGate />
        </ErrorBoundary>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

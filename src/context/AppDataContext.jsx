import { createContext, useContext, useMemo } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { subscribeToPersonalBests } from '../services/personalBestService';
import { subscribeToOwnRoutines } from '../services/routineService';
import { subscribeToProfiles } from '../services/userService';

// Datos compartidos por varias pestañas. Elimina el prop drilling de prs/routines/usersDb/t/theme.
const AppDataContext = createContext(null);

export const AppDataProvider = ({ user, children }) => {
  const profilesState = useSubscription((onData, onError) => subscribeToProfiles(onData, onError), [], []);
  const bestsState = useSubscription((onData, onError) => subscribeToPersonalBests(onData, onError), [], {});
  const routinesState = useSubscription(
    (onData, onError) => subscribeToOwnRoutines(user.id, onData, onError),
    [user.id],
    [],
  );

  const value = useMemo(() => {
    const profilesById = Object.fromEntries(profilesState.data.map((profile) => [profile.id, profile]));
    const activeRoutine = routinesState.data.find((routine) => routine.id === user.activeRoutineId) ?? null;
    return {
      user,
      profiles: profilesState.data,
      profilesById,
      personalBests: bestsState.data,
      myBests: bestsState.data[user.id]?.bests ?? {},
      routines: routinesState.data,
      routinesLoading: routinesState.loading,
      activeRoutine,
    };
  }, [user, profilesState.data, bestsState.data, routinesState.data, routinesState.loading]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData debe usarse dentro de <AppDataProvider>');
  return context;
};

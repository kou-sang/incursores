import { useMemo } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { subscribeToMyGroups } from '../services/groupService';
import { subscribeToPersonalBests } from '../services/personalBestService';
import { subscribeToOwnRoutines } from '../services/routineService';
import { subscribeToProfiles } from '../services/userService';
import { AppDataContext } from './AppDataContext';

// Datos compartidos por varias pestañas. Elimina el prop drilling de prs/routines/usersDb/t/theme.

export const AppDataProvider = ({ user, children }) => {
  const profilesState = useSubscription((onData, onError) => subscribeToProfiles(onData, onError), [], []);
  const bestsState = useSubscription((onData, onError) => subscribeToPersonalBests(onData, onError), [], {});
  const routinesState = useSubscription(
    (onData, onError) => subscribeToOwnRoutines(user.id, onData, onError),
    [user.id],
    [],
  );
  const groupsState = useSubscription((onData, onError) => subscribeToMyGroups(user.id, onData, onError), [user.id], []);

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
      groups: groupsState.data,
      groupsLoading: groupsState.loading,
      groupsError: groupsState.error,
    };
  }, [user, profilesState.data, bestsState.data, routinesState.data, routinesState.loading, groupsState.data, groupsState.loading, groupsState.error]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

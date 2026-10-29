import { useEffect, useState } from 'react';
import { toDateKey } from '../utils/dates';

// Fecha local reactiva: si la app queda abierta pasada la medianoche, "hoy" se actualiza.
export const useToday = () => {
  const [todayKey, setTodayKey] = useState(() => toDateKey());

  useEffect(() => {
    const refresh = () => setTodayKey(toDateKey());
    const intervalId = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return todayKey;
};

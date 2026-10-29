import { CalendarDays, Check, CloudOff, Flame, Plus, Trophy, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, IconButton, SectionCard, StatTile } from '../../components/ui';
import { QUERY_LIMITS } from '../../constants/collections';
import { CATALOG_EXERCISE_NAMES, normalizeExerciseName } from '../../constants/exercises';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useToday } from '../../hooks/useToday';
import { createWorkoutLog, deleteWorkoutLog, subscribeToLogs } from '../../services/logService';
import { parseTargetReps } from '../../services/validation';
import { playClick, playSuccess } from '../../utils/audio';
import { addDays, formatLongDate, formatShortDate, getDayKey, parseDateKey, startOfWeek, toDateKey } from '../../utils/dates';
import { logError, toUserMessage } from '../../utils/errors';
import { computeWeekStreak, countPlannedDays, countTrainingDays } from '../../utils/metrics';
import { LogEntryForm } from './LogEntryForm';

const formatSetSummary = (log) => {
  if (!log) return null;
  const weight = log.weight !== null ? `${log.weight} kg` : 'sin peso';
  return log.reps ? `${weight} × ${log.reps}` : weight;
};

export const TodayTab = ({ onCelebrate }) => {
  const { user, activeRoutine, myBests, routines } = useAppData();
  const { notify, confirm } = useFeedback();
  const todayKey = useToday();
  const [openFormKey, setOpenFormKey] = useState(null);

  // 'since' depende solo del día → la suscripción no se recrea en cada render.
  const logsState = useSubscription(
    (onData, onError) =>
      subscribeToLogs({ since: addDays(parseDateKey(todayKey), -QUERY_LIMITS.TODAY_LOOKBACK_DAYS), userIds: [user.id] }, onData, onError),
    [user.id, todayKey],
    [],
  );
  const myLogs = logsState.data;

  const { todayLogs, lastLogByExercise } = useMemo(() => {
    const today = [];
    const lastByExercise = {};
    // myLogs viene ordenado desc → el primer previo a hoy es la última sesión.
    myLogs.forEach((log) => {
      if (toDateKey(log.performedAt) === todayKey) today.push(log);
      else if (!lastByExercise[log.exercise]) lastByExercise[log.exercise] = log;
    });
    return { todayLogs: today, lastLogByExercise: lastByExercise };
  }, [myLogs, todayKey]);

  const plannedItems = activeRoutine?.days[getDayKey(parseDateKey(todayKey))] ?? [];

  // Un ejercicio repetido en el día requiere tantos registros como apariciones.
  const completion = useMemo(() => {
    const remaining = {};
    todayLogs.forEach((log) => { remaining[log.exercise] = (remaining[log.exercise] ?? 0) + 1; });
    return plannedItems.map((item) => {
      const key = normalizeExerciseName(item.exercise);
      if (remaining[key] > 0) {
        remaining[key] -= 1;
        return true;
      }
      return false;
    });
  }, [plannedItems, todayLogs]);

  const doneCount = completion.filter(Boolean).length;
  const trainedDaysThisWeek = countTrainingDays(myLogs, user.id, startOfWeek(parseDateKey(todayKey)));
  const plannedDays = countPlannedDays(activeRoutine);
  const weekStreak = computeWeekStreak(myLogs, user.id);

  const exerciseOptions = useMemo(() => {
    const fromRoutines = routines.flatMap((routine) => Object.values(routine.days).flat().map((item) => item.exercise));
    return [...new Set([...CATALOG_EXERCISE_NAMES, ...fromRoutines.map(normalizeExerciseName)])].sort();
  }, [routines]);

  const handleLog = async (entry) => {
    try {
      const currentBest = myBests[normalizeExerciseName(entry.exercise)];
      const { isPr, committed } = createWorkoutLog({ userId: user.id, username: user.username, entry, currentBest });
      // La escritura es optimista: onSnapshot la muestra al instante; el servidor confirma después (o al volver la red).
      committed.catch((commitError) => {
        logError('log:commit', commitError);
        notify(toUserMessage(commitError, 'No se pudo sincronizar el registro.'), 'error');
      });
      playSuccess(isPr);
      onCelebrate(isPr);
      notify(isPr ? '¡Nuevo récord personal!' : 'Ejercicio registrado', 'success');
      setOpenFormKey(null);
    } catch (logErrorInstance) {
      logError('log:create', logErrorInstance);
      notify(toUserMessage(logErrorInstance), 'error');
    }
  };

  const handleUndo = async (log) => {
    const accepted = await confirm({
      title: 'Deshacer registro',
      message: `Se eliminará ${log.exercise} (${formatSetSummary(log)}).`,
      confirmLabel: 'Eliminar',
      tone: 'danger',
    });
    if (!accepted) return;
    try {
      await deleteWorkoutLog(log, myBests[log.exercise]);
      notify('Registro eliminado', 'info');
    } catch (deleteError) {
      logError('log:delete', deleteError);
      notify(toUserMessage(deleteError), 'error');
    }
  };

  const toggleForm = (key) => {
    playClick();
    setOpenFormKey((current) => (current === key ? null : key));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="card p-4 md:p-6">
        <p className="text-sm font-semibold capitalize text-secondary">{formatLongDate(parseDateKey(todayKey))}</p>
        <h2 className="mt-1 text-xl font-black md:text-2xl">¡A entrenar, {user.username}!</h2>
        {activeRoutine && plannedItems.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-sm font-semibold">
              <span className="text-secondary">{activeRoutine.name}</span>
              <span>{doneCount}/{plannedItems.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={plannedItems.length} aria-valuenow={doneCount}>
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${(doneCount / plannedItems.length) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile icon={CalendarDays} label="Esta semana" value={plannedDays ? `${trainedDaysThisWeek}/${plannedDays}` : trainedDaysThisWeek} hint={plannedDays ? 'días entrenados / planificados' : 'días entrenados'} />
        <StatTile icon={Flame} label="Racha" value={`${weekStreak} sem`} hint="semanas consecutivas activas" />
        <StatTile icon={Trophy} label="PRs hoy" value={todayLogs.filter((log) => log.isPr).length} hint="récords de 1RM estimado" />
      </div>

      {!activeRoutine ? (
        <EmptyState icon={CalendarDays} title="Sin rutina activa" description="Activa una rutina en la pestaña Rutinas o registra ejercicios libres abajo." />
      ) : plannedItems.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Día de descanso" description="La recuperación también construye músculo. Si entrenas igual, regístralo abajo." />
      ) : (
        <SectionCard title="Plan de hoy">
          <ul className="divide-y divide-[var(--border)]">
            {plannedItems.map((item, index) => {
              const exerciseKey = normalizeExerciseName(item.exercise);
              const isDone = completion[index];
              const lastLog = lastLogByExercise[exerciseKey];
              const best = myBests[exerciseKey];
              const isOpen = openFormKey === item.id;
              return (
                <li key={item.id} className={`py-3 first:pt-0 last:pb-0 ${isDone ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-bold">{item.exercise}</h4>
                      <p className="text-sm text-secondary">
                        {item.sets} series{item.reps && ` × ${item.reps} reps`}
                      </p>
                      {(lastLog || best) && (
                        <p className="mt-0.5 text-xs text-muted">
                          {lastLog && <>Última ({formatShortDate(lastLog.performedAt)}): {formatSetSummary(lastLog)}</>}
                          {lastLog && best?.e1rm && ' · '}
                          {best?.e1rm && <>Mejor 1RM est.: {best.e1rm} kg</>}
                        </p>
                      )}
                    </div>
                    {isDone ? (
                      <span className="badge badge-good shrink-0"><Check size={14} aria-hidden /> Hecho</span>
                    ) : (
                      <button type="button" className="btn btn-outline shrink-0" aria-expanded={isOpen} onClick={() => toggleForm(item.id)}>
                        Registrar
                      </button>
                    )}
                  </div>
                  {isOpen && !isDone && (
                    <LogEntryForm
                      defaults={{
                        exercise: item.exercise,
                        muscle: item.muscle,
                        sets: item.sets,
                        reps: parseTargetReps(item.reps) ?? lastLog?.reps ?? '',
                        weight: lastLog?.weight ?? '',
                      }}
                      onSubmit={handleLog}
                      onCancel={() => toggleForm(item.id)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      <SectionCard
        title="Registrado hoy"
        subtitle={todayLogs.length ? `${todayLogs.length} ejercicio(s)` : 'Aún no registraste nada hoy'}
        actions={
          <button type="button" className="btn btn-ghost" aria-expanded={openFormKey === 'free'} onClick={() => toggleForm('free')}>
            <Plus size={16} aria-hidden /> Ejercicio libre
          </button>
        }
      >
        {openFormKey === 'free' && (
          <LogEntryForm defaults={{ sets: 3 }} showExerciseField exerciseOptions={exerciseOptions} onSubmit={handleLog} onCancel={() => toggleForm('free')} />
        )}
        {todayLogs.length > 0 && (
          <ul className="mt-2 divide-y divide-[var(--border)]">
            {todayLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {log.exercise} {log.isPr && <span className="badge badge-accent ml-1"><Trophy size={12} aria-hidden /> PR</span>}
                  </p>
                  <p className="text-xs text-secondary">
                    {log.sets} × {formatSetSummary(log)}
                    {log.isPending && <span className="ml-2 inline-flex items-center gap-1 text-muted"><CloudOff size={12} aria-hidden /> pendiente de sincronizar</span>}
                  </p>
                </div>
                <IconButton label={`Deshacer ${log.exercise}`} icon={Undo2} onClick={() => handleUndo(log)} />
              </li>
            ))}
          </ul>
        )}
        {logsState.error && <p className="mt-2 text-sm text-accent">{toUserMessage(logsState.error)}</p>}
      </SectionCard>
    </div>
  );
};

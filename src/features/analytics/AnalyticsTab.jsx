import { CalendarDays, Dumbbell, Flame, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SectionCard, SegmentedControl, StatTile } from '../../components/ui';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useToday } from '../../hooks/useToday';
import { subscribeToLogs } from '../../services/logService';
import { playClick } from '../../utils/audio';
import { addDays, diffInCalendarDays, parseDateKey } from '../../utils/dates';
import { toUserMessage } from '../../utils/errors';
import {
  buildMuscleLastTrained,
  buildSetsByMuscle,
  buildStrengthSeries,
  buildWeeklyTonnage,
  computeTonnage,
  computeWeekStreak,
  countTrainingDays,
  filterByUser,
} from '../../utils/metrics';
import { MuscleMap } from './MuscleMap';
import { MuscleSetsChart } from './MuscleSetsChart';
import { StrengthProgressChart } from './StrengthProgressChart';
import { WeeklyVolumeChart } from './WeeklyVolumeChart';

const RANGES = [
  { value: 30, label: '30 días' },
  { value: 90, label: '3 meses' },
  { value: 365, label: '1 año' },
  { value: 0, label: 'Todo' },
];

// Máximo de perfiles comparables = slots de la paleta categórica (nunca se generan colores extra).
const MAX_COMPARED_USERS = 8;

const formatTonnage = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)} t` : `${Math.round(value)} kg`);

export const AnalyticsTab = () => {
  const { user, profiles, profilesById } = useAppData();
  const { chart } = useTheme();
  const todayKey = useToday();

  // userId → slot de color. El color sigue a la persona: deseleccionar a otro no repinta al resto.
  const [colorSlots, setColorSlots] = useState({ [user.id]: 0 });
  const [focusUserId, setFocusUserId] = useState(user.id);
  const [rangeDays, setRangeDays] = useState(90);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  const selectedUserIds = useMemo(() => Object.keys(colorSlots), [colorSlots]);
  const since = useMemo(() => (rangeDays ? addDays(parseDateKey(todayKey), -(rangeDays - 1)) : null), [rangeDays, todayKey]);

  const logsState = useSubscription(
    (onData, onError) => subscribeToLogs({ since, userIds: selectedUserIds }, onData, onError),
    [since, selectedUserIds.join('|')],
    [],
  );
  const logs = logsState.data;

  const toggleUser = (userId) => {
    playClick();
    if (colorSlots[userId] !== undefined) {
      if (selectedUserIds.length === 1) return; // Siempre al menos un perfil
      const remaining = Object.fromEntries(Object.entries(colorSlots).filter(([id]) => id !== userId));
      setColorSlots(remaining);
      if (focusUserId === userId) setFocusUserId(Object.keys(remaining)[0]);
      return;
    }
    const usedSlots = new Set(Object.values(colorSlots));
    const freeSlot = [...Array(MAX_COMPARED_USERS).keys()].find((slot) => !usedSlots.has(slot));
    if (freeSlot !== undefined) setColorSlots({ ...colorSlots, [userId]: freeSlot });
  };

  const selectedUsers = selectedUserIds.map((userId) => ({
    userId,
    name: profilesById[userId]?.username ?? '—',
    color: chart.series[colorSlots[userId]],
  }));

  // Ejercicios con datos de fuerza del perfil foco, ordenados por frecuencia.
  const exerciseOptions = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      if (log.e1rm) counts[log.exercise] = (counts[log.exercise] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([exercise]) => exercise);
  }, [logs]);
  const activeExercise = exerciseOptions.includes(selectedExercise) ? selectedExercise : exerciseOptions[0] ?? '';

  const strengthSeries = useMemo(
    () => selectedUsers.map((selected) => ({ ...selected, points: buildStrengthSeries(logs, selected.userId, activeExercise) })),
    // selectedUsers se deriva de colorSlots/profiles/chart
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs, activeExercise, colorSlots, profilesById, chart],
  );

  // Rango "Todo": el inicio real es el registro más antiguo cargado (logs viene ordenado desc).
  const firstLogDate = useMemo(
    () => (logs.length ? logs[logs.length - 1].performedAt : parseDateKey(todayKey)),
    [logs, todayKey],
  );
  const weeklyRows = useMemo(
    () => buildWeeklyTonnage(logs, selectedUserIds, since ?? firstLogDate),
    [logs, selectedUserIds, since, firstLogDate],
  );

  const focusMetrics = useMemo(() => {
    const focusLogs = filterByUser(logs, focusUserId);
    const rangeStart = since ?? firstLogDate;
    const weeks = Math.max(1, Math.ceil((diffInCalendarDays(parseDateKey(todayKey), rangeStart) + 1) / 7));
    const totalTonnage = focusLogs.reduce((sum, log) => sum + (computeTonnage(log) ?? 0), 0);
    return {
      trainingDays: countTrainingDays(logs, focusUserId, rangeStart),
      records: focusLogs.filter((log) => log.isPr).length,
      tonnagePerWeek: totalTonnage / weeks,
      streak: computeWeekStreak(logs, focusUserId),
      setsByMuscle: buildSetsByMuscle(logs, focusUserId, 7),
      lastTrained: buildMuscleLastTrained(logs, focusUserId),
    };
  }, [logs, focusUserId, since, firstLogDate, todayKey]);

  const focusName = profilesById[focusUserId]?.username ?? '';
  const focusGender = profilesById[focusUserId]?.gender ?? user.gender;
  const sortedProfiles = [...profiles].sort((a, b) => (a.id === user.id ? -1 : b.id === user.id ? 1 : a.username.localeCompare(b.username, 'es')));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros en una sola franja: perfiles + rango. El original tenía 5 filtros que se pisaban entre sí. */}
      <SectionCard>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-bold text-secondary">Comparar perfiles (máx. {MAX_COMPARED_USERS})</p>
            <div className="flex flex-wrap gap-2">
              {sortedProfiles.map((profile) => {
                const slot = colorSlots[profile.id];
                const isSelected = slot !== undefined;
                return (
                  // El color de serie va en un punto, no de fondo: el texto conserva contraste (amarillo/blanco fallaba).
                  <button key={profile.id} type="button" className="chip flex items-center gap-1.5" aria-pressed={isSelected} onClick={() => toggleUser(profile.id)}
                    style={isSelected ? { background: 'var(--surface)', color: 'var(--text)', borderColor: chart.series[slot] } : undefined}>
                    {isSelected && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: chart.series[slot] }} aria-hidden />}
                    {profile.username}{profile.id === user.id && ' (tú)'}
                  </button>
                );
              })}
            </div>
          </div>
          <SegmentedControl label="Rango de tiempo" options={RANGES} value={rangeDays} onChange={setRangeDays} />
          {logsState.meta?.isTruncated && (
            <p className="text-xs text-muted">Se muestran los registros más recientes; acota el rango para ver el detalle completo.</p>
          )}
          {logsState.error && <p className="text-sm text-accent">{toUserMessage(logsState.error)}</p>}
        </div>
      </SectionCard>

      {selectedUsers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="focus-user" className="text-sm font-semibold text-secondary">Indicadores individuales de:</label>
          <select id="focus-user" className="input w-auto" value={focusUserId} onChange={(event) => setFocusUserId(event.target.value)}>
            {selectedUsers.map((selected) => <option key={selected.userId} value={selected.userId}>{selected.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={CalendarDays} label="Días entrenados" value={focusMetrics.trainingDays} hint={`${focusName} · en el rango`} />
        <StatTile icon={Dumbbell} label="Tonelaje / semana" value={formatTonnage(focusMetrics.tonnagePerWeek)} hint="promedio en el rango" />
        <StatTile icon={Trophy} label="Récords" value={focusMetrics.records} hint="PRs de 1RM estimado" />
        <StatTile icon={Flame} label="Racha" value={`${focusMetrics.streak} sem`} hint="semanas consecutivas" />
      </div>

      <SectionCard
        title="Progresión de fuerza"
        subtitle="Mejor 1RM estimado por sesión — la métrica más fiable de progreso real"
        actions={
          exerciseOptions.length > 0 && (
            <select aria-label="Ejercicio" className="input w-auto max-w-[220px]" value={activeExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
              {exerciseOptions.map((exercise) => <option key={exercise} value={exercise}>{exercise}</option>)}
            </select>
          )
        }
      >
        {logsState.loading ? <div className="skeleton h-64" /> : <StrengthProgressChart seriesList={strengthSeries} />}
      </SectionCard>

      <SectionCard title="Tonelaje semanal" subtitle="Series × reps × kg por semana">
        {logsState.loading ? <div className="skeleton h-56" /> : <WeeklyVolumeChart rows={weeklyRows} users={selectedUsers} />}
      </SectionCard>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <SectionCard title="Estado muscular" subtitle={`Días desde el último estímulo · ${focusName}`}>
          <MuscleMap
            gender={focusGender}
            lastTrainedByMuscle={focusMetrics.lastTrained}
            setsByMuscle={focusMetrics.setsByMuscle}
            selectedMuscle={selectedMuscle}
            onSelect={setSelectedMuscle}
          />
        </SectionCard>
        <SectionCard title="Series por músculo" subtitle={`Últimos 7 días · ${focusName}`}>
          <MuscleSetsChart setsByMuscle={focusMetrics.setsByMuscle} highlightMuscle={selectedMuscle} />
        </SectionCard>
      </div>
    </div>
  );
};

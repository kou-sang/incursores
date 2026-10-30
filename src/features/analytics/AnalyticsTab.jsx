import { CalendarDays, ChevronDown, ChevronUp, Dumbbell, Flame, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { IconButton, LoadingState, SectionCard, SegmentedControl, StatTile } from '../../components/ui';
import { MUSCLE_IDS } from '../../constants/muscles';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useToday } from '../../hooks/useToday';
import { subscribeToLogs } from '../../services/logService';
import { addDays, diffInCalendarDays, endOfDay, parseDateKey, toDateKey } from '../../utils/dates';
import { playClick } from '../../utils/audio';
import { toUserMessage } from '../../utils/errors';
import {
  buildConsistencySeries,
  buildEffectiveSetsByMuscle,
  buildMuscleLastTrained,
  buildStrengthSeries,
  buildWeeklyTonnage,
  computeTonnage,
  computeWeekStreak,
  countTrainingDays,
  filterLogs,
} from '../../utils/metrics';
import { AnalyticsFilters } from './AnalyticsFilters';
import { CRITICAL_RECENCY_DAYS, DATE_PRESETS, MAP_MODES } from './analyticsConstants';
import { ConsistencyChart } from './ConsistencyChart';
import { MuscleMap } from './MuscleMap';
import { MuscleDetailPanel } from './MuscleDetailPanel';
import { MuscleSetsChart } from './MuscleSetsChart';
import { StrengthProgressChart } from './StrengthProgressChart';
import { WeeklyVolumeChart } from './WeeklyVolumeChart';

// Máximo de perfiles en gráficos comparativos = slots de la paleta categórica (nunca se generan colores extra).
const MAX_COMPARED_USERS = 8;
const AGGREGATE_FOCUS = 'aggregate';
const LONG_RANGE_DAYS = 120;

const formatTonnage = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)} t` : `${Math.round(value)} kg`);

// Rango de fechas → { since, until }. `until` null = abierto (incluye lo que se registre en vivo).
const resolveDateRange = (preset, customRange, todayKey) => {
  const today = parseDateKey(todayKey);
  switch (preset) {
    case 'week': return { since: addDays(today, -6), until: null };
    case '30d': return { since: addDays(today, -29), until: null };
    case '90d': return { since: addDays(today, -89), until: null };
    case 'year': return { since: new Date(today.getFullYear(), 0, 1), until: null };
    case 'custom': {
      const from = parseDateKey(customRange.from);
      const to = parseDateKey(customRange.to);
      if (!from || !to || from > to) return { since: addDays(today, -29), until: null, invalid: true };
      return { since: from, until: endOfDay(to) };
    }
    default: return { since: addDays(today, -29), until: null };
  }
};

export const AnalyticsTab = () => {
  const { user, groups, profilesById } = useAppData();
  const { chart } = useTheme();
  const todayKey = useToday();

  // ───────── Estado de filtros ─────────
  const [scopeChoice, setScopeChoice] = useState(null); // null = automático (primer grupo o "Solo yo")
  const [userSelection, setUserSelection] = useState({ scopeId: null, ids: null });
  const [categories, setCategories] = useState(null);
  const [muscles, setMuscles] = useState(null);
  const [datePreset, setDatePreset] = useState('30d');
  const [customRange, setCustomRange] = useState(() => ({ from: toDateKey(addDays(new Date(), -29)), to: toDateKey() }));
  const [focusChoice, setFocusChoice] = useState(null);
  const [mapMode, setMapMode] = useState('recency');
  const [mapGenderChoice, setMapGenderChoice] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true); // Siempre visibles al entrar; se pueden ocultar con la flecha
  const [unifyDays, setUnifyDays] = useState(true); // false → gráficos temporales con hora y minuto

  const activeGroup = scopeChoice === 'self' ? null : groups.find((group) => group.id === scopeChoice) ?? (scopeChoice ? null : groups[0] ?? null);
  const scopeId = activeGroup?.id ?? 'self';

  // Solo miembros del grupo elegido: perfiles fuera de tus grupos nunca aparecen en Analíticas.
  const memberIds = useMemo(() => {
    const ids = activeGroup ? activeGroup.memberIds : [user.id];
    return [...ids].sort((a, b) => (a === user.id ? -1 : b === user.id ? 1 : (profilesById[a]?.username ?? '').localeCompare(profilesById[b]?.username ?? '', 'es')));
  }, [activeGroup, user.id, profilesById]);

  // El color sigue a la persona (posición estable en el grupo), no a la selección: filtrar no repinta.
  const colorByUser = useMemo(
    () => Object.fromEntries(memberIds.slice(0, MAX_COMPARED_USERS).map((id, index) => [id, chart.series[index]])),
    [memberIds, chart],
  );

  // Memoizados: referencias estables → los useMemo dependientes no se recalculan en cada render.
  const selectedIds = useMemo(
    () => (userSelection.scopeId === scopeId && userSelection.ids ? userSelection.ids.filter((id) => memberIds.includes(id)) : null),
    [userSelection, scopeId, memberIds],
  );
  const effectiveUserIds = useMemo(() => (selectedIds?.length ? selectedIds : memberIds), [selectedIds, memberIds]);

  const range = useMemo(() => resolveDateRange(datePreset, customRange, todayKey), [datePreset, customRange, todayKey]);
  // Rango abierto → fin del día actual (estable durante el día, a diferencia de new Date()).
  const rangeEnd = useMemo(() => range.until ?? endOfDay(parseDateKey(todayKey)), [range.until, todayKey]);
  const rangeDays = diffInCalendarDays(rangeEnd, range.since) + 1;
  const weeksInRange = Math.max(1, rangeDays / 7);

  // El mapa de recuperación necesita ≥ 30 días de historia aunque el rango elegido sea más corto
  // (si no, un músculo entrenado hace 10 días figuraría como "nunca"). Solo agrega lecturas en rangos < 30 días.
  const querySince = useMemo(() => {
    const recencyStart = addDays(parseDateKey(todayKey), -CRITICAL_RECENCY_DAYS);
    return range.since < recencyStart ? range.since : recencyStart;
  }, [range.since, todayKey]);

  // Una consulta por grupo + rango. Perfiles/categorías/músculos/fechas se filtran en memoria (0 lecturas extra).
  const memberKey = memberIds.join('|');
  const sinceTime = querySince.getTime();
  const untilTime = range.until?.getTime() ?? 0;
  const logsState = useSubscription(
    (onData, onError) => subscribeToLogs({ since: querySince, until: range.until, userIds: memberIds }, onData, onError),
    [memberKey, sinceTime, untilTime],
    [],
  );

  const enabledMuscles = useMemo(() => (muscles ? new Set(muscles) : null), [muscles]);
  const filteredLogs = useMemo(
    () => filterLogs(logsState.data, { userIds: effectiveUserIds, categories, muscles, since: range.since }),
    [logsState.data, effectiveUserIds, categories, muscles, range.since],
  );

  // ───────── Perfil foco (mapa y KPIs) ─────────
  const focusId = focusChoice === AGGREGATE_FOCUS && effectiveUserIds.length > 1
    ? AGGREGATE_FOCUS
    : effectiveUserIds.includes(focusChoice) ? focusChoice : effectiveUserIds.includes(user.id) ? user.id : effectiveUserIds[0];
  const focusIds = useMemo(() => (focusId === AGGREGATE_FOCUS ? effectiveUserIds : [focusId]), [focusId, effectiveUserIds]);
  const focusName = focusId === AGGREGATE_FOCUS ? 'Promedio de la selección' : profilesById[focusId]?.username ?? '—';
  const mapGender = mapGenderChoice ?? (focusId === AGGREGATE_FOCUS ? user.gender : profilesById[focusId]?.gender ?? user.gender);

  const focusMetrics = useMemo(() => {
    const focusLogs = filteredLogs.filter((log) => focusIds.includes(log.userId));
    const divisor = focusIds.length;
    const totals = buildEffectiveSetsByMuscle(focusLogs, { muscles });
    const weeklySetsByMuscle = Object.fromEntries(Object.entries(totals).map(([id, value]) => [id, value / weeksInRange / divisor]));
    const trainingDays = focusIds.reduce((sum, id) => sum + countTrainingDays(focusLogs, id, range.since), 0) / divisor;
    const tonnage = focusLogs.reduce((sum, log) => sum + (computeTonnage(log) ?? 0), 0) / divisor;
    return {
      weeklySetsByMuscle,
      trainingDays: Math.round(trainingDays * 10) / 10,
      tonnagePerWeek: tonnage / weeksInRange,
      records: focusLogs.filter((log) => log.isPr).length,
      streak: divisor === 1 ? computeWeekStreak(logsState.data, focusIds[0]) : null,
    };
  }, [filteredLogs, focusIds, muscles, weeksInRange, range.since, logsState.data]);

  // Recuperación: mismos filtros salvo la fecha de inicio (usa toda la historia descargada, ≥ 30 días).
  const lastTrainedByMuscle = useMemo(
    () => buildMuscleLastTrained(filterLogs(logsState.data, { userIds: focusIds, categories, muscles }), null),
    [logsState.data, focusIds, categories, muscles],
  );

  // ───────── Gráficos comparativos (máx. 8 perfiles con color propio) ─────────
  const chartUsers = useMemo(
    () => effectiveUserIds.filter((id) => colorByUser[id]).map((id) => ({ userId: id, name: profilesById[id]?.username ?? '—', color: colorByUser[id] })),
    [effectiveUserIds, colorByUser, profilesById],
  );
  const hiddenCompared = effectiveUserIds.length - chartUsers.length;

  const exerciseOptions = useMemo(() => {
    const counts = {};
    filteredLogs.forEach((log) => {
      if (log.e1rm) counts[log.exercise] = (counts[log.exercise] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([exercise]) => exercise);
  }, [filteredLogs]);
  const activeExercise = exerciseOptions.includes(selectedExercise) ? selectedExercise : exerciseOptions[0] ?? '';

  const strengthSeries = useMemo(
    () => chartUsers.map((selected) => ({ ...selected, points: buildStrengthSeries(filteredLogs, selected.userId, activeExercise, { unifyDays }) })),
    [chartUsers, filteredLogs, activeExercise, unifyDays],
  );
  const consistencySeries = useMemo(
    () => chartUsers.map((selected) => ({ ...selected, ...buildConsistencySeries(filteredLogs, selected.userId, { unifyDays }) })),
    [chartUsers, filteredLogs, unifyDays],
  );
  const consistencyDomain = useMemo(() => [range.since.getTime(), rangeEnd.getTime()], [range.since, rangeEnd]);
  const weeklyRows = useMemo(
    () => buildWeeklyTonnage(filteredLogs, chartUsers.map(({ userId }) => userId), range.since, rangeEnd),
    [filteredLogs, chartUsers, range.since, rangeEnd],
  );

  const memberOptions = memberIds.map((id) => ({
    value: id,
    label: `${profilesById[id]?.username ?? 'Perfil'}${id === user.id ? ' (tú)' : ''}`,
    color: colorByUser[id],
  }));

  const handleScopeChange = (nextScope) => {
    setScopeChoice(nextScope);
    setFocusChoice(null);
    setSelectedMuscle(null);
  };

  // Resumen de una línea que reemplaza a los filtros cuando están ocultos.
  const filtersSummary = [
    activeGroup?.name ?? 'Solo yo',
    selectedIds?.length ? `${selectedIds.length} de ${memberIds.length} perfiles` : `${memberIds.length} ${memberIds.length === 1 ? 'perfil' : 'perfiles'}`,
    DATE_PRESETS.find((preset) => preset.value === datePreset)?.label,
    categories ? `${categories.length} categorías` : null,
    muscles ? `${muscles.length} músculos` : null,
  ].filter(Boolean).join(', ');

  const selectedMuscleIsFilteredOnly = muscles?.length === 1 && muscles[0] === selectedMuscle;
  const isLongRange = rangeDays > LONG_RANGE_DAYS;

  return (
    <div className="space-y-4 md:space-y-6">
      <SectionCard
        title="Filtros"
        subtitle={filtersOpen ? undefined : filtersSummary}
        actions={
          <IconButton
            label={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
            icon={filtersOpen ? ChevronUp : ChevronDown}
            onClick={() => { playClick(); setFiltersOpen((open) => !open); }}
          />
        }
      >
        {/* `hidden` (no desmontar): conserva los bloques desplegados cuando se vuelve a mostrar. */}
        <div hidden={!filtersOpen} aria-hidden={!filtersOpen}>
          <AnalyticsFilters
            groups={groups}
            scopeId={scopeId}
            onScopeChange={handleScopeChange}
            memberOptions={memberOptions}
            selectedUserIds={selectedIds?.length ? selectedIds : null}
            onUsersChange={(ids) => setUserSelection({ scopeId, ids })}
            categories={categories}
            onCategoriesChange={setCategories}
            muscles={muscles}
            onMusclesChange={(next) => setMuscles(next && next.every((id) => MUSCLE_IDS.includes(id)) ? next : null)}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            todayKey={todayKey}
            unifyDays={unifyDays}
            onUnifyDaysChange={setUnifyDays}
          />
          {groups.length === 0 && (
            <p className="mt-3 text-xs text-muted">Crea o únete a un grupo en la pestaña Grupos para comparar tu progreso con amigos.</p>
          )}
          {isLongRange && (
            <p className="mt-2 text-xs text-muted">Rangos largos descargan más registros (cuota gratuita de Firestore: 50.000 lecturas/día).</p>
          )}
        </div>
        {logsState.meta?.isTruncated && (
          <p className="mt-2 text-xs text-muted">Se muestran los registros más recientes; acota el rango para ver el detalle completo.</p>
        )}
        {logsState.error && <p className="mt-2 text-sm text-accent">{toUserMessage(logsState.error)}</p>}
      </SectionCard>

      {logsState.loading ? (
        <LoadingState
          label={`Cargando registros de ${memberIds.length} perfil${memberIds.length === 1 ? '' : 'es'}…`}
          hint="Con esos datos calculamos el mapa muscular y los gráficos según tus filtros."
        />
      ) : (
        <>
          <SectionCard
            title="Consistencia"
            subtitle="Ejercicios acumulados por perfil en el período, con tus filtros de categoría y músculo"
          >
            <ConsistencyChart seriesList={consistencySeries} domain={consistencyDomain} unifyDays={unifyDays} />
          </SectionCard>

          {effectiveUserIds.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="focus-user" className="text-sm font-semibold text-secondary">Mapa e indicadores de:</label>
              <select id="focus-user" className="input w-auto" value={focusId} onChange={(event) => setFocusChoice(event.target.value)}>
                <option value={AGGREGATE_FOCUS}>Promedio de la selección</option>
                {effectiveUserIds.map((id) => <option key={id} value={id}>{profilesById[id]?.username ?? '—'}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={CalendarDays} label="Días entrenados" value={focusMetrics.trainingDays} hint={`${focusName} · en el rango`} />
            <StatTile icon={Dumbbell} label="Tonelaje / semana" value={formatTonnage(focusMetrics.tonnagePerWeek)} hint="promedio en el rango" />
            <StatTile icon={Trophy} label="Récords" value={focusMetrics.records} hint="PRs de 1RM estimado" />
            <StatTile icon={Flame} label="Racha" value={focusMetrics.streak === null ? '—' : `${focusMetrics.streak} sem`} hint={focusMetrics.streak === null ? 'solo por perfil individual' : 'semanas consecutivas'} />
          </div>

          <SectionCard
            title="Mapa muscular"
            subtitle={`${focusName} · ${mapMode === 'stimulus' ? 'más verde = más series efectivas por semana' : 'verde = entrenado hace poco · rojo = un mes o más sin entrenar'}`}
            actions={
              <div className="flex flex-wrap gap-2">
                <SegmentedControl label="Modo del mapa" options={MAP_MODES} value={mapMode} onChange={setMapMode} />
              </div>
            }
          >
            <div className={`grid gap-4 ${selectedMuscle ? 'lg:grid-cols-2' : ''}`}>
              <MuscleMap
                gender={mapGender}
                mode={mapMode}
                weeklySetsByMuscle={focusMetrics.weeklySetsByMuscle}
                lastTrainedByMuscle={lastTrainedByMuscle}
                selectedMuscle={selectedMuscle}
                enabledMuscles={enabledMuscles}
                onSelect={setSelectedMuscle}
              />
              {selectedMuscle && (
                <MuscleDetailPanel
                  muscleId={selectedMuscle}
                  logs={filteredLogs}
                  users={focusId === AGGREGATE_FOCUS ? chartUsers : chartUsers.filter((item) => item.userId === focusId)}
                  rangeStart={range.since}
                  rangeEnd={rangeEnd}
                  weeklyAverage={focusMetrics.weeklySetsByMuscle[selectedMuscle] ?? 0}
                  lastTrained={lastTrainedByMuscle[selectedMuscle]}
                  isFilteredOnly={selectedMuscleIsFilteredOnly}
                  onFilterOnly={() => setMuscles([selectedMuscle])}
                  onClose={() => setSelectedMuscle(null)}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Series efectivas por músculo" subtitle={`Promedio semanal · ${focusName}`}>
            <MuscleSetsChart weeklySetsByMuscle={focusMetrics.weeklySetsByMuscle} highlightMuscle={selectedMuscle} enabledMuscles={enabledMuscles} onSelect={setSelectedMuscle} />
          </SectionCard>

          {hiddenCompared > 0 && (
            <p className="text-xs text-muted">
              Los gráficos comparativos muestran {MAX_COMPARED_USERS} perfiles como máximo; {hiddenCompared} quedan fuera (el promedio del mapa sí los incluye).
            </p>
          )}

          <SectionCard
            title="Progresión de fuerza"
            subtitle="Mejor 1RM estimado por sesión — la métrica más fiable de progreso real"
            actions={
              exerciseOptions.length > 0 && (
                <select aria-label="Ejercicio" className="input w-auto max-w-[240px]" value={activeExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
                  {exerciseOptions.map((exercise) => <option key={exercise} value={exercise}>{exercise}</option>)}
                </select>
              )
            }
          >
            <StrengthProgressChart seriesList={strengthSeries} unifyDays={unifyDays} />
          </SectionCard>

          <SectionCard title="Tonelaje semanal" subtitle="Series × reps × kg por semana (ejercicios que pasan los filtros)">
            <WeeklyVolumeChart rows={weeklyRows} users={chartUsers} />
          </SectionCard>
        </>
      )}
    </div>
  );
};

import { Medal, Search, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, SectionCard, SegmentedControl } from '../../components/ui';
import { QUERY_LIMITS } from '../../constants/collections';
import { useAppData } from '../../context/AppDataContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useToday } from '../../hooks/useToday';
import { subscribeToLogs } from '../../services/logService';
import { addDays, formatShortDate, parseDateKey } from '../../utils/dates';
import { toUserMessage } from '../../utils/errors';
import { countTrainingDays } from '../../utils/metrics';

const VIEWS = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'consistency', label: 'Constancia' },
  { value: 'records', label: 'Récords recientes' },
];

const RankBadge = ({ position }) => {
  const medalColors = ['#c99a06', '#8a8d91', '#b0703a'];
  if (position < 3) {
    return <Medal size={20} style={{ color: medalColors[position] }} aria-label={`Puesto ${position + 1}`} />;
  }
  return <span className="w-5 text-center text-sm font-bold text-muted">{position + 1}</span>;
};

const RankRow = ({ position, name, isMe, primary, secondary }) => (
  <li className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isMe ? 'bg-[var(--accent-soft)]' : ''}`}>
    <RankBadge position={position} />
    <span className={`flex-1 truncate text-sm font-bold ${isMe ? 'text-accent' : ''}`}>{name}{isMe && ' (tú)'}</span>
    <span className="text-right">
      <span className="block text-sm font-black">{primary}</span>
      {secondary && <span className="block text-xs text-muted">{secondary}</span>}
    </span>
  </li>
);

// Ranking de fuerza por 1RM estimado: compara series con distintas reps de forma justa
// (el original comparaba kg brutos sin reps: 100kg×1 "ganaba" a 95kg×10).
const StrengthRanking = () => {
  const { user, personalBests, profilesById } = useAppData();
  const [search, setSearch] = useState('');

  const exercises = useMemo(() => {
    const byExercise = {};
    Object.values(personalBests).forEach(({ userId, username, bests }) => {
      Object.entries(bests).forEach(([exercise, best]) => {
        if (!best?.e1rm) return;
        (byExercise[exercise] ??= []).push({ userId, name: profilesById[userId]?.username ?? username, ...best });
      });
    });
    return Object.entries(byExercise)
      .map(([exercise, entries]) => ({ exercise, entries: entries.sort((a, b) => b.e1rm - a.e1rm) }))
      .sort((a, b) => b.entries.length - a.entries.length || a.exercise.localeCompare(b.exercise));
  }, [personalBests, profilesById]);

  const filtered = exercises.filter(({ exercise }) => exercise.includes(search.trim().toUpperCase()));

  if (exercises.length === 0) {
    return <EmptyState icon={Trophy} title="Aún no hay marcas" description="Registra ejercicios con peso y reps para aparecer en el ranking." />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input className="input pl-9" placeholder="Buscar ejercicio" aria-label="Buscar ejercicio" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(({ exercise, entries }) => (
          <SectionCard key={exercise} title={exercise} subtitle={`${entries.length} participante(s) · 1RM estimado`}>
            <ol className="space-y-1">
              {entries.map((entry, index) => (
                <RankRow
                  key={entry.userId}
                  position={index}
                  name={entry.name}
                  isMe={entry.userId === user.id}
                  primary={`${entry.e1rm} kg`}
                  secondary={entry.reps ? `${entry.weight} kg × ${entry.reps}` : `${entry.weight} kg`}
                />
              ))}
            </ol>
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

// Constancia = días distintos entrenados, no cantidad de registros (el original premiaba "spamear" ejercicios).
const ConsistencyRanking = ({ logs }) => {
  const { user, profiles } = useAppData();
  const todayKey = useToday();

  const rows = useMemo(() => {
    const today = parseDateKey(todayKey);
    const since7 = addDays(today, -6);
    const since30 = addDays(today, -(QUERY_LIMITS.RANKING_LOOKBACK_DAYS - 1));
    return profiles
      .map((profile) => ({
        userId: profile.id,
        name: profile.username,
        days7: countTrainingDays(logs, profile.id, since7),
        days30: countTrainingDays(logs, profile.id, since30),
      }))
      .sort((a, b) => b.days30 - a.days30 || b.days7 - a.days7);
  }, [logs, profiles, todayKey]);

  return (
    <SectionCard title="Días entrenados" subtitle="Últimos 30 días (y últimos 7)">
      <ol className="space-y-1">
        {rows.map((row, index) => (
          <li key={row.userId}>
            <RankRow position={index} name={row.name} isMe={row.userId === user.id} primary={`${row.days30} días`} secondary={`${row.days7} esta semana`} />
            <div className="mx-3 mb-1 h-1.5 overflow-hidden rounded-full surface-2" aria-hidden>
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(row.days30 / QUERY_LIMITS.RANKING_LOOKBACK_DAYS) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
};

const RecentRecords = ({ logs }) => {
  const { user, profilesById } = useAppData();
  if (logs.length === 0) {
    return <EmptyState icon={Trophy} title="Sin récords recientes" description="Los PRs del grupo de los últimos 30 días aparecerán aquí." />;
  }
  return (
    <SectionCard title="Récords del grupo" subtitle="Últimos 30 días">
      <ul className="divide-y divide-[var(--border)]">
        {logs.slice(0, 30).map((log) => (
          <li key={log.id} className="flex items-center gap-3 py-2.5">
            <Trophy size={18} className="shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-bold">{profilesById[log.userId]?.username ?? log.username}{log.userId === user.id && ' (tú)'}</span>
                {' · '}{log.exercise}
              </p>
              <p className="text-xs text-muted">
                {log.weight} kg{log.reps ? ` × ${log.reps}` : ''} → {log.e1rm} kg 1RM est.
                {log.previousBest?.e1rm && ` (+${Math.round((log.e1rm - log.previousBest.e1rm) * 10) / 10} kg)`}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted">{formatShortDate(log.performedAt)}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};

export const RankingTab = () => {
  const [view, setView] = useState('strength');
  const todayKey = useToday();

  // Suscripción perezosa: solo se leen logs cuando la vista los necesita (Fuerza usa el agregado personalBests).
  const needsLogs = view !== 'strength';
  const logsState = useSubscription(
    needsLogs
      ? (onData, onError) =>
          subscribeToLogs(
            {
              since: addDays(parseDateKey(todayKey), -(QUERY_LIMITS.RANKING_LOOKBACK_DAYS - 1)),
              onlyRecords: view === 'records',
            },
            onData,
            onError,
          )
      : null,
    [view, todayKey],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-md"><SegmentedControl label="Tipo de ranking" options={VIEWS} value={view} onChange={setView} /></div>
      {logsState.error && <p className="text-center text-sm text-accent">{toUserMessage(logsState.error)}</p>}
      {view === 'strength' && <StrengthRanking />}
      {view === 'consistency' && (logsState.loading ? <div className="skeleton h-64" /> : <ConsistencyRanking logs={logsState.data} />)}
      {view === 'records' && (logsState.loading ? <div className="skeleton h-64" /> : <RecentRecords logs={logsState.data} />)}
    </div>
  );
};

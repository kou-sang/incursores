import { AlertTriangle, ArrowLeft, Camera, Lightbulb, ListOrdered, PlayCircle, Plus, Search, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, SectionCard } from '../../components/ui';
import { CATEGORIES, CATEGORY_LABELS, EXERCISE_CATALOG, MUSCLE_LABELS, searchExercises } from '../../constants/exercises';
import { getExerciseContent } from '../../constants/exerciseContent';
import { useTheme } from '../../context/ThemeContext';
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { playClick } from '../../utils/audio';
import { AddToRoutineDialog } from './AddToRoutineDialog';

const MAX_ALTERNATIVES = 6;

// Ejercicios cuyo músculo principal coincide (dato real del diccionario; no requiere contenido editorial).
const findAlternatives = (exercise) =>
  Object.values(EXERCISE_CATALOG)
    .filter((candidate) => candidate.name !== exercise.name && candidate.primaryMuscle === exercise.primaryMuscle)
    .slice(0, MAX_ALTERNATIVES);

const ComingSoon = () => <span className="badge surface-2 text-muted">Próximamente</span>;

const PlaceholderSection = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-xl border divider p-3">
    <header className="mb-2 flex items-center justify-between gap-2">
      <h4 className="flex items-center gap-2 text-sm font-bold"><Icon size={16} aria-hidden /> {title}</h4>
      <ComingSoon />
    </header>
    {children ?? <p className="text-sm text-muted">{description}</p>}
  </section>
);

const ExerciseList = ({ query, onQueryChange, category, onCategoryChange, selectedName, onSelect }) => {
  const results = useMemo(
    () => searchExercises(query).filter(({ entry }) => !category || entry.category === category),
    [query, category],
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input className="input pl-9" placeholder="Buscar (ej: pájaro, curl, sentadilla)" aria-label="Buscar ejercicio"
          value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </div>
      <select aria-label="Filtrar por categoría" className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="">Todas las categorías</option>
        {CATEGORIES.filter(({ id }) => id !== 'OTROS').map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
      </select>
      <p className="text-xs text-muted">{results.length} ejercicio(s)</p>
      {/* Lista con scroll propio: el buscador y los filtros quedan siempre visibles. */}
      <ul className="max-h-[60vh] overflow-y-auto overscroll-contain rounded-xl border divider lg:max-h-[calc(100dvh-20rem)]" aria-label="Ejercicios">
        {results.map(({ entry, matchedAlias }) => {
          const isSelected = entry.name === selectedName;
          return (
            <li key={entry.name}>
              <button type="button" aria-current={isSelected || undefined}
                className={`w-full border-b divider px-3 py-2.5 text-left last:border-b-0 ${isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface-2)]'}`}
                onClick={() => onSelect(entry.name)}>
                <span className={`block truncate text-sm font-bold ${isSelected ? 'text-accent' : ''}`}>{entry.name}</span>
                <span className="block truncate text-xs text-muted">
                  {CATEGORY_LABELS[entry.category]}{matchedAlias && ` · "${matchedAlias}"`}
                </span>
              </button>
            </li>
          );
        })}
        {results.length === 0 && <li className="p-4 text-center text-sm text-muted">Sin resultados.</li>}
      </ul>
    </div>
  );
};

const ExerciseDetail = ({ exercise, onBack, onSelect }) => {
  const { chart } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const content = getExerciseContent(exercise.name);
  const muscles = Object.entries(exercise.distribution).sort((a, b) => b[1] - a[1]);
  const alternatives = findAlternatives(exercise);

  return (
    <div className="space-y-4">
      {onBack && (
        <button type="button" className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} aria-hidden /> Volver a la lista</button>
      )}
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{CATEGORY_LABELS[exercise.category]}</p>
        <h2 className="text-xl font-black md:text-2xl">{exercise.name}</h2>
        {exercise.aliases.length > 0 && (
          <p className="mt-1 text-sm text-secondary">También conocido como: {exercise.aliases.slice(0, 4).join(' · ')}</p>
        )}
        <button type="button" className="btn btn-primary mt-3" onClick={() => { playClick(); setIsAdding(true); }}>
          <Plus size={16} aria-hidden /> Añadir a rutina
        </button>
      </header>
      {isAdding && <AddToRoutineDialog exerciseName={exercise.name} onClose={() => setIsAdding(false)} />}

      <SectionCard title="Músculos que trabaja" subtitle="Porcentaje del estímulo de cada serie (alimenta el mapa de Analíticas)">
        <ul className="space-y-2">
          {muscles.map(([muscleId, percent]) => (
            <li key={muscleId} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="font-semibold">{MUSCLE_LABELS[muscleId]}</span>
                <span className="font-bold">{percent}%</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full surface-2" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: chart.stimulus[4] }} />
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Fotos y video: espacios reservados con la proporción final para que el layout no salte al cargarlos. */}
      <div className="grid gap-3 md:grid-cols-2">
      <PlaceholderSection icon={Camera} title="Fotos">
        <div className="grid grid-cols-3 gap-2">
          {['Inicio', 'Mitad', 'Final'].map((label) => (
            <div key={label} className="flex aspect-square items-center justify-center rounded-lg surface-2 text-xs font-semibold text-muted">{label}</div>
          ))}
        </div>
      </PlaceholderSection>
      <PlaceholderSection icon={PlayCircle} title="Video">
        <div className="flex aspect-video items-center justify-center rounded-lg surface-2 text-muted">
          <PlayCircle size={40} aria-hidden />
        </div>
      </PlaceholderSection>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PlaceholderSection icon={ListOrdered} title="Técnica paso a paso" description={content?.steps?.join(' · ') ?? 'Ejecución detallada, fase por fase.'} />
        <PlaceholderSection icon={Lightbulb} title="Consejos" description={content?.tips?.join(' · ') ?? 'Claves para sentir el músculo objetivo y progresar.'} />
        <PlaceholderSection icon={AlertTriangle} title="Errores comunes" description={content?.mistakes?.join(' · ') ?? 'Fallos frecuentes y cómo corregirlos.'} />
        <section className="rounded-xl border divider p-3">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold"><Shuffle size={16} aria-hidden /> Alternativas</h4>
          {alternatives.length ? (
            <div className="flex flex-wrap gap-1.5">
              {alternatives.map((alternative) => (
                <button key={alternative.name} type="button" className="chip" onClick={() => onSelect(alternative.name)}>{alternative.name}</button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Sin alternativas con el mismo músculo principal.</p>
          )}
        </section>
      </div>
    </div>
  );
};

/**
 * Biblioteca de ejercicios. Versión inicial (maqueta): lista navegable + ficha con músculos reales;
 * fotos, video, técnica, consejos y errores quedan como "Próximamente" (ver constants/exerciseContent.js).
 */
export const ExerciseLibraryTab = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedName, setSelectedName] = useState(null);
  const selected = selectedName ? EXERCISE_CATALOG[selectedName] : null;

  const select = (name) => {
    playClick();
    setSelectedName(name);
    if (!isDesktop) window.scrollTo({ top: 0 });
  };

  const list = (
    <ExerciseList query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory}
      selectedName={selectedName} onSelect={select} />
  );

  // Móvil: lista o ficha (una a la vez). Escritorio: lista fija a la izquierda + ficha.
  if (!isDesktop) {
    return selected
      ? <ExerciseDetail exercise={selected} onBack={() => { playClick(); setSelectedName(null); }} onSelect={select} />
      : <div className="card p-4">{list}</div>;
  }

  return (
    <div className="grid grid-cols-[minmax(0,320px)_1fr] items-start gap-6">
      <div className="card sticky top-20 p-4">{list}</div>
      {selected
        ? <ExerciseDetail exercise={selected} onSelect={select} />
        : <EmptyState icon={Search} title="Elige un ejercicio" description="Verás los músculos que trabaja y, próximamente, fotos, video, consejos y errores comunes." />}
    </div>
  );
};

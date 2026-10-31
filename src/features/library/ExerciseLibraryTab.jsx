import { AlertTriangle, ArrowLeft, Camera, Lightbulb, ListOrdered, Activity, Plus, Search, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, SectionCard } from '../../components/ui';
import { CATEGORIES, CATEGORY_LABELS, EXERCISE_CATALOG, MUSCLE_LABELS, searchExercises } from '../../constants/exercises';
import { getExerciseGuide } from '../../constants/exerciseGuides';
import { useTheme } from '../../context/ThemeContext';
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { playClick } from '../../utils/audio';
import { AddToRoutineDialog } from './AddToRoutineDialog';
import { ExerciseFigure } from './ExerciseFigure';
import { ExerciseMuscleMap } from './ExerciseMuscleMap';

const MAX_ALTERNATIVES = 6;

// Ejercicios cuyo músculo principal coincide (dato real del diccionario; no requiere contenido editorial).
const findAlternatives = (exercise) =>
  Object.values(EXERCISE_CATALOG)
    .filter((candidate) => candidate.name !== exercise.name && candidate.primaryMuscle === exercise.primaryMuscle)
    .slice(0, MAX_ALTERNATIVES);

// Bloque de la ficha con título e ícono; `ordered` numera los pasos (son una secuencia real).
const GuideSection = ({ icon: Icon, title, items, ordered = false, tone }) => {
  const List = ordered ? 'ol' : 'ul';
  return (
    <section className="rounded-xl border divider p-3 md:p-4">
      <h4 className={`mb-2 flex items-center gap-2 text-sm font-bold ${tone === 'warning' ? 'text-accent' : ''}`}>
        <Icon size={16} aria-hidden /> {title}
      </h4>
      <List className={`space-y-1.5 pl-5 text-sm text-secondary ${ordered ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  );
};

const ExerciseList = ({ query, onQueryChange, category, onCategoryChange, selectedName, onSelect }) => {
  const results = useMemo(
    () => searchExercises(query).filter(({ entry }) => !category || entry.category === category),
    [query, category],
  );
  return (
    <div className="flex flex-col gap-3">
      {/*
        Móvil: la lista NO tiene scroll propio (antes su final quedaba debajo de la barra de navegación inferior);
        se desplaza con la página y el buscador queda fijo debajo del encabezado. Escritorio: lista con scroll propio.
      */}
      <div className="library-search sticky z-10 -mx-4 space-y-2 px-4 pb-2 pt-1 lg:static lg:mx-0 lg:px-0 lg:pb-0 lg:pt-0">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input pl-9" placeholder="Buscar (ej: pájaro, curl, sentadilla)" aria-label="Buscar ejercicio"
            value={query} onChange={(event) => onQueryChange(event.target.value)} />
        </div>
        <select aria-label="Filtrar por categoría" className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.filter(({ id }) => id !== 'OTROS').map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <p className="text-xs text-muted">{results.length} ejercicio(s)</p>
            <ul className="rounded-xl border divider lg:max-h-[calc(100dvh-20rem)] lg:overflow-y-auto lg:overscroll-contain" aria-label="Ejercicios">
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
  const guide = getExerciseGuide(exercise.name);
  const muscles = Object.entries(exercise.distribution).sort((a, b) => b[1] - a[1]);
  const alternatives = findAlternatives(exercise);

  return (
    <div className="min-w-0 space-y-4">
      {onBack && (
        <button type="button" className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} aria-hidden /> Volver a la lista</button>
      )}
      <header>
        <p className="text-xs font-bold text-muted">{CATEGORY_LABELS[exercise.category]}</p>
        <h2 className="text-xl font-black md:text-2xl">{exercise.name}</h2>
        {exercise.aliases.length > 0 && (
          <p className="mt-1 text-sm text-secondary">También conocido como: {exercise.aliases.slice(0, 4).join(', ')}</p>
        )}
        <button type="button" className="btn btn-primary mt-3" onClick={() => { playClick(); setIsAdding(true); }}>
          <Plus size={16} aria-hidden /> Añadir a rutina
        </button>
      </header>
      {isAdding && <AddToRoutineDialog exerciseName={exercise.name} onClose={() => setIsAdding(false)} />}

      <SectionCard title={<span className="flex items-center gap-2"><Camera size={18} aria-hidden /> Ejecución</span>} subtitle="Posición de inicio, mitad del recorrido y final">
        <ExerciseFigure exerciseName={exercise.name} />
      </SectionCard>

      <SectionCard title={<span className="flex items-center gap-2"><Activity size={18} aria-hidden /> Músculos que trabaja</span>} subtitle="Porcentaje del estímulo de cada serie (el mismo que usan tus Analíticas)">
        <div className="grid gap-4 lg:grid-cols-2">
          <ExerciseMuscleMap distribution={exercise.distribution} />
          <ul className="space-y-2">
            {muscles.map(([muscleId, percent]) => (
              <li key={muscleId} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="min-w-0 font-semibold">{MUSCLE_LABELS[muscleId]}</span>
                  <span className="shrink-0 font-bold">{percent}%</span>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full surface-2" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, background: chart.stimulus[4] }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {guide && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><GuideSection icon={ListOrdered} title="Técnica paso a paso" items={guide.steps} ordered /></div>
          <GuideSection icon={Lightbulb} title="Consejos" items={guide.tips} />
          <GuideSection icon={AlertTriangle} title="Errores comunes" items={guide.mistakes} tone="warning" />
        </div>
      )}

      <section className="rounded-xl border divider p-3 md:p-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold"><Shuffle size={16} aria-hidden /> Alternativas (mismo músculo principal)</h4>
        {alternatives.length ? (
          <div className="flex flex-wrap gap-1.5">
            {alternatives.map((alternative) => (
              <button key={alternative.name} type="button" className="chip max-w-full truncate" onClick={() => onSelect(alternative.name)}>{alternative.name}</button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sin alternativas con el mismo músculo principal.</p>
        )}
      </section>
    </div>
  );
};

/**
 * Biblioteca de ejercicios: lista navegable + ficha con ilustraciones del movimiento, diagrama de músculos,
 * técnica, consejos y errores comunes (ver constants/exerciseGuides.js y constants/exercisePoses.js).
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
    <div className="grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] items-start gap-6">
      <div className="card sticky top-20 p-4">{list}</div>
      {selected
        ? <ExerciseDetail exercise={selected} onSelect={select} />
        : <EmptyState icon={Search} title="Elige un ejercicio" description="Verás cómo se ejecuta, qué músculos trabaja, la técnica paso a paso, consejos y errores comunes." />}
    </div>
  );
};

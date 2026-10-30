import { ChevronDown } from 'lucide-react';
import { FieldLabel, SegmentedControl } from '../../components/ui';
import { CATEGORIES, musclesOfCategory } from '../../constants/muscles';
import { playClick } from '../../utils/audio';

const DATE_PRESETS = Object.freeze([
  { value: 'week', label: 'Última semana' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
]);

/*
 * Multiselección con chip "Todos". `value === null` significa todos.
 * Tocar un ítem con "Todos" activo selecciona solo ese ítem; vaciar la selección vuelve a "Todos".
 */
const toggleInSelection = (selection, item) => {
  if (!selection) return [item];
  const next = selection.includes(item) ? selection.filter((value) => value !== item) : [...selection, item];
  return next.length === 0 ? null : next;
};

const ChipGroup = ({ label, options, value, onChange, allLabel = 'Todos', showAll = true }) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
    {showAll && (
      <button type="button" className="chip" aria-pressed={value === null} onClick={() => { playClick(); onChange(null); }}>
        {allLabel}
      </button>
    )}
    {options.map((option) => {
      const isSelected = Boolean(value?.includes(option.value));
      return (
        <button key={option.value} type="button" className="chip flex items-center gap-1.5" aria-pressed={isSelected}
          disabled={option.disabled} title={option.title}
          onClick={() => { playClick(); onChange(toggleInSelection(value, option.value)); }}
          // El color de serie va en un punto: el texto conserva contraste (amarillo/blanco fallaba como fondo).
          style={isSelected && option.color ? { background: 'var(--surface)', color: 'var(--text)', borderColor: option.color } : undefined}>
          {option.color && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: option.color }} aria-hidden />}
          {option.label}
        </button>
      );
    })}
  </div>
);

const FilterBlock = ({ title, summary, children, collapsible = false }) =>
  collapsible ? (
    <details className="group rounded-xl border divider px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-secondary">
        <span>{title} <span className="font-semibold text-muted">· {summary}</span></span>
        <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  ) : (
    <div>
      <p className="mb-1.5 text-xs font-bold text-secondary">{title} <span className="font-semibold text-muted">· {summary}</span></p>
      {children}
    </div>
  );

const summarize = (value, total, noun) => (value === null ? `todos (${total})` : `${value.length} de ${total} ${noun}`);

export const AnalyticsFilters = ({
  groups,
  scopeId,
  onScopeChange,
  memberOptions,
  selectedUserIds,
  onUsersChange,
  categories,
  onCategoriesChange,
  muscles,
  onMusclesChange,
  datePreset,
  onDatePresetChange,
  customRange,
  onCustomRangeChange,
  todayKey,
}) => {
  const muscleCount = CATEGORIES.reduce((sum, category) => sum + musclesOfCategory(category.id).length, 0);
  const customInvalid = datePreset === 'custom' && customRange.from && customRange.to && customRange.from > customRange.to;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,240px)_1fr]">
        <div>
          <FieldLabel htmlFor="analytics-group">Grupo</FieldLabel>
          <select id="analytics-group" className="input" value={scopeId} onChange={(event) => onScopeChange(event.target.value)}>
            <option value="self">Solo yo</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name} ({group.memberIds.length})</option>)}
          </select>
        </div>
        <FilterBlock title="Perfiles del grupo" summary={summarize(selectedUserIds, memberOptions.length, 'perfiles')}>
          <ChipGroup label="Perfiles" options={memberOptions} value={selectedUserIds} onChange={onUsersChange} />
        </FilterBlock>
      </div>

      <FilterBlock title="Fechas" summary={DATE_PRESETS.find((preset) => preset.value === datePreset)?.label}>
        <SegmentedControl label="Rango de fechas" options={DATE_PRESETS} value={datePreset} onChange={onDatePresetChange} />
        {datePreset === 'custom' && (
          // Selector de calendario nativo: en móvil abre el calendario del sistema (mejor UX que uno propio).
          <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md">
            <div>
              <FieldLabel htmlFor="range-from">Desde</FieldLabel>
              <input id="range-from" type="date" className="input" max={customRange.to || todayKey} value={customRange.from}
                aria-invalid={customInvalid} onChange={(event) => onCustomRangeChange({ ...customRange, from: event.target.value })} />
            </div>
            <div>
              <FieldLabel htmlFor="range-to">Hasta</FieldLabel>
              <input id="range-to" type="date" className="input" min={customRange.from || undefined} max={todayKey} value={customRange.to}
                aria-invalid={customInvalid} onChange={(event) => onCustomRangeChange({ ...customRange, to: event.target.value })} />
            </div>
            {customInvalid && <p className="col-span-2 text-xs font-semibold text-accent">"Desde" debe ser anterior a "Hasta".</p>}
          </div>
        )}
      </FilterBlock>

      <FilterBlock title="Categorías" summary={summarize(categories, CATEGORIES.length, 'categorías')} collapsible>
        <ChipGroup label="Categorías" allLabel="Todas" options={CATEGORIES.map(({ id, label }) => ({ value: id, label }))}
          value={categories} onChange={onCategoriesChange} />
      </FilterBlock>

      <FilterBlock title="Músculos individuales" summary={summarize(muscles, muscleCount, 'músculos')} collapsible>
        <div className="space-y-2">
          <ChipGroup label="Todos los músculos" allLabel="Todos los músculos" options={[]} value={muscles} onChange={onMusclesChange} />
          {CATEGORIES.filter(({ id }) => musclesOfCategory(id).length > 0).map((category) => (
            <div key={category.id}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">{category.label}</p>
              <ChipGroup label={category.label} showAll={false}
                options={musclesOfCategory(category.id).map((muscle) => ({ value: muscle.id, label: muscle.short, title: muscle.label }))}
                value={muscles} onChange={onMusclesChange} />
            </div>
          ))}
        </div>
      </FilterBlock>
    </div>
  );
};

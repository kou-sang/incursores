import { Dumbbell } from 'lucide-react';
import { playClick } from '../utils/audio';

export const BRAND_NAME = 'Colossus'; // Antes: "COLOSSUS" en login/desktop e "Incursores" en móvil.

export const BrandMark = ({ size = 24, showName = true }) => (
  <div className="flex items-center gap-2">
    <Dumbbell className="text-accent" size={size} aria-hidden />
    {showName && <span className="text-lg font-black tracking-tight">{BRAND_NAME}</span>}
  </div>
);

export const Spinner = ({ label }) => (
  <div className="flex flex-col items-center gap-3" role="status">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
    {label && <p className="text-sm font-semibold text-muted">{label}</p>}
  </div>
);

export const FullScreenLoader = ({ label = 'Cargando…' }) => (
  <div className="flex min-h-[100dvh] items-center justify-center">
    <Spinner label={label} />
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card flex flex-col items-center gap-2 p-8 text-center">
    {Icon && <Icon size={32} className="text-muted" aria-hidden />}
    <h3 className="text-base font-bold">{title}</h3>
    {description && <p className="max-w-sm text-sm text-secondary">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const SegmentedControl = ({ options, value, onChange, label }) => (
  <div className="segmented overflow-x-auto" role="tablist" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={value === option.value}
        onClick={() => {
          playClick();
          onChange(option.value);
        }}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const IconButton = ({ label, icon: Icon, onClick, tone, disabled, size = 18 }) => (
  <button
    type="button"
    className={`icon-btn ${tone === 'danger' ? 'danger' : ''}`}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={size} aria-hidden />
  </button>
);

export const StatTile = ({ label, value, hint, icon: Icon }) => (
  <div className="card flex flex-col gap-1 p-4">
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
      {Icon && <Icon size={14} aria-hidden />}
      {label}
    </span>
    <span className="text-2xl font-black leading-tight">{value}</span>
    {hint && <span className="text-xs text-secondary">{hint}</span>}
  </div>
);

export const SectionCard = ({ title, subtitle, actions, children, className = '' }) => (
  <section className={`card p-4 md:p-5 ${className}`}>
    {(title || actions) && (
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          {title && <h3 className="text-base font-bold md:text-lg">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-secondary md:text-sm">{subtitle}</p>}
        </div>
        {actions}
      </header>
    )}
    {children}
  </section>
);

export const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-secondary">
    {children}
  </label>
);

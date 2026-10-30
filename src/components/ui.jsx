import { useEffect, useState } from 'react';
import { playClick } from '../utils/audio';

export const BRAND_NAME = 'Colossus';

/*
 * Isotipo de Colossus: una "C" grande que contiene otra "C" más chica (crecer, sumar peso).
 * Misma geometría que public/favicon.svg (fuente: public/brand/colossus-mark.svg).
 * La "C" grande usa el color del texto y la interior el acento del tema.
 */
export const LogoMark = ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden focusable="false">
    <g transform="translate(14 0)">
      <path d="M369.4 351.1A148 148 0 1 1 369.4 160.9" fill="none" stroke="currentColor" strokeWidth="88" />
      <path d="M300.4 293.3A58 58 0 1 1 300.4 218.7" fill="none" stroke="var(--accent)" strokeWidth="44" />
    </g>
  </svg>
);

export const BrandMark = ({ size = 28, showName = true }) => (
  <div className="flex items-center gap-2">
    <LogoMark size={size} />
    {showName && <span className="text-lg font-black tracking-tight">{BRAND_NAME}</span>}
  </div>
);

// Pasado este tiempo se avisa que la operación sigue en curso (red lenta / primer arranque en frío).
const SLOW_LOADING_MS = 4000;

const useIsSlow = (delay = SLOW_LOADING_MS) => {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return isSlow;
};

/**
 * Rueda + texto que explica QUÉ se está haciendo ("Cargando tus rutinas…") y, si tarda,
 * una aclaración para que el usuario sepa que no se colgó.
 */
export const Spinner = ({ label, hint, slowHint = 'Está tardando más de lo normal; seguimos intentando…', size = 'md' }) => {
  const isSlow = useIsSlow();
  const dimension = size === 'sm' ? 'h-6 w-6' : 'h-10 w-10';
  return (
    <div className="flex flex-col items-center gap-3 text-center" role="status" aria-live="polite">
      <div className={`${dimension} animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]`} aria-hidden />
      {label && <p className="text-sm font-semibold text-secondary">{label}</p>}
      {hint && <p className="max-w-xs text-xs text-muted">{hint}</p>}
      {isSlow && slowHint && <p className="max-w-xs text-xs text-muted">{slowHint}</p>}
    </div>
  );
};

export const LoadingState = ({ label, hint, className = '' }) => (
  <div className={`card flex justify-center px-4 py-10 ${className}`}>
    <Spinner label={label} hint={hint} />
  </div>
);

// Indicador compacto para botones: el texto del botón describe la acción en curso.
export const InlineSpinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
);

export const FullScreenLoader = ({ label = 'Cargando…', hint }) => (
  <div className="flex min-h-[100dvh] items-center justify-center p-4">
    <Spinner label={label} hint={hint} />
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

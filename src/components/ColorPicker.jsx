import { ChevronDown, RotateCcw } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { normalizeHex } from '../context/ThemeContext';
import { hexToHsv, hsvToHex } from '../utils/colors';

// Sugerencias neutras y de acento (independientes del campo): cubren fondos oscuros/claros y acentos frecuentes.
const SUGGESTED_COLORS = Object.freeze([
  '#0d0d0d', '#1a1a19', '#2b2b2a', '#f6f6f4', '#ffffff', '#e2e2e0',
  '#d32f2f', '#ef5350', '#f57c00', '#f9a825', '#2e7d32', '#00897b',
  '#1e88e5', '#3949ab', '#8e24aa', '#d81b60',
]);

const KEYBOARD_STEP = 0.02;
const clamp01 = (value) => Math.min(1, Math.max(0, value));

const Swatch = ({ hex, isActive, onPick }) => (
  <button
    type="button"
    className={`h-7 w-7 rounded-lg border divider transition-transform hover:scale-110 ${isActive ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)]' : ''}`}
    style={{ background: hex }}
    aria-label={`Usar ${hex}`}
    title={hex}
    onClick={() => onPick(hex)}
  />
);

/**
 * Selector de color propio (reemplaza al <input type="color"> nativo, que se ve distinto en cada sistema).
 * Área de saturación/brillo + barra de tono + HEX + colores recientes y sugeridos.
 * `onChange` se llama en vivo (vista previa); `onCommit` cuando el usuario termina de elegir (se guarda en recientes).
 */
export const ColorPicker = ({ label, value, isCustom, recentColors = [], onChange, onCommit, onReset }) => {
  const panelId = useId();
  const hexInputId = useId();
  const areaRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  // El tono se guarda aparte: en grises (saturación 0) el HEX no lo conserva y la barra "saltaría" a rojo.
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [lastValue, setLastValue] = useState(value);
  const [hexDraft, setHexDraft] = useState(value);

  if (value !== lastValue) {
    // Sincroniza si el color cambió desde afuera (reset, otro dispositivo, swatch).
    setLastValue(value);
    setHexDraft(value);
    const next = hexToHsv(value);
    setHsv((current) => (next.s === 0 ? { ...next, h: current.h } : next));
  }

  const applyHsv = (next) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setLastValue(hex);
    setHexDraft(hex);
    onChange(hex);
  };

  const pick = (hex) => {
    applyHsv(hexToHsv(hex));
    onCommit?.(hex);
  };

  const updateFromPointer = (event) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    applyHsv({ h: hsv.h, s: clamp01((event.clientX - rect.left) / rect.width), v: clamp01(1 - (event.clientY - rect.top) / rect.height) });
  };

  const handleAreaKeyDown = (event) => {
    const deltas = { ArrowLeft: [-KEYBOARD_STEP, 0], ArrowRight: [KEYBOARD_STEP, 0], ArrowUp: [0, KEYBOARD_STEP], ArrowDown: [0, -KEYBOARD_STEP] };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    applyHsv({ h: hsv.h, s: clamp01(hsv.s + delta[0]), v: clamp01(hsv.v + delta[1]) });
  };

  const commitCurrent = () => onCommit?.(hsvToHex(hsv));
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const isHexValid = Boolean(normalizeHex(hexDraft));

  return (
    <div className="py-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-xl px-1 text-left hover:bg-[var(--surface-2)]"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="h-9 w-9 shrink-0 rounded-lg border divider shadow-sm" style={{ background: value }} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{label}</span>
            <span className="text-xs text-muted">{isCustom ? 'Personalizado' : 'Predeterminado'} · <span className="font-mono uppercase">{value}</span></span>
          </span>
          <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        <button type="button" className="icon-btn shrink-0" aria-label={`Restablecer ${label}`} title="Restablecer" disabled={!isCustom} onClick={onReset}>
          <RotateCcw size={16} aria-hidden />
        </button>
      </div>

      {isOpen && (
        <div id={panelId} className="mt-2 space-y-3 rounded-xl border divider surface-2 p-3">
          {/* Área saturación (X) × brillo (Y) sobre el tono elegido. */}
          <div
            ref={areaRef}
            role="slider"
            tabIndex={0}
            aria-label={`${label}: saturación y brillo`}
            aria-valuetext={`Saturación ${Math.round(hsv.s * 100)}%, brillo ${Math.round(hsv.v * 100)}%`}
            className="relative h-36 w-full cursor-crosshair touch-none rounded-lg"
            style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateFromPointer(event);
            }}
            onPointerMove={(event) => event.buttons === 1 && updateFromPointer(event)}
            onPointerUp={commitCurrent}
            onKeyDown={handleAreaKeyDown}
            onKeyUp={(event) => event.key.startsWith('Arrow') && commitCurrent()}
          >
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }}
              aria-hidden
            />
          </div>

          <input
            type="range"
            min="0"
            max="359"
            step="1"
            className="hue-slider w-full"
            aria-label={`${label}: tono`}
            value={Math.round(hsv.h)}
            onChange={(event) => applyHsv({ ...hsv, h: Number(event.target.value) })}
            onPointerUp={commitCurrent}
            onKeyUp={commitCurrent}
          />

          <div className="flex items-center gap-2">
            <label htmlFor={hexInputId} className="text-xs font-bold text-secondary">HEX</label>
            <input
              id={hexInputId}
              className="input min-h-[38px] flex-1 font-mono uppercase"
              maxLength={7}
              spellCheck={false}
              aria-invalid={!isHexValid}
              value={hexDraft}
              onChange={(event) => {
                setHexDraft(event.target.value);
                const hex = normalizeHex(event.target.value);
                if (hex) applyHsv(hexToHsv(hex));
              }}
              onBlur={() => (isHexValid ? commitCurrent() : setHexDraft(value))}
            />
          </div>

          {recentColors.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-secondary">Tus últimos colores</p>
              <div className="flex flex-wrap gap-1.5">
                {recentColors.map((hex) => <Swatch key={hex} hex={hex} isActive={hex === value} onPick={pick} />)}
              </div>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-bold text-secondary">Sugeridos</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_COLORS.map((hex) => <Swatch key={hex} hex={hex} isActive={hex === value} onPick={pick} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

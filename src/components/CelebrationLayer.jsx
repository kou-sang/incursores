import { AnimatePresence, m, useReducedMotion } from 'framer-motion';

// Capa visual de los festejos. Estado, azar y sonido viven en useCelebration.js.
const CONFETTI_COLORS = ['var(--accent)', '#2a78d6', '#1baf7a', '#eda100', '#e87ba4'];

// ───────── Variantes ─────────

const Sparks = () => (
  <>
    {Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      const distance = 46 + (index % 2) * 14;
      return (
        <m.svg key={index} width="12" height="12" viewBox="0 0 12 12" className="absolute -left-1.5 -top-1.5"
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
          animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: 1, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}>
          <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" fill={index % 2 ? 'var(--accent)' : '#eda100'} />
        </m.svg>
      );
    })}
  </>
);

const CheckRipple = () => (
  <>
    <m.span className="absolute -left-9 -top-9 h-[72px] w-[72px] rounded-full border-2 border-[var(--good)]"
      initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
    <m.svg width="36" height="36" viewBox="0 0 36 36" className="absolute -left-[18px] -top-[18px]"
      initial={{ scale: 0, opacity: 1 }} animate={{ scale: [0, 1.15, 1], opacity: [1, 1, 0] }} transition={{ duration: 1.1, times: [0, 0.25, 1] }}>
      <circle cx="18" cy="18" r="18" fill="var(--good)" />
      <m.path d="M10 18.5 L15.5 24 L26 12.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
    </m.svg>
  </>
);

const MiniConfetti = () => (
  <>
    {Array.from({ length: 12 }, (_, index) => {
      const spread = (index - 5.5) * 11;
      return (
        <m.span key={index} className="absolute -left-0.5 -top-1 h-2 w-1 rounded-[1px]" style={{ background: CONFETTI_COLORS[index % CONFETTI_COLORS.length] }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: spread, y: [0, -70 - (index % 3) * 14, -30], rotate: spread * 8, opacity: [1, 1, 0] }}
          transition={{ duration: 1.1, ease: 'easeOut' }} />
      );
    })}
  </>
);

const Badge = ({ phrase, isRecord }) => (
  <m.span className="card absolute -top-5 left-0 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-sm font-black"
    initial={{ y: 6, opacity: 0, scale: 0.9 }} animate={{ y: -34, opacity: [0, 1, 1, 0], scale: 1 }} transition={{ duration: 1.3, times: [0, 0.15, 0.75, 1] }}>
    {isRecord ? '🏆 ¡Nuevo PR!' : `💪 ${phrase}`}
  </m.span>
);

const PulseRings = () => (
  <>
    {[0, 1, 2].map((index) => (
      <m.span key={index} className="absolute -left-6 -top-6 h-12 w-12 rounded-full border-2 border-[var(--accent)]"
        initial={{ scale: 0.3, opacity: 0.9 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.9, delay: index * 0.15, ease: 'easeOut' }} />
    ))}
  </>
);

const VARIANT_COMPONENTS = { sparks: Sparks, check: CheckRipple, confetti: MiniConfetti, badge: Badge, pulse: PulseRings };

// Etiqueta extra para récords en variantes sin texto (la de "badge" ya lo dice).
const RecordTag = () => (
  <m.span className="badge badge-accent absolute left-0 top-8 -translate-x-1/2 whitespace-nowrap"
    initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 1, 0], y: 8 }} transition={{ duration: 1.3, times: [0, 0.2, 0.8, 1] }}>
    🏆 Nuevo PR
  </m.span>
);

export const CelebrationLayer = ({ celebrations }) => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {celebrations.map((item) => {
          const Variant = reduceMotion ? CheckRipple : VARIANT_COMPONENTS[item.variant];
          return (
            <m.div key={item.id} className="absolute" style={{ left: item.origin.x, top: item.origin.y }} exit={{ opacity: 0 }}>
              <Variant phrase={item.phrase} isRecord={item.isRecord} />
              {item.isRecord && item.variant !== 'badge' && <RecordTag />}
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

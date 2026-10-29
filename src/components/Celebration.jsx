import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const EMOJI_SETS = {
  confetti: ['🎊', '🎉', '✨'],
  strength: ['💪', '🏋️', '🔥'],
  record: ['🏆', '🥇', '🚀', '👑'],
};
const PARTICLE_COUNT = 10;
const DURATION_MS = 2200;

// Hook + capa visual. El original no limpiaba los setTimeout al desmontar y leía window en render.
export const useCelebration = () => {
  const [particles, setParticles] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const celebrate = useCallback((isRecord = false) => {
    const keys = Object.keys(EMOJI_SETS).filter((key) => key !== 'record');
    const set = isRecord ? EMOJI_SETS.record : EMOJI_SETS[keys[Math.floor(Math.random() * keys.length)]];
    const width = window.innerWidth;
    const batchId = Date.now();
    const batch = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
      id: `${batchId}-${index}`,
      batchId,
      emoji: set[Math.floor(Math.random() * set.length)],
      x: (Math.random() - 0.5) * width * 0.8,
      rotation: (Math.random() - 0.5) * 360,
      delay: Math.random() * 0.2,
    }));
    setParticles((current) => [...current, ...batch]);
    timersRef.current.push(
      setTimeout(() => setParticles((current) => current.filter((particle) => particle.batchId !== batchId)), DURATION_MS),
    );
  }, []);

  return { particles, celebrate };
};

export const CelebrationLayer = ({ particles }) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute left-1/2 top-0 text-3xl md:text-5xl"
            initial={{ opacity: 1, x: 0, y: -40, rotate: 0, scale: 0.6 }}
            animate={{ opacity: 0, x: particle.x, y: '90vh', rotate: particle.rotation, scale: 1.3 }}
            transition={{ duration: 2, delay: particle.delay, ease: 'easeOut' }}
          >
            {particle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

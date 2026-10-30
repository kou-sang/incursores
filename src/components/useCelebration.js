import { useCallback, useEffect, useRef, useState } from 'react';
import { playCelebration } from '../utils/audio';

/*
 * Festejos sutiles al completar un ejercicio: 5 variantes elegidas al azar (sin repetir la anterior),
 * cada una con su sonido. Se dibujan alrededor del punto donde el usuario tocó (≈120 px), no a pantalla completa.
 * El sonido respeta el botón de silencio; la animación respeta prefers-reduced-motion.
 */
export const CELEBRATION_VARIANTS = Object.freeze(['sparks', 'check', 'confetti', 'badge', 'pulse']);

const DURATION_MS = 1400;
const POINTER_MAX_AGE_MS = 4000;
const EDGE_MARGIN = 70;
const PHRASES = ['¡Bien ahí!', '¡Uno menos!', '¡Vamos!', '¡Crack!', '¡Sumando!', '¡Así se hace!'];

const pickVariant = (previous) => {
  const options = CELEBRATION_VARIANTS.map((_, index) => index).filter((index) => index !== previous);
  return options[Math.floor(Math.random() * options.length)];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const useCelebration = () => {
  const [celebrations, setCelebrations] = useState([]);
  const timersRef = useRef([]);
  const lastVariantRef = useRef(null);
  const pointerRef = useRef(null);

  // Último toque/click: el festejo nace donde el usuario presionó "Guardar".
  useEffect(() => {
    const handlePointer = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, at: Date.now() };
    };
    window.addEventListener('pointerdown', handlePointer, { passive: true });
    const timers = timersRef.current;
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      timers.forEach(clearTimeout);
    };
  }, []);

  const celebrate = useCallback((isRecord = false) => {
    try {
      const variant = pickVariant(lastVariantRef.current);
      lastVariantRef.current = variant;
      playCelebration(variant, isRecord);

      const pointer = pointerRef.current;
      const isFresh = pointer && Date.now() - pointer.at < POINTER_MAX_AGE_MS;
      const origin = {
        x: clamp(isFresh ? pointer.x : window.innerWidth / 2, EDGE_MARGIN, window.innerWidth - EDGE_MARGIN),
        y: clamp(isFresh ? pointer.y : window.innerHeight - 140, EDGE_MARGIN + 40, window.innerHeight - EDGE_MARGIN),
      };
      const id = `${Date.now()}-${Math.random()}`;
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      setCelebrations((current) => [...current.slice(-2), { id, variant: CELEBRATION_VARIANTS[variant], origin, isRecord, phrase }]);
      timersRef.current.push(setTimeout(() => setCelebrations((current) => current.filter((item) => item.id !== id)), DURATION_MS));
    } catch {
      // Decorativo: nunca debe interrumpir el registro.
    }
  }, []);

  return { celebrations, celebrate };
};

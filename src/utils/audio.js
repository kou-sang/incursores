// Bug original: se creaba un AudioContext nuevo por cada click y nunca se cerraba.
// Chrome limita los contextos simultáneos y emite warnings; aquí se reutiliza uno solo.

const STORAGE_KEY = 'colossus:sound-enabled';
let audioContext = null;
let soundEnabled = readSoundPreference();

function readSoundPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export const isSoundEnabled = () => soundEnabled;

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Storage bloqueado (modo privado): la preferencia vive solo en memoria.
  }
};

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = new AudioContextClass();
  return audioContext;
};

const playTones = (frequencies, { type = 'sine', gain = 0.03, step = 0.08, duration = 0.18 } = {}) => {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    // Política de autoplay: el contexto puede nacer suspendido hasta una interacción.
    if (context.state === 'suspended') context.resume().catch(() => {});

    frequencies.forEach((frequency, index) => {
      const startAt = context.currentTime + index * step;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gainNode.gain.setValueAtTime(gain, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
      oscillator.connect(gainNode).connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    });
  } catch {
    // El audio es decorativo: un fallo nunca debe interrumpir el flujo.
  }
};

export const playClick = () => playTones([440], { gain: 0.02, duration: 0.05 });

export const playSuccess = (isPersonalRecord = false) =>
  playTones(isPersonalRecord ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25], { type: 'triangle', gain: 0.05 });

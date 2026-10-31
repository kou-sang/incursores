import { Info, Lightbulb, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { IconButton } from './ui';
import { playClick } from '../utils/audio';

/*
 * Botón (i) de cada gráfico: abre una ventana con cómo se calcula, cómo leerlo y un consejo.
 * Ventana modal (no tooltip): en el celular un tooltip se sale de la pantalla y no se puede leer con calma.
 * `info`: { title, how: string[], read: string[], tip: string }
 */
export const ChartInfo = ({ info }) => {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => event.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!info) return null;

  return (
    <>
      <IconButton label={`Cómo leer: ${info.title}`} icon={Info} onClick={() => { playClick(); setIsOpen(true); }} />
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="dialog-panel card w-full max-w-lg p-5 text-left" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 id={titleId} className="text-lg font-bold">{info.title}</h2>
              <IconButton label="Cerrar" icon={X} onClick={() => setIsOpen(false)} />
            </div>
            <h3 className="mb-1 text-sm font-bold">Cómo se calcula</h3>
            <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-secondary">
              {info.how.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <h3 className="mb-1 text-sm font-bold">Cómo interpretarlo</h3>
            <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-secondary">
              {info.read.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <p className="flex gap-2 rounded-xl bg-[var(--accent-soft)] p-3 text-sm">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <span><strong>Consejo:</strong> {info.tip}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

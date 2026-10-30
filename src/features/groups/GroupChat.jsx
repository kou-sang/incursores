import { Download, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InlineSpinner, IconButton } from '../../components/ui';
import { CHAT_LIMITS } from '../../constants/collections';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useSubscription } from '../../hooks/useSubscription';
import { deleteGroupMessage, sendRoutineMessage, stripEmojis, subscribeToGroupMessages } from '../../services/groupService';
import { fetchRoutine, importSharedRoutine } from '../../services/routineService';
import { playClick } from '../../utils/audio';
import { formatDayTime, formatTime, startOfDay } from '../../utils/dates';
import { logError, toUserMessage, ValidationError } from '../../utils/errors';

const countExercises = (routine) => Object.values(routine.days).reduce((sum, items) => sum + items.length, 0);

// Segundos que faltan para poder enviar otro mensaje (0 = ya se puede). Solo corre el reloj mientras hay espera.
const useCooldownSeconds = (lastSentMs) => {
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = lastSentMs ? Math.min(CHAT_LIMITS.COOLDOWN_MS, lastSentMs + CHAT_LIMITS.COOLDOWN_MS - now) : 0;
  const isWaiting = remainingMs > 0;
  useEffect(() => {
    if (!isWaiting) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isWaiting, lastSentMs]);
  return isWaiting ? Math.ceil(remainingMs / 1000) : 0;
};

const MessageBubble = ({ message, isMine, canDelete, busyKey, onImport, onDelete }) => {
  const sentToday = message.createdAt >= startOfDay();
  return (
    <li className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
      <span className="text-[11px] font-semibold text-muted">
        {isMine ? 'Tú' : message.authorName}, {sentToday ? formatTime(message.createdAt) : formatDayTime(message.createdAt)}
      </span>
      <div className={`w-full max-w-[22rem] rounded-2xl border divider p-3 ${isMine ? 'bg-[var(--accent-soft)]' : 'surface-2'}`}>
        <p className="break-words text-sm font-bold">{message.routineName}</p>
        <p className="text-xs text-secondary">
          {message.exerciseCount} ejercicios, {message.activeDays} {message.activeDays === 1 ? 'día' : 'días'} por semana
        </p>
        <div className="mt-2 flex items-center gap-1">
          {!isMine && (
            <button type="button" className="btn btn-outline min-h-[36px] px-3 text-xs" disabled={Boolean(busyKey)} onClick={() => onImport(message)}>
              {busyKey === `import-${message.id}` ? <InlineSpinner /> : <Download size={14} aria-hidden />} Copiar a mis rutinas
            </button>
          )}
          {canDelete && (
            <span className="ml-auto">
              <IconButton label="Borrar mensaje" icon={Trash2} size={16} tone="danger" disabled={Boolean(busyKey)} onClick={() => onDelete(message)} />
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

/*
 * Chat del grupo: solo se comparten rutinas propias (sin texto libre ni emojis), máximo 1 mensaje por minuto.
 * Se monta únicamente con el chat abierto → la suscripción (y sus lecturas) existe solo mientras alguien lo mira.
 */
export const GroupChat = ({ group, isAdmin }) => {
  const { user, routines } = useAppData();
  const { notify, confirm } = useFeedback();
  const [selectedId, setSelectedId] = useState('');
  const [busyKey, setBusyKey] = useState(null);
  const listRef = useRef(null);

  const { data: messages, loading, error } = useSubscription(
    (onData, onError) => subscribeToGroupMessages(group.id, onData, onError),
    [group.id],
    [],
  );

  const shareable = useMemo(() => routines.filter((routine) => countExercises(routine) > 0), [routines]);
  const selectedRoutine = shareable.find((routine) => routine.id === selectedId) ?? shareable[0] ?? null;

  // El minuto se mide desde mi último mensaje (el servidor aplica la misma regla con chatState).
  const lastSentMs = useMemo(() => {
    const mine = messages.filter((message) => message.authorId === user.id);
    return mine.length ? mine[mine.length - 1].createdAt.getTime() : 0;
  }, [messages, user.id]);
  const secondsLeft = useCooldownSeconds(lastSentMs);

  // Mantiene visible lo último que llegó.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const run = async (key, context, action, successMessage) => {
    playClick();
    setBusyKey(key);
    try {
      const result = await action();
      if (successMessage) notify(typeof successMessage === 'function' ? successMessage(result) : successMessage, 'success');
    } catch (actionError) {
      logError(context, actionError);
      notify(toUserMessage(actionError), 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const handleSend = () => run('send', 'chat:send', () => sendRoutineMessage({ group, routine: selectedRoutine, user }), 'Rutina compartida');

  const handleImport = (message) =>
    run(`import-${message.id}`, 'chat:import', async () => {
      const source = await fetchRoutine(message.routineId);
      if (source.authorId === user.id) throw new ValidationError('Esta rutina ya es tuya.');
      await importSharedRoutine(source, user);
      return source.name;
    }, (name) => `"${name}" copiada a tus rutinas`);

  const handleDelete = async (message) => {
    const accepted = await confirm({ title: '¿Borrar este mensaje?', message: 'Desaparece del chat para todos. No cuenta como un mensaje nuevo.', confirmLabel: 'Borrar', tone: 'danger' });
    if (accepted) run(`delete-${message.id}`, 'chat:delete', () => deleteGroupMessage(group.id, message.id), 'Mensaje borrado');
  };

  return (
    <section className="mt-3 rounded-xl border divider p-3" aria-label={`Chat de ${group.name}`}>
      <p className="mb-2 text-xs text-muted">
        Aquí solo se comparten rutinas (sin texto ni emojis), una por minuto. Los mensajes más viejos se descartan.
      </p>

      <ul ref={listRef} className="flex max-h-72 min-h-[96px] flex-col gap-3 overflow-y-auto overscroll-contain pr-1" aria-live="polite">
        {loading && <li className="py-6 text-center text-sm text-muted">Cargando mensajes…</li>}
        {!loading && error && <li role="alert" className="py-6 text-center text-sm font-semibold text-accent">{toUserMessage(error)}</li>}
        {!loading && !error && messages.length === 0 && (
          <li className="py-6 text-center text-sm text-muted">Nadie compartió una rutina todavía. Sé el primero.</li>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.authorId === user.id}
            canDelete={message.authorId === user.id || isAdmin}
            busyKey={busyKey}
            onImport={handleImport}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <div className="mt-3 flex flex-col gap-2 border-t divider pt-3 sm:flex-row">
        {shareable.length === 0 ? (
          <p className="text-sm text-secondary">Crea una rutina con ejercicios en la pestaña Rutinas para poder compartirla.</p>
        ) : (
          <>
            <select aria-label="Rutina a compartir" className="input min-w-0 flex-1" value={selectedRoutine?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>
              {shareable.map((routine) => <option key={routine.id} value={routine.id}>{stripEmojis(routine.name) || 'Rutina'}</option>)}
            </select>
            <button type="button" className="btn btn-primary sm:w-52" disabled={Boolean(busyKey) || secondsLeft > 0 || !selectedRoutine} onClick={handleSend}>
              {busyKey === 'send' ? <><InlineSpinner /> Enviando…</> : secondsLeft > 0 ? `Espera ${secondsLeft} s` : <><Send size={16} aria-hidden /> Compartir rutina</>}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

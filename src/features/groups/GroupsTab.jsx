import { Copy, Crown, LogIn, LogOut, MessageSquare, Pencil, Plus, RefreshCw, Settings, Share2, Trash2, Trophy, UserMinus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, FieldLabel, IconButton, InlineSpinner, LoadingState, SectionCard } from '../../components/ui';
import { GROUP_LIMITS } from '../../constants/collections';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import {
  buildGroupInviteUrl,
  createGroup,
  deleteGroup,
  joinGroupByCode,
  leaveGroup,
  normalizeInviteCode,
  regenerateInviteCode,
  removeGroupMember,
  RULES_NOT_DEPLOYED_MESSAGE,
  transferGroupOwnership,
  updateGroupSettings,
} from '../../services/groupService';
import { playClick } from '../../utils/audio';
import { logError, toUserMessage } from '../../utils/errors';
import { GroupChat } from './GroupChat';
import { GroupRanking } from './GroupRanking';

// Envoltorio común de acciones: estado ocupado + toasts + log de errores.
const useAsyncAction = () => {
  const { notify } = useFeedback();
  const [busyKey, setBusyKey] = useState(null);
  const run = async (key, context, action, successMessage) => {
    playClick();
    setBusyKey(key);
    try {
      const result = await action();
      if (successMessage) notify(typeof successMessage === 'function' ? successMessage(result) : successMessage, 'success');
      return result;
    } catch (actionError) {
      logError(context, actionError);
      notify(toUserMessage(actionError), 'error');
      return undefined;
    } finally {
      setBusyKey(null);
    }
  };
  return { busyKey, run };
};

const CreateOrJoinPanel = () => {
  const { user } = useAppData();
  const { busyKey, run } = useAsyncAction();
  const [mode, setMode] = useState(null); // 'create' | 'join' | null
  const [form, setForm] = useState({ name: '', description: '', code: '' });

  const close = () => {
    setMode(null);
    setForm({ name: '', description: '', code: '' });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const groupId = await run('create', 'group:create', () => createGroup(form, user), 'Grupo creado. Comparte el código para sumar amigos.');
    if (groupId) close();
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    const group = await run('join', 'group:join', () => joinGroupByCode(form.code, user.id), (joined) => `Te uniste a "${joined.name}"`);
    if (group) close();
  };

  if (!mode) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn btn-ghost border-dashed py-4" onClick={() => { playClick(); setMode('create'); }}>
          <Plus size={18} aria-hidden /> Crear grupo
        </button>
        <button type="button" className="btn btn-ghost border-dashed py-4" onClick={() => { playClick(); setMode('join'); }}>
          <LogIn size={18} aria-hidden /> Unirme con código
        </button>
      </div>
    );
  }

  return (
    <SectionCard
      title={mode === 'create' ? 'Nuevo grupo' : 'Unirme a un grupo'}
      actions={<IconButton label="Cancelar" icon={X} onClick={close} />}
    >
      {mode === 'create' ? (
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <FieldLabel htmlFor="group-name">Nombre</FieldLabel>
            <input id="group-name" className="input" maxLength={GROUP_LIMITS.NAME_MAX} required placeholder="Ej: Los del gym de la esquina"
              value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <FieldLabel htmlFor="group-description">Descripción (opcional)</FieldLabel>
            <input id="group-description" className="input" maxLength={GROUP_LIMITS.DESCRIPTION_MAX}
              value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={busyKey === 'create'}>
            {busyKey === 'create' ? <><InlineSpinner /> Creando grupo…</> : 'Crear grupo'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-3">
          <div>
            <FieldLabel htmlFor="group-code">Código de invitación</FieldLabel>
            <input id="group-code" className="input font-mono uppercase tracking-[0.3em]" maxLength={GROUP_LIMITS.CODE_LENGTH} required
              autoComplete="off" placeholder="ABCD2345" value={form.code}
              onChange={(event) => setForm({ ...form, code: normalizeInviteCode(event.target.value) })} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={busyKey === 'join' || form.code.length !== GROUP_LIMITS.CODE_LENGTH}>
            {busyKey === 'join' ? <><InlineSpinner /> Buscando el grupo…</> : 'Unirme'}
          </button>
        </form>
      )}
    </SectionCard>
  );
};

const GroupSettingsForm = ({ group, onDone }) => {
  const { busyKey, run } = useAsyncAction();
  const [form, setForm] = useState({ name: group.name, description: group.description });
  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run('save', 'group:update', async () => { await updateGroupSettings(group.id, form); return true; }, 'Configuración guardada');
    if (result) onDone();
  };
  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl surface-2 p-3">
      <div>
        <FieldLabel htmlFor={`name-${group.id}`}>Nombre del grupo</FieldLabel>
        <input id={`name-${group.id}`} className="input" maxLength={GROUP_LIMITS.NAME_MAX} value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </div>
      <div>
        <FieldLabel htmlFor={`description-${group.id}`}>Descripción</FieldLabel>
        <input id={`description-${group.id}`} className="input" maxLength={GROUP_LIMITS.DESCRIPTION_MAX} value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1" disabled={busyKey === 'save'}>
          {busyKey === 'save' ? <><InlineSpinner /> Guardando…</> : 'Guardar'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  );
};

const GroupCard = ({ group }) => {
  const { user, profilesById } = useAppData();
  const { confirm, notify } = useFeedback();
  const { busyKey, run } = useAsyncAction();
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const isOwner = group.ownerId === user.id;
  const isBusy = Boolean(busyKey);

  const members = group.memberIds
    .map((memberId) => ({ id: memberId, name: profilesById[memberId]?.username ?? 'Perfil sin nombre' }))
    .sort((a, b) => (a.id === group.ownerId ? -1 : b.id === group.ownerId ? 1 : a.name.localeCompare(b.name, 'es')));

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(message, 'success');
    } catch (copyError) {
      logError('group:copy', copyError);
      notify('No se pudo copiar. Selecciona el texto manualmente.', 'error');
    }
  };

  const handleShare = () =>
    run('share', 'group:share', async () => {
      const url = buildGroupInviteUrl(group.inviteCode);
      if (navigator.share) {
        try {
          await navigator.share({ title: `Unite a ${group.name}`, text: `Sumate a mi grupo "${group.name}" en Colossus (código ${group.inviteCode})`, url });
          return;
        } catch (shareError) {
          if (shareError?.name === 'AbortError') return;
        }
      }
      await copyText(url, 'Enlace de invitación copiado');
    });

  const handleRegenerate = async () => {
    const accepted = await confirm({ title: 'Regenerar código', message: 'El código y enlace actuales dejarán de funcionar.', confirmLabel: 'Regenerar' });
    if (accepted) run('regenerate', 'group:regenerate', () => regenerateInviteCode(group), (code) => `Nuevo código: ${code}`);
  };

  const handleRemove = async (member) => {
    const accepted = await confirm({ title: `¿Quitar a ${member.name}?`, message: 'Dejará de ver y aparecer en las analíticas del grupo.', confirmLabel: 'Quitar', tone: 'danger' });
    if (accepted) run(`remove-${member.id}`, 'group:remove-member', () => removeGroupMember(group.id, member.id), `${member.name} fue quitado del grupo`);
  };

  const handleTransfer = async (member) => {
    const accepted = await confirm({ title: `¿Hacer administrador a ${member.name}?`, message: 'Perderás los permisos de administración de este grupo.', confirmLabel: 'Transferir' });
    if (accepted) run(`transfer-${member.id}`, 'group:transfer', () => transferGroupOwnership(group, member.id), `${member.name} ahora administra el grupo`);
  };

  const handleLeave = async () => {
    const accepted = await confirm({ title: `¿Salir de "${group.name}"?`, message: 'Necesitarás un nuevo código para volver.', confirmLabel: 'Salir', tone: 'danger' });
    if (accepted) run('leave', 'group:leave', () => leaveGroup(group, user.id), 'Saliste del grupo');
  };

  const handleDelete = async () => {
    const accepted = await confirm({ title: `¿Eliminar "${group.name}"?`, message: 'Se elimina para todos los miembros. Los entrenamientos de cada uno no se borran.', confirmLabel: 'Eliminar', tone: 'danger' });
    if (accepted) run('delete', 'group:delete', () => deleteGroup(group), 'Grupo eliminado');
  };

  return (
    <li className={`card p-4 md:p-5 ${isChatOpen || isRankingOpen ? 'md:col-span-2' : ''}`} aria-busy={isBusy}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-bold md:text-lg">
            <span className="truncate">{group.name}</span>
            {isOwner && <span className="badge badge-accent shrink-0"><Crown size={12} aria-hidden /> Admin</span>}
          </h3>
          {group.description && <p className="text-sm text-secondary">{group.description}</p>}
          <p className="text-xs text-muted">{members.length}/{GROUP_LIMITS.MAX_MEMBERS} miembros</p>
        </div>
        {isOwner && !isEditing && <IconButton label="Editar configuración" icon={Settings} disabled={isBusy} onClick={() => { playClick(); setIsEditing(true); }} />}
      </div>

      {isEditing && <GroupSettingsForm group={group} onDone={() => setIsEditing(false)} />}

      {/* Código visible para todos los miembros: cualquiera puede invitar. Solo el admin lo regenera. */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl surface-2 p-2 pl-3">
        <span className="text-xs font-bold text-secondary">Código</span>
        <code className="font-mono text-base font-black tracking-[0.25em]">{group.inviteCode}</code>
        <div className="ml-auto flex">
          <IconButton label="Copiar código" icon={Copy} onClick={() => copyText(group.inviteCode, 'Código copiado')} />
          <IconButton label="Compartir enlace" icon={Share2} disabled={isBusy} onClick={handleShare} />
          {isOwner && <IconButton label="Regenerar código" icon={RefreshCw} disabled={isBusy} onClick={handleRegenerate} />}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-ghost" aria-expanded={isRankingOpen} onClick={() => { playClick(); setIsRankingOpen((open) => !open); }}>
          <Trophy size={16} aria-hidden /> {isRankingOpen ? 'Ocultar ranking' : 'Ranking'}
        </button>
        <button type="button" className="btn btn-ghost" aria-expanded={isChatOpen} onClick={() => { playClick(); setIsChatOpen((open) => !open); }}>
          <MessageSquare size={16} aria-hidden /> {isChatOpen ? 'Ocultar chat' : 'Chat de rutinas'}
        </button>
      </div>
      {isRankingOpen && <GroupRanking group={group} />}
      {isChatOpen && <GroupChat group={group} isAdmin={isOwner} />}

      <ul className="mt-3 divide-y divide-[var(--border)]">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-2 py-1.5">
            <span className={`flex-1 truncate text-sm font-semibold ${member.id === user.id ? 'text-accent' : ''}`}>
              {member.name}{member.id === user.id && ' (tú)'}
            </span>
            {member.id === group.ownerId && <Crown size={14} className="text-muted" aria-label="Administrador" />}
            {isOwner && member.id !== user.id && (
              <>
                <IconButton label={`Hacer administrador a ${member.name}`} icon={Crown} size={16} disabled={isBusy} onClick={() => handleTransfer(member)} />
                <IconButton label={`Quitar a ${member.name}`} icon={UserMinus} size={16} tone="danger" disabled={isBusy} onClick={() => handleRemove(member)} />
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2 border-t divider pt-3">
        {isOwner ? (
          <>
            {!isEditing && (
              <button type="button" className="btn btn-ghost" disabled={isBusy} onClick={() => { playClick(); setIsEditing(true); }}>
                <Pencil size={16} aria-hidden /> Editar
              </button>
            )}
            <button type="button" className="btn btn-danger ml-auto" disabled={isBusy} onClick={handleDelete}>
              {busyKey === 'delete' ? <InlineSpinner /> : <Trash2 size={16} aria-hidden />} Eliminar grupo
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-danger ml-auto" disabled={isBusy} onClick={handleLeave}>
            {busyKey === 'leave' ? <InlineSpinner /> : <LogOut size={16} aria-hidden />} Salir del grupo
          </button>
        )}
      </div>
    </li>
  );
};

export const GroupsTab = () => {
  const { groups, groupsLoading, groupsError } = useAppData();

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Solo los perfiles que comparten un grupo contigo aparecen en <strong>Analíticas</strong>. Invita amigos con el código o el enlace y compite en el ranking y comparte rutinas en el chat.
      </p>
      <CreateOrJoinPanel />
      {groupsError && (
        <p role="alert" className="rounded-xl bg-[var(--accent-soft)] p-3 text-sm font-semibold text-accent">
          {groupsError.code === 'permission-denied' ? RULES_NOT_DEPLOYED_MESSAGE : toUserMessage(groupsError)}
        </p>
      )}
      {groupsLoading ? (
        <LoadingState label="Cargando tus grupos…" hint="Buscamos los grupos donde eres miembro." />
      ) : groups.length === 0 ? (
        <EmptyState icon={Users} title="Todavía no estás en ningún grupo" description="Crea uno y comparte el código, o únete con el código que te pasó un amigo." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
          {groups.map((group) => <GroupCard key={group.id} group={group} />)}
        </ul>
      )}
    </div>
  );
};

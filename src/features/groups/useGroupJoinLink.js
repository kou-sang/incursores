import { useEffect, useRef } from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import { joinGroupByCode, normalizeInviteCode } from '../../services/groupService';
import { logError, toUserMessage } from '../../utils/errors';

const JOIN_PARAM = 'joinGroup';

const clearJoinParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(JOIN_PARAM);
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
};

// Enlace ?joinGroup=CODIGO → pide confirmación y une al usuario (mismo patrón que useRoutineImport).
export const useGroupJoinLink = (user, onJoined) => {
  const { confirm, notify } = useFeedback();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!user || handledRef.current) return;
    const code = normalizeInviteCode(new URLSearchParams(window.location.search).get(JOIN_PARAM));
    if (!code) return;
    handledRef.current = true;

    const runJoin = async () => {
      try {
        const accepted = await confirm({
          title: 'Unirte a un grupo',
          message: `Te invitaron con el código ${code}. Los miembros del grupo podrán ver tus analíticas.`,
          confirmLabel: 'Unirme',
        });
        if (!accepted) return;
        const group = await joinGroupByCode(code, user.id);
        notify(`Te uniste a "${group.name}"`, 'success');
        onJoined?.();
      } catch (joinError) {
        logError('group:join-link', joinError);
        notify(toUserMessage(joinError, 'No se pudo unir al grupo.'), 'error');
      } finally {
        clearJoinParam();
      }
    };
    runJoin();
  }, [user, confirm, notify, onJoined]);
};

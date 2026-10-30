import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, GROUP_LIMITS } from '../constants/collections';
import { ValidationError } from '../utils/errors';

/*
 * Modelo:
 *   groups/{groupId}        { name, description, ownerId, memberIds[], inviteCode, joinCode?, createdAt, updatedAt }
 *   groupInvites/{code}     { groupId }  ← índice código → grupo (lectura puntual, nunca listable)
 * Un no-miembro no puede leer el grupo; para unirse resuelve el código en groupInvites y
 * escribe `joinCode`, que las reglas comparan contra `inviteCode` sin exponerlo.
 */

// Sin caracteres ambiguos (0/O, 1/I/L) para dictar el código por voz o WhatsApp.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const generateInviteCode = (length = GROUP_LIMITS.CODE_LENGTH) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
};

export const normalizeInviteCode = (rawCode) => String(rawCode ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// permission-denied en grupos casi siempre significa reglas desactualizadas en Firebase (o desplegadas en otro proyecto).
export const RULES_NOT_DEPLOYED_MESSAGE =
  'Firestore rechazó la operación: las reglas de grupos no están desplegadas en este proyecto. Ejecuta "firebase deploy --only firestore:rules".';

const sanitizeGroupFields = ({ name, description }) => {
  const cleanName = String(name ?? '').replace(/\s+/g, ' ').trim();
  if (cleanName.length < 2 || cleanName.length > GROUP_LIMITS.NAME_MAX) {
    throw new ValidationError(`El nombre del grupo debe tener entre 2 y ${GROUP_LIMITS.NAME_MAX} caracteres.`);
  }
  const cleanDescription = String(description ?? '').trim().slice(0, GROUP_LIMITS.DESCRIPTION_MAX);
  return { name: cleanName, description: cleanDescription };
};

const mapGroupDoc = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? 'Grupo',
    description: data.description ?? '',
    ownerId: data.ownerId,
    memberIds: Array.isArray(data.memberIds) ? data.memberIds : [],
    inviteCode: data.inviteCode ?? '',
    createdAt: data.createdAt ?? null,
  };
};

// Solo los grupos del usuario (array-contains) → lecturas proporcionales a sus grupos, no a todos.
export const subscribeToMyGroups = (uid, onData, onError) =>
  onSnapshot(
    query(collection(db, COLLECTIONS.GROUPS), where('memberIds', 'array-contains', uid)),
    (snapshot) => onData(snapshot.docs.map(mapGroupDoc).sort((a, b) => a.name.localeCompare(b.name, 'es'))),
    onError,
  );

export const createGroup = async ({ name, description }, owner) => {
  const fields = sanitizeGroupFields({ name, description });
  const groupRef = doc(collection(db, COLLECTIONS.GROUPS));
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);
  batch.set(groupRef, {
    ...fields,
    ownerId: owner.id,
    memberIds: [owner.id],
    inviteCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, COLLECTIONS.GROUP_INVITES, inviteCode), { groupId: groupRef.id, createdAt: serverTimestamp() });
  try {
    await batch.commit();
  } catch (createError) {
    if (createError?.code === 'permission-denied') throw new ValidationError(RULES_NOT_DEPLOYED_MESSAGE);
    throw createError;
  }
  return groupRef.id;
};

export const joinGroupByCode = async (rawCode, uid) => {
  const code = normalizeInviteCode(rawCode);
  if (code.length !== GROUP_LIMITS.CODE_LENGTH) throw new ValidationError('El código debe tener 8 caracteres.');

  const inviteSnapshot = await getDoc(doc(db, COLLECTIONS.GROUP_INVITES, code));
  if (!inviteSnapshot.exists()) throw new ValidationError('Código inválido o vencido.');
  const { groupId } = inviteSnapshot.data();

  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), { memberIds: arrayUnion(uid), joinCode: code });
  } catch (joinError) {
    // permission-denied acá significa: código regenerado, grupo lleno o grupo eliminado.
    if (joinError?.code === 'permission-denied') {
      throw new ValidationError(`No se pudo unir: el código cambió o el grupo alcanzó ${GROUP_LIMITS.MAX_MEMBERS} miembros.`);
    }
    throw joinError;
  }
  const groupSnapshot = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
  return groupSnapshot.exists() ? mapGroupDoc(groupSnapshot) : { id: groupId, name: 'Grupo' };
};

export const updateGroupSettings = async (groupId, { name, description }) => {
  const fields = sanitizeGroupFields({ name, description });
  await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), { ...fields, updatedAt: serverTimestamp() });
};

// Invalida el código anterior (útil si el enlace circuló fuera del grupo).
export const regenerateInviteCode = async (group) => {
  const nextCode = generateInviteCode();
  const batch = writeBatch(db);
  if (group.inviteCode) batch.delete(doc(db, COLLECTIONS.GROUP_INVITES, group.inviteCode));
  batch.set(doc(db, COLLECTIONS.GROUP_INVITES, nextCode), { groupId: group.id, createdAt: serverTimestamp() });
  batch.update(doc(db, COLLECTIONS.GROUPS, group.id), { inviteCode: nextCode, updatedAt: serverTimestamp() });
  await batch.commit();
  return nextCode;
};

export const removeGroupMember = async (groupId, memberId) => {
  await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), { memberIds: arrayRemove(memberId), updatedAt: serverTimestamp() });
};

export const leaveGroup = async (group, uid) => {
  if (group.ownerId === uid) throw new ValidationError('Transfiere la administración antes de salir, o elimina el grupo.');
  await updateDoc(doc(db, COLLECTIONS.GROUPS, group.id), { memberIds: arrayRemove(uid) });
};

export const transferGroupOwnership = async (group, nextOwnerId) => {
  if (!group.memberIds.includes(nextOwnerId)) throw new ValidationError('El nuevo administrador debe ser miembro del grupo.');
  await updateDoc(doc(db, COLLECTIONS.GROUPS, group.id), { ownerId: nextOwnerId, updatedAt: serverTimestamp() });
};

export const deleteGroup = async (group) => {
  const batch = writeBatch(db);
  if (group.inviteCode) batch.delete(doc(db, COLLECTIONS.GROUP_INVITES, group.inviteCode));
  batch.delete(doc(db, COLLECTIONS.GROUPS, group.id));
  await batch.commit();
};

export const buildGroupInviteUrl = (inviteCode) => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('joinGroup', inviteCode);
  return url.toString();
};

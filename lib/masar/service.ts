// lib/masar/service.ts
// منطق مسار على الخادم: الصلاحيات، تحميل اللوحات، سجل النشاط والإشعارات

import { Prisma, WorkspaceRole } from '@prisma/client';
import { prisma } from '@/lib/db';
import { HttpError } from '@/lib/masar/http';
import { ChecklistItem, ymd } from '@/lib/masar/shared';

// ==================== الصلاحيات ====================

const RANK: Record<WorkspaceRole, number> = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };

export async function requireWorkspace(userId: string, workspaceId: string, min: WorkspaceRole = 'VIEWER') {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  // لغير الأعضاء نردّ "غير موجود" حتى لا نكشف وجود المساحة
  if (!member) throw new HttpError(404, 'المساحة غير موجودة');
  if (RANK[member.role] < RANK[min]) throw new HttpError(403, 'لا تملك صلاحية لهذا الإجراء');
  return member;
}

export async function requireBoard(userId: string, boardId: string, min: WorkspaceRole = 'VIEWER') {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new HttpError(404, 'اللوحة غير موجودة');
  const member = await requireWorkspace(userId, board.workspaceId, min).catch((e) => {
    if (e instanceof HttpError && e.status === 404) throw new HttpError(404, 'اللوحة غير موجودة');
    throw e;
  });
  return { board, role: member.role };
}

export async function requireCard(userId: string, cardId: string, min: WorkspaceRole = 'VIEWER') {
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { assignees: true } });
  if (!card) throw new HttpError(404, 'البطاقة غير موجودة');
  const { board, role } = await requireBoard(userId, card.boardId, min).catch((e) => {
    if (e instanceof HttpError && e.status === 404) throw new HttpError(404, 'البطاقة غير موجودة');
    throw e;
  });
  return { card, board, role };
}

export const canWrite = (role: WorkspaceRole) => RANK[role] >= RANK.MEMBER;

/** يضمن أن للمستخدم مساحة عمل واحدة على الأقل، ويربطها بمتجره في فكرتي إن وُجد */
export async function ensurePersonalWorkspace(userId: string, name: string) {
  const count = await prisma.workspaceMember.count({ where: { userId } });
  if (count > 0) return;
  const vendor = await prisma.vendor.findUnique({ where: { userId }, include: { workspace: true } });
  await prisma.workspace.create({
    data: {
      name: vendor ? vendor.businessName : `مساحة ${name}`,
      vendorId: vendor && !vendor.workspace ? vendor.id : null,
      members: { create: { userId, role: 'OWNER' } },
    },
  });
}

// ==================== التحويل إلى JSON ====================

export function readChecklist(value: Prisma.JsonValue): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((x) => {
    if (!x || typeof x !== 'object' || Array.isArray(x)) return [];
    const o = x as Record<string, unknown>;
    return typeof o.id === 'string' && typeof o.text === 'string' ? [{ id: o.id, text: o.text, done: o.done === true }] : [];
  });
}

/** تاريخ عمود @db.Date يصل منتصف الليل UTC؛ نقرأه بالتوقيت العالمي */
export const dateToYmd = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
export const ymdToDate = (s: string | null) => (s ? new Date(`${s}T00:00:00.000Z`) : null);

type CardWithAssignees = Prisma.CardGetPayload<{ include: { assignees: true } }>;

export function cardDto(c: CardWithAssignees) {
  return {
    id: c.id,
    boardId: c.boardId,
    listId: c.listId,
    title: c.title,
    description: c.description,
    labels: c.labels,
    due: dateToYmd(c.dueDate),
    done: c.done,
    position: c.position,
    checklist: readChecklist(c.checklist),
    assignees: c.assignees.map((a) => a.userId),
    createdById: c.createdById,
    invoiceId: c.invoiceId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function workspaceMembers(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return members.map((m) => ({ id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar, role: m.role }));
}

export async function loadBoard(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: { where: { archivedAt: null }, orderBy: { position: 'asc' } },
      cards: {
        where: { archivedAt: null, list: { archivedAt: null } },
        orderBy: { position: 'asc' },
        include: { assignees: true },
      },
    },
  });
  if (!board || board.archivedAt) throw new HttpError(404, 'اللوحة غير موجودة');
  return {
    board: { id: board.id, workspaceId: board.workspaceId, name: board.name, color: board.color, updatedAt: board.updatedAt.toISOString() },
    lists: board.lists.map((l) => ({ id: l.id, title: l.title, position: l.position })),
    cards: board.cards.map(cardDto),
  };
}

/** يحدّث وقت تعديل اللوحة ليعرف المتابعون أن فيها جديدًا */
export function touchBoard(boardId: string) {
  return prisma.board.update({ where: { id: boardId }, data: { updatedAt: new Date() } });
}

// ==================== النشاط والإشعارات ====================

export function logActivity(data: { boardId: string; cardId: string; userId: string; text: string; kind?: 'COMMENT' | 'ACTIVITY' }) {
  return prisma.cardActivity.create({ data: { ...data, kind: data.kind ?? 'ACTIVITY' } });
}

export function activityDto(a: Prisma.CardActivityGetPayload<{ include: { card: { select: { title: true } } } }>) {
  return {
    id: a.id,
    cardId: a.cardId,
    cardTitle: a.card.title,
    userId: a.userId,
    kind: a.kind,
    text: a.text,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function notify(opts: {
  to: (string | null | undefined)[];
  actor: { id: string; name: string };
  type: 'TASK_ASSIGNED' | 'TASK_COMMENT' | 'TASK_UPDATED';
  title: string;
  message: string;
  boardId: string;
  cardId: string;
}) {
  const ids = Array.from(new Set(opts.to.filter((x): x is string => !!x && x !== opts.actor.id)));
  if (!ids.length) return;
  await prisma.notification.createMany({
    data: ids.map((userId) => ({
      userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      data: { boardId: opts.boardId, cardId: opts.cardId, byId: opts.actor.id },
    })),
  });
}

export const todayYmd = () => ymd(new Date());

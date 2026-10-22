// lib/masar/client.ts
// أنواع بيانات مسار في الواجهة ودالة الاتصال بالـ API

import type { ChecklistItem } from '@/lib/masar/shared';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Me {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: Role;
  invoicing: boolean;
  boardCount: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: Role;
}

export interface BoardSummary {
  id: string;
  name: string;
  color: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
}

export interface Card {
  id: string;
  boardId: string;
  listId: string;
  title: string;
  description: string;
  labels: string[];
  due: string | null;
  done: boolean;
  position: number;
  checklist: ChecklistItem[];
  assignees: string[];
  createdById: string | null;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyTask extends Card {
  boardName: string;
  boardColor: string;
  listTitle: string;
}

export interface BoardData {
  board: BoardSummary & { workspaceId: string; updatedAt: string };
  lists: List[];
  cards: Card[];
  canWrite: boolean;
}

export interface Activity {
  id: string;
  cardId: string;
  cardTitle: string;
  userId: string | null;
  kind: 'COMMENT' | 'ACTIVITY';
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: { boardId?: string; cardId?: string; byId?: string } | null;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown; signal?: AbortSignal }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init?.method ?? (init?.body !== undefined ? 'POST' : 'GET'),
      headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init?.signal,
      cache: 'no-store',
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError(0, 'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(res.status, (data as { error?: string }).error || 'حدث خطأ غير متوقع');
  }
  return data as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'حدث خطأ غير متوقع');

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

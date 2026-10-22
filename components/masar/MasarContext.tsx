'use client';

// components/masar/MasarContext.tsx
// حالة مسار المشتركة: المساحة واللوحة الحالية، المزامنة الدورية، وعمليات التعديل

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  api,
  ApiError,
  BoardData,
  BoardSummary,
  Card,
  errorMessage,
  List,
  Me,
  Member,
  NotificationItem,
  Role,
  WorkspaceSummary,
} from '@/lib/masar/client';
import { positionBetween } from '@/lib/masar/shared';

export type View = 'board' | 'cal' | 'mine';
export interface Filters {
  q: string;
  labels: string[];
  overdue: boolean;
  mine: boolean;
}
type Toast = { id: number; msg: string; undo?: () => void } | null;
type CardPatch = Partial<Pick<Card, 'title' | 'description' | 'labels' | 'due' | 'done' | 'checklist' | 'assignees'>> & {
  move?: { listId: string; beforeId: string | null };
  archived?: boolean;
};

const BOARD_POLL_MS = 4000;
const NOTIF_POLL_MS = 20000;

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* تخزين المتصفح غير متاح: نكمل بدون تذكّر التفضيل */
  }
}

function useMasarState() {
  const [me, setMe] = useState<Me | null>(null);
  const [ai, setAi] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [wsId, setWsId] = useState<string | null>(null);
  const [wsInfo, setWsInfo] = useState<{ name: string; role: Role; invoicing: boolean } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [data, setData] = useState<BoardData | null>(null);
  const [view, setViewState] = useState<View>('board');
  const [hijri, setHijriState] = useState(false);
  const [filters, setFilters] = useState<Filters>({ q: '', labels: [], overdue: false, mine: false });
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [notifs, setNotifs] = useState<{ unread: number; items: NotificationItem[] }>({ unread: 0, items: [] });
  const [fatal, setFatal] = useState('');

  const dragging = useRef(false);
  const pending = useRef(0);
  const lastStamp = useRef<string | null>(null);
  const boardIdRef = useRef<string | null>(null);
  boardIdRef.current = boardId;

  const showToast = useCallback((msg: string, undo?: () => void) => setToast({ id: Date.now(), msg, undo }), []);
  const fail = useCallback((e: unknown) => showToast(errorMessage(e)), [showToast]);

  // ---------- التحميل ----------

  const refreshWorkspace = useCallback(async (id: string) => {
    const res = await api<{ workspace: { name: string; role: Role; invoicing: boolean }; members: Member[]; boards: BoardSummary[] }>(
      `/api/masar/workspaces/${id}`,
    );
    setWsInfo(res.workspace);
    setMembers(res.members);
    setBoards(res.boards);
    return res.boards;
  }, []);

  const refreshBoard = useCallback(async (force = false) => {
    const id = boardIdRef.current;
    if (!id) return;
    if (!force && (dragging.current || pending.current > 0)) return;
    try {
      const res = await api<BoardData>(`/api/masar/boards/${id}`);
      if (boardIdRef.current !== id) return;
      if (!force && (pending.current > 0 || dragging.current)) return;
      if (!force && res.board.updatedAt === lastStamp.current) return;
      lastStamp.current = res.board.updatedAt;
      setData(res);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setData(null);
        setBoardId(null);
        if (wsId) refreshWorkspace(wsId).catch(() => {});
      }
    }
  }, [refreshWorkspace, wsId]);

  const refreshNotifs = useCallback(async () => {
    try {
      const res = await api<{ unread: number; notifications: NotificationItem[] }>('/api/masar/notifications');
      setNotifs({ unread: res.unread, items: res.notifications });
    } catch {
      /* نعيد المحاولة في الدورة التالية */
    }
  }, []);

  // البدء
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ me: Me; ai: boolean; workspaces: WorkspaceSummary[] }>('/api/masar/bootstrap');
        setMe(res.me);
        setAi(res.ai);
        setWorkspaces(res.workspaces);
        setHijriState(readLS('masar.hijri', false));
        setViewState(readLS<View>('masar.view', 'board'));
        const params = new URLSearchParams(window.location.search);
        const savedWs = readLS<string | null>('masar.ws', null);
        // أول زيارة: نفتح أول مساحة فيها لوحات (مثل مساحة الفريق الذي أضافك)
        const ws = res.workspaces.find((w) => w.id === savedWs) ?? res.workspaces.find((w) => w.boardCount > 0) ?? res.workspaces[0];
        if (!ws) return;
        setWsId(ws.id);
        const list = await refreshWorkspace(ws.id);
        const wanted = params.get('board') ?? readLS<string | null>(`masar.board.${ws.id}`, null);
        setBoardId(list.find((b) => b.id === wanted)?.id ?? list[0]?.id ?? null);
        if (params.get('card')) setOpenId(params.get('card'));
      } catch (e) {
        setFatal(errorMessage(e));
      }
    })();
    refreshNotifs();
  }, [refreshWorkspace, refreshNotifs]);

  // تحميل اللوحة عند تغييرها + المزامنة الدورية
  useEffect(() => {
    lastStamp.current = null;
    setData(null);
    if (!boardId) return;
    if (wsId) writeLS(`masar.board.${wsId}`, boardId);
    const url = new URL(window.location.href);
    url.searchParams.set('board', boardId);
    window.history.replaceState(null, '', url);
    refreshBoard(true);
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refreshBoard();
    }, BOARD_POLL_MS);
    return () => clearInterval(t);
  }, [boardId, wsId, refreshBoard]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refreshNotifs();
    }, NOTIF_POLL_MS);
    return () => clearInterval(t);
  }, [refreshNotifs]);

  // ---------- التفضيلات ----------

  const setView = useCallback((v: View) => {
    setViewState(v);
    writeLS('masar.view', v);
  }, []);
  const setHijri = useCallback((v: boolean) => {
    setHijriState(v);
    writeLS('masar.hijri', v);
  }, []);
  const selectWorkspace = useCallback(
    async (id: string) => {
      setWsId(id);
      writeLS('masar.ws', id);
      setBoards(null);
      setBoardId(null);
      try {
        const list = await refreshWorkspace(id);
        setBoardId(readLS<string | null>(`masar.board.${id}`, null) ?? list[0]?.id ?? null);
      } catch (e) {
        fail(e);
      }
    },
    [refreshWorkspace, fail],
  );

  // ---------- التعديل ----------

  /** يطبّق تغييرًا محليًا فورًا ثم يرسله للخادم، ويعيد المزامنة عند الفشل */
  const write = useCallback(
    async <T,>(local: ((d: BoardData) => BoardData) | null, request: () => Promise<T>): Promise<T | undefined> => {
      if (local) setData((d) => (d ? local(d) : d));
      pending.current++;
      try {
        return await request();
      } catch (e) {
        fail(e);
        return undefined;
      } finally {
        pending.current--;
        if (pending.current === 0) refreshBoard(true);
      }
    },
    [fail, refreshBoard],
  );

  const patchCard = useCallback(
    (card: Card, patch: CardPatch) =>
      write(
        (d) => {
          if (patch.archived) return { ...d, cards: d.cards.filter((c) => c.id !== card.id) };
          const next: Card = { ...card, ...patch } as Card;
          if (patch.move) {
            const siblings = d.cards.filter((c) => c.listId === patch.move!.listId && c.id !== card.id).sort((a, b) => a.position - b.position);
            const idx = patch.move.beforeId ? siblings.findIndex((c) => c.id === patch.move!.beforeId) : -1;
            next.listId = patch.move.listId;
            next.position = positionBetween(siblings.map((c) => c.position), idx);
          }
          return { ...d, cards: d.cards.some((c) => c.id === card.id) ? d.cards.map((c) => (c.id === card.id ? next : c)) : d.cards };
        },
        () => api<Card>(`/api/masar/cards/${card.id}`, { method: 'PATCH', body: patch }),
      ),
    [write],
  );

  const archiveCard = useCallback(
    async (card: Card) => {
      if (openId === card.id) setOpenId(null);
      await patchCard(card, { archived: true });
      showToast(`أُرشفت بطاقة «${card.title}»`, () =>
        write(null, () => api(`/api/masar/cards/${card.id}`, { method: 'PATCH', body: { archived: false } })),
      );
    },
    [patchCard, showToast, write, openId],
  );

  const createCard = useCallback(
    (listId: string, title: string) => {
      const id = boardIdRef.current;
      if (!id) return;
      const temp: Card = {
        id: `tmp-${Date.now()}`,
        boardId: id,
        listId,
        title,
        description: '',
        labels: [],
        due: null,
        done: false,
        position: Number.MAX_SAFE_INTEGER,
        checklist: [],
        assignees: [],
        createdById: me?.id ?? null,
        invoiceId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return write((d) => ({ ...d, cards: [...d.cards, temp] }), () => api<Card>(`/api/masar/boards/${id}/cards`, { body: { listId, title } }));
    },
    [write, me],
  );

  const addList = useCallback(
    (title: string) => {
      const id = boardIdRef.current;
      if (!id) return;
      const temp: List = { id: `tmp-${Date.now()}`, title, position: Number.MAX_SAFE_INTEGER };
      return write((d) => ({ ...d, lists: [...d.lists, temp] }), () => api(`/api/masar/boards/${id}/lists`, { body: { title } }));
    },
    [write],
  );

  const patchList = useCallback(
    (list: List, patch: { title?: string; move?: { beforeId: string | null } }) =>
      write(
        (d) => {
          const lists = d.lists.map((l) => (l.id === list.id ? { ...l, title: patch.title ?? l.title } : l));
          if (patch.move) {
            const others = lists.filter((l) => l.id !== list.id);
            const idx = patch.move.beforeId ? others.findIndex((l) => l.id === patch.move!.beforeId) : -1;
            const pos = positionBetween(others.map((l) => l.position), idx);
            return { ...d, lists: lists.map((l) => (l.id === list.id ? { ...l, position: pos } : l)).sort((a, b) => a.position - b.position) };
          }
          return { ...d, lists };
        },
        () => api(`/api/masar/lists/${list.id}`, { method: 'PATCH', body: patch }),
      ),
    [write],
  );

  const archiveList = useCallback(
    async (list: List) => {
      await write((d) => ({ ...d, lists: d.lists.filter((l) => l.id !== list.id) }), () =>
        api(`/api/masar/lists/${list.id}`, { method: 'PATCH', body: { archived: true } }),
      );
      showToast(`أُرشفت قائمة «${list.title}»`, () =>
        write(null, () => api(`/api/masar/lists/${list.id}`, { method: 'PATCH', body: { archived: false } })),
      );
    },
    [write, showToast],
  );

  const renameBoard = useCallback(
    async (name: string) => {
      const id = boardIdRef.current;
      if (!id || !wsId) return;
      setBoards((bs) => bs?.map((b) => (b.id === id ? { ...b, name } : b)) ?? bs);
      await write(null, () => api(`/api/masar/boards/${id}`, { method: 'PATCH', body: { name } }));
    },
    [write, wsId],
  );

  const archiveBoard = useCallback(async () => {
    const id = boardIdRef.current;
    if (!id || !wsId) return;
    const name = data?.board.name ?? '';
    try {
      await api(`/api/masar/boards/${id}`, { method: 'PATCH', body: { archived: true } });
      const list = await refreshWorkspace(wsId);
      setBoardId(list[0]?.id ?? null);
      showToast(`أُرشفت لوحة «${name}»`, async () => {
        try {
          await api(`/api/masar/boards/${id}`, { method: 'PATCH', body: { archived: false } });
          await refreshWorkspace(wsId);
          setBoardId(id);
        } catch (e) {
          fail(e);
        }
      });
    } catch (e) {
      fail(e);
    }
  }, [wsId, data, refreshWorkspace, showToast, fail]);

  const boardCreated = useCallback(
    async (id: string) => {
      if (!wsId) return;
      await refreshWorkspace(wsId);
      setBoardId(id);
      setView('board');
    },
    [wsId, refreshWorkspace, setView],
  );

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const myRole = wsInfo?.role ?? 'VIEWER';

  return {
    me,
    ai,
    fatal,
    workspaces,
    wsId,
    wsInfo,
    myRole,
    members,
    membersById,
    setMembers,
    boards,
    boardId,
    setBoardId,
    data,
    canWrite: data ? data.canWrite : myRole !== 'VIEWER',
    view,
    setView,
    hijri,
    setHijri,
    filters,
    setFilters,
    openId,
    setOpenId,
    toast,
    setToast,
    showToast,
    fail,
    notifs,
    refreshNotifs,
    dragging,
    selectWorkspace,
    refreshWorkspace,
    refreshBoard,
    patchCard,
    archiveCard,
    createCard,
    addList,
    patchList,
    archiveList,
    renameBoard,
    archiveBoard,
    boardCreated,
  };
}

export type MasarState = ReturnType<typeof useMasarState>;
const Ctx = createContext<MasarState | null>(null);

export function MasarProvider({ children }: { children: React.ReactNode }) {
  const state = useMasarState();
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useMasar(): MasarState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMasar خارج MasarProvider');
  return v;
}

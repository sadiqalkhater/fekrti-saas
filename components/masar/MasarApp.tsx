'use client';

// components/masar/MasarApp.tsx
// الهيكل العام لمسار: الشريط العلوي، شريط الأدوات، والعرض الحالي

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/masar/client';
import { dueStatus, LABELS } from '@/lib/masar/shared';
import { MasarProvider, useMasar } from '@/components/masar/MasarContext';
import BoardView from '@/components/masar/BoardView';
import CardModal from '@/components/masar/CardModal';
import { ActivityFeed, CalendarView, MyTasksView } from '@/components/masar/views';
import { MembersDialog, NewBoardDialog, NewBoardForm, NotificationsPanel } from '@/components/masar/dialogs';
import { Avatar, Icon, Logo } from '@/components/masar/ui';

export default function MasarApp() {
  return (
    <MasarProvider>
      <Shell />
    </MasarProvider>
  );
}

type Panel = null | 'notifs' | 'newboard' | 'members';

function Shell() {
  const m = useMasar();
  const [panel, setPanel] = useState<Panel>(null);
  const [showFeed, setShowFeed] = useState(false);
  const color = m.boards?.find((b) => b.id === m.boardId)?.color ?? 'c1';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && !m.openId && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        const s = document.getElementById('search');
        if (s) {
          e.preventDefault();
          s.focus();
        }
      }
      if (e.key === 'Escape' && panel && !m.openId) setPanel(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [m.openId, panel]);

  if (m.fatal) {
    return (
      <div className="masar">
        <div className="loading">{m.fatal}</div>
      </div>
    );
  }

  let main: React.ReactNode;
  if (!m.me || m.boards === null) main = <div className="loading">جارٍ تحميل لوحاتك…</div>;
  else if (!m.boards.length) main = <Welcome />;
  else if (m.view === 'mine') main = <MyTasksView />;
  else if (!m.data) main = <div className="loading">جارٍ فتح اللوحة…</div>;
  else if (m.view === 'cal') main = <CalendarView />;
  else main = <BoardView />;

  return (
    <div className={`masar app ${color}${m.canWrite ? '' : ' ro'}`}>
      <AppBar panel={panel} setPanel={setPanel} />
      {m.wsInfo?.role === 'VIEWER' && (
        <div className="banner gutter">
          <span>
            <b>عرض فقط: </b>تقدر تتصفح اللوحات. اطلب من مشرف المساحة صلاحية «عضو» لتعدّل.
          </span>
        </div>
      )}
      {m.data && m.view !== 'mine' && <Toolbar showFeed={showFeed} setShowFeed={setShowFeed} />}
      {m.view === 'mine' && m.boards?.length ? <MineBar /> : null}
      <div className="main">
        {main}
        {showFeed && m.data && m.view !== 'mine' && <ActivityFeed onClose={() => setShowFeed(false)} />}
      </div>
      {m.openId && <CardModal key={m.openId} />}
      {panel === 'newboard' && <NewBoardDialog onClose={() => setPanel(null)} />}
      {panel === 'members' && <MembersDialog onClose={() => setPanel(null)} />}
      {panel === 'notifs' && <NotificationsPanel onClose={() => setPanel(null)} />}
      <Toast />
    </div>
  );
}

function AppBar({ panel, setPanel }: { panel: Panel; setPanel: (p: Panel) => void }) {
  const m = useMasar();
  const canCreate = m.myRole !== 'VIEWER';
  async function logout() {
    await api('/api/auth/logout', { body: {} }).catch(() => {});
    window.location.href = '/login';
  }
  return (
    <header className="appbar gutter">
      <div className="logo">
        <Logo />
        مسار<small>من فكرتي</small>
      </div>
      {m.workspaces.length > 1 && (
        <select className="ws-select" aria-label="مساحة العمل" value={m.wsId ?? ''} onChange={(e) => m.selectWorkspace(e.target.value)}>
          {m.workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      )}
      <nav className="tabs" aria-label="اللوحات">
        {(m.boards ?? []).map((b) => (
          <button
            key={b.id}
            className={`tab ${b.color}`}
            aria-current={b.id === m.boardId && m.view !== 'mine' ? 'true' : 'false'}
            onClick={() => {
              m.setBoardId(b.id);
              if (m.view === 'mine') m.setView('board');
            }}
          >
            <i className="dot" />
            {b.name}
          </button>
        ))}
        {m.boards && m.boards.length > 0 && canCreate && (
          <button className="tab new" onClick={() => setPanel('newboard')}>
            <Icon name="plus" />
            لوحة جديدة
          </button>
        )}
      </nav>
      <div className="people">
        <button className="barbtn" aria-label="أعضاء المساحة" title="أعضاء المساحة" onClick={() => setPanel(panel === 'members' ? null : 'members')}>
          <Icon name="users" />
        </button>
        <button
          id="bell"
          className="barbtn"
          aria-label="الإشعارات"
          aria-expanded={panel === 'notifs'}
          onClick={() => setPanel(panel === 'notifs' ? null : 'notifs')}
        >
          <Icon name="bell" />
          {m.notifs.unread > 0 && <span className="badge">{m.notifs.unread > 9 ? '9+' : m.notifs.unread}</span>}
        </button>
        {m.me && <Avatar person={m.me} size="l" />}
        <button className="barbtn" aria-label="تسجيل الخروج" title="تسجيل الخروج" onClick={logout}>
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}

function ViewSwitch() {
  const m = useMasar();
  return (
    <div className="seg" role="group" aria-label="طريقة العرض">
      {(
        [
          ['board', 'اللوحة'],
          ['cal', 'التقويم'],
          ['mine', 'مهامي'],
        ] as const
      ).map(([v, t]) => (
        <button key={v} aria-pressed={m.view === v} onClick={() => m.setView(v)}>
          {t}
        </button>
      ))}
    </div>
  );
}

function MineBar() {
  const m = useMasar();
  return (
    <div className="toolbar gutter">
      <div className="spacer" />
      <ViewSwitch />
      <button className="iconbtn" aria-pressed={m.hijri} title="عرض التواريخ بالتقويم الهجري" onClick={() => m.setHijri(!m.hijri)}>
        {m.hijri ? 'هجري ✓' : 'هجري'}
      </button>
    </div>
  );
}

function Toolbar({ showFeed, setShowFeed }: { showFeed: boolean; setShowFeed: (v: boolean) => void }) {
  const m = useMasar();
  const d = m.data!;
  const [name, setName] = useState(d.board.name);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setName(d.board.name);
  }, [d.board.name]);

  const total = d.cards.length;
  const done = d.cards.filter((c) => c.done).length;
  const over = d.cards.filter((c) => dueStatus(c.due, c.done) === 'overdue').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const f = m.filters;
  const filtering = !!(f.q || f.labels.length || f.overdue || f.mine);
  const toggleLabel = (id: string) =>
    m.setFilters({ ...f, labels: f.labels.includes(id) ? f.labels.filter((x) => x !== id) : [...f.labels, id] });

  return (
    <div className="toolbar gutter">
      <input
        className="board-title"
        id="board-title"
        aria-label="اسم اللوحة"
        value={name}
        readOnly={!d.canWrite}
        onFocus={() => (editing.current = true)}
        onBlur={() => (editing.current = false)}
        onChange={(e) => {
          const v = e.target.value;
          setName(v);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => v.trim() && m.renameBoard(v.trim()), 600);
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <div className="stats">
        <span className="stat">
          <b>{total}</b> بطاقة
        </span>
        <span className="stat" title="نسبة الإنجاز">
          <span className="meter">
            <i style={{ width: `${pct}%` }} />
          </span>{' '}
          <b>{pct}%</b>
        </span>
        {over > 0 && (
          <span className="stat bad">
            <b>{over}</b> متأخرة
          </span>
        )}
      </div>
      <div className="spacer" />
      <ViewSwitch />
      <label className="search">
        <Icon name="search" />
        <input id="search" type="search" placeholder="ابحث في البطاقات" aria-label="بحث" value={f.q} onChange={(e) => m.setFilters({ ...f, q: e.target.value })} />
      </label>
      <button className="iconbtn" aria-pressed={m.hijri} title="عرض التواريخ بالتقويم الهجري" onClick={() => m.setHijri(!m.hijri)}>
        {m.hijri ? 'هجري ✓' : 'هجري'}
      </button>
      <button className="iconbtn" aria-pressed={showFeed} onClick={() => setShowFeed(!showFeed)}>
        <Icon name="activity" />
        النشاط
      </button>
      {(m.myRole === 'OWNER' || m.myRole === 'ADMIN') && (
        <button className="iconbtn" title="أرشفة اللوحة" onClick={m.archiveBoard}>
          <Icon name="archive" />
          أرشفة
        </button>
      )}
      <div className="filters" role="group" aria-label="تصفية">
        {LABELS.map((l) => (
          <button key={l.id} className="fchip" aria-pressed={f.labels.includes(l.id)} onClick={() => toggleLabel(l.id)}>
            <i className="sw" style={{ background: `var(--l-${l.id})` }} />
            {l.name}
          </button>
        ))}
        <button className="fchip" aria-pressed={f.overdue} onClick={() => m.setFilters({ ...f, overdue: !f.overdue })}>
          <i className="sw" style={{ background: 'var(--bad)', borderRadius: '50%' }} />
          متأخرة
        </button>
        <button className="fchip" aria-pressed={f.mine} onClick={() => m.setFilters({ ...f, mine: !f.mine })}>
          مسندة إليّ
        </button>
        {filtering && (
          <button className="fchip" onClick={() => m.setFilters({ q: '', labels: [], overdue: false, mine: false })}>
            مسح التصفية ✕
          </button>
        )}
      </div>
    </div>
  );
}

function Welcome() {
  const m = useMasar();
  return (
    <section className="welcome gutter">
      <div className="welcome-in">
        <h1>نظّم شغل فريقك في لوحة واحدة</h1>
        <p>أضف زملاءك من زر الأعضاء، وكل واحد يشوف نفس اللوحات ويعدّل عليها: تسند المهام، تعلّق، ويوصلك إشعار.</p>
        {m.myRole !== 'VIEWER' ? <NewBoardForm /> : <p className="hint">لا توجد لوحات بعد. اطلب من مشرف المساحة إنشاء أول لوحة.</p>}
      </div>
    </section>
  );
}

function Toast() {
  const { toast, setToast } = useMasar();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.undo ? 7000 : 4500);
    return () => clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>{toast.msg}</span>
      {toast.undo && (
        <button
          onClick={() => {
            toast.undo!();
            setToast(null);
          }}
        >
          تراجع
        </button>
      )}
    </div>
  );
}

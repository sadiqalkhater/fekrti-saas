'use client';

// components/masar/dialogs.tsx
// إنشاء لوحة (من قالب أو بالذكاء الاصطناعي)، أعضاء المساحة، والإشعارات

import { useEffect, useState } from 'react';
import { api, errorMessage, Member, Role } from '@/lib/masar/client';
import { TEMPLATES } from '@/lib/masar/shared';
import { useMasar } from '@/components/masar/MasarContext';
import { ago, Avatar, Icon } from '@/components/masar/ui';

export function NewBoardForm({ onCreated }: { onCreated?: () => void }) {
  const m = useMasar();
  const [name, setName] = useState('');
  const [tpl, setTpl] = useState<string>(TEMPLATES[0].id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [desc, setDesc] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');

  async function create() {
    const t = TEMPLATES.find((x) => x.id === tpl)!;
    setBusy(true);
    setErr('');
    try {
      const b = await api<{ id: string }>('/api/masar/boards', { body: { workspaceId: m.wsId, name: name.trim() || t.name, lists: t.lists } });
      await m.boardCreated(b.id);
      onCreated?.();
    } catch (e) {
      setErr(errorMessage(e));
      setBusy(false);
    }
  }

  async function generate() {
    setAiBusy(true);
    setAiErr('');
    try {
      const b = await api<{ id: string }>('/api/masar/ai/board', { body: { workspaceId: m.wsId, description: desc.trim() } });
      await m.boardCreated(b.id);
      onCreated?.();
    } catch (e) {
      setAiErr(errorMessage(e));
      setAiBusy(false);
    }
  }

  return (
    <>
      <div className="panel-card">
        <h3>لوحة من قالب</h3>
        <div className="field">
          <label htmlFor="nb-name">اسم اللوحة</label>
          <input id="nb-name" className="field-input" placeholder="مثال: إطلاق متجر القهوة" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="tpls" role="radiogroup" aria-label="قالب اللوحة">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="tpl" role="radio" aria-checked={tpl === t.id} onClick={() => setTpl(t.id)}>
              <b>{t.name}</b>
              <small>{t.lists.join(' ← ')}</small>
            </button>
          ))}
        </div>
        {err && <div className="err">{err}</div>}
        <div>
          <button className="btn" onClick={create} disabled={busy}>
            <Icon name="plus" /> {busy ? 'لحظة…' : 'أنشئ اللوحة'}
          </button>
        </div>
      </div>
      {m.ai && (
        <div className="panel-card">
          <h3>
            <Icon name="spark" /> أو صف مشروعك وأبنيها لك
          </h3>
          <textarea
            className="field-input"
            id="ai-prompt"
            rows={3}
            maxLength={3000}
            placeholder="مثال: أفتتح مقهى مختص في الرياض بعد شهرين، نحتاج تجهيز المكان والتوظيف والتسويق والتراخيص."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {aiBusy ? (
            <div className="thinking">
              <i />
              أخطط اللوحة… قد يأخذ دقيقة
            </div>
          ) : (
            <div>
              <button className="btn ai" onClick={generate} disabled={desc.trim().length < 10}>
                <Icon name="spark" /> ابنِ اللوحة بالذكاء الاصطناعي
              </button>
            </div>
          )}
          {aiErr && <div className="err">{aiErr}</div>}
          <div className="hint">يُنشئ القوائم والبطاقات والمواعيد وقوائم التحقق، وتقدر تعدّل كل شيء بعدها.</div>
        </div>
      )}
    </>
  );
}

function Dialog({ label, onClose, children, narrow = true }: { label: string; onClose: () => void; children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${narrow ? ' narrow' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        <div className="mhead">
          <div className="mtitle" style={{ border: 0 }}>
            {label}
          </div>
          <button className="ghostbtn" aria-label="إغلاق" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}

export function NewBoardDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog label="لوحة جديدة" onClose={onClose}>
      <NewBoardForm onCreated={onClose} />
    </Dialog>
  );
}

const ROLE_NAMES: Record<Role, string> = { OWNER: 'مالك', ADMIN: 'مشرف', MEMBER: 'عضو', VIEWER: 'مشاهد' };

export function MembersDialog({ onClose }: { onClose: () => void }) {
  const m = useMasar();
  const isAdmin = m.myRole === 'OWNER' || m.myRole === 'ADMIN';
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const base = `/api/masar/workspaces/${m.wsId}/members`;

  async function run(fn: () => Promise<{ members: Member[] }>) {
    setBusy(true);
    setErr('');
    try {
      const res = await fn();
      m.setMembers(res.members);
      return true;
    } catch (e) {
      setErr(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog label={`أعضاء «${m.wsInfo?.name ?? ''}»`} onClose={onClose}>
      <div className="member-list">
        {m.members.map((p) => (
          <div key={p.id} className="member-row">
            <Avatar person={p} />
            <div className="who">
              <b>{p.id === m.me?.id ? `${p.name} (أنت)` : p.name}</b>
              <span className="hint" dir="ltr">
                {p.email}
              </span>
            </div>
            {isAdmin && p.role !== 'OWNER' ? (
              <>
                <select
                  aria-label={`دور ${p.name}`}
                  value={p.role}
                  disabled={busy}
                  onChange={(e) => run(() => api(`${base}/${p.id}`, { method: 'PATCH', body: { role: e.target.value } }))}
                >
                  {(['ADMIN', 'MEMBER', 'VIEWER'] as const).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_NAMES[r]}
                    </option>
                  ))}
                </select>
                <button className="ghostbtn" aria-label={`إزالة ${p.name}`} disabled={busy} onClick={() => run(() => api(`${base}/${p.id}`, { method: 'DELETE' }))}>
                  <Icon name="x" />
                </button>
              </>
            ) : (
              <span className="role-tag">{ROLE_NAMES[p.role]}</span>
            )}
          </div>
        ))}
      </div>
      {isAdmin ? (
        <form
          className="panel-card"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(() => api(base, { body: { email: email.trim(), role } }))) setEmail('');
          }}
        >
          <h3>أضف زميلًا</h3>
          <div className="invite-row">
            <input
              className="field-input"
              type="email"
              dir="ltr"
              required
              placeholder="email@example.com"
              aria-label="بريد الزميل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select aria-label="الدور" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="MEMBER">عضو</option>
              <option value="ADMIN">مشرف</option>
              <option value="VIEWER">مشاهد</option>
            </select>
            <button className="btn" type="submit" disabled={busy}>
              إضافة
            </button>
          </div>
          <span className="hint">يجب أن يكون لزميلك حساب في فكرتي بنفس البريد. العضو يعدّل، والمشاهد يتصفح فقط.</span>
        </form>
      ) : (
        <p className="hint">المشرفون فقط يضيفون الأعضاء أو يغيّرون أدوارهم.</p>
      )}
      {err && <div className="err">{err}</div>}
    </Dialog>
  );
}

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const m = useMasar();
  const { notifs, refreshNotifs } = m;
  const [before] = useState(() => new Set(notifs.items.filter((n) => !n.read).map((n) => n.id)));

  useEffect(() => {
    if (notifs.unread > 0) api('/api/masar/notifications', { body: {} }).then(refreshNotifs).catch(() => {});
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.drop') && !t.closest('#bell')) onClose();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // نعلّمها مقروءة مرة واحدة عند الفتح
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="drop" role="dialog" aria-label="الإشعارات">
      <h3>
        الإشعارات
        <button className="ghostbtn" aria-label="إغلاق" onClick={onClose}>
          <Icon name="x" />
        </button>
      </h3>
      {notifs.items.length ? (
        notifs.items.map((n) => {
          const by = n.data?.byId ? m.membersById.get(n.data.byId) ?? null : null;
          return (
            <button
              key={n.id}
              className={`nitem${before.has(n.id) ? ' unread' : ''}`}
              onClick={() => {
                onClose();
                if (n.data?.boardId && m.boards?.some((b) => b.id === n.data!.boardId)) {
                  m.setBoardId(n.data.boardId);
                  if (m.view === 'mine') m.setView('board');
                }
                if (n.data?.cardId) m.setOpenId(n.data.cardId);
              }}
            >
              <Avatar person={by} size="l" />
              <div className="body">
                <div>
                  <b>{n.title}</b>
                </div>
                <div className="hint">{n.message}</div>
                <div className="when">{ago(n.createdAt)}</div>
              </div>
            </button>
          );
        })
      ) : (
        <p className="hint" style={{ padding: 14 }}>
          لا إشعارات بعد. يصلك إشعار عندما يسندك أحد إلى بطاقة، أو يعلّق عليها، أو ينقلها، أو ينجزها.
        </p>
      )}
    </div>
  );
}

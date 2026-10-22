'use client';

// components/masar/views.tsx
// التقويم، مهامي في كل اللوحات، ونشاط اللوحة

import { useCallback, useEffect, useState } from 'react';
import { Activity, api, MyTask } from '@/lib/masar/client';
import { dueStatus, ymd } from '@/lib/masar/shared';
import { useMasar } from '@/components/masar/MasarContext';
import { matches } from '@/components/masar/BoardView';
import { ago, Avatar, DueChip, F, Icon } from '@/components/masar/ui';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function CalendarView() {
  const m = useMasar();
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const last = new Date(month.getFullYear(), month.getMonth(), days);
  const cards = m.data!.cards.filter((c) => matches(c, m.filters, m.me?.id));
  const byDay = new Map<string, typeof cards>();
  for (const c of cards) if (c.due) byDay.set(c.due, [...(byDay.get(c.due) ?? []), c]);
  const noDue = m.data!.cards.filter((c) => !c.due).length;
  const today = ymd(now);
  const nav = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <section className="cal gutter">
      <div className="calhead">
        <button className="ghostbtn" aria-label="الشهر السابق" onClick={() => nav(-1)}>
          <Icon name="right" />
        </button>
        <h2>{F.gm.format(first)}</h2>
        <button className="ghostbtn" aria-label="الشهر التالي" onClick={() => nav(1)}>
          <Icon name="left" />
        </button>
        {m.hijri && (
          <small>
            {F.hm.format(first)} – {F.hm.format(last)}
          </small>
        )}
        <div className="spacer" />
        <button className="iconbtn" onClick={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))}>
          اليوم
        </button>
        {noDue > 0 && <small>{noDue} بطاقة بلا موعد</small>}
      </div>
      <div className="grid7">
        {DAYS.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {Array.from({ length: first.getDay() }, (_, i) => (
          <div key={`b${i}`} className="day blank" />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const k = ymd(date);
          return (
            <div key={k} className={`day${k === today ? ' today' : ''}`}>
              <div className="dnum">
                <b>{i + 1}</b>
                {m.hijri && <i>{F.hd.format(date)}</i>}
              </div>
              {(byDay.get(k) ?? []).map((c) => (
                <button key={c.id} className={`cchip ${dueStatus(c.due, c.done) ?? ''}`} title={c.title} onClick={() => m.setOpenId(c.id)}>
                  {c.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MyTasksView() {
  const m = useMasar();
  const { fail, openId } = m;
  const [tasks, setTasks] = useState<MyTask[] | null>(null);
  const load = useCallback(async () => {
    try {
      const res = await api<{ cards: MyTask[] }>('/api/masar/my-tasks');
      setTasks(res.cards);
    } catch (e) {
      fail(e);
    }
  }, [fail]);
  // نعيد التحميل عند فتح البطاقة وإغلاقها لتظهر التعديلات
  useEffect(() => {
    load();
  }, [load, openId]);

  const groups: [string, (t: MyTask) => boolean, string?][] = [
    ['متأخرة', (t) => dueStatus(t.due, t.done) === 'overdue', 'bad'],
    ['خلال يومين', (t) => dueStatus(t.due, t.done) === 'soon'],
    ['لاحقًا', (t) => dueStatus(t.due, t.done) === 'later'],
    ['بلا موعد', (t) => !t.due],
  ];
  return (
    <section className="mine gutter">
      <div className="mine-wrap">
        <h2>مهامي في كل اللوحات</h2>
        {tasks === null ? (
          <div className="blank-state">جارٍ التحميل…</div>
        ) : !tasks.length ? (
          <div className="blank-state">لا مهام مسندة إليك حاليًا. افتح أي بطاقة واضغط «أسندها لي».</div>
        ) : (
          groups.map(([title, test, cls]) => {
            const g = tasks.filter(test);
            if (!g.length) return null;
            return (
              <div key={title} className="group">
                <h3 className={cls}>
                  {title} · {g.length}
                </h3>
                {g.map((t) => (
                  <button key={t.id} className={`trow ${t.boardColor}`} onClick={() => m.setOpenId(t.id)}>
                    <i className="dotc" />
                    <span className="t">{t.title}</span>
                    <span className="bname">
                      {t.boardName} · {t.listTitle}
                    </span>
                    <span className="meta" style={{ margin: 0 }}>
                      <DueChip card={t} hijri={m.hijri} />
                    </span>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function ActivityFeed({ onClose }: { onClose: () => void }) {
  const m = useMasar();
  const [items, setItems] = useState<Activity[]>([]);
  const boardId = m.boardId;
  const stamp = m.data?.board.updatedAt;
  useEffect(() => {
    if (!boardId) return;
    api<{ activity: Activity[] }>(`/api/masar/boards/${boardId}/activity`)
      .then((r) => setItems(r.activity))
      .catch(() => {});
  }, [boardId, stamp]);

  return (
    <aside className="feed" aria-label="نشاط اللوحة">
      <h3>
        نشاط اللوحة
        <button className="ghostbtn" aria-label="إغلاق" onClick={onClose}>
          <Icon name="x" />
        </button>
      </h3>
      {items.length ? (
        <div className="timeline">
          {items.map((a) => {
            const p = a.userId ? m.membersById.get(a.userId) ?? null : null;
            return (
              <div key={a.id} className={`ev ${a.kind === 'COMMENT' ? 'comment' : 'act'}`}>
                <Avatar person={p} size="s" />
                <div className="body">
                  <span className="who">{a.userId === m.me?.id ? 'أنت' : p?.name || 'عضو'}</span>{' '}
                  {a.kind === 'COMMENT' ? 'علّق' : <span className="txt">{a.text}</span>} على{' '}
                  <button className="card-ref" onClick={() => m.setOpenId(a.cardId)}>
                    «{a.cardTitle}»
                  </button>
                  <span className="when">{ago(a.createdAt)}</span>
                  {a.kind === 'COMMENT' && <div className="bubble">{a.text}</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="hint">سيظهر هنا كل ما يحدث على اللوحة: البطاقات الجديدة، النقل، الإنجاز، والتعليقات.</p>
      )}
    </aside>
  );
}

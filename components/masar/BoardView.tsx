'use client';

// components/masar/BoardView.tsx
// عرض اللوحة: القوائم والبطاقات مع السحب والإفلات (ماوس، أو ضغطة مطوّلة على الجوال)

import { useEffect, useRef, useState } from 'react';
import { Card, List } from '@/lib/masar/client';
import { dueStatus, LABELS } from '@/lib/masar/shared';
import { Filters, useMasar } from '@/components/masar/MasarContext';
import { Avatar, DueChip, Icon } from '@/components/masar/ui';

export function matches(c: Card, f: Filters, meId: string | undefined) {
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
  }
  if (f.labels.length && !c.labels.some((l) => f.labels.includes(l))) return false;
  if (f.overdue && dueStatus(c.due, c.done) !== 'overdue') return false;
  if (f.mine && (!meId || !c.assignees.includes(meId))) return false;
  return true;
}

export default function BoardView() {
  const m = useMasar();
  const d = m.data!;
  const boardRef = useRef<HTMLElement>(null);
  const [addingList, setAddingList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  useDragAndDrop(boardRef);

  return (
    <main className="board gutter" ref={boardRef} id="board" aria-label="القوائم">
      {d.lists.map((l, i) => (
        <ListColumn key={l.id} list={l} index={i} />
      ))}
      {d.canWrite && (
        <div className="addlist">
          {addingList ? (
            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                const v = listTitle.trim();
                if (v) m.addList(v);
                setListTitle('');
              }}
            >
              <input
                id="newlist"
                autoFocus
                placeholder="اسم القائمة"
                value={listTitle}
                maxLength={60}
                onChange={(e) => setListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setAddingList(false)}
              />
              <div className="row">
                <button className="btn" type="submit">
                  إضافة القائمة
                </button>
                <button type="button" className="ghostbtn" aria-label="إلغاء" onClick={() => setAddingList(false)}>
                  <Icon name="x" />
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAddingList(true)}>
              <Icon name="plus" /> إضافة قائمة
            </button>
          )}
        </div>
      )}
    </main>
  );
}

function ListColumn({ list, index }: { list: List; index: number }) {
  const m = useMasar();
  const d = m.data!;
  const [title, setTitle] = useState(list.title);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);
  useEffect(() => setTitle(list.title), [list.title]);

  const all = d.cards.filter((c) => c.listId === list.id).sort((a, b) => a.position - b.position);
  const visible = all.filter((c) => matches(c, m.filters, m.me?.id));
  const filtering = !!(m.filters.q || m.filters.labels.length || m.filters.overdue || m.filters.mine);
  const lists = d.lists;

  function commitTitle() {
    const v = title.trim();
    if (!v) setTitle(list.title);
    else if (v !== list.title) m.patchList(list, { title: v });
  }
  function addCard() {
    const v = draft.trim();
    setDraft('');
    if (!v) return setComposing(false);
    m.createCard(list.id, v);
    requestAnimationFrame(() => {
      if (cardsRef.current) cardsRef.current.scrollTop = cardsRef.current.scrollHeight;
    });
  }

  return (
    <section className="list" data-id={list.id} aria-label={list.title}>
      <div className="list-head">
        <input
          className="list-title"
          id={`lt-${list.id}`}
          value={title}
          aria-label="اسم القائمة"
          readOnly={!d.canWrite}
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <span className="count">{all.length}</span>
        {d.canWrite && index > 0 && (
          <button className="ghostbtn mv" title="تقديم القائمة" aria-label="تقديم القائمة" onClick={() => m.patchList(list, { move: { beforeId: lists[index - 1].id } })}>
            <Icon name="right" />
          </button>
        )}
        {d.canWrite && index < lists.length - 1 && (
          <button
            className="ghostbtn mv"
            title="تأخير القائمة"
            aria-label="تأخير القائمة"
            onClick={() => m.patchList(list, { move: { beforeId: lists[index + 2]?.id ?? null } })}
          >
            <Icon name="left" />
          </button>
        )}
        {d.canWrite && (
          <button className="ghostbtn mv" title="أرشفة القائمة" aria-label="أرشفة القائمة" onClick={() => m.archiveList(list)}>
            <Icon name="archive" />
          </button>
        )}
      </div>
      <div className="cards" ref={cardsRef}>
        {visible.map((c) => (
          <CardFace key={c.id} card={c} />
        ))}
        {filtering && !visible.length && all.length > 0 && <div className="empty-filter">لا بطاقات مطابقة</div>}
      </div>
      {d.canWrite && (
        <div className="list-foot">
          {composing ? (
            <div className="composer">
              <textarea
                rows={3}
                id={`composer-${list.id}`}
                autoFocus
                placeholder="عنوان البطاقة… (Enter للإضافة)"
                value={draft}
                maxLength={500}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addCard();
                  }
                  if (e.key === 'Escape') setComposing(false);
                }}
              />
              <div className="row">
                <button className="btn" onClick={addCard}>
                  إضافة
                </button>
                <button className="ghostbtn" aria-label="إلغاء" onClick={() => setComposing(false)}>
                  <Icon name="x" />
                </button>
              </div>
            </div>
          ) : (
            <button className="addcard" onClick={() => setComposing(true)}>
              <Icon name="plus" /> إضافة بطاقة
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function CardFace({ card }: { card: Card }) {
  const m = useMasar();
  const ck = card.checklist;
  const doneCk = ck.filter((x) => x.done).length;
  const pendingCreate = card.id.startsWith('tmp-');
  const open = () => !pendingCreate && m.setOpenId(card.id);
  return (
    <article
      className={`card${card.done ? ' done' : ''}`}
      data-id={card.id}
      tabIndex={0}
      aria-label={card.title}
      style={pendingCreate ? { opacity: 0.6 } : undefined}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          open();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (e.currentTarget.dataset.dragged) {
          delete e.currentTarget.dataset.dragged;
          return;
        }
        open();
      }}
    >
      {card.labels.length > 0 && (
        <div className="labels">
          {card.labels.map((id) => {
            const L = LABELS.find((x) => x.id === id);
            return L ? (
              <span key={id} className={`lbl${id === 'y' ? ' y' : ''}`} style={{ ['--c' as string]: `var(--l-${id})` }}>
                {L.name}
              </span>
            ) : null;
          })}
        </div>
      )}
      <div className="ctop">
        <button
          className="tick"
          disabled={!m.canWrite || pendingCreate}
          aria-label={card.done ? 'إلغاء الإنجاز' : 'تعليم كمنجزة'}
          title={card.done ? 'إلغاء الإنجاز' : 'تعليم كمنجزة'}
          onClick={() => m.patchCard(card, { done: !card.done })}
        >
          <Icon name="check" />
        </button>
        <div className="ctitle">{card.title}</div>
      </div>
      {(card.due || card.description || ck.length > 0 || card.assignees.length > 0 || card.invoiceId) && (
        <div className="meta">
          <DueChip card={card} hijri={m.hijri} />
          {ck.length > 0 && (
            <span className={`chk${doneCk === ck.length ? ' full' : ''}`}>
              <Icon name="checks" />
              {doneCk}/{ck.length}
            </span>
          )}
          {card.description && (
            <span title="فيها وصف">
              <Icon name="lines" />
            </span>
          )}
          {card.invoiceId && (
            <span title="لها فاتورة في فكرتي">
              <Icon name="receipt" />
            </span>
          )}
          {card.assignees.length > 0 && (
            <span className="stack">
              {card.assignees.slice(0, 3).map((id) => (
                <Avatar key={id} person={m.membersById.get(id) ?? null} size="s" />
              ))}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

// ==================== السحب والإفلات ====================

/**
 * سحب البطاقات بين القوائم. نحرّك عنصرًا شبحيًا ومكانًا مؤقتًا في DOM مباشرة أثناء السحب
 * (بدون إعادة رسم React)، ثم نرسل النقل مرة واحدة عند الإفلات.
 */
function useDragAndDrop(boardRef: React.RefObject<HTMLElement>) {
  const m = useMasar();
  const latest = useRef(m);
  latest.current = m;

  useEffect(() => {
    const root = boardRef.current;
    if (!root) return;
    type Drag = {
      id: string;
      el: HTMLElement;
      x0: number;
      y0: number;
      x: number;
      y: number;
      touch: boolean;
      pid: number;
      started: boolean;
      cancelled: boolean;
      timer: ReturnType<typeof setTimeout> | undefined;
      offX: number;
      offY: number;
      ghost?: HTMLElement;
      ph?: HTMLElement;
    };
    let drag: Drag | null = null;

    const start = () => {
      if (!drag) return;
      const r = drag.el.getBoundingClientRect();
      drag.started = true;
      latest.current.dragging.current = true;
      drag.offX = drag.x0 - r.left;
      drag.offY = drag.y0 - r.top;
      const g = drag.el.cloneNode(true) as HTMLElement;
      g.classList.add('ghost');
      g.style.width = `${r.width}px`;
      g.removeAttribute('tabindex');
      (root.closest('.masar') ?? document.body).appendChild(g);
      drag.ghost = g;
      const ph = document.createElement('div');
      ph.className = 'ph';
      ph.style.height = `${r.height}px`;
      drag.el.parentNode!.insertBefore(ph, drag.el);
      drag.ph = ph;
      drag.el.classList.add('dragging');
      document.body.classList.add('is-dragging');
      move();
      requestAnimationFrame(autoScroll);
    };

    const move = () => {
      if (!drag?.ghost || !drag.ph) return;
      const { x, y } = drag;
      drag.ghost.style.transform = `translate(${x - drag.offX}px, ${y - drag.offY}px) rotate(-2deg)`;
      const list = document.elementFromPoint(x, y)?.closest('.list');
      if (!list || !root.contains(list)) return;
      const box = list.querySelector('.cards');
      if (!box) return;
      let before: Element | null = null;
      for (const c of Array.from(box.querySelectorAll('.card:not(.dragging)'))) {
        const r = c.getBoundingClientRect();
        if (y < r.top + r.height / 2) {
          before = c;
          break;
        }
      }
      if (drag.ph.parentNode === box && drag.ph.nextElementSibling === before) return;
      box.insertBefore(drag.ph, before ?? box.querySelector('.empty-filter'));
    };

    const autoScroll = () => {
      if (!drag?.started) return;
      const r = root.getBoundingClientRect();
      let moved = false;
      if (drag.x < r.left + 60) {
        root.scrollLeft -= 14;
        moved = true;
      } else if (drag.x > r.right - 60) {
        root.scrollLeft += 14;
        moved = true;
      }
      const box = drag.ph?.parentElement;
      if (box) {
        const b = box.getBoundingClientRect();
        if (drag.y < b.top + 36 && box.scrollTop > 0) {
          box.scrollTop -= 10;
          moved = true;
        } else if (drag.y > b.bottom - 36 && box.scrollTop < box.scrollHeight - box.clientHeight) {
          box.scrollTop += 10;
          moved = true;
        }
      }
      if (moved) move();
      requestAnimationFrame(autoScroll);
    };

    const finish = () => {
      const d = drag;
      drag = null;
      if (!d) return;
      clearTimeout(d.timer);
      if (!d.started) return;
      document.body.classList.remove('is-dragging');
      d.ghost?.remove();
      d.el.dataset.dragged = '1';
      const box = d.ph?.parentElement;
      const listId = box?.closest<HTMLElement>('.list')?.dataset.id;
      let nx = d.ph?.nextElementSibling ?? null;
      while (nx && (nx.classList.contains('dragging') || !nx.classList.contains('card'))) nx = nx.nextElementSibling;
      // نعيد DOM كما كان قبل أن يرسمه React من الحالة الجديدة
      d.ph?.remove();
      d.el.classList.remove('dragging');
      const st = latest.current;
      st.dragging.current = false;
      const card = st.data?.cards.find((c) => c.id === d.id);
      if (!card || !listId) return;
      const beforeId = (nx as HTMLElement | null)?.dataset.id ?? null;
      const sameSpot =
        card.listId === listId &&
        (() => {
          const arr = st.data!.cards.filter((c) => c.listId === listId).sort((a, b) => a.position - b.position);
          const i = arr.findIndex((c) => c.id === card.id);
          return (arr[i + 1]?.id ?? null) === beforeId;
        })();
      if (!sameSpot) st.patchCard(card, { move: { listId, beforeId } });
      setTimeout(() => delete d.el.dataset.dragged, 0);
    };

    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.card');
      if (!el || !root.contains(el) || !latest.current.canWrite) return;
      if ((e.target as HTMLElement).closest('button,input,textarea') || el.dataset.id?.startsWith('tmp-')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = {
        id: el.dataset.id!,
        el,
        x0: e.clientX,
        y0: e.clientY,
        x: e.clientX,
        y: e.clientY,
        touch: e.pointerType !== 'mouse',
        pid: e.pointerId,
        started: false,
        cancelled: false,
        timer: undefined,
        offX: 0,
        offY: 0,
      };
      if (drag.touch) {
        drag.timer = setTimeout(() => {
          if (drag && !drag.cancelled && !drag.started) {
            start();
            try {
              navigator.vibrate?.(12);
            } catch {
              /* الاهتزاز غير مدعوم */
            }
          }
        }, 260);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (!drag.started) {
        const dist = Math.hypot(drag.x - drag.x0, drag.y - drag.y0);
        if (!drag.touch) {
          if (dist > 5) start();
        } else if (dist > 8) {
          clearTimeout(drag.timer);
          drag.cancelled = true;
        }
        return;
      }
      move();
    };
    const onUp = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.pid) finish();
    };
    const onCancel = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      // على اللمس يكمل السحب عبر أحداث touch
      if (drag.started && drag.touch) return;
      finish();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!drag?.started) return;
      e.preventDefault();
      drag.x = e.touches[0].clientX;
      drag.y = e.touches[0].clientY;
      move();
    };
    const onTouchEnd = () => {
      if (drag?.started) finish();
    };

    root.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      root.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      drag?.ghost?.remove();
      latest.current.dragging.current = false;
    };
  }, [boardRef]);
}

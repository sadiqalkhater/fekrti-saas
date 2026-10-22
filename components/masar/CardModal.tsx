'use client';

// components/masar/CardModal.tsx
// تفاصيل البطاقة: المسؤولون، التصنيفات، الوصف، قائمة التحقق، التعليقات، والفاتورة

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, api, Card, errorMessage, MyTask, newId } from '@/lib/masar/client';
import { LABEL_IDS, LABELS, parseYmd } from '@/lib/masar/shared';
import { useMasar } from '@/components/masar/MasarContext';
import { ago, Avatar, F, Icon } from '@/components/masar/ui';

export default function CardModal() {
  const m = useMasar();
  const id = m.openId!;
  const fromBoard = m.data?.cards.find((c) => c.id === id);
  const [fetched, setFetched] = useState<Card | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [missing, setMissing] = useState(false);
  const card = fromBoard ?? fetched;

  const load = useCallback(async () => {
    try {
      const res = await api<{ card: Card; activity: Activity[] }>(`/api/masar/cards/${id}`);
      setFetched(res.card);
      setActivity(res.activity);
    } catch {
      setMissing(true);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 5000);
    return () => clearInterval(t);
  }, [load]);

  const { setOpenId, setBoardId, boardId, boards } = m;
  const close = useCallback(() => {
    setOpenId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('card');
    window.history.replaceState(null, '', url);
  }, [setOpenId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  // البطاقة من لوحة أخرى (من «مهامي» أو إشعار): انتقل إلى لوحتها
  useEffect(() => {
    if (fetched && fetched.boardId !== boardId && boards?.some((b) => b.id === fetched.boardId)) setBoardId(fetched.boardId);
  }, [fetched, boardId, boards, setBoardId]);

  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      {card ? (
        <CardBody card={card} activity={activity} reload={load} close={close} />
      ) : (
        <div className="modal narrow" role="dialog" aria-modal="true" aria-label="بطاقة">
          <div className="mhead">
            <div className="mtitle" style={{ border: 0 }}>
              {missing ? 'هذه البطاقة لم تعد موجودة' : 'جارٍ التحميل…'}
            </div>
            <button className="ghostbtn" aria-label="إغلاق" onClick={close}>
              <Icon name="x" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CardBody({ card, activity, reload, close }: { card: Card; activity: Activity[]; reload: () => void; close: () => void }) {
  const m = useMasar();
  const ro = !m.canWrite || m.myRole === 'VIEWER';
  const lists = m.data && m.data.board.id === card.boardId ? m.data.lists : [];
  const listTitle = lists.find((l) => l.id === card.listId)?.title ?? (card as Partial<MyTask>).listTitle ?? '';
  const boardName = m.boards?.find((b) => b.id === card.boardId)?.name ?? '';

  // مسودات النصوص محلية حتى لا تقاطعها المزامنة الدورية أثناء الكتابة
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description);
  const editing = useRef<'title' | 'desc' | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    if (editing.current !== 'title') setTitle(card.title);
  }, [card.title]);
  useEffect(() => {
    if (editing.current !== 'desc') setDesc(card.description);
  }, [card.description]);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const t = titleRef.current;
    if (t) {
      t.style.height = 'auto';
      t.style.height = `${t.scrollHeight}px`;
    }
  }, [title]);

  const save = (key: string, fn: () => void, ms = 600) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, ms);
  };
  const patch = async (p: Parameters<typeof m.patchCard>[1]) => {
    await m.patchCard(card, p);
    reload();
  };

  const [ckText, setCkText] = useState('');
  const [ckBusy, setCkBusy] = useState(false);
  const [ckErr, setCkErr] = useState('');
  const [comment, setComment] = useState('');
  const ck = card.checklist;
  const doneCk = ck.filter((x) => x.done).length;
  const pct = ck.length ? Math.round((doneCk / ck.length) * 100) : 0;

  async function suggestSteps() {
    setCkBusy(true);
    setCkErr('');
    try {
      const res = await api<{ steps: string[] }>('/api/masar/ai/checklist', { body: { cardId: card.id } });
      await patch({ checklist: [...ck, ...res.steps.map((text) => ({ id: newId(), text, done: false }))] });
    } catch (e) {
      setCkErr(errorMessage(e));
    } finally {
      setCkBusy(false);
    }
  }

  async function sendComment() {
    const text = comment.trim();
    if (!text) return;
    setComment('');
    try {
      await api(`/api/masar/cards/${card.id}/comments`, { body: { text } });
      reload();
    } catch (e) {
      setComment(text);
      m.fail(e);
    }
  }

  const person = (id: string | null) => (id ? m.membersById.get(id) ?? (m.me?.id === id ? { ...m.me, role: 'MEMBER' as const } : null) : null);
  const nameOf = (id: string | null) => (id && id === m.me?.id ? 'أنت' : person(id)?.name || 'عضو');

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
      <div className="mhead">
        <textarea
          ref={titleRef}
          className="mtitle"
          id="m-title"
          rows={1}
          aria-label="عنوان البطاقة"
          value={title}
          readOnly={ro}
          maxLength={500}
          onFocus={() => (editing.current = 'title')}
          onBlur={() => (editing.current = null)}
          onChange={(e) => {
            const v = e.target.value.replace(/\n/g, ' ');
            setTitle(v);
            if (v.trim()) save('title', () => patch({ title: v.trim() }));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
        <button className="ghostbtn" aria-label="إغلاق" onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      <div className="inlist">
        في لوحة «{boardName}» · قائمة «{listTitle}»
      </div>
      <div className="mbody">
        <div className="mmain">
          <Assignees card={card} ro={ro} onChange={(assignees) => patch({ assignees })} />

          <div className="sec">
            <h3>التصنيفات</h3>
            <div className="lblpick">
              {LABELS.map((L) => (
                <button
                  key={L.id}
                  className={L.id === 'y' ? 'y' : ''}
                  style={{ ['--c' as string]: `var(--l-${L.id})` }}
                  aria-pressed={card.labels.includes(L.id)}
                  disabled={ro}
                  onClick={() => {
                    const cur = card.labels;
                    patch({ labels: cur.includes(L.id) ? cur.filter((x) => x !== L.id) : LABEL_IDS.filter((x) => x === L.id || cur.includes(x)) });
                  }}
                >
                  {L.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sec">
            <h3>الوصف</h3>
            <textarea
              className="desc"
              id="m-desc"
              placeholder={ro ? 'لا يوجد وصف' : 'أضف تفاصيل أكثر…'}
              value={desc}
              readOnly={ro}
              maxLength={20000}
              onFocus={() => (editing.current = 'desc')}
              onBlur={() => (editing.current = null)}
              onChange={(e) => {
                const v = e.target.value;
                setDesc(v);
                save('desc', () => patch({ description: v }), 800);
              }}
            />
          </div>

          <div className="sec">
            <h3>
              قائمة التحقق
              <span className="spacer" />
              {m.ai &&
                !ro &&
                (ckBusy ? (
                  <span className="thinking" style={{ fontSize: 12 }}>
                    <i />
                    أقسّم المهمة…
                  </span>
                ) : (
                  <button className="linkai" onClick={suggestSteps}>
                    <Icon name="spark" /> قسّمها بالذكاء الاصطناعي
                  </button>
                ))}
            </h3>
            {ckErr && <div className="err">{ckErr}</div>}
            {ck.length > 0 && (
              <div className="progress">
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{pct}%</span>
                <div className="bar">
                  <i className={pct === 100 ? 'full' : ''} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            {ck.map((it) => (
              <label key={it.id} className={`ckitem${it.done ? ' on' : ''}`}>
                <input
                  type="checkbox"
                  checked={it.done}
                  disabled={ro}
                  onChange={(e) => patch({ checklist: ck.map((x) => (x.id === it.id ? { ...x, done: e.target.checked } : x)) })}
                />
                <span>{it.text}</span>
                {!ro && (
                  <button
                    className="ghostbtn"
                    aria-label="حذف الخطوة"
                    onClick={(e) => {
                      e.preventDefault();
                      patch({ checklist: ck.filter((x) => x.id !== it.id) });
                    }}
                  >
                    <Icon name="x" />
                  </button>
                )}
              </label>
            ))}
            {!ro && (
              <div className="composer" style={{ marginTop: 6 }}>
                <input
                  id="m-ck"
                  placeholder="أضف خطوة… (Enter)"
                  value={ckText}
                  maxLength={500}
                  onChange={(e) => setCkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = ckText.trim();
                      setCkText('');
                      if (v) patch({ checklist: [...ck, { id: newId(), text: v, done: false }] });
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="sec">
            <h3>التعليقات والنشاط</h3>
            {!ro && m.me && (
              <div className="comment-box">
                <Avatar person={m.me} size="s" />
                <div className="composer">
                  <textarea
                    id="m-comment"
                    rows={2}
                    placeholder="اكتب تعليقًا… (Enter للإرسال، Shift+Enter لسطر جديد)"
                    value={comment}
                    maxLength={4000}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendComment();
                      }
                    }}
                  />
                  <div className="row">
                    <button className="btn" onClick={sendComment}>
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="timeline" style={{ marginTop: 12 }}>
              {activity.map((a) => (
                <EventLine key={a.id} a={a} name={nameOf(a.userId)} person={person(a.userId)} />
              ))}
            </div>
          </div>
        </div>

        <aside className="mside">
          <div className="field">
            <label htmlFor="m-due">تاريخ الاستحقاق</label>
            <input type="date" id="m-due" value={card.due ?? ''} disabled={ro} onChange={(e) => patch({ due: e.target.value || null })} />
            {card.due && m.hijri && <span className="hint">{F.h.format(parseYmd(card.due))}</span>}
          </div>
          <label className="switch">
            <input type="checkbox" id="m-done" checked={card.done} disabled={ro} onChange={() => patch({ done: !card.done })} />
            مُنجزة
          </label>
          {lists.length > 0 && (
            <div className="field">
              <label htmlFor="m-list">نقل إلى قائمة</label>
              <select id="m-list" value={card.listId} disabled={ro} onChange={(e) => patch({ move: { listId: e.target.value, beforeId: null } })}>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <InvoiceBox card={card} ro={ro} onDone={reload} />
          {!ro && (
            <button className="sidebtn danger" onClick={() => m.archiveCard(card)}>
              <Icon name="archive" /> أرشفة البطاقة
            </button>
          )}
          <div className="created">
            أنشأها {nameOf(card.createdById)} · {ago(card.createdAt)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EventLine({ a, name, person }: { a: Activity; name: string; person: { id: string; name: string; avatar: string | null } | null }) {
  return (
    <div className={`ev ${a.kind === 'COMMENT' ? 'comment' : 'act'}`}>
      <Avatar person={person} size="s" />
      <div className="body">
        <span className="who">{name}</span> {a.kind === 'COMMENT' ? 'علّق' : <span className="txt">{a.text}</span>}
        <span className="when">{ago(a.createdAt)}</span>
        {a.kind === 'COMMENT' && <div className="bubble">{a.text}</div>}
      </div>
    </div>
  );
}

function Assignees({ card, ro, onChange }: { card: Card; ro: boolean; onChange: (ids: string[]) => void }) {
  const m = useMasar();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const as = card.assignees;
  const options = m.members.filter(
    (p) => !as.includes(p.id) && p.role !== 'VIEWER' && (!q || p.name.includes(q) || p.email.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div className="sec">
      <h3>المسؤولون</h3>
      <div className="members">
        {as.map((id) => {
          const p = m.membersById.get(id) ?? null;
          return (
            <span key={id} className="member">
              <Avatar person={p} size="s" />
              {id === m.me?.id ? 'أنت' : p?.name || 'عضو سابق'}
              {!ro && (
                <button aria-label={`إزالة ${p?.name ?? ''}`} onClick={() => onChange(as.filter((x) => x !== id))}>
                  <Icon name="x" />
                </button>
              )}
            </span>
          );
        })}
        {!ro && m.me && !as.includes(m.me.id) && (
          <button className="fchip" onClick={() => onChange([...as, m.me!.id])}>
            أسندها لي
          </button>
        )}
        {!ro && (
          <div className="picker">
            <input
              id="m-pick"
              placeholder="أضف عضوًا بالاسم…"
              autoComplete="off"
              value={q}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            />
            {open && (
              <div className="pick-menu" role="listbox">
                {options.length ? (
                  options.map((p) => (
                    <button
                      key={p.id}
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange([...as, p.id]);
                        setQ('');
                        setOpen(false);
                      }}
                    >
                      <Avatar person={p} size="s" />
                      {p.id === m.me?.id ? 'أنت' : p.name}
                    </button>
                  ))
                ) : (
                  <div className="none">لا نتائج. أضف زملاءك للمساحة من زر الأعضاء في الأعلى.</div>
                )}
              </div>
            )}
          </div>
        )}
        {ro && !as.length && <span className="hint">لا أحد</span>}
      </div>
    </div>
  );
}

function InvoiceBox({ card, ro, onDone }: { card: Card; ro: boolean; onDone: () => void }) {
  const m = useMasar();
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (card.invoiceId) {
    return (
      <div className="invoice-done">
        <Icon name="receipt" /> لها مسودة فاتورة في فكرتي
      </div>
    );
  }
  if (ro || !m.wsInfo?.invoicing) return null;
  if (!open) {
    return (
      <button className="sidebtn" onClick={() => setOpen(true)}>
        <Icon name="receipt" /> أصدر فاتورة
      </button>
    );
  }
  const value = Number(amount);
  return (
    <form
      className="invoice-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr('');
        try {
          const res = await api<{ invoiceNumber: string; totalAmount: number; currency: string }>(`/api/masar/cards/${card.id}/invoice`, {
            body: { clientName: client.trim(), amount: value },
          });
          m.showToast(`أُنشئت مسودة الفاتورة ${res.invoiceNumber} بإجمالي ${res.totalAmount.toFixed(2)} ${res.currency}`);
          m.refreshBoard(true);
          onDone();
          setOpen(false);
        } catch (e2) {
          setErr(errorMessage(e2));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor="inv-client">اسم العميل</label>
        <input id="inv-client" className="field-input" required maxLength={120} value={client} onChange={(e) => setClient(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="inv-amount">المبلغ قبل الضريبة (ر.س)</label>
        <input
          id="inv-amount"
          className="field-input"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          dir="ltr"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {value > 0 && <span className="hint">الإجمالي مع ضريبة 15٪: {(value * 1.15).toFixed(2)} ر.س</span>}
      </div>
      {err && <div className="err">{err}</div>}
      <div className="row">
        <button className="btn" type="submit" disabled={busy || !client.trim() || !(value > 0)}>
          {busy ? 'لحظة…' : 'أنشئ المسودة'}
        </button>
        <button type="button" className="ghostbtn" aria-label="إلغاء" onClick={() => setOpen(false)}>
          <Icon name="x" />
        </button>
      </div>
    </form>
  );
}

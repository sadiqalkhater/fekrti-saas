'use client';

// components/masar/ui.tsx
// عناصر واجهة مسار الصغيرة: الأيقونات، الصور الرمزية، والتواريخ

import { Card, Member } from '@/lib/masar/client';
import { addDays, dueStatus, parseYmd, ymd } from '@/lib/masar/shared';

const paths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  lines: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  checks: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12l3 3 5-6"/>',
  bell: '<path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'check' ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: paths[name] }}
    />
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="3" width="6" height="18" rx="2" fill="#5B8CFF" />
      <rect x="9" y="3" width="6" height="12" rx="2" fill="#38C99A" />
      <rect x="16" y="3" width="6" height="8" rx="2" fill="#F2B84B" />
    </svg>
  );
}

const PALETTE = ['#3E6FD8', '#16946F', '#9447B0', '#C0662A', '#C2416B', '#2C8C9E', '#6A5ACD', '#8A6D1F'];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function Avatar({ person, size, live }: { person: Pick<Member, 'id' | 'name' | 'avatar'> | null; size?: 's' | 'l'; live?: boolean }) {
  const cls = `av${size ? ` ${size}` : ''}${live ? ' live' : ''}`;
  const name = person?.name || 'عضو';
  if (person?.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={cls} src={person.avatar} alt={name} title={name} />;
  }
  return (
    <span className={cls} style={{ ['--c' as string]: person ? colorFor(person.id) : '#6B7A8C' }} title={name}>
      {name.trim().charAt(0) || '؟'}
    </span>
  );
}

// ==================== التواريخ ====================

function fmt(opts: Intl.DateTimeFormatOptions, hijri?: boolean) {
  try {
    return new Intl.DateTimeFormat(hijri ? 'ar-SA-u-ca-islamic-umalqura-nu-latn' : 'ar-SA-u-ca-gregory-nu-latn', opts);
  } catch {
    return { format: (d: Date) => ymd(d) };
  }
}
export const F = {
  g: fmt({ day: 'numeric', month: 'short' }),
  h: fmt({ day: 'numeric', month: 'short' }, true),
  gm: fmt({ month: 'long', year: 'numeric' }),
  hm: fmt({ month: 'long', year: 'numeric' }, true),
  hd: fmt({ day: 'numeric' }, true),
};

export function dueText(due: string, hijri: boolean) {
  if (due === ymd(new Date())) return 'اليوم';
  if (due === addDays(1)) return 'غدًا';
  if (due === addDays(-1)) return 'أمس';
  return (hijri ? F.h : F.g).format(parseYmd(due));
}

export function ago(iso: string) {
  const t = new Date(iso).getTime();
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'الآن';
  let rt: Intl.RelativeTimeFormat;
  try {
    rt = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  } catch {
    return new Date(t).toLocaleString();
  }
  const m = Math.round(s / 60);
  if (m < 60) return rt.format(-m, 'minute');
  const h = Math.round(m / 60);
  if (h < 24) return rt.format(-h, 'hour');
  const d = Math.round(h / 24);
  return d < 30 ? rt.format(-d, 'day') : F.g.format(new Date(t));
}

export function DueChip({ card, hijri }: { card: Pick<Card, 'due' | 'done'>; hijri: boolean }) {
  if (!card.due) return null;
  return (
    <span className={`due ${dueStatus(card.due, card.done) ?? ''}`}>
      <Icon name="clock" />
      {dueText(card.due, hijri)}
    </span>
  );
}

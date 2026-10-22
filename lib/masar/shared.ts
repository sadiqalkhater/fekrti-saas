// lib/masar/shared.ts
// ثوابت ودوال مسار المشتركة بين الخادم والواجهة

export const LABELS = [
  { id: 'g', name: 'تصميم' },
  { id: 'b', name: 'تطوير' },
  { id: 'p', name: 'تسويق' },
  { id: 'o', name: 'عاجل' },
  { id: 'y', name: 'بانتظار رد' },
  { id: 'r', name: 'خلل' },
] as const;

export type LabelId = (typeof LABELS)[number]['id'];
export const LABEL_IDS: string[] = LABELS.map((l) => l.id);

export const BOARD_COLORS = ['c1', 'c2', 'c3', 'c4'] as const;

export const TEMPLATES = [
  { id: 'basic', name: 'أساسية', lists: ['للتنفيذ', 'قيد التنفيذ', 'مكتمل'] },
  { id: 'launch', name: 'إطلاق منتج', lists: ['أفكار', 'تصميم', 'تطوير', 'اختبار', 'أُطلق'] },
  { id: 'mkt', name: 'خطة تسويق', lists: ['أفكار محتوى', 'قيد الكتابة', 'جاهز للنشر', 'منشور'] },
  { id: 'hire', name: 'توظيف', lists: ['متقدمون', 'مقابلة أولى', 'مقابلة نهائية', 'عرض وظيفي', 'تم التعيين'] },
] as const;

export const POSITION_GAP = 1024;

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/**
 * موضع عنصر يُدرج قبل العنصر `beforeIndex` في قائمة مرتبة من المواضع
 * (أو في النهاية إن كان -1)
 */
export function positionBetween(sorted: number[], beforeIndex: number): number {
  if (beforeIndex < 0 || beforeIndex >= sorted.length) {
    return sorted.length ? sorted[sorted.length - 1] + POSITION_GAP : POSITION_GAP;
  }
  const next = sorted[beforeIndex];
  const prev = beforeIndex > 0 ? sorted[beforeIndex - 1] : next - 2 * POSITION_GAP;
  return (prev + next) / 2;
}

/** تاريخ محلي بصيغة YYYY-MM-DD */
export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

export type DueStatus = 'done' | 'overdue' | 'soon' | 'later' | null;

/** حالة موعد الاستحقاق: متأخرة، خلال يومين، لاحقًا، أو منجزة */
export function dueStatus(due: string | null, done: boolean, today: Date = new Date()): DueStatus {
  if (!due) return null;
  if (done) return 'done';
  const diff = Math.round((parseYmd(due).getTime() - parseYmd(ymd(today)).getTime()) / 864e5);
  if (diff < 0) return 'overdue';
  if (diff <= 2) return 'soon';
  return 'later';
}

// utils/helpers.ts
// دوال مساعدة عامة

import { format, parseISO } from 'date-fns';
import ar from 'date-fns/locale/ar-SA';

// ==================== FORMATTING ====================

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ar });
  } catch (error) {
    return '';
  }
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * تنسيق الرقم بفاصل الألوف
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * تنسيق العملة
 */
export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  const currencySymbols: Record<string, string> = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
    AED: 'د.إ',
    KWD: 'د.ك',
  };
  const symbol = currencySymbols[currency] || currency;
  return `${formatNumber(amount)} ${symbol}`;
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * تنسيق الهاتف
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+966${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+966${cleaned.substring(1)}`;
  }
  return phone;
}

/**
 * تنسيق رقم الحساب البنكي
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/\s+/g, '').toUpperCase();
}

/**
 * تنسيق رقم الفاتورة
 */
export function generateInvoiceNumber(vendorId: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `INV-${vendorId.substring(0, 4).toUpperCase()}-${year}-${month}-${String(count).padStart(4, '0')}`;
}

/**
 * تنسيق رقم العرض
 */
export function generateProposalNumber(vendorId: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear();
  return `PRO-${vendorId.substring(0, 4).toUpperCase()}-${year}-${String(count).padStart(4, '0')}`;
}

/**
 * تنسيق رقم المشروع
 */
export function generateProjectNumber(vendorId: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear();
  return `PRJ-${vendorId.substring(0, 4).toUpperCase()}-${year}-${String(count).padStart(4, '0')}`;
}

// ==================== CALCULATIONS ====================

/**
 * حساب الضريبة
 */
export function calculateTax(amount: number, taxRate: number = 0.15): number {
  return Math.round(amount * taxRate * 100) / 100;
}

/**
 * حساب المجموع مع الضريبة
 */
export function calculateTotal(subtotal: number, taxRate: number = 0.15): number {
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
}

/**
 * حساب النسبة المئوية
 */
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * حساب الخصم
 */
export function calculateDiscount(original: number, discount: number): number {
  return original - discount;
}

/**
 * حساب النمو
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

// ==================== VALIDATION ====================

/**
 * التحقق من البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * التحقق من رقم الهاتف
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^(\+966|0)(5|9)\d{8}$/;
  return regex.test(phone);
}

/**
 * التحقق من IBAN
 */
export function isValidIBAN(iban: string): boolean {
  const regex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  return regex.test(iban.toUpperCase());
}

/**
 * التحقق من رقم الضريبة السعودي
 */
export function isValidSaudiTaxId(taxId: string): boolean {
  const regex = /^[0-9]{15}$/;
  return regex.test(taxId);
}

/**
 * التحقق من كلمة المرور
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
}

// ==================== STRING UTILITIES ====================

/**
 * عمل slug من نص
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * تقصير النص
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
}

/**
 * رأس ملتقن (Capitalize)
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * إزالة الفراغات الإضافية
 */
export function trimWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * عكس النص (للعربية)
 */
export function reverseText(text: string): string {
  return text.split('').reverse().join('');
}

// ==================== ARRAY UTILITIES ====================

/**
 * الحصول على العنصر الفريد من المصفوفة
 */
export function getUnique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * تجميع المصفوفة
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * فرز المصفوفة
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ==================== TIME UTILITIES ====================

/**
 * الحصول على عدد الأيام المتبقية
 */
export function getDaysRemaining(endDate: Date | string): number {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * التحقق من انتهاء الصلاحية
 */
export function isExpired(endDate: Date | string): boolean {
  return getDaysRemaining(endDate) < 0;
}

/**
 * الحصول على الفرق الزمني
 */
export function getTimeDifference(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `قبل ${years} سنة${years > 1 ? 'ت' : ''}`;
  if (months > 0) return `قبل ${months} شهر`;
  if (days > 0) return `قبل ${days} يوم`;
  if (hours > 0) return `قبل ${hours} ساعة`;
  if (minutes > 0) return `قبل ${minutes} دقيقة`;
  return 'الآن';
}

// ==================== FILE UTILITIES ====================

/**
 * الحصول على امتداد الملف
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * التحقق من نوع الملف
 */
export function isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

/**
 * تحويل حجم الملف
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ==================== COLOR UTILITIES ====================

/**
 * توليد لون عشوائي
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * الحصول على لون حسب الحالة
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100',
    active: 'bg-green-100',
    inactive: 'bg-gray-100',
    draft: 'bg-gray-100',
    sent: 'bg-blue-100',
    approved: 'bg-green-100',
    rejected: 'bg-red-100',
    suspended: 'bg-red-100',
    expired: 'bg-orange-100',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100';
}

// ==================== EXPORT UTILITIES ====================

/**
 * تحويل البيانات إلى CSV
 */
export function convertToCSV<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    })
  );

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * تحميل ملف CSV
 */
export function downloadCSV(data: string, filename: string = 'export.csv'): void {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// ==================== SECURITY ====================

/**
 * التحقق من وجود أحرف خطيرة
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '')
    .trim();
}

/**
 * تشفير النص (Base64)
 */
export function encodeText(text: string): string {
  return Buffer.from(text).toString('base64');
}

/**
 * فك تشفير النص (Base64)
 */
export function decodeText(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString();
}

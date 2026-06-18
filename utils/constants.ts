// utils/constants.ts
// جميع الثوابت في التطبيق

// ==================== COMPANY INFO ====================

export const COMPANY = {
  NAME: 'فكرتي',
  FULL_NAME: 'فكرتي للاستشارات المالية والإدارية',
  SLOGAN: 'منصة الخدمات المتكاملة',
  AUTHOR: 'صادق الخاطر - Sadiq AlKhater',
  EMAIL: 'info@fekrti.sa',
  PHONE: '+966548187999',
  WEBSITE: 'www.fekrti.sa',
  SOCIAL: {
    TWITTER: 'https://twitter.com/fekrti',
    FACEBOOK: 'https://facebook.com/fekrti',
    INSTAGRAM: 'https://instagram.com/fekrti',
    LINKEDIN: 'https://linkedin.com/company/fekrti',
  },
  COLORS: {
    PRIMARY: '#1B6CA8',
    SECONDARY: '#C8960A',
    NAVY: '#0F2C41',
    SKY: '#3B9FD8',
    GOLD: '#C8960A',
  },
};

// ==================== ROUTES ====================

export const ROUTES = {
  // Public
  HOME: '/',
  MARKETPLACE: '/marketplace',
  SERVICE: (slug: string) => `/service/${slug}`,
  VENDOR: (slug: string) => `/vendor/${slug}`,
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',

  // Vendor Dashboard
  DASHBOARD: '/dashboard',
  VENDOR_PROFILE: '/dashboard/profile',
  VENDOR_SERVICES: '/dashboard/services',
  VENDOR_SERVICE_NEW: '/dashboard/services/new',
  VENDOR_SERVICE_EDIT: (id: string) => `/dashboard/services/${id}/edit`,
  
  // Projects
  PROJECTS: '/dashboard/projects',
  PROJECT_NEW: '/dashboard/projects/new',
  PROJECT_DETAIL: (id: string) => `/dashboard/projects/${id}`,
  PROJECT_EDIT: (id: string) => `/dashboard/projects/${id}/edit`,

  // Proposals
  PROPOSALS: '/dashboard/proposals',
  PROPOSAL_NEW: '/dashboard/proposals/new',
  PROPOSAL_NEW_FROM_PROJECT: (projectId: string) => `/dashboard/proposals/new?project=${projectId}`,
  PROPOSAL_VIEW: (id: string) => `/dashboard/proposals/${id}`,
  PROPOSAL_EDIT: (id: string) => `/dashboard/proposals/${id}/edit`,

  // Invoices
  INVOICES: '/dashboard/invoices',
  INVOICE_NEW: '/dashboard/invoices/new',
  INVOICE_VIEW: (id: string) => `/dashboard/invoices/${id}`,
  INVOICE_EDIT: (id: string) => `/dashboard/invoices/${id}/edit`,
  INVOICE_PDF: (id: string) => `/api/invoices/${id}/pdf`,

  // Receipts
  RECEIPTS: '/dashboard/receipts',
  RECEIPT_NEW: '/dashboard/receipts/new',
  RECEIPT_VIEW: (id: string) => `/dashboard/receipts/${id}`,

  // Expenses
  EXPENSES: '/dashboard/expenses',
  EXPENSE_NEW: '/dashboard/expenses/new',
  EXPENSE_VIEW: (id: string) => `/dashboard/expenses/${id}`,

  // Agreements
  AGREEMENTS: '/dashboard/agreements',
  AGREEMENT_NEW: '/dashboard/agreements/new',
  AGREEMENT_VIEW: (id: string) => `/dashboard/agreements/${id}`,

  // Reports
  REPORTS: '/dashboard/reports',
  FINANCIAL_REPORTS: '/dashboard/reports/financial',
  PROJECT_REPORTS: '/dashboard/reports/projects',
  SERVICE_REPORTS: '/dashboard/reports/services',

  // Settings
  SETTINGS: '/dashboard/settings',
  ACCOUNT_SETTINGS: '/dashboard/settings/account',
  VENDOR_SETTINGS: '/dashboard/settings/vendor',
  NOTIFICATION_SETTINGS: '/dashboard/settings/notifications',

  // Marketplace Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
};

// ==================== PAGINATION ====================

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// ==================== STATUS MESSAGES ====================

export const STATUS_MESSAGES = {
  // Proposals
  PROPOSAL_SENT: 'تم إرسال العرض بنجاح',
  PROPOSAL_ACCEPTED: 'تم قبول العرض',
  PROPOSAL_REJECTED: 'تم رفض العرض',
  PROPOSAL_EXPIRED: 'انتهت صلاحية العرض',

  // Invoices
  INVOICE_CREATED: 'تم إنشاء الفاتورة',
  INVOICE_SENT: 'تم إرسال الفاتورة',
  INVOICE_PAID: 'تم دفع الفاتورة',
  INVOICE_OVERDUE: 'الفاتورة متأخرة عن الموعد',

  // Payments
  PAYMENT_RECEIVED: 'تم استلام الدفعة',
  PAYMENT_REFUNDED: 'تم استرجاع الدفعة',

  // Projects
  PROJECT_CREATED: 'تم إنشاء المشروع',
  PROJECT_COMPLETED: 'تم إكمال المشروع',
  PROJECT_CANCELLED: 'تم إلغاء المشروع',

  // Services
  SERVICE_CREATED: 'تم إنشاء الخدمة',
  SERVICE_APPROVED: 'تم قبول الخدمة',
  SERVICE_SUSPENDED: 'تم إيقاف الخدمة',

  // Vendors
  VENDOR_VERIFIED: 'تم التحقق من التاجر',
  VENDOR_SUSPENDED: 'تم إيقاف حساب التاجر',
};

// ==================== SERVICE CATEGORIES ====================

export const SERVICE_CATEGORIES = [
  { id: 'consulting', name: 'استشارات', icon: '💼' },
  { id: 'accounting', name: 'محاسبة', icon: '📊' },
  { id: 'marketing', name: 'تسويق', icon: '📢' },
  { id: 'design', name: 'تصميم', icon: '🎨' },
  { id: 'development', name: 'تطوير', icon: '💻' },
  { id: 'writing', name: 'كتابة', icon: '✍️' },
  { id: 'translation', name: 'ترجمة', icon: '🌐' },
  { id: 'training', name: 'تدريب', icon: '🎓' },
  { id: 'hr', name: 'موارد بشرية', icon: '👥' },
  { id: 'legal', name: 'قانوني', icon: '⚖️' },
];

// ==================== EXPENSE CATEGORIES ====================

export const EXPENSE_CATEGORIES = [
  'مواد ومستلزمات',
  'أجور وراتب',
  'إيجار',
  'كهرباء وماء',
  'اتصالات',
  'مواصلات',
  'صيانة',
  'تأمين',
  'إعلانات',
  'تدريب',
  'مكافآت',
  'أخرى',
];

// ==================== PAYMENT METHODS ====================

export const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'تحويل بنكي' },
  { id: 'cash', name: 'نقداً' },
  { id: 'check', name: 'شيك' },
  { id: 'card', name: 'بطاقة ائتمان' },
  { id: 'online', name: 'دفع أونلاين' },
];

// ==================== TAX RATES ====================

export const TAX_RATES = {
  DEFAULT: 0.15, // 15% VAT
  SAUDI: 0.15,
};

// ==================== CURRENCIES ====================

export const CURRENCIES = [
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
  { code: 'EUR', name: 'يورو', symbol: '€' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
];

// ==================== VALIDATION ====================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+966|0)(5|9)\d{8}$/,
  IBAN_REGEX: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/,
  TAX_ID_REGEX: /^[0-9]{15}$/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PASSWORD_MIN_LENGTH: 8,
  BUSINESS_NAME_MIN_LENGTH: 2,
  BUSINESS_NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
};

// ==================== FILE UPLOAD ====================

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'],
  ALLOWED_EXTENSIONS: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
};

// ==================== PAGINATION LIMITS ====================

export const LIMITS = {
  SERVICES_PER_PAGE: 12,
  PROPOSALS_PER_PAGE: 20,
  INVOICES_PER_PAGE: 20,
  PROJECTS_PER_PAGE: 20,
  RECEIPTS_PER_PAGE: 20,
  EXPENSES_PER_PAGE: 20,
  AGREEMENTS_PER_PAGE: 20,
  REVIEWS_PER_PAGE: 10,
};

// ==================== CACHE DURATION ====================

export const CACHE_DURATION = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 24 * 60 * 60, // 24 hours
};

// ==================== DATE FORMATS ====================

export const DATE_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
};

// ==================== INVOICE STATUSES ====================

export const INVOICE_STATUSES = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100', textColor: 'text-gray-700' },
  SENT: { label: 'مرسلة', color: 'bg-blue-100', textColor: 'text-blue-700' },
  VIEWED: { label: 'شوهدت', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  PARTIALLY_PAID: { label: 'مدفوع جزئي', color: 'bg-orange-100', textColor: 'text-orange-700' },
  PAID: { label: 'مدفوع', color: 'bg-green-100', textColor: 'text-green-700' },
  OVERDUE: { label: 'متأخر', color: 'bg-red-100', textColor: 'text-red-700' },
  CANCELLED: { label: 'ملغى', color: 'bg-gray-100', textColor: 'text-gray-700' },
};

// ==================== PROPOSAL STATUSES ====================

export const PROPOSAL_STATUSES = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100', textColor: 'text-gray-700' },
  SENT: { label: 'مرسلة', color: 'bg-blue-100', textColor: 'text-blue-700' },
  VIEWED: { label: 'شوهدت', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  ACCEPTED: { label: 'مقبولة', color: 'bg-green-100', textColor: 'text-green-700' },
  REJECTED: { label: 'مرفوضة', color: 'bg-red-100', textColor: 'text-red-700' },
  EXPIRED: { label: 'انتهت صلاحيتها', color: 'bg-orange-100', textColor: 'text-orange-700' },
};

// ==================== VENDOR STATUSES ====================

export const VENDOR_STATUSES = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-gray-100' },
  APPROVED: { label: 'موافق', color: 'bg-green-100' },
  SUSPENDED: { label: 'موقوف', color: 'bg-red-100' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100' },
  INACTIVE: { label: 'غير نشط', color: 'bg-gray-100' },
};

// ==================== SUCCESS & ERROR MESSAGES ====================

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'تم الإنشاء بنجاح',
    UPDATED: 'تم التحديث بنجاح',
    DELETED: 'تم الحذف بنجاح',
    SAVED: 'تم الحفظ بنجاح',
    SENT: 'تم الإرسال بنجاح',
  },
  ERROR: {
    REQUIRED: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
    INVALID_PHONE: 'رقم الهاتف غير صحيح',
    PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة',
    WEAK_PASSWORD: 'كلمة المرور ضعيفة جداً',
    USER_EXISTS: 'المستخدم موجود بالفعل',
    NOT_FOUND: 'لم يتم العثور على السجل',
    UNAUTHORIZED: 'أنت غير مصرح بهذا الإجراء',
    SERVER_ERROR: 'خطأ في الخادم',
  },
};

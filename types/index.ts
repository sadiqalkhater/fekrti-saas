// types/index.ts
// جميع أنواع TypeScript في المشروع

// ==================== USERS ====================

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'USER' | 'VENDOR' | 'ADMIN' | 'ACCOUNTANT' | 'MODERATOR';

// ==================== VENDORS ====================

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  bankName?: string;
  accountNumber?: string;
  ibanNumber?: string;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  totalProjects: number;
  totalServices: number;
  status: VendorStatus;
  verified: boolean;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED' | 'INACTIVE';

// ==================== PROJECTS ====================

export interface Project {
  id: string;
  vendorId: string;
  userId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  completedAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// ==================== SERVICES ====================

export interface Service {
  id: string;
  vendorId: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image?: string;
  price: number;
  currency: string;
  duration?: string;
  revisions?: number;
  features: string[];
  status: ServiceStatus;
  rating: number;
  reviewCount: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'RETIRED';

export interface ServiceOrder {
  id: string;
  serviceId: string;
  vendorId: string;
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  deliveryDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

// ==================== PROPOSALS ====================

export interface Proposal {
  id: string;
  vendorId: string;
  userId: string;
  projectId?: string;
  proposalNumber: string;
  title: string;
  description?: string;
  status: ProposalStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  currency: string;
  issueDate: Date;
  validUntilDate: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  sections: ProposalSection[];
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProposalStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface ProposalSection {
  id: string;
  proposalId: string;
  title: string;
  description?: string;
  order: number;
  items: ProposalItem[];
  createdAt: Date;
}

export interface ProposalItem {
  id: string;
  sectionId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  order: number;
  createdAt: Date;
}

// ==================== INVOICES ====================

export interface Invoice {
  id: string;
  vendorId: string;
  projectId?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  paidAmount: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: Date;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  method: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

// ==================== RECEIPTS ====================

export interface Receipt {
  id: string;
  vendorId: string;
  receiptNumber: string;
  receiptDate: Date;
  paidBy: string;
  amount: number;
  currency: string;
  method: string;
  reference?: string;
  invoiceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== EXPENSES ====================

export interface Expense {
  id: string;
  vendorId: string;
  expenseNumber: string;
  expenseDate: Date;
  description: string;
  paidTo: string;
  amount: number;
  currency: string;
  category: string;
  method: string;
  reference?: string;
  notes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== AGREEMENTS ====================

export interface Agreement {
  id: string;
  vendorId: string;
  projectId?: string;
  agreementNumber: string;
  title: string;
  description?: string;
  parties: string[];
  startDate: Date;
  endDate: Date;
  terms: string;
  status: AgreementStatus;
  signedAt?: Date;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AgreementStatus = 'DRAFT' | 'PENDING_SIGN' | 'SIGNED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

// ==================== REVIEWS ====================

export interface Review {
  id: string;
  vendorId: string;
  serviceId?: string;
  userId: string;
  rating: number;
  comment?: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FAVORITES ====================

export interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: Date;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationType =
  | 'PROPOSAL_SENT'
  | 'PROPOSAL_ACCEPTED'
  | 'INVOICE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'SERVICE_ORDER'
  | 'REVIEW_RECEIVED'
  | 'VENDOR_VERIFIED'
  | 'SYSTEM_UPDATE';

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== FORMS ====================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface VendorFormData {
  businessName: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  country: string;
  taxId?: string;
  bankName?: string;
  accountNumber?: string;
  ibanNumber?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  duration?: string;
  revisions?: number;
  features: string[];
}

export interface ProposalFormData {
  title: string;
  description: string;
  validUntilDate: Date;
  sections: {
    title: string;
    description: string;
    items: {
      label: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }[];
  }[];
  notes?: string;
  terms?: string;
}

export interface InvoiceFormData {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  dueDate: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalRevenue: number;
  totalProjects: number;
  totalServices: number;
  totalClients: number;
  pendingProposals: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageRating: number;
}

// ==================== SEARCH & FILTER ====================

export interface ServiceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  search?: string;
}

export interface ServiceSearchResult {
  id: string;
  title: string;
  vendorName: string;
  vendorSlug: string;
  price: number;
  rating: number;
  reviewCount: number;
  image?: string;
  category: string;
}

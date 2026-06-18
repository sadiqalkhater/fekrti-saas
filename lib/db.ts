// lib/db.ts
// إدارة قاعدة البيانات والاتصال

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ==================== USER OPERATIONS ====================

export const userQueries = {
  /**
   * البحث عن مستخدم بـ ID
   */
  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: {
        vendor: true,
        notifications: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    }),

  /**
   * البحث عن مستخدم بـ البريد الإلكتروني
   */
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { vendor: true },
    }),

  /**
   * إنشاء مستخدم
   */
  create: (data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) =>
    prisma.user.create({
      data: {
        ...data,
        role: 'USER',
      },
    }),

  /**
   * تحديث مستخدم
   */
  update: (id: string, data: any) =>
    prisma.user.update({
      where: { id },
      data,
      include: { vendor: true },
    }),

  /**
   * حذف مستخدم
   */
  delete: (id: string) =>
    prisma.user.delete({
      where: { id },
    }),

  /**
   * الحصول على جميع المستخدمين
   */
  findAll: (skip = 0, take = 10) =>
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { vendor: true },
    }),
};

// ==================== VENDOR OPERATIONS ====================

export const vendorQueries = {
  /**
   * البحث عن تاجر بـ ID
   */
  findById: (id: string) =>
    prisma.vendor.findUnique({
      where: { id },
      include: {
        user: true,
        projects: { take: 5 },
        services: { take: 5 },
        reviews: { take: 5 },
      },
    }),

  /**
   * البحث عن تاجر بـ slug (للـ Landing Page)
   */
  findBySlug: (slug: string) =>
    prisma.vendor.findUnique({
      where: { slug },
      include: {
        user: true,
        services: {
          where: { status: 'ACTIVE' },
          include: { reviews: { take: 5 } },
        },
        reviews: { take: 10 },
      },
    }),

  /**
   * البحث عن تاجر بـ userId
   */
  findByUserId: (userId: string) =>
    prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    }),

  /**
   * إنشاء متجر جديد
   */
  create: (data: any) =>
    prisma.vendor.create({
      data,
      include: { user: true },
    }),

  /**
   * تحديث بيانات التاجر
   */
  update: (id: string, data: any) =>
    prisma.vendor.update({
      where: { id },
      data,
      include: { user: true },
    }),

  /**
   * الحصول على جميع التجار (للسوق)
   */
  findAll: (skip = 0, take = 10, status = 'APPROVED') =>
    prisma.vendor.findMany({
      where: { status },
      skip,
      take,
      orderBy: { rating: 'desc' },
      include: {
        user: { select: { name: true, avatar: true } },
        services: { take: 3 },
      },
    }),

  /**
   * البحث عن التجار
   */
  search: (query: string) =>
    prisma.vendor.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        status: 'APPROVED',
      },
      take: 10,
      include: { services: { take: 3 } },
    }),
};

// ==================== PROJECT OPERATIONS ====================

export const projectQueries = {
  /**
   * الحصول على مشاريع التاجر
   */
  findByVendor: (vendorId: string, skip = 0, take = 10) =>
    prisma.project.findMany({
      where: { vendorId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        proposals: { take: 3 },
        invoices: { take: 3 },
      },
    }),

  /**
   * الحصول على مشروع واحد
   */
  findById: (id: string) =>
    prisma.project.findUnique({
      where: { id },
      include: {
        proposals: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        agreements: { orderBy: { createdAt: 'desc' } },
      },
    }),

  /**
   * إنشاء مشروع
   */
  create: (data: any) =>
    prisma.project.create({
      data,
    }),

  /**
   * تحديث مشروع
   */
  update: (id: string, data: any) =>
    prisma.project.update({
      where: { id },
      data,
    }),

  /**
   * حذف مشروع
   */
  delete: (id: string) =>
    prisma.project.delete({
      where: { id },
    }),
};

// ==================== SERVICE OPERATIONS ====================

export const serviceQueries = {
  /**
   * الحصول على خدمات التاجر
   */
  findByVendor: (vendorId: string) =>
    prisma.service.findMany({
      where: { vendorId },
      include: { reviews: { take: 3 } },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * خدمة واحدة
   */
  findById: (id: string) =>
    prisma.service.findUnique({
      where: { id },
      include: {
        vendor: { select: { businessName: true, slug: true, rating: true } },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    }),

  /**
   * خدمة بـ slug
   */
  findBySlug: (vendorSlug: string, serviceSlug: string) =>
    prisma.service.findFirst({
      where: {
        slug: serviceSlug,
        vendor: { slug: vendorSlug },
      },
      include: {
        vendor: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    }),

  /**
   * البحث عن الخدمات
   */
  search: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) =>
    prisma.service.findMany({
      where: {
        AND: [
          filters.category ? { category: filters.category } : {},
          filters.minPrice ? { price: { gte: filters.minPrice } } : {},
          filters.maxPrice ? { price: { lte: filters.maxPrice } } : {},
          filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  { description: { contains: filters.search, mode: 'insensitive' } },
                ],
              }
            : {},
          { status: 'ACTIVE' },
        ],
      },
      take: 20,
      include: { vendor: { select: { businessName: true, slug: true, rating: true } } },
      orderBy: { orderCount: 'desc' },
    }),

  /**
   * إنشاء خدمة
   */
  create: (data: any) =>
    prisma.service.create({
      data,
    }),

  /**
   * تحديث خدمة
   */
  update: (id: string, data: any) =>
    prisma.service.update({
      where: { id },
      data,
    }),
};

// ==================== PROPOSAL OPERATIONS ====================

export const proposalQueries = {
  /**
   * عروض التاجر
   */
  findByVendor: (vendorId: string, skip = 0, take = 10) =>
    prisma.proposal.findMany({
      where: { vendorId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { sections: { include: { items: true } }, project: true },
    }),

  /**
   * عرض واحد
   */
  findById: (id: string) =>
    prisma.proposal.findUnique({
      where: { id },
      include: { sections: { include: { items: true } } },
    }),

  /**
   * إنشاء عرض
   */
  create: (data: any) =>
    prisma.proposal.create({
      data: {
        ...data,
        sections: {
          create: data.sections.map((section: any) => ({
            ...section,
            items: {
              create: section.items,
            },
          })),
        },
      },
      include: { sections: { include: { items: true } } },
    }),

  /**
   * تحديث عرض
   */
  update: (id: string, data: any) =>
    prisma.proposal.update({
      where: { id },
      data,
    }),
};

// ==================== INVOICE OPERATIONS ====================

export const invoiceQueries = {
  /**
   * فواتير التاجر
   */
  findByVendor: (vendorId: string, skip = 0, take = 10) =>
    prisma.invoice.findMany({
      where: { vendorId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true },
    }),

  /**
   * فاتورة واحدة
   */
  findById: (id: string) =>
    prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    }),

  /**
   * إنشاء فاتورة
   */
  create: (data: any) =>
    prisma.invoice.create({
      data: {
        ...data,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    }),

  /**
   * تحديث فاتورة
   */
  update: (id: string, data: any) =>
    prisma.invoice.update({
      where: { id },
      data,
    }),

  /**
   * الفواتير المتأخرة
   */
  findOverdue: (vendorId: string) =>
    prisma.invoice.findMany({
      where: {
        vendorId,
        status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID'] },
        dueDate: { lt: new Date() },
      },
      include: { items: true },
    }),
};

// ==================== RECEIPT & EXPENSE OPERATIONS ====================

export const receiptQueries = {
  /**
   * سندات القبض
   */
  findByVendor: (vendorId: string) =>
    prisma.receipt.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * إنشاء سند قبض
   */
  create: (data: any) =>
    prisma.receipt.create({
      data,
    }),
};

export const expenseQueries = {
  /**
   * سندات الصرف
   */
  findByVendor: (vendorId: string) =>
    prisma.expense.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * إنشاء سند صرف
   */
  create: (data: any) =>
    prisma.expense.create({
      data,
    }),

  /**
   * المصروفات حسب التصنيف
   */
  groupByCategory: (vendorId: string) =>
    prisma.expense.groupBy({
      by: ['category'],
      where: { vendorId },
      _sum: { amount: true },
    }),
};

// ==================== AGREEMENT OPERATIONS ====================

export const agreementQueries = {
  /**
   * اتفاقيات التاجر
   */
  findByVendor: (vendorId: string) =>
    prisma.agreement.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * إنشاء اتفاقية
   */
  create: (data: any) =>
    prisma.agreement.create({
      data,
    }),
};

// ==================== REVIEW & RATING OPERATIONS ====================

export const reviewQueries = {
  /**
   * تقييمات التاجر
   */
  findByVendor: (vendorId: string) =>
    prisma.review.findMany({
      where: { vendorId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * إنشاء تقييم
   */
  create: (data: any) =>
    prisma.review.create({
      data,
    }),
};

// ==================== DASHBOARD STATS ====================

export const statQueries = {
  /**
   * إحصائيات التاجر
   */
  vendorStats: async (vendorId: string) => {
    const [totalProjects, totalServices, totalProposals, totalInvoices] = await Promise.all([
      prisma.project.count({ where: { vendorId } }),
      prisma.service.count({ where: { vendorId } }),
      prisma.proposal.count({ where: { vendorId } }),
      prisma.invoice.count({ where: { vendorId } }),
    ]);

    const totalRevenue = await prisma.invoice.aggregate({
      where: { vendorId, status: 'PAID' },
      _sum: { paidAmount: true },
    });

    return {
      totalProjects,
      totalServices,
      totalProposals,
      totalInvoices,
      totalRevenue: totalRevenue._sum.paidAmount || 0,
    };
  },

  /**
   * إحصائيات النظام
   */
  systemStats: async () => {
    const [totalUsers, totalVendors, totalServices, totalInvoices] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.service.count({ where: { status: 'ACTIVE' } }),
      prisma.invoice.count(),
    ]);

    return {
      totalUsers,
      totalVendors,
      totalServices,
      totalInvoices,
    };
  },
};

export default prisma;

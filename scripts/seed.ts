// scripts/seed.ts
// بيانات تجريبية لقاعدة البيانات

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة قاعدة البيانات...');

  // حذف البيانات الموجودة
  await prisma.user.deleteMany();
  console.log('✓ تم حذف المستخدمين');

  // ==================== CREATE USERS ====================

  const user1 = await prisma.user.create({
    data: {
      email: 'vendor1@fekrti.sa',
      name: 'محمد الأحمري',
      password: await bcrypt.hash('password123', 10),
      phone: '+966501234567',
      role: 'VENDOR',
      status: 'active',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'vendor2@fekrti.sa',
      name: 'فاطمة السريع',
      password: await bcrypt.hash('password123', 10),
      phone: '+966502234567',
      role: 'VENDOR',
      status: 'active',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'admin@fekrti.sa',
      name: 'صادق الخاطر',
      password: await bcrypt.hash('admin123', 10),
      phone: '+966548187999',
      role: 'ADMIN',
      status: 'active',
    },
  });

  console.log('✓ تم إنشاء 3 مستخدمين');

  // ==================== CREATE VENDORS ====================

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: user1.id,
      businessName: 'استشارات البرمجيات المتقدمة',
      slug: 'advanced-software-consulting',
      description: 'نقدم خدمات استشارات برمجية متقدمة وتطوير تطبيقات مخصصة',
      phone: '+966501234567',
      email: 'vendor1@fekrti.sa',
      website: 'https://example1.com',
      address: 'الرياض، شارع الملك فهد',
      city: 'الرياض',
      country: 'SA',
      taxId: '123456789012345',
      bankName: 'البنك السعودي الأهلي',
      accountNumber: '1111111111',
      ibanNumber: 'SA1234567890123456789012',
      rating: 4.8,
      status: 'APPROVED',
      verified: true,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: user2.id,
      businessName: 'خدمات التصميم والإعلان',
      slug: 'design-advertising-services',
      description: 'خدمات تصميم جرافيك واعلانات رقمية احترافية',
      phone: '+966502234567',
      email: 'vendor2@fekrti.sa',
      website: 'https://example2.com',
      address: 'جدة، شارع الأمير محمد',
      city: 'جدة',
      country: 'SA',
      taxId: '123456789012346',
      bankName: 'البنك السعودي الأهلي',
      accountNumber: '2222222222',
      ibanNumber: 'SA1234567890123456789013',
      rating: 4.5,
      status: 'APPROVED',
      verified: true,
    },
  });

  console.log('✓ تم إنشاء تاجران');

  // ==================== CREATE SERVICES ====================

  const service1 = await prisma.service.create({
    data: {
      vendorId: vendor1.id,
      userId: user1.id,
      title: 'تطوير تطبيق ويب متقدم',
      slug: 'web-app-development',
      description: 'تطوير تطبيقات ويب متقدمة باستخدام أحدث التقنيات',
      category: 'development',
      price: 5000,
      currency: 'SAR',
      duration: '4 أسابيع',
      revisions: 3,
      features: ['تصميم متجاوب', 'قاعدة بيانات متقدمة', 'API متكاملة'],
      status: 'ACTIVE',
      rating: 4.9,
      reviewCount: 25,
      orderCount: 50,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      vendorId: vendor2.id,
      userId: user2.id,
      title: 'تصميم هوية بصرية شاملة',
      slug: 'brand-identity-design',
      description: 'تصميم هوية بصرية كاملة لشركتك',
      category: 'design',
      price: 3000,
      currency: 'SAR',
      duration: '2 أسبوع',
      revisions: 5,
      features: ['شعار احترافي', 'دليل العلامة التجارية', 'مواد تسويقية'],
      status: 'ACTIVE',
      rating: 4.8,
      reviewCount: 18,
      orderCount: 35,
    },
  });

  console.log('✓ تم إنشاء خدمتان');

  // ==================== CREATE PROJECTS ====================

  const project1 = await prisma.project.create({
    data: {
      vendorId: vendor1.id,
      userId: user1.id,
      title: 'تطوير نظام إدارة المبيعات',
      description: 'نظام متكامل لإدارة عمليات البيع والمخزون',
      status: 'ACTIVE',
      budget: 50000,
      currency: 'SAR',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
    },
  });

  console.log('✓ تم إنشاء مشروع');

  // ==================== CREATE PROPOSALS ====================

  const proposal1 = await prisma.proposal.create({
    data: {
      vendorId: vendor1.id,
      userId: user1.id,
      projectId: project1.id,
      proposalNumber: 'PRO-ADV-2024-0001',
      title: 'عرض تطوير نظام إدارة المبيعات',
      description: 'عرض متكامل لتطوير نظام إدارة المبيعات والمخزون',
      status: 'SENT',
      subtotal: 45000,
      taxAmount: 6750,
      totalAmount: 51750,
      taxRate: 0.15,
      currency: 'SAR',
      issueDate: new Date(),
      validUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sentAt: new Date(),
      sections: {
        create: [
          {
            title: 'التحليل والتصميم',
            description: 'تحليل متطلبات المشروع وتصميم النظام',
            order: 1,
            items: {
              create: [
                {
                  description: 'تحليل المتطلبات الشاملة',
                  quantity: 1,
                  unitPrice: 5000,
                  amount: 5000,
                  order: 1,
                },
                {
                  description: 'تصميم الواجهات والديزاين',
                  quantity: 1,
                  unitPrice: 8000,
                  amount: 8000,
                  order: 2,
                },
              ],
            },
          },
          {
            title: 'التطوير والاختبار',
            description: 'تطوير النظام والاختبار الشامل',
            order: 2,
            items: {
              create: [
                {
                  description: 'تطوير Backend والـ API',
                  quantity: 1,
                  unitPrice: 12000,
                  amount: 12000,
                  order: 1,
                },
                {
                  description: 'تطوير Frontend والعمل التفاعلي',
                  quantity: 1,
                  unitPrice: 12000,
                  amount: 12000,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✓ تم إنشاء عرض سعر');

  // ==================== CREATE INVOICES ====================

  const invoice1 = await prisma.invoice.create({
    data: {
      vendorId: vendor1.id,
      projectId: project1.id,
      invoiceNumber: 'INV-ADV-2024-01-0001',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clientName: 'شركة النخيل للتجارة',
      clientEmail: 'contact@alnakheel.com',
      clientPhone: '+966504567890',
      clientAddress: 'الرياض، الملز',
      subtotal: 30000,
      taxAmount: 4500,
      totalAmount: 34500,
      taxRate: 0.15,
      currency: 'SAR',
      status: 'SENT',
      items: {
        create: [
          {
            description: 'خدمات التحليل والتصميم',
            quantity: 1,
            unitPrice: 13000,
            amount: 13000,
          },
          {
            description: 'خدمات التطوير الأولية',
            quantity: 1,
            unitPrice: 17000,
            amount: 17000,
          },
        ],
      },
    },
  });

  console.log('✓ تم إنشاء فاتورة');

  // ==================== CREATE RECEIPTS ====================

  const receipt1 = await prisma.receipt.create({
    data: {
      vendorId: vendor1.id,
      userId: user1.id,
      receiptNumber: 'REC-ADV-2024-0001',
      receiptDate: new Date(),
      paidBy: 'شركة النخيل للتجارة',
      amount: 34500,
      currency: 'SAR',
      method: 'bank_transfer',
      reference: 'TRX-123456789',
      notes: 'دفعة أولى للمشروع',
    },
  });

  console.log('✓ تم إنشاء سند قبض');

  // ==================== CREATE EXPENSES ====================

  const expense1 = await prisma.expense.create({
    data: {
      vendorId: vendor1.id,
      userId: user1.id,
      expenseNumber: 'EXP-ADV-2024-0001',
      expenseDate: new Date(),
      description: 'شراء مواد ومستلزمات المشروع',
      paidTo: 'متجر الكمبيوتر',
      amount: 2500,
      currency: 'SAR',
      category: 'مواد ومستلزمات',
      method: 'cash',
      notes: 'مستلزمات البرمجة والتطوير',
    },
  });

  console.log('✓ تم إنشاء سند صرف');

  // ==================== CREATE REVIEWS ====================

  const review1 = await prisma.review.create({
    data: {
      vendorId: vendor1.id,
      serviceId: service1.id,
      userId: user2.id,
      rating: 5,
      comment: 'خدمة ممتازة جداً والتاجر محترف جداً. سأتعامل معه مرة أخرى.',
    },
  });

  console.log('✓ تم إنشاء تقييم');

  // ==================== CREATE SYSTEM SETTINGS ====================

  await prisma.systemSettings.create({
    data: {
      platformName: 'فكرتي - منصة الخدمات المتكاملة',
      platformFee: 0.1, // 10%
      taxRate: 0.15,
      maintenanceMode: false,
    },
  });

  console.log('✓ تم إنشاء إعدادات النظام');

  console.log('🎉 تم تعبئة قاعدة البيانات بنجاح!');
  console.log('📊 البيانات التجريبية:');
  console.log(`   - ${3} مستخدمين`);
  console.log(`   - ${2} تجار`);
  console.log(`   - ${2} خدمات`);
  console.log(`   - ${1} مشاريع`);
  console.log(`   - ${1} عروض`);
  console.log(`   - ${1} فواتير`);
  console.log(`   - ${1} سند قبض`);
  console.log(`   - ${1} سند صرف`);
  console.log(`   - ${1} تقييم`);
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تعبئة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

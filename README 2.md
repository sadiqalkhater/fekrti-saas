# 🎯 منصة فكرتي متعددة التجار

**منصة متكاملة لإدارة الخدمات وإصدار العروض والفواتير والسندات والاتفاقيات**

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 نظرة عامة

منصة فكرتي هي **منصة متعددة التجار** (Multi-Vendor Marketplace) متكاملة تجمع بين:

✅ **نظام محاسبي متقدم**
- إصدار فواتير احترافية مع ضريبة VAT 15%
- سندات قبض وسندات صرف
- إدارة المصروفات والتقارير المالية
- تتبع المدفوعات والحسابات

✅ **نظام العروض والمقترحات**
- إنشاء عروض احترافية مخصصة
- توليد PDF جاهز للطباعة
- إدارة حالة العروض والمتابعة

✅ **إدارة المشاريع والخدمات**
- إدارة المشاريع الكاملة من البداية للنهاية
- عرض الخدمات في السوق
- تتبع حالة الخدمات والطلبيات

✅ **الاتفاقيات والعقود**
- إنشاء واتفاقيات قانونية
- توقيع رقمي للاتفاقيات
- حفظ ومتابعة الاتفاقيات

✅ **سوق الخدمات**
- عرض الخدمات للعملاء
- البحث والتصفية المتقدمة
- التقييمات والمراجعات
- المفضلة

✅ **صفحات Landing Page للتجار**
- صفحة خاصة لكل تاجر
- عرض الخدمات والتقييمات
- بيانات الاتصال والمتابعة

---

## 🚀 المميزات الرئيسية

### 💼 للتجار (Vendors)
- ✓ لوحة تحكم متقدمة
- ✓ إدارة مشاريع متعددة
- ✓ إنشاء خدمات وتحديثها
- ✓ إصدار عروض وفواتير
- ✓ إدارة المصروفات والسندات
- ✓ تقارير مالية شاملة
- ✓ إدارة الاتفاقيات
- ✓ صفحة محترفة في السوق

### 🛍️ للعملاء (Customers)
- ✓ البحث عن الخدمات
- ✓ التصفية المتقدمة
- ✓ التقييمات والمراجعات
- ✓ حفظ المفضلة
- ✓ طلب خدمات
- ✓ متابعة الطلبيات

### 👨‍💼 للمسؤولين (Admin)
- ✓ إدارة التجار والمستخدمين
- ✓ الموافقة على الخدمات
- ✓ إدارة الفئات
- ✓ تقارير النظام الشاملة
- ✓ إدارة الإعدادات

---

## 🛠️ التقنيات المستخدمة

| الفئة | التقنيات |
|--------|----------|
| **Frontend** | Next.js 14 • React 18 • TypeScript • Tailwind CSS |
| **Backend** | Node.js • Next.js API Routes • Prisma ORM |
| **Database** | PostgreSQL 14+ |
| **PDF** | PDFKit • jsPDF • html2canvas |
| **Payment** | Stripe • Moyasar (Saudi) |
| **Authentication** | JWT • bcryptjs |
| **Real-time** | WebSocket (optional) |
| **Caching** | Redis (optional) |

---

## 📦 متطلبات التثبيت

- **Node.js**: 18+ 
- **npm** أو **yarn**
- **PostgreSQL**: 14+
- **Git**

---

## 🚀 البدء السريع

### 1️⃣ استنسخ المستودع

```bash
git clone https://github.com/your-username/fekrti-marketplace.git
cd fekrti-marketplace
```

### 2️⃣ ثبّت المكتبات

```bash
npm install
```

### 3️⃣ أعدّ قاعدة البيانات

```bash
# انسخ ملف البيئة
cp .env.example .env.local

# أضف DATABASE_URL في .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/fekrti_marketplace"

# طبّق الهجرات
npm run db:push
```

### 4️⃣ عبّئ البيانات التجريبية (اختياري)

```bash
npm run db:seed
```

### 5️⃣ شغّل التطبيق

```bash
npm run dev
```

**افتح**: http://localhost:3000

---

## 📁 هيكل المشروع

```
fekrti-marketplace/
├── app/
│   ├── api/                    # API Routes
│   │   ├── vendors/            # API التجار
│   │   ├── invoices/           # API الفواتير
│   │   ├── proposals/          # API العروض
│   │   ├── projects/           # API المشاريع
│   │   ├── services/           # API الخدمات
│   │   ├── receipts/           # API سندات القبض
│   │   ├── expenses/           # API سندات الصرف
│   │   ├── agreements/         # API الاتفاقيات
│   │   └── auth/               # API المصادقة
│   │
│   ├── dashboard/              # لوحة التحكم
│   │   ├── page.tsx            # الصفحة الرئيسية
│   │   ├── projects/           # إدارة المشاريع
│   │   ├── services/           # إدارة الخدمات
│   │   ├── proposals/          # إدارة العروض
│   │   ├── invoices/           # إدارة الفواتير
│   │   ├── receipts/           # إدارة السندات
│   │   ├── expenses/           # إدارة المصروفات
│   │   ├── agreements/         # إدارة الاتفاقيات
│   │   ├── reports/            # التقارير
│   │   └── settings/           # الإعدادات
│   │
│   ├── marketplace/            # سوق الخدمات
│   │   ├── page.tsx            # الصفحة الرئيسية
│   │   ├── service/            # تفاصيل الخدمة
│   │   └── vendor/             # صفحة التاجر
│   │
│   ├── auth/                   # صفحات المصادقة
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── layout.tsx              # التخطيط الرئيسي
│   ├── page.tsx                # الصفحة الرئيسية
│   └── globals.css             # الأنماط العامة
│
├── components/
│   ├── ui/                     # مكونات الواجهة
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   ├── forms/                  # النماذج
│   ├── tables/                 # الجداول
│   ├── charts/                 # الرسوم البيانية
│   └── layout/                 # مكونات التخطيط
│
├── lib/
│   ├── db.ts                   # إدارة قاعدة البيانات
│   ├── auth.ts                 # المصادقة
│   └── payments.ts             # معالجة الدفع
│
├── hooks/
│   ├── useVendor.ts            # Hook التاجر
│   ├── useAuth.ts              # Hook المصادقة
│   ├── useFavorites.ts         # Hook المفضلة
│   └── ...
│
├── types/
│   └── index.ts                # جميع أنواع TypeScript
│
├── utils/
│   ├── constants.ts            # الثوابت
│   ├── helpers.ts              # دوال مساعدة
│   ├── validation.ts           # التحقق من البيانات
│   └── formatters.ts           # تنسيق البيانات
│
├── styles/
│   └── globals.css
│
├── prisma/
│   ├── schema.prisma           # نموذج قاعدة البيانات (أساسي!)
│   └── migrations/
│
├── scripts/
│   └── seed.ts                 # بيانات تجريبية
│
├── public/
│   └── assets/
│
├── .github/
│   └── workflows/              # CI/CD
│
├── .env.example                # متغيرات البيئة
├── .gitignore
├── package.json                # المكتبات
├── tsconfig.json               # إعدادات TypeScript
├── next.config.js              # إعدادات Next.js
├── tailwind.config.js          # إعدادات Tailwind
├── postcss.config.js
├── .eslintrc.json
└── README.md
```

---

## 📊 نموذج قاعدة البيانات

القاعدة تحتوي على **20+ جدول** متكامل:

### جداول المستخدمين
- `users` - المستخدمين
- `vendors` - التجار
- `vendor_settings` - إعدادات التاجر

### جداول المحتوى
- `projects` - المشاريع
- `services` - الخدمات
- `service_orders` - طلبيات الخدمات

### جداول المحاسبة
- `proposals` - العروض
- `proposal_sections` - أقسام العروض
- `proposal_items` - بنود العروض
- `invoices` - الفواتير
- `invoice_items` - بنود الفواتير
- `invoice_payments` - مدفوعات الفواتير
- `receipts` - سندات القبض
- `expenses` - سندات الصرف
- `agreements` - الاتفاقيات

### جداول المحتوى الاجتماعي
- `reviews` - التقييمات
- `favorites` - المفضلة
- `notifications` - الإشعارات

---

## 🔐 المصادقة والأمان

- **JWT-based Authentication**
- **bcryptjs password hashing**
- **Secure API endpoints**
- **CORS protection**
- **Input validation & sanitization**

---

## 💰 نموذج الدفع

### خيارات الدفع
- ✓ Stripe (للدفع الدولي)
- ✓ Moyasar (للدفع السعودي)
- ✓ تحويل بنكي
- ✓ شيك

### الضرائب والرسوم
- ضريبة VAT: **15%** (قابلة للتخصيص)
- رسم المنصة: **10%** من قيمة الخدمات

---

## 📚 الأوامر الأساسية

```bash
# التطوير
npm run dev              # شغّل التطبيق في وضع التطوير
npm run build            # بناء التطبيق للإنتاج
npm start                # شغّل التطبيق في الإنتاج

# قاعدة البيانات
npm run db:push          # طبّق الهجرات
npm run db:generate      # أنشئ Prisma Client
npm run db:studio        # افتح Prisma Studio
npm run db:seed          # عبّئ البيانات التجريبية
npm run db:migrate       # أنشئ هجرة جديدة

# الفحص والتنسيق
npm run lint             # فحص الكود
npm run format           # نسّق الكود
npm run type-check       # فحص TypeScript
npm test                 # تشغيل الاختبارات
```

---

## 🌐 النشر

### على Vercel (الأفضل)

```bash
# ادفع الكود إلى GitHub
git push origin main

# اذهب إلى Vercel وانقر Import
# اختر المستودع واضغط Deploy
```

### على Docker

```bash
docker build -t fekrti-marketplace .
docker run -p 3000:3000 -e DATABASE_URL=... fekrti-marketplace
```

---

## 📖 الأدلة والموارد

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'feat: add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📄 الترخيص

© 2024 فكرتي للاستشارات المالية والإدارية - جميع الحقوق محفوظة

---

## 👨‍💼 معلومات الشركة

**فكرتي للاستشارات المالية والإدارية**

- 👤 **المؤسس**: صادق الخاطر (Sadiq AlKhater)
- 📧 **البريد**: info@fekrti.sa
- 📱 **الهاتف**: +966 548 187 999
- 🌐 **الموقع**: www.fekrti.sa
- 📍 **الموقع**: الرياض، المملكة العربية السعودية

---

## 📞 الدعم والتواصل

للأسئلة والدعم:
- 📧 البريد الإلكتروني: support@fekrti.sa
- 💬 WhatsApp: +966 548 187 999
- 🌐 الموقع: www.fekrti.sa

---

**صُنع بـ ❤️ في السعودية**

*آخر تحديث: يونيو 2026*
*الإصدار: 3.0.0 - جاهز للإنتاج*

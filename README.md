# 🎯 فكرتي - نظام محاسبي SaaS

<div dir="rtl">

نظام محاسبة حديث وآمن مبني على **Next.js** و **PostgreSQL** مع دعم كامل للعربية.

## 📋 الجدول

- [المميزات](#-المميزات)
- [المتطلبات](#-المتطلبات)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [البدء السريع](#-البدء-السريع)
- [هيكل المشروع](#-هيكل-المشروع)
- [متغيرات البيئة](#-متغيرات-البيئة)
- [قاعدة البيانات](#-قاعدة-البيانات)
- [النشر](#-النشر)
- [المساهمة](#-المساهمة)
- [الترخيص](#-الترخيص)
- [التواصل](#-التواصل)

---

## ✨ المميزات

### 📊 إدارة مالية شاملة
- ✅ فواتير احترافية قابلة للتخصيص
- ✅ إدارة العملاء والموردين
- ✅ نظام الاشتراكات والدفع التكراري
- ✅ تقارير مالية مفصلة وقابلة للتصدير
- ✅ تتبع المدفوعات والمتأخرات

### 💳 بوابات الدفع
- ✅ تكامل آمن مع Moyasar
- ✅ دعم طرق دفع متعددة
- ✅ معالجة الأخطاء الموثوقة
- ✅ تشفير من الدرجة الأولى

### 🔐 الأمان والخصوصية
- ✅ مصادقة JWT محمية
- ✅ تشفير كلمات المرور مع bcryptjs
- ✅ عزل البيانات لكل عميل (Multi-tenant)
- ✅ نسخ احتياطية تلقائية يومية
- ✅ معايير أمان OWASP

### 🌐 واجهة احترافية
- ✅ تصميم حديث وسلس
- ✅ دعم كامل للعربية (RTL)
- ✅ واجهة متجاوبة (Desktop/Tablet/Mobile)
- ✅ ألوان وخطوط احترافية

### ⚡ الأداء والموثوقية
- ✅ توفر الخدمة 99.9%
- ✅ سرعة استجابة < 500ms
- ✅ دعم فني 24/7
- ✅ تحديثات أمان دورية

---

## 📦 المتطلبات

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 أو **yarn** >= 3.0.0
- **PostgreSQL** >= 12.0 (محلي أو سحابي)
- **Git** >= 2.0.0

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - إطار عمل React حديث مع SSR
- **React 18** - مكتبة UI تفاعلية
- **TypeScript** - لغة موثوقة وآمنة
- **Tailwind CSS** - تنسيقات حديثة وسريعة
- **Recharts** - رسوم بيانية تفاعلية

### Backend
- **Next.js API Routes** - معالجات الـ API
- **Prisma ORM** - إدارة قاعدة البيانات
- **PostgreSQL** - قاعدة بيانات قوية
- **JWT** - مصادقة آمنة
- **bcryptjs** - تشفير كلمات المرور

### DevOps & Deployment
- **Vercel** - استضافة وتوسع تلقائي
- **Docker** - للتطوير والنشر
- **GitHub Actions** - CI/CD تلقائي

---

## 🚀 البدء السريع

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/sadiqualkhater/fekrti-saas.git
cd fekrti-saas
```

### 2️⃣ تثبيت المكتبات

```bash
npm install
# أو
yarn install
```

### 3️⃣ إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

ثم عدّل `.env.local` وأضف:
- `DATABASE_URL` - رابط قاعدة البيانات
- `JWT_SECRET` - مفتاح سري للـ JWT
- `MOYASAR_API_KEY` - مفتاح Moyasar

### 4️⃣ إعداد قاعدة البيانات

```bash
# تشغيل migrations
npx prisma migrate dev --name init

# اختياري: إضافة بيانات تجريبية
npx prisma db seed
```

### 5️⃣ تشغيل التطبيق

```bash
npm run dev
```

التطبيق متاح الآن على: **http://localhost:3000**

---

## 📁 هيكل المشروع

```
fekrti-saas/
├── app/                      # Next.js App Router
│   ├── (auth)/              # صفحات المصادقة
│   ├── (dashboard)/         # لوحة التحكم
│   └── api/                 # معالجات الـ API
├── components/              # مكونات React
├── lib/                     # دوال مساعدة
├── prisma/                  # تعريفات قاعدة البيانات
├── styles/                  # أنماط عامة
├── types/                   # تعريفات TypeScript
├── public/                  # ملفات ثابتة
├── .env.local              # متغيرات البيئة (محلي)
├── .env.example            # مثال على البيئة
├── next.config.js          # إعدادات Next.js
├── tailwind.config.js      # إعدادات Tailwind
├── tsconfig.json           # إعدادات TypeScript
└── package.json            # المكتبات والنصوص
```

---

## 🔧 متغيرات البيئة

| المتغير | النوع | الوصف |
|---------|-------|-------|
| `DATABASE_URL` | Required | رابط قاعدة البيانات PostgreSQL |
| `JWT_SECRET` | Required | مفتاح سري للـ JWT (32+ حرف) |
| `NEXT_PUBLIC_MOYASAR_API_KEY` | Required | مفتاح Moyasar العام |
| `MOYASAR_SECRET_KEY` | Required | مفتاح Moyasar السري |
| `NEXT_PUBLIC_SITE_URL` | Required | رابط الموقع (localhost أو الإنتاج) |
| `SMTP_HOST` | Required | خادم البريد |
| `SMTP_USER` | Required | اسم المستخدم |
| `SMTP_PASSWORD` | Required | كلمة المرور |

انظر `.env.example` للقائمة الكاملة.

---

## 🗄️ قاعدة البيانات

### Prisma Schema

تم تعريف النماذج التالية:
- `User` - المستخدمون
- `Company` - الشركات
- `Customer` - العملاء
- `Invoice` - الفواتير
- `Subscription` - الاشتراكات
- `Payment` - المدفوعات

### Migrations

```bash
# إنشاء migration جديد
npx prisma migrate dev --name feature_name

# عرض حالة قاعدة البيانات
npx prisma db push

# فتح Prisma Studio للإدارة البصرية
npx prisma studio
```

---

## 🌐 النشر

### النشر على Vercel (الموصى به)

```bash
# ثبّت Vercel CLI
npm i -g vercel

# اربط المشروع
vercel link

# اضبط متغيرات البيئة
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... إضافة المتغيرات الأخرى

# انشر
vercel --prod
```

### النشر على Server مخصص

```bash
# بناء التطبيق
npm run build

# تشغيل الإنتاج
npm run start
```

### استخدام Docker

```bash
# بناء الصورة
docker build -t fekrti-saas .

# تشغيل الحاوية
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  fekrti-saas
```

---

## 📝 الأوامر المفيدة

```bash
# تطوير
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء للإنتاج
npm run start        # تشغيل الإنتاج

# جودة الكود
npm run lint         # فحص الأخطاء
npm run type-check   # فحص الأنواع TypeScript
npm run format       # تنسيق الكود

# قاعدة البيانات
npm run prisma:migrate    # تشغيل migrations
npm run prisma:studio     # فتح Prisma Studio
npm run prisma:seed       # إضافة بيانات تجريبية

# الاختبارات
npm test            # تشغيل الاختبارات
npm run test:watch  # الاختبارات المراقبة
```

---

## 🤝 المساهمة

نرحب بمساهماتك! لمساهمة:

1. انسخ المشروع (`fork`)
2. أنشئ فرع للميزة (`git checkout -b feature/amazing-feature`)
3. اكتب تغييراتك (`git commit -m 'Add amazing feature'`)
4. ادفع إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 📞 التواصل

**مكتب فكرتي للاستشارات المالية والإدارية**

- 🌐 الموقع: [www.fekrti.sa](https://www.fekrti.sa)
- 📧 البريد: [info@fekrti.sa](mailto:info@fekrti.sa)
- 📱 الهاتف: [+966 548 187 999](tel:+966548187999)
- 🐙 GitHub: [@sadiqualkhater](https://github.com/sadiqualkhater)

---

## 🙏 شكر وتقدير

شكر خاص لـ:
- فريق Next.js
- فريق Prisma
- مساهمي المشروع

---

<div align="center">

**اصنعت بـ ❤️ بواسطة فكرتي للاستشارات**

[⬆ عودة للأعلى](#-فكرتي---نظام-محاسبي-saas)

</div>

</div>
# fekrti-saas


# ARCHITECTURE.md - الهيكل المعماري
# 🏗️ الهيكل المعماري للمشروع

## 📊 تقسيم الطبقات

### Frontend Layer
- **Next.js Pages**: الصفحات الرئيسية (/app)
- **React Components**: مكونات قابلة لإعادة الاستخدام
- **Tailwind CSS**: التصميم والأنماط
- **React Hooks**: إدارة الحالة المحلية

### Business Logic Layer
- **API Routes**: واجهات برمجية
- **Hooks**: منطق مخصص معاد الاستخدام
- **Utils/Helpers**: دوال مساعدة

### Data Layer
- **Prisma ORM**: تفاعل قاعدة البيانات
- **PostgreSQL**: قاعدة البيانات العلاقية
- **Redis**: الذاكرة المؤقتة (اختياري)

## 📁 هيكل الملفات

```
fekrti-marketplace/
├── app/              (Next.js 14 App Router)
├── components/       (React Components)
├── hooks/           (Custom React Hooks)
├── lib/             (Business Logic)
├── types/           (TypeScript Types)
├── utils/           (Helper Functions)
├── prisma/          (Database Schema)
├── public/          (Static Assets)
├── __tests__/       (Unit & Integration Tests)
└── .github/         (CI/CD Workflows)
```

## 🔄 تدفق البيانات

```
User Interface (Pages/Components)
        ↓
React Hooks & State Management
        ↓
API Routes (/api)
        ↓
Database Operations (Prisma)
        ↓
PostgreSQL Database
        ↓
Cache Layer (Redis - optional)
```

## 🔐 أمان البيانات

- JWT Authentication
- Password Hashing (bcryptjs)
- Input Validation (Zod)
- SQL Injection Prevention (Prisma)
- CORS Protection
- Rate Limiting (recommended)

## 📈 التوسعية

- Multi-tenant architecture
- Horizontal scaling ready
- Database indexing
- Caching strategy
- Load balancing support


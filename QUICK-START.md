# ⚡ البدء السريع - 5 دقائق فقط!

## 🎯 المتطلبات

- ✓ Node.js 18+
- ✓ PostgreSQL 14+ أو Neon (مجاني)
- ✓ Git

---

## 📋 الخطوات

### 1️⃣ استنسخ المشروع (30 ثانية)

```bash
git clone https://github.com/your-username/fekrti-marketplace.git
cd fekrti-marketplace
```

### 2️⃣ ثبّت المكتبات (1 دقيقة)

```bash
npm install
```

### 3️⃣ أعدّ قاعدة البيانات (2 دقيقة)

#### الخيار أ: Neon (مجاني وسهل)

```bash
# 1. اذهب إلى https://neon.tech وأنشئ حساب مجاني
# 2. انسخ DATABASE_URL
# 3. ألصقها في .env.local

# ثم:
cp .env.example .env.local
# قم بتحرير .env.local وأضف DATABASE_URL
```

#### الخيار ب: PostgreSQL محلي

```bash
# قم بإنشاء قاعدة بيانات
createdb fekrti_marketplace

# ثم عيّن في .env.local:
DATABASE_URL="postgresql://user:password@localhost:5432/fekrti_marketplace"
```

### 4️⃣ طبّق قاعدة البيانات (1 دقيقة)

```bash
# انسخ ملف البيئة
cp .env.example .env.local

# طبّق الهجرات
npm run db:push

# (اختياري) عبّئ البيانات التجريبية
npm run db:seed
```

### 5️⃣ شغّل التطبيق! (30 ثانية)

```bash
npm run dev
```

**افتح المتصفح**: http://localhost:3000 ✨

---

## 🧪 اختبر الميزات

### دخول التاجر
```
البريد: vendor1@fekrti.sa
كلمة المرور: password123
```

### دخول المسؤول
```
البريد: admin@fekrti.sa
كلمة المرور: admin123
```

### اختبر المميزات:
1. ✅ اذهب إلى لوحة التحكم `/dashboard`
2. ✅ أنشئ مشروع جديد
3. ✅ أنشئ عرض سعر
4. ✅ أنشئ فاتورة
5. ✅ اذهب إلى السوق `/marketplace`

---

## 🔧 حل المشاكل الشائعة

### ❌ "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Port 3000 is in use"
```bash
npm run dev -- -p 3001
```

### ❌ "Database connection error"
```bash
# تحقق من DATABASE_URL في .env.local
# تأكد من أن PostgreSQL يعمل
psql -U postgres -d fekrti_marketplace
```

### ❌ "Prisma Client error"
```bash
npm run db:generate
```

---

## 📂 ملفات مهمة للتعديل

```
fekrti-marketplace/
├── .env.local              # ← أضف DATABASE_URL هنا!
├── prisma/schema.prisma    # ← نموذج قاعدة البيانات
├── app/api/                # ← API endpoints
├── app/dashboard/          # ← لوحة التحكم
└── components/             # ← مكونات React
```

---

## 🚀 الخطوة التالية

### اقرأ التوثيق الكاملة:
- 📖 [README.md](./README.md) - التوثيق الشاملة
- 💾 [DATABASE-SETUP.md](./DATABASE-SETUP.md) - إعداد قاعدة البيانات
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - الهيكل المعماري

### ابدأ التطوير:
1. افتح المشروع في محرر النصوص المفضل
2. اقرأ هيكل المشروع
3. ابدأ بتطوير ميزات جديدة

---

## 💡 نصائح مفيدة

### عرض قاعدة البيانات بصرياً
```bash
npm run db:studio
# سيفتح: http://localhost:5555
```

### اختبر API
```bash
# استخدم Postman أو VS Code REST Client
GET http://localhost:3000/api/vendors
```

### شاهد السجلات
```bash
# النافذة الأولى
npm run dev

# النافذة الثانية - شاهد Prisma logs
npm run db:studio
```

---

## ✅ قائمة الفحص قبل الإنتاج

- [ ] أضفت DATABASE_URL صحيح
- [ ] طبّقت الهجرات (`npm run db:push`)
- [ ] اختبرت تسجيل الدخول
- [ ] اختبرت إنشاء فاتورة
- [ ] اختبرت توليد PDF
- [ ] اختبرت السوق

---

**جاهز تماماً! ابدأ الآن! 🎉**

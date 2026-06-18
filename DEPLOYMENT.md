# 🚀 دليل النشر والتطبيق على الخوادم

منصة فكرتي جاهزة للنشر على **Vercel، Docker، AWS، Heroku، وأكثر!**

---

## 🎯 خيارات النشر المتاحة

| الخيار | الصعوبة | الوقت | السعر | الملفات |
|--------|--------|--------|--------|---------|
| **Vercel** ⭐ | سهل جداً | 5 دقائق | مجاني | لا شيء |
| **Docker + Server** | متوسط | 15 دقيقة | $5+/شهر | Dockerfile |
| **AWS EC2** | متوسط | 20 دقيقة | $15+/شهر | terraform |
| **Heroku** | سهل | 10 دقائق | $7+/شهر | Procfile |
| **DigitalOcean** | متوسط | 20 دقيقة | $6+/شهر | docker-compose |

---

## 1️⃣ النشر على Vercel (الأفضل والأسهل)

### الخطوات:

```bash
# 1. ادفع الكود إلى GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. اذهب إلى https://vercel.com
# 3. اضغط "New Project"
# 4. اختر المستودع من GitHub
# 5. أضف متغيرات البيئة:
#    - DATABASE_URL (استخدم Neon أو Supabase)
#    - JWT_SECRET
#    - والباقي من .env.example

# 6. اضغط Deploy!
```

### إعداد قاعدة البيانات على Neon (مجاني):

```bash
1. اذهب إلى https://neon.tech
2. أنشئ حساب مجاني
3. أنشئ project جديد
4. انسخ DATABASE_URL
5. أضفها في Vercel
```

### النتيجة:
```
✅ التطبيق يعمل على: https://yourdomain.vercel.app
✅ Custom domain support
✅ Auto deployments from GitHub
✅ مجاني تماماً!
```

---

## 2️⃣ النشر على Docker

### المتطلبات:
- Docker و Docker Compose
- Server بـ Linux (Ubuntu 20+)
- Domain أو IP Address

### الخطوات:

```bash
# 1. على حاسوبك: بناء الـ Image
docker build -t fekrti:latest .

# 2. دفع الـ Image إلى Docker Hub
docker tag fekrti:latest yourusername/fekrti:latest
docker push yourusername/fekrti:latest

# 3. على الخادم:
ssh root@your-server.com

# 4. تحميل المشروع
git clone https://github.com/yourusername/fekrti-marketplace.git
cd fekrti-marketplace

# 5. إعداد .env
nano .env
# أضف جميع متغيرات البيئة

# 6. تشغيل Docker Compose
docker-compose up -d

# 7. تطبيق الهجرات
docker-compose exec app npm run db:push

# 8. تحقق من التطبيق
curl http://localhost:3000
```

### مع Nginx كـ Reverse Proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### النتيجة:
```
✅ التطبيق يعمل على: https://yourdomain.com
✅ Database يعمل في Container
✅ Redis في Container
✅ PgAdmin للإدارة
```

---

## 3️⃣ النشر على DigitalOcean

### الخطوات السريعة:

```bash
# 1. أنشئ Droplet (Ubuntu 20.04)
# 2. SSH إليه
ssh root@your-droplet-ip

# 3. ثبّت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. ثبّت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. استنسخ المشروع وشغّله
git clone https://github.com/yourusername/fekrti.git
cd fekrti
nano docker-compose.yml
docker-compose up -d
```

---

## 4️⃣ النشر على AWS

### مع EC2:

```bash
# 1. أنشئ EC2 instance (Ubuntu 20.04)
# 2. أمن الـ Security Group (أضف ports 80, 443, 3000)
# 3. SSH إليه
ssh -i your-key.pem ec2-user@your-instance

# 4. ثبّت Docker و Docker Compose
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker

# 5. شغّل المشروع
git clone https://github.com/yourusername/fekrti.git
cd fekrti
docker-compose up -d

# 6. استخدم RDS لقاعدة البيانات (اختياري)
# اذهب إلى RDS Console وأنشئ PostgreSQL instance
```

### مع Elastic Beanstalk:

```bash
# 1. ثبّت EB CLI
pip install awseb

# 2. إنشاء deployment
eb init -p docker fekrti
eb create fekrti-prod
eb deploy
```

---

## 5️⃣ متطلبات الإنتاج

### قبل النشر تأكد من:

```bash
✅ .env.production معدّ بشكل صحيح
✅ DATABASE_URL يشير إلى قاعدة بيانات حقيقية (PostgreSQL 14+)
✅ JWT_SECRET طويل وعشوائي (32+ أحرف)
✅ NEXT_PUBLIC_APP_URL يشير للـ domain الصحيح
✅ البريد الإلكتروني مكوّن (SMTP)
✅ قاعدة البيانات مع backups يومية
✅ SSL/HTTPS مفعّل
✅ CDN للصور (اختياري لكن موصى به)
```

### مثال .env.production:

```env
# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/fekrti_prod

# Security
JWT_SECRET=your-super-secret-256-bit-key-here-make-it-random
NODE_ENV=production

# Application
NEXT_PUBLIC_APP_URL=https://fekrti.sa
NEXT_PUBLIC_COMPANY_NAME=فكرتي للاستشارات

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@fekrti.sa
SMTP_PASS=your-app-password

# Storage
NEXT_PUBLIC_S3_BUCKET=fekrti-prod
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=info
```

---

## 6️⃣ Monitoring والـ Health Checks

### مع Sentry (Error Tracking):

```bash
# 1. أنشئ حساب على https://sentry.io
# 2. أنشئ project جديد
# 3. انسخ DSN
# 4. أضفها في .env:
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### مع DataDog:

```bash
docker run -d \
  -e DD_AGENT_HOST=$(hostname -I | awk '{print $1}') \
  -e DD_TRACE_AGENT_PORT=8126 \
  -e DD_STATS_PORT=8125 \
  datadog/agent:latest
```

### مع Prometheus:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fekrti'
    static_configs:
      - targets: ['localhost:3000']
```

---

## 7️⃣ Backups واستعادة البيانات

### Backup يومي من PostgreSQL:

```bash
# في الـ Cron job (كل يوم الساعة 2 صباحاً):
0 2 * * * pg_dump -h localhost -U postgres fekrti_prod > /backups/fekrti-$(date +\%Y-\%m-\%d).sql

# أو مع Docker:
docker-compose exec -T postgres pg_dump -U postgres fekrti_marketplace > backup.sql
```

### استعادة البيانات:

```bash
# من ملف Backup
psql -h localhost -U postgres fekrti_prod < backup.sql

# أو مع Docker:
cat backup.sql | docker-compose exec -T postgres psql -U postgres fekrti_marketplace
```

---

## 8️⃣ أفضل الممارسات

### Security:
- ✅ استخدم HTTPS/SSL دائماً
- ✅ استخدم بيئات منفصلة (dev, staging, prod)
- ✅ لا تضع secrets في الكود
- ✅ فعّل Rate Limiting
- ✅ استخدم CORS بشكل صحيح
- ✅ حدّث المكتبات بانتظام

### Performance:
- ✅ استخدم CDN للصور والأصول
- ✅ فعّل Caching (Redis)
- ✅ استخدم Database Indexing
- ✅ ضغّط الـ responses (gzip)
- ✅ استخدم Load Balancing

### Reliability:
- ✅ اجعل Health checks
- ✅ فعّل Auto Restarts
- ✅ Backups يومية
- ✅ Monitoring و Alerting
- ✅ Rollback strategy

---

## ✅ قائمة فحص النشر

```
قبل النشر:
- [ ] اختبرت التطبيق محلياً
- [ ] قاعدة البيانات تعمل
- [ ] .env معدّ
- [ ] SSL certificate جاهز
- [ ] DNS مشار للخادم

أثناء النشر:
- [ ] النسخ الاحتياطية تعمل
- [ ] Database migrated
- [ ] Health checks تمر
- [ ] URLs صحيحة
- [ ] البريد الإلكتروني يعمل

بعد النشر:
- [ ] التطبيق يستجيب
- [ ] قاعدة البيانات تعمل
- [ ] السجلات نظيفة
- [ ] لا توجد errors
- [ ] Performance OK
```

---

**اختر الخيار الأنسب واشتدِ!** 🚀


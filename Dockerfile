# ==================== المرحلة 1: البناء ====================
FROM node:18-alpine AS builder

WORKDIR /app

# نسخ ملفات الحزمة
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# تثبيت المكتبات
RUN npm ci

# نسخ الكود
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY types ./types
COPY utils ./utils
COPY styles ./styles
COPY public ./public
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# توليد Prisma Client
RUN npm run db:generate

# بناء التطبيق
RUN npm run build

# ==================== المرحلة 2: الإنتاج ====================
FROM node:18-alpine

WORKDIR /app

# تثبيت dumb-init لمعالجة الإشارات بشكل صحيح
RUN apk add --no-cache dumb-init

# نسخ ملفات الإنتاج من المرحلة السابقة
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# إنشاء مستخدم غير جذر
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# تعريض المنفذ
EXPOSE 3000

# متغيرات البيئة
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# تشغيل التطبيق
ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start"]

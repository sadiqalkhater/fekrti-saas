// app/api/auth/register/route.ts
// إنشاء حساب جديد وبدء جلسة

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSessionToken, hashPassword, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { handle, HttpError, parseBody } from '@/lib/masar/http';
import { ensurePersonalWorkspace } from '@/lib/masar/service';

const schema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير').max(80),
  email: z.string().trim().toLowerCase().email('البريد غير صالح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل').max(200),
});

export const POST = handle(async (request: Request) => {
  const body = await parseBody(request, schema);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) throw new HttpError(409, 'يوجد حساب بهذا البريد. سجّل الدخول بدلًا من ذلك.');

  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, password: await hashPassword(body.password) },
  });
  await ensurePersonalWorkspace(user.id, user.name);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
  return res;
});

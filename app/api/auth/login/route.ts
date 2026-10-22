// app/api/auth/login/route.ts
// تسجيل الدخول بالبريد وكلمة المرور

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from '@/lib/auth';
import { handle, HttpError, parseBody } from '@/lib/masar/http';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('البريد غير صالح'),
  password: z.string().min(1).max(200),
});

export const POST = handle(async (request: Request) => {
  const body = await parseBody(request, schema);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const valid = user && user.status === 'active' && (await verifyPassword(body.password, user.password));
  if (!user || !valid) throw new HttpError(401, 'البريد أو كلمة المرور غير صحيحة');

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
  return res;
});

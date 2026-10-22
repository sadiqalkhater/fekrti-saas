// lib/auth.ts
// المصادقة: تشفير كلمات المرور وجلسات JWT في كوكي محمي

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const SESSION_COOKIE = 'fekrti_session';
const SESSION_DAYS = 30;

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET غير مضبوط');
    }
    return new TextEncoder().encode('dev-only-insecure-secret-change-me');
  }
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

/** معرّف المستخدم من كوكي الجلسة، أو null */
export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/** المستخدم الحالي (بدون كلمة المرور)، أو null */
export async function getCurrentUser() {
  const id = await getSessionUserId();
  if (!id) return null;
  return prisma.user.findFirst({
    where: { id, status: 'active' },
    select: { id: true, name: true, email: true, avatar: true },
  });
}

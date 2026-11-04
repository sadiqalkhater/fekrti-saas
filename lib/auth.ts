// lib/auth.ts
// التحقق من هوية المستخدم وصلاحياته في واجهات API

import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export type SessionUser = { id: string; role: string };

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

/** يقرأ الرمز من ترويسة Authorization: Bearer أو من كوكي `token`، ويعيد null إن لم يكن صالحاً */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = (payload.sub ?? payload.id) as string | undefined;
    const role = payload.role as string | undefined;
    return id && role ? { id, role } : null;
  } catch {
    return null;
  }
}

export const isAdmin = (user: SessionUser) => user.role === 'ADMIN';

/** هل يملك المستخدم هذا التاجر (أو هو مسؤول النظام)؟ */
export async function canAccessVendor(user: SessionUser, vendorId: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { userId: true },
  });
  return vendor?.userId === user.id;
}

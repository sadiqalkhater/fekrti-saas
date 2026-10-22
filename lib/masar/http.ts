// lib/masar/http.ts
// أدوات مسارات API: أخطاء موحّدة، التحقق من الجسم، والمستخدم الحالي

import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { getCurrentUser } from '@/lib/auth';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, 'سجّل الدخول أولًا');
  return user;
}

export async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, 'جسم الطلب ليس JSON صالحًا');
  }
  return schema.parse(raw);
}

/** يغلّف معالج المسار ويحوّل الأخطاء إلى ردود JSON بالعربية */
export function handle<C>(fn: (request: Request, ctx: C) => Promise<Response>) {
  return async (request: Request, ctx: C): Promise<Response> => {
    try {
      return await fn(request, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'بيانات غير صالحة', issues: error.issues.map((i) => ({ path: i.path, message: i.message })) },
          { status: 400 },
        );
      }
      console.error('Masar API error:', error);
      return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
    }
  };
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });

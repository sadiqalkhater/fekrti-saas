// app/api/auth/me/route.ts
// المستخدم الحالي

import { handle, ok, requireUser } from '@/lib/masar/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => ok(await requireUser()));

// app/api/services/route.ts
// البحث في خدمات السوق النشطة

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/masar/http';

export const dynamic = 'force-dynamic';

const SORTS: Record<string, Prisma.ServiceOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  popular: { orderCount: 'desc' },
  rating: { rating: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
};

export const GET = handle(async (request: Request) => {
  const p = new URL(request.url).searchParams;
  const num = (k: string) => {
    const v = parseFloat(p.get(k) ?? '');
    return Number.isFinite(v) ? v : undefined;
  };
  const search = p.get('search')?.trim();
  const category = p.get('category')?.trim();
  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      vendor: { status: 'APPROVED', suspended: false },
      category: category || undefined,
      price: { gte: num('minPrice'), lte: num('maxPrice') },
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: { vendor: { select: { businessName: true, slug: true, rating: true } } },
    orderBy: SORTS[p.get('sort') ?? ''] ?? SORTS.newest,
    take: 60,
  });
  return ok(services);
});

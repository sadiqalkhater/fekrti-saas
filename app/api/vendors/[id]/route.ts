// app/api/vendors/[id]/route.ts
// API لجلب وتحديث بيانات التاجر

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ==================== GET /api/vendors/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        services: {
          where: { status: 'ACTIVE' },
          take: 5,
        },
        reviews: {
          take: 5,
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'التاجر غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ==================== PUT /api/vendors/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // التحقق من الصلاحيات (يجب أن يكون التاجر هو صاحب الحساب)
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'التاجر غير موجود' },
        { status: 404 }
      );
    }

    // تحديث البيانات
    const updatedVendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        businessName: body.businessName,
        description: body.description,
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        city: body.city,
        country: body.country,
        taxId: body.taxId,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ibanNumber: body.ibanNumber,
        logo: body.logo,
        banner: body.banner,
      },
      include: { user: true },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'خطأ في تحديث البيانات' },
      { status: 500 }
    );
  }
}

// ==================== DELETE /api/vendors/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // حذف التاجر وجميع بيانات المشاريع والخدمات
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'التاجر غير موجود' },
        { status: 404 }
      );
    }

    // حذف التاجر (سيحذف تلقائياً جميع البيانات المرتبطة)
    await prisma.vendor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'تم حذف التاجر بنجاح' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'خطأ في حذف البيانات' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { transactionId, category } = body;

    if (!transactionId || !category) {
      return NextResponse.json({ success: false, message: "Missing transactionId or category" }, { status: 400 });
    }

    await db.collection('transactions').doc(transactionId).update({
      category: category,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Category updated" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

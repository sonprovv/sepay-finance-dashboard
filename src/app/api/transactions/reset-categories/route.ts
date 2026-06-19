import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { accountNumber } = await req.json();
    if (!accountNumber) return NextResponse.json({ success: false, message: "Missing accountNumber" });

    const txSnapshot = await db.collection('transactions')
      .where('account_number', '==', accountNumber)
      .get();
    
    const batch = db.batch();
    let count = 0;
    
    txSnapshot.docs.forEach((doc: any) => {
      if (doc.data().category !== "Chuyển khoản") {
        batch.update(doc.ref, { category: "Chuyển khoản" });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

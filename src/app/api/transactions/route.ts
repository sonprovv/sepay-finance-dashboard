import { NextResponse } from 'next/server';
import admin, { db } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('accountNumber');

    let query: any = db.collection('transactions');

    if (accountNumber) {
      query = query.where('account_number', '==', accountNumber);
    }

    // Order by latest first
    const snapshot = await query.orderBy('created_at', 'desc').limit(100).get();

    const transactions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true, 
      data: transactions 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

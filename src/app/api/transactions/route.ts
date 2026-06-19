import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('accountNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = db.collection('transactions');

    if (accountNumber) {
      query = query.where('account_number', '==', accountNumber);
    }

    // Lấy tất cả giao dịch của tài khoản này (hoặc tối đa 2000) để filter in-memory
    // Giúp tránh lỗi thiếu Composite Index trên Firestore
    const snapshot = await query.limit(2000).get();

    let transactions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter theo ngày
    if (startDate) {
      transactions = transactions.filter((t: any) => t.transaction_date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter((t: any) => t.transaction_date <= endDate);
    }

    // Sort mới nhất lên đầu
    transactions.sort((a: any, b: any) => {
      const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 0;
      const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ 
      success: true, 
      data: transactions 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

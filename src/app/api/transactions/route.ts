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
    if (startDate || endDate) {
      const startMs = startDate ? new Date(startDate).getTime() : 0;
      const endMs = endDate ? new Date(endDate).getTime() : Infinity;

      transactions = transactions.filter((t: any) => {
        const tDate = t.transaction_date || t.created_at;
        if (!tDate) return false;
        
        // Handle SePay date format 'YYYY-MM-DD HH:mm:ss' which lacks 'T'
        const normalizedDate = tDate.includes(' ') ? tDate.replace(' ', 'T') : tDate;
        const tMs = new Date(normalizedDate).getTime();
        
        return tMs >= startMs && tMs <= endMs;
      });
    }

    // Sort mới nhất lên đầu
    transactions.sort((a: any, b: any) => {
      const tDateA = a.transaction_date || a.created_at;
      const tDateB = b.transaction_date || b.created_at;
      const normalizedA = tDateA ? (tDateA.includes(' ') ? tDateA.replace(' ', 'T') : tDateA) : '';
      const normalizedB = tDateB ? (tDateB.includes(' ') ? tDateB.replace(' ', 'T') : tDateB) : '';
      
      const dateA = normalizedA ? new Date(normalizedA).getTime() : 0;
      const dateB = normalizedB ? new Date(normalizedB).getTime() : 0;
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

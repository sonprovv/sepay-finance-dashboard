import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('apikey');
    const expectedToken = `Bearer ${process.env.SEPAY_WEBHOOK_TOKEN}`;
    
    if (authHeader !== expectedToken && authHeader !== process.env.SEPAY_WEBHOOK_TOKEN) {
      return NextResponse.json({ success: false, message: "Unauthorized Webhook" }, { status: 401 });
    }

    const body = await req.json();
    const { id, gateway, accountNumber, content, transferType, transferAmount, transactionDate, referenceCode } = body;

    if (!transferAmount || transferAmount <= 0) {
      return NextResponse.json({ success: true, message: "Bỏ qua giao dịch 0đ" });
    }

    // Deduplication check
    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef.where('sepay_id', '==', id).get();

    if (!snapshot.empty) {
      console.log(`[SePay] Bỏ qua giao dịch trùng lặp ID: ${id}`);
      return NextResponse.json({ success: true, message: "Giao dịch đã tồn tại (Deduplication)" });
    }

    let category = "Chuyển khoản"; 

    const type = transferType === 'in' ? 'THU' : 'CHI';
    const safeDate = transactionDate || new Date().toISOString();

    const newTransaction = {
      sepay_id: id,
      amount: transferAmount,
      type,
      category,
      note: content,
      gateway,
      account_number: accountNumber,
      reference_code: referenceCode || null,
      transaction_date: safeDate,
      created_at: new Date().toISOString()
    };

    const docRef = await transactionsRef.add(newTransaction);

    return NextResponse.json({ 
      success: true, 
      message: "Đã lưu giao dịch vào CSDL nội bộ.",
      data: { id: docRef.id, ...newTransaction }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

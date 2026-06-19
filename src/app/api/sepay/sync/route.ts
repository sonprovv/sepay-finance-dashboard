import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { accountNumber } = await req.json();

    if (!accountNumber) {
      return NextResponse.json({ success: false, message: "Thiếu số tài khoản" }, { status: 400 });
    }

    const apiToken = process.env.SEPAY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ success: false, message: "Chưa cấu hình SEPAY_API_TOKEN trong biến môi trường" }, { status: 400 });
    }

    // Lấy dữ liệu từ SePay REST API
    // SePay API endpoint: https://my.sepay.vn/userapi/transactions/list
    const response = await fetch(`https://my.sepay.vn/userapi/transactions/list?account_number=${accountNumber}&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ success: false, message: "Lỗi khi gọi API SePay", error: text }, { status: 500 });
    }

    const result = await response.json();
    const transactions = result.transactions || [];

    if (transactions.length === 0) {
      return NextResponse.json({ success: true, message: "Không có dữ liệu mới để đồng bộ", synced: 0 });
    }

    const transactionsRef = db.collection('transactions');
    let syncedCount = 0;

    for (const t of transactions) {
      // Kiểm tra trùng lặp
      const snapshot = await transactionsRef.where('sepay_id', '==', String(t.id)).get();
      if (!snapshot.empty) {
        continue; // Bỏ qua nếu đã tồn tại
      }

      const amountIn = parseFloat(t.amount_in || "0");
      const amountOut = parseFloat(t.amount_out || "0");
      const amount = amountIn > 0 ? amountIn : amountOut;
      const type = amountIn > 0 ? 'THU' : 'CHI';
      
      let category = "Chuyển khoản"; 
      const text = (t.transaction_content || "").toLowerCase();
      if (text.match(/an uong|an trua|cafe|bun cha|pho|do an|food/)) category = "Ăn uống";
      else if (text.match(/luong|salary|thu lao|thanh toan/)) category = "Lương";
      else if (text.match(/xang|di lai|grab|be|gojek/)) category = "Đi lại";
      else if (text.match(/shopee|lazada|tiktok|mua sam/)) category = "Mua sắm";
      else if (text.match(/dien|nuoc|internet|wifi/)) category = "Hóa đơn";

      const newTransaction = {
        sepay_id: String(t.id),
        amount: amount,
        type: type,
        category: category,
        note: t.transaction_content,
        gateway: t.bank_brand_name,
        account_number: t.account_number,
        reference_code: t.reference_number || null,
        transaction_date: t.transaction_date,
        created_at: new Date().toISOString()
      };

      await transactionsRef.add(newTransaction);
      syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đồng bộ thành công ${syncedCount} giao dịch`,
      synced: syncedCount
    }, { status: 200 });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

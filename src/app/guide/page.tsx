import { BookOpen, Key, Link2, BellRing, Settings, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="text-brand-400 w-6 h-6" />
          Hướng dẫn cài đặt & sử dụng
        </h1>
        <p className="text-slate-400 mt-2">
          Các bước chi tiết để cấu hình hệ thống nhận giao dịch tự động và đồng bộ dữ liệu cũ từ SePay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phần Webhook */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <BellRing className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">1. Cấu hình Webhook</h2>
              <p className="text-sm text-slate-400">Tự động nhận biến động số dư theo thời gian thực</p>
            </div>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm">
            <p>Để hệ thống tự cập nhật ngay khi có tiền vào/ra, bạn cần cài đặt Webhook trên SePay:</p>
            <ol className="list-decimal list-inside space-y-3 marker:text-brand-400">
              <li>Đăng nhập <a href="https://my.sepay.vn" target="_blank" className="text-brand-400 hover:underline">my.sepay.vn</a>.</li>
              <li>Vào menu <strong>Tích hợp</strong> (Integrations) &gt; Bấm <strong>Thêm Webhook</strong>.</li>
              <li>Tại ô <strong>URL Webhook</strong>, nhập địa chỉ trang web của bạn kèm đường dẫn API:
                <code className="block mt-1 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-brand-300 select-all">
                  https://frontend-zeta-eight-87.vercel.app/api/sepay/webhook
                </code>
              </li>
              <li>Tại ô <strong>Token / Custom Key</strong> (để bảo mật), bạn hãy bịa ra một mã bất kỳ (Ví dụ: <code className="text-purple-400">SEPAY_SECRET_2026</code>).</li>
              <li>Đánh dấu chọn các sự kiện muốn nhận (Thường chọn <strong>Tất cả</strong> hoặc <strong>Tiền vào/Tiền ra</strong>).</li>
              <li>Lưu Webhook lại.</li>
            </ol>
            
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-3 mt-4">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-400 mb-1">Quan trọng: Cấu hình phía Vercel</p>
                <p>Bạn bắt buộc phải copy cái mã Token bạn vừa bịa ở bước 4, lên <strong>Vercel &gt; Settings &gt; Environment Variables</strong>, thêm một biến tên là <code>SEPAY_WEBHOOK_TOKEN</code> và dán mã đó vào. Sau đó bấm <strong>Redeploy</strong> web.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phần API Token */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Key className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">2. Lấy API Token</h2>
              <p className="text-sm text-slate-400">Dùng để đồng bộ các giao dịch cũ trong quá khứ</p>
            </div>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm">
            <p>Webhook chỉ bắt được giao dịch mới. Để lấy dữ liệu cũ, bạn cần có API Token:</p>
            <ol className="list-decimal list-inside space-y-3 marker:text-emerald-400">
              <li>Tại <a href="https://my.sepay.vn" target="_blank" className="text-emerald-400 hover:underline">my.sepay.vn</a>, vào <strong>Cấu hình công ty</strong> &gt; <strong>API Access</strong>.</li>
              <li>Bấm nút <strong>+ Thêm API</strong>.</li>
              <li>Nhập tên (ví dụ: Dashboard), để trạng thái <strong>Hoạt động</strong> và lưu lại.</li>
              <li>Bạn sẽ nhận được một dãy ký tự dài. <strong>Copy toàn bộ dãy này</strong>.</li>
              <li>Đăng xuất khỏi Dashboard của web chúng ta, hoặc F5 tải lại trang Login.</li>
              <li>Dán mã đó vào ô <strong>SePay API Token</strong> khi đăng nhập.</li>
              <li>Vào lại trang Overview, ấn nút <strong>Đồng bộ từ SePay</strong>. Hệ thống sẽ kéo dữ liệu cũ về biểu đồ.</li>
            </ol>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 mt-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-400 mb-1">Mẹo nhỏ</p>
                <p>Bạn cũng có thể lưu cứng API Token này vào Vercel (tên biến <code>SEPAY_API_TOKEN</code>) để không cần phải nhập ở màn hình Đăng nhập mỗi khi đổi thiết bị.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cấu hình phân loại */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">3. Cách hệ thống tự động phân loại</h2>
              <p className="text-sm text-slate-400">Cơ chế nhận diện giao dịch tự động</p>
            </div>
          </div>
          
          <div className="text-slate-300 text-sm space-y-4">
            <p>Hệ thống của chúng ta được lập trình để tự động phân tích "Nội dung chuyển khoản" và gán vào các danh mục phù hợp. Các từ khoá nhận diện hiện tại bao gồm:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-brand-400 mb-2">🍽️ Ăn uống</p>
                <p className="text-xs text-slate-400">an uong, an trua, cafe, bun cha, pho, do an, food...</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-emerald-400 mb-2">💰 Lương</p>
                <p className="text-xs text-slate-400">luong, salary, thu lao, thanh toan...</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-amber-400 mb-2">🛵 Đi lại</p>
                <p className="text-xs text-slate-400">xang, di lai, grab, be, gojek...</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-purple-400 mb-2">🛍️ Mua sắm & Hoá đơn</p>
                <p className="text-xs text-slate-400">shopee, dien, nuoc, wifi, internet, tiktok...</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4 italic">* Các giao dịch không nằm trong từ khoá trên sẽ được gom mặc định vào nhóm "Chuyển khoản".</p>
          </div>
        </div>
      </div>
    </div>
  );
}

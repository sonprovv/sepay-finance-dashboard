import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Building2, FileText } from "lucide-react";

interface TransactionProps {
  transaction: {
    id: number;
    amount: number;
    type: "THU" | "CHI";
    category: string | null;
    note: string | null;
    gateway: string | null;
    account_number: string | null;
    created_at: string;
  };
}

export function TransactionCard({ transaction }: TransactionProps) {
  const isThu = transaction.type === "THU";
  
  return (
    <div className="glass-card rounded-2xl p-5 hover:bg-slate-800/30 transition-all duration-300 group cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            isThu ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-rose-500/10 text-rose-500 shadow-rose-500/10 ring-1 ring-rose-500/20"
          }`}>
            {isThu ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg group-hover:text-brand-400 transition-colors">
              {transaction.note || (isThu ? "Nhận tiền chuyển khoản" : "Chuyển tiền đi")}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {transaction.gateway || "N/A"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> #{transaction.id}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-lg ${isThu ? "text-emerald-400" : "text-rose-400"}`}>
            {isThu ? "+" : "-"}{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(transaction.amount)}
          </p>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            {formatDistanceToNow(parseISO(transaction.created_at), { addSuffix: true, locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUserStore } from "@/store/useUserStore";
import { TransactionCard } from "@/components/TransactionCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart3, Filter, Receipt, Folder } from "lucide-react";

interface Label {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_LABELS: Label[] = [
  { id: "default_1", name: "Ăn uống", color: "#f59e0b" },
  { id: "default_2", name: "Lương", color: "#10b981" },
  { id: "default_3", name: "Đi lại", color: "#3b82f6" },
  { id: "default_4", name: "Mua sắm", color: "#a855f7" },
  { id: "default_5", name: "Hóa đơn", color: "#ef4444" },
  { id: "default_6", name: "Chuyển khoản", color: "#64748b" },
];

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<"year" | "month" | "custom">("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Modal State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user?.accountNumber) {
      fetchData();
    }
  }, [user?.accountNumber]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const labelsRes = await axios.get(`/api/labels?accountNumber=${user?.accountNumber}`);
      let allLabels = [...DEFAULT_LABELS];
      if (labelsRes.data.success && labelsRes.data.data.length > 0) {
        const customLabels = labelsRes.data.data;
        for (const cl of customLabels) {
          if (!allLabels.find(l => l.name === cl.name)) {
            allLabels.push({ id: cl.id, name: cl.name, color: cl.color });
          }
        }
      }
      setLabels(allLabels);

      const txRes = await axios.get(`/api/transactions?accountNumber=${user?.accountNumber}`);
      if (txRes.data.success) {
        setAllTransactions(txRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Lọc data theo thời gian
    let data = [...allTransactions];
    
    if (filterType === "year") {
      data = data.filter(t => {
        const date = new Date(t.transaction_date || t.created_at);
        return date.getFullYear() === selectedYear;
      });
    } else if (filterType === "month") {
      data = data.filter(t => {
        const date = new Date(t.transaction_date || t.created_at);
        return date.getFullYear() === selectedYear && (date.getMonth() + 1) === selectedMonth;
      });
    } else if (filterType === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate).getTime();
      const end = new Date(customEndDate).getTime();
      data = data.filter(t => {
        const tDate = t.transaction_date || t.created_at;
        const normalized = tDate.includes(' ') ? tDate.replace(' ', 'T') : tDate;
        const time = new Date(normalized).getTime();
        return time >= start && time <= end;
      });
    }

    setFilteredTransactions(data);
  }, [allTransactions, filterType, selectedYear, selectedMonth, customStartDate, customEndDate]);

  // Nhóm chi phí theo danh mục (chỉ tính CHI)
  const categoryStats = filteredTransactions
    .filter(t => t.type === "CHI")
    .reduce((acc: any, t: any) => {
      const cat = t.category || "Khác";
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(categoryStats).map(key => {
    const label = labels.find(l => l.name === key);
    return {
      name: key,
      value: categoryStats[key],
      fill: label ? label.color : "#94a3b8"
    };
  }).sort((a, b) => b.value - a.value); // Sort lớn nhất lên đầu

  const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const selectedCategoryTransactions = selectedCategory ? filteredTransactions.filter(t => t.type === "CHI" && (t.category || "Khác") === selectedCategory) : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-brand-400 w-6 h-6" />
            Phân tích chi tiêu
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Xem tỷ trọng chi tiêu dựa trên các thư mục nhãn của bạn.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-slate-900 rounded-xl p-1 flex items-center border border-slate-800">
            <button
              onClick={() => setFilterType("year")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === "year" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-300"}`}
            >
              Theo Năm
            </button>
            <button
              onClick={() => setFilterType("month")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === "month" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-300"}`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setFilterType("custom")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${filterType === "custom" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-300"}`}
            >
              <Filter className="w-3 h-3" /> Tuỳ chỉnh
            </button>
          </div>

          {filterType === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-900 text-slate-200 text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>Năm {y}</option>;
              })}
            </select>
          )}

          {filterType === "month" && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              >
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          )}

          {filterType === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-900 text-slate-200 text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-900 text-slate-200 text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-bold text-slate-100 mb-2 self-start w-full">Biểu đồ tỷ trọng</h2>
          {loading ? (
            <div className="text-slate-500">Đang tải dữ liệu...</div>
          ) : pieData.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(data, index) => {
                      if (data && data.name) {
                        setSelectedCategory(data.name);
                      }
                    }}
                    cursor="pointer"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatVND(value || 0)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-slate-500 flex flex-col items-center">
              <PieChart className="w-16 h-16 text-slate-700 mb-4" />
              Chưa có dữ liệu chi tiêu trong thời gian này
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Chi tiết thư mục</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-rose-500/20">
              <span className="text-slate-300">Tổng chi tiêu</span>
              <span className="text-2xl font-bold text-rose-400">{formatVND(totalExpense)}</span>
            </div>

            <div className="space-y-3 pt-2">
              {pieData.map(item => (
                <div 
                  key={item.name} 
                  onClick={() => setSelectedCategory(item.name)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                    <span className="text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-slate-200">{formatVND(item.value)}</span>
                    <span className="text-xs text-slate-500">
                      {((item.value / totalExpense) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết danh mục */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedCategory(null)}>
          <div className="glass-card rounded-3xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col relative animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCategory(null)} 
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Folder className="w-5 h-5 text-brand-400" />
              Chi tiêu nhãn: {selectedCategory}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {selectedCategoryTransactions.length > 0 ? (
                selectedCategoryTransactions.map((t) => (
                  <TransactionCard key={t.id} transaction={t} />
                ))
              ) : (
                <div className="text-slate-400 text-center py-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-slate-600" />
                  </div>
                  <p>Không có giao dịch nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

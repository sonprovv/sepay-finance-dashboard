"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { TransactionCard } from "@/components/TransactionCard";
import { useUserStore } from "@/store/useUserStore";
import { ArrowDownRight, ArrowUpRight, Wallet, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ thu: 0, chi: 0, balance: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.accountNumber) return; // Wait until user config is loaded

      try {
        // Lấy danh sách giao dịch
        const res = await axios.get(`/api/transactions?accountNumber=${user.accountNumber}`);
        const data = res.data.data || [];
        setTransactions(data);

        // Tính tổng thu chi
        let totalThu = 0;
        let totalChi = 0;
        data.forEach((t: any) => {
          if (t.type === "THU") totalThu += t.amount;
          else if (t.type === "CHI") totalChi += t.amount;
        });

        setStats({
          thu: totalThu,
          chi: totalChi,
          balance: totalThu - totalChi,
        });

        // Giả lập dữ liệu biểu đồ từ giao dịch
        // Dữ liệu thực tế có thể gọi từ GET /api/transactions/stats
        const groupedByDay = data.reduce((acc: any, t: any) => {
          const date = new Date(t.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          if (!acc[date]) acc[date] = { date, thu: 0, chi: 0 };
          if (t.type === "THU") acc[date].thu += t.amount;
          if (t.type === "CHI") acc[date].chi += t.amount;
          return acc;
        }, {});
        
        let chartArray = Object.values(groupedByDay).reverse();
        if (chartArray.length === 0) {
          chartArray = [
            { date: "01/06", thu: 0, chi: 0 },
            { date: "05/06", thu: 500000, chi: 100000 },
            { date: "10/06", thu: 1200000, chi: 300000 },
          ]; // Mock nếu không có data
        }
        setChartData(chartArray);

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.accountNumber]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          Tài khoản {user?.bankName}
        </h1>
        <p className="text-slate-400 mt-1">Here is your financial overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/20 rounded-full blur-xl group-hover:bg-brand-500/30 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50">
              <Wallet className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="font-medium text-slate-400">Total Balance</h3>
          </div>
          <h2 className="text-3xl font-bold text-slate-100">{formatVND(stats.balance)}</h2>
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <ArrowDownRight className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-medium text-slate-400">Total Income</h3>
          </div>
          <h2 className="text-3xl font-bold text-emerald-400">{formatVND(stats.thu)}</h2>
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl group-hover:bg-rose-500/30 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <ArrowUpRight className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-medium text-slate-400">Total Expenses</h3>
          </div>
          <h2 className="text-3xl font-bold text-rose-400">{formatVND(stats.chi)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-400" />
              Cash Flow
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)}
                />
                <Area type="monotone" dataKey="thu" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorThu)" />
                <Area type="monotone" dataKey="chi" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorChi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">Recent Activity</h2>
            <button className="text-sm text-brand-400 hover:text-brand-300 font-medium">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full text-slate-500">Loading...</div>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 5).map((t) => (
                <TransactionCard key={t.id} transaction={t} />
              ))
            ) : (
              <div className="flex justify-center items-center h-full text-slate-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

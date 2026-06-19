"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { motion } from "framer-motion";
import { LayoutDashboard, LogOut, Receipt, BarChart3, User, BookOpen } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null; // Avoid hydration mismatch
  if (!isAuthenticated && pathname !== "/login") return null;

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/" },
    { icon: Receipt, label: "Transactions", path: "#" },
    { icon: BarChart3, label: "Analytics", path: "#" },
    { icon: BookOpen, label: "Hướng dẫn", path: "/guide" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card md:min-h-screen border-r border-slate-800/50 flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="font-bold text-xl text-white">S</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">SePay</h2>
              <p className="text-xs text-brand-400">Finance</p>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.path === "#") {
                      alert("Tính năng này đang được phát triển. Tạm thời bạn có thể xem mọi thứ ở tab Overview nhé!");
                    } else {
                      router.push(item.path);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 font-medium"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.bankName}</p>
              <p className="text-xs text-brand-400 font-mono mt-0.5">{user?.accountNumber}</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-10 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

export default function LoginPage() {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sepayApiToken, setSepayApiToken] = useState("");
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bankName.trim() && accountNumber.trim()) {
      login({ 
        bankName: bankName.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        sepayApiToken: sepayApiToken.trim() || undefined
      });
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 relative z-10 overflow-hidden mt-8 mb-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-brand-500/30">
              <Wallet className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to SePay</h1>
            <p className="text-slate-400 text-center text-sm">
              Configure your dashboard to monitor financial flows securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="bankName" className="block text-sm font-medium text-slate-300">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. MB, VCB"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 text-slate-100 placeholder:text-slate-600 uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-300">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 text-slate-100 placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sepayApiToken" className="block text-sm font-medium text-slate-300 flex justify-between">
                  <span>SePay API Token</span>
                  <span className="text-slate-500 font-normal text-xs">(Optional, for Sync feature)</span>
                </label>
                <input
                  id="sepayApiToken"
                  type="password"
                  value={sepayApiToken}
                  onChange={(e) => setSepayApiToken(e.target.value)}
                  placeholder="e.g. TH0L1Z..."
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group mt-4"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Data is stored securely on your local device.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState, DragEvent } from "react";
import axios from "axios";
import { useUserStore } from "@/store/useUserStore";
import { TransactionCard } from "@/components/TransactionCard";
import { Folder, Plus, Tag, RefreshCw, X, Trash2, ArrowLeft } from "lucide-react";

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

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ef4444", "#ec4899", "#14b8a6", "#f97316"];

export default function TransactionsPage() {
  const { user } = useUserStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // View state
  const [selectedFolder, setSelectedFolder] = useState<Label | null>(null);

  // Create label state
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(COLORS[0]);

  // Drag state
  const [draggedTxId, setDraggedTxId] = useState<string | null>(null);
  const [dragOverLabel, setDragOverLabel] = useState<string | null>(null);

  useEffect(() => {
    if (user?.accountNumber) {
      fetchData();
    }
  }, [user?.accountNumber, filterMonth, filterYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch labels
      const labelsRes = await axios.get(`/api/labels?accountNumber=${user?.accountNumber}`);
      if (labelsRes.data.success && labelsRes.data.data.length > 0) {
        // Merge with defaults
        const customLabels = labelsRes.data.data;
        const allLabels = [...DEFAULT_LABELS];
        for (const cl of customLabels) {
          if (!allLabels.find(l => l.name === cl.name)) {
            allLabels.push({ id: cl.id, name: cl.name, color: cl.color });
          }
        }
        setLabels(allLabels);
      } else {
        setLabels([...DEFAULT_LABELS]);
      }

      // Fetch transactions based on filter
      const startDate = `${filterYear}-${String(filterMonth).padStart(2, '0')}-01T00:00:00`;
      const endDate = new Date(filterYear, filterMonth, 0).toISOString().split('T')[0] + "T23:59:59";

      const txRes = await axios.get(`/api/transactions?accountNumber=${user?.accountNumber}&startDate=${startDate}&endDate=${endDate}`);
      if (txRes.data.success) {
        setTransactions(txRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const res = await axios.post('/api/labels', {
        accountNumber: user?.accountNumber,
        name: newLabelName.trim(),
        color: newLabelColor
      });
      if (res.data.success) {
        setLabels([...labels, { id: res.data.data.id, name: res.data.data.name, color: res.data.data.color }]);
        setShowCreateLabel(false);
        setNewLabelName("");
      }
    } catch (error) {
      console.error("Lỗi tạo label:", error);
      alert("Không thể tạo nhãn");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (id.startsWith("default_")) {
      alert("Không thể xóa thư mục mặc định.");
      return;
    }
    if (!confirm("Bạn có chắc muốn xoá thư mục này không? Các giao dịch sẽ được trả về 'Chưa phân loại'.")) return;
    try {
      await axios.delete(`/api/labels?id=${id}&accountNumber=${user?.accountNumber}`);
      setSelectedFolder(null);
      fetchData(); // reload
    } catch (error) {
      console.error("Lỗi xoá thư mục:", error);
      alert("Không thể xoá thư mục.");
    }
  };

  const handleRemoveCategory = async (txId: string) => {
    // Optimistic update
    setTransactions(prev => prev.map(t => 
      t.id === txId ? { ...t, category: null } : t
    ));
    try {
      await axios.patch('/api/transactions/update-category', {
        transactionId: txId,
        category: null
      });
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      fetchData(); 
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, txId: string) => {
    setDraggedTxId(txId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", txId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, labelName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverLabel !== labelName) {
      setDragOverLabel(labelName);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverLabel(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, labelName: string) => {
    e.preventDefault();
    setDragOverLabel(null);
    if (!draggedTxId) return;

    // Optimistic update
    setTransactions(prev => prev.map(t => 
      t.id === draggedTxId ? { ...t, category: labelName } : t
    ));

    try {
      await axios.patch('/api/transactions/update-category', {
        transactionId: draggedTxId,
        category: labelName
      });
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      fetchData(); 
    }
    
    setDraggedTxId(null);
  };

  const displayedTransactions = selectedFolder 
    ? transactions.filter(t => t.category === selectedFolder.name)
    : transactions.filter(t => !t.category || t.category === "Khác");

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Folder className="text-brand-400 w-6 h-6" />
            Quản lý chi tiêu
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kéo thả giao dịch vào thư mục/nhãn để phân loại dễ dàng.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-sm px-2 py-1.5 focus:outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="bg-slate-900">Tháng {i + 1}</option>
              ))}
            </select>
            <span className="text-slate-600">/</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-sm px-2 py-1.5 focus:outline-none cursor-pointer"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y} className="bg-slate-900">{y}</option>;
              })}
            </select>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Folders/Labels */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-200">Nhãn (Folders)</h2>
              <button 
                onClick={() => setShowCreateLabel(true)}
                className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors"
                title="Tạo thư mục mới"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {labels.map((label) => {
                const isSelected = selectedFolder?.id === label.id;
                const isDefault = label.id.startsWith("default_");
                return (
                  <div 
                    key={label.id}
                    onClick={() => setSelectedFolder(isSelected ? null : label)}
                    onDragOver={(e) => handleDragOver(e, label.name)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, label.name)}
                    className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      dragOverLabel === label.name 
                        ? "border-brand-500 bg-brand-500/10 scale-[1.02]" 
                        : isSelected 
                          ? "border-brand-400/50 bg-brand-500/20"
                          : "border-transparent bg-slate-800/50 hover:bg-slate-800"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }}></div>
                    <span className="text-sm font-medium text-slate-200 flex-1">{label.name}</span>
                    {!isDefault && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(label.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                        title="Xóa thư mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-400" />
                {selectedFolder ? `Thư mục: ${selectedFolder.name}` : "Danh sách chưa phân loại"}
              </h2>
              {selectedFolder && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedFolder(null)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex justify-center items-center text-slate-500">Đang tải dữ liệu...</div>
            ) : displayedTransactions.length > 0 ? (
              <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[700px] pr-2">
                {displayedTransactions.map((t) => (
                  <div 
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onDragEnd={() => setDraggedTxId(null)}
                    className={`relative group cursor-grab active:cursor-grabbing transition-transform ${
                      draggedTxId === t.id ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <TransactionCard transaction={t} />
                    
                    {/* Remove category button (only visible when viewing a folder) */}
                    {selectedFolder && (
                      <button
                        onClick={() => handleRemoveCategory(t.id)}
                        className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-lg backdrop-blur-sm"
                        title="Xóa khỏi thư mục"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center text-slate-500 flex-col gap-2">
                <Tag className="w-12 h-12 text-slate-700" />
                <p>{selectedFolder ? "Thư mục này chưa có giao dịch nào" : "Tất cả giao dịch đã được phân loại"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Label Modal */}
      {showCreateLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateLabel(false)}>
          <div className="glass-card rounded-3xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Tạo nhãn mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tên nhãn</label>
                <input 
                  type="text" 
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Ví dụ: Du lịch"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Màu sắc</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewLabelColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${newLabelColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateLabel(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Tạo mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

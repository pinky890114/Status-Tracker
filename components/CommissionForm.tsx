import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { AdminUser, CommissionFormData, CommissionType, Commission } from '../types';
import { STEPS } from '../constants';

interface CommissionFormProps {
  currentAdmin: AdminUser;
  onClose: () => void;
  onSubmit: (data: CommissionFormData) => Promise<void>;
  initialData?: Commission;
}

const CommissionForm: React.FC<CommissionFormProps> = ({ currentAdmin, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<CommissionFormData>({
    clientId: initialData?.clientId || '',
    clientName: initialData?.clientName || '',
    title: initialData?.title || '',
    type: initialData?.type || 'FLOWING_SAND',
    status: initialData?.status || 0,
    note: initialData?.note || '',
    price: initialData?.price || 0,
    deadline: initialData?.deadline || '',
    productionNote: initialData?.productionNote || '',
    contactInfo: initialData?.contactInfo || '',
    deliveryUrl: initialData?.deliveryUrl || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    const trimmedId = (formData.clientId || '').trim();
    const trimmedName = formData.clientName.trim();
    
    if (!trimmedId || !trimmedName) {
      setError("請填寫所有必要欄位");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("請求逾時，請檢查網路連線")), 10000)
      );

      // Race against the actual submission
      await Promise.race([
        onSubmit({
          ...formData,
          clientId: trimmedId,
          clientName: trimmedName
        }),
        timeoutPromise
      ]);
      // If successful, the parent component handles closing
    } catch (err: any) {
      console.error(err);
      setError(err.message || "提交失敗，請檢查網路或稍後再試。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-[#E6DCC3] shadow-xl mb-8 animate-in slide-in-from-top-4 relative">
      <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-[#5C4033]">
            {initialData ? '編輯委託' : `建立由「${currentAdmin.name}」老師負責的委託`}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-[#D6C0B3] hover:text-[#A67C52] transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">委託標題 (例如: 雙人流麻/頭貼委託)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            placeholder="請輸入委託標題"
            value={formData.title || ''}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">內部管理 ID (不重複)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            placeholder="例如: SN-001"
            value={formData.clientId}
            onChange={e => setFormData({...formData, clientId: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">客戶暱稱 (查詢用)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            placeholder="例如: 沈梨"
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">委託類型</label>
          <select 
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            value={formData.type}
            onChange={e => {
              const newType = e.target.value as CommissionType;
              setFormData({...formData, type: newType, status: 0});
            }}
          >
            <option value="FLOWING_SAND">流麻</option>
            <option value="SCREENSHOT">截圖</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">初始階段</label>
          <select 
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            value={formData.status}
            onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}
          >
            {STEPS[formData.type].map((s, i) => <option key={i} value={i}>{s.label}</option>)}
          </select>
        </div>
        
        {/* New Price Field */}
        <div className="col-span-1">
           <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">委託金額 ($)</label>
           <input 
             type="number"
             disabled={isSubmitting}
             className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
             placeholder="例如: 1200"
             value={formData.price || ''}
             onChange={e => setFormData({...formData, price: e.target.value ? parseInt(e.target.value) : undefined})}
           />
        </div>

        {/* Deadline Field */}
        <div className="col-span-1">
           <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">截止日期</label>
           <input 
             type="date"
             disabled={isSubmitting}
             className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
             value={formData.deadline || ''}
             onChange={e => setFormData({...formData, deadline: e.target.value})}
           />
        </div>

        <div className="col-span-2">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">備註訊息 (客戶可見)</label>
          <textarea 
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            rows={2}
            value={formData.note}
            onChange={e => setFormData({...formData, note: e.target.value})}
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-[#A67C52] block mb-1 uppercase tracking-widest">製作備註</label>
          <textarea 
            disabled={isSubmitting}
            className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50 text-[#5C4033]"
            rows={2}
            value={formData.productionNote || ''}
            onChange={e => setFormData({...formData, productionNote: e.target.value})}
          />
        </div>
        <div className="col-span-2 flex justify-end gap-3 mt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-bold text-[#D6C0B3] hover:text-[#A67C52]"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#BC4A3C] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>處理中...</span>
              </>
            ) : (
              <span>儲存委託</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommissionForm;
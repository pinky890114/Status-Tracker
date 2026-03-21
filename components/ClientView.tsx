import React, { useState } from 'react';
import { Search, Sparkles, Camera, ArrowLeft, ClipboardList, ChevronRight, Image, ExternalLink } from 'lucide-react';
import { Commission, CommissionFormData, CommissionType } from '../types';
import { COMMISSION_TYPES, STEPS } from '../constants';
import ProgressBar from './ProgressBar';
import RequestForm from './RequestForm';

interface ClientViewProps {
  commissions: Commission[];
  onRequestSubmit?: (data: CommissionFormData) => Promise<void>;
  isAcceptingCommissions?: boolean;
}

type ViewMode = 'MENU' | 'TRACK' | 'REQUEST' | 'PORTFOLIO';

const ClientView: React.FC<ClientViewProps> = ({ commissions, onRequestSubmit, isAcceptingCommissions = true }) => {
  const [mode, setMode] = useState<ViewMode>('MENU');
  
  // Search State
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<Commission[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Request State
  const [requestType, setRequestType] = useState<CommissionType>('FLOWING_SAND');

  const handleSearch = () => {
    if (!searchNickname.trim()) return;
    setHasSearched(true);
    const results = commissions.filter(c => c.clientName.toLowerCase().includes(searchNickname.trim().toLowerCase()));
    setSearchResults(results);
  };

  const startRequest = (type: CommissionType) => {
    setRequestType(type);
    setMode('REQUEST');
  };

  // --- MENU VIEW (Home) ---
  if (mode === 'MENU') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center p-3 bg-[#E6DCC3] rounded-full mb-4 text-[#8B5E3C]">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-bold text-[#5C4033] mb-3 tracking-wide">沈梨今天工作了嗎</h2>
          <p className="text-[#8B5E3C] font-medium opacity-80">請選擇要委託的項目</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          
          {/* Commission Buttons Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Button 1: Flowing Sand Commission */}
            <button 
              onClick={() => isAcceptingCommissions && startRequest('FLOWING_SAND')}
              disabled={!isAcceptingCommissions}
              className={`group relative w-full aspect-square rounded-2xl shadow-xl shadow-[#A67C52]/20 overflow-hidden transition-all bg-[#F9F5F0] ${isAcceptingCommissions ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
            >
              <img 
                src="https://i.ibb.co/6RMHtVP2/Gemini-Generated-Image-kk2g2dkk2g2dkk2g.png" 
                alt="流麻委託" 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isAcceptingCommissions ? 'group-hover:scale-110' : ''}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-[#D6C0B3]');
                }}
              />
              
              {/* Fallback */}
              <div className="absolute inset-0 flex items-center justify-center hidden group-[.bg-[#D6C0B3]]:flex flex-col">
                 <Sparkles size={32} className="text-[#5C4033] mb-2 opacity-50" />
              </div>
              {!isAcceptingCommissions && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white/90 text-[#5C4033] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">暫停接單</span>
                </div>
              )}
            </button>

            {/* Button 2: Screenshot Commission */}
            <button 
              onClick={() => isAcceptingCommissions && startRequest('SCREENSHOT')}
              disabled={!isAcceptingCommissions}
              className={`group relative w-full aspect-square rounded-2xl shadow-xl shadow-[#A67C52]/20 overflow-hidden transition-all bg-[#F9F5F0] ${isAcceptingCommissions ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
            >
              <img 
                src="https://i.ibb.co/Gf4YQHm2/Gemini-Generated-Image-kteefgkteefgktee.png" 
                alt="截圖委託" 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isAcceptingCommissions ? 'group-hover:scale-110' : ''}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-[#D6C0B3]');
                }}
              />

              {/* Fallback */}
              <div className="absolute inset-0 flex items-center justify-center hidden group-[.bg-[#D6C0B3]]:flex flex-col">
                 <Camera size={32} className="text-[#5C4033] mb-2 opacity-50" />
              </div>
              {!isAcceptingCommissions && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white/90 text-[#5C4033] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">暫停接單</span>
                </div>
              )}
            </button>
          </div>

          {/* Button 3: Track Progress (Full Width) */}
          <button 
            onClick={() => setMode('TRACK')}
            className="w-full group bg-white p-5 rounded-2xl shadow-lg shadow-[#A67C52]/10 border border-[#E6DCC3] hover:border-[#BC4A3C] transition-all hover:scale-[1.01] text-left flex items-center justify-between overflow-hidden mt-2"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#F9F5F0] text-[#BC4A3C] rounded-xl flex items-center justify-center shadow-inner">
                <Search size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5C4033] group-hover:text-[#BC4A3C] transition-colors">委託進度追蹤</h3>
                <p className="text-[10px] text-[#A67C52] font-bold mt-0.5 uppercase tracking-wider opacity-70">Track Status</p>
              </div>
            </div>
            <ChevronRight className="text-[#D6C0B3] group-hover:text-[#BC4A3C] transition-colors" />
          </button>

          {/* Button 4: Portfolio (Full Width) */}
          <button 
            onClick={() => setMode('PORTFOLIO')}
            className="w-full group bg-white p-5 rounded-2xl shadow-lg shadow-[#A67C52]/10 border border-[#E6DCC3] hover:border-[#BC4A3C] transition-all hover:scale-[1.01] text-left flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#F9F5F0] text-[#A67C52] rounded-xl flex items-center justify-center shadow-inner">
                <Image size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5C4033] group-hover:text-[#BC4A3C] transition-colors">作品集欣賞</h3>
                <p className="text-[10px] text-[#A67C52] font-bold mt-0.5 uppercase tracking-wider opacity-70">Portfolio</p>
              </div>
            </div>
            <ChevronRight className="text-[#D6C0B3] group-hover:text-[#BC4A3C] transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // --- TRACKING VIEW ---
  if (mode === 'TRACK') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative min-h-[60vh]">
        <button 
          onClick={() => setMode('MENU')}
          className="flex items-center gap-2 text-[#A67C52] hover:text-[#5C4033] font-bold text-sm transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          返回首頁
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#5C4033] mb-2">追蹤你的進度</h2>
          <p className="text-[#8B5E3C] font-medium">請輸入你在委託時使用的 暱稱</p>
        </div>

        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-[#A67C52]/10 border border-[#E6DCC3] w-full max-w-full overflow-hidden">
          <input 
            type="text" 
            placeholder="例如: 沈梨"
            className="flex-1 min-w-0 px-3 md:px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E6DCC3] transition-all font-medium text-sm md:text-base text-[#5C4033] placeholder:text-[#D6C0B3]"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button 
            onClick={handleSearch}
            className="shrink-0 bg-[#BC4A3C] hover:bg-[#A33E32] text-white px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 font-bold shadow-lg shadow-[#BC4A3C]/20 whitespace-nowrap"
          >
            <Search size={18} />
            <span>查詢</span>
          </button>
        </div>

        <div className="space-y-6 pb-20">
          {hasSearched && searchResults && searchResults.length > 0 && (
            <div className="flex items-center justify-center mb-2">
              <span className="bg-[#E6DCC3] text-[#5C4033] px-3 py-1 rounded-full text-xs font-bold">
                找到 {searchResults.length} 筆結果
              </span>
            </div>
          )}

          {hasSearched && searchResults && searchResults.map((result) => (
            <div key={result.id} className="bg-white p-8 rounded-3xl border border-[#E6DCC3] shadow-lg animate-in zoom-in-95 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#F2EFE9] px-3 py-1 rounded-bl-2xl text-[10px] font-bold text-[#A67C52] tracking-wider flex items-center gap-2">
                {/* Logic: Flowing Sand = 蘇沐, Screenshot = 沈梨 */}
                <span>TEACHER: {result.type === 'FLOWING_SAND' ? '蘇沐' : '沈梨'}</span>
                {result.price !== undefined && result.price > 0 && (
                  <>
                    <span className="text-[#D6C0B3]">|</span>
                    <span className="text-[#BC4A3C]">${result.price}</span>
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 border ${result.type === 'FLOWING_SAND' ? 'bg-orange-50 text-[#A67C52] border-orange-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                    {COMMISSION_TYPES[result.type]}
                  </span>
                  <h3 className="text-2xl font-bold text-[#5C4033] break-words">{result.clientName}</h3>
                  {result.title && (
                    <p className="text-sm font-bold text-[#8B5E3C] mt-1 bg-[#F9F5F0] px-2 py-0.5 rounded w-fit">
                      {result.title}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end pl-2">
                  <p className="text-[10px] font-bold text-[#D6C0B3] uppercase tracking-widest mb-2">目前狀態</p>
                  <div className="bg-[#F9F5F0] px-4 py-3 rounded-2xl border border-[#E6DCC3] shadow-sm whitespace-nowrap">
                    <p className="text-lg md:text-xl font-bold text-[#BC4A3C] leading-none">
                      {STEPS[result.type][result.status].label}
                    </p>
                  </div>
                </div>
              </div>

              <ProgressBar type={result.type} currentStatus={result.status} />

              <div className="bg-[#F9F5F0] p-5 rounded-xl border border-dashed border-[#D6C0B3] mt-4">
                <p className="text-sm font-bold text-[#A67C52] mb-3 uppercase tracking-tighter">製作備註：</p>
                <p className="text-base text-[#5C4033] italic font-medium leading-relaxed whitespace-pre-line">
                  {result.productionNote || "申請審核中..."}
                </p>
              </div>

              {result.deliveryUrl && (
                <div className="mt-6">
                  <a 
                    href={result.deliveryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#BC4A3C] hover:bg-[#A33E32] text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-bold shadow-lg shadow-[#BC4A3C]/20"
                  >
                    <ExternalLink size={20} />
                    <span>點此領取完成檔案 (Google Drive)</span>
                  </a>
                  <p className="text-center text-[10px] text-[#A67C52] mt-3 font-bold opacity-60">
                    檔案將保留一段時間，請盡快下載保存喔！
                  </p>
                </div>
              )}
            </div>
          ))}

          {hasSearched && searchResults && searchResults.length === 0 && (
            <div className="text-center p-12 text-[#D6C0B3] animate-pulse bg-white rounded-3xl border-2 border-dashed border-[#E6DCC3] font-medium">
              找不到這個暱稱呢，請檢查輸入是否正確喔 🥺
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- PORTFOLIO VIEW ---
  if (mode === 'PORTFOLIO') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative min-h-[60vh]">
        <button 
          onClick={() => setMode('MENU')}
          className="flex items-center gap-2 text-[#A67C52] hover:text-[#5C4033] font-bold text-sm transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          返回首頁
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-[#E6DCC3] rounded-full mb-4 text-[#8B5E3C]">
            <Image size={24} />
          </div>
          <h2 className="text-3xl font-bold text-[#5C4033] mb-2">作品集欣賞</h2>
          <p className="text-[#8B5E3C] font-medium">請選擇您想觀看的作品類型</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <a 
              href="https://www.instagram.com/jx3_li.shen?igsh=MmRjcDh5eHVndDUx&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-2xl shadow-lg shadow-[#A67C52]/10 border border-[#E6DCC3] hover:border-[#BC4A3C] transition-all hover:-translate-y-1 flex items-center gap-5 relative overflow-hidden"
            >
                <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <Camera size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#5C4033] mb-1 group-hover:text-[#BC4A3C] transition-colors">截圖作品集</h3>
                    <p className="text-xs text-[#A67C52] font-medium opacity-80 flex items-center gap-1">
                       Instagram @jx3_li.shen
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F9F5F0] flex items-center justify-center text-[#D6C0B3] group-hover:text-[#BC4A3C] group-hover:bg-[#FFF5F5] transition-all">
                   <ExternalLink size={20} />
                </div>
            </a>

            <a 
              href="https://www.instagram.com/shenli_acrylic?igsh=Mng0c3JxZW9paHFu&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer" 
              className="group bg-white p-6 rounded-2xl shadow-lg shadow-[#A67C52]/10 border border-[#E6DCC3] hover:border-[#BC4A3C] transition-all hover:-translate-y-1 flex items-center gap-5 relative overflow-hidden"
            >
                <div className="w-16 h-16 bg-orange-50 text-[#A67C52] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#5C4033] mb-1 group-hover:text-[#BC4A3C] transition-colors">流麻作品集</h3>
                    <p className="text-xs text-[#A67C52] font-medium opacity-80 flex items-center gap-1">
                       Instagram @shenli_acrylic
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F9F5F0] flex items-center justify-center text-[#D6C0B3] group-hover:text-[#BC4A3C] group-hover:bg-[#FFF5F5] transition-all">
                   <ExternalLink size={20} />
                </div>
            </a>
        </div>
      </div>
    );
  }

  // --- REQUEST VIEW ---
  if (mode === 'REQUEST' && onRequestSubmit) {
    return (
      <RequestForm 
        initialType={requestType}
        onClose={() => setMode('MENU')} 
        onSubmit={onRequestSubmit} 
      />
    );
  }

  return null;
};

export default ClientView;
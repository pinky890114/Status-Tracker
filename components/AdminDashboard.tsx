import React, { useState } from 'react';
import { Plus, LogOut, UserCircle, ClipboardList, Camera, Trash2, Mail, MessageSquare, Calendar, Image as ImageIcon, Save, Edit2, Lock, Power, PowerOff, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { AdminUser, Commission, CommissionFormData } from '../types';
import { STEPS } from '../constants';
import CommissionForm from './CommissionForm';
import GalleryManager from './GalleryManager';
import RevenueStats from './RevenueStats';

interface AdminDashboardProps {
  currentAdmin: AdminUser;
  commissions: Commission[];
  isAcceptingCommissions: boolean;
  onToggleAccepting: () => void;
  onLogout: () => void;
  onBackToClient: () => void;
  onAdd: (data: CommissionFormData) => Promise<void>;
  onUpdate: (id: string, data: CommissionFormData) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: number) => void;
  onUpdateProductionNote: (id: string, note: string) => void;
  onUpdateDeadline?: (id: string, deadline: string) => void;
  onUpdateDeliveryUrl?: (id: string, url: string) => void;
}

const GALLERY_PRODUCTS = [
  { id: 'S_RAW', name: '顯卡直出', category: '截圖' },
  { id: 'S_AVATAR', name: '頭貼', category: '截圖' },
  { id: 'S_ID_9_16', name: '證件照', category: '截圖' },
  { id: 'S_OIL_ID', name: '油畫風證件照', category: '截圖' },
  { id: 'S_WALL_MOBILE', name: '手機桌布', category: '截圖' },
  { id: 'S_WALL_PC', name: '電腦桌布', category: '截圖' },
  { id: 'S_EYE_BAR', name: '眼睛條', category: '截圖' },
  { id: 'S_COLLAGE_2', name: '2格出框', category: '截圖' },
  { id: 'S_COLLAGE_3', name: '3格出框', category: '截圖' },
  { id: 'S_FILM', name: '底片', category: '截圖' },
  { id: 'S_PERIPHERAL', name: '周邊設卡', category: '截圖' },
  { id: 'S_DUO_ID', name: '雙人證件照', category: '截圖' },
  { id: 'S_DUO_PC', name: '雙人電腦桌布', category: '截圖' },
  { id: 'F_CARD', name: '名片流麻', category: '流麻' },
  { id: 'F_CHARM', name: '吊飾流麻', category: '流麻' },
  { id: 'F_CUSTOM', name: '客製化指定', category: '流麻' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentAdmin, 
  commissions, 
  isAcceptingCommissions,
  onToggleAccepting,
  onLogout, 
  onBackToClient,
  onAdd, 
  onUpdate,
  onDelete, 
  onUpdateStatus,
  onUpdateProductionNote,
  onUpdateDeadline,
  onUpdateDeliveryUrl
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [activeTab, setActiveTab] = useState<'commissions' | 'galleries' | 'revenue'>('commissions');
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>(GALLERY_PRODUCTS[0].id);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'FLOWING_SAND' | 'SCREENSHOT'>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'createdAt'>('deadline');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [editingDeadlineText, setEditingDeadlineText] = useState<string>('');
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [editingDeliveryUrl, setEditingDeliveryUrl] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // For single-user mode, we show ALL commissions regardless of ownerId
  const filteredCommissions = commissions.filter(c => {
    const statusIdx = Math.min(c.status, STEPS[c.type].length - 1);
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || STEPS[c.type][statusIdx].label === statusFilter;
    return matchesType && matchesStatus;
  });

  // Sort logic based on sortBy state
  filteredCommissions.sort((a, b) => {
    const aStatusIdx = Math.min(a.status, STEPS[a.type].length - 1);
    const bStatusIdx = Math.min(b.status, STEPS[b.type].length - 1);
    const aIsDelivered = STEPS[a.type][aStatusIdx].label === '已交付';
    const bIsDelivered = STEPS[b.type][bStatusIdx].label === '已交付';

    // Delivered items always go to the bottom
    if (aIsDelivered && !bIsDelivered) return 1;
    if (!aIsDelivered && bIsDelivered) return -1;

    if (sortBy === 'deadline') {
      if (a.deadline && b.deadline) {
        if (a.deadline === b.deadline) {
          return (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0);
        }
        return a.deadline.localeCompare(b.deadline);
      }
      if (a.deadline) return -1; // a has deadline, b doesn't -> a comes first
      if (b.deadline) return 1;  // b has deadline, a doesn't -> b comes first
      return (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0);
    } else {
      // Sort by createdAt (newest first)
      return (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0);
    }
  });

  const handleAddSubmit = async (data: CommissionFormData) => {
    await onAdd(data);
    setIsAdding(false);
  };

  const handleEditSubmit = async (data: CommissionFormData) => {
    if (editingCommission) {
      await onUpdate(editingCommission.id, data);
      setEditingCommission(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-2xl border border-[#E6DCC3] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6DCC3] text-[#8B5E3C] p-2.5 rounded-xl">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#A67C52] uppercase tracking-widest mb-1">目前登入老師</p>
            <h2 className="text-2xl font-bold text-[#5C4033] leading-tight">{currentAdmin.name} 的後台</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onToggleAccepting}
            className={`flex items-center gap-2 text-base px-4 py-3 rounded-xl transition-all shadow-md font-bold ${
              isAcceptingCommissions 
                ? 'bg-[#34A853] text-white hover:bg-[#2E9349] shadow-[#34A853]/20' 
                : 'bg-[#D6C0B3] text-white hover:bg-[#C2A898] shadow-[#D6C0B3]/20'
            }`}
            title={isAcceptingCommissions ? "目前開啟接單中，點擊關閉" : "目前暫停接單，點擊開啟"}
          >
            {isAcceptingCommissions ? <Power size={20} /> : <PowerOff size={20} />}
            {isAcceptingCommissions ? '接單中' : '暫停接單'}
          </button>
          <button 
            onClick={onBackToClient}
            className="flex items-center justify-center w-12 h-12 bg-[#F9F5F0] text-[#8B5E3C] rounded-xl hover:bg-[#E6DCC3] transition-all border border-[#E6DCC3] group"
            title="返回前台"
          >
            <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center w-12 h-12 bg-[#F9F5F0] text-[#D6C0B3] rounded-xl hover:bg-[#E6DCC3] hover:text-red-500 transition-all border border-[#E6DCC3] group"
            title="登出"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => { setActiveTab('commissions'); setIsAdding(true); setEditingCommission(null); }}
            className="flex items-center gap-2 text-base bg-[#BC4A3C] text-white px-6 py-3 rounded-xl hover:bg-[#A33E32] transition-all shadow-md shadow-[#BC4A3C]/20 font-bold"
          >
            <Plus size={20} /> 建立委託
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-[#E6DCC3] shadow-sm overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex-1 min-w-[120px] py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'commissions' 
              ? 'bg-[#F9F5F0] text-[#8B5E3C] shadow-sm' 
              : 'text-[#A67C52] hover:bg-[#F9F5F0]/50'
          }`}
        >
          <ClipboardList size={20} /> 委託管理
        </button>
        <button
          onClick={() => setActiveTab('galleries')}
          className={`flex-1 min-w-[120px] py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'galleries' 
              ? 'bg-[#F9F5F0] text-[#8B5E3C] shadow-sm' 
              : 'text-[#A67C52] hover:bg-[#F9F5F0]/50'
          }`}
        >
          <ImageIcon size={20} /> 作品集管理
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex-1 min-w-[120px] py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'revenue' 
              ? 'bg-[#F9F5F0] text-[#8B5E3C] shadow-sm' 
              : 'text-[#A67C52] hover:bg-[#F9F5F0]/50'
          }`}
        >
          <TrendingUp size={20} /> 營收統計
        </button>
      </div>

      {activeTab === 'revenue' && (
        <RevenueStats commissions={commissions} />
      )}

      {activeTab === 'commissions' && (
        <>
          {isAdding && (
            <CommissionForm 
              currentAdmin={currentAdmin} 
              onClose={() => setIsAdding(false)} 
              onSubmit={handleAddSubmit} 
            />
          )}

          {editingCommission && (
            <CommissionForm 
              key={editingCommission.id}
              currentAdmin={currentAdmin} 
              initialData={editingCommission}
              onClose={() => setEditingCommission(null)} 
              onSubmit={handleEditSubmit} 
            />
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
            <div className="flex gap-3">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-colors ${
                  typeFilter === 'ALL'
                    ? 'bg-[#BC4A3C] text-white shadow-md'
                    : 'bg-white text-[#8B5E3C] border border-[#E6DCC3] hover:bg-[#F9F5F0]'
                }`}
              >
                全部委託
              </button>
              <button
                onClick={() => setTypeFilter('FLOWING_SAND')}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-colors ${
                  typeFilter === 'FLOWING_SAND'
                    ? 'bg-[#BC4A3C] text-white shadow-md'
                    : 'bg-white text-[#8B5E3C] border border-[#E6DCC3] hover:bg-[#F9F5F0]'
                }`}
              >
                流麻委託
              </button>
              <button
                onClick={() => setTypeFilter('SCREENSHOT')}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-colors ${
                  typeFilter === 'SCREENSHOT'
                    ? 'bg-[#BC4A3C] text-white shadow-md'
                    : 'bg-white text-[#8B5E3C] border border-[#E6DCC3] hover:bg-[#F9F5F0]'
                }`}
              >
                截圖委託
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-[#E6DCC3] rounded-xl px-4 py-2 shadow-sm">
                <span className="text-sm font-bold text-[#A67C52]">進度篩選:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-[#5C4033] font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="ALL">全部進度</option>
                  {/* Get unique labels from both types */}
                  {Array.from(new Set([
                    ...STEPS.FLOWING_SAND.map(s => s.label),
                    ...STEPS.SCREENSHOT.map(s => s.label)
                  ])).map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-[#E6DCC3] rounded-xl px-4 py-2 shadow-sm">
                <span className="text-sm font-bold text-[#A67C52]">排序方式:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'deadline' | 'createdAt')}
                  className="bg-transparent text-[#5C4033] font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="deadline">按截稿日期 (最近優先)</option>
                  <option value="createdAt">按建立日期 (最新優先)</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of commissions */}
      <div className="space-y-5">
        <p className="text-base font-bold text-[#A67C52] tracking-widest uppercase px-1">所有委託項目 ({filteredCommissions.length})</p>

        {filteredCommissions.length === 0 && !isAdding && (
          <div className="text-center py-20 text-[#D6C0B3] border-4 border-dashed border-[#E6DCC3] bg-white rounded-[2.5rem] flex flex-col items-center justify-center gap-2">
            <ClipboardList size={40} className="text-[#E6DCC3]" />
            <p className="font-bold">目前還沒有委託紀錄喔</p>
            <p className="text-xs">請點選上方「建立委託」或是等待委託人提交申請</p>
          </div>
        )}
        
        {filteredCommissions.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-[#E6DCC3] shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#A67C52] relative group">
            
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-1 transition-colors ${item.type === 'FLOWING_SAND' ? 'bg-[#F9F5F0] text-[#A67C52]' : 'bg-indigo-50 text-indigo-400'}`}>
                  {item.type === 'FLOWING_SAND' ? <ClipboardList size={22} /> : <Camera size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#5C4033] text-2xl">{item.clientName}</h4>
                    {/* Type Badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      item.type === 'FLOWING_SAND' ? 'bg-[#A67C52] text-white' : 'bg-indigo-400 text-white'
                    }`}>
                      {item.type === 'FLOWING_SAND' ? '流麻' : '截圖'}
                    </span>
                    {/* New Request Badge */}
                    {item.status === 0 && item.description && (
                        <span className="bg-[#BC4A3C] text-white text-xs px-2.5 py-1 rounded-full font-bold">新申請</span>
                    )}
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditingCommission(item);
                        setIsAdding(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-1.5 text-[#A67C52] hover:bg-[#F9F5F0] rounded-lg transition-colors"
                      title="編輯委託"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                  {item.title && (
                    <div className="text-sm font-bold text-[#8B5E3C] mt-1 bg-[#F9F5F0] px-2 py-0.5 rounded w-fit">
                      {item.title}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-[#D6C0B3] uppercase tracking-widest mt-1">
                     <span>ID: {item.clientId}</span>
                     
                     {/* Created At / Order Date */}
                     {item.createdAt && (
                       <>
                         <span>•</span>
                         <span className="flex items-center gap-1 text-[#A67C52]" title="下單日期">
                           <Calendar size={14} />
                           {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                         </span>
                       </>
                     )}

                     {item.price !== undefined && item.price > 0 && (
                       <>
                         <span>•</span>
                         <span className="text-[#A67C52]">${item.price}</span>
                       </>
                     )}

                     {/* Deadline */}
                     <div className="flex items-center gap-1">
                       <span>•</span>
                       {editingDeadlineId === item.id ? (
                         <div className="flex items-center gap-2">
                           <input 
                             type="date"
                             className="border border-[#E6DCC3] rounded px-2 py-0.5 text-xs text-[#5C4033] outline-none"
                             value={editingDeadlineText}
                             onChange={(e) => setEditingDeadlineText(e.target.value)}
                           />
                           <button 
                             onClick={() => {
                               if (onUpdateDeadline) {
                                 onUpdateDeadline(item.id, editingDeadlineText);
                               }
                               setEditingDeadlineId(null);
                             }}
                             className="text-white bg-[#BC4A3C] px-2 py-0.5 rounded text-xs hover:bg-[#A33E32]"
                           >
                             儲存
                           </button>
                           <button 
                             onClick={() => setEditingDeadlineId(null)}
                             className="text-[#D6C0B3] hover:text-[#A67C52] text-xs"
                           >
                             取消
                           </button>
                         </div>
                       ) : (
                         <span 
                           className="flex items-center gap-1 text-[#BC4A3C] cursor-pointer hover:underline" 
                           title="點擊編輯截止日期"
                           onClick={() => {
                             setEditingDeadlineId(item.id);
                             setEditingDeadlineText(item.deadline || '');
                           }}
                         >
                           <Clock size={14} />
                           {item.deadline || '設定截止日'}
                         </span>
                       )}
                     </div>
                  </div>
                  
                  {/* Private Contact Info (Only visible to Admin) */}
                  {item.contactInfo && (
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#8B5E3C] bg-[#F9F5F0] px-3 py-1.5 rounded-lg w-fit">
                       <Mail size={14} className="text-[#A67C52]" />
                       {item.contactInfo}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delete Button - Fixed: Added z-10, stopPropagation, and cursor-pointer */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  e.preventDefault();
                  setDeletingId(item.id);
                }}
                className="relative z-10 shrink-0 p-3 bg-white text-[#D6C0B3] hover:text-white hover:bg-red-400 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-400 hover:shadow-red-200 cursor-pointer active:scale-90"
                title="刪除"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Private Description (Only visible to Admin) */}
            {item.description && (
              <div className="mb-4 bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3]">
                 <p className="text-sm font-bold text-[#A67C52] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MessageSquare size={14} /> 客戶需求備註
                 </p>
                 <p className="text-base text-[#5C4033] leading-relaxed whitespace-pre-line">
                    {item.description}
                 </p>
              </div>
            )}

            {/* Production Note (Editable by Admin) */}
            <div className="mb-4 bg-white p-4 rounded-xl border border-[#E6DCC3] shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-[#A67C52] uppercase tracking-widest flex items-center gap-1.5">
                  <Edit2 size={14} /> 製作備註
                </p>
                {editingNoteId === item.id ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="text-sm font-bold text-[#D6C0B3] hover:text-[#A67C52]"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        onUpdateProductionNote(item.id, editingNoteText);
                        setEditingNoteId(null);
                      }}
                      className="text-sm font-bold text-white bg-[#BC4A3C] px-3 py-1.5 rounded hover:bg-[#A33E32] flex items-center gap-1"
                    >
                      <Save size={14} /> 儲存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingNoteId(item.id);
                      setEditingNoteText(item.productionNote || '');
                    }}
                    className="text-sm font-bold text-[#8B5E3C] hover:text-[#BC4A3C] flex items-center gap-1"
                  >
                    <Edit2 size={14} /> 編輯
                  </button>
                )}
              </div>
              {editingNoteId === item.id ? (
                <textarea
                  className="w-full border border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-lg p-3 text-base transition-all outline-none font-medium text-[#5C4033]"
                  rows={3}
                  value={editingNoteText}
                  onChange={(e) => setEditingNoteText(e.target.value)}
                  placeholder="輸入製作備註..."
                />
              ) : (
                <p className="text-base text-[#5C4033] leading-relaxed whitespace-pre-line">
                  {item.productionNote || <span className="text-[#D6C0B3] italic">無備註</span>}
                </p>
              )}
            </div>

            {/* Delivery URL (Editable by Admin) */}
            <div className="mb-4 bg-white p-4 rounded-xl border border-[#E6DCC3] shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-[#A67C52] uppercase tracking-widest flex items-center gap-1.5">
                  <ExternalLink size={14} /> 交付檔案 (Google Drive 連結)
                </p>
                {editingDeliveryId === item.id ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingDeliveryId(null)}
                      className="text-sm font-bold text-[#D6C0B3] hover:text-[#A67C52]"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateDeliveryUrl) {
                          onUpdateDeliveryUrl(item.id, editingDeliveryUrl);
                        }
                        setEditingDeliveryId(null);
                      }}
                      className="text-sm font-bold text-white bg-[#BC4A3C] px-3 py-1.5 rounded hover:bg-[#A33E32] flex items-center gap-1"
                    >
                      <Save size={14} /> 儲存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingDeliveryId(item.id);
                      setEditingDeliveryUrl(item.deliveryUrl || '');
                    }}
                    className="text-sm font-bold text-[#8B5E3C] hover:text-[#BC4A3C] flex items-center gap-1"
                  >
                    <Edit2 size={14} /> 編輯
                  </button>
                )}
              </div>
              {editingDeliveryId === item.id ? (
                <input
                  type="url"
                  className="w-full border border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#A67C52] rounded-lg p-3 text-base transition-all outline-none font-medium text-[#5C4033]"
                  value={editingDeliveryUrl}
                  onChange={(e) => setEditingDeliveryUrl(e.target.value)}
                  placeholder="貼上 Google Drive 連結..."
                />
              ) : (
                <div className="flex items-center gap-2">
                  {item.deliveryUrl ? (
                    <a 
                      href={item.deliveryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#BC4A3C] font-bold hover:underline flex items-center gap-1 break-all"
                    >
                      <ExternalLink size={14} /> {item.deliveryUrl}
                    </a>
                  ) : (
                    <span className="text-[#D6C0B3] italic">尚未交付檔案</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-bold text-[#A67C52] mb-1 px-1 uppercase tracking-tighter">
                <span>目前進度：{STEPS[item.type][Math.min(item.status, STEPS[item.type].length - 1)].label}</span>
                <span className="text-[#BC4A3C] font-bold text-base">{Math.round(((Math.min(item.status, STEPS[item.type].length - 1) + 1)/STEPS[item.type].length)*100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max={STEPS[item.type].length - 1}
                value={item.status}
                onChange={(e) => onUpdateStatus(item.id, parseInt(e.target.value))}
                className="w-full h-2 bg-[#E6DCC3] rounded-lg appearance-none cursor-pointer accent-[#BC4A3C]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal (Moved outside the list) */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#5C4033] mb-2">確定刪除？</h3>
            <p className="text-[#8B5E3C] mb-6">確定要刪除這筆委託嗎？此動作無法復原。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl font-bold text-[#A67C52] hover:bg-[#F9F5F0] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDelete(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
      
      {activeTab === 'galleries' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {GALLERY_PRODUCTS.map(product => (
              <button
                key={product.id}
                onClick={() => setSelectedGalleryId(product.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  selectedGalleryId === product.id
                    ? 'bg-[#BC4A3C] text-white shadow-md'
                    : 'bg-white text-[#8B5E3C] border border-[#E6DCC3] hover:bg-[#F9F5F0]'
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>

          {selectedGalleryId && (
            <GalleryManager 
              productId={selectedGalleryId} 
              productName={GALLERY_PRODUCTS.find(p => p.id === selectedGalleryId)?.name || ''} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
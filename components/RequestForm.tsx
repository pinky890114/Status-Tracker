import React, { useState } from 'react';
import { X, Send, Sparkles, Loader2, AlertCircle, ScrollText, CheckSquare, Square, ArrowRight, Package, Check, Minus, Plus, Coins, MessageSquare, CheckCircle2, ArrowLeft, Grid, Info, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { CommissionFormData, CommissionType } from '../types';
import GalleryViewer from './GalleryViewer';

interface RequestFormProps {
  onClose: () => void;
  onSubmit: (data: CommissionFormData) => Promise<void>;
  initialType?: CommissionType;
}

// Define Screenshot Products Configuration
const SCREENSHOT_PRODUCTS = [
  { id: 'S_RAW', label: '顯卡直出', price: 25 },
  { id: 'S_AVATAR', label: '頭貼', sub: '（可加ID）', price: 30 },
  { id: 'S_ID_9_16', label: '證件照', price: 30 },
  { id: 'S_OIL_ID', label: '油畫風證件照', price: 30 },
  { id: 'S_WALL_MOBILE', label: '手機桌布', sub: '（人像風/意境風）', price: 30 },
  { id: 'S_WALL_PC', label: '電腦桌布', sub: '（人像風/意境風）', price: 40 },
  { id: 'S_EYE_BAR', label: '眼睛條', price: 60 },
  { id: 'S_COLLAGE_2', label: '2格出框', price: 80 },
  { id: 'S_COLLAGE_3', label: '3格出框', price: 200 },
  { id: 'S_FILM', label: '底片', price: 250 },
  { id: 'S_PERIPHERAL', label: '周邊設卡', price: 250 },
  { id: 'S_DUO_ID', label: '雙人證件照', price: 40 },
  { id: 'S_DUO_PC', label: '雙人電腦桌布', price: 50 },
  { id: 'S_BADGE', label: '實體徽章', price: 20, isAddon: true },
  { id: 'S_LASER_SINGLE', label: '雷射票（單面）', price: 60, isAddon: true },
  { id: 'S_LASER_DOUBLE', label: '雷射票（雙面）', price: 100, isAddon: true },
  { id: 'S_LASER_EYE', label: '眼睛逆向雷射票', price: 100, isAddon: true },
  { id: 'S_SHIKISHI', label: '色紙', price: 80, isAddon: true },
];

const COLLAGE_2_OPTIONS = [
  '是，已儲存雲端預設外觀。',
  '店主搭—2格同外觀',
  '店主搭—2格不同外觀'
];

const COLLAGE_3_OPTIONS = [
  '是，已儲存雲端預設外觀。',
  '店主搭—3格同外觀',
  '店主搭—3格不同外觀'
];

// Visual Gallery Data for Step 1
const FLOWING_SAND_GALLERY = [
    {
        id: "F_CARD",
        title: "名片流麻",
        size: "7 x 10 cm",
        tiers: [
            { name: "盲盒款", price: 490 },
            { name: "指定色系", price: 600 },
            { name: "全客製化", price: 990 }
        ],
        icon: <LayoutGrid size={48} className="opacity-50" />
    },
    {
        id: "F_CHARM",
        title: "角色吊飾",
        size: "4 x 7 cm",
        tiers: [
            { name: "盲盒款", price: 350 },
            { name: "指定色系", price: 450 },
            { name: "全客製化", price: 700 }
        ],
        icon: <Package size={48} className="opacity-50" />
    }
];

const SAND_PRODUCTS: Array<{ id: string, label: string, price: number, isAddon?: boolean }> = [
  { id: 'F_CARD_BLIND', label: '名片流麻 (盲盒款)', price: 490 },
  { id: 'F_CARD_COLOR', label: '名片流麻 (指定色系)', price: 600 },
  { id: 'F_CARD_CUSTOM', label: '名片流麻 (全客製化)', price: 990 },
  { id: 'F_CHARM_BLIND', label: '角色吊飾 (盲盒款)', price: 350 },
  { id: 'F_CHARM_COLOR', label: '角色吊飾 (指定色系)', price: 450 },
  { id: 'F_CHARM_CUSTOM', label: '角色吊飾 (全客製化)', price: 700 },
  { id: 'F_STAND', label: '流麻展示架', price: 20, isAddon: true },
];

const RequestForm: React.FC<RequestFormProps> = ({ onClose, onSubmit, initialType = 'FLOWING_SAND' }) => {
  const isScreenshot = initialType === 'SCREENSHOT';

  // Steps: 0 = Guidelines, 1 = Price Menu, 2 = Form
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [hasAgreed, setHasAgreed] = useState(false);

  // State for Flowing Sand Quantities
  const [sandItems, setSandItems] = useState<Record<string, number>>({});

  // State for Screenshot Quantities (Dynamic based on ID)
  const [screenshotQuantities, setScreenshotQuantities] = useState<Record<string, number>>({});

  // State for Client Remarks (Screenshot only)
  const [clientRemark, setClientRemark] = useState('');

  // Special State for "2格出框拼貼" (S_COLLAGE_2) Options
  const [showCollage2Modal, setShowCollage2Modal] = useState(false);
  const [collage2Option, setCollage2Option] = useState<string>('');

  // Special State for "3格出框拼貼" (S_COLLAGE_3) Options
  const [showCollage3Modal, setShowCollage3Modal] = useState(false);
  const [collage3Option, setCollage3Option] = useState<string>('');

  const [formData, setFormData] = useState<CommissionFormData>({
    ownerId: 'Main_Artist',
    clientName: '',
    contactInfo: '',
    type: isScreenshot ? 'SCREENSHOT' : 'FLOWING_SAND',
    status: 0,
    note: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<{ id: string, name: string } | null>(null);

  // Calculate Total Price
  let totalPrice = 0;
  if (isScreenshot) {
    totalPrice = SCREENSHOT_PRODUCTS.reduce((acc, product) => {
      const qty = screenshotQuantities[product.id] || 0;
      return acc + (qty * product.price);
    }, 0);
  } else {
    totalPrice = SAND_PRODUCTS.reduce((acc, product) => {
      const qty = sandItems[product.id] || 0;
      return acc + (qty * product.price);
    }, 0);
  }

  // Helper to update Flowing Sand quantity
  const updateSandQuantity = (id: string, delta: number) => {
    setSandItems(prev => {
      const current = prev[id] || 0;
      const newVal = Math.max(0, current + delta);
      return { ...prev, [id]: newVal };
    });
  };

  // Helper to toggle Flowing Sand selection
  const toggleSandProduct = (id: string) => {
    setSandItems(prev => {
      const current = prev[id] || 0;
      const newVal = current > 0 ? 0 : 1;
      return { ...prev, [id]: newVal };
    });
  };

  // Helper to update Screenshot quantity
  const updateScreenshotQuantity = (id: string, delta: number) => {
    setScreenshotQuantities(prev => {
      const current = prev[id] || 0;
      const newVal = Math.max(0, current + delta);
      
      // Trigger modal for S_COLLAGE_2
      if (id === 'S_COLLAGE_2' && current === 0 && newVal > 0) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_2' && newVal === 0) setCollage2Option('');

      // Trigger modal for S_COLLAGE_3
      if (id === 'S_COLLAGE_3' && current === 0 && newVal > 0) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_3' && newVal === 0) setCollage3Option('');

      return { ...prev, [id]: newVal };
    });
  };

  const toggleScreenshotProduct = (id: string) => {
    setScreenshotQuantities(prev => {
      const current = prev[id] || 0;
      const newVal = current > 0 ? 0 : 1;
      
      // Trigger modal for S_COLLAGE_2
      if (id === 'S_COLLAGE_2' && newVal === 1) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_2' && newVal === 0) setCollage2Option('');

      // Trigger modal for S_COLLAGE_3
      if (id === 'S_COLLAGE_3' && newVal === 1) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_3' && newVal === 0) setCollage3Option('');

      return { ...prev, [id]: newVal };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.clientName.trim() || !formData.contactInfo?.trim()) {
      setError("請填寫所有必填欄位 (您的暱稱、聯絡方式)");
      return;
    }

    if (totalPrice === 0) {
      setError("請至少選擇一種商品");
      return;
    }

    // Check if S_COLLAGE_2 is selected but option is missing
    if (screenshotQuantities['S_COLLAGE_2'] > 0 && !collage2Option) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
        return;
    }

    // Check if S_COLLAGE_3 is selected but option is missing
    if (screenshotQuantities['S_COLLAGE_3'] > 0 && !collage3Option) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
        return;
    }

    setIsSubmitting(true);
    try {
      const autoClientId = `REQ-${Date.now().toString().slice(-4)}`;
      let itemsList: string[] = [];

      if (isScreenshot) {
         SCREENSHOT_PRODUCTS.forEach(p => {
            const qty = screenshotQuantities[p.id] || 0;
            if (qty > 0) {
               let itemLine = `- ${p.label} x ${qty} ($${p.price * qty})`;
               // Append S_COLLAGE_2 Option
               if (p.id === 'S_COLLAGE_2' && collage2Option) {
                 itemLine += `\n   └── 外觀選項：${collage2Option}`;
               }
               // Append S_COLLAGE_3 Option
               if (p.id === 'S_COLLAGE_3' && collage3Option) {
                 itemLine += `\n   └── 外觀選項：${collage3Option}`;
               }
               itemsList.push(itemLine);
            }
         });
      } else {
         SAND_PRODUCTS.forEach(p => {
            const qty = sandItems[p.id] || 0;
            if (qty > 0) {
               itemsList.push(`- ${p.label} x ${qty} (單價$${p.price})`);
            }
         });
      }
      
      const itemsText = itemsList.join('\n');
      let finalDescription = `【選擇商品】：\n${itemsText}`;

      // Append Client Remark if exists
      if (clientRemark.trim()) {
        finalDescription += `\n\n【備註需求】：\n${clientRemark.trim()}`;
      }

      await onSubmit({
        ...formData,
        clientId: autoClientId,
        type: isScreenshot ? 'SCREENSHOT' : 'FLOWING_SAND', 
        status: 0,
        note: '申請審核中...',
        description: finalDescription,
        price: totalPrice
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("發送失敗，請檢查網路連線。");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-[#E6DCC3] transform scale-100">
          <div className="w-16 h-16 bg-[#F2EFE9] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#5C4033] mb-2">申請已送出！</h3>
          <p className="text-[#8B5E3C] font-medium">請等待老師確認您的需求。<br/>您之後可以用暱稱查詢進度。</p>
        </div>
      </div>
    );
  }

  // --- COLLAGE 2 OPTION MODAL ---
  if (showCollage2Modal) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-[#E6DCC3] transform scale-100 animate-in zoom-in-95">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#F9F5F0] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#5C4033]">是否指定外觀？</h3>
            <p className="text-xs text-[#A67C52] mt-1">針對「2格出框拼貼」的外觀設定</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {COLLAGE_2_OPTIONS.map((opt) => (
              <label 
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  collage2Option === opt 
                    ? 'border-[#BC4A3C] bg-[#FFF5F5]' 
                    : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  collage2Option === opt ? 'border-[#BC4A3C]' : 'border-[#D6C0B3]'
                }`}>
                  {collage2Option === opt && <div className="w-2.5 h-2.5 bg-[#BC4A3C] rounded-full" />}
                </div>
                <span className={`text-sm font-bold ${collage2Option === opt ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                  {opt}
                </span>
                <input 
                  type="radio" 
                  name="collage2Option" 
                  value={opt} 
                  checked={collage2Option === opt} 
                  onChange={() => setCollage2Option(opt)}
                  className="hidden" 
                />
              </label>
            ))}

            <div className="p-3 bg-[#FFF5F5] border border-[#BC4A3C]/20 rounded-xl">
               <p className="text-xs text-[#BC4A3C] font-bold leading-relaxed">
                 * 出框外觀以同色系為主，沒有同色系建議穿同一件就好。
               </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCollage2Modal(false)}
            className="w-full py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 active:scale-95 transition-all hover:bg-[#A33E32]"
          >
            確認選擇
          </button>
        </div>
      </div>
    );
  }

  // --- COLLAGE 3 OPTION MODAL ---
  if (showCollage3Modal) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-[#E6DCC3] transform scale-100 animate-in zoom-in-95">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#F9F5F0] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#5C4033]">是否指定外觀？</h3>
            <p className="text-xs text-[#A67C52] mt-1">針對「3格出框拼貼」的外觀設定</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {COLLAGE_3_OPTIONS.map((opt) => (
              <label 
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  collage3Option === opt 
                    ? 'border-[#BC4A3C] bg-[#FFF5F5]' 
                    : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  collage3Option === opt ? 'border-[#BC4A3C]' : 'border-[#D6C0B3]'
                }`}>
                  {collage3Option === opt && <div className="w-2.5 h-2.5 bg-[#BC4A3C] rounded-full" />}
                </div>
                <span className={`text-sm font-bold ${collage3Option === opt ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                  {opt}
                </span>
                <input 
                  type="radio" 
                  name="collage3Option" 
                  value={opt} 
                  checked={collage3Option === opt} 
                  onChange={() => setCollage3Option(opt)}
                  className="hidden" 
                />
              </label>
            ))}
            
            <div className="p-3 bg-[#FFF5F5] border border-[#BC4A3C]/20 rounded-xl">
               <p className="text-xs text-[#BC4A3C] font-bold leading-relaxed">
                 * 出框外觀以同色系為主，沒有同色系建議穿同一件就好。
               </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCollage3Modal(false)}
            className="w-full py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 active:scale-95 transition-all hover:bg-[#A33E32]"
          >
            確認選擇
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 0: GUIDELINES VIEW ---
  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          <div className="p-6 flex justify-between items-center shrink-0 bg-gradient-to-r from-[#F9F5F0] to-[#E6DCC3]">
            <div className="flex items-center gap-3">
              <div className="bg-white/60 p-2 rounded-xl shadow-sm">
                 <ScrollText className="text-[#A67C52]" size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-[#5C4033]">
                   {isScreenshot ? '截圖委託須知' : '流麻委託須知'}
                 </h3>
                 <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest">Guidelines</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#A67C52]">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar text-[#5C4033] space-y-4 text-sm leading-relaxed">
             <div className="bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3]">
               <h4 className="font-bold text-[#BC4A3C] mb-2 flex items-center gap-2">
                 <AlertCircle size={16} /> 注意事項
               </h4>
               
               {isScreenshot ? (
                 <ul className="list-decimal pl-5 space-y-3 marker:text-[#BC4A3C] marker:font-bold">
                   <li><strong>關於排單：</strong> 為了讓每個小可愛都能美美的拿到圖，店主很龜毛，出圖緩慢，可接受再排單。</li>
                   <li><strong>急單說明：</strong> 排不下去可以掛急單，或者是提前跟我說，初稿拍下去前都不算跑單。</li>
                   <li><strong>風格指定：</strong> 可指定風格外觀，沒有盲盒價，沒指定就是我挑。</li>
                   <li><strong>付款方式：</strong> 可金可T，幣值看社團當天最高幣值。</li>
                   <li><strong>修改次數：</strong> 截圖完成會先給初稿，構圖動作滿意才會進精修，可免費重截兩次。</li>
                   <li><strong>自備道具：</strong> 衣櫃比較空的寶寶們請在包包裡自備不同門派武器，雜貨店賣的就好。</li>
                   <li><strong>授權說明：</strong> 完成交易後會給雲端網址，原片和精修成片，請於一個月內下載完畢，原片可自行重製利用。成片默認可加水印放在作品集。</li>
                 </ul>
               ) : (
                 <ul className="list-disc pl-5 space-y-3 marker:text-[#D6C0B3]">
                   <li><strong>委託順序：</strong> 溝通訂單內容→匯款排單→溝通指定外觀→截圖→確認圖片→圖面分層→（效果討論）→（液態對色）→製作流麻本體→賣貨便交貨</li>
                   <li><strong>工期說明：</strong> 流麻的材料與圖面都是排單後現訂現送印，含材料等待工期約10~40個工作天，不接急單。</li>
                   <li><strong>關於修改：</strong> 截圖後可確認構圖外觀是否滿意，可免費修改一次，圖面分層後可確認分層是否有誤，開始只做流麻後不做任何修改。</li>
                   <li><strong>拍攝注意事項：</strong> 請先設定好稱號、名片徽章及頭像，並由我方上號截圖及名片UI，開號前請換好指定外觀、臉型，需留出一格已解鎖的可替換名片做去背使用。</li>
                   <li><strong>手作痕跡：</strong> 流麻為全手工製作，難免會有細微氣泡、膠痕或手工痕跡，完美主義者請三思後再委託，除臉上明顯氣泡或者邊緣縮膠嚴重不接受退貨。</li>
                   <li><strong>退款政策：</strong> 圖面分層確定後不接受因個人因素取消或退款。</li>
                 </ul>
               )}
             </div>
             <p className="text-xs text-[#8B5E3C] text-center mt-4">
               為保障雙方權益，請務必詳閱以上內容。
             </p>
          </div>

          <div className="p-4 border-t border-[#E6DCC3] bg-white shrink-0 space-y-4">
            <button 
              onClick={() => setHasAgreed(!hasAgreed)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#F9F5F0] transition-colors cursor-pointer group"
            >
              <div className={`transition-colors ${hasAgreed ? 'text-[#BC4A3C]' : 'text-[#D6C0B3] group-hover:text-[#A67C52]'}`}>
                {hasAgreed ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <span className="font-bold text-[#5C4033] text-sm">我已詳細閱讀並同意上述委託規範</span>
            </button>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-[#D6C0B3] hover:bg-[#F9F5F0] transition-colors text-sm"
              >
                取消
              </button>
              <button 
                onClick={() => setCurrentStep(1)}
                disabled={!hasAgreed}
                className="px-8 py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed hover:bg-[#A33E32]"
              >
                下一步
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: PRICE MENU VIEW (Visual Gallery) ---
  if (currentStep === 1) {
    return (
      <>
        {selectedGallery && (
          <GalleryViewer 
            productId={selectedGallery.id} 
            productName={selectedGallery.name} 
            onClose={() => setSelectedGallery(null)} 
          />
        )}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          <div className="p-6 flex justify-between items-center shrink-0 bg-gradient-to-r from-[#F9F5F0] to-[#E6DCC3]">
            <div className="flex items-center gap-3">
              <div className="bg-white/60 p-2 rounded-xl shadow-sm">
                 <Grid className="text-[#A67C52]" size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-[#5C4033]">
                   {isScreenshot ? '截圖價目表' : '流麻尺寸與價格'}
                 </h3>
                 <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest">Price List</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#A67C52]">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
             {isScreenshot ? (
                // Screenshot Simple List (Since there are too many items for a card grid)
                <div className="space-y-3">
                    <p className="text-[#A67C52] text-xs text-center mb-4 font-bold">✨ 以下為截圖委託參考價目 ✨</p>
                    <div className="grid grid-cols-1 gap-3">
                        {SCREENSHOT_PRODUCTS.filter(p => !p.isAddon).map((prod) => (
                             <div key={prod.id} className="bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3] flex justify-between items-center group">
                                 <div>
                                    <h4 className="text-[#5C4033] font-bold">{prod.label}</h4>
                                    {prod.sub && <p className="text-xs text-[#A67C52]">{prod.sub}</p>}
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <button 
                                        onClick={() => setSelectedGallery({ id: prod.id, name: prod.label })}
                                        className="text-[#8B5E3C] hover:text-[#BC4A3C] transition-colors flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 focus:opacity-100"
                                     >
                                        <ImageIcon size={16} /> 作品集
                                     </button>
                                     <span className="text-[#BC4A3C] font-bold text-lg">${prod.price}</span>
                                 </div>
                             </div>
                        ))}
                    </div>
                    
                    <p className="text-[#A67C52] text-xs text-center mt-6 mb-4 font-bold">✨ 加購選項 ✨</p>
                    <div className="grid grid-cols-1 gap-3">
                        {SCREENSHOT_PRODUCTS.filter(p => p.isAddon).map((prod) => (
                             <div key={prod.id} className="bg-white p-4 rounded-xl border border-dashed border-[#E6DCC3] flex justify-between items-center">
                                 <div>
                                    <h4 className="text-[#5C4033] font-bold">{prod.label}</h4>
                                    {prod.sub && <p className="text-xs text-[#A67C52]">{prod.sub}</p>}
                                 </div>
                                 <span className="text-[#BC4A3C] font-bold text-lg">${prod.price}</span>
                             </div>
                        ))}
                    </div>
                </div>
             ) : (
                // Flowing Sand Visual Grid (As Requested)
                <div className="grid grid-cols-1 gap-6">
                    <p className="text-[#A67C52] text-xs text-center col-span-1 font-bold">✨ 請確認您想製作的尺寸 ✨</p>
                    {FLOWING_SAND_GALLERY.map((item, idx) => (
                        <div key={idx} className="group bg-[#F9F5F0] rounded-2xl overflow-hidden border border-[#E6DCC3] hover:border-[#BC4A3C] transition-all shadow-sm">
                            {/* Visual/Image Area */}
                            <div className="h-32 bg-[#F2EFE9] flex items-center justify-center relative overflow-hidden text-[#A67C52]">
                                {item.icon}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5F0] to-transparent opacity-80" />
                                <span className="absolute bottom-2 left-4 text-[#5C4033] font-bold text-2xl tracking-widest opacity-10 transform -translate-y-1">
                                    {item.size}
                                </span>
                                <button 
                                    onClick={() => setSelectedGallery({ id: item.id, name: item.title })}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
                                >
                                    <span className="bg-white text-[#5C4033] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                                        <ImageIcon size={16} /> 查看作品集
                                    </span>
                                </button>
                            </div>
                            
                            {/* Content Area */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-[#5C4033] font-bold text-lg">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-[#E6DCC3] text-[#8B5E3C] text-[10px] px-2 py-0.5 rounded-md font-bold border border-[#D6C0B3]">
                                                {item.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {item.tiers.map((tier, tIdx) => (
                                        <div key={tIdx} className="flex justify-between items-center text-sm">
                                            <span className="text-[#8B5E3C] font-bold">{tier.name}</span>
                                            <span className="text-[#BC4A3C] font-bold">${tier.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Descriptions */}
                    <div className="bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3] space-y-3 mt-2">
                        <h4 className="font-bold text-[#5C4033] text-sm">方案說明：</h4>
                        <ul className="text-xs text-[#8B5E3C] space-y-2">
                            <li><strong className="text-[#BC4A3C]">【盲盒模式】</strong> 由我根據角色/主題自由發揮</li>
                            <li><strong className="text-[#BC4A3C]">【指定色系】</strong> 可指定大範圍色系，含 1 次液態對色。</li>
                            <li><strong className="text-[#BC4A3C]">【全客製化】</strong> 從 500 多種閃粉中選搭方案討論。含 2 次液態對色，流蘇顏色、款式皆可指定。</li>
                        </ul>
                    </div>

                    <div className="bg-[#FFF5F5] p-4 rounded-xl border border-[#BC4A3C]/20 mt-2">
                        <h4 className="font-bold text-[#BC4A3C] text-sm flex items-center gap-1 mb-2">
                            <AlertCircle size={14} /> ⚠️ 對色注意事項
                        </h4>
                        <p className="text-xs text-[#BC4A3C] leading-relaxed">
                            對色為「流沙油 + 亮粉」之液態效果展示。因載體與流麻殼材質不同，成品可能因光線折射產生些微視覺差異，對色僅供確認「大致效果」。
                        </p>
                    </div>
                </div>
             )}
          </div>

          <div className="p-4 border-t border-[#E6DCC3] bg-white shrink-0 space-y-4">
            <div className="flex justify-between gap-3">
              <button 
                onClick={() => setCurrentStep(0)}
                className="px-6 py-3 rounded-xl font-bold text-[#A67C52] bg-[#F9F5F0] hover:bg-[#E6DCC3] transition-colors text-sm flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                上一步
              </button>
              <button 
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 flex items-center gap-2 text-sm hover:bg-[#A33E32]"
              >
                開始填單
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // --- STEP 2: FORM VIEW ---
  return (
    <>
      {selectedGallery && (
        <GalleryViewer 
          productId={selectedGallery.id} 
          productName={selectedGallery.name} 
          onClose={() => setSelectedGallery(null)} 
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center shrink-0 bg-gradient-to-r from-[#F9F5F0] to-[#E6DCC3]">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentStep(1)} className="p-1 hover:bg-white/50 rounded-lg transition-colors text-[#A67C52]">
               <ArrowLeft size={20} />
            </button>
            <div className="bg-white/60 p-2 rounded-xl shadow-sm">
               <Package className="text-[#A67C52]" size={20} />
            </div>
            <div>
               <h3 className="font-bold text-lg text-[#5C4033]">
                 填寫委託申請
               </h3>
               <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest">
                 {isScreenshot ? 'Screenshot' : 'Flowing Sand'}
               </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#A67C52]">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form id="request-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
               <label className="text-xs font-bold text-[#A67C52] block uppercase tracking-widest px-1">Step 1. 您的基本資料</label>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block">您的暱稱 (查詢用)</label>
                    <input 
                      required
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033]"
                      placeholder="例如: 糰子"
                      value={formData.clientName}
                      onChange={e => setFormData({...formData, clientName: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block">聯絡方式（line/FB/Discord）</label>
                    <input 
                      required
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033]"
                      placeholder="範例：Discord:shen_li"
                      value={formData.contactInfo}
                      onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-bold text-[#A67C52] block uppercase tracking-widest px-1">Step 2. 選擇委託項目 (可複選)</label>
               
               {isScreenshot ? (
                 // --- SCREENSHOT PRODUCT LIST ---
                 <div className="space-y-6">
                    <div className="space-y-3">
                        {SCREENSHOT_PRODUCTS.filter(p => !p.isAddon).map(product => {
                          const qty = screenshotQuantities[product.id] || 0;
                          const isSelected = qty > 0;
                          
                          return (
                            <div
                              key={product.id}
                              onClick={() => toggleScreenshotProduct(product.id)}
                              className={`relative p-3 rounded-xl border-2 text-left transition-all group cursor-pointer select-none flex justify-between items-center ${
                                isSelected 
                                  ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-sm' 
                                  : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                              }`}
                            >
                               <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                                      {product.label}
                                    </span>
                                    {product.sub && (
                                      <span className="text-[10px] text-[#A67C52]">{product.sub}</span>
                                    )}
                                    {/* Display Option Selection for S_COLLAGE_2 inline */}
                                    {product.id === 'S_COLLAGE_2' && isSelected && collage2Option && (
                                       <span className="text-[10px] text-[#BC4A3C] font-bold mt-0.5">
                                          {collage2Option}
                                       </span>
                                    )}
                                    {/* Display Option Selection for S_COLLAGE_3 inline */}
                                    {product.id === 'S_COLLAGE_3' && isSelected && collage3Option && (
                                       <span className="text-[10px] text-[#BC4A3C] font-bold mt-0.5">
                                          {collage3Option}
                                       </span>
                                    )}
                                  </div>
                               </div>

                               {isSelected ? (
                                 <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3] shrink-0">
                                   <button 
                                     type="button"
                                     onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, -1); }}
                                     className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                                   >
                                     <Minus size={14} />
                                   </button>
                                   <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{qty}</span>
                                   <button 
                                     type="button"
                                     onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, 1); }}
                                     className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                                   >
                                     <Plus size={14} />
                                   </button>
                                </div>
                               ) : (
                                 <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors shrink-0">
                                   ${product.price}
                                 </span>
                               )}
                            </div>
                          );
                        })}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-[#A67C52] block uppercase tracking-widest px-1">加購選項</label>
                        {SCREENSHOT_PRODUCTS.filter(p => p.isAddon).map(product => {
                          const qty = screenshotQuantities[product.id] || 0;
                          const isSelected = qty > 0;
                          
                          return (
                            <div
                              key={product.id}
                              onClick={() => toggleScreenshotProduct(product.id)}
                              className={`relative p-3 rounded-xl border-2 text-left transition-all group cursor-pointer select-none flex justify-between items-center ${
                                isSelected 
                                  ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-sm' 
                                  : 'border-dashed border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                              }`}
                            >
                               <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                                      {product.label}
                                    </span>
                                    {product.sub && (
                                      <span className="text-[10px] text-[#A67C52]">{product.sub}</span>
                                    )}
                                  </div>
                               </div>

                               {isSelected ? (
                                 <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3] shrink-0">
                                   <button 
                                     type="button"
                                     onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, -1); }}
                                     className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                                   >
                                     <Minus size={14} />
                                   </button>
                                   <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{qty}</span>
                                   <button 
                                     type="button"
                                     onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, 1); }}
                                     className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                                   >
                                     <Plus size={14} />
                                   </button>
                                </div>
                               ) : (
                                 <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors shrink-0">
                                   +${product.price}
                                 </span>
                               )}
                            </div>
                          );
                        })}
                    </div>
                 </div>
               ) : (
                 // --- FLOWING SAND PRODUCT LIST ---
                 <div className="space-y-3">
                    {SAND_PRODUCTS.map(product => {
                      const qty = sandItems[product.id] || 0;
                      const isSelected = qty > 0;
                      
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleSandProduct(product.id)}
                          className={`relative p-3 rounded-xl border-2 text-left transition-all group cursor-pointer select-none flex justify-between items-center ${
                            isSelected 
                              ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-sm' 
                              : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                          }`}
                        >
                           <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                                  {product.label}
                                </span>
                                {product.isAddon && (
                                  <span className="text-[10px] text-[#A67C52]">加購項目</span>
                                )}
                              </div>
                           </div>

                           {isSelected ? (
                             <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3] shrink-0">
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); updateSandQuantity(product.id, -1); }}
                                 className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                               >
                                 <Minus size={14} />
                               </button>
                               <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{qty}</span>
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); updateSandQuantity(product.id, 1); }}
                                 className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                               >
                                 <Plus size={14} />
                               </button>
                            </div>
                           ) : (
                             <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors shrink-0">
                               {product.price}元
                             </span>
                           )}
                        </div>
                      );
                    })}
                 </div>
               )}
               
               {/* NEW: Screenshot Remark Field */}
               {isScreenshot && (
                 <div className="mt-4">
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block flex items-center gap-1">
                      <MessageSquare size={12} />
                      想說的話 (許願色系、風格、備註...)
                    </label>
                    <textarea 
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033] placeholder:text-[#D6C0B3] min-h-[80px]"
                      placeholder="範例：許願色系、風格、備註……"
                      value={clientRemark}
                      onChange={e => setClientRemark(e.target.value)}
                    />
                 </div>
               )}

               <div className="mt-4 bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3]">
                  <label className="text-[10px] font-bold text-[#A67C52] mb-2 block flex items-center gap-1">
                    <AlertCircle size={12} />
                    備註
                  </label>
                  <p className="text-sm text-[#5C4033] font-medium leading-relaxed">
                    {isScreenshot 
                       ? "更多展示請看作品集，填單完成請私訊提醒我。" 
                       : "填單完成請私訊提醒我。"
                    }
                  </p>
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6DCC3] bg-white flex justify-between items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A67C52] uppercase tracking-widest flex items-center gap-1">
              <Coins size={12} /> 總金額
            </span>
            <span className="text-xl font-bold text-[#BC4A3C] leading-none">${totalPrice}</span>
          </div>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl font-bold text-[#D6C0B3] hover:bg-[#F9F5F0] transition-colors text-sm"
            >
              取消
            </button>
            <button 
              type="submit"
              form="request-form"
              disabled={isSubmitting}
              className="px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 bg-[#BC4A3C] hover:bg-[#A33E32] shadow-[#BC4A3C]/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              送出
            </button>
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default RequestForm;
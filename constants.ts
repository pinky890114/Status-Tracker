import { Step, CommissionType } from './types';

const getAppId = () => {
  if (typeof __app_id !== 'undefined') return __app_id;
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  return 'commission-tracker-v1';
};

export const APP_ID = getAppId();

export const COMMISSION_TYPES: Record<CommissionType, string> = {
  FLOWING_SAND: '流麻',
  SCREENSHOT: '截圖委託'
};

export const STEPS: Record<CommissionType, Step[]> = {
  FLOWING_SAND: [
    { label: '申請中', sub: '委託申請已提交，等待審核' },
    { label: '待付款', sub: '等待客戶完成訂金支付' },
    { label: '已接單', sub: '已接單並討論需求' },
    { label: '拍攝中', sub: '正在拍攝流麻素材並進行圖面分層' },
    { label: '檔案確認', sub: '確認圖面沒有問題' },
    { label: '等待素材到貨', sub: '等待圖面送印與素材到貨' },
    { label: '實體製作中', sub: '努力照燈與調色' },
    { label: '已完成', sub: '流麻已完成並準備寄出' },
    { label: '待付款', sub: '等待尾款支付' },
    { label: '已交付', sub: '委託已交付並結案' }
  ],
  SCREENSHOT: [
    { label: '申請中', sub: '委託申請已提交，等待審核' },
    { label: '待付款', sub: '等待客戶完成訂金支付' },
    { label: '已接單', sub: '已接單並溝通指定外觀、色系' },
    { label: '拍攝中', sub: '正在開號拍攝期間' },
    { label: '檔案確認', sub: '確認初稿構圖外觀皆沒問題' },
    { label: '修圖中', sub: '正在進行調色與後期' },
    { label: '已完稿', sub: '檔案已完成並上傳雲端' },
    { label: '待付款', sub: '等待尾款支付' },
    { label: '已交付', sub: '委託已交付並結案' }
  ]
};

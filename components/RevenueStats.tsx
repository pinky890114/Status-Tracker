import React, { useMemo, useState } from 'react';
import { Commission } from '../types';
import { STEPS } from '../constants';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface RevenueStatsProps {
  commissions: Commission[];
}

const RevenueStats: React.FC<RevenueStatsProps> = ({ commissions }) => {
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const stats = useMemo(() => {
    const monthlyData: Record<string, {
      total: number;
      completed: number;
      pending: number;
      count: number;
      flowingSandTotal: number;
      screenshotTotal: number;
    }> = {};

    let totalRevenue = 0;
    let completedRevenue = 0;

    commissions.forEach(c => {
      const date = c.createdAt ? new Date(c.createdAt) : new Date(c.updatedAt);
      if (date.getFullYear() !== yearFilter) return;

      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const price = c.price || 0;
      
      const isCompleted = c.type === 'FLOWING_SAND' 
        ? c.status === STEPS.FLOWING_SAND.length - 1 
        : c.status === STEPS.SCREENSHOT.length - 1;

      if (!monthlyData[month]) {
        monthlyData[month] = {
          total: 0,
          completed: 0,
          pending: 0,
          count: 0,
          flowingSandTotal: 0,
          screenshotTotal: 0
        };
      }

      monthlyData[month].total += price;
      monthlyData[month].count += 1;
      
      if (c.type === 'FLOWING_SAND') {
        monthlyData[month].flowingSandTotal += price;
      } else {
        monthlyData[month].screenshotTotal += price;
      }

      if (isCompleted) {
        monthlyData[month].completed += price;
        completedRevenue += price;
      } else {
        monthlyData[month].pending += price;
      }

      totalRevenue += price;
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));

    return {
      monthlyData,
      sortedMonths,
      totalRevenue,
      completedRevenue
    };
  }, [commissions, yearFilter]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    commissions.forEach(c => {
      const date = c.createdAt ? new Date(c.createdAt) : new Date(c.updatedAt);
      years.add(date.getFullYear());
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [commissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-[#E6DCC3] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6DCC3] text-[#8B5E3C] p-3 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#5C4033]">營收統計</h2>
            <p className="text-sm text-[#A67C52]">查看每月的接單總額與完成狀況</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#A67C52]" />
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="border-2 border-[#E6DCC3] bg-[#F9F5F0] text-[#5C4033] font-bold rounded-xl px-4 py-2 outline-none focus:border-[#BC4A3C] transition-colors"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year} 年</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E6DCC3] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F9F5F0] flex items-center justify-center text-[#A67C52]">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#A67C52] mb-1">年度總接單額</p>
            <h3 className="text-3xl font-black text-[#5C4033]">${stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E6DCC3] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2E7D32] mb-1">已完成訂單總額</p>
            <h3 className="text-3xl font-black text-[#1B5E20]">${stats.completedRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E6DCC3] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E6DCC3] bg-[#F9F5F0]">
          <h3 className="font-bold text-[#5C4033] flex items-center gap-2">
            <Calendar size={18} />
            每月詳細數據
          </h3>
        </div>
        
        {stats.sortedMonths.length === 0 ? (
          <div className="p-8 text-center text-[#A67C52]">
            <p>該年度尚無委託資料</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6DCC3]">
            {stats.sortedMonths.map(month => {
              const data = stats.monthlyData[month];
              return (
                <div key={month} className="p-5 hover:bg-[#F9F5F0]/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#5C4033] text-white px-3 py-1.5 rounded-lg font-bold text-lg tracking-wider">
                        {month}
                      </div>
                      <span className="text-sm font-bold text-[#A67C52] bg-[#E6DCC3]/30 px-2 py-1 rounded-md">
                        共 {data.count} 筆訂單
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#A67C52] mb-0.5">本月總額</p>
                      <p className="text-2xl font-black text-[#BC4A3C]">${data.total.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#F9F5F0] p-3 rounded-xl border border-[#E6DCC3]/50">
                      <p className="text-xs font-bold text-[#A67C52] mb-1">流麻委託</p>
                      <p className="text-lg font-bold text-[#5C4033]">${data.flowingSandTotal.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F9F5F0] p-3 rounded-xl border border-[#E6DCC3]/50">
                      <p className="text-xs font-bold text-[#A67C52] mb-1">截圖委託</p>
                      <p className="text-lg font-bold text-[#5C4033]">${data.screenshotTotal.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#E8F5E9] p-3 rounded-xl border border-[#C8E6C9]">
                      <p className="text-xs font-bold text-[#2E7D32] mb-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> 已完成
                      </p>
                      <p className="text-lg font-bold text-[#1B5E20]">${data.completed.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#FFF3E0] p-3 rounded-xl border border-[#FFE0B2]">
                      <p className="text-xs font-bold text-[#E65100] mb-1 flex items-center gap-1">
                        <Clock size={12} /> 製作中
                      </p>
                      <p className="text-lg font-bold text-[#E65100]">${data.pending.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueStats;

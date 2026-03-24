import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { STEPS } from '../constants';
import { CommissionType } from '../types';

interface ProgressBarProps {
  type: CommissionType;
  currentStatus: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ type, currentStatus }) => {
  const steps = STEPS[type];
  const safeStatus = Math.min(currentStatus, steps.length - 1);
  const percentage = (safeStatus / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6">
      <div className="relative h-2 bg-[#E6DCC3] rounded-full overflow-hidden mb-8">
        {/* Changed from rose-400 to #BC4A3C (Vintage Red) */}
        <div 
          className="absolute top-0 left-0 h-full bg-[#BC4A3C] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, idx) => (
          <div key={idx} className={`text-center transition-opacity duration-500 ${idx <= safeStatus ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-12 h-12 mx-auto rounded-full mb-3 flex items-center justify-center shadow-sm ${idx <= safeStatus ? 'bg-[#BC4A3C] text-white' : 'bg-[#E6DCC3] text-[#F9F5F0]'}`}>
              {idx < safeStatus ? <CheckCircle2 size={24} /> : <span className="text-xl font-bold">{idx + 1}</span>}
            </div>
            <p className="text-sm sm:text-base font-bold text-[#5C4033] leading-tight break-words">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
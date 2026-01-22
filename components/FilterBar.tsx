
import React from 'react';
import { Layers, User, BarChart3 } from 'lucide-react';
import { HELP_TYPES } from '../constants';
import { HelpType } from '../types';

interface FilterBarProps {
  activeFilter: HelpType | 'all' | 'mine';
  onFilterChange: (filter: HelpType | 'all' | 'mine') => void;
  completionPercentage: number;
  onStatsClick: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilter, 
  onFilterChange, 
  completionPercentage, 
  onStatsClick 
}) => {
  return (
    <div className="fixed top-safe left-0 right-0 z-[500] px-3 pt-3">
      <div className="max-w-full mx-auto bg-white/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-[2rem] border border-white/60 p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
        
        {/* Nút Thống kê % - Tích hợp theo mẫu */}
        <button 
          onClick={onStatsClick}
          className="flex-shrink-0 flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-slate-50 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">Hoàn thành</p>
            <p className="text-sm font-black text-slate-900 leading-none">{completionPercentage}%</p>
          </div>
        </button>

        {/* Đường chia ngăn cách sau nút % */}
        <div className="w-px h-8 bg-slate-200/80 mx-1 shrink-0"></div>

        {/* Nhóm lọc mặc định */}
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
            activeFilter === 'all' 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${activeFilter === 'all' ? 'text-white' : 'text-slate-400'}`} />
          <span>Tất cả</span>
        </button>

        <button
          onClick={() => onFilterChange('mine')}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
            activeFilter === 'mine' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <User className={`w-3.5 h-3.5 ${activeFilter === 'mine' ? 'text-white' : 'text-slate-400'}`} />
          <span>Của tôi</span>
        </button>

        {/* Đường chia ngăn cách thứ 2 */}
        <div className="w-px h-6 bg-slate-200/80 mx-1 shrink-0"></div>

        {/* Các danh mục cụ thể */}
        {HELP_TYPES.map((item) => (
          <button
            key={item.type}
            onClick={() => onFilterChange(item.type)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
              activeFilter === item.type 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className={`transition-transform duration-300 ${activeFilter === item.type ? 'scale-110' : 'scale-90 opacity-60'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
        
        <div className="w-4 shrink-0"></div>
      </div>
    </div>
  );
};

export default FilterBar;

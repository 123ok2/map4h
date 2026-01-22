
import React from 'react';
import { Layers, User } from 'lucide-react';
import { HELP_TYPES } from '../constants';
import { HelpType } from '../types';

interface FilterBarProps {
  activeFilter: HelpType | 'all' | 'mine';
  onFilterChange: (filter: HelpType | 'all' | 'mine') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="fixed top-safe left-0 right-0 z-[500] px-3 pt-3">
      <div className="max-w-full mx-auto bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-[2rem] border border-white/60 p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
        
        {/* Nhóm mặc định */}
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
            activeFilter === 'all' 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-100' 
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

        {/* Đường chia ngăn cách */}
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
        
        {/* Padding cuối để cuộn mượt hơn */}
        <div className="w-4 shrink-0"></div>
      </div>
    </div>
  );
};

export default FilterBar;

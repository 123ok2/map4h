
import React from 'react';
import { X, BarChart3, PieChart, Activity, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { HelpRequest } from '../types';
import { HELP_TYPES, STATUS_COLORS } from '../constants';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: HelpRequest[];
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, requests }) => {
  if (!isOpen) return null;

  const total = requests.length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const waiting = requests.filter(r => r.status === 'waiting').length;
  const assisting = requests.filter(r => r.status === 'assisting').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const typeStats = HELP_TYPES.map(t => {
    const count = requests.filter(r => r.type === t.type).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...t, count, percentage };
  });

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Thống kê cứu trợ</h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> Cập nhật thời gian thực
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-full active:scale-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto no-scrollbar space-y-10">
          
          {/* Circular Progress Placeholder / Main Stat */}
          <div className="flex flex-col items-center justify-center py-4">
             <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    className="text-blue-600 transition-all duration-1000 ease-out" 
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * completionRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900">{completionRate}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoàn thành</span>
                </div>
             </div>
             <p className="mt-4 text-xs font-bold text-slate-500 text-center">
               Hệ thống đã kết nối và hỗ trợ thành công <span className="text-blue-600">{completed}</span> trên tổng số <span className="text-slate-900">{total}</span> yêu cầu.
             </p>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-red-50 p-4 rounded-3xl border border-red-100 text-center">
                <Clock className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <p className="text-[10px] font-black text-red-400 uppercase mb-1">Đang đợi</p>
                <p className="text-xl font-black text-red-600">{waiting}</p>
             </div>
             <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-100 text-center">
                <Activity className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="text-[10px] font-black text-yellow-400 uppercase mb-1">Đang giúp</p>
                <p className="text-xl font-black text-yellow-600">{assisting}</p>
             </div>
             <div className="bg-green-50 p-4 rounded-3xl border border-green-100 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <p className="text-[10px] font-black text-green-400 uppercase mb-1">Xong</p>
                <p className="text-xl font-black text-green-600">{completed}</p>
             </div>
          </div>

          {/* Category Stats */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <PieChart className="w-4 h-4" /> Phân bổ danh mục
            </h3>
            <div className="space-y-4">
              {typeStats.map((stat) => (
                <div key={stat.type} className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg text-white ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className="text-sm font-black text-slate-800">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{stat.count} tin ({stat.percentage}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`${stat.color} h-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center pt-4">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              Số liệu dựa trên tất cả tin báo công khai.<br/>
              Cảm ơn Duy Hạnh và cộng đồng đã đồng hành.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;

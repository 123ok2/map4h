
import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Clock, User, Phone, ExternalLink, Layers, Calendar, Search, X } from 'lucide-react';
import { HelpRequest, UserLocation, HelpType } from '../types';
import { HELP_TYPES, STATUS_COLORS, VIETNAMESE_LABELS } from '../constants';
import { formatRelativeTime, formatFullDateTime } from '../utils/time';

interface RequestListProps {
  requests: HelpRequest[];
  userLocation: UserLocation | null;
  onShowOnMap: (req: HelpRequest) => void;
  onNavigate: (req: HelpRequest) => void;
  currentUserId: string;
  activeFilter: HelpType | 'all' | 'mine';
  onFilterChange: (filter: HelpType | 'all' | 'mine') => void;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  userLocation, 
  onShowOnMap, 
  onNavigate, 
  currentUserId,
  activeFilter,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenGoogleMaps = (req: HelpRequest) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${req.location.lat},${req.location.lng}`;
    window.open(url, '_blank');
  };

  const filteredAndSearchedRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = 
        (req.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [requests, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sticky Header & Filter Bar */}
      <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-2xl px-4 pt-6 pb-4 space-y-4 border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Danh sách cứu trợ</h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase border border-blue-100/50">
            {filteredAndSearchedRequests.length} kết quả
          </span>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc nội dung..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => onFilterChange('all')}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất cả</span>
          </button>

          <button
            onClick={() => onFilterChange('mine')}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
              activeFilter === 'mine' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Của tôi</span>
          </button>

          <div className="w-px h-6 bg-slate-200 shrink-0 mx-1"></div>

          {HELP_TYPES.map((item) => (
            <button
              key={item.type}
              onClick={() => onFilterChange(item.type)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                activeFilter === item.type 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
              }`}
            >
              <span className={activeFilter === item.type ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="w-4 shrink-0"></div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-32 mt-4">
        {filteredAndSearchedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center mt-10">
            <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Không tìm thấy</h3>
            <p className="text-slate-500 text-sm font-medium px-8 leading-relaxed max-w-[280px]">
              Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa "<span className="text-blue-600 font-bold">{searchQuery}</span>".
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-sm font-black text-blue-600 uppercase tracking-widest px-6 py-3 bg-blue-50 rounded-xl active:scale-95 transition-all"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          filteredAndSearchedRequests.map((req) => {
            const typeInfo = HELP_TYPES.find(t => t.type === req.type);
            const distance = userLocation 
              ? calculateDistance(userLocation.lat, userLocation.lng, req.location.lat, req.location.lng)
              : null;
            
            const createdAtDate = req.createdAt?.toDate ? req.createdAt.toDate() : new Date();
            const relativeTimeStr = formatRelativeTime(createdAtDate);
            const fullDateTimeStr = formatFullDateTime(createdAtDate);

            return (
              <div 
                key={req.id} 
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden transition-all active:scale-[0.98]"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${typeInfo?.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        {typeInfo?.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">{typeInfo?.label}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase">
                          <Clock className="w-3 h-3" />
                          <span>{relativeTimeStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span 
                        className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-white shadow-sm" 
                        style={{ backgroundColor: STATUS_COLORS[req.status] }}
                      >
                        {VIETNAMESE_LABELS[req.status]}
                      </span>
                      {distance !== null && (
                        <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                          {distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                       <User className="w-3.5 h-3.5 text-slate-400" />
                       <span className="uppercase tracking-tight">{req.requesterName || 'Người cần hỗ trợ'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                       <Calendar className="w-3 h-3" />
                       <span>{fullDateTimeStr}</span>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-slate-600 text-xs font-bold leading-relaxed line-clamp-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic">
                          "{req.description}"
                        </p>
                      </div>
                      {req.imageUrl && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-sm">
                          <img src={req.imageUrl} alt="Help" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button 
                      onClick={() => onNavigate(req)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-wider shadow-lg shadow-blue-100"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Chỉ đường
                    </button>
                    
                    <button 
                      onClick={() => handleOpenGoogleMaps(req)}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl text-[10px] font-black hover:bg-slate-50 transition-all uppercase tracking-wider"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Google Maps
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                     <button 
                      onClick={() => onShowOnMap(req)}
                      className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-[10px] font-black hover:bg-slate-200 transition-all uppercase"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Xem bản đồ
                    </button>

                    {req.contact ? (
                      <a 
                        href={`tel:${req.contact}`}
                        className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-2xl text-[10px] font-black hover:bg-green-600 transition-all uppercase shadow-lg shadow-green-100"
                      >
                        <Phone className="w-3.5 h-3.5" /> Gọi cứu trợ
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-300 py-3.5 rounded-2xl text-[10px] font-black uppercase cursor-not-allowed">
                        <User className="w-3.5 h-3.5" /> Ẩn liên hệ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestList;

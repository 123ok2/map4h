
import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Clock, User, Phone, ExternalLink, Layers, Calendar, Search, X, ChevronRight, Fingerprint } from 'lucide-react';
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
      {/* Search & Header HUD */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-3xl px-5 pt-8 pb-5 space-y-5 border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Bản tin cứu trợ</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase border border-blue-100/50 shadow-sm">
              {filteredAndSearchedRequests.length} tin báo
            </span>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, nội dung, khu vực..."
            className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] pl-13 pr-12 py-5 text-base font-bold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 space-y-5 pb-32 mt-5">
        {filteredAndSearchedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center mt-10">
            <div className="w-28 h-28 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200/50">
              <Search className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Không tìm thấy dữ liệu</h3>
            <p className="text-slate-500 text-sm font-medium px-6 leading-relaxed">
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc.
            </p>
          </div>
        ) : (
          filteredAndSearchedRequests.map((req, index) => {
            const typeInfo = HELP_TYPES.find(t => t.type === req.type);
            const distance = userLocation 
              ? calculateDistance(userLocation.lat, userLocation.lng, req.location.lat, req.location.lng)
              : null;
            
            const createdAtDate = req.createdAt?.toDate ? req.createdAt.toDate() : new Date();
            const relativeTimeStr = formatRelativeTime(createdAtDate);

            return (
              <div 
                key={req.id} 
                onClick={() => onShowOnMap(req)}
                className="bg-white rounded-[2.2rem] border border-slate-100 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.06)] overflow-hidden transition-all active:scale-[0.97] hover:shadow-xl relative"
              >
                {/* Index & ID Indicator */}
                <div className="absolute top-5 left-5 z-10 flex flex-col items-center gap-1">
                  <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] shadow-lg border-2 border-white">
                    {index + 1}
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold tracking-tighter shadow-sm">
                    {req.id.substring(0, 6)}
                  </div>
                </div>

                <div className="p-5 pl-15">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`${typeInfo?.color} w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-opacity-20`}>
                        {typeInfo?.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-tight leading-none mb-1.5">{typeInfo?.label}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{relativeTimeStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span 
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-md" 
                        style={{ backgroundColor: STATUS_COLORS[req.status] }}
                      >
                        {VIETNAMESE_LABELS[req.status]}
                      </span>
                      {distance !== null && (
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-900 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span>{distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mb-5 space-y-4">
                    <div className="flex items-center gap-2.5 text-[12px] font-black text-slate-800 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 w-fit">
                       <User className="w-4 h-4 text-slate-400" />
                       <span className="uppercase tracking-tight">{req.requesterName || 'Người cần hỗ trợ'}</span>
                    </div>

                    <div className="flex gap-5">
                      <div className="flex-1">
                        <p className="text-slate-600 text-sm font-bold leading-relaxed line-clamp-2 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 italic">
                          "{req.description}"
                        </p>
                      </div>
                      {req.imageUrl && (
                        <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-md">
                          <img src={req.imageUrl} alt="Help" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate(req); }}
                      className="flex items-center justify-center gap-2.5 bg-blue-600 text-white py-5 rounded-2xl text-[11px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95"
                    >
                      <Navigation className="w-4 h-4" /> Chỉ đường
                    </button>
                    
                    {req.contact ? (
                      <a 
                        href={`tel:${req.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2.5 bg-green-500 text-white py-5 rounded-2xl text-[11px] font-black hover:bg-green-600 transition-all uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95"
                      >
                        <Phone className="w-4 h-4" /> Gọi ngay
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2.5 bg-slate-100 text-slate-300 py-5 rounded-2xl text-[11px] font-black uppercase cursor-not-allowed">
                        <X className="w-4 h-4" /> Ẩn liên hệ
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

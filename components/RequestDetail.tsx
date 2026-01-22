
import React from 'react';
import { X, MapPin, Phone, Navigation, CheckCircle2, User, Clock, ShieldCheck, Image as ImageIcon, Calendar, ExternalLink } from 'lucide-react';
import { HelpRequest } from '../types';
import { HELP_TYPES, STATUS_COLORS, VIETNAMESE_LABELS } from '../constants';
import { formatRelativeTime, formatFullDateTime } from '../utils/time';

interface RequestDetailProps {
  request: HelpRequest;
  onClose: () => void;
  onNavigate: () => void;
  onComplete: () => void;
  currentUserId: string;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ request, onClose, onNavigate, onComplete, currentUserId }) => {
  const typeInfo = HELP_TYPES.find(t => t.type === request.type);
  const createdAtDate = request.createdAt?.toDate ? request.createdAt.toDate() : new Date();
  const completedAtDate = request.completedAt?.toDate ? request.completedAt.toDate() : null;

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${request.location.lat},${request.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-xl rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in slide-in-from-bottom duration-500 pb-safe"
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className={`${typeInfo?.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {typeInfo?.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                {typeInfo?.label}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{formatRelativeTime(createdAtDate)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-full active:scale-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto no-scrollbar space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span 
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase text-white shadow-sm" 
                style={{ backgroundColor: STATUS_COLORS[request.status] }}
              >
                {VIETNAMESE_LABELS[request.status]}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatFullDateTime(createdAtDate)}</span>
              </div>
            </div>

            {/* Requester Name Section */}
            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Người cần cứu trợ</p>
                <span className="text-lg font-black text-slate-800">
                  {request.requesterName || 'Chưa cung cấp tên'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
              <p className="text-slate-800 text-base font-bold leading-relaxed italic">
                "{request.description}"
              </p>
            </div>

            {request.imageUrl && (
              <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl group">
                <img src={request.imageUrl} alt="Incident" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="grid grid-cols-1 gap-3">
             {request.contact ? (
                <a 
                  href={`tel:${request.contact}`}
                  className="flex items-center gap-4 bg-green-50 p-5 rounded-[2.5rem] border border-green-100 active:scale-[0.98] transition-all shadow-sm"
                >
                  <div className="w-14 h-14 bg-green-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-green-100">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.1em] mb-1 opacity-70">Liên hệ khẩn cấp</p>
                    <span className="text-xl font-black text-green-800">{request.contact}</span>
                  </div>
                </a>
             ) : (
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100 opacity-60">
                   <div className="w-14 h-14 bg-slate-300 rounded-[1.5rem] flex items-center justify-center text-white">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Không có thông tin liên hệ</p>
                  </div>
                </div>
             )}
          </div>

          {/* Completion Proof Section */}
          {request.status === 'completed' && (
            <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-blue-200 space-y-4 animate-in fade-in zoom-in duration-500">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Cứu trợ thành công</h4>
                    {completedAtDate && (
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-tight">
                        Vào: {formatFullDateTime(completedAtDate)}
                      </p>
                    )}
                  </div>
               </div>

               <div className="flex items-center gap-4 bg-white p-5 rounded-[1.5rem] shadow-sm border border-blue-50">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mạnh thường quân</p>
                    <p className="text-base font-black text-slate-900">{request.helperName || 'Ẩn danh'}</p>
                    {request.helperContact && (
                       <p className="text-[11px] font-bold text-blue-500">{request.helperContact}</p>
                    )}
                  </div>
               </div>

               {request.proofImageUrl && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 opacity-80">Hình ảnh minh chứng</p>
                    <div className="w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-lg">
                      <img src={request.proofImageUrl} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  </div>
               )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 pt-4">
            {request.status !== 'completed' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={onNavigate}
                    className="flex flex-col items-center justify-center py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all gap-1"
                  >
                    <Navigation className="w-5 h-5" />
                    <span className="text-[10px]">Chỉ đường</span>
                  </button>

                  <button 
                    onClick={handleOpenGoogleMaps}
                    className="flex flex-col items-center justify-center py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-[2rem] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all gap-1"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-[10px]">Google Maps</span>
                  </button>
                </div>
                
                {request.createdBy !== currentUserId && (
                   <button 
                    onClick={onComplete}
                    className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all shadow-blue-200"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Tôi đã cứu trợ xong
                  </button>
                )}
              </>
            )}
            
            {request.status === 'completed' && (
               <button 
                onClick={onClose}
                className="w-full py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Đóng thông tin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;


import React from 'react';
import { X, MapPin, Phone, Navigation, CheckCircle2, User, Clock, ShieldCheck, Image as ImageIcon, Calendar, ExternalLink, Fingerprint, Copy } from 'lucide-react';
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép mã ID: " + text);
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-slate-900/50 backdrop-blur-[4px] animate-in fade-in duration-400">
      <div 
        className="bg-white w-full max-w-xl rounded-t-[3.5rem] shadow-[0_-25px_60px_rgba(0,0,0,0.25)] overflow-hidden animate-in slide-in-from-bottom duration-500 pb-safe ring-1 ring-slate-100"
      >
        {/* Mobile Handle Indicator */}
        <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mt-5 mb-3"></div>

        {/* Header Section */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className={`${typeInfo?.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-opacity-30`}>
              {typeInfo?.icon}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                {typeInfo?.label}
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 tracking-widest">
                <Clock className="w-4 h-4 text-blue-500/60" />
                <span>{formatRelativeTime(createdAtDate)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar space-y-8">
          
          {/* Firestore ID Section - Scientific Look */}
          <div className="flex items-center justify-between px-1">
             <div 
              onClick={() => copyToClipboard(request.id)}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer active:bg-slate-200 transition-colors group"
             >
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-tight">ID: {request.id}</span>
                <Copy className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
             </div>
             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                <Calendar className="w-4 h-4" />
                <span>{formatFullDateTime(createdAtDate)}</span>
              </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <span 
                className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase text-white shadow-lg" 
                style={{ backgroundColor: STATUS_COLORS[request.status] }}
              >
                {VIETNAMESE_LABELS[request.status]}
              </span>
            </div>

            {/* Profile Bar */}
            <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[2.2rem] border border-slate-100 shadow-inner">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">Đang cần cứu trợ</p>
                <span className="text-xl font-black text-slate-900">
                  {request.requesterName || 'Người dân địa phương'}
                </span>
              </div>
            </div>

            {/* Description Text */}
            <div className="bg-slate-50/60 p-7 rounded-[2.5rem] border border-slate-100 shadow-inner">
              <p className="text-slate-700 text-lg font-bold leading-relaxed italic">
                "{request.description}"
              </p>
            </div>

            {/* Image Preview */}
            {request.imageUrl && (
              <div className="w-full aspect-[16/10] rounded-[2.8rem] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl relative group">
                <img src={request.imageUrl} alt="Incident" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            )}
          </div>

          {/* Action Row: Contact */}
          {request.contact ? (
            <a 
              href={`tel:${request.contact}`}
              className="flex items-center gap-5 bg-green-50 p-6 rounded-[2.5rem] border border-green-100 active:scale-[0.98] transition-all shadow-xl shadow-green-100/50"
            >
              <div className="w-16 h-16 bg-green-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-green-500/40">
                <Phone className="w-8 h-8" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-green-600 uppercase tracking-[0.15em] mb-1.5 opacity-80">Liên hệ trực tiếp</p>
                <span className="text-2xl font-black text-green-900 tracking-tight">{request.contact}</span>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 opacity-60">
               <div className="w-16 h-16 bg-slate-300 rounded-[1.8rem] flex items-center justify-center text-white">
                <User className="w-8 h-8" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Không có thông tin liên hệ</p>
              </div>
            </div>
          )}

          {/* Proof Section for Completed Requests */}
          {request.status === 'completed' && (
            <div className="bg-blue-600 p-8 rounded-[3rem] space-y-5 animate-in fade-in zoom-in duration-500 shadow-2xl shadow-blue-200">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Hỗ trợ thành công</h4>
                    {completedAtDate && (
                      <p className="text-[11px] font-black text-blue-100 uppercase tracking-widest opacity-80">
                        Lúc: {formatFullDateTime(completedAtDate)}
                      </p>
                    )}
                  </div>
               </div>

               <div className="bg-white/15 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                  <div className="flex items-center gap-5">
                    <div className="w-13 h-13 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-70">Mạnh thường quân</p>
                      <p className="text-lg font-black text-white">{request.helperName || 'Anh hùng ẩn danh'}</p>
                    </div>
                  </div>
               </div>

               {request.proofImageUrl && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest ml-1 opacity-70">Ảnh minh chứng</p>
                    <div className="w-full aspect-square rounded-[2.2rem] overflow-hidden border-4 border-white shadow-2xl">
                      <img src={request.proofImageUrl} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  </div>
               )}
            </div>
          )}

          {/* Navigation & Final Actions */}
          <div className="space-y-4 pt-6">
            {request.status !== 'completed' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={onNavigate}
                    className="flex flex-col items-center justify-center py-6 bg-slate-900 text-white rounded-[2.2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all gap-2 group"
                  >
                    <Navigation className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[11px]">Dẫn đường</span>
                  </button>

                  <button 
                    onClick={handleOpenGoogleMaps}
                    className="flex flex-col items-center justify-center py-6 bg-white border-3 border-slate-900 text-slate-900 rounded-[2.2rem] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all gap-2"
                  >
                    <ExternalLink className="w-6 h-6" />
                    <span className="text-[11px]">Google Maps</span>
                  </button>
                </div>
                
                {request.createdBy !== currentUserId && (
                   <button 
                    onClick={onComplete}
                    className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 active:scale-95 transition-all mt-4"
                  >
                    <CheckCircle2 className="w-6 h-6" /> Tôi đã giúp xong
                  </button>
                )}
              </>
            )}
            
            {request.status === 'completed' && (
               <button 
                onClick={onClose}
                className="w-full py-7 bg-slate-100 text-slate-500 rounded-[2.5rem] font-black uppercase tracking-widest active:scale-95 transition-all border border-slate-200"
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

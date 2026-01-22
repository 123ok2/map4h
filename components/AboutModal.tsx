
import React from 'react';
import { X, Info, Heart, Phone, HelpCircle, MapPin, CheckCircle, Send, User } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Về MAP4H</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map For Help Community</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-full active:scale-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto no-scrollbar space-y-10">
          
          {/* Founder Section */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">
              <Heart className="w-4 h-4 fill-blue-600" /> Người sáng lập
            </h3>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 shadow-xl border border-slate-50 shrink-0">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-2">Duy Hạnh</p>
                  <a 
                    href="tel:0868640898" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-blue-600 font-black text-sm shadow-sm active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4 fill-blue-600" />
                    0868.640.898
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* User Guide Section */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              <HelpCircle className="w-4 h-4" /> Hướng dẫn sử dụng
            </h3>
            
            <div className="grid gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 shadow-sm border border-red-100 font-black text-xs">01</div>
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-1">Gửi yêu cầu</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Chạm vào một vị trí bất kỳ trên bản đồ trong bán kính 5km hoặc nhấn nút "+" để gửi tin cứu trợ khẩn cấp.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-sm border border-orange-100 font-black text-xs">02</div>
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-1">Tìm kiếm & Lọc</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Sử dụng thanh lọc danh mục hoặc tìm kiếm theo tên người cần giúp để xác định nhanh các trường hợp khẩn cấp.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 font-black text-xs">03</div>
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-1">Dẫn đường & Hỗ trợ</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Xem chi tiết tin cứu trợ và nhấn "Chỉ đường" hoặc "Google Maps" để di chuyển đến hiện trường.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0 shadow-sm border border-green-100 font-black text-xs">04</div>
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-1">Xác nhận hoàn thành</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Sau khi cứu trợ xong, hãy nhấn "Xác nhận hoàn thành" và đính kèm ảnh minh chứng để kết thúc tin báo.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="text-center pt-4">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              MAP4H - Hành động nhỏ, thay đổi lớn.<br/>
              Phiên bản cộng đồng 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;

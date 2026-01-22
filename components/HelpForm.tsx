
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, ChevronLeft, User } from 'lucide-react';
import { HELP_TYPES } from '../constants';
import { HelpType, HelpRequest } from '../types';

interface HelpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: HelpType, requesterName: string, description: string, contact: string, imageUrl: string) => void;
  isSubmitting: boolean;
  editData?: HelpRequest | null;
}

const HelpForm: React.FC<HelpFormProps> = ({ isOpen, onClose, onSubmit, isSubmitting, editData }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<HelpType | null>(null);
  const [requesterName, setRequesterName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editData) {
      setSelectedType(editData.type);
      setRequesterName(editData.requesterName || '');
      setDescription(editData.description);
      setContact(editData.contact || '');
      setImageUrl(editData.imageUrl || '');
      setStep(2);
    } else if (isOpen) {
      setSelectedType(null); setRequesterName(''); setDescription(''); setContact(''); setImageUrl(''); setStep(1);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white w-full max-w-lg rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in slide-in-from-bottom duration-500 pb-safe">
        {/* Header Handle for Mobile Feeling */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>

        <div className="relative px-6 py-4 flex items-center justify-between">
          {step === 2 && !editData && (
            <button onClick={() => setStep(1)} className="p-2 bg-slate-100 rounded-full active:scale-90 transition-all">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {editData ? 'Sửa thông tin' : 'Gửi yêu cứu trợ'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-red-50 text-red-600 rounded-full active:scale-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pt-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              {HELP_TYPES.map((item) => (
                <button 
                  key={item.type} 
                  onClick={() => { setSelectedType(item.type); setStep(2); }} 
                  className="group flex flex-col items-center p-6 bg-slate-50 rounded-[2.5rem] border-2 border-transparent active:border-blue-500 active:bg-white transition-all shadow-sm"
                >
                  <div className={`${item.color} w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl transform transition-transform group-active:scale-110`}>
                    {item.icon}
                  </div>
                  <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (selectedType) onSubmit(selectedType, requesterName, description, contact, imageUrl); }} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                <div className={`w-4 h-4 rounded-full ${HELP_TYPES.find(t => t.type === selectedType)?.color}`}></div>
                <span className="text-xs font-black text-blue-800 uppercase tracking-wider">Danh mục: {HELP_TYPES.find(t => t.type === selectedType)?.label}</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Người cần cứu trợ</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    required 
                    type="text" 
                    value={requesterName} 
                    onChange={(e) => setRequesterName(e.target.value)} 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-base font-bold" 
                    placeholder="Họ và tên người cần hỗ trợ" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Mô tả chi tiết</label>
                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-base font-medium" placeholder="Bạn cần hỗ trợ cụ thể điều gì?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Hình ảnh hiện trường</label>
                   <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer active:bg-slate-100 overflow-hidden shadow-inner">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="col-span-1 flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">SĐT liên hệ</label>
                  <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm mb-auto" placeholder="Số điện thoại" />
                </div>
              </div>
              
              <button disabled={isSubmitting} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50 mt-4">
                {isSubmitting ? 'Đang xử lý...' : <><Send className="w-5 h-5" /> {editData ? 'Cập nhật' : 'Gửi tin cứu trợ'}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpForm;

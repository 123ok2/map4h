
import React, { useState, useRef } from 'react';
import { X, CheckCircle, Camera, Upload } from 'lucide-react';

interface ProofFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { helperName: string; helperContact: string; proofImage: string }) => void;
  isSubmitting: boolean;
}

const ProofForm: React.FC<ProofFormProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [helperName, setHelperName] = useState('');
  const [helperContact, setHelperContact] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ helperName, helperContact, proofImage });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-green-50">
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" /> Xác nhận hoàn thành
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên của bạn / Đội cứu trợ</label>
            <input
              required
              type="text"
              value={helperName}
              onChange={(e) => setHelperName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại (để xác minh)</label>
            <input
              required
              type="tel"
              value={helperContact}
              onChange={(e) => setHelperContact(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="09xx xxx xxx"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Hình ảnh minh chứng</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer overflow-hidden"
            >
              {proofImage ? (
                <img src={proofImage} alt="Proof" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Camera className="w-10 h-10 mb-2" />
                  <span className="text-sm">Chạm để chụp hoặc chọn ảnh</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận & Hoàn thành'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProofForm;

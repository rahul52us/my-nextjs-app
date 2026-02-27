"use client";
import React, { useState, useRef } from 'react';
import { 
  Upload, Download, RefreshCw, ArrowRight,
  FileImage, ShieldCheck, Zap, X, CheckCircle2, Layers, Settings2, Archive 
} from 'lucide-react';
import JSZip from 'jszip';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  convertedUrl?: string;
  status: 'pending' | 'converting' | 'completed';
  individualTarget?: string; 
}

const FORMATS = [
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'WEBP', mime: 'image/webp', ext: 'webp' },
];

const ImageConverter: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [globalTarget, setGlobalTarget] = useState('image/jpeg');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = images.filter(img => img.status === 'completed').length;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      files = e.dataTransfer.files;
    } else {
      files = (e.target as HTMLInputElement).files;
    }

    if (!files) return;

    const newImages: ImageFile[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending'
      }));

    setImages(prev => [...prev, ...newImages]);
  };

  const updateIndividualFormat = (id: string, mime: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, individualTarget: mime, status: 'pending', convertedUrl: undefined } : img
    ));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const convertSingleImage = async (imgObj: ImageFile): Promise<string> => {
    const target = imgObj.individualTarget || globalTarget;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (target === 'image/jpeg') {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL(target, 0.9));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(imgObj.file);
    });
  };

  const processAll = async () => {
    setIsProcessingAll(true);
    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].status === 'completed') continue;
      
      updatedImages[i] = { ...updatedImages[i], status: 'converting' };
      setImages([...updatedImages]);

      const result = await convertSingleImage(updatedImages[i]);
      
      updatedImages[i] = { 
        ...updatedImages[i], 
        convertedUrl: result, 
        status: 'completed' 
      };
      setImages([...updatedImages]);
    }
    setIsProcessingAll(false);
  };

  const downloadZip = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    
    images.forEach((img) => {
      if (img.convertedUrl && img.status === 'completed') {
        const formatInfo = FORMATS.find(f => f.mime === (img.individualTarget || globalTarget));
        const extension = formatInfo?.ext || 'jpg';
        const base64Data = img.convertedUrl.split(',')[1];
        zip.file(`${img.file.name.split('.')[0]}.${extension}`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `swift-convert-batch-${Date.now()}.zip`;
    link.click();
    setIsZipping(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Layers size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SwiftBatch <span className="text-indigo-600">v2</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14}/> Client-Side Engine
          </div>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Sidebar Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 size={16} className="text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Global Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Default Format</label>
                  <div className="grid grid-cols-1 gap-2">
                    {FORMATS.map((f) => (
                      <button
                        key={f.mime}
                        onClick={() => setGlobalTarget(f.mime)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all border text-left flex items-center justify-between ${
                          globalTarget === f.mime 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {f.label}
                        {globalTarget === f.mime && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={processAll}
                    disabled={images.length === 0 || isProcessingAll}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-20 flex items-center justify-center gap-3"
                  >
                    {isProcessingAll ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                    {isProcessingAll ? 'PROCESSING...' : `CONVERT ${images.length} FILES`}
                  </button>

                  {completedCount > 0 && (
                    <button 
                      onClick={downloadZip}
                      disabled={isZipping}
                      className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-3"
                    >
                      {isZipping ? <RefreshCw className="animate-spin" size={18} /> : <Archive size={18} />}
                      DOWNLOAD ALL (.ZIP)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFiles}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 transition-all bg-white hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer shadow-sm"
            >
              <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFiles} />
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition-all mb-2">
                <Upload size={20} />
              </div>
              <p className="text-sm font-bold text-slate-600">Add more images to queue</p>
            </div>

            <div className="space-y-3">
              {images.map((img) => (
                <div key={img.id} className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-4 shadow-sm group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="relative">
                    <img src={img.preview} className="w-16 h-16 object-cover rounded-2xl" alt="Preview" />
                    {img.status === 'completed' && (
                       <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 size={12} />
                       </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate mb-2">{img.file.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">
                        {img.file.type.split('/')[1]}
                      </span>
                      <ArrowRight size={12} className="text-slate-300" />
                      
                      <select 
                        value={img.individualTarget || globalTarget}
                        onChange={(e) => updateIndividualFormat(img.id, e.target.value)}
                        className="text-[10px] font-black px-2 py-1 bg-indigo-50 rounded text-indigo-600 uppercase border-none focus:ring-0 cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                        {FORMATS.map(f => (
                          <option key={f.mime} value={f.mime}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {img.status === 'completed' ? (
                      <a 
                        href={img.convertedUrl} 
                        download={`swift-${img.file.name.split('.')[0]}.${(img.individualTarget || globalTarget).split('/')[1]}`}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-md flex items-center gap-2 text-xs font-bold"
                      >
                        <Download size={14} /> Save
                      </a>
                    ) : img.status === 'converting' ? (
                      <div className="p-3"><RefreshCw className="animate-spin text-indigo-500" size={18} /></div>
                    ) : (
                      <button onClick={() => removeImage(img.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 opacity-30">
                  <FileImage size={48} className="mx-auto mb-3" />
                  <p className="text-xs font-black tracking-widest uppercase">No files in queue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
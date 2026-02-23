"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Sun, Droplets, Trash2, FlipHorizontal, 
  FlipVertical, RotateCw, Wand2, Sparkles,
  Zap, Camera, QrCode, Info, Eye,
  Palette, Layers, Undo2, Wind, Focus, Crop as CropIcon,
  Bold, Italic, List, Type
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Specialized Tools
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- Types & Defaults ---
interface Filters {
  brightness: number; contrast: number; saturate: number;
  sepia: number; gray: number; hue: number; blur: number;
  vignette: number; grain: number; rotate: number;
  flipX: number; flipY: number; bgBlur: number; 
}

const DEFAULT_FILTERS: Filters = {
  brightness: 100, contrast: 100, saturate: 100, 
  sepia: 0, gray: 0, hue: 0, blur: 0,
  vignette: 0, grain: 0, rotate: 0, 
  flipX: 1, flipY: 1, bgBlur: 0, 
};

// --- Rich Text Editor Component ---
const RichEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Project notes & AI Prompts...</p>',
    immediatelyRender: false,
    editorProps: { 
      attributes: { 
        class: 'prose prose-sm focus:outline-none min-h-[120px] p-4 text-slate-600' 
      } 
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-2">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-white'}`}><Bold size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-white'}`}><Italic size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-white'}`}><List size={14}/></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

const AIasist: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [foregroundImage, setForegroundImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [history, setHistory] = useState<Filters[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState("https://google.com");
  const [isComparing, setIsComparing] = useState(false);
  
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // --- API KEY ---
  const API_KEY = "7LoxttzHTN9cqk3ZkAY9vupz"; 

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = url;
    });
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height));
  };

  const renderCanvas = useCallback((useOriginal = false) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.save();
    if (!useOriginal) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((filters.rotate * Math.PI) / 180);
      ctx.scale(filters.flipX, filters.flipY);
      
      const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.gray}%) sepia(${filters.sepia}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`;

      // Layer 1: Background (Blurred if foreground exists)
      ctx.save();
      const bgBlurValue = (foregroundImage && filters.bgBlur > 0) ? filters.bgBlur : 0;
      ctx.filter = bgBlurValue > 0 ? `${filterString} blur(${bgBlurValue}px)` : filterString;
      ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

      // Layer 2: Foreground (The AI Cut-out)
      if (foregroundImage) {
        ctx.save();
        ctx.filter = filterString; 
        ctx.drawImage(foregroundImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();
      }
      
      if (filters.vignette > 0) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width / 1.2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
      }
    } else {
      ctx.drawImage(image, 0, 0);
    }
    ctx.restore();
  }, [image, foregroundImage, filters]);

  useEffect(() => { renderCanvas(isComparing); }, [renderCanvas, isComparing]);

  const updateFilters = (newFilters: Filters) => {
    setHistory(prev => [...prev.slice(-19), filters]); 
    setFilters(newFilters);
  };

  // --- REPLACED WITH EXTERNAL API LOGIC ---
  const processAI = async (mode: 'remove' | 'portrait') => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas?.toDataURL('image/png') || image.src;
      
      // Convert current canvas state to a blob for the API
      const blobRes = await fetch(dataUrl);
      const blob = await blobRes.blob();

      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_file", blob);

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.errors[0].title || "API Error");
      }

      const resultBlob = await response.blob();
      const url = URL.createObjectURL(resultBlob);
      const resultImg = await loadImage(url);

      if (mode === 'portrait') {
        setForegroundImage(resultImg);
        updateFilters({ ...filters, bgBlur: 15 });
      } else {
        setImage(resultImg);
        setForegroundImage(null);
        updateFilters({ ...filters, bgBlur: 0 });
      }
    } catch (e: any) {
      alert(`AI Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        imgRef.current, 
        completedCrop.x * scaleX, 
        completedCrop.y * scaleY, 
        completedCrop.width * scaleX, 
        completedCrop.height * scaleY, 
        0, 0, canvas.width, canvas.height
      );
      const croppedImage = await loadImage(canvas.toDataURL());
      setImage(croppedImage);
      setForegroundImage(null);
      setIsCropping(false);
      setFilters(DEFAULT_FILTERS);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const url = URL.createObjectURL(acceptedFiles[0]);
    const img = await loadImage(url);
    setImage(img); 
    setForegroundImage(null);
    setHistory([]); 
    setFilters(DEFAULT_FILTERS);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

  const handleUndo = () => {
    if (history.length === 0) return;
    setFilters(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleResetStudio = () => {
    if (window.confirm("Delete all progress?")) {
      setImage(null); setForegroundImage(null);
      setFilters(DEFAULT_FILTERS); setHistory([]);
    }
  };

  const applyPreset = (type: string) => {
    switch(type) {
      case 'cyberpunk': updateFilters({...DEFAULT_FILTERS, hue: 300, saturate: 180, contrast: 120, brightness: 110}); break;
      case 'sahara': updateFilters({...DEFAULT_FILTERS, sepia: 60, saturate: 120, contrast: 110, hue: 15}); break;
      case 'forest': updateFilters({...DEFAULT_FILTERS, hue: 100, saturate: 130, contrast: 105, brightness: 95}); break;
      case 'noir': updateFilters({...DEFAULT_FILTERS, gray: 100, contrast: 140, brightness: 110}); break;
      case 'duotone': updateFilters({...DEFAULT_FILTERS, gray: 100, sepia: 100, hue: 200, contrast: 150}); break;
      default: updateFilters(DEFAULT_FILTERS);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-200"><Zap size={20} className="text-white fill-current" /></div>
          <span className="font-bold text-xl tracking-tighter">VisionStudio <span className="text-indigo-600 font-black tracking-widest text-sm ml-1 px-2 py-0.5 bg-indigo-50 rounded">ULTRA</span></span>
        </div>

        {image && (
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCropping(!isCropping)} className={`p-2 transition rounded-lg ${isCropping ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`} title="Toggle Crop Mode"><CropIcon size={20} /></button>
            <button onClick={handleUndo} disabled={history.length === 0} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition" title="Undo"><Undo2 size={20} /></button>
            <button onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} className="p-2 text-slate-400 hover:text-indigo-600 transition" title="Hold to see Original"><Eye size={20} /></button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg transition"><QrCode size={16}/> QR</button>
            <button onClick={handleResetStudio} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
            <button onClick={() => {
                const link = document.createElement('a');
                link.download = 'vision-pro.png';
                link.href = canvasRef.current!.toDataURL('image/png');
                link.click();
            }} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-indigo-600 transition-all active:scale-95">Export Work</button>
          </div>
        )}
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-85 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {isCropping ? (
            <section className="p-5 bg-indigo-600 rounded-2xl text-white space-y-4 shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2"><CropIcon size={18}/><h3 className="text-sm font-bold">Precision Crop</h3></div>
              <div className="flex gap-2">
                <button onClick={applyCrop} className="flex-1 py-3 bg-white text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-slate-100 transition-colors">Apply</button>
                <button onClick={() => setIsCropping(false)} className="px-4 py-3 bg-indigo-700 text-white rounded-xl text-[11px] font-bold">Cancel</button>
              </div>
            </section>
          ) : (
            <>
              <section className="space-y-3">
                 <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><Wand2 size={12}/> AI Intelligence</h3>
                 <button onClick={() => processAI('remove')} disabled={isProcessing || !image} className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50">
                   <div className="flex items-center gap-3"><Sparkles size={18}/><span className="text-sm font-bold">Magic BG Removal</span></div>
                   <Wind size={14} className="opacity-40"/>
                 </button>
                 <button onClick={() => processAI('portrait')} disabled={isProcessing || !image} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl text-slate-900 hover:border-indigo-600 transition-all disabled:opacity-50">
                   <div className="flex items-center gap-3"><Focus size={18} className="text-indigo-600"/><span className="text-sm font-bold">AI Portrait Blur</span></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 </button>
              </section>

              {foregroundImage && (
                  <section className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                     <Slider label="Portrait Depth" value={filters.bgBlur} max={50} onChange={(v) => updateFilters({...filters, bgBlur: v})} icon={<Focus size={14}/>} />
                  </section>
              )}

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={12}/> Cinema Presets</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Cyberpunk', 'Sahara', 'Forest', 'Noir', 'Duotone', 'Reset'].map(preset => (
                    <button key={preset} onClick={() => applyPreset(preset.toLowerCase())} className="py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-slate-100 hover:border-indigo-500 hover:text-indigo-600 transition-all bg-slate-50/50">{preset}</button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Manual Grading</h3>
                <Slider label="Exposure" icon={<Sun size={14}/>} value={filters.brightness} onChange={(v) => updateFilters({...filters, brightness: v})} />
                <Slider label="Color Pop" icon={<Droplets size={14}/>} value={filters.saturate} onChange={(v) => updateFilters({...filters, saturate: v})} />
                <Slider label="Atmosphere" value={filters.hue} max={360} onChange={(v) => updateFilters({...filters, hue: v})} />
                <Slider label="Vignette" value={filters.vignette} max={100} onChange={(v) => updateFilters({...filters, vignette: v})} />
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Geometry</h3>
                <div className="grid grid-cols-3 gap-2">
                  <ToolIconButton icon={<RotateCw size={18}/>} onClick={() => updateFilters({...filters, rotate: filters.rotate + 90})} />
                  <ToolIconButton icon={<FlipHorizontal size={18}/>} onClick={() => updateFilters({...filters, flipX: filters.flipX * -1})} />
                  <ToolIconButton icon={<FlipVertical size={18}/>} onClick={() => updateFilters({...filters, flipY: filters.flipY * -1})} />
                </div>
              </section>
              
              <section>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Type size={12}/> Editor Notes</h3>
                 <RichEditor />
              </section>
            </>
          )}
        </aside>

        <main className="flex-1 bg-[#F8FAFC] p-12 flex items-center justify-center relative overflow-hidden">
          {!image ? (
            <div {...getRootProps()} className="w-full max-w-2xl aspect-video bg-white border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group shadow-2xl">
              <input {...getInputProps()} />
              <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Camera size={40} /></div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800 tracking-tight">Ready to create?</p>
                <p className="text-slate-400 font-bold mt-1">Drag and drop to launch VisionStudio</p>
              </div>
            </div>
          ) : (
            <div className="relative group max-h-full max-w-full">
              <div className="absolute -top-10 left-0 right-0 flex justify-between px-2">
                <div className="flex gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Info size={12}/> {image.width}×{image.height}</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{isCropping ? "Cropping Mode" : (isComparing ? "Original View" : "Live Edit")}</span>
                </div>
              </div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]">
                {isCropping ? (
                  <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} className="max-h-[75vh]">
                    <img ref={imgRef} src={image.src} onLoad={onImageLoad} className="max-w-full max-h-[75vh] block" alt="Crop selection" />
                  </ReactCrop>
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-[75vh] block ring-1 ring-black/5" />
                )}
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center z-50">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-black text-slate-800 uppercase tracking-widest animate-pulse text-center">AI Intelligence Loading...</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setShowQRModal(false)}>
            <div className="bg-white p-10 rounded-[40px] max-w-sm w-full shadow-2xl animate-in zoom-in-90" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black mb-2">QR Bridge</h3>
              <div className="bg-slate-50 p-8 rounded-3xl flex justify-center mb-8 border border-slate-100 shadow-inner"><QRCodeSVG value={qrValue} size={160} /></div>
              <input value={qrValue} onChange={e => setQrValue(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-600 mb-8" placeholder="https://..." />
              <button onClick={() => setShowQRModal(false)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-slate-900 transition-colors">Apply Link</button>
            </div>
        </div>
      )}
    </div>
  );
};

const Slider = ({ label, value, onChange, max = 200, icon }: { label: string, value: number, onChange: (v: number) => void, max?: number, icon?: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center text-[10px] font-black uppercase">
      <div className="flex items-center gap-2 text-slate-400">{icon}{label}</div>
      <span className="text-indigo-600 font-mono">{value}</span>
    </div>
    <input type="range" min="0" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
  </div>
);

const ToolIconButton = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <button onClick={onClick} className="aspect-square bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-white hover:border-indigo-400 hover:text-indigo-600 hover:shadow-xl transition-all active:scale-90">{icon}</button>
);

export default AIasist;
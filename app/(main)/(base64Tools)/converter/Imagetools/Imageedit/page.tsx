"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useColorMode } from '@chakra-ui/react'; // ← header ke saath sync
import {
  Sun, Droplets, Trash2, FlipHorizontal,
  FlipVertical, RotateCw, Wand2, Sparkles,
  Zap, Camera, QrCode, Info, Eye,
  Palette, Layers, Undo2, Wind, Focus, Crop as CropIcon,
  Bold, Italic, List, Type, X, Menu,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

interface HistoryState {
  image: HTMLImageElement | null;
  foregroundImage: HTMLImageElement | null;
  filters: Filters;
}

const DEFAULT_FILTERS: Filters = {
  brightness: 100, contrast: 100, saturate: 100,
  sepia: 0, gray: 0, hue: 0, blur: 0,
  vignette: 0, grain: 0, rotate: 0,
  flipX: 1, flipY: 1, bgBlur: 0,
};

// --- Rich Text Editor ---
const RichEditor = ({ isDark }: { isDark: boolean }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Project notes & AI Prompts...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none min-h-[100px] p-3 ${isDark ? 'text-slate-300 prose-invert' : 'text-slate-600'}`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`border-b p-2 flex gap-1 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
        {[
          { action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: <Bold size={14} /> },
          { action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: <Italic size={14} /> },
          { action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), icon: <List size={14} /> },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className={`p-1.5 rounded transition-colors ${btn.active
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
              : isDark ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-white text-slate-600'}`}>
            {btn.icon}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

// --- Slider Component ---
const Slider = ({
  label, value, onChange, max = 200, icon, isDark,
}: {
  label: string; value: number; onChange: (v: number) => void;
  max?: number; icon?: React.ReactNode; isDark: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase">
      <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{icon}{label}</div>
      <span className="text-indigo-500 font-mono">{value}</span>
    </div>
    <input
      type="range" min="0" max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${isDark ? 'bg-slate-600' : 'bg-slate-100'}`}
    />
  </div>
);

// --- Tool Icon Button ---
const ToolIconButton = ({
  icon, onClick, isDark,
}: { icon: React.ReactNode; onClick: () => void; isDark: boolean }) => (
  <button onClick={onClick}
    className={`aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90
      ${isDark
        ? 'bg-slate-700 border border-slate-600 hover:bg-slate-600 hover:border-indigo-400 hover:text-indigo-400'
        : 'bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 hover:shadow-xl'}`}>
    {icon}
  </button>
);

// --- Main Component ---
const AIasist: React.FC = () => {
  // ── Chakra UI se colorMode lo — header ke saath automatically sync rahega ──
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [foregroundImage, setForegroundImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState("https://google.com");
  const [isComparing, setIsComparing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const API_KEY = "7LoxttzHTN9cqk3ZkAY9vupz";

  const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = url;
    });

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

      ctx.save();
      const bgBlurValue = foregroundImage && filters.bgBlur > 0 ? filters.bgBlur : 0;
      ctx.filter = bgBlurValue > 0 ? `${filterString} blur(${bgBlurValue}px)` : filterString;
      ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

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
        ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      }
    } else {
      ctx.drawImage(image, 0, 0);
    }
    ctx.restore();
  }, [image, foregroundImage, filters]);

  useEffect(() => { renderCanvas(isComparing); }, [renderCanvas, isComparing]);

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-19), { image, foregroundImage, filters }]);
  }, [image, foregroundImage, filters]);

  const updateFilters = (newFilters: Filters) => { saveToHistory(); setFilters(newFilters); };

  const processAI = async (mode: 'remove' | 'portrait') => {
    if (!image) return;
    saveToHistory();
    setIsProcessing(true);
    try {
      const dataUrl = canvasRef.current?.toDataURL('image/png') || image.src;
      const blob = await (await fetch(dataUrl)).blob();
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
      const resultImg = await loadImage(URL.createObjectURL(await response.blob()));
      if (mode === 'portrait') {
        setForegroundImage(resultImg);
        setFilters(prev => ({ ...prev, bgBlur: 15 }));
      } else {
        setImage(resultImg);
        setForegroundImage(null);
        setFilters(prev => ({ ...prev, bgBlur: 0 }));
      }
    } catch (e: any) {
      alert(`AI Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    saveToHistory();
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY,
        completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
      setImage(await loadImage(canvas.toDataURL()));
      setForegroundImage(null);
      setIsCropping(false);
      setFilters(DEFAULT_FILTERS);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const img = await loadImage(URL.createObjectURL(acceptedFiles[0]));
    setImage(img);
    setForegroundImage(null);
    setHistory([]);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

  const handleUndo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setImage(prev.image);
    setForegroundImage(prev.foregroundImage);
    setFilters(prev.filters);
    setHistory(h => h.slice(0, -1));
  };

  const handleResetStudio = () => {
    if (window.confirm("Delete all progress?")) {
      setImage(null); setForegroundImage(null);
      setFilters(DEFAULT_FILTERS); setHistory([]);
    }
  };

  const applyPreset = (type: string) => {
    const presets: Record<string, Filters> = {
      cyberpunk: { ...DEFAULT_FILTERS, hue: 300, saturate: 180, contrast: 120, brightness: 110 },
      sahara: { ...DEFAULT_FILTERS, sepia: 60, saturate: 120, contrast: 110, hue: 15 },
      forest: { ...DEFAULT_FILTERS, hue: 100, saturate: 130, contrast: 105, brightness: 95 },
      noir: { ...DEFAULT_FILTERS, gray: 100, contrast: 140, brightness: 110 },
      duotone: { ...DEFAULT_FILTERS, gray: 100, sepia: 100, hue: 200, contrast: 150 },
    };
    updateFilters(presets[type] || DEFAULT_FILTERS);
  };

  // Theme-aware class helpers — isDark ab header se aata hai
  const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-[#F1F5F9] text-slate-900';
  const navBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const sidebarBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const mainBg = isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]';
  const btnSecondary = isDark
    ? 'bg-slate-700 border border-slate-600 text-slate-200 hover:border-indigo-400'
    : 'bg-white border border-slate-200 text-slate-900 hover:border-indigo-600';
  const sectionLabel = isDark ? 'text-slate-500' : 'text-slate-400';
  const inputCls = isDark
    ? 'bg-slate-700 text-slate-100 border-slate-600 focus:ring-indigo-500 placeholder:text-slate-400'
    : 'bg-slate-100 text-slate-900 border-transparent focus:ring-indigo-600 placeholder:text-slate-400';

  const SidebarContent = () => (
    <div className="space-y-7 p-5">
      {isCropping ? (
        <section className="p-5 bg-indigo-600 rounded-2xl text-white space-y-4 shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-2"><CropIcon size={18} /><h3 className="text-sm font-bold">Precision Crop</h3></div>
          <div className="flex gap-2">
            <button onClick={applyCrop} className="flex-1 py-3 bg-white text-indigo-600 rounded-xl text-[11px] font-black uppercase hover:bg-slate-100 transition-colors">Apply</button>
            <button onClick={() => setIsCropping(false)} className="px-4 py-3 bg-indigo-700 text-white rounded-xl text-[11px] font-bold">Cancel</button>
          </div>
        </section>
      ) : (
        <>
          {/* AI Section */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-indigo-500">
              <Wand2 size={12} /> AI Intelligence
            </h3>
            <button onClick={() => processAI('remove')} disabled={isProcessing || !image}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all shadow-lg disabled:opacity-50 ${isDark ? 'bg-slate-700 hover:bg-indigo-600 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200'}`}>
              <div className="flex items-center gap-3"><Sparkles size={18} /><span className="text-sm font-bold">Magic BG Removal</span></div>
              <Wind size={14} className="opacity-40" />
            </button>
            <button onClick={() => processAI('portrait')} disabled={isProcessing || !image}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all disabled:opacity-50 ${btnSecondary}`}>
              <div className="flex items-center gap-3"><Focus size={18} className="text-indigo-500" /><span className="text-sm font-bold">AI Portrait Blur</span></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </button>
          </section>

          {foregroundImage && (
            <section className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}>
              <Slider label="Portrait Depth" value={filters.bgBlur} max={50}
                onChange={v => updateFilters({ ...filters, bgBlur: v })} icon={<Focus size={14} />} isDark={isDark} />
            </section>
          )}

          {/* Presets */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${sectionLabel}`}>
              <Palette size={12} /> Cinema Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['Cyberpunk', 'Sahara', 'Forest', 'Noir', 'Duotone', 'Reset'].map(p => (
                <button key={p} onClick={() => applyPreset(p.toLowerCase())}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all
                    ${isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-400 hover:text-indigo-400'
                      : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Manual Grading */}
          <section className="space-y-5">
            <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${sectionLabel}`}>
              <Layers size={12} /> Manual Grading
            </h3>
            <Slider label="Exposure" icon={<Sun size={14} />} value={filters.brightness} onChange={v => updateFilters({ ...filters, brightness: v })} isDark={isDark} />
            <Slider label="Color Pop" icon={<Droplets size={14} />} value={filters.saturate} onChange={v => updateFilters({ ...filters, saturate: v })} isDark={isDark} />
            <Slider label="Atmosphere" value={filters.hue} max={360} onChange={v => updateFilters({ ...filters, hue: v })} isDark={isDark} />
            <Slider label="Vignette" value={filters.vignette} max={100} onChange={v => updateFilters({ ...filters, vignette: v })} isDark={isDark} />
          </section>

          {/* Geometry */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sectionLabel}`}>Geometry</h3>
            <div className="grid grid-cols-3 gap-2">
              <ToolIconButton icon={<RotateCw size={18} />} onClick={() => updateFilters({ ...filters, rotate: filters.rotate + 90 })} isDark={isDark} />
              <ToolIconButton icon={<FlipHorizontal size={18} />} onClick={() => updateFilters({ ...filters, flipX: filters.flipX * -1 })} isDark={isDark} />
              <ToolIconButton icon={<FlipVertical size={18} />} onClick={() => updateFilters({ ...filters, flipY: filters.flipY * -1 })} isDark={isDark} />
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${sectionLabel}`}>
              <Type size={12} /> Editor Notes
            </h3>
            <RichEditor isDark={isDark} />
          </section>
        </>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}>

      {/* ── Navbar — NO theme toggle button ── */}
      <nav className={`h-14 md:h-16 border-b px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm ${navBg}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          {image && (
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
              <Menu size={20} />
            </button>
          )}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-200 flex-shrink-0">
            <Zap size={16} className="text-white fill-current md:w-5 md:h-5" />
          </div>
          <span className="font-bold text-base md:text-xl tracking-tighter">
            VisionStudio
            <span className="text-indigo-600 font-black tracking-widest text-[10px] ml-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 rounded hidden sm:inline">ULTRA</span>
          </span>
        </div>

        {/* Right actions — theme button HATA DIYA ── */}
        <div className="flex items-center gap-1 md:gap-3">
          {image && (
            <>
              <button onClick={() => setIsCropping(!isCropping)}
                className={`p-2 transition rounded-lg ${isCropping ? 'bg-indigo-600 text-white' : isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
                title="Toggle Crop">
                <CropIcon size={18} />
              </button>
              <button onClick={handleUndo} disabled={history.length === 0}
                className={`p-2 disabled:opacity-20 transition ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>
                <Undo2 size={18} />
              </button>
              <button onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)}
                className={`p-2 transition hidden sm:block ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>
                <Eye size={18} />
              </button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-600 mx-1 hidden sm:block" />
              <button onClick={() => setShowQRModal(true)}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-2 md:px-3 py-2 rounded-lg transition ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <QrCode size={14} /> <span className="hidden md:inline">QR</span>
              </button>
              <button onClick={handleResetStudio}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition">
                <Trash2 size={16} />
              </button>
              <button onClick={() => {
                const a = document.createElement('a');
                a.download = 'vision-pro.png';
                a.href = canvasRef.current!.toDataURL('image/png');
                a.click();
              }} className="px-3 md:px-6 py-2 md:py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap">
                Export
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Layout ── */}
      <div className="flex h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]">

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className={`absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] overflow-y-auto shadow-2xl ${sidebarBg}`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <span className="font-black text-sm uppercase tracking-widest text-indigo-500">Tools</span>
                <button onClick={() => setSidebarOpen(false)} className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className={`hidden md:block w-72 lg:w-80 border-r overflow-y-auto no-scrollbar flex-shrink-0 ${sidebarBg}`}>
          <SidebarContent />
        </aside>

        {/* Main Canvas */}
        <main className={`flex-1 p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-auto ${mainBg}`}>
          {!image ? (
            <div
              {...getRootProps()}
              className={`w-full max-w-2xl aspect-video border-2 border-dashed rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer transition-all group shadow-2xl
                ${isDark
                  ? 'bg-slate-800 border-slate-600 hover:border-indigo-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[24px] md:rounded-[32px] flex items-center justify-center text-white group-hover:scale-110 transition-transform ${isDark ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                <Camera size={28} className="md:w-10 md:h-10" />
              </div>
              <div className="text-center px-4">
                <p className={`text-lg md:text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Ready to create?</p>
                <p className={`font-bold mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Drag & drop or tap to upload</p>
              </div>
            </div>
          ) : (
            <div className="relative group max-h-full max-w-full w-full flex flex-col items-center">
              <div className="flex justify-between w-full px-2 mb-2">
                <div className="flex gap-3 flex-wrap">
                  <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Info size={12} /> {image.width}×{image.height}
                  </span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {isCropping ? "Cropping" : isComparing ? "Original" : "Live Edit"}
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_30px_60px_-10px_rgba(0,0,0,0.4)] bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] max-w-full">
                {isCropping ? (
                  <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} className="max-h-[60vh] md:max-h-[75vh]">
                    <img ref={imgRef} src={image.src} onLoad={onImageLoad}
                      className="max-w-full max-h-[60vh] md:max-h-[75vh] block" alt="Crop" />
                  </ReactCrop>
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-[60vh] md:max-h-[75vh] block ring-1 ring-black/5" />
                )}
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center z-50">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className={`text-sm md:text-lg font-black uppercase tracking-widest animate-pulse text-center ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    AI Processing...
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}>
          <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[40px] max-w-sm w-full shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl md:text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>QR Bridge</h3>
              <button onClick={() => setShowQRModal(false)} className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                <X size={18} />
              </button>
            </div>
            <div className={`p-6 md:p-8 rounded-3xl flex justify-center mb-6 border shadow-inner ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
              <QRCodeSVG value={qrValue} size={140} />
            </div>
            <input value={qrValue} onChange={e => setQrValue(e.target.value)}
              className={`w-full p-3 md:p-4 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 mb-5 ${inputCls}`}
              placeholder="https://..." />
            <button onClick={() => setShowQRModal(false)}
              className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-slate-900 transition-colors">
              Apply Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIasist;
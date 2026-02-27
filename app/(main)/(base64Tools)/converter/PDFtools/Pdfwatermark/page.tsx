"use client";
import React, { useState, ChangeEvent, useRef } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Upload, Download, Type, RotateCw, Maximize, Droplet, Trash2, ShieldCheck, Move } from 'lucide-react';

const PDFWatermarker: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('PROPRIETARY');
  const [fontSize, setFontSize] = useState<number>(60);
  const [rotation, setRotation] = useState<number>(-45);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // position.x and position.y are 0-100 percentages of the container
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Clean up old URL if it exists
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    const input = document.getElementById('pdf-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const addWatermark = async (): Promise<void> => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
      const fileArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Calculate text metrics for alignment
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        // MAP PREVIEW TO PDF
        // PDF X = % of width
        // PDF Y = Height minus % of height (because PDF starts from bottom)
        const pdfCenterX = (position.x / 100) * width;
        const pdfCenterY = height - ((position.y / 100) * height);

        // pdf-lib rotates text around the origin (the lower-left of the text box).
        // To rotate around the text center (to match the preview which uses translate(-50%,-50%)),
        // compute the lower-left origin so that after rotation the text center is at the intended point.
        const cx = textWidth / 2;
        const cy = textHeight / 2;
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const originX = pdfCenterX - (cx * cos - cy * sin);
        const originY = pdfCenterY - (cx * sin + cy * cos);

        page.drawText(watermarkText, {
          x: originX,
          y: originY,
          size: fontSize,
          font: helveticaFont,
          rotate: degrees(rotation),
          opacity: opacity,
          color: rgb(0.4, 0.4, 0.4),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error processing PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Watermark</h2>
            </div>
            
            <div className="space-y-6">
              {/* File Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">1. Select Document</label>
                {!pdfFile ? (
                  <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2" />
                    <span className="text-sm font-semibold text-slate-500">Drop PDF here</span>
                    <input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-white/20 p-2 rounded-lg"><Download size={16} /></div>
                      <span className="text-sm font-bold truncate">{pdfFile.name}</span>
                    </div>
                    <button onClick={clearFile} className="hover:text-red-400 p-1"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>

              {/* Watermark Config */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">2. Customize Style</label>
                
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark Text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">SIZE</span>
                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">ANGLE</span>
                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">OPACITY</span>
                    <span className="text-xs font-black text-blue-600">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input type="range" min="0.05" max="1" step="0.05" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} />
                </div>
              </div>

              <button 
                onClick={addWatermark} 
                disabled={!pdfFile || isProcessing} 
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${!pdfFile || isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'}`}
              >
                {isProcessing ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <><Download size={20} /> Generate PDF</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-8">
          <div className="bg-slate-200/40 rounded-[2.5rem] p-6 lg:p-10 border-4 border-white shadow-inner min-h-[700px] flex flex-col items-center">
            <div className="w-full flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Live Preview</h3>
                <p className="text-slate-500 font-medium">Click and drag text to set position</p>
              </div>
              <div className="hidden md:block bg-white px-4 py-2 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                A4 Canvas Standard
              </div>
            </div>

            <div 
              ref={previewRef}
              className="relative w-full max-w-2xl aspect-[1/1.414] bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-300 cursor-crosshair group select-none touch-none"
              onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
              onMouseDown={handleDrag}
              onTouchMove={handleDrag}
            >
              {/* PDF Renderer */}
              {pdfUrl ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                  className="absolute inset-0 w-full h-full pointer-events-none" 
                  title="PDF Preview" 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200">
                  <Upload size={80} strokeWidth={1} className="mb-4" />
                  <p className="text-xl font-bold text-slate-300">No Document Loaded</p>
                </div>
              )}

              {/* Watermark Interactive Overlay */}
              <div 
                className="absolute z-50 pointer-events-none flex items-center justify-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  opacity: opacity,
                }}
              >
                <div className="relative flex flex-col items-center">
                    <div className="absolute -top-12 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Move size={16} />
                    </div>
                    <span 
                      className="font-black whitespace-nowrap leading-none transition-colors"
                      style={{ 
                        fontSize: `${fontSize * 0.55}px`, // Preview visual scaling
                        color: '#334155' 
                      }}
                    >
                      {watermarkText || "PREVIEW"}
                    </span>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-slate-400 text-sm font-medium italic">
              * Note: Watermark will be applied to all pages at this exact position.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PDFWatermarker;
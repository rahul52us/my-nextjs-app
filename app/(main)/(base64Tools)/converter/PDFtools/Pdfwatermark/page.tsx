"use client";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import {
  Upload,
  Download,
  Type,
  Trash2,
  ShieldCheck,
  Move,
} from "lucide-react";
import { useColorModeValue } from "@chakra-ui/react";
import { Document, Page, pdfjs } from "react-pdf";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
  const pages = new Set<number>();
  const parts = rangeStr.split(",");
  for (let part of parts) {
    part = part.trim();
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const s = Math.min(start, end);
        const e = Math.max(start, end);
        for (let i = s; i <= e; i++) {
          if (i >= 1 && i <= maxPages) {
            pages.add(i);
          }
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pages.add(p);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
};

const PDFWatermarker: React.FC = observer(() => {
  const { themeStore } = stores;
  const brandColor = themeStore.themeConfig?.colors?.brand?.[500] || "#007ACC";

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("PROPRIETARY");
  const [fontSize, setFontSize] = useState<number>(60);
  const [rotation, setRotation] = useState<number>(-45);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState(600);
  const [pageWidth, setPageWidth] = useState<number>(595);

  // Page selection states
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSelectionType, setPageSelectionType] = useState<"all" | "current" | "range">("all");
  const [customRange, setCustomRange] = useState<string>("");

  // Drag & drop state
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const dragCounter = useRef(0);

  const pageBg = "bg-transparent";
  const cardBg = useColorModeValue("bg-white", "bg-slate-800");
  const previewBg = useColorModeValue("bg-white", "bg-slate-800");
  const watermarkColor = "#64748b";
  const panelBorder = useColorModeValue("border-slate-200", "border-slate-700");
  const previewBorder = useColorModeValue(
    "border-slate-300",
    "border-slate-600",
  );
  const textPrimary = useColorModeValue("text-slate-900", "text-white");
  const textSecondary = useColorModeValue("text-slate-600", "text-slate-300");
  const textMuted = useColorModeValue("text-slate-400", "text-slate-500");
  const inputBg = useColorModeValue("bg-slate-50", "bg-slate-700");
  const inputBorder = useColorModeValue("border-slate-200", "border-slate-600");
  const inputText = useColorModeValue("text-slate-900", "text-white");
  const inputPlaceholder = useColorModeValue(
    "placeholder-slate-400",
    "placeholder-slate-500",
  );
  const dropzoneBg = useColorModeValue("bg-white", "bg-slate-800");
  const dropzoneHoverBg = useColorModeValue(
    "hover:bg-slate-50",
    "hover:bg-slate-700",
  );
  const dropzoneBorder = useColorModeValue(
    "border-slate-200",
    "border-slate-600",
  );
  const dropzoneText = useColorModeValue("text-slate-500", "text-slate-300");
  const fileBadgeBg = useColorModeValue("bg-slate-900", "bg-slate-700");
  const fileBadgeIconBg = useColorModeValue("bg-white/20", "bg-slate-600");
  const rangeBg = useColorModeValue("bg-slate-100", "bg-slate-700");
  const disabledButton = useColorModeValue(
    "bg-slate-100 text-slate-400 cursor-not-allowed",
    "bg-slate-700 text-slate-500 cursor-not-allowed",
  );
  const activeButton =
    "text-white shadow-xl shadow-sky-500/10";
  const canvasBadgeBg = useColorModeValue("bg-white", "bg-slate-700");
  const emptyStateText = useColorModeValue("text-slate-300", "text-slate-500");
  const noteText = useColorModeValue("text-slate-400", "text-slate-500");

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const previewRef = useRef<HTMLDivElement>(null);

  // Sync preview scale with actual container size
  useEffect(() => {
    if (!previewRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

  // Central place that actually loads a File into state,
  // used by both the <input> picker and drag-and-drop.
  const loadFile = (file: File | undefined | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setPdfFile(file);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPageNumber(1);
    setNumPages(0);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0]);
    // allow re-selecting the same file later
    e.target.value = "";
  };

  const clearFile = () => {
    setPdfFile(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setNumPages(0);
    setPageNumber(1);
    const input = document.getElementById("pdf-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  // --- Drag and drop handlers ---
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only react to file drags
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounter.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    loadFile(file);
    e.dataTransfer.clearData();
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();

    const clientX =
      "touches" in e
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e
        ? (e as React.TouchEvent).touches[0].clientY
        : (e as React.MouseEvent).clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const onDocumentLoadSuccess = ({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setPageNumber((prev) => Math.min(prev, total));
  };

  const addWatermark = async (): Promise<void> => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
      const fileArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const totalPagesCount = pages.length;

      // Determine which pages to apply the watermark to
      let pagesToWatermark: number[] = [];
      if (pageSelectionType === "all") {
        for (let i = 1; i <= totalPagesCount; i++) {
          pagesToWatermark.push(i);
        }
      } else if (pageSelectionType === "current") {
        pagesToWatermark.push(pageNumber);
      } else if (pageSelectionType === "range") {
        pagesToWatermark = parsePageRange(customRange, totalPagesCount);
        if (pagesToWatermark.length === 0) {
          alert("Please enter a valid page range (e.g. 2-5)");
          setIsProcessing(false);
          return;
        }
      }

      pagesToWatermark.forEach((pageIdx) => {
        const page = pages[pageIdx - 1];
        if (!page) return;

        const { width, height } = page.getSize();

        // 1. Precise PDF measurements
        const textWidth = helveticaFont.widthOfTextAtSize(
          watermarkText,
          fontSize,
        );

        // 2. Map coordinates: PDF (0,0) is Bottom-Left, CSS (0,0) is Top-Left
        const pdfCenterX = (position.x / 100) * width;
        const pdfCenterY = height - (position.y / 100) * height;

        // 3. Rotation Pivot Correction
        // Invert rotation angle because PDF coordinate system rotation is CCW,
        // whereas CSS rotate() is CW.
        const pdfRotation = -rotation;
        const rad = (pdfRotation * Math.PI) / 180;
        
        // Calculate the centerYOffset using the font's actual Ascender and Descender metrics
        // (representing the vertical midpoint of the text bounding box relative to the baseline).
        // Access internal font metrics via 'any' cast; embedder is private in PDFFont's type
        // definitions but accessible at runtime. Fallbacks match HelveticaBold's actual values.
        const fontAny = helveticaFont as any;
        const ascender: number = fontAny?.embedder?.font?.Ascender ?? 718;
        const descender: number = fontAny?.embedder?.font?.Descender ?? -207;
        const centerYOffset = ((ascender + descender) / 2000) * fontSize;
        const centerXOffset = textWidth / 2;

        const originX =
          pdfCenterX -
          (centerXOffset * Math.cos(rad) - centerYOffset * Math.sin(rad));
        const originY =
          pdfCenterY -
          (centerXOffset * Math.sin(rad) + centerYOffset * Math.cos(rad));

        page.drawText(watermarkText, {
          x: originX,
          y: originY,
          size: fontSize,
          font: helveticaFont,
          rotate: degrees(pdfRotation),
          opacity: opacity,
          color: rgb(0.392, 0.455, 0.545),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
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
    <div className={`min-h-screen ${pageBg} p-4 md:p-8 lg:p-12 font-sans`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className={`${cardBg} ${panelBorder} p-6 rounded-3xl shadow-xl border sticky top-8`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                style={{
                  backgroundColor: brandColor,
                  padding: "8px",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h2
                className={`text-2xl font-black tracking-tight ${textPrimary}`}
              >
                Watermark
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}
                >
                  1. Select Document
                </label>
                {!pdfFile ? (
                  <label
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-slate-700 scale-[1.02]"
                        : `${dropzoneBorder} ${dropzoneBg} hover:border-blue-400 ${dropzoneHoverBg}`
                    }`}
                  >
                    <Upload
                      className={`w-6 h-6 mb-2 ${
                        isDragActive
                          ? "text-blue-500"
                          : `${textMuted} group-hover:text-blue-500`
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        isDragActive ? "text-blue-600" : dropzoneText
                      }`}
                    >
                      {isDragActive ? "Drop it here" : "Drop PDF here, or click to browse"}
                    </span>
                    <input
                      id="pdf-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div
                    className={`flex items-center justify-between p-4 ${fileBadgeBg} rounded-2xl text-white`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`${fileBadgeIconBg} p-2 rounded-lg`}>
                        <Download size={16} />
                      </div>
                      <span className="text-sm font-bold truncate">
                        {pdfFile.name}
                      </span>
                    </div>
                    <button
                      onClick={clearFile}
                      className="hover:text-red-400 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}
                >
                  2. Customize Style
                </label>
                <div className="relative">
                  <Type
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`}
                    size={16}
                  />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 ${inputBg} ${inputBorder} ${inputText} ${inputPlaceholder} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark Text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold ${textMuted}`}>
                      SIZE
                    </span>
                    <input
                      type="number"
                      className={`w-full p-3 ${inputBg} ${inputBorder} ${inputText} border rounded-xl font-bold`}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold ${textMuted}`}>
                      ANGLE
                    </span>
                    <input
                      type="number"
                      className={`w-full p-3 ${inputBg} ${inputBorder} ${inputText} border rounded-xl font-bold`}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold ${textMuted}`}>
                      OPACITY
                    </span>
                    {/* Text color change kiya */}
                    <span
                      className="text-xs font-black"
                      style={{ color: brandColor }}
                    >
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    className={`w-full h-2 ${rangeBg} rounded-lg appearance-none cursor-pointer`}
                    // Slider handle ka color override karne ke liye style use kiya
                    style={{ accentColor: brandColor }}
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  />
                </div>

                {pdfFile && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <label
                      className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}
                    >
                      3. Page Range Settings
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPageSelectionType("all")}
                        className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                          pageSelectionType === "all"
                            ? "text-white"
                            : `bg-transparent ${inputText} ${inputBorder} hover:bg-slate-100 dark:hover:bg-slate-700`
                        }`}
                        style={pageSelectionType === "all" ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                      >
                        All Pages
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageSelectionType("current")}
                        className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                          pageSelectionType === "current"
                            ? "text-white"
                            : `bg-transparent ${inputText} ${inputBorder} hover:bg-slate-100 dark:hover:bg-slate-700`
                        }`}
                        style={pageSelectionType === "current" ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                      >
                        Current Page
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageSelectionType("range")}
                        className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                          pageSelectionType === "range"
                            ? "text-white"
                            : `bg-transparent ${inputText} ${inputBorder} hover:bg-slate-100 dark:hover:bg-slate-700`
                        }`}
                        style={pageSelectionType === "range" ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                      >
                        Custom
                      </button>
                    </div>

                    {pageSelectionType === "range" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className={`w-full p-2.5 ${inputBg} ${inputBorder} ${inputText} ${inputPlaceholder} border rounded-xl font-bold text-xs`}
                          value={customRange}
                          onChange={(e) => setCustomRange(e.target.value)}
                          placeholder="e.g., 2-5 or 1,3,5"
                        />
                        <p className={`text-[10px] ${textMuted} leading-tight`}>
                          Use commas for separate pages, hyphens for ranges (e.g. 1, 3, 5-7).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={addWatermark}
                disabled={!pdfFile || isProcessing}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${!pdfFile || isProcessing ? disabledButton : activeButton}`}
                style={!pdfFile || isProcessing ? {} : { backgroundColor: brandColor }}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download size={20} /> Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-8">
          <div
            className={`${previewBg} rounded-[2.5rem] p-6 lg:p-10 border-4 ${panelBorder} shadow-inner min-h-[700px] flex flex-col items-center`}
          >
            <div className="w-full flex justify-between items-end mb-6">
              <div>
                <h3
                  className={`text-2xl font-black tracking-tight ${textPrimary}`}
                >
                  Live Preview
                </h3>
                <p className={`${textSecondary} font-medium`}>
                  Click and drag text to set position
                </p>
              </div>
              <div
                className={`hidden md:block ${canvasBadgeBg} px-4 py-2 rounded-full border ${panelBorder} text-[10px] font-bold ${textMuted} uppercase tracking-widest`}
              >
                A4 Canvas Standard
              </div>
            </div>

            <div
              ref={previewRef}
              className={`relative w-full max-w-2xl ${!pdfFile ? "aspect-[1/1.414]" : ""} ${previewBg} shadow-2xl rounded-lg overflow-hidden border ${previewBorder} cursor-crosshair group select-none touch-none`}
              onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
              onMouseDown={handleDrag}
              onTouchMove={handleDrag}
            >
              {pdfFile ? (
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-8 text-center font-bold">Loading PDF...</div>}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={containerWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page) => {
                      setPageWidth(page.width);
                    }}
                  />
                </Document>
              ) : (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center ${emptyStateText}`}
                >
                  <Upload size={80} strokeWidth={1} className="mb-4" />
                  <p className="text-xl font-bold">No Document Loaded</p>
                </div>
              )}

              {pdfFile && (
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
                    <div className="absolute -top-12 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: brandColor }}>
                      <Move size={16} />
                    </div>
                    <span
                      className="font-black whitespace-nowrap leading-none transition-colors"
                      style={{
                        // Formula to keep font size visual-accurate regardless of screen width
                        fontSize: `${(fontSize * containerWidth) / pageWidth}px`,
                        color: watermarkColor,
                        fontFamily: "Helvetica, Arial, sans-serif",
                      }}
                    >
                      {watermarkText || "PREVIEW"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {numPages > 1 && (
              <div className="flex items-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all ${
                    pageNumber === 1
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700"
                      : `bg-transparent ${inputText} ${inputBorder} hover:bg-slate-100 dark:hover:bg-slate-700`
                  }`}
                >
                  Previous
                </button>
                <span className={`text-xs font-bold ${textSecondary}`}>
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                  disabled={pageNumber === numPages}
                  className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all ${
                    pageNumber === numPages
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700"
                      : `bg-transparent ${inputText} ${inputBorder} hover:bg-slate-100 dark:hover:bg-slate-700`
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            <p className={`mt-6 text-sm font-medium italic ${noteText}`}>
              * Note: Watermark will be applied to the selected pages at this exact position.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PDFWatermarker;
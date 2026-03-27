"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box, Flex, VStack, Input, Text, Button, Heading, useToast, Divider,
  HStack, Badge, Center, IconButton, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel,
  Spinner
} from "@chakra-ui/react";
import { 
  Download, FileUp, Trash2, Type, Square, Circle, 
  Image as ImageIcon, ChevronLeft, ChevronRight, MousePointer2, Move, Eraser
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'select' | 'eraser';

interface Modification {
  id: string;
  page: number;
  type: ElementType;
  x: number;
  y: number;
  content?: string;
  width: number;
  height: number;
  style: React.CSSProperties;
}

const PDFProEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [history, setHistory] = useState<Modification[]>([]);
  const [activeTool, setActiveTool] = useState<ElementType>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [tempModifiedText, setTempModifiedText] = useState("");
  const [pendingElement, setPendingElement] = useState<Partial<Modification> | null>(null);

  const pdfExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (activeTool !== 'text') setPendingElement(null);
  }, [activeTool]);

  // --- MOUSE HANDLERS (DRAG & RESIZE) ---
  const handleMouseDown = (e: React.MouseEvent, id: string, action: 'drag' | 'resize' = 'drag') => {
    if (activeTool !== 'select' || isExporting) return;
    e.stopPropagation();
    setSelectedId(id);
    
    const mod = history.find(m => m.id === id);
    if (!mod) return;

    if (action === 'resize') {
      setResizingId(id);
    } else {
      setDraggingId(id);
    }

    setDragStart({ 
      x: e.clientX - mod.x, 
      y: e.clientY - mod.y,
      w: mod.width,
      h: mod.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isExporting) return;

    if (draggingId) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setHistory(prev => prev.map(mod => mod.id === draggingId ? { ...mod, x: newX, y: newY } : mod));
    }

    if (resizingId) {
      setHistory(prev => prev.map(mod => {
        if (mod.id !== resizingId) return mod;
        const newWidth = e.clientX - (dragStart.x + mod.x) + dragStart.w;
        const newHeight = e.clientY - (dragStart.y + mod.y) + dragStart.h;
        return { 
          ...mod, 
          width: Math.max(20, newWidth), 
          height: Math.max(20, newHeight) 
        };
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  // --- CORE LOGIC ---
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!file || activeTool === 'select' || isExporting) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    const target = e.target as HTMLElement;

    if (activeTool === 'text' && (target.tagName === "SPAN" || target.classList.contains("react-pdf__Page__textContent__item"))) {
      const span = target as HTMLSpanElement;
      const rect = span.getBoundingClientRect();
      const parentRect = pdfExportRef.current!.getBoundingClientRect();
      const styles = window.getComputedStyle(span);

      setTempModifiedText(span.innerText);
      setPendingElement({
        type: 'text',
        page: pageNumber,
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
        width: rect.width,
        height: rect.height,
        style: {
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily,
          fontWeight: styles.fontWeight,
          color: styles.color !== 'rgba(0, 0, 0, 0)' ? styles.color : 'black',
          backgroundColor: 'white',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center'
        }
      });
    } else if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'eraser') {
      const isEraser = activeTool === 'eraser';
      const newElem: Modification = {
        id: Math.random().toString(36).substr(2, 9),
        page: pageNumber,
        type: isEraser ? 'rect' : activeTool,
        x: x - 50,
        y: y - 25,
        width: 100,
        height: 50,
        style: {
          border: isEraser ? 'none' : '2px solid #3182CE',
          backgroundColor: isEraser ? 'white' : 'rgba(49, 130, 206, 0.2)',
          borderRadius: activeTool === 'circle' ? '50%' : '4px',
          zIndex: isEraser ? 999 : 1000
        }
      };
      setHistory(prev => [...prev, newElem]);
      setActiveTool('select');
    }
  };

  const commitTextChange = () => {
    if (!pendingElement) return;
    const newEntry: Modification = {
      id: Math.random().toString(36).substr(2, 9),
      ...pendingElement as Modification,
      content: tempModifiedText,
      width: pendingElement.width!,
      height: pendingElement.height!,
      style: { ...pendingElement.style, position: 'absolute' }
    };
    setHistory(prev => [...prev, newEntry]);
    setPendingElement(null);
    setActiveTool('select');
  };

  const exportPDF = async () => {
    if (!pdfExportRef.current) return;
    setIsExporting(true);
    setSelectedId(null);
    window.scrollTo(0, 0);

    // Give browser time to hide UI and stabilize text rendering
    await new Promise(r => setTimeout(r, 500));

    try {
      const element = pdfExportRef.current!;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`edited_${file?.name || "document"}.pdf`);
      toast({ title: "Success", status: "success" });
    } catch (err) {
      toast({ title: "Export failed", status: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Flex h="100vh" bg="#F0F2F5" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* TOOLBAR */}
      <VStack w="72px" bg="white" borderRight="1px solid #E2E8F0" py={6} spacing={4} shadow="xl" zIndex={10}>
        <IconButton aria-label="select" icon={<MousePointer2 size={20}/>} variant={activeTool === 'select' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('select')} />
        <IconButton aria-label="text" icon={<Type size={20}/>} variant={activeTool === 'text' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('text')} />
        <IconButton aria-label="rect" icon={<Square size={20}/>} variant={activeTool === 'rect' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('rect')} />
        <IconButton aria-label="circle" icon={<Circle size={20}/>} variant={activeTool === 'circle' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('circle')} />
        <IconButton aria-label="eraser" icon={<Eraser size={20}/>} variant={activeTool === 'eraser' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('eraser')} />
        
        <IconButton aria-label="image" icon={<ImageIcon size={20}/>} variant="ghost" colorScheme="blue" onClick={() => fileInputRef.current?.click()} />
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setHistory(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                page: pageNumber,
                type: 'image',
                x: 100, y: 100, width: 150, height: 100,
                content: ev.target?.result as string,
                style: { zIndex: 1000 }
              }]);
              setActiveTool('select');
            };
            reader.readAsDataURL(f);
          }
        }} />
      </VStack>

      {/* CANVAS */}
      <Box flex={1} overflow="auto" p={10} display="flex" flexDirection="column" alignItems="center">
        {file && (
            <HStack mb={6} bg="white" p={1} rounded="full" shadow="lg" border="1px solid #E2E8F0">
                <IconButton size="sm" icon={<ChevronLeft />} aria-label="prev" isDisabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} variant="ghost" rounded="full" />
                <Badge variant="subtle" colorScheme="blue" px={4} py={1} rounded="full">Page {pageNumber} / {numPages}</Badge>
                <IconButton size="sm" icon={<ChevronRight />} aria-label="next" isDisabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} variant="ghost" rounded="full" />
            </HStack>
        )}

        <Box 
          ref={pdfExportRef}
          position="relative" 
          bg="white" 
          shadow="2xl" 
          onClick={handleDocumentClick}
          display="inline-block"
        >
          {!file ? (
            <Center w="600px" h="800px" border="3px dashed #CBD5E0" rounded="3xl" flexDir="column" onClick={() => document.getElementById("upload")?.click()} cursor="pointer">
              <FileUp size={40} color="#3182CE" />
              <Heading size="md" mt={4}>Upload PDF</Heading>
              <input id="upload" type="file" hidden accept="application/pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            </Center>
          ) : (
            <Box position="relative">
              <Document file={file} onLoadSuccess={({numPages}) => setNumPages(numPages)}>
                <Page pageNumber={pageNumber} scale={1.5} renderAnnotationLayer={false} />
              </Document>

              {history.filter(m => m.page === pageNumber).map((mod) => (
                <Box 
                  key={mod.id} 
                  onMouseDown={(e) => handleMouseDown(e, mod.id)}
                  style={{
                    ...mod.style,
                    left: mod.x,
                    top: mod.y,
                    width: mod.width,
                    height: mod.height,
                    position: 'absolute',
                    outline: (selectedId === mod.id && !isExporting) ? '2px solid #3182CE' : 'none',
                    userSelect: 'none'
                  }}
                >
                  {mod.type === 'image' ? (
                    <img src={mod.content} style={{width:'100%', height:'100%', pointerEvents: 'none'}} alt=""/>
                  ) : mod.content}
                  
                  {selectedId === mod.id && !isExporting && (
                    <Box 
                      position="absolute" bottom="-5px" right="-5px" w="12px" h="12px" 
                      bg="blue.500" cursor="nwse-resize" rounded="full" border="2px solid white"
                      onMouseDown={(e) => handleMouseDown(e, mod.id, 'resize')}
                    />
                  )}
                </Box>
              ))}

              {pendingElement && (
                <Box style={{ ...pendingElement.style, left: pendingElement.x, top: pendingElement.y, width: pendingElement.width, height: pendingElement.height, position: 'absolute' }}>
                  {tempModifiedText}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* SIDEBAR */}
      <VStack w="320px" bg="white" borderLeft="1px solid #E2E8F0" p={6} align="stretch" spacing={6}>
        <Heading size="xs" letterSpacing="widest" color="gray.500">PROPERTIES</Heading>
        {pendingElement ? (
            <VStack align="stretch" bg="blue.50" p={4} rounded="xl">
                <Text fontSize="xs" fontWeight="bold">EDIT TEXT</Text>
                <Input value={tempModifiedText} onChange={e => setTempModifiedText(e.target.value)} bg="white" autoFocus/>
                <Button size="sm" colorScheme="blue" onClick={commitTextChange}>Apply</Button>
            </VStack>
        ) : selectedId ? (
            <Button size="sm" colorScheme="red" variant="ghost" leftIcon={<Trash2 size={14}/>} onClick={() => {
                setHistory(h => h.filter(m => m.id !== selectedId));
                setSelectedId(null);
            }}>Delete Selected</Button>
        ) : (
            <Text fontSize="sm" color="gray.400">Select an element to edit</Text>
        )}
        
        <Divider />
        <Button mt="auto" colorScheme="blue" h="56px" onClick={exportPDF} isLoading={isExporting} leftIcon={<Download />}>
            Download PDF
        </Button>
      </VStack>
    </Flex>
  );
};

export default PDFProEditor;
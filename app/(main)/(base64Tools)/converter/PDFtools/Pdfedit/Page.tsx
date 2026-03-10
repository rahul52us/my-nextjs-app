"use client";

import React, { useState, useRef } from "react";
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
  width?: number;
  height?: number;
  style: React.CSSProperties;
}
// `width` and `height` are used for text masks and shapes so
// that we can block out underlying PDF content when editing/erasing.

const PDFProEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [history, setHistory] = useState<Modification[]>([]);
  const [activeTool, setActiveTool] = useState<ElementType>('select');
  const [isExporting, setIsExporting] = useState(false);
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingPending, setDraggingPending] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [tempModifiedText, setTempModifiedText] = useState("");
  const [pendingElement, setPendingElement] = useState<Partial<Modification> | null>(null);

  // if the user changes tool while editing text, cancel the pending change
  React.useEffect(() => {
    if (activeTool !== 'text') {
      setPendingElement(null);
    }
  }, [activeTool]);

  const pdfExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool !== 'select' || isExporting) return;
    e.stopPropagation();
    setDraggingId(id);
    const mod = history.find(m => m.id === id);
    if (mod) {
      setDragStart({ x: e.clientX - mod.x, y: e.clientY - mod.y });
    }
  };

  // when editing text we allow dragging the preview to reposition it
  const handlePendingMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'text' || isExporting || !pendingElement) return;
    e.stopPropagation();
    setDraggingPending(true);
    setDragStart({ x: e.clientX - (pendingElement.x || 0), y: e.clientY - (pendingElement.y || 0) });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingPending && pendingElement && activeTool === 'text' && !isExporting) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPendingElement(prev => prev ? { ...prev, x: newX, y: newY } : prev);
      return;
    }

    if (!draggingId || activeTool !== 'select' || isExporting) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setHistory(prev => prev.map(mod => mod.id === draggingId ? { ...mod, x: newX, y: newY } : mod));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setDraggingPending(false);
  };

  // --- TOOLS LOGIC ---
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
          padding: '0px 2px',
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          display: 'flex',
          alignItems: 'center',
          cursor: 'move',
          // reserve the original span dimensions so we can mask it later
          width: rect.width,
          height: rect.height,
        }
      });
    } else if (activeTool === 'eraser' && (target.tagName === "SPAN" || target.classList.contains("react-pdf__Page__textContent__item"))) {
      // clicking text with eraser just masks the span area (with padding)
      const span = target as HTMLSpanElement;
      const rect = span.getBoundingClientRect();
      const parentRect = pdfExportRef.current!.getBoundingClientRect();
      const padX = 5;
      const padY = 2;
      const mask: Modification = {
        id: Math.random().toString(36).substr(2, 9),
        page: pageNumber,
        type: 'rect',
        x: rect.left - parentRect.left - padX,
        y: rect.top - parentRect.top - padY,
        width: rect.width + padX * 2,
        height: rect.height + padY * 2,
        style: { backgroundColor: 'white', border: 'none', cursor: 'move', zIndex: 1000 }
      };
      setHistory(prev => [...prev, mask]);
      setActiveTool('select');
    } else if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'eraser') {
      const isEraser = activeTool === 'eraser';
      const newShape: Modification = {
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
          cursor: 'move'
        }
      };
      setHistory(prev => [...prev, newShape]);
      setActiveTool('select'); 
    }
  };

  const commitTextChange = () => {
    if (!pendingElement) return;

    // create a white mask underneath to cover the original PDF text
    // add a small padding on each side to prevent leftover letters from
    // neighbouring spans bleeding through
    const mask: Modification | null = pendingElement.width && pendingElement.height
      ? (() => {
          const padX = 5;
          const padY = 2;
          return {
            id: Math.random().toString(36).substr(2, 9),
            page: pageNumber,
            type: 'rect',
            x: (pendingElement.x as number) - padX,
            y: (pendingElement.y as number) - padY,
            width: pendingElement.width + padX * 2,
            height: pendingElement.height + padY * 2,
            style: { backgroundColor: 'white', border: 'none', cursor: 'move', zIndex: 1000 }
          } as Modification;
        })()
      : null;

    const newEntry: Modification = {
      id: Math.random().toString(36).substr(2, 9),
      ...pendingElement as Modification,
      content: tempModifiedText,
      style: {
        ...pendingElement.style,
        position: 'absolute',
        zIndex: 1001,
        whiteSpace: 'pre-wrap',
        overflow: 'hidden'
      }
    };

    setHistory(prev => [...prev, ...(mask ? [mask] : []), newEntry]);
    setPendingElement(null);
    setActiveTool('select');
  };

  const exportPDF = async () => {
    if (!pdfExportRef.current) return;
    setIsExporting(true);
    
    // Reset scroll to top to ensure canvas coordinates match screen coordinates
    window.scrollTo(0, 0);

    setTimeout(async () => {
      try {
        const element = pdfExportRef.current!;
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "l" : "p",
          unit: "px",
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
        pdf.save(`edited_${file?.name || "document"}.pdf`);
        toast({ title: "Success", description: "PDF Exported", status: "success" });
      } catch (err) {
        toast({ title: "Error", description: "Export failed", status: "error" });
      } finally {
        setIsExporting(false);
      }
    }, 200);
  };

  return (
    <Flex h="100vh" bg="#F0F2F5" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* LEFT TOOLBAR */}
      <VStack w="72px" bg="white" borderRight="1px solid #E2E8F0" py={6} spacing={4} shadow="xl" zIndex={10}>
        <Tooltip label="Select & Move" placement="right"><IconButton aria-label="select" icon={<MousePointer2 size={20}/>} variant={activeTool === 'select' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('select')} /></Tooltip>
        <Tooltip label="Edit Text" placement="right"><IconButton aria-label="text" icon={<Type size={20}/>} variant={activeTool === 'text' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('text')} /></Tooltip>
        <Tooltip label="Rectangle" placement="right"><IconButton aria-label="rect" icon={<Square size={20}/>} variant={activeTool === 'rect' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('rect')} /></Tooltip>
        <Tooltip label="Circle" placement="right"><IconButton aria-label="circle" icon={<Circle size={20}/>} variant={activeTool === 'circle' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('circle')} /></Tooltip>
        <Tooltip label="Upload Image" placement="right"><IconButton aria-label="image" icon={<ImageIcon size={20}/>} variant="ghost" colorScheme="blue" onClick={() => fileInputRef.current?.click()} /></Tooltip>
        <Tooltip label="Eraser" placement="right"><IconButton aria-label="eraser" icon={<Eraser size={20}/>} variant={activeTool === 'eraser' ? 'solid' : 'ghost'} colorScheme="blue" onClick={() => setActiveTool('eraser')} /></Tooltip>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const newImg: Modification = {
                        id: Math.random().toString(36).substr(2, 9),
                        page: pageNumber,
                        type: 'image',
                        x: 100,
                        y: 100,
                        width: 150,
                        content: ev.target?.result as string,
                        style: { cursor: 'move', objectFit: 'contain' }
                    };
                    setHistory(prev => [...prev, newImg]);
                    setActiveTool('select');
                };
                reader.readAsDataURL(file);
            }
        }} />
      </VStack>

      {/* CENTER CANVAS */}
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
          display="inline-block" // Crucial for coordinate stability
        >
          {!file ? (
            <Center w="600px" h="800px" border="3px dashed #CBD5E0" rounded="3xl" flexDir="column" onClick={() => document.getElementById("upload")?.click()} cursor="pointer" _hover={{ bg: "white", borderColor: "blue.400" }}>
              <Box p={6} bg="blue.50" rounded="full" mb={4}><FileUp size={40} color="#3182CE" /></Box>
              <Heading size="md" color="gray.700">Upload PDF to Edit</Heading>
              <Text color="gray.500" mt={2}>Click to browse files</Text>
              <input id="upload" type="file" hidden accept="application/pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            </Center>
          ) : (
            <Box position="relative" userSelect={(activeTool === 'select' && !isExporting) ? 'none' : 'text'}>
              <Document file={file} onLoadSuccess={({numPages}) => setNumPages(numPages)}>
                <Page pageNumber={pageNumber} scale={1.5} renderAnnotationLayer={false} renderTextLayer={true} />
              </Document>

              {/* OVERLAY ELEMENTS */}
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
                    zIndex: draggingId === mod.id ? 100 : 20,
                    outline: (!isExporting && (draggingId === mod.id ? '2px solid #3182CE' : activeTool === 'select' ? '1px dashed #CBD5E0' : 'none')),
                  }}
                >
                  {mod.type === 'image' ? (
                    <img src={mod.content} alt="" style={{width: '100%', height: '100%', pointerEvents: 'none'}} />
                  ) : (
                    mod.content
                  )}
                  {activeTool === 'select' && !isExporting && (
                    <Box data-html2canvas-ignore="true" position="absolute" top="-10px" right="-10px" bg="blue.500" color="white" rounded="full" p={1}>
                      <Move size={10} />
                    </Box>
                  )}
                </Box>
              ))}
              {pendingElement && pendingElement.page === pageNumber && (
                <Box
                  onMouseDown={handlePendingMouseDown}
                  style={{
                    ...pendingElement.style,
                    left: pendingElement.x,
                    top: pendingElement.y,
                    width: pendingElement.width,
                    height: pendingElement.height,
                    position: 'absolute',
                    zIndex: 30,
                    cursor: 'move'
                  }}
                >
                  {tempModifiedText}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* RIGHT SIDEBAR */}
      <VStack w="360px" bg="white" borderLeft="1px solid #E2E8F0" p={6} align="stretch" spacing={6} shadow="2xl" zIndex={5}>
        <HStack justify="space-between">
            <Heading size="sm" letterSpacing="widest" color="gray.500">PRO EDITOR</Heading>
            <Button size="xs" leftIcon={<Eraser size={12}/>} variant="ghost" colorScheme="red" onClick={() => setHistory([])}>Clear All</Button>
        </HStack>

        <Tabs isFitted variant="unstyled">
          <TabList bg="gray.100" p={1} rounded="xl">
            <Tab _selected={{ bg: "white", shadow: "sm", rounded: "lg" }} fontWeight="bold" fontSize="xs">PROPERTIES</Tab>
            <Tab _selected={{ bg: "white", shadow: "sm", rounded: "lg" }} fontWeight="bold" fontSize="xs">LAYERS ({history.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
                {pendingElement ? (
                    <VStack align="stretch" spacing={4} mt={2} bg="blue.50" p={4} rounded="xl" border="1px solid" borderColor="blue.100">
                        <Text fontSize="xs" fontWeight="black" color="blue.600">TEXT REPLACEMENT</Text>
                        <Input value={tempModifiedText} onChange={(e) => setTempModifiedText(e.target.value)} bg="white" autoFocus />
                        <Button colorScheme="blue" size="sm" onClick={commitTextChange}>Save Change</Button>
                        <Button variant="ghost" size="xs" onClick={() => setPendingElement(null)}>Cancel</Button>
                    </VStack>
                ) : (
                    <VStack spacing={4} py={10} textAlign="center">
                        <MousePointer2 size={30} color="#CBD5E0" />
                        {activeTool === 'text' && <Text color="gray.400" fontSize="sm">Click "Edit Text" then select text on the PDF to change it.</Text>}
                        {activeTool === 'eraser' && <Text color="gray.400" fontSize="sm">Click text or anywhere to drop a white mask (eraser).</Text>}
                        {activeTool !== 'text' && activeTool !== 'eraser' && <Text color="gray.400" fontSize="sm">Select a tool on the left then click on the PDF to use it.</Text>}
                    </VStack>
                )}
            </TabPanel>

            <TabPanel px={0}>
                <VStack align="stretch" maxH="60vh" overflowY="auto" spacing={2} py={2}>
                    {history.map((mod) => (
                        <HStack key={mod.id} p={3} bg="gray.50" rounded="lg" justify="space-between" _hover={{bg: "gray.100"}}>
                            <HStack>
                                {mod.type === 'text' ? <Type size={14}/> : mod.type === 'image' ? <ImageIcon size={14}/> : <Square size={14}/>}
                                <Text fontSize="xs" fontWeight="bold" isTruncated maxW="150px">{mod.content || mod.type.toUpperCase()}</Text>
                            </HStack>
                            <IconButton aria-label="del" icon={<Trash2 size={12}/>} size="xs" colorScheme="red" variant="ghost" onClick={() => setHistory(h => h.filter(i => i.id !== mod.id))} />
                        </HStack>
                    ))}
                </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />
        
        <VStack mt="auto" spacing={4}>
            <Button 
                w="full" colorScheme="blue" h="56px" leftIcon={isExporting ? <Spinner size="xs" /> : <Download size={20} />} 
                onClick={exportPDF} isDisabled={!file || isExporting} shadow="xl" rounded="xl"
            >
              {isExporting ? "Processing..." : "Download Clean PDF"}
            </Button>
        </VStack>
      </VStack>
    </Flex>
  );
};

export default PDFProEditor;
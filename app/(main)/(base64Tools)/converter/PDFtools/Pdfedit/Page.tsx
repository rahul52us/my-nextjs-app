"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, Flex, Heading, Input, VStack, HStack, IconButton,
  Text, useToast, Divider, Tooltip, Kbd, NumberInput, NumberInputField,
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion } from 'framer-motion';
import { SketchPicker } from 'react-color';
import { saveAs } from 'file-saver';
import {
  FiDownload, FiUpload, FiType, FiSquare, FiImage,
  FiTrash2, FiMaximize, FiChevronLeft, FiChevronRight,
  FiRotateCcw, FiMousePointer, FiEyeOff, FiBold, FiItalic
} from 'react-icons/fi';

// Initialize PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- Types ---
type ElementType = 'text' | 'shape' | 'image' | 'redaction';

interface EditorElement {
  id: string;
  page: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color: string;
  opacity: number;
  imageData?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
}

const AdvancedPDFEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalColor, setGlobalColor] = useState("#000000");
  const [showGlobalColorPicker, setShowGlobalColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom] = useState(1.2);
  const [selectTextMode, setSelectTextMode] = useState(false);

  const toast = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find(el => el.id === selectedId);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setElements([]);
      setCurrentPage(1);
    }
  };

  const addElement = (type: ElementType) => {
    if (!file) return;
    const isText = type === 'text';
    const newEl: EditorElement = {
      id: `el-${Date.now()}`,
      page: currentPage,
      type,
      x: 100,
      y: 100,
      width: isText ? 200 : 100,
      height: isText ? 40 : 100,
      color: isText ? globalColor : (type === 'redaction' ? "#000000" : "#3182ce"),
      opacity: type === 'redaction' ? 1 : 0.7,
      content: isText ? "New Text" : "",
      fontSize: isText ? 16 : undefined,
      bold: false,
      italic: false,
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (imgFile) {
      const reader = new FileReader();
      reader.onload = (r) => {
        const newEl: EditorElement = {
          id: `img-${Date.now()}`,
          page: currentPage,
          type: 'image',
          x: 150,
          y: 150,
          width: 150,
          height: 150,
          imageData: r.target?.result as string,
          color: '',
          opacity: 1
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
      };
      reader.readAsDataURL(imgFile);
    }
  };

  // ── Click-to-Edit Logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (!selectTextMode || !canvasRef.current || !file) return;

    const textLayer = canvasRef.current.querySelector('.react-pdf__Page__textContent') as HTMLElement;
    if (!textLayer) return;

    const handleTextClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'SPAN') {
        e.stopPropagation();
        e.preventDefault();

        const rect = target.getBoundingClientRect();
        const containerRect = canvasRef.current!.getBoundingClientRect();

        const x = rect.left - containerRect.left + (canvasRef.current?.scrollLeft || 0);
        const y = rect.top - containerRect.top + (canvasRef.current?.scrollTop || 0);

        const computedStyle = window.getComputedStyle(target);
        const fontSizePx = parseFloat(computedStyle.fontSize);

        const newEl: EditorElement = {
          id: `txt-${Date.now()}`,
          page: currentPage,
          type: 'text',
          x,
          y,
          width: rect.width + 10,
          height: rect.height + 4,
          content: target.innerText.trim(),
          color: globalColor,
          fontSize: fontSizePx || 16,
          bold: parseInt(computedStyle.fontWeight) >= 600,
          italic: computedStyle.fontStyle === 'italic',
          opacity: 1,
        };

        setElements(prev => [...prev, newEl]);
        setSelectedId(newEl.id);
        target.style.visibility = 'hidden';
        setSelectTextMode(false);
        toast({ title: "Text selected", status: "info", duration: 1500 });
      }
    };

    textLayer.addEventListener('mousedown', handleTextClick);
    return () => textLayer.removeEventListener('mousedown', handleTextClick);
  }, [selectTextMode, currentPage, file, globalColor, toast]);

  // ── Export Logic ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!file || !canvasRef.current) return;
    setIsExporting(true);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      const helvBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

      const pdfCanvas = canvasRef.current.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      const canvasWidth = pdfCanvas.clientWidth;

      for (const el of elements) {
        const pageIndex = el.page - 1;
        if (pageIndex >= pages.length) continue;
        const page = pages[pageIndex];
        const { width: pWidth, height: pHeight } = page.getSize();
        const scale = pWidth / canvasWidth;

        const pdfX = el.x * scale;
        const pdfY = pHeight - (el.y + el.height) * scale;

        const r = parseInt(el.color.slice(1, 3), 16) / 255 || 0;
        const g = parseInt(el.color.slice(3, 5), 16) / 255 || 0;
        const b = parseInt(el.color.slice(5, 7), 16) / 255 || 0;

        if (el.type === 'text' && el.content) {
          let font = helvetica;
          if (el.bold && el.italic) font = helvBoldOblique;
          else if (el.bold) font = helveticaBold;
          else if (el.italic) font = helveticaOblique;

          page.drawText(el.content, {
            x: pdfX,
            y: pdfY + (2 * scale), // Minor offset for baseline alignment
            size: (el.fontSize || 16) * scale * 0.96,
            font,
            color: rgb(r, g, b),
            opacity: el.opacity,
          });
        } else if (el.type === 'shape' || el.type === 'redaction') {
          page.drawRectangle({
            x: pdfX, y: pdfY, width: el.width * scale, height: el.height * scale,
            color: rgb(r, g, b), opacity: el.opacity,
          });
        } else if (el.type === 'image' && el.imageData) {
          const isPng = el.imageData.includes('png');
          const img = isPng ? await pdfDoc.embedPng(el.imageData) : await pdfDoc.embedJpg(el.imageData);
          page.drawImage(img, {
            x: pdfX, y: pdfY, width: el.width * scale, height: el.height * scale,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      
      // FIXED: Using Uint8Array copy to bypass SharedArrayBuffer / BlobPart issues
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `edited_${file.name}`);

      toast({ title: "Success", description: "PDF downloaded.", status: "success" });
    } catch (err) {
      console.error(err);
      toast({ title: "Export failed", status: "error", description: String(err) });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box minH="100vh" bg="#f8fafc" p={8}>
      <VStack spacing={6} w="full">
        <Flex w="full" justify="space-between" align="center">
          <Heading size="lg" color="teal.600">PDF Studio</Heading>
          <HStack>
            <Button leftIcon={<FiRotateCcw />} variant="ghost" onClick={() => window.location.reload()} isDisabled={!file}>Reset</Button>
            <Button colorScheme="teal" leftIcon={<FiDownload />} onClick={handleExport} isLoading={isExporting} isDisabled={!file}>Export</Button>
          </HStack>
        </Flex>

        <Flex w="full" bg="white" p={4} borderRadius="xl" shadow="sm" justify="center" gap={6} wrap="wrap">
          <Button as="label" colorScheme="blue" leftIcon={<FiUpload />} cursor="pointer">
            Upload PDF
            <input type="file" hidden accept="application/pdf" onChange={onFileChange} />
          </Button>
          <Divider orientation="vertical" h="40px" />
          <HStack spacing={3}>
            <Tooltip label="Text"><IconButton aria-label="Text" icon={<FiType />} onClick={() => addElement('text')} isDisabled={!file} /></Tooltip>
            <Tooltip label="Shape"><IconButton aria-label="Shape" icon={<FiSquare />} onClick={() => addElement('shape')} isDisabled={!file} /></Tooltip>
            <Tooltip label="Redact"><IconButton aria-label="Redact" icon={<FiEyeOff />} onClick={() => addElement('redaction')} isDisabled={!file} colorScheme="red" /></Tooltip>
            <Tooltip label="Edit Existing"><IconButton aria-label="Select" icon={<FiMousePointer />} onClick={() => setSelectTextMode(!selectTextMode)} colorScheme={selectTextMode ? "orange" : "gray"} isDisabled={!file} /></Tooltip>
            <Button as="label" variant="outline" leftIcon={<FiImage />} isDisabled={!file} cursor="pointer">
              Image
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
          </HStack>
          <Box boxSize="24px" borderRadius="full" bg={globalColor} border="2px solid gray" cursor="pointer" onClick={() => setShowGlobalColorPicker(!showGlobalColorPicker)} />
          {showGlobalColorPicker && (
            <Box pos="absolute" zIndex={300} mt="250px">
              <SketchPicker color={globalColor} onChange={c => setGlobalColor(c.hex)} />
              <Button size="xs" w="full" mt={2} onClick={() => setShowGlobalColorPicker(false)}>Done</Button>
            </Box>
          )}
        </Flex>

        {selectedElement?.type === 'text' && (
          <HStack bg="white" p={2} borderRadius="md" shadow="sm">
            <IconButton size="sm" aria-label="B" icon={<FiBold />} colorScheme={selectedElement.bold ? "teal" : "gray"} onClick={() => updateElement(selectedId!, { bold: !selectedElement.bold })} />
            <IconButton size="sm" aria-label="I" icon={<FiItalic />} colorScheme={selectedElement.italic ? "teal" : "gray"} onClick={() => updateElement(selectedId!, { italic: !selectedElement.italic })} />
            <NumberInput size="sm" w="70px" value={selectedElement.fontSize} onChange={v => updateElement(selectedId!, { fontSize: Number(v) })}>
              <NumberInputField />
            </NumberInput>
          </HStack>
        )}

        <Flex w="full" gap={6}>
          <Box flex={1} bg="white" shadow="xl" borderRadius="xl" overflow="auto" minH="80vh" ref={canvasRef} p={4} position="relative">
            {!file ? (
              <Flex h="full" minH="400px" align="center" justify="center" direction="column" color="gray.300">
                <FiUpload size={48} />
                <Text mt={2}>Upload a PDF to start</Text>
              </Flex>
            ) : (
              <Box position="relative" mx="auto" w="max-content">
                <Document file={file} onLoadSuccess={pdf => setNumPages(pdf.numPages)}>
                  <Page pageNumber={currentPage} scale={zoom} renderAnnotationLayer={false} />
                </Document>
                
                {selectTextMode && <Box pos="absolute" top={0} left={0} w="full" h="full" zIndex={5} border="4px dashed" borderColor="orange.300" pointerEvents="none" />}

                {elements.filter(el => el.page === currentPage).map(el => (
                  <motion.div
                    key={el.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y })}
                    style={{ position: 'absolute', left: el.x, top: el.y, zIndex: selectedId === el.id ? 100 : 10 }}
                    onClick={() => setSelectedId(el.id)}
                  >
                    <Box
                      w={`${el.width}px`} h={`${el.height}px`}
                      border={selectedId === el.id ? "2px solid #319795" : "1px dashed transparent"}
                      bg={el.type === 'redaction' || el.type === 'shape' ? el.color : 'transparent'}
                      opacity={el.opacity}
                    >
                      {el.type === 'text' && (
                        <Input
                          variant="unstyled" value={el.content} h="full" px={1}
                          onChange={e => updateElement(el.id, { content: e.target.value })}
                          fontSize={`${el.fontSize}px`} fontWeight={el.bold ? 'bold' : 'normal'} fontStyle={el.italic ? 'italic' : 'normal'}
                          color={el.color} _focus={{ outline: 'none' }}
                        />
                      )}
                      {el.type === 'image' && el.imageData && <img src={el.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                      
                      {selectedId === el.id && (
                        <HStack pos="absolute" top="-30px" right={0} spacing={1}>
                          <IconButton size="xs" icon={<FiMaximize />} aria-label="resize" onMouseDown={e => {
                            e.stopPropagation();
                            const startX = e.clientX, startY = e.clientY, sw = el.width, sh = el.height;
                            const move = (m: MouseEvent) => updateElement(el.id, { width: Math.max(20, sw + m.clientX - startX), height: Math.max(20, sh + m.clientY - startY) });
                            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                            window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                          }} />
                          <IconButton size="xs" icon={<FiTrash2 />} colorScheme="red" aria-label="delete" onClick={() => deleteElement(el.id)} />
                        </HStack>
                      )}
                    </Box>
                  </motion.div>
                ))}
              </Box>
            )}
          </Box>
        </Flex>
        
        <HStack spacing={4} color="gray.400" fontSize="xs">
          <Text><Kbd>Page</Kbd> {currentPage} of {numPages}</Text>
          <IconButton size="xs" icon={<FiChevronLeft />} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} isDisabled={currentPage === 1} aria-label="prev" />
          <IconButton size="xs" icon={<FiChevronRight />} onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} isDisabled={currentPage === numPages} aria-label="next" />
        </HStack>
      </VStack>
    </Box>
  );
};

export default AdvancedPDFEditor;
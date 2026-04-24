"use client";

import React, { useState, useRef } from "react";
import {
  Box, Flex, VStack, useToast, HStack, Badge, Center,
  IconButton, Heading, useColorModeValue, useDisclosure,
  Button, useBreakpointValue,
} from "@chakra-ui/react";
import { FileUp, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import Toolbar from "./Toolbar";
import PropertiesSidebar from "./PropertiesSidebar";
import TextEditor from "./TextEditor";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFProEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [activeTextEditor, setActiveTextEditor] = useState<{
    id: string | null;
    text: string;
    style: React.CSSProperties;
    position: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const pdfExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Mobile sidebar drawer
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // ✅ Dark/light theme colors
  const pageBg = useColorModeValue("#F0F2F5", "gray.900");
  const pdfBg = useColorModeValue("white", "gray.800");
  const pdfShadow = useColorModeValue("2xl", "dark-lg");
  const paginationBg = useColorModeValue("white", "gray.700");
  const uploadBorderColor = useColorModeValue("#CBD5E0", "#4A5568");
  const uploadHeadingColor = useColorModeValue("gray.700", "gray.200");
  const uploadIconColor = useColorModeValue("#3182CE", "#63B3ED");
  const pageTextColor = useColorModeValue("gray.600", "gray.300");
  const elementOutlineColor = useColorModeValue("#3182CE", "#63B3ED");
  const resizeHandleBg = useColorModeValue("blue.500", "blue.300");

  const pdfScale = useBreakpointValue({ base: 0.8, sm: 1.0, md: 1.2, lg: 1.5 }) || 1.5;

  const updateElementStyle = (id: string, newStyle: React.CSSProperties) => {
    setHistory(prev =>
      prev.map(m => (m.id === id ? { ...m, style: { ...m.style, ...newStyle } } : m))
    );
  };

  const updateElementSize = (id: string, w: number, h: number) => {
    setHistory(prev =>
      prev.map(m => (m.id === id ? { ...m, width: w, height: h } : m))
    );
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, action: "drag" | "resize" = "drag") => {
    if (activeTool !== "select" || isExporting) return;
    e.stopPropagation();
    setSelectedId(id);
    const mod = history.find(m => m.id === id);
    if (!mod) return;
    if (action === "resize") setResizingId(id);
    else setDraggingId(id);
    setDragStart({ x: e.clientX - mod.x, y: e.clientY - mod.y, w: mod.width, h: mod.height });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      setHistory(prev =>
        prev.map(m =>
          m.id === draggingId
            ? { ...m, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }
            : m
        )
      );
    }
    if (resizingId) {
      setHistory(prev =>
        prev.map(m =>
          m.id === resizingId
            ? {
                ...m,
                width: Math.max(20, e.clientX - (dragStart.x + m.x) + dragStart.w),
                height: Math.max(20, e.clientY - (dragStart.y + m.y) + dragStart.h),
              }
            : m
        )
      );
    }
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    if (!file || activeTool === "select" || isExporting) return;
    if (activeTextEditor) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    const target = e.target as HTMLElement;

    if (activeTool === "text") {
      if (
        target.tagName === "SPAN" ||
        target.classList.contains("react-pdf__Page__textContent__item")
      ) {
        const styles = window.getComputedStyle(target);
        const rect = target.getBoundingClientRect();
        const parentRect = pdfExportRef.current!.getBoundingClientRect();
        setActiveTextEditor({
          id: null,
          text: target.innerText,
          style: { fontSize: styles.fontSize, fontFamily: styles.fontFamily, color: "#000000" },
          position: {
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top,
            width: Math.max(rect.width, 200),
            height: Math.max(rect.height, 40),
          },
        });
        (target as HTMLElement).style.visibility = "hidden";
      } else {
        setActiveTextEditor({
          id: null,
          text: "",
          style: { fontSize: "16px", fontFamily: "Arial, sans-serif", color: "#000000" },
          position: { x, y, width: 250, height: 50 },
        });
      }
      return;
    }

    if (["rect", "circle", "eraser"].includes(activeTool)) {
      const isEraser = activeTool === "eraser";
      setHistory([
        ...history,
        {
          id: Math.random().toString(36).substr(2, 9),
          page: pageNumber,
          type: isEraser ? "rect" : activeTool,
          x: x - 50,
          y: y - 25,
          width: 100,
          height: 50,
          style: {
            border: isEraser ? "none" : "2px solid #3182CE",
            backgroundColor: isEraser ? "white" : "rgba(49, 130, 206, 0.2)",
            borderRadius: activeTool === "circle" ? "50%" : "4px",
            zIndex: isEraser ? 999 : 1000,
          },
        },
      ]);
      setActiveTool("select");
    }
  };

  const handleElementDoubleClick = (e: React.MouseEvent, mod: any) => {
    if (mod.type !== "text") return;
    e.stopPropagation();
    setActiveTextEditor({
      id: mod.id,
      text: mod.content || "",
      style: mod.style || {},
      position: { x: mod.x, y: mod.y, width: mod.width, height: mod.height },
    });
  };

  const handleTextCommit = (text: string, style: React.CSSProperties) => {
    if (!activeTextEditor) return;
    if (activeTextEditor.id) {
      setHistory(prev =>
        prev.map(m =>
          m.id === activeTextEditor.id
            ? { ...m, content: text, style: { ...m.style, ...style }, width: Math.max(m.width, 200), height: Math.max(m.height, 40) }
            : m
        )
      );
    } else {
      if (text.trim()) {
        setHistory(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            page: pageNumber,
            type: "text",
            x: activeTextEditor.position.x,
            y: activeTextEditor.position.y,
            width: Math.max(activeTextEditor.position.width, 200),
            height: Math.max(activeTextEditor.position.height, 40),
            content: text,
            style: { ...style, zIndex: 1001, display: "flex", alignItems: "flex-start", whiteSpace: "pre-wrap", wordBreak: "break-word" },
          },
        ]);
      }
    }
    setActiveTextEditor(null);
    setActiveTool("select");
    toast({ title: "Text applied", status: "success", duration: 1000 });
  };

  const handleTextCancel = () => {
    setActiveTextEditor(null);
    setActiveTool("select");
  };

  const handleReset = () => {
    setHistory([]);
    setSelectedId(null);
    setActiveTextEditor(null);
    toast({ title: "Reset", description: "All elements have been removed.", status: "info", duration: 1500 });
  };

  const exportPDF = async () => {
    setIsExporting(true);
    setSelectedId(null);
    setActiveTextEditor(null);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(pdfExportRef.current!, { scale: 2, useCORS: true });
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "l" : "p",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("edited_document.pdf");
        toast({ title: "Exported successfully", status: "success" });
      } catch {
        toast({ title: "Export failed", status: "error" });
      }
      setIsExporting(false);
    }, 500);
  };

  const selectedElement = history.find(m => m.id === selectedId);

  return (
    <VStack
      h="100vh"
      spacing={0}
      bg={pageBg}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { setDraggingId(null); setResizingId(null); }}
    >
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onImageUpload={() => fileInputRef.current?.click()}
      />

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) {
            const r = new FileReader();
            r.onload = ev =>
              setHistory([
                ...history,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  page: pageNumber,
                  type: "image",
                  x: 100, y: 100, width: 150, height: 100,
                  content: ev.target?.result,
                  style: { zIndex: 1000 },
                },
              ]);
            r.readAsDataURL(f);
          }
        }}
      />

      <Flex flex={1} w="full" overflow="hidden">
        {/* Main Canvas Area */}
        <Box flex={1} overflow="auto" p={{ base: 4, md: 10 }} display="flex" flexDirection="column" alignItems="center">
          {/* Mobile: Properties button */}
          {isMobile && (
            <Flex w="full" justify="flex-end" mb={2}>
              <Button
                size="sm"
                leftIcon={<Settings size={14} />}
                onClick={onSidebarOpen}
                colorScheme="blue"
                variant="outline"
              >
                Properties
              </Button>
            </Flex>
          )}

          {file && (
            <HStack mb={4} bg={paginationBg} p={1} rounded="full" shadow="sm">
              <IconButton
                size="sm" icon={<ChevronLeft />} aria-label="prev"
                isDisabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} variant="ghost"
              />
              <Badge variant="subtle" colorScheme="blue" color={pageTextColor}>
                Page {pageNumber} / {numPages}
              </Badge>
              <IconButton
                size="sm" icon={<ChevronRight />} aria-label="next"
                isDisabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} variant="ghost"
              />
            </HStack>
          )}

          <Box
            ref={pdfExportRef}
            position="relative"
            bg={pdfBg}
            shadow={pdfShadow}
            onClick={handleDocumentClick}
            cursor={activeTool === "text" ? "text" : activeTool === "select" ? "default" : "crosshair"}
            maxW="100%"
            overflowX="auto"
          >
            {!file ? (
              <Center
                w={{ base: "320px", sm: "480px", md: "600px" }}
                h={{ base: "450px", md: "800px" }}
                border={`3px dashed ${uploadBorderColor}`}
                rounded="3xl"
                flexDir="column"
                onClick={() => document.getElementById("upload")?.click()}
                cursor="pointer"
              >
                <FileUp size={40} color={uploadIconColor} />
                <Heading size="md" mt={4} color={uploadHeadingColor}>Upload PDF</Heading>
                <input
                  id="upload" type="file" hidden accept="application/pdf"
                  onChange={e => e.target.files && setFile(e.target.files[0])}
                />
              </Center>
            ) : (
              <Box position="relative">
                <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                  <Page
                    pageNumber={pageNumber}
                    scale={pdfScale}
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                </Document>

                {history
                  .filter(m => m.page === pageNumber)
                  .map(mod => (
                    <Box
                      key={mod.id}
                      onMouseDown={e => handleMouseDown(e, mod.id)}
                      onDoubleClick={e => handleElementDoubleClick(e, mod)}
                      style={{
                        ...mod.style,
                        left: mod.x,
                        top: mod.y,
                        width: mod.width,
                        height: mod.height,
                        position: "absolute",
                        outline: selectedId === mod.id && !isExporting ? `2px solid ${elementOutlineColor}` : "none",
                        userSelect: "none",
                        cursor: activeTool === "select" ? "move" : "default",
                      }}
                    >
                      {mod.type === "image" ? (
                        <img src={mod.content} style={{ width: "100%", height: "100%", pointerEvents: "none" }} />
                      ) : mod.type === "text" ? (
                        <Box
                          style={{
                            ...mod.style,
                            width: "100%",
                            height: "100%",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                        >
                          {mod.content}
                        </Box>
                      ) : (
                        mod.content
                      )}

                      {selectedId === mod.id && !isExporting && (
                        <Box
                          position="absolute"
                          bottom="-5px"
                          right="-5px"
                          w="12px"
                          h="12px"
                          bg={resizeHandleBg}
                          cursor="nwse-resize"
                          rounded="full"
                          border="2px solid white"
                          onMouseDown={e => handleMouseDown(e, mod.id, "resize")}
                        />
                      )}
                    </Box>
                  ))}

                {activeTextEditor && (
                  <TextEditor
                    initialText={activeTextEditor.text}
                    initialStyle={activeTextEditor.style}
                    position={activeTextEditor.position}
                    onCommit={handleTextCommit}
                    onCancel={handleTextCancel}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Sidebar — desktop only inline, mobile as drawer */}
        <PropertiesSidebar
          selectedElement={selectedElement}
          updateElementStyle={updateElementStyle}
          updateElementSize={updateElementSize}
          deleteElement={id => { setHistory(history.filter(m => m.id !== id)); setSelectedId(null); }}
          exportPDF={exportPDF}
          isExporting={isExporting}
          onReset={handleReset}
          onEditText={mod => {
            setActiveTextEditor({
              id: mod.id,
              text: mod.content || "",
              style: mod.style || {},
              position: { x: mod.x, y: mod.y, width: mod.width, height: mod.height },
            });
          }}
          isOpen={isSidebarOpen}
          onClose={onSidebarClose}
        />
      </Flex>
    </VStack>
  );
};

export default PDFProEditor;
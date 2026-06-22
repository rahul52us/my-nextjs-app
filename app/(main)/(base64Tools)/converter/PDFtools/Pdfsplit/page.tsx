"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  IconButton,
  useToast,
  Divider,
  Spinner,
  Center,
  useColorModeValue,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  DownloadIcon, 
  AddIcon,
  RepeatIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { FaFilePdf, FaLayerGroup, FaEye, FaCheckDouble, FaFileArchive, FaCropAlt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import JSZip from 'jszip';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileData {
  file: File;
  url: string;
  pageCount: number;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PREVIEW_PAGE_WIDTH = 500;
const CROP_MODAL_PAGE_WIDTH = 450;
const MAX_HISTORY = 30;

interface HistorySnapshot {
  pdfBytes: Uint8Array;
  fileName: string;
  pageCount: number;
  selectedPages: number[];
  activePage: number | null;
}

const PdfSplitter: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [range, setRange] = useState({ from: '', to: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropPageIndex, setCropPageIndex] = useState<number | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [cropDrag, setCropDrag] = useState<{ startX: number; startY: number } | null>(null);
  const [historyPast, setHistoryPast] = useState<HistorySnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<HistorySnapshot[]>([]);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // ── Theme tokens ──
  const bgPage        = useColorModeValue('gray.50',   'gray.950');
  const bgCard        = useColorModeValue('white',     'gray.900');
  const borderColor   = useColorModeValue('gray.100',  'gray.700');
  const textMuted     = useColorModeValue('gray.500',  'gray.400');
  const previewBg     = useColorModeValue('gray.100',  'gray.800');
  const headingColor  = useColorModeValue('gray.800',  'gray.100');
  const labelColor    = useColorModeValue('gray.400',  'gray.500');
  const pageNavBorder = useColorModeValue('gray.100',  'gray.700');
  const pageNavColor  = useColorModeValue('gray.600',  'gray.300');
  const dropBorder    = useColorModeValue('gray.200',  'gray.600');
  const dropBg        = useColorModeValue('white',     'gray.900');
  const dropHoverBorder = useColorModeValue('blue.400','blue.400');
  const inputBg       = useColorModeValue('white',     'gray.800');
  const emptyIconColor = useColorModeValue('gray.300', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.400', 'gray.500');

  useEffect(() => {
    return () => {
      if (fileData?.url) URL.revokeObjectURL(fileData.url);
    };
  }, [fileData]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        if (fileData?.url) URL.revokeObjectURL(fileData.url);
        setFileData({
          file,
          url: URL.createObjectURL(file),
          pageCount: pdfDoc.getPageCount(),
        });
        setSelectedPages([]);
        setActivePage(null);
        setHistoryPast([]);
        setHistoryFuture([]);
        setRange({ from: '', to: '' });
      } catch (error) {
        toast({ title: "Error loading PDF", status: "error", duration: 3000 });
      }
    }
  }, [fileData, toast]);

  const captureSnapshot = useCallback(async (): Promise<HistorySnapshot | null> => {
    if (!fileData) return null;
    return {
      pdfBytes: new Uint8Array(await fileData.file.arrayBuffer()),
      fileName: fileData.file.name,
      pageCount: fileData.pageCount,
      selectedPages: [...selectedPages],
      activePage,
    };
  }, [fileData, selectedPages, activePage]);

  const restoreSnapshot = useCallback((snapshot: HistorySnapshot) => {
    if (fileData?.url) URL.revokeObjectURL(fileData.url);
    const blob = new Blob([snapshot.pdfBytes], { type: 'application/pdf' });
    const newFile = new File([blob], snapshot.fileName, { type: 'application/pdf' });
    const newUrl = URL.createObjectURL(blob);
    setFileData({ file: newFile, url: newUrl, pageCount: snapshot.pageCount });
    setSelectedPages(snapshot.selectedPages);
    setActivePage(snapshot.activePage);
  }, [fileData]);

  const applyPdfUpdate = useCallback(async (mutator: (pdfDoc: PDFDocument) => void): Promise<boolean> => {
    if (!fileData) return false;
    const snapshot = await captureSnapshot();
    if (!snapshot) return false;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(snapshot.pdfBytes);
      mutator(pdfDoc);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (fileData.url) URL.revokeObjectURL(fileData.url);
      const newFile = new File([blob], fileData.file.name, { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);
      setFileData({
        file: newFile,
        url: newUrl,
        pageCount: pdfDoc.getPageCount(),
      });
      setHistoryPast(prev => [...prev.slice(-(MAX_HISTORY - 1)), snapshot]);
      setHistoryFuture([]);
      return true;
    } catch {
      toast({ title: "Operation failed", status: "error", duration: 3000 });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [fileData, captureSnapshot, toast]);

  const handleUndo = useCallback(async () => {
    if (!fileData || historyPast.length === 0 || isProcessing) return;
    const current = await captureSnapshot();
    if (!current) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, -1));
    setHistoryFuture(prev => [current, ...prev]);
    restoreSnapshot(previous);
    toast({ title: "Reverted back", status: "info", duration: 1500 });
  }, [fileData, historyPast, isProcessing, captureSnapshot, restoreSnapshot, toast]);

  const handleRedo = useCallback(async () => {
    if (!fileData || historyFuture.length === 0 || isProcessing) return;
    const current = await captureSnapshot();
    if (!current) return;
    const next = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setHistoryPast(prev => [...prev, current]);
    restoreSnapshot(next);
    toast({ title: "Moved forward", status: "info", duration: 1500 });
  }, [fileData, historyFuture, isProcessing, captureSnapshot, restoreSnapshot, toast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!fileData) return;
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fileData, handleUndo, handleRedo]);

  const handleDeletePage = async (pageIndex: number) => {
    if (!fileData) return;
    if (fileData.pageCount <= 1) {
      toast({ title: "Cannot delete", description: "PDF must have at least one page", status: "warning", duration: 3000 });
      return;
    }
    const ok = await applyPdfUpdate((pdfDoc) => pdfDoc.removePage(pageIndex));
    if (!ok) return;
    setSelectedPages(prev => prev.filter(p => p !== pageIndex).map(p => (p > pageIndex ? p - 1 : p)));
    setActivePage(prev => {
      if (prev === null) return null;
      if (prev === pageIndex) return null;
      return prev > pageIndex ? prev - 1 : prev;
    });
    toast({ title: "Page deleted", status: "success", duration: 2000 });
  };

  const handleRotatePage = async (pageIndex: number) => {
    const ok = await applyPdfUpdate((pdfDoc) => {
      const page = pdfDoc.getPage(pageIndex);
      const current = page.getRotation().angle;
      page.setRotation(degrees(current + 90));
    });
    if (ok) toast({ title: "Page rotated 90°", status: "success", duration: 2000 });
  };

  const openCropModal = (pageIndex: number) => {
    setCropPageIndex(pageIndex);
    setCropRect(null);
    setCropDrag(null);
  };

  const closeCropModal = () => {
    setCropPageIndex(null);
    setCropRect(null);
    setCropDrag(null);
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropDrag({ startX: x, startY: y });
    setCropRect({ x, y, width: 0, height: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!cropDrag || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropRect({
      x: Math.min(cropDrag.startX, x),
      y: Math.min(cropDrag.startY, y),
      width: Math.abs(x - cropDrag.startX),
      height: Math.abs(y - cropDrag.startY),
    });
  };

  const handleApplyCrop = async () => {
    if (cropPageIndex === null || !cropRect || cropRect.width < 10 || cropRect.height < 10) {
      toast({ title: "Select a crop area", status: "warning", duration: 2500 });
      return;
    }
    const pageIndex = cropPageIndex;
    const selection = cropRect;
    const container = cropContainerRef.current;
    const ok = await applyPdfUpdate((pdfDoc) => {
      const page = pdfDoc.getPage(pageIndex);
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const displayWidth = container?.clientWidth || CROP_MODAL_PAGE_WIDTH;
      const displayHeight = container?.clientHeight || CROP_MODAL_PAGE_WIDTH * 1.414;
      const scaleX = pageWidth / displayWidth;
      const scaleY = pageHeight / displayHeight;
      const cropW = selection.width * scaleX;
      const cropH = selection.height * scaleY;
      const cropX = selection.x * scaleX;
      const cropY = pageHeight - selection.y * scaleY - cropH;
      page.setCropBox(cropX, cropY, cropW, cropH);
      page.setMediaBox(cropX, cropY, cropW, cropH);
    });
    if (ok) {
      closeCropModal();
      toast({ title: "Page cropped", status: "success", duration: 2000 });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleAddRange = () => {
    const start = parseInt(range.from);
    const end = parseInt(range.to);
    if (isNaN(start) || isNaN(end) || !fileData) return;
    const newPages = new Set(selectedPages);
    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
      if (i > 0 && i <= fileData.pageCount) newPages.add(i - 1);
    }
    setSelectedPages(Array.from(newPages).sort((a, b) => a - b));
    setRange({ from: '', to: '' });
  };

  const togglePage = (index: number) => {
    setSelectedPages(prev =>
      prev.includes(index)
        ? prev.filter(p => p !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    if (!fileData) return;
    setSelectedPages(Array.from({ length: fileData.pageCount }, (_, i) => i));
  };

  const handlePageClick = (index: number) => {
    setActivePage(index);
    togglePage(index);
  };

  const handleDownloadSelected = async () => {
    if (!fileData || selectedPages.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcDoc, selectedPages);
      copiedPages.forEach(page => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      saveAs(new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), `extracted_${fileData.file.name}`);
      toast({ title: "Pages Extracted", status: "success" });
    } catch {
      toast({ title: "Extraction failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAllAsZip = async () => {
    if (!fileData) return;
    setIsProcessing(true);
    const zip = new JSZip();
    try {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const fileNameNoExt = fileData.file.name.replace(/\.[^/.]+$/, "");
      for (let i = 0; i < fileData.pageCount; i++) {
        const singlePdf = await PDFDocument.create();
        const [page] = await singlePdf.copyPages(srcDoc, [i]);
        singlePdf.addPage(page);
        zip.file(`${fileNameNoExt}_page_${i + 1}.pdf`, await singlePdf.save());
      }
      saveAs(await zip.generateAsync({ type: "blob" }), `${fileNameNoExt}_split_pages.zip`);
      toast({ title: "ZIP Created", description: `Split into ${fileData.pageCount} files`, status: "success" });
    } catch {
      toast({ title: "ZIP creation failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgPage} p={{ base: 4, md: 8 }} transition="background 0.2s">
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={8}>

          {/* ── Sidebar ── */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="lg" display="flex" alignItems="center" gap={2} color={headingColor}>
                  <Icon as={FaLayerGroup} color="blue.500" /> PDF Toolset
                </Heading>
                <Text color={textMuted} fontSize="sm">Extract or Split into individual files</Text>
              </Box>

              {!fileData ? (
                <Center
                  {...getRootProps()}
                  border="2px" borderStyle="dashed"
                  borderColor={isDragActive ? "blue.500" : dropBorder}
                  bg={isDragActive ? useColorModeValue("blue.50", "blue.900") : dropBg}
                  rounded="2xl" p={10} cursor="pointer"
                  _hover={{ borderColor: dropHoverBorder }}
                  transition="all 0.2s"
                >
                  <input {...getInputProps()} />
                  <VStack>
                    <Icon as={FaFilePdf} w={10} h={10} color="blue.400" />
                    <Text fontWeight="bold" color={headingColor}>Drop PDF file here</Text>
                    <Text fontSize="xs" color={textMuted}>or click to browse</Text>
                  </VStack>
                </Center>
              ) : (
                <Box bg={bgCard} p={6} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack overflow="hidden">
                      <Icon as={FaFilePdf} color="red.500" />
                      <Box overflow="hidden">
                        <Text fontWeight="bold" isTruncated maxW="150px" color={headingColor}>{fileData.file.name}</Text>
                        <Text fontSize="xs" color={textMuted}>{fileData.pageCount} Pages</Text>
                      </Box>
                    </HStack>
                    <IconButton
                      aria-label="Remove"
                      icon={<DeleteIcon />}
                      size="sm" variant="ghost"
                      onClick={() => {
                        setFileData(null);
                        setSelectedPages([]);
                        setActivePage(null);
                        setHistoryPast([]);
                        setHistoryFuture([]);
                      }}
                    />
                  </Flex>

                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={2}>QUICK RANGE</Text>
                      <HStack>
                        <Input
                          placeholder="From" size="sm" type="number"
                          value={range.from} bg={inputBg}
                          onChange={e => setRange({ ...range, from: e.target.value })}
                        />
                        <Input
                          placeholder="To" size="sm" type="number"
                          value={range.to} bg={inputBg}
                          onChange={e => setRange({ ...range, to: e.target.value })}
                        />
                        <IconButton aria-label="Add" icon={<AddIcon />} size="sm" colorScheme="blue" onClick={handleAddRange} />
                      </HStack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color={labelColor}>SELECTION</Text>
                        <HStack spacing={1}>
                          <Button variant="link" size="xs" colorScheme="blue" onClick={selectAll}>All</Button>
                          <Button variant="link" size="xs" colorScheme="red" onClick={() => setSelectedPages([])}>Clear</Button>
                        </HStack>
                      </Flex>
                      <SimpleGrid columns={5} gap={2} maxH="120px" overflowY="auto" p={1}>
                        {Array.from({ length: fileData.pageCount }).map((_, i) => (
                          <Button
                            key={i} size="xs"
                            colorScheme={selectedPages.includes(i) ? "blue" : "gray"}
                            variant={selectedPages.includes(i) ? "solid" : "outline"}
                            onClick={() => togglePage(i)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Divider borderColor={borderColor} />

                    <VStack spacing={3}>
                      <Button
                        w="full" colorScheme="blue"
                        leftIcon={isProcessing ? <Spinner size="xs" /> : <DownloadIcon />}
                        onClick={handleDownloadSelected}
                        isDisabled={selectedPages.length === 0 || isProcessing}
                      >
                        Download Selected ({selectedPages.length})
                      </Button>
                      <Button
                        w="full" variant="outline" colorScheme="purple"
                        leftIcon={isProcessing ? <Spinner size="xs" /> : <Icon as={FaFileArchive} />}
                        onClick={handleDownloadAllAsZip}
                        isDisabled={isProcessing}
                      >
                        Split All to ZIP
                      </Button>
                    </VStack>
                  </Stack>
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* ── Preview Panel ── */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Box
              bg={bgCard} rounded="2xl" shadow="sm"
              border="1px" borderColor={borderColor}
              h={{ base: "600px", lg: "85vh" }}
              overflow="hidden" display="flex" flexDirection="column"
              transition="background 0.2s"
            >
              <Flex
                p={4} borderBottom="1px" borderColor={pageNavBorder}
                justify="space-between" align="center"
              >
                <HStack color={pageNavColor}>
                  <Icon as={FaEye} />
                  <Text fontWeight="medium">Interactive Preview</Text>
                </HStack>
                {fileData && (
                  <HStack spacing={2}>
                    <Tooltip label="Revert back (Ctrl+Z)" hasArrow>
                      <IconButton
                        aria-label="Undo"
                        icon={<ArrowBackIcon />}
                        size="sm"
                        variant="outline"
                        isDisabled={historyPast.length === 0 || isProcessing}
                        onClick={handleUndo}
                      />
                    </Tooltip>
                    <Tooltip label="Move forward (Ctrl+Y)" hasArrow>
                      <IconButton
                        aria-label="Redo"
                        icon={<ArrowForwardIcon />}
                        size="sm"
                        variant="outline"
                        isDisabled={historyFuture.length === 0 || isProcessing}
                        onClick={handleRedo}
                      />
                    </Tooltip>
                    <Text fontSize="xs" color={textMuted} display={{ base: 'none', sm: 'block' }}>
                      Click a page to select & edit
                    </Text>
                  </HStack>
                )}
              </Flex>

              <Box flex={1} bg={previewBg} overflowY="auto" p={4} pr={{ base: 4, md: 16 }}>
                {fileData ? (
                  <Center>
                    <Document file={fileData.url} loading={<Spinner color="blue.500" m={10} />}>
                      <Stack spacing={8} align="center">
                        {Array.from({ length: fileData.pageCount }).map((_, i) => (
                          <Flex key={i} align="center" gap={3} position="relative">
                            <Box
                              position="relative"
                              border="4px solid"
                              borderColor={activePage === i ? "blue.500" : selectedPages.includes(i) ? "blue.300" : "transparent"}
                              borderRadius="md"
                              onClick={() => handlePageClick(i)}
                              cursor="pointer"
                              bg="white"
                              shadow="md"
                              transition="all 0.2s"
                              _hover={{ transform: 'scale(1.01)', shadow: 'lg' }}
                            >
                              <Page
                                pageNumber={i + 1}
                                width={PREVIEW_PAGE_WIDTH}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                              <Box
                                position="absolute" bottom={2} left={2}
                                bg="blackAlpha.700" color="white"
                                px={2} py={0.5} rounded="md" fontSize="xs" fontWeight="bold"
                              >
                                {i + 1}
                              </Box>
                              {selectedPages.includes(i) && (
                                <Box position="absolute" top={2} right={2} bg="blue.500" color="white" rounded="full" p={1}>
                                  <FaCheckDouble size={12} />
                                </Box>
                              )}
                            </Box>

                            {activePage === i && (
                              <VStack
                                spacing={2}
                                flexShrink={0}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Tooltip label="Delete page" placement="left" hasArrow>
                                  <IconButton
                                    aria-label="Delete page"
                                    icon={<DeleteIcon />}
                                    size="md"
                                    rounded="full"
                                    colorScheme="red"
                                    shadow="md"
                                    isDisabled={isProcessing}
                                    onClick={() => handleDeletePage(i)}
                                  />
                                </Tooltip>
                                <Tooltip label="Crop page" placement="left" hasArrow>
                                  <IconButton
                                    aria-label="Crop page"
                                    icon={<Icon as={FaCropAlt} />}
                                    size="md"
                                    rounded="full"
                                    colorScheme="red"
                                    shadow="md"
                                    isDisabled={isProcessing}
                                    onClick={() => openCropModal(i)}
                                  />
                                </Tooltip>
                                <Tooltip label="Rotate 90°" placement="left" hasArrow>
                                  <IconButton
                                    aria-label="Rotate page"
                                    icon={<RepeatIcon />}
                                    size="md"
                                    rounded="full"
                                    colorScheme="red"
                                    shadow="md"
                                    isDisabled={isProcessing}
                                    onClick={() => handleRotatePage(i)}
                                  />
                                </Tooltip>
                              </VStack>
                            )}
                          </Flex>
                        ))}
                      </Stack>
                    </Document>
                  </Center>
                ) : (
                  <Center h="full">
                    <VStack spacing={4}>
                      <Icon as={FaFilePdf} w={20} h={20} color={emptyIconColor} opacity={0.4} />
                      <Text color={emptyTextColor}>Upload a PDF to see preview</Text>
                    </VStack>
                  </Center>
                )}
              </Box>
            </Box>
          </GridItem>

        </Grid>
      </Container>

      {/* ── Crop Modal ── */}
      <Modal isOpen={cropPageIndex !== null} onClose={closeCropModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crop Page {cropPageIndex !== null ? cropPageIndex + 1 : ''}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={textMuted} mb={3}>
              Drag on the page to select the area you want to keep.
            </Text>
            {fileData && cropPageIndex !== null && (
              <Box
                ref={cropContainerRef}
                position="relative"
                display="inline-block"
                cursor="crosshair"
                userSelect="none"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={() => setCropDrag(null)}
                onMouseLeave={() => setCropDrag(null)}
                bg="white"
                shadow="md"
                mx="auto"
              >
                <Document file={fileData.url}>
                  <Page
                    pageNumber={cropPageIndex + 1}
                    width={CROP_MODAL_PAGE_WIDTH}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                {cropRect && cropRect.width > 0 && cropRect.height > 0 && (
                  <Box
                    position="absolute"
                    left={`${cropRect.x}px`}
                    top={`${cropRect.y}px`}
                    width={`${cropRect.width}px`}
                    height={`${cropRect.height}px`}
                    border="2px dashed"
                    borderColor="blue.400"
                    bg="blue.200"
                    opacity={0.35}
                    pointerEvents="none"
                  />
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeCropModal}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleApplyCrop}
              isLoading={isProcessing}
              isDisabled={!cropRect || cropRect.width < 10 || cropRect.height < 10}
            >
              Apply Crop
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PdfSplitter;
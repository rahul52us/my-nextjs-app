"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Button, Container, Flex, Heading, VStack, HStack, Select, SimpleGrid,
  Text, useToast, FormControl, FormLabel, Card, Icon, Input, Badge, IconButton,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, Divider, InputGroup, InputLeftElement,
  useColorModeValue
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import {
  FileUp, Hash, Eye, Trash2,
  FileText, ChevronLeft, ChevronRight, Type, Settings2
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';

import { useFileTransfer } from '../../../../../context/FileTransferContext';
import ContinueToSection from '../../../../../component/common/ContinueToSection';

// Worker initialization
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const PDFNumberingPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currPreviewPage, setCurrPreviewPage] = useState<number>(1);

  // Settings State
  const [prefix, setPrefix] = useState<string>('Page');
  const [format, setFormat] = useState<string>('of');
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 50, y: 92 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [pageRange, setPageRange] = useState<string>('all');
  const [pageRangeError, setPageRangeError] = useState<string>('');
  const [color, setColor] = useState<string>('#4A5568'); // Professional Slate Gray
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(11);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const toast = useToast();
  const { consumeTransferForTool, clearTransferState } = useFileTransfer();
  const pageBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    let isMounted = true;
    const checkTransfer = async () => {
      const state = await consumeTransferForTool("pdf-page-number");
      if (isMounted && state && state.items.length > 0) {
        const item = state.items[0];
        const fileObj = item.file instanceof File ? item.file : new File([item.file], item.fileName, { type: item.fileType });
        setFile(fileObj);
        setPreviewUrl(URL.createObjectURL(fileObj));
        toast({
          title: "✨ File Auto-Loaded",
          description: `Loaded ${fileObj.name} from ${state.sourceToolName}`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        await clearTransferState();
      }
    };
    void checkTransfer();
    return () => { isMounted = false; };
  }, []);
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const textPrimary = useColorModeValue("gray.700", "gray.100");
  const textSecondary = useColorModeValue("gray.500", "gray.400");
  const textMuted = useColorModeValue("gray.400", "gray.500");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const softBorderColor = useColorModeValue("gray.100", "gray.700");
  const inputBg = useColorModeValue("white", "gray.800");
  const inputTextColor = useColorModeValue("gray.800", "gray.100");
  const inputIconColor = useColorModeValue("#718096", "#A0AEC0");
  const dropzoneBg = useColorModeValue("white", "gray.800");
  const dropzoneHoverBg = useColorModeValue("brand.50", "gray.700");
  const selectedFileBg = useColorModeValue("brand.50", "brand.900");
  const selectedFileBorder = useColorModeValue("brand.100", "brand.700");
  const selectedFileText = useColorModeValue("brand.700", "brand.100");
  const selectedFileMeta = useColorModeValue("brand.600", "brand.200");
  const previewPanelBg = useColorModeValue("gray.50", "gray.800");
  const emptyIconBg = useColorModeValue("white", "gray.700");
  const sliderTrackBg = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
      setCurrPreviewPage(1);
    },
  });

  const previewText = useMemo(() => {
    const current = currPreviewPage + (startNumber - 1);
    const total = numPages + (startNumber - 1);
    const base = prefix ? `${prefix} ${current}` : `${current}`;

    if (format === 'of') return `${base} of ${total}`;
    if (format === 'bracket') return `[ ${base} ]`;
    return base;
  }, [prefix, format, startNumber, currPreviewPage, numPages]);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const parsePageRanges = (range: string, pageCount: number): Set<number> => {
    const selected = new Set<number>();
    const trimmed = range.trim().toLowerCase();

    if (!trimmed || trimmed === 'all') {
      for (let i = 1; i <= pageCount; i += 1) selected.add(i);
      return selected;
    }

    const parts = trimmed.split(',').map((chunk) => chunk.trim()).filter(Boolean);
    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        const page = Number(part);
        if (page >= 1 && page <= pageCount) selected.add(page);
        else throw new Error('Page number out of range');
      } else if (/^\d+-\d+$/.test(part)) {
        const [start, end] = part.split('-').map(Number);
        if (start < 1 || end < 1 || start > pageCount || end > pageCount || start > end) {
          throw new Error('Invalid page range');
        }
        for (let p = start; p <= end; p += 1) selected.add(p);
      } else {
        throw new Error('Invalid page range syntax');
      }
    }

    return selected;
  };

  const validatePageRange = (range: string, pageCount: number) => {
    try {
      parsePageRanges(range, pageCount);
      return '';
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid page range';
    }
  };

  const selectedPreviewPages = useMemo(() => {
    try {
      return parsePageRanges(pageRange, numPages);
    } catch {
      return new Set<number>();
    }
  }, [pageRange, numPages]);

  useEffect(() => {
    setPageRangeError(validatePageRange(pageRange, numPages));
  }, [pageRange, numPages]);

  const pageIsSelected = selectedPreviewPages.has(currPreviewPage);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    });
  };

  const handlePreviewPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    updatePosition(point.clientX, point.clientY);
    setIsDragging(true);
  };

  const handlePreviewPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const point = 'touches' in e ? e.touches[0] : e;
    updatePosition(point.clientX, point.clientY);
  };

  const handlePreviewPointerUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      const selectedPages = parsePageRanges(pageRange, pages.length);

      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        if (!selectedPages.has(pageNumber)) return;

        const { width, height } = page.getSize();
        const current = pageNumber + (startNumber - 1);
        const total = pages.length + (startNumber - 1);
        const base = prefix ? `${prefix} ${current}` : `${current}`;

        let text = base;
        if (format === 'of') text = `${base} of ${total}`;
        if (format === 'bracket') text = `[ ${base} ]`;

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        const x = (width * position.x) / 100 - textWidth / 2;
        const y = height - (height * position.y) / 100 - textHeight / 2;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(r, g, b) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Numbered_${file.name}`;
      link.click();

      toast({ title: "Document Ready", status: "success", isClosable: true });
    } catch (e) {
      toast({ title: "Error", description: "Failed to process PDF", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxW="1350px" py={10} px={{ base: 4, md: 8 }} bg={pageBg}>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" color={textPrimary}>PDF Editor</Heading>
        <Text color={textSecondary}>Configure page numbering...</Text>
      </VStack>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={{ base: 8, lg: 10 }}
        align="flex-start"
        justify="center"
      >
        {/* Main Settings & Preview Area */}
        <Box flex="1" w="full">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* LEFT: SETTINGS */}
            <VStack spacing={6} align="stretch">
              <Card p={0} variant="outline" borderRadius="xl" shadow="sm" overflow="hidden" bg={cardBg} borderColor={borderColor}>
                <Box p={4} bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
                  <HStack>
                    <Icon as={Settings2} size={18} />
                    <Text fontWeight="bold">Configuration</Text>
                  </HStack>
                </Box>

                <VStack spacing={5} p={6}>
                  {!file ? (
                    <Box
                      {...getRootProps()}
                      w="full" py={10} border="2px dashed" borderColor={borderColor}
                      borderRadius="lg" bg={dropzoneBg} cursor="pointer" textAlign="center"
                      _hover={{ borderColor: "brand.400", bg: dropzoneHoverBg }} transition="all 0.2s"
                    >
                      <input {...getInputProps()} />
                      <Icon as={FileUp} w={8} h={8} color={textMuted} mb={3} />
                      <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>Click or drag PDF to number</Text>
                      <Text fontSize="xs" color={textSecondary} mt={1}>Supports standard PDF documents</Text>
                    </Box>
                  ) : (
                    <HStack w="full" p={3} bg={selectedFileBg} borderRadius="lg" justifyContent="space-between" border="1px solid" borderColor={selectedFileBorder}>
                      <HStack spacing={3} overflow="hidden">
                        <Icon as={FileText} size={20} color="brand.500" />
                        <VStack align="start" spacing={0} overflow="hidden">
                          <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={selectedFileText}>{file.name}</Text>
                          <Text fontSize="10px" color={selectedFileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                        </VStack>
                      </HStack>
                      <IconButton size="xs" variant="ghost" colorScheme="red" icon={<Trash2 size={16} />} onClick={() => setFile(null)} aria-label="remove" />
                    </HStack>
                  )}

                  <Divider borderColor={borderColor} />

                  {/* SETTINGS CONTROLS */}
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>PREFIX TEXT</FormLabel>
                      <Input size="sm" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. Page" borderRadius="md" bg={inputBg} borderColor={borderColor} />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>FORMAT STYLE</FormLabel>
                      <Select size="sm" value={format} onChange={(e) => setFormat(e.target.value)} borderRadius="md" bg={inputBg} borderColor={borderColor}>
                        <option value="simple">Simple</option>
                        <option value="of">Page X of Y</option>
                        <option value="bracket">Classic [ X ]</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>START NUMBER</FormLabel>
                      <Input size="sm" type="number" value={startNumber} onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)} borderRadius="md" bg={inputBg} borderColor={borderColor} />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>FONT SIZE ({fontSize}px)</FormLabel>
                      <Slider value={fontSize} min={8} max={24} onChange={(v) => setFontSize(v)} colorScheme="brand" mt={2}>
                        <SliderTrack><SliderFilledTrack /></SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isInvalid={!!pageRangeError}>
                    <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>APPLY TO PAGES</FormLabel>
                    <Input size="sm" value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder="e.g. all, 1-5, 8" borderRadius="md" bg={inputBg} borderColor={borderColor} />
                    {pageRangeError ? (
                      <Text fontSize="10px" color="red.500" mt={1}>{pageRangeError}</Text>
                    ) : (
                      <Text fontSize="10px" color={textSecondary} mt={1}>Use 'all' or ranges like '1-3, 5'</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color={textMuted}>TEXT COLOR</FormLabel>
                    <HStack spacing={2}>
                      <Input size="sm" type="color" value={color} onChange={(e) => setColor(e.target.value)} w="40px" p={0} border="none" cursor="pointer" borderRadius="md" />
                      <Input size="sm" value={color} onChange={(e) => setColor(e.target.value)} borderRadius="md" bg={inputBg} borderColor={borderColor} />
                    </HStack>
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    w="full"
                    size="lg"
                    mt={4}
                    onClick={handleDownload}
                    isLoading={isProcessing}
                    isDisabled={!file}
                    borderRadius="xl"
                    boxShadow="md"
                  >
                    Apply &amp; Download PDF
                  </Button>
                </VStack>
              </Card>
            </VStack>

            {/* RIGHT: PREVIEW */}
            <VStack spacing={4} align="stretch">
              <Card variant="outline" borderRadius="xl" bg={previewPanelBg} h="full" minH="650px" shadow="inner" borderStyle="dashed" borderColor={borderColor}>
                <HStack p={4} bg={headerBg} borderBottom="1px solid" borderColor={softBorderColor} justifyContent="space-between">
                  <HStack>
                    <Icon as={Eye} size={16} color="brand.500" />
                    <Text fontSize="sm" fontWeight="bold" color={textPrimary}>Visual Preview</Text>
                  </HStack>
                  {file && (
                    <HStack spacing={3}>
                      <IconButton size="xs" variant="outline" icon={<ChevronLeft size={16} />} onClick={() => setCurrPreviewPage(p => Math.max(1, p - 1))} isDisabled={currPreviewPage === 1} aria-label="prev" />
                      <Badge colorScheme="gray" px={2} py={1} borderRadius="md" variant="solid">Page {currPreviewPage} / {numPages}</Badge>
                      <Badge colorScheme={pageIsSelected ? 'green' : 'red'} px={2} py={1} borderRadius="md" variant="solid">
                        {pageIsSelected ? 'Numbered' : 'Skipped'}
                      </Badge>
                      <IconButton size="xs" variant="outline" icon={<ChevronRight size={16} />} onClick={() => setCurrPreviewPage(p => Math.min(numPages, p + 1))} isDisabled={currPreviewPage === numPages} aria-label="next" />
                    </HStack>
                  )}
                </HStack>
                <Box
                  flex={1}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  p={10}
                  position="relative"
                  overflow="hidden"
                  ref={previewRef}
                  onMouseMove={handlePreviewPointerMove}
                  onMouseUp={handlePreviewPointerUp}
                  onMouseLeave={handlePreviewPointerUp}
                  onTouchMove={handlePreviewPointerMove}
                  onTouchEnd={handlePreviewPointerUp}
                  onClick={(e) => {
                    if (e.target === previewRef.current) {
                      updatePosition(e.clientX, e.clientY);
                    }
                  }}
                >
                  {previewUrl ? (
                    <Box position="relative" bg="white" shadow="2xl" border="1px solid" borderColor={borderColor}>
                      <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                        <Page
                          pageNumber={currPreviewPage}
                          width={420}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                      {/* LIVE OVERLAY */}
                      <Box
                        position="absolute"
                        left={`${position.x}%`}
                        top={`${position.y}%`}
                        transform="translate(-50%, -50%)"
                        cursor={isDragging ? 'grabbing' : 'grab'}
                        onMouseDown={handlePreviewPointerDown}
                        onTouchStart={handlePreviewPointerDown}
                        zIndex={10}
                        userSelect="none"
                      >
                        <Text fontSize={`${fontSize}px`} fontWeight="semibold" color={color} bg="rgba(255,255,255,0.85)" px={3} py={2} borderRadius="lg" boxShadow="md">
                          {previewText}
                        </Text>
                      </Box>
                    </Box>
                  ) : (
                    <VStack spacing={4} color={textMuted}>
                      <Box p={6} borderRadius="full" bg={emptyIconBg} border="1px solid" borderColor={softBorderColor}>
                        <Icon as={FileText} size={40} strokeWidth={1.5} />
                      </Box>
                      <Text fontSize="sm" fontWeight="medium" color={textSecondary}>No document active</Text>
                    </VStack>
                  )}
                </Box>
              </Card>
            </VStack>
          </SimpleGrid>
        </Box>

        {/* Right Sticky ContinueToSection Sidebar */}
        {file && (
          <Box
            w={{ base: "full", lg: "340px", xl: "360px" }}
            position={{ base: "relative", lg: "sticky" }}
            top={{ lg: "100px" }}
            alignSelf="flex-start"
            flexShrink={0}
          >
            <ContinueToSection
              currentTool="pdf-page-no"
              variant="vertical"
              convertedFiles={[{ file, name: file.name, type: 'application/pdf' }]}
            />
          </Box>
        )}
      </Flex>
    </Container>
  );
};

export default PDFNumberingPage;

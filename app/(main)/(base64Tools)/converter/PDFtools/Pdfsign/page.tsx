"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box, Button, Container, Flex, Heading, Icon, Input,
  Stack, Text, VStack, HStack, IconButton, Spinner, Center,
  useToast, SimpleGrid, Divider, Checkbox, NumberInput, NumberInputField,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  useColorModeValue
} from '@chakra-ui/react';
import { DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { FaSignature, FaFont, FaFileUpload, FaRegEye, FaEraser, FaImage, FaArrowsAlt } from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ProSignatureMaker: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCV = searchParams.get('from') === 'cv';

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [uploadedSig, setUploadedSig] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);

  const bgMain     = useColorModeValue("gray.50", "gray.900");
  const cardBg     = useColorModeValue("white", "gray.800");
  const borderColor= useColorModeValue("gray.200", "gray.700");
  const previewBg  = useColorModeValue("gray.100", "gray.900");
  const textColor  = useColorModeValue("gray.800", "gray.100");

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale]       = useState(1);
  const [applyToAll, setApplyToAll]   = useState(false);
  const [targetPage, setTargetPage]   = useState(1);
  const isDraggingInternal            = useRef(false);

  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing]     = useState(false);
  const [signatureImageData, setSignatureImageData] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  useEffect(() => {
    const updateSignature = async () => {
      const sigData = await getSignatureImage();
      setSignatureImageData(sigData);
    };
    updateSignature();
  }, [activeTab, typedName, uploadedSig, isDrawing]);

  // ── Drag signature overlay ────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingInternal.current = true;
    const startX = e.pageX - position.x;
    const startY = e.pageY - position.y;
    const handleMouseMove = (mv: MouseEvent) => {
      if (!isDraggingInternal.current) return;
      setPosition({ x: mv.pageX - startX, y: mv.pageY - startY });
    };
    const handleMouseUp = () => {
      isDraggingInternal.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getSignatureImage = useCallback(async () => {
    if (activeTab === 'draw' && canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    } else if (activeTab === 'upload' && uploadedSig) {
      return uploadedSig;
    } else if (activeTab === 'type') {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = 'italic 45px serif';
        ctx.fillStyle = 'black';
        ctx.fillText(typedName || "Signed", 20, 80);
      }
      return canvas.toDataURL('image/png');
    }
    return null;
  }, [activeTab, typedName, uploadedSig]);

  // ── Canvas drawing ────────────────────────────────────────────────
  const startDrawing = (e: any) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx?.lineTo(x, y); ctx?.stroke();
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.getContext('2d')?.clearRect(0, 0, 400, 200);
      setSignatureImageData(null);
    }
  };

  // ── PDF dropzone (used by the preview area) ───────────────────────
  const onPdfDrop = useCallback((files: File[]) => {
    if (files[0]) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfFile(files[0]);
      setPdfUrl(URL.createObjectURL(files[0]));
      setTargetPage(1);
      setPosition({ x: 50, y: 50 });
    }
  }, [pdfUrl]);

  // Dropzone used ONLY on the empty state (no PDF loaded yet)
  const {
    getRootProps: getPdfRootProps,
    getInputProps: getPdfInputProps,
    isDragActive: isPdfDragActive,
  } = useDropzone({
    onDrop: onPdfDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Signature image dropzone
  const onSigImageDrop = (files: File[]) => {
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedSig(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
  };
  const { getRootProps: getSigProps, getInputProps: getSigInputProps } = useDropzone({
    onDrop: onSigImageDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: false,
  });

  // ── Export ────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const sigDataUrl = await getSignatureImage();
      if (!sigDataUrl) throw new Error("No signature");

      if (fromCV) {
        sessionStorage.setItem('cvSignature', sigDataUrl);
        router.push('/converter/Cvbuilder');
        return;
      }

      if (!pdfFile) return;
      setIsProcessing(true);

      const existingBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingBytes);
      const pages = pdfDoc.getPages();
      const sigImage = await pdfDoc.embedPng(sigDataUrl);

      const pagesToSign = applyToAll ? pages.map((_, i) => i) : [targetPage - 1];

      pagesToSign.forEach((idx) => {
        const page = pages[idx];
        const { width, height } = page.getSize();
        const scaleFactor = width / 600;
        const pdfX = position.x * scaleFactor;
        const pdfY = height - (position.y * scaleFactor) - (75 * scale * scaleFactor);
        page.drawImage(sigImage, {
          x: pdfX, y: pdfY,
          width: 150 * scale * scaleFactor,
          height: 75 * scale * scaleFactor,
        });
      });

      const pdfBytes = await pdfDoc.save();
      saveAs(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), `Signed_${pdfFile.name}`);
      toast({ title: "PDF Exported Successfully!", status: "success" });
    } catch (err) {
      console.error(err);
      toast({ title: "Export Failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Signature overlay on each page ───────────────────────────────
  const SignaturePreview = ({ pageNumber }: { pageNumber: number }) => {
    const shouldShow = applyToAll || targetPage === pageNumber;
    if (!shouldShow || !signatureImageData) return null;
    return (
      <Box
        position="absolute" top={`${position.y}px`} left={`${position.x}px`}
        zIndex={100} cursor="move" onMouseDown={handleMouseDown}
        border="2px dashed" borderColor="blue.400"
        bg="whiteAlpha.600" borderRadius="md"
        _hover={{ bg: "whiteAlpha.800" }}
      >
        <Box
          as="img" src={signatureImageData}
          width={`${150 * scale}px`} height={`${75 * scale}px`}
          pointerEvents="none" opacity={0.85}
          style={{ objectFit: 'contain' }}
        />
        <Icon
          as={FaArrowsAlt} position="absolute" top="-12px" left="-12px"
          color="blue.500" bg={cardBg} rounded="full" p={1} boxSize="24px" cursor="grab"
        />
      </Box>
    );
  };

  return (
    <Box minH="100vh" bg={bgMain} py={8} px={4} color={textColor}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>

          {/* ── LEFT: Controls (no Change Document button) ── */}
          <Box gridColumn={{ lg: "span 4" }} p={6} bg={cardBg} rounded="3xl" shadow="sm" border="1px" borderColor={borderColor}>
            <VStack align="stretch" spacing={6}>
              <Heading size="md">
                <Icon as={FaSignature} color="blue.500" mr={2} /> Signature Maker
              </Heading>

              {/* Tabs */}
              <HStack bg={useColorModeValue("gray.100", "gray.700")} p={1} rounded="xl">
                <Button flex={1} size="sm" variant={activeTab === 'draw'   ? 'solid' : 'ghost'} colorScheme={activeTab === 'draw'   ? 'blue' : 'gray'} onClick={() => setActiveTab('draw')}>Draw</Button>
                <Button flex={1} size="sm" variant={activeTab === 'type'   ? 'solid' : 'ghost'} colorScheme={activeTab === 'type'   ? 'blue' : 'gray'} onClick={() => setActiveTab('type')}>Type</Button>
                <Button flex={1} size="sm" variant={activeTab === 'upload' ? 'solid' : 'ghost'} colorScheme={activeTab === 'upload' ? 'blue' : 'gray'} onClick={() => setActiveTab('upload')}>Image</Button>
              </HStack>

              {/* Draw canvas */}
              {activeTab === 'draw' && (
                <Box border="2px solid" borderColor={borderColor} rounded="2xl"
                  bg={useColorModeValue("gray.50", "gray.700")} position="relative">
                  <canvas
                    ref={canvasRef} width={400} height={200}
                    onMouseDown={startDrawing} onMouseMove={draw}
                    onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
                    style={{ width: '100%', cursor: 'crosshair' }}
                  />
                  <IconButton aria-label="Clear" icon={<FaEraser />} size="sm"
                    position="absolute" bottom={2} right={2} onClick={clearCanvas} />
                </Box>
              )}

              {/* Type */}
              {activeTab === 'type' && (
                <Input placeholder="Type name..." value={typedName}
                  onChange={(e) => setTypedName(e.target.value)} />
              )}

              {/* Upload signature image */}
              {activeTab === 'upload' && (
                <Box {...getSigProps()} p={4} border="2px dashed" borderColor={borderColor}
                  rounded="xl" textAlign="center" cursor="pointer">
                  <input {...getSigInputProps()} />
                  {uploadedSig
                    ? <Box as="img" src={uploadedSig} maxH="60px" mx="auto" />
                    : <Text fontSize="xs">Upload Signature Image</Text>}
                </Box>
              )}

              {/* Size slider */}
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>SIGNATURE SIZE</Text>
                <Slider min={0.5} max={2.5} step={0.1} value={scale} onChange={setScale}>
                  <SliderTrack><SliderFilledTrack /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>

              <Divider />

              {/* Page settings */}
              <VStack align="stretch" spacing={3}>
                <Checkbox isChecked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)}>
                  Apply to all pages
                </Checkbox>
                {!applyToAll && (
                  <HStack justify="space-between">
                    <Text fontSize="sm">Page Number:</Text>
                    <NumberInput size="sm" maxW={20} min={1} max={numPages} value={targetPage}
                      onChange={(v) => setTargetPage(parseInt(v))}>
                      <NumberInputField />
                    </NumberInput>
                  </HStack>
                )}
              </VStack>

              {/* Export */}
              <Button colorScheme="blue" size="lg" h="60px" rounded="2xl"
                onClick={handleExport} isLoading={isProcessing} leftIcon={<DownloadIcon />}
                isDisabled={!pdfFile}>
                {fromCV ? "Save Signature" : "Export PDF"}
              </Button>

              {/* If PDF is loaded — show a small "Change PDF" text link */}
              {pdfFile && (
                <Text
                  fontSize="xs" color="gray.400" textAlign="center" cursor="pointer"
                  textDecoration="underline" _hover={{ color: "blue.400" }}
                  onClick={() => {
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                    setPdfFile(null); setPdfUrl(null); setNumPages(0);
                  }}
                >
                  ✕ Remove PDF
                </Text>
              )}
            </VStack>
          </Box>

          {/* ── RIGHT: Preview container (plain box, no dropzone props) ── */}
          <Box
            gridColumn={{ lg: "span 8" }}
            bg={previewBg}
            rounded="3xl"
            overflow="hidden"
            position="relative"
            h="85vh"
            border="2px solid"
            borderColor={borderColor}
          >
            {/* Badge */}
            <HStack
              position="absolute" top={4} left={4} zIndex={10}
              bg="whiteAlpha.900" px={3} py={1} rounded="full" shadow="sm"
              pointerEvents="none"
            >
              <Icon as={FaRegEye} color="blue.500" />
              <Text fontSize="xs" fontWeight="black">PREVIEW</Text>
            </HStack>

            <Box h="full" overflowY="auto" p={6} userSelect="none">
              {pdfUrl ? (
                /* ── PDF loaded: show pages normally ── */
                <Center>
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    <Stack spacing={6} position="relative">
                      {Array.from({ length: numPages }).map((_, i) => (
                        <Box key={i} shadow="2xl" bg={cardBg} position="relative" overflow="visible">
                          <Page
                            pageNumber={i + 1} width={600}
                            renderTextLayer={false} renderAnnotationLayer={false}
                          />
                          <SignaturePreview pageNumber={i + 1} />
                        </Box>
                      ))}
                    </Stack>
                  </Document>
                </Center>
              ) : (
                /* ── Empty state: THIS box is the dropzone ── */
                <Center h="full">
                  <Box
                    {...getPdfRootProps()}
                    w="full" h="full"
                    display="flex" alignItems="center" justifyContent="center"
                    cursor="pointer"
                  >
                    <input {...getPdfInputProps()} />
                    <Box
                      p={10} borderRadius="2xl"
                      border="2px dashed"
                      borderColor={isPdfDragActive ? "blue.400" : "gray.300"}
                      bg={isPdfDragActive ? "blue.50" : "transparent"}
                      transition="all 0.2s"
                      textAlign="center"
                    >
                      <VStack color="gray.400" spacing={4}>
                        <Icon
                          as={FaFileUpload} w={14} h={14}
                          color={isPdfDragActive ? "blue.400" : "gray.300"}
                          transition="color 0.2s"
                        />
                        <VStack spacing={1}>
                          <Text fontWeight="700" fontSize="lg" color={isPdfDragActive ? "blue.500" : "gray.500"}>
                            {isPdfDragActive ? "Drop PDF here" : "Upload PDF to sign"}
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Drag & drop or click to browse
                          </Text>
                          <Text fontSize="xs" color="gray.300">Supports .pdf files</Text>
                        </VStack>
                      </VStack>
                    </Box>
                  </Box>
                </Center>
              )}
            </Box>
          </Box>

        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ProSignatureMaker;
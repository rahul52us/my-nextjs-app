"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

import {
  Box, Button, Container, Flex, Heading, Icon, Input, 
  Stack, Text, VStack, HStack, IconButton, Spinner, Center, 
  useToast, SimpleGrid, Divider, Checkbox, NumberInput, NumberInputField,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb
} from '@chakra-ui/react';
import { DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { FaSignature, FaFont, FaFileUpload, FaRegEye, FaEraser, FaImage, FaArrowsAlt } from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ProSignatureMaker: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [uploadedSig, setUploadedSig] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [applyToAll, setApplyToAll] = useState(false);
  const [targetPage, setTargetPage] = useState(1);
  const isDraggingInternal = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingInternal.current = true;
    const startX = e.pageX - position.x;
    const startY = e.pageY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingInternal.current) return;
      setPosition({
        x: moveEvent.pageX - startX,
        y: moveEvent.pageY - startY
      });
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

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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

  const onDrop = (files: File[]) => {
    if (files[0]) {
      setPdfFile(files[0]);
      setPdfUrl(URL.createObjectURL(files[0]));
    }
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const onSigImageDrop = (files: File[]) => {
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedSig(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
  };
  const { getRootProps: getSigProps, getInputProps: getSigInputProps } = useDropzone({
    onDrop: onSigImageDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: false 
  });

  const handleExport = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const sigDataUrl = await getSignatureImage();
      if (!sigDataUrl) throw new Error("No signature");

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
          x: pdfX,
          y: pdfY,
          width: 150 * scale * scaleFactor,
          height: 75 * scale * scaleFactor,
        });
      });

      const pdfBytes = await pdfDoc.save();
      
      /** * FIX: We wrap the results in a new Uint8Array. 
       * This forces the type to 'Uint8Array' which is compatible with BlobPart,
       * avoiding the SharedArrayBuffer incompatibility error.
       */
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      saveAs(blob, `Signed_${pdfFile.name}`);
      
      toast({ title: "Document Signed", status: "success" });
    } catch (err) {
      toast({ title: "Export Failed", status: "error" });
    } finally { setIsProcessing(false); }
  };

  const [liveSig, setLiveSig] = useState<string | null>(null);
  useEffect(() => {
    getSignatureImage().then(setLiveSig);
  }, [activeTab, typedName, uploadedSig, isDrawing, getSignatureImage]);

  return (
    <Box minH="100vh" bg="gray.50" py={8} px={4}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
          
          <Box gridColumn={{ lg: "span 4" }} p={6} bg="white" rounded="3xl" shadow="sm" border="1px" borderColor="gray.200">
            <VStack align="stretch" spacing={6}>
              <Heading size="md"><Icon as={FaSignature} color="blue.500" mr={2}/> Signature Maker</Heading>

              <HStack bg="gray.100" p={1} rounded="xl">
                <Button flex={1} size="sm" variant={activeTab === 'draw' ? 'solid' : 'ghost'} colorScheme={activeTab === 'draw' ? 'blue' : 'gray'} onClick={() => setActiveTab('draw')}>Draw</Button>
                <Button flex={1} size="sm" variant={activeTab === 'type' ? 'solid' : 'ghost'} colorScheme={activeTab === 'type' ? 'blue' : 'gray'} onClick={() => setActiveTab('type')}>Type</Button>
                <Button flex={1} size="sm" variant={activeTab === 'upload' ? 'solid' : 'ghost'} colorScheme={activeTab === 'upload' ? 'blue' : 'gray'} onClick={() => setActiveTab('upload')}>Image</Button>
              </HStack>

              {activeTab === 'draw' && (
                <Box border="2px solid" borderColor="gray.100" rounded="2xl" bg="gray.50" position="relative">
                  <canvas ref={canvasRef} width={400} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} style={{ width: '100%', cursor: 'crosshair' }} />
                  <IconButton aria-label="Clear" icon={<FaEraser />} size="sm" position="absolute" bottom={2} right={2} onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,400,200)} />
                </Box>
              )}

              {activeTab === 'type' && <Input placeholder="Type name..." value={typedName} onChange={(e) => setTypedName(e.target.value)} />}

              {activeTab === 'upload' && (
                <Box {...getSigProps()} p={4} border="2px dashed" borderColor="gray.200" rounded="xl" textAlign="center" cursor="pointer">
                  <input {...getSigInputProps()} />
                  {uploadedSig ? <Box as="img" src={uploadedSig} maxH="60px" mx="auto" /> : <Text fontSize="xs">Upload Signature Image</Text>}
                </Box>
              )}

              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>SIGNATURE SIZE</Text>
                <Slider min={0.5} max={2.5} step={0.1} value={scale} onChange={setScale}>
                  <SliderTrack><SliderFilledTrack /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Checkbox isChecked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)}>Apply to all pages</Checkbox>
                {!applyToAll && (
                  <HStack justify="space-between">
                    <Text fontSize="sm">Page Number:</Text>
                    <NumberInput size="sm" maxW={20} min={1} max={numPages} value={targetPage} onChange={(v) => setTargetPage(parseInt(v))}>
                      <NumberInputField />
                    </NumberInput>
                  </HStack>
                )}
              </VStack>

              <Button colorScheme="blue" size="lg" h="60px" rounded="2xl" onClick={handleExport} isLoading={isProcessing} leftIcon={<DownloadIcon />}>
                Export PDF
              </Button>

              <Box {...getRootProps()} cursor="pointer" p={3} border="1px solid" borderColor="gray.100" rounded="xl" textAlign="center">
                <input {...getInputProps()} />
                <Text fontSize="xs" color="gray.500">Change Document</Text>
              </Box>
            </VStack>
          </Box>

          <Box gridColumn={{ lg: "span 8" }} bg="gray.200" rounded="3xl" overflow="hidden" position="relative" h="85vh">
            <Box h="full" overflowY="auto" p={6} userSelect="none">
              {pdfUrl ? (
                <Center>
                  <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    <Stack spacing={6} position="relative">
                      {Array.from({ length: numPages }).map((_, i) => (
                        <Box key={i} shadow="2xl" bg="white" position="relative" overflow="hidden">
                          <Page pageNumber={i + 1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
                          
                          {(applyToAll || targetPage === i + 1) && (
                            <Box 
                              position="absolute" 
                              top={`${position.y}px`} 
                              left={`${position.x}px`} 
                              zIndex={100} 
                              cursor="move" 
                              onMouseDown={handleMouseDown}
                              border="1px dashed" 
                              borderColor="blue.400"
                              bg="whiteAlpha.400"
                            >
                              {liveSig && <Box as="img" src={liveSig} width={`${150 * scale}px`} height={`${75 * scale}px`} pointerEvents="none" opacity={0.8} />}
                              <Icon as={FaArrowsAlt} position="absolute" top="-10px" left="-10px" color="blue.500" bg="white" rounded="full" p={1}/>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Document>
                </Center>
              ) : (
                <Center h="full"><VStack color="gray.400"><Icon as={FaFileUpload} w={12} h={12} opacity={0.2} /><Text>Upload PDF</Text></VStack></Center>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ProSignatureMaker;
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

// Chakra UI & React Icons
import {
    Box, Button, Container, Flex, Heading, Icon, Input,
    Stack, Text, VStack, HStack, IconButton, Spinner, Center,
    useToast, SimpleGrid, Divider, Checkbox, NumberInput, NumberInputField
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { FaSignature, FaFont, FaFileUpload, FaRegEye, FaEraser, FaImage } from 'react-icons/fa';

// Fixed Worker Path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfSignatureContent: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw'); // Added upload tab
    const [typedName, setTypedName] = useState('');
    const [uploadedSig, setUploadedSig] = useState<string | null>(null); // State for uploaded image
    const [isProcessing, setIsProcessing] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    
    // New placement logic
    const [applyToAll, setApplyToAll] = useState(false);
    const [targetPage, setTargetPage] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const toast = useToast();

    useEffect(() => {
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [pdfUrl]);

    // --- Canvas Logic (Unchanged) ---
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx?.lineTo(x, y);
        ctx?.stroke();
        if (e.cancelable) e.preventDefault();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };

    // --- NEW: Image Signature Upload Logic ---
    const onSigImageDrop = (files: File[]) => {
        if (files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setUploadedSig(e.target?.result as string);
            reader.readAsDataURL(files[0]);
        }
    };

    const { getRootProps: getSigProps, getInputProps: getSigInputProps } = useDropzone({
        onDrop: onSigImageDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        multiple: false
    });

    // --- File Handling (Unchanged) ---
    const onDrop = (files: File[]) => {
        if (files[0]) {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfFile(files[0]);
            setPdfUrl(URL.createObjectURL(files[0]));
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    // --- PDF Export Logic (Updated for All Pages / Image Upload) ---
    const handleExport = async () => {
        if (!pdfFile) return;
        setIsProcessing(true);

        try {
            const existingBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingBytes);
            const pages = pdfDoc.getPages();
            
            // Logic to determine which pages to sign
            const pagesToProcess = applyToAll 
                ? pages.map((_, i) => i) 
                : [Math.min(targetPage - 1, pages.length - 1)];

            for (const pageIdx of pagesToProcess) {
                const currentPage = pages[pageIdx];
                const { width } = currentPage.getSize();

                if (activeTab === 'draw' && canvasRef.current) {
                    const sigDataUrl = canvasRef.current.toDataURL('image/png');
                    const sigImage = await pdfDoc.embedPng(sigDataUrl);
                    currentPage.drawImage(sigImage, { x: width - 200, y: 50, width: 150, height: 75 });
                } else if (activeTab === 'upload' && uploadedSig) {
                    const imageBytes = await fetch(uploadedSig).then(res => res.arrayBuffer());
                    const sigImage = uploadedSig.includes('png') ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
                    currentPage.drawImage(sigImage, { x: width - 200, y: 50, width: 150, height: 75 });
                } else if (activeTab === 'type') {
                    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
                    currentPage.drawText(typedName || 'Signed', {
                        x: width - 200, y: 70, size: 25, font, color: rgb(0, 0, 0),
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            saveAs(blob, `Signed_${pdfFile.name}`);
            toast({ title: "Document Signed", status: "success", duration: 3000 });
        } catch (err) {
            console.error(err);
            toast({ title: "Export Failed", status: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={8} px={4}>
            <Container maxW="container.xl">
                <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>

                    {/* LEFT: CONTROLS */}
                    <Box gridColumn={{ lg: "span 4" }} p={6} bg="white" rounded="3xl" shadow="sm" border="1px" borderColor="gray.200">
                        <VStack align="stretch" spacing={6}>
                            <Box>
                                <Heading size="md" display="flex" alignItems="center" gap={2}>
                                    <Icon as={FaSignature} color="blue.500" /> Signature Maker
                                </Heading>
                                <Text fontSize="xs" color="gray.400" fontWeight="bold" mt={1}>PRO WORKSPACE</Text>
                            </Box>

                            <HStack bg="gray.100" p={1} rounded="xl">
                                <Button flex={1} size="sm" variant={activeTab === 'draw' ? 'solid' : 'ghost'} colorScheme={activeTab === 'draw' ? 'blue' : 'gray'} onClick={() => setActiveTab('draw')} leftIcon={<EditIcon />}> Draw </Button>
                                <Button flex={1} size="sm" variant={activeTab === 'type' ? 'solid' : 'ghost'} colorScheme={activeTab === 'type' ? 'blue' : 'gray'} onClick={() => setActiveTab('type')} leftIcon={<Icon as={FaFont} />}> Type </Button>
                                <Button flex={1} size="sm" variant={activeTab === 'upload' ? 'solid' : 'ghost'} colorScheme={activeTab === 'upload' ? 'blue' : 'gray'} onClick={() => setActiveTab('upload')} leftIcon={<Icon as={FaImage} />}> Image </Button>
                            </HStack>

                            {activeTab === 'draw' && (
                                <Box position="relative" border="2px solid" borderColor="gray.100" rounded="2xl" bg="gray.50" overflow="hidden">
                                    <canvas ref={canvasRef} width={400} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} style={{ width: '100%', cursor: 'crosshair' }} />
                                    <IconButton aria-label="Clear" icon={<FaEraser />} size="sm" position="absolute" bottom={2} right={2} rounded="full" onClick={clearCanvas} colorScheme="red" variant="ghost" />
                                </Box>
                            )}

                            {activeTab === 'type' && (
                                <VStack spacing={4}>
                                    <Input placeholder="Type your name..." size="lg" rounded="xl" value={typedName} onChange={(e) => setTypedName(e.target.value)} />
                                    <Box p={4} w="full" bg="gray.50" rounded="xl" textAlign="center"><Text fontSize="2xl" fontFamily="serif" fontStyle="italic">{typedName || "Signature Preview"}</Text></Box>
                                </VStack>
                            )}

                            {activeTab === 'upload' && (
                                <Box {...getSigProps()} p={6} border="2px dashed" borderColor="gray.200" rounded="xl" textAlign="center" cursor="pointer" _hover={{ bg: "gray.50" }}>
                                    <input {...getSigInputProps()} />
                                    {uploadedSig ? (
                                        <VStack><Box as="img" src={uploadedSig} maxH="80px" alt="Signature" /><Text fontSize="xs" color="blue.500">Click to change</Text></VStack>
                                    ) : (
                                        <VStack color="gray.500"><Icon as={FaImage} w={8} h={8} /><Text fontSize="sm">Upload PNG/JPG Signature</Text></VStack>
                                    )}
                                </Box>
                            )}

                            <Divider />

                            {/* New Feature UI: Page Settings */}
                            <VStack align="stretch" spacing={3}>
                                <Checkbox isChecked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} colorScheme="blue" size="sm">
                                    Apply signature to all pages
                                </Checkbox>
                                {!applyToAll && (
                                    <HStack justify="space-between">
                                        <Text fontSize="sm">Sign specific page:</Text>
                                        <NumberInput size="sm" maxW={20} defaultValue={1} min={1} max={numPages || 1} onChange={(val) => setTargetPage(parseInt(val))}>
                                            <NumberInputField />
                                        </NumberInput>
                                    </HStack>
                                )}
                            </VStack>

                            <Button colorScheme="blue" size="lg" h="60px" rounded="2xl" shadow="lg" onClick={handleExport} isDisabled={!pdfFile || isProcessing} leftIcon={isProcessing ? <Spinner size="xs" /> : <DownloadIcon />}>
                                {isProcessing ? "Processing..." : "Export Signed PDF"}
                            </Button>

                            <Box {...getRootProps()} cursor="pointer" p={4} border="2px dashed" borderColor="gray.200" rounded="2xl" textAlign="center" _hover={{ borderColor: 'blue.400' }}>
                                <input {...getInputProps()} />
                                <HStack justify="center" spacing={2} color="gray.500"><Icon as={FaFileUpload} /><Text fontSize="sm" fontWeight="bold">Change PDF</Text></HStack>
                            </Box>
                        </VStack>
                    </Box>

                    {/* RIGHT: PREVIEW (Unchanged Structure) */}
                    <Box gridColumn={{ lg: "span 8" }} bg="gray.200" rounded="3xl" overflow="hidden" border="1px" borderColor="gray.300" position="relative">
                        <HStack position="absolute" top={4} left={4} zIndex={10} bg="whiteAlpha.900" px={3} py={1} rounded="full" shadow="sm">
                            <Icon as={FaRegEye} color="blue.500" />
                            <Text fontSize="xs" fontWeight="black">PREVIEW</Text>
                        </HStack>

                        <Box h="80vh" overflowY="auto" p={6}>
                            {pdfUrl ? (
                                <Center>
                                    <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<Spinner size="xl" />}>
                                        <Stack spacing={6}>
                                            {Array.from({ length: numPages }).map((_, i) => (
                                                <Box key={i} shadow="2xl" bg="white">
                                                    <Page pageNumber={i + 1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Document>
                                </Center>
                            ) : (
                                <Center h="full">
                                    <VStack color="gray.400" spacing={4}><Icon as={FaFileUpload} w={12} h={12} opacity={0.2} /><Text fontWeight="medium">Upload a PDF to start</Text></VStack>
                                </Center>
                            )}
                        </Box>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default PdfSignatureContent;
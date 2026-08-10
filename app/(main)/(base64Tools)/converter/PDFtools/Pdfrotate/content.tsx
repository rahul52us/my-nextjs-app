"use client";

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

// Chakra UI & React Icons (Already in your package.json)
import {
    Box, Button, Container, Flex, Heading, Icon, Input,
    Stack, Text, VStack, HStack, IconButton, Spinner, Center, useToast
} from '@chakra-ui/react';
import {
    DeleteIcon, DownloadIcon, RepeatIcon
} from '@chakra-ui/icons';
import { FaFilePdf, FaSyncAlt, FaTools, FaUpload } from 'react-icons/fa';
import { useFileTransfer } from '../../../../../context/FileTransferContext';
import ContinueToSection from '../../../../../component/common/ContinueToSection';

// PDF Worker setup
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const PdfRotatorContent: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [rotation, setRotation] = useState<number>(0);
    const [pageSelection, setPageSelection] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const toast = useToast();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        onDrop: (acceptedFiles) => {
            const selectedFile = acceptedFiles[0];
            if (selectedFile) {
                if (fileUrl) URL.revokeObjectURL(fileUrl);
                setFile(selectedFile);
                setFileUrl(URL.createObjectURL(selectedFile));
                setRotation(0);
            }
        },
    });

    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

    const getTargetPages = (total: number): number[] => {
        if (pageSelection.toLowerCase() === 'all' || !pageSelection.trim()) {
            return Array.from({ length: total }, (_, i) => i);
        }
        const pages = new Set<number>();
        pageSelection.split(',').forEach(part => {
            const range = part.trim().split('-').map(Number);
            if (range.length === 1 && !isNaN(range[0])) pages.add(range[0] - 1);
            else if (range.length === 2) {
                for (let i = range[0]; i <= range[1]; i++) {
                    if (!isNaN(i)) pages.add(i - 1);
                }
            }
        });
        return Array.from(pages).filter(p => p >= 0 && p < total);
    };

    const downloadRotatedPdf = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const targetIndices = getTargetPages(pages.length);

            targetIndices.forEach((idx) => {
                const page = pages[idx];
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotation));
            });

            const pdfBytes: Uint8Array = await pdfDoc.save();

            // FIXED: Using Uint8Array constructor to satisfy BlobPart requirement
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            saveAs(blob, `rotated-${file.name}`);

            toast({ title: "Success", description: "PDF rotated and saved.", status: "success" });
        } catch (error) {
            toast({ title: "Error", description: "Could not process PDF.", status: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={10}>
            <Container maxW="1350px" px={{ base: 4, md: 8 }}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Heading size="lg" display="flex" alignItems="center" gap={2}>
                        <Icon as={FaSyncAlt} color="brand.500" /> Rotate PDF Pages
                    </Heading>
                    {file && (
                        <Button leftIcon={<DeleteIcon />} variant="ghost" colorScheme="red" onClick={() => setFile(null)}>
                            Remove PDF
                        </Button>
                    )}
                </Flex>

                {!file ? (
                    <Center
                        {...getRootProps()}
                        p={20} border="3px dashed" borderColor={isDragActive ? "brand.400" : "gray.200"}
                        rounded="3xl" bg="white" cursor="pointer" transition="all 0.2s" _hover={{ borderColor: "brand.300" }}
                    >
                        <input {...getInputProps()} />
                        <VStack spacing={4}>
                            <Box p={6} bg="brand.50" rounded="2xl">
                                <Icon as={FaUpload} w={10} h={10} color="brand.500" />
                            </Box>
                            <Text fontWeight="bold" fontSize="xl">Drop your PDF here</Text>
                            <Text color="gray.400">or click to browse files</Text>
                        </VStack>
                    </Center>
                ) : (
                    <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 8, lg: 10 }} align="flex-start" justify="center">
                        {/* Main Rotator Workspace */}
                        <Box flex="1" w="full" minW={0}>
                            <Flex direction={{ base: "column", lg: "row" }} gap={8}>
                                {/* Preview Section */}
                                <Box flex={2} bg="white" rounded="2xl" shadow="sm" border="1px" borderColor="gray.100" overflow="hidden">
                                    <Box p={4} borderBottom="1px" borderColor="gray.100" bg="gray.50">
                                        <HStack>
                                            <Icon as={FaFilePdf} color="red.500" />
                                            <Text fontWeight="bold" fontSize="sm" isTruncated>{file.name}</Text>
                                        </HStack>
                                    </Box>
                                    <Box h="70vh" overflowY="auto" p={6} bg="gray.200">
                                        <Center>
                                            <Document
                                                file={fileUrl}
                                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                                loading={<Spinner size="xl" />}
                                            >
                                                <Stack spacing={8}>
                                                    {Array.from({ length: numPages }).map((_, i) => (
                                                        <Box key={i} shadow="2xl" bg="white">
                                                            <Page pageNumber={i + 1} width={500} renderTextLayer={false} renderAnnotationLayer={false} />
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Document>
                                        </Center>
                                    </Box>
                                </Box>

                                {/* Controls Section */}
                                <Box flex={1}>
                                    <VStack spacing={6} align="stretch" position="sticky" top="20px">
                                        <Box bg="white" p={6} rounded="2xl" shadow="sm" border="1px" borderColor="gray.100">
                                            <VStack align="stretch" spacing={5}>
                                                <HStack>
                                                    <Icon as={FaTools} color="brand.500" />
                                                    <Heading size="sm">Tools</Heading>
                                                </HStack>

                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>ROTATION</Text>
                                                    <HStack>
                                                        <Button leftIcon={<RepeatIcon />} flex={1} onClick={handleRotate} colorScheme="brand" variant="outline">
                                                            +90°
                                                        </Button>
                                                        <Box flex={1} textAlign="center" py={2} bg="brand.500" color="white" rounded="md" fontWeight="bold">
                                                            {rotation}°
                                                        </Box>
                                                    </HStack>
                                                </Box>

                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>APPLY TO PAGES</Text>
                                                    <Input
                                                        placeholder="all, 1-3, 5"
                                                        value={pageSelection}
                                                        onChange={(e) => setPageSelection(e.target.value)}
                                                        focusBorderColor="brand.400"
                                                    />
                                                    <Text fontSize="10px" color="gray.400" mt={1}>Example: "all" or "1, 2-5, 8"</Text>
                                                </Box>

                                                <Button
                                                    colorScheme="brand"
                                                    size="lg"
                                                    h="60px"
                                                    leftIcon={isProcessing ? <Spinner size="sm" /> : <DownloadIcon />}
                                                    onClick={downloadRotatedPdf}
                                                    isDisabled={isProcessing}
                                                >
                                                    {isProcessing ? "Processing..." : "Save & Download"}
                                                </Button>
                                            </VStack>
                                        </Box>
                                    </VStack>
                                </Box>
                            </Flex>
                        </Box>

                        {/* Right Sticky ContinueToSection Sidebar */}
                        {file && (
                            <Box
                                w={{ base: "full", lg: "320px", xl: "340px" }}
                                position={{ base: "relative", lg: "sticky" }}
                                top={{ lg: "100px" }}
                                alignSelf="flex-start"
                                flexShrink={0}
                            >
                                <ContinueToSection
                                    currentTool="pdf-rotate"
                                    variant="vertical"
                                    convertedFiles={[{ file, name: file.name, type: 'application/pdf' }]}
                                />
                            </Box>
                        )}
                    </Flex>
                )}
            </Container>
        </Box>
    );
};

export default PdfRotatorContent;

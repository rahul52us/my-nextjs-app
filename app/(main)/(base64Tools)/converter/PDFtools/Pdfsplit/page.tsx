"use client";

import React, { useState, useCallback, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  DownloadIcon, 
  EmailIcon, 
  AddIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { FaWhatsapp, FaFilePdf, FaLayerGroup, FaEye, FaCheckDouble, FaFileArchive } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import JSZip from 'jszip';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileData {
  file: File;
  url: string;
  pageCount: number;
}

const PdfSplitter: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [range, setRange] = useState({ from: '', to: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

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
        setRange({ from: '', to: '' });
      } catch (error) {
        toast({ title: "Error loading PDF", status: "error", duration: 3000 });
      }
    }
  }, [fileData, toast]);

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
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    for (let i = min; i <= max; i++) {
      if (i > 0 && i <= fileData.pageCount) {
        newPages.add(i - 1);
      }
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

  // Logic to Split Selected into ONE PDF
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
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `extracted_${fileData.file.name}`);
      
      toast({ title: "Pages Extracted", status: "success" });
    } catch (err) {
      toast({ title: "Extraction failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW: Logic to Split ALL pages into individual files in a ZIP
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
        const pdfBytes = await singlePdf.save();
        
        zip.file(`${fileNameNoExt}_page_${i + 1}.pdf`, pdfBytes);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${fileNameNoExt}_split_pages.zip`);
      
      toast({ 
        title: "ZIP Created", 
        description: `Split into ${fileData.pageCount} files`, 
        status: "success" 
      });
    } catch (err) {
      console.error(err);
      toast({ title: "ZIP creation failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={8}>
          
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="lg" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaLayerGroup} color="blue.500" /> PDF Toolset
                </Heading>
                <Text color="gray.500" fontSize="sm">Extract or Split into individual files</Text>
              </Box>

              {!fileData ? (
                <Center
                  {...getRootProps()}
                  border="2px"
                  borderStyle="dashed"
                  borderColor={isDragActive ? "blue.500" : "gray.200"}
                  bg={isDragActive ? "blue.50" : "white"}
                  rounded="2xl"
                  p={10}
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.400' }}
                >
                  <input {...getInputProps()} />
                  <VStack>
                    <Icon as={FaFilePdf} w={10} h={10} color="blue.400" />
                    <Text fontWeight="bold">Drop PDF file here</Text>
                    <Text fontSize="xs" color="gray.400">or click to browse</Text>
                  </VStack>
                </Center>
              ) : (
                <Box bg="white" p={6} rounded="2xl" shadow="sm" border="1px" borderColor="gray.100">
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack overflow="hidden">
                      <Icon as={FaFilePdf} color="red.500" />
                      <Box overflow="hidden">
                        <Text fontWeight="bold" isTruncated maxW="150px">{fileData.file.name}</Text>
                        <Text fontSize="xs" color="gray.400">{fileData.pageCount} Pages</Text>
                      </Box>
                    </HStack>
                    <IconButton 
                      aria-label="Remove" 
                      icon={<DeleteIcon />} 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setFileData(null)}
                    />
                  </Flex>

                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>QUICK RANGE</Text>
                      <HStack>
                        <Input placeholder="From" size="sm" type="number" value={range.from} onChange={e => setRange({...range, from: e.target.value})} />
                        <Input placeholder="To" size="sm" type="number" value={range.to} onChange={e => setRange({...range, to: e.target.value})} />
                        <IconButton aria-label="Add" icon={<AddIcon />} size="sm" colorScheme="blue" onClick={handleAddRange} />
                      </HStack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400">SELECTION</Text>
                        <HStack spacing={1}>
                           <Button variant="link" size="xs" colorScheme="blue" onClick={selectAll}>All</Button>
                           <Button variant="link" size="xs" colorScheme="red" onClick={() => setSelectedPages([])}>Clear</Button>
                        </HStack>
                      </Flex>
                      <SimpleGrid columns={5} gap={2} maxH="120px" overflowY="auto" p={1}>
                        {Array.from({ length: fileData.pageCount }).map((_, i) => (
                          <Button
                            key={i}
                            size="xs"
                            colorScheme={selectedPages.includes(i) ? "blue" : "gray"}
                            variant={selectedPages.includes(i) ? "solid" : "outline"}
                            onClick={() => togglePage(i)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* ACTION BUTTONS */}
                    <VStack spacing={3}>
                      <Button
                        w="full"
                        colorScheme="blue"
                        leftIcon={isProcessing ? <Spinner size="xs" /> : <DownloadIcon />}
                        onClick={handleDownloadSelected}
                        isDisabled={selectedPages.length === 0 || isProcessing}
                      >
                        Download Selected ({selectedPages.length})
                      </Button>

                      <Button
                        w="full"
                        variant="outline"
                        colorScheme="purple"
                        leftIcon={isProcessing ? <Spinner size="xs" /> : <FaFileArchive />}
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

          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Box bg="white" rounded="2xl" shadow="sm" border="1px" borderColor="gray.100" h={{ base: "600px", lg: "85vh" }} overflow="hidden" display="flex" flexDirection="column">
              <Flex p={4} borderBottom="1px" borderColor="gray.100" justify="space-between">
                <HStack color="gray.600">
                  <Icon as={FaEye} />
                  <Text fontWeight="medium">Interactive Preview</Text>
                </HStack>
              </Flex>
              
              <Box flex={1} bg="gray.100" overflowY="auto" p={4}>
                {fileData ? (
                  <Center>
                    <Document file={fileData.url}>
                      <Stack spacing={6}>
                        {Array.from({ length: fileData.pageCount }).map((_, i) => (
                          <Box 
                            key={i} 
                            position="relative"
                            border="4px solid" 
                            borderColor={selectedPages.includes(i) ? "blue.400" : "transparent"}
                            onClick={() => togglePage(i)}
                            cursor="pointer"
                            bg="white"
                            shadow="md"
                          >
                            <Page pageNumber={i + 1} width={500} renderTextLayer={false} renderAnnotationLayer={false} />
                            {selectedPages.includes(i) && (
                              <Box position="absolute" top={2} right={2} bg="blue.500" color="white" rounded="full" p={1}>
                                <FaCheckDouble size={12} />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Document>
                  </Center>
                ) : (
                  <Center h="full">
                    <Text color="gray.400">Upload a PDF to see preview</Text>
                  </Center>
                )}
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default PdfSplitter;
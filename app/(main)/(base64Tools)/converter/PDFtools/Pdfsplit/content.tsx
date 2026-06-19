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
  useColorModeValue,
} from '@chakra-ui/react';
import {
  DeleteIcon,
  DownloadIcon,
  EmailIcon,
  AddIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { FaWhatsapp, FaFilePdf, FaLayerGroup, FaEye, FaCheckDouble } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileData {
  file: File;
  url: string;
  pageCount: number;
}

const PdfSplitterContent: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [range, setRange] = useState({ from: '', to: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  // ── Theme tokens ──
  const bgPage         = useColorModeValue('gray.50',   'gray.950');
  const bgCard         = useColorModeValue('white',     'gray.900');
  const borderColor    = useColorModeValue('gray.100',  'gray.700');
  const textMuted      = useColorModeValue('gray.500',  'gray.400');
  const previewBg      = useColorModeValue('gray.100',  'gray.800');
  const headingColor   = useColorModeValue('gray.800',  'gray.100');
  const labelColor     = useColorModeValue('gray.400',  'gray.500');
  const pageNavColor   = useColorModeValue('gray.600',  'gray.300');
  const dropBorder     = useColorModeValue('gray.200',  'gray.600');
  const dropBg         = useColorModeValue('white',     'gray.900');
  const dropActiveBg   = useColorModeValue('blue.50',   'blue.900');
  const inputBg        = useColorModeValue('white',     'gray.800');
  const dividerColor   = useColorModeValue('gray.200',  'gray.700');
  const emptyIconColor = useColorModeValue('gray.300',  'gray.600');
  const emptyTextColor = useColorModeValue('gray.400',  'gray.500');

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

  const processPdf = async (): Promise<Blob | null> => {
    if (!fileData || selectedPages.length === 0) return null;
    setIsProcessing(true);
    try {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcDoc, selectedPages);
      copiedPages.forEach(page => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    } catch (err) {
      toast({ title: "Processing failed", status: "error" });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const blob = await processPdf();
    if (blob && fileData) {
      saveAs(blob, `split_${fileData.file.name}`);
      toast({ title: "Export Successful", description: `Extracted ${selectedPages.length} pages`, status: "success", duration: 3000 });
    }
  };

  const shareWhatsApp = () => {
    const text = `I've selected ${selectedPages.length} pages from "${fileData?.file.name}".`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = `Split PDF Request: ${fileData?.file.name}`;
    const body = `Selected Page Indices: ${selectedPages.map(p => p + 1).join(', ')}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Box minH="100vh" bg={bgPage} p={{ base: 4, md: 8 }} transition="background 0.2s">
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={8}>

          {/* ── Sidebar Controls ── */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="lg" display="flex" alignItems="center" gap={2} color={headingColor}>
                  <Icon as={FaLayerGroup} color="blue.500" /> PDF Splitter
                </Heading>
                <Text color={textMuted} fontSize="sm">Extract pages with precision</Text>
              </Box>

              {!fileData ? (
                <Center
                  {...getRootProps()}
                  border="2px" borderStyle="dashed"
                  borderColor={isDragActive ? "blue.500" : dropBorder}
                  bg={isDragActive ? dropActiveBg : dropBg}
                  rounded="2xl" p={10} cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.400' }}
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
                      size="sm" variant="ghost" colorScheme="red"
                      onClick={() => { URL.revokeObjectURL(fileData.url); setFileData(null); setSelectedPages([]); }}
                    />
                  </Flex>

                  <Divider borderColor={dividerColor} mb={4} />

                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={2}>QUICK RANGE</Text>
                      <HStack>
                        <Input placeholder="From" size="sm" type="number" bg={inputBg} value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
                        <Input placeholder="To" size="sm" type="number" bg={inputBg} value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />
                        <IconButton aria-label="Add Range" icon={<AddIcon />} size="sm" colorScheme="blue" onClick={handleAddRange} />
                      </HStack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color={labelColor}>MANUAL SELECTION</Text>
                        <HStack spacing={1}>
                          <Button variant="link" size="xs" colorScheme="blue" onClick={selectAll} leftIcon={<FaCheckDouble />}>All</Button>
                          <Text color={dividerColor}>|</Text>
                          <Button variant="link" size="xs" colorScheme="red" onClick={() => setSelectedPages([])} leftIcon={<RepeatIcon />}>Clear</Button>
                        </HStack>
                      </Flex>
                      <SimpleGrid columns={5} gap={2} maxH="180px" overflowY="auto" p={1}>
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

                    <Button
                      colorScheme="blue" size="lg"
                      leftIcon={isProcessing ? <Spinner size="xs" /> : <DownloadIcon />}
                      onClick={handleDownload}
                      isDisabled={selectedPages.length === 0 || isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Download (${selectedPages.length})`}
                    </Button>

                    <HStack>
                      <Button leftIcon={<FaWhatsapp />} colorScheme="whatsapp" variant="outline" flex={1} size="sm" onClick={shareWhatsApp}>WhatsApp</Button>
                      <Button leftIcon={<EmailIcon />} colorScheme="gray" variant="outline" flex={1} size="sm" onClick={shareEmail}>Email</Button>
                    </HStack>
                  </Stack>
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* ── Preview Area ── */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Box
              bg={bgCard} rounded="2xl" shadow="sm"
              border="1px" borderColor={borderColor}
              h={{ base: "600px", lg: "85vh" }}
              overflow="hidden" display="flex" flexDirection="column"
              transition="background 0.2s"
            >
              <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center">
                <HStack color={pageNavColor}>
                  <Icon as={FaEye} />
                  <Text fontWeight="medium">Interactive Preview</Text>
                </HStack>
                {fileData && (
                  <Text fontSize="xs" color={textMuted}>Click pages to select/deselect</Text>
                )}
              </Flex>

              <Box flex={1} bg={previewBg} overflowY="auto" p={4}>
                {fileData ? (
                  <Center>
                    <Document file={fileData.url} loading={<Spinner color="blue.500" m={10} />}>
                      <Stack spacing={6}>
                        {Array.from({ length: fileData.pageCount }).map((_, i) => (
                          <Box
                            key={i}
                            position="relative"
                            border="4px solid"
                            borderColor={selectedPages.includes(i) ? "blue.400" : "transparent"}
                            borderRadius="md"
                            onClick={() => togglePage(i)}
                            cursor="pointer"
                            bg="white"
                            shadow="md"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.02)' }}
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
                    <VStack color={emptyIconColor} spacing={4}>
                      <Icon as={FaFilePdf} w={20} h={20} opacity={0.3} />
                      <Text fontSize="lg" color={emptyTextColor}>Upload a PDF to preview and select pages</Text>
                    </VStack>
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

export default PdfSplitterContent;
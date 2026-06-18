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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
} from '@chakra-ui/react';
import {
  DeleteIcon,
  DownloadIcon,
  EmailIcon,
  AddIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import {
  FaWhatsapp,
  FaFilePdf,
  FaLayerGroup,
  FaEye,
  FaCheckDouble,
  FaTrash,
  FaRedo,
  FaCrop,
  FaUndo,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileData {
  file: File;
  url: string;
  pageCount: number;
}

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  crop: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  deleted: boolean;
}

const PdfSplitterContent: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [pageItems, setPageItems] = useState<PageItem[]>([]);
  const [range, setRange] = useState({ from: '', to: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropModalPage, setCropModalPage] = useState<PageItem | null>(null);
  const [tempCrop, setTempCrop] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const toast = useToast();

  // ── Theme tokens ──
  const bgPage = useColorModeValue('gray.50', 'gray.950');
  const bgCard = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const previewBg = useColorModeValue('gray.100', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const labelColor = useColorModeValue('gray.400', 'gray.500');
  const pageNavColor = useColorModeValue('gray.600', 'gray.300');
  const dropBorder = useColorModeValue('gray.200', 'gray.600');
  const dropBg = useColorModeValue('white', 'gray.900');
  const dropActiveBg = useColorModeValue('blue.50', 'blue.900');
  const inputBg = useColorModeValue('white', 'gray.800');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
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
        const pageCount = pdfDoc.getPageCount();
        if (fileData?.url) URL.revokeObjectURL(fileData.url);

        setFileData({
          file,
          url: URL.createObjectURL(file),
          pageCount,
        });

        // Initialize pageItems
        const items: PageItem[] = Array.from({ length: pageCount }, (_, i) => ({
          id: `page-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          originalIndex: i,
          rotation: 0,
          crop: { left: 0, right: 0, top: 0, bottom: 0 },
          deleted: false,
        }));
        setPageItems(items);
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

    const minPage = Math.min(start, end) - 1;
    const maxPage = Math.max(start, end) - 1;

    setPageItems(prev =>
      prev.map(item => {
        const inRange = item.originalIndex >= minPage && item.originalIndex <= maxPage;
        return {
          ...item,
          deleted: !inRange,
        };
      })
    );
    setRange({ from: '', to: '' });
    toast({ title: "Quick range applied", description: `Pages ${minPage + 1} to ${maxPage + 1} kept`, status: "info", duration: 2500 });
  };

  const handleShiftPage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pageItems.length) return;
    const newItems = [...pageItems];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;
    setPageItems(newItems);
  };

  const handleRotatePage = (id: string) => {
    setPageItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  };

  const handleDeletePage = (id: string) => {
    setPageItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, deleted: true }
          : item
      )
    );
  };

  const handleRestorePage = (id: string) => {
    setPageItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, deleted: false }
          : item
      )
    );
  };

  const selectAll = () => {
    setPageItems(prev => prev.map(item => ({ ...item, deleted: false })));
  };

  const clearAll = () => {
    setPageItems(prev => prev.map(item => ({ ...item, deleted: true })));
  };

  const handleResetAllEdits = () => {
    if (!fileData) return;
    const items: PageItem[] = Array.from({ length: fileData.pageCount }, (_, i) => ({
      id: `page-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      originalIndex: i,
      rotation: 0,
      crop: { left: 0, right: 0, top: 0, bottom: 0 },
      deleted: false,
    }));
    setPageItems(items);
    toast({ title: "Edits reset", status: "info", duration: 2000 });
  };

  // Crop Modal Helpers
  const openCropModal = (pageItem: PageItem) => {
    setCropModalPage(pageItem);
    setTempCrop({ ...pageItem.crop });
  };

  const saveCrop = () => {
    if (cropModalPage) {
      setPageItems(prev =>
        prev.map(item =>
          item.id === cropModalPage.id
            ? { ...item, crop: tempCrop }
            : item
        )
      );
      setCropModalPage(null);
      toast({ title: "Crop applied", status: "success", duration: 2000 });
    }
  };

  const processPdf = async (): Promise<Blob | null> => {
    const activeItems = pageItems.filter(p => !p.deleted);
    if (!fileData || activeItems.length === 0) return null;
    setIsProcessing(true);
    try {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (const item of activeItems) {
        const [copiedPage] = await newPdf.copyPages(srcDoc, [item.originalIndex]);

        // Rotation
        if (item.rotation !== 0) {
          const originalRotation = copiedPage.getRotation() ? copiedPage.getRotation().angle : 0;
          copiedPage.setRotation(degrees((originalRotation + item.rotation) % 360));
        }

        // Crop Box
        const { left, right, top, bottom } = item.crop;
        if (left > 0 || right > 0 || top > 0 || bottom > 0) {
          const width = copiedPage.getWidth();
          const height = copiedPage.getHeight();

          const pdfX = (left / 100) * width;
          const pdfY = (bottom / 100) * height;
          const pdfWidth = width - ((left + right) / 100) * width;
          const pdfHeight = height - ((top + bottom) / 100) * height;

          copiedPage.setCropBox(pdfX, pdfY, pdfWidth, pdfHeight);
          copiedPage.setMediaBox(pdfX, pdfY, pdfWidth, pdfHeight);
        }

        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    } catch (err) {
      console.error(err);
      toast({ title: "Processing failed", status: "error" });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const blob = await processPdf();
    const activeItems = pageItems.filter(p => !p.deleted);
    if (blob && fileData) {
      saveAs(blob, `edited_${fileData.file.name}`);
      toast({ title: "Export Successful", description: `Downloaded ${activeItems.length} pages`, status: "success", duration: 3000 });
    }
  };

  const shareWhatsApp = () => {
    const activeItems = pageItems.filter(p => !p.deleted);
    const text = `I've edited and generated a PDF with ${activeItems.length} pages from "${fileData?.file.name}".`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = () => {
    const activeItems = pageItems.filter(p => !p.deleted);
    const subject = `Edited PDF: ${fileData?.file.name}`;
    const body = `Modified page order sequence: ${activeItems.map((p, i) => `Page ${i + 1} (Original Page ${p.originalIndex + 1})`).join('\n')}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const activeItemsCount = pageItems.filter(p => !p.deleted).length;
  const deletedItems = pageItems.filter(p => p.deleted);

  return (
    <Box minH="100vh" bg={bgPage} p={{ base: 4, md: 8 }} transition="background 0.2s">
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={8}>

          {/* ── Sidebar Controls ── */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="lg" display="flex" alignItems="center" gap={2} color={headingColor}>
                  <Icon as={FaLayerGroup} color="blue.500" /> PDF Splitter & Editor
                </Heading>
                <Text color={textMuted} fontSize="sm">Reorder, rotate, crop & delete pages in one place</Text>
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
                      onClick={() => { URL.revokeObjectURL(fileData.url); setFileData(null); setPageItems([]); }}
                    />
                  </Flex>

                  <Divider borderColor={dividerColor} mb={4} />

                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={2}>QUICK RANGE SELECTION</Text>
                      <HStack>
                        <Input placeholder="From" size="sm" type="number" bg={inputBg} value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
                        <Input placeholder="To" size="sm" type="number" bg={inputBg} value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />
                        <IconButton aria-label="Add Range" icon={<AddIcon />} size="sm" colorScheme="blue" onClick={handleAddRange} />
                      </HStack>
                      <Text fontSize="10px" color={textMuted} mt={1}>Excludes all pages outside this range</Text>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color={labelColor}>PAGE SELECTION</Text>
                        <HStack spacing={1}>
                          <Button variant="link" size="xs" colorScheme="blue" onClick={selectAll} leftIcon={<FaCheckDouble />}>All</Button>
                          <Text color={dividerColor}>|</Text>
                          <Button variant="link" size="xs" colorScheme="red" onClick={clearAll} leftIcon={<RepeatIcon />}>None</Button>
                        </HStack>
                      </Flex>
                      <Text fontSize="xs" color={pageNavColor} mb={2}>
                        Active pages: <b>{activeItemsCount}</b> of <b>{pageItems.length}</b>
                      </Text>
                    </Box>

                    <Divider borderColor={dividerColor} />

                    <VStack align="stretch" spacing={2}>
                      <Button
                        colorScheme="blue" size="lg"
                        leftIcon={isProcessing ? <Spinner size="xs" /> : <DownloadIcon />}
                        onClick={handleDownload}
                        isDisabled={activeItemsCount === 0 || isProcessing}
                      >
                        {isProcessing ? "Processing..." : `Download PDF (${activeItemsCount})`}
                      </Button>

                      <Button size="sm" variant="ghost" leftIcon={<FaUndo />} onClick={handleResetAllEdits}>
                        Reset All Changes
                      </Button>
                    </VStack>

                    {/* <HStack>
                      <Button leftIcon={<FaWhatsapp />} colorScheme="whatsapp" variant="outline" flex={1} size="sm" onClick={shareWhatsApp}>WhatsApp</Button>
                      <Button leftIcon={<EmailIcon />} colorScheme="gray" variant="outline" flex={1} size="sm" onClick={shareEmail}>Email</Button>
                    </HStack> */}

                    {deletedItems.length > 0 && (
                      <Box mt={2}>
                        <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={2}>EXCLUDED PAGES ({deletedItems.length})</Text>
                        <SimpleGrid columns={4} gap={1.5} maxH="120px" overflowY="auto" p={1} bg={previewBg} borderRadius="lg">
                          {deletedItems.map((item) => {
                            const actualIdx = pageItems.findIndex(p => p.id === item.id);
                            return (
                              <Button
                                key={item.id}
                                size="xs"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => handleRestorePage(item.id)}
                                fontSize="9px"
                              >
                                + Page {actualIdx + 1}
                              </Button>
                            );
                          })}
                        </SimpleGrid>
                      </Box>
                    )}
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
                  <Text fontWeight="medium">Interactive Workspace</Text>
                </HStack>
                {fileData && (
                  <Text fontSize="xs" color={textMuted}>Drag, rotate, crop & rearrange below</Text>
                )}
              </Flex>

              <Box flex={1} bg={previewBg} overflowY="auto" p={6}>
                {fileData ? (
                  <Center>
                    <Document file={fileData.url} loading={<Spinner color="blue.500" m={10} />}>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} p={2}>
                        {pageItems.map((item, idx) => {
                          const isExcluded = item.deleted;
                          return (
                            <Box
                              key={item.id}
                              position="relative"
                              bg={bgCard}
                              borderRadius="2xl"
                              border="2px solid"
                              borderColor={isExcluded ? "red.400" : borderColor}
                              p={3}
                              opacity={isExcluded ? 0.45 : 1}
                              shadow="sm"
                              transition="all 0.25s"
                              _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                            >
                              {/* Header badge */}
                              <Flex w="100%" justify="space-between" align="center" mb={2}>
                                <Badge colorScheme={isExcluded ? "red" : "blue"} borderRadius="full" px={2} fontSize="9px">
                                  Page {idx + 1} {item.originalIndex !== idx && `(Orig: ${item.originalIndex + 1})`}
                                </Badge>
                                {isExcluded && <Badge colorScheme="red" fontSize="8px">Excluded</Badge>}
                              </Flex>

                              {/* Thumbnail Container */}
                              <Box
                                position="relative"
                                overflow="hidden"
                                bg="white"
                                shadow="inner"
                                borderRadius="lg"
                                mb={3}
                                border="1px solid"
                                borderColor="gray.200"
                                onClick={() => isExcluded ? handleRestorePage(item.id) : undefined}
                                cursor={isExcluded ? "pointer" : "default"}
                              >
                                {/* Crop Overlay Preview */}
                                {!isExcluded && (item.crop.left > 0 || item.crop.right > 0 || item.crop.top > 0 || item.crop.bottom > 0) && (
                                  <>
                                    <Box position="absolute" top={0} left={0} right={0} height={`${item.crop.top}%`} bg="blackAlpha.500" zIndex={2} />
                                    <Box position="absolute" bottom={0} left={0} right={0} height={`${item.crop.bottom}%`} bg="blackAlpha.500" zIndex={2} />
                                    <Box position="absolute" top={`${item.crop.top}%`} bottom={`${item.crop.bottom}%`} left={0} width={`${item.crop.left}%`} bg="blackAlpha.500" zIndex={2} />
                                    <Box position="absolute" top={`${item.crop.top}%`} bottom={`${item.crop.bottom}%`} right={0} width={`${item.crop.right}%`} bg="blackAlpha.500" zIndex={2} />
                                    <Box
                                      position="absolute"
                                      top={`${item.crop.top}%`}
                                      bottom={`${item.crop.bottom}%`}
                                      left={`${item.crop.left}%`}
                                      right={`${item.crop.right}%`}
                                      border="1px dashed"
                                      borderColor="blue.400"
                                      zIndex={3}
                                      pointerEvents="none"
                                    />
                                  </>
                                )}

                                {isExcluded && (
                                  <Center position="absolute" inset={0} bg="blackAlpha.600" zIndex={4} color="white" flexDirection="column" gap={1}>
                                    <Text fontSize="10px" fontWeight="bold">Excluded</Text>
                                    <Button size="xs" colorScheme="blue" h="18px" fontSize="9px">Include</Button>
                                  </Center>
                                )}

                                <Page
                                  pageNumber={item.originalIndex + 1}
                                  rotate={item.rotation}
                                  width={140}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  loading={<Spinner size="xs" />}
                                />
                              </Box>

                              {/* Tool buttons */}
                              <HStack spacing={1} justify="center" w="100%">
                                <IconButton
                                  aria-label="Shift Left"
                                  icon={<FaArrowLeft size={10} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleShiftPage(idx, -1)}
                                  isDisabled={idx === 0 || isExcluded}
                                />
                                <IconButton
                                  aria-label="Rotate"
                                  icon={<FaRedo size={10} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleRotatePage(item.id)}
                                  isDisabled={isExcluded}
                                />
                                <IconButton
                                  aria-label="Crop"
                                  icon={<FaCrop size={10} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => openCropModal(item)}
                                  isDisabled={isExcluded}
                                />
                                <IconButton
                                  aria-label="Exclude/Delete"
                                  icon={isExcluded ? <FaUndo size={10} /> : <FaTrash size={10} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme={isExcluded ? "blue" : "red"}
                                  onClick={() => isExcluded ? handleRestorePage(item.id) : handleDeletePage(item.id)}
                                />
                                <IconButton
                                  aria-label="Shift Right"
                                  icon={<FaArrowRight size={10} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleShiftPage(idx, 1)}
                                  isDisabled={idx === pageItems.length - 1 || isExcluded}
                                />
                              </HStack>
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </Document>
                  </Center>
                ) : (
                  <Center h="full">
                    <VStack color={emptyIconColor} spacing={4}>
                      <Icon as={FaFilePdf} w={20} h={20} opacity={0.3} />
                      <Text fontSize="lg" color={emptyTextColor}>Upload a PDF to preview and edit pages</Text>
                    </VStack>
                  </Center>
                )}
              </Box>
            </Box>
          </GridItem>

        </Grid>
      </Container>

      {/* Crop Modal */}
      <Modal isOpen={cropModalPage !== null} onClose={() => setCropModalPage(null)} size="2xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bgCard} color={headingColor} borderRadius="2xl" border="1px" borderColor={borderColor}>
          <ModalHeader>
            Crop Page {cropModalPage ? pageItems.findIndex(p => p.id === cropModalPage.id) + 1 : ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {cropModalPage && (
              <Grid templateColumns={{ base: '1fr', md: '1.2fr 1fr' }} gap={6}>
                {/* Visual Preview */}
                <Center bg={previewBg} p={4} borderRadius="xl" position="relative" overflow="hidden" minH="320px">
                  <Box position="relative" overflow="hidden" shadow="md" bg="white" borderRadius="md">
                    {/* Visual Crop Overlay */}
                    <Box position="absolute" top={0} left={0} right={0} height={`${tempCrop.top}%`} bg="blackAlpha.600" zIndex={2} />
                    <Box position="absolute" bottom={0} left={0} right={0} height={`${tempCrop.bottom}%`} bg="blackAlpha.600" zIndex={2} />
                    <Box position="absolute" top={`${tempCrop.top}%`} bottom={`${tempCrop.bottom}%`} left={0} width={`${tempCrop.left}%`} bg="blackAlpha.600" zIndex={2} />
                    <Box position="absolute" top={`${tempCrop.top}%`} bottom={`${tempCrop.bottom}%`} right={0} width={`${tempCrop.right}%`} bg="blackAlpha.600" zIndex={2} />
                    <Box
                      position="absolute"
                      top={`${tempCrop.top}%`}
                      bottom={`${tempCrop.bottom}%`}
                      left={`${tempCrop.left}%`}
                      right={`${tempCrop.right}%`}
                      border="2px dashed"
                      borderColor="blue.500"
                      zIndex={3}
                      pointerEvents="none"
                    />
                    {fileData && (
                      <Document file={fileData.url} loading={<Spinner size="xs" />}>
                        <Page
                          pageNumber={cropModalPage.originalIndex + 1}
                          rotate={cropModalPage.rotation}
                          width={200}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    )}
                  </Box>
                </Center>

                {/* Slider Inputs */}
                <VStack spacing={5} align="stretch" justify="center">
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="bold">Top Margin Cut</Text>
                      <Badge colorScheme="blue">{tempCrop.top}%</Badge>
                    </Flex>
                    <Slider value={tempCrop.top} min={0} max={50} onChange={v => setTempCrop(prev => ({ ...prev, top: v }))}>
                      <SliderTrack><SliderFilledTrack bg="blue.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="bold">Bottom Margin Cut</Text>
                      <Badge colorScheme="blue">{tempCrop.bottom}%</Badge>
                    </Flex>
                    <Slider value={tempCrop.bottom} min={0} max={50} onChange={v => setTempCrop(prev => ({ ...prev, bottom: v }))}>
                      <SliderTrack><SliderFilledTrack bg="blue.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="bold">Left Margin Cut</Text>
                      <Badge colorScheme="blue">{tempCrop.left}%</Badge>
                    </Flex>
                    <Slider value={tempCrop.left} min={0} max={50} onChange={v => setTempCrop(prev => ({ ...prev, left: v }))}>
                      <SliderTrack><SliderFilledTrack bg="blue.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="bold">Right Margin Cut</Text>
                      <Badge colorScheme="blue">{tempCrop.right}%</Badge>
                    </Flex>
                    <Slider value={tempCrop.right} min={0} max={50} onChange={v => setTempCrop(prev => ({ ...prev, right: v }))}>
                      <SliderTrack><SliderFilledTrack bg="blue.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Button size="sm" variant="outline" colorScheme="red" onClick={() => setTempCrop({ left: 0, right: 0, top: 0, bottom: 0 })}>
                    Clear Crop
                  </Button>
                </VStack>
              </Grid>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button mr={3} variant="ghost" onClick={() => setCropModalPage(null)}>Cancel</Button>
            <Button colorScheme="blue" onClick={saveCrop}>Apply Crop</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default PdfSplitterContent;
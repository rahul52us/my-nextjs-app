"use client";
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Text, Heading, Spinner, IconButton,
  VStack, HStack, Badge, useToast, Icon, Container,
  useColorModeValue
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { CloseIcon, DownloadIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { FiMove } from 'react-icons/fi';

import { useFileTransfer } from '../../../../../context/FileTransferContext';
import ContinueToSection from '../../../../../component/common/ContinueToSection';

// PDF Worker setup
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PageItem {
  id: string;
  originalIndex: number;
}

const RearrangePages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("gray.200", "gray.700");
  const textGray = useColorModeValue("gray.500", "gray.400");
  const boxBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const toast = useToast();
  const { consumeTransferForTool, clearTransferState } = useFileTransfer();

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkTransfer = async () => {
      const state = await consumeTransferForTool("pdf-rearrange");
      if (isMounted && state && state.items.length > 0) {
        const item = state.items[0];
        const fileObj = item.file instanceof File ? item.file : new File([item.file], item.fileName, { type: item.fileType });
        setFile(fileObj);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    const initialPages = Array.from({ length: numPages }, (_, i) => ({
      id: `page-${i}-${Date.now()}`,
      originalIndex: i,
    }));
    setPages(initialPages);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter(p => p.id !== id));
  };

  const downloadRearrangedPDF = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(existingPdfBytes);
      const pdfDoc = await PDFDocument.create();

      for (const pageItem of pages) {
        const [copiedPage] = await pdfDoc.copyPages(srcDoc, [pageItem.originalIndex]);
        pdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await pdfDoc.save();
     const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      // FIX: Trigger the download using file-saver
      saveAs(blob, `rearranged_${file.name}`);

      toast({
        title: "Success",
        description: "PDF reordered successfully!",
        status: "success",
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process PDF.",
        status: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isReady) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner color="brand.500" />
      </Flex>
    );
  }

  return (    <Box minH="100vh" bg={bgMain} py={10}>
      <Container maxW="1350px" px={{ base: 4, md: 8 }}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 8, lg: 10 }} align="flex-start" justify="center">
          <VStack spacing={8} align="stretch" flex="1" w="full" minW={0}>
            {/* Header */}
            <Flex
              justify="space-between"
              align="center"
              bg={cardBg}

              p={6}
              borderRadius="xl"
              shadow="sm"
              border="1px solid"
              borderColor={borderClr}
            >
              <Box>
                <Heading size="lg" color="brand.600">PDF Architect</Heading>
                <Text color={textGray} fontSize="sm">Rearrange or remove pages with ease</Text>
              </Box>
              {file && (
                <HStack spacing={3}>
                  <Button leftIcon={<DeleteIcon />} variant="ghost" colorScheme="red" onClick={() => setFile(null)}>
                    Discard
                  </Button>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="brand"
                    shadow="md"
                    isLoading={isProcessing}
                    onClick={downloadRearrangedPDF}
                  >
                    Save & Download
                  </Button>
                </HStack>
              )}
            </Flex>

            {/* Upload Dropzone */}
            {!file && (
              <Box
                {...getRootProps()}
                p={12}
                border="2px dashed"
                borderColor="brand.300"
                borderRadius="2xl"
                bg={cardBg}

                textAlign="center"
                cursor="pointer"
                transition="0.2s"
                _hover={{ borderColor: "brand.500", bg: hoverBg }}
              >
                <input {...getInputProps()} />
                <VStack spacing={3}>
                  <AddIcon boxSize={8} color="brand.500" />
                  <Heading size="md">Drop your PDF file here</Heading>
                  <Text color={textGray} fontSize="sm">or click to choose file from device</Text>
                </VStack>
              </Box>
            )}

            {/* Drag and Drop Workspace */}
            {file && (
              <Box
                bg={boxBg}
                p={8}
                borderRadius="2xl"
                shadow="md"
                border="1px solid"
                borderColor={borderClr}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <VStack py={10}>
                      <Spinner size="xl" color="brand.500" />
                      <Text color={textGray} mt={4}>Rendering page previews...</Text>
                    </VStack>
                  }
                >
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="pdf-pages" direction="horizontal">
                      {(provided) => (
                        <Flex
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          wrap="wrap"
                          gap={6}
                          justify="center"
                        >
                          {pages.map((pageItem, index) => (
                            <Draggable
                              key={pageItem.id}
                              draggableId={pageItem.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  position="relative"
                                  role="group"
                                >
                                  {/* Delete Page Badge */}
                                  <IconButton
                                    aria-label="Remove Page"
                                    icon={<CloseIcon fontSize="8px" />}
                                    size="xs"
                                    colorScheme="red"
                                    position="absolute"
                                    top="-10px"
                                    right="-10px"
                                    rounded="full"
                                    zIndex={20}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePage(pageItem.id);
                                    }}
                                    opacity={0}
                                    _groupHover={{ opacity: 1 }}
                                    transition="0.2s"
                                  />

                                  <Box
                                    bg={cardBg}

                                    borderRadius="lg"
                                    overflow="hidden"
                                    border="2px solid"
                                    borderColor={snapshot.isDragging ? "brand.500" : "gray.200"}
                                    shadow={snapshot.isDragging ? "2xl" : "sm"}
                                    transition="0.2s"
                                    transform={snapshot.isDragging ? "scale(1.05)" : "none"}
                                  >
                                    <Page
                                      pageNumber={pageItem.originalIndex + 1}
                                      width={160}
                                      renderTextLayer={false}
                                      renderAnnotationLayer={false}
                                    />
                                    <Box py={2} bg={bgMain} borderTop="1px solid" borderColor={borderClr}>
                                      <Text fontSize="xs" fontWeight="bold" textAlign="center" color="gray.500">
                                        ORIGINAL: {pageItem.originalIndex + 1}
                                      </Text>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Flex>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Document>
              </Box>
            )}
          </VStack>

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
                currentTool="pdf-rearrange"
                variant="vertical"
                convertedFiles={[{ file, name: file.name, type: 'application/pdf' }]}
              />
            </Box>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default RearrangePages;
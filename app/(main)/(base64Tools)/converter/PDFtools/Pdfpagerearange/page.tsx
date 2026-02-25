"use client";
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Text, Heading, Spinner, IconButton,
  VStack, HStack, Badge, useToast, Icon, Container
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { CloseIcon, DownloadIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { FiMove } from 'react-icons/fi';

// PDF Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageItem {
  id: string;
  originalIndex: number;
}

const RearrangePages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsReady(true);
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
        <Spinner color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" color="gray.800" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box>
              <Heading size="lg" color="blue.600">PDF Architect</Heading>
              <Text color="gray.500" fontSize="sm">Rearrange or remove pages with ease</Text>
            </Box>
            {file && (
              <HStack spacing={3}>
                <Button leftIcon={<DeleteIcon />} variant="ghost" colorScheme="red" onClick={() => setFile(null)}>
                  Discard
                </Button>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  shadow="md"
                  isLoading={isProcessing}
                  onClick={downloadRearrangedPDF}
                >
                  Save & Download
                </Button>
              </HStack>
            )}
          </Flex>

          {/* Upload Area */}
          {!file ? (
            <Box
              {...getRootProps()}
              h="400px"
              border="2px dashed"
              borderColor={isDragActive ? "blue.400" : "gray.300"}
              bg={isDragActive ? "blue.50" : "white"}
              borderRadius="2xl"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ borderColor: "blue.500", bg: "gray.100" }}
            >
              <input {...getInputProps()} />
              <Icon as={AddIcon} w={10} h={10} mb={4} color="blue.500" />
              <Heading size="md" mb={2} fontWeight="600">Click or drag PDF to upload</Heading>
              <Text color="gray.400">Support for files up to 50MB</Text>
            </Box>
          ) : (
            <Box bg="white" p={10} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="inner">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Spinner color="blue.500" m={10} />}
              >
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="pdf-grid" direction="horizontal">
                    {(provided) => (
                      <Flex
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        wrap="wrap"
                        gap={12}
                        justify="center"
                        minH="300px"
                      >
                        {pages.map((pageItem, index) => (
                          <Draggable key={pageItem.id} draggableId={pageItem.id} index={index}>
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                position="relative"
                                role="group"
                              >
                                <Badge
                                  position="absolute"
                                  top="-15px"
                                  left="50%"
                                  transform="translateX(-50%)"
                                  zIndex={10}
                                  colorScheme="blue"
                                  variant="solid"
                                  rounded="full"
                                  px={3}
                                  shadow="md"
                                >
                                  {index + 1}
                                </Badge>

                                <IconButton
                                  aria-label="Remove"
                                  icon={<CloseIcon fontSize="10px" />}
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
                                  bg="white"
                                  borderRadius="lg"
                                  overflow="hidden"
                                  border="2px solid"
                                  borderColor={snapshot.isDragging ? "blue.500" : "gray.200"}
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
                                  <Box py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
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
      </Container>
    </Box>
  );
};

export default RearrangePages;
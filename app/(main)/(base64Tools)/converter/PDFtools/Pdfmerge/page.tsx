"use client";

import React, { useState, useRef } from 'react';
import {
  Box, Button, Container, VStack, HStack, Text, Heading, Icon, IconButton,
  List, ListItem, useToast, Center, Spinner, Badge, Tooltip, Image, AspectRatio,
  FormControl, FormLabel, Input, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, useColorModeValue
} from '@chakra-ui/react';
import { 
  FiFileText, FiX, FiArrowUp, FiArrowDown, FiFilePlus, FiEye, FiDownload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

const MotionListItem = motion(ListItem);

type FileDocType = 'application/pdf' | 'image';

interface FileWithId {
  id: string;
  file: File;
  preview: string;
  type: FileDocType;
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const PdfMerger = () => {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadName, setDownloadName] = useState('merged');
  const [isFilenameModalOpen, setIsFilenameModalOpen] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Drag & drop state
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  /* ✅ COLOR MODE FIX */
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.100");
  const textSecondary = useColorModeValue("gray.505", "gray.400");
  const hoverBg = useColorModeValue("brand.50", "gray.700");

  // Drag-active dropzone colors — same colorMode pattern as the rest of the UI
  const dragActiveBg = useColorModeValue("brand.50", "gray.700");
  const dragActiveBorder = useColorModeValue("brand.500", "brand.300");
  const dropzoneIconThumbBg = useColorModeValue("gray.50", "gray.700");

  // Shared logic for both <input> selection and drag-drop
  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const valid: File[] = [];
    let rejected = 0;

    incoming.forEach((file) => {
      if (ACCEPTED_TYPES.includes(file.type)) {
        valid.push(file);
      } else {
        rejected++;
      }
    });

    if (rejected > 0) {
      toast({
        title: rejected === incoming.length ? "Unsupported file type" : "Some files were skipped",
        description: "Only PDF, PNG, JPG, and WEBP files are supported.",
        status: "warning",
        duration: 3000,
      });
    }

    if (valid.length === 0) return;

    const newFiles: FileWithId[] = valid.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.includes('pdf') ? 'application/pdf' : 'image') as FileDocType,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Drag and drop handlers ---
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounter.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (id: string, preview: string) => {
    URL.revokeObjectURL(preview);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const generateMergedPdf = async () => {
    const mergedPdf = await PDFDocument.create();
    
    for (const item of files) {
      const arrayBuffer = await item.file.arrayBuffer();
      
      if (item.type === 'application/pdf') {
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else {
        const image = item.file.type === 'image/png' 
          ? await mergedPdf.embedPng(arrayBuffer)
          : await mergedPdf.embedJpg(arrayBuffer);
        
        const page = mergedPdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
    }
    return await mergedPdf.save();
  };

  const handleDownloadClick = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await generateMergedPdf();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setDownloadBlob(blob);
      setDownloadName('merged');
      setIsFilenameModalOpen(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Error processing files", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await generateMergedPdf();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      toast({ title: "Error processing files", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDownload = () => {
    if (!downloadBlob) return;
    const trimmed = downloadName.trim() || 'merged';
    const filename = trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
    saveAs(downloadBlob, filename);
    toast({ title: "Downloaded Successfully", status: "success" });
    setIsFilenameModalOpen(false);
    setDownloadBlob(null);
  };

  return (
    <Box minH="100vh" bg={pageBg} py={10} px={4}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Badge colorScheme="brand" borderRadius="full" px={3}>All-in-One</Badge>
            <Heading size="xl" color={textPrimary}>
              Merge PDF & Image <Text as="span" color="brand.500">Converter</Text>
            </Heading>
            <Text color={textSecondary}>Combine PDFs and Images into a single document</Text>
          </VStack>

          <Center
            as="label"
            htmlFor="file-upload"
            p={10}
            cursor="pointer"
            border="2px dashed"
            borderColor={isDragActive ? dragActiveBorder : "brand.300"}
            borderRadius="2xl"
            bg={isDragActive ? dragActiveBg : cardBg}
            transform={isDragActive ? "scale(1.01)" : "scale(1)"}
            _hover={{ bg: hoverBg, borderColor: 'brand.500' }}
            transition="all 0.2s"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <VStack>
              <Icon as={FiFilePlus} boxSize={10} color={isDragActive ? dragActiveBorder : "brand.500"} />
              <Text fontWeight="bold" color={textPrimary}>
                {isDragActive ? "Drop your files here" : "Click to upload PDFs or Images"}
              </Text>
              <Text fontSize="xs" color={textSecondary}>Supports PDF, PNG, JPG</Text>
            </VStack>
            <input id="file-upload" type="file" multiple accept="application/pdf,image/*" hidden onChange={handleFileChange} ref={fileInputRef} />
          </Center>

          <AnimatePresence>
            {files.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <Box bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
                  <List>
                    {files.map((item, index) => (
                      <MotionListItem key={item.id} layout
                        p={4}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack spacing={4} flex={1}>
                          <Text fontWeight="bold" color={textSecondary} w="20px">{index + 1}</Text>
                          <AspectRatio ratio={1} w="50px" borderRadius="md" overflow="hidden" bg={dropzoneIconThumbBg}>
                            {item.type === 'image' ? (
                              <Image src={item.preview} alt="preview" objectFit="cover" />
                            ) : (
                              <Center><Icon as={FiFileText} color="red.400" /></Center>
                            )}
                          </AspectRatio>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold" noOfLines={1} color={textPrimary}>
                              {item.file.name}
                            </Text>
                            <Text fontSize="xs" color={textSecondary}>
                              {(item.file.size / 1024).toFixed(0)} KB
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Tooltip label="Preview File">
                            <IconButton aria-label="view" icon={<FiEye />} size="sm" variant="ghost" onClick={() => window.open(item.preview, '_blank')} />
                          </Tooltip>
                          <IconButton aria-label="up" icon={<FiArrowUp />} size="sm" variant="ghost" isDisabled={index === 0} onClick={() => moveFile(index, 'up')} />
                          <IconButton aria-label="down" icon={<FiArrowDown />} size="sm" variant="ghost" isDisabled={index === files.length - 1} onClick={() => moveFile(index, 'down')} />
                          <IconButton aria-label="remove" icon={<FiX />} size="sm" variant="ghost" colorScheme="red" onClick={() => removeFile(item.id, item.preview)} />
                        </HStack>
                      </MotionListItem>
                    ))}
                  </List>
                </Box>

                <HStack spacing={4}>
                  <Button flex={1} leftIcon={<FiEye />} size="lg" variant="outline" colorScheme="brand" isDisabled={isProcessing} onClick={handlePreview}>
                    Preview Merge
                  </Button>
                  <Button flex={2} leftIcon={isProcessing ? <Spinner size="sm" /> : <FiDownload />} size="lg" colorScheme="brand" isDisabled={files.length < 1 || isProcessing} onClick={handleDownloadClick}>
                    {isProcessing ? 'Processing...' : 'Merge & Download'}
                  </Button>
                </HStack>
              </VStack>
            )}
          </AnimatePresence>
        </VStack>
      </Container>

      <Modal isOpen={isFilenameModalOpen} onClose={() => setIsFilenameModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save merged PDF</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>File name</FormLabel>
              <Input
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value)}
                placeholder="Enter a filename"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsFilenameModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={confirmDownload}>
              Save & Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PdfMerger;
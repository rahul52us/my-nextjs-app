"use client";

import React, { useState, useRef } from 'react';
import {
  Box, Button, Container, VStack, HStack, Text, Heading, Icon, IconButton,
  List, ListItem, useToast, Center, Divider, Spinner, Badge, Tooltip, Image, AspectRatio
} from '@chakra-ui/react';
import {
  FiFileText, FiX, FiArrowUp, FiArrowDown, FiTrash2, FiFilePlus, FiEye, FiDownload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);

// Define the type strictly
type FileDocType = 'application/pdf' | 'image';

interface FileWithId {
  id: string;
  file: File;
  preview: string;
  type: FileDocType;
}

const PdfMerger = () => {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileWithId[] = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        // Fix 1: Cast the string to our specific union type
        type: (file.type.includes('pdf') ? 'application/pdf' : 'image') as FileDocType,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleAction = async (action: 'download' | 'preview') => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await generateMergedPdf();
      // Fix 2: Explicitly wrapping in Uint8Array to satisfy BlobPart requirements
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (action === 'download') {
        saveAs(blob, `merged_${Date.now()}.pdf`);
        toast({ title: "Downloaded Successfully", status: "success" });
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error processing files", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Badge colorScheme="purple" borderRadius="full" px={3}>All-in-One</Badge>
            <Heading size="xl">PDF & Image <Text as="span" color="blue.500">Converter</Text></Heading>
            <Text color="gray.500">Combine PDFs and Images into a single document</Text>
          </VStack>

          <Center
            as="label"
            htmlFor="file-upload"
            p={10}
            cursor="pointer"
            border="2px dashed"
            borderColor="blue.300"
            borderRadius="2xl"
            bg="white"
            _hover={{ bg: 'blue.50', borderColor: 'blue.500' }}
            transition="all 0.2s"
          >
            <VStack>
              <Icon as={FiFilePlus} boxSize={10} color="blue.500" />
              <Text fontWeight="bold">Click to upload PDFs or Images</Text>
              <Text fontSize="xs" color="gray.400">Supports PDF, PNG, JPG</Text>
            </VStack>
            <input id="file-upload" type="file" multiple accept="application/pdf,image/*" hidden onChange={handleFileChange} ref={fileInputRef} />
          </Center>

          <AnimatePresence>
            {files.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <Box bg="white" shadow="xl" borderRadius="2xl" overflow="hidden">
                  <List>
                    {files.map((item, index) => (
                      <MotionListItem key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        p={4} borderBottom="1px solid" borderColor="gray.100" display="flex" alignItems="center" justifyContent="space-between">

                        <HStack spacing={4} flex={1}>
                          <Text fontWeight="bold" color="gray.300" w="20px">{index + 1}</Text>
                          <AspectRatio ratio={1} w="50px" borderRadius="md" overflow="hidden" bg="gray.50">
                            {item.type === 'image' ? (
                              <Image src={item.preview} alt="preview" objectFit="cover" />
                            ) : (
                              <Center><Icon as={FiFileText} color="red.400" /></Center>
                            )}
                          </AspectRatio>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{item.file.name}</Text>
                            <Text fontSize="xs" color="gray.400">{(item.file.size / 1024).toFixed(0)} KB</Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Tooltip label="Preview File"><IconButton aria-label="view" icon={<FiEye />} size="sm" variant="ghost" onClick={() => window.open(item.preview, '_blank')} /></Tooltip>
                          <IconButton aria-label="up" icon={<FiArrowUp />} size="sm" variant="ghost" isDisabled={index === 0} onClick={() => moveFile(index, 'up')} />
                          <IconButton aria-label="down" icon={<FiArrowDown />} size="sm" variant="ghost" isDisabled={index === files.length - 1} onClick={() => moveFile(index, 'down')} />
                          <IconButton aria-label="remove" icon={<FiX />} size="sm" variant="ghost" colorScheme="red" onClick={() => removeFile(item.id, item.preview)} />
                        </HStack>
                      </MotionListItem>
                    ))}
                  </List>
                </Box>

                <HStack spacing={4}>
                  <Button flex={1} leftIcon={<FiEye />} size="lg" variant="outline" colorScheme="blue" isDisabled={isProcessing} onClick={() => handleAction('preview')}>
                    Preview Merge
                  </Button>
                  <Button flex={2} leftIcon={isProcessing ? <Spinner size="sm" /> : <FiDownload />} size="lg" colorScheme="blue" isDisabled={files.length < 1 || isProcessing} onClick={() => handleAction('download')}>
                    {isProcessing ? 'Processing...' : 'Merge & Download'}
                  </Button>
                </HStack>
              </VStack>
            )}
          </AnimatePresence>
        </VStack>
      </Container>
    </Box>
  );
};

export default PdfMerger;
"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  IconButton,
  List,
  ListItem,
  useToast,
  Center,
  Divider,
  Spinner,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiX, 
  FiArrowUp, 
  FiArrowDown, 
  FiPlus, 
  FiLink,
  FiTrash2,
  FiFilePlus
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);

interface FileWithId {
  id: string;
  file: File;
}

const PdfMerger = () => {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setFiles([]);

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const fileItem of files) {
        const fileBytes = await fileItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      saveAs(blob, `merged_${Date.now()}.pdf`);
      toast({ title: "Merged Successfully", status: "success", duration: 2000 });
    } catch (error) {
      toast({ title: "Error", description: "Failed to merge PDFs.", status: "error" });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      bg="gray.50" 
      bgGradient="radial(circle at 20% 20%, blue.50 0%, transparent 40%), radial(circle at 80% 80%, pink.50 0%, transparent 40%)"
      py={20}
    >
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          
          {/* Header Section */}
          <VStack spacing={3} textAlign="center">
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" textTransform="uppercase" letterSpacing="widest">
              PDF Toolbox
            </Badge>
            <Heading size="2xl" color="gray.900" fontWeight="900" letterSpacing="tight">
              PDF <Text as="span" color="blue.500">Merger</Text>
            </Heading>
            <Text color="gray.500" fontSize="lg" fontWeight="medium">
              Drag, reorder, and combine your documents with ease.
            </Text>
          </VStack>

          {/* Drag & Drop Area */}
          <MotionBox
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Center
              as="label"
              htmlFor="file-upload"
              p={12}
              cursor="pointer"
              border="2px dashed"
              borderColor="blue.200"
              borderRadius="3xl"
              bg="white"
              shadow="sm"
              transition="all 0.3s ease"
              _hover={{ borderColor: 'blue.500', shadow: '2xl', bg: 'blue.50/30' }}
              flexDirection="column"
              position="relative"
              overflow="hidden"
            >
              <VStack spacing={4}>
                <Box bg="blue.500" color="white" p={4} borderRadius="2xl" shadow="0 10px 20px -5px rgba(66, 153, 225, 0.6)">
                  <Icon as={FiFilePlus} boxSize={8} />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="xl" color="gray.800">Choose PDF files</Text>
                  <Text fontSize="sm" color="gray.400">or drag and drop them here</Text>
                </VStack>
              </VStack>
              <input id="file-upload" type="file" multiple accept="application/pdf" hidden onChange={handleFileChange} ref={fileInputRef} />
            </Center>
          </MotionBox>

          {/* List Section */}
          <AnimatePresence mode="popLayout">
            {files.length > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                bg="white" 
                shadow="2xl" 
                borderRadius="3xl" 
                border="1px solid" 
                borderColor="gray.100" 
                overflow="hidden"
              >
                <Box px={6} py={4} bg="white" borderBottom="1px solid" borderColor="gray.50">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Text fontWeight="800" fontSize="xs" color="blue.500" textTransform="uppercase" letterSpacing="widest">
                        Queue
                      </Text>
                      <Badge borderRadius="full" px={2} colorScheme="blue">{files.length}</Badge>
                    </HStack>
                    <Button leftIcon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={clearAll} borderRadius="full">
                      Clear All
                    </Button>
                  </HStack>
                </Box>
                
                <List spacing={0}>
                  <AnimatePresence>
                    {files.map((item, index) => (
                      <MotionListItem 
                        key={item.id}
                        layout
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        px={6} py={4}
                        _notLast={{ borderBottom: '1px solid', borderColor: 'gray.50' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        _hover={{ bg: 'blue.50/20' }}
                      >
                        <HStack spacing={4} overflow="hidden">
                          <Text fontSize="xs" fontWeight="bold" color="gray.300" w="18px">{index + 1}</Text>
                          <Icon as={FiFileText} color="red.400" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.700" isTruncated maxW={["140px", "280px"]}>
                              {item.file.name}
                            </Text>
                            <Text fontSize="xs" color="gray.400">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={1}>
                          <Tooltip label="Move Up" hasArrow>
                            <IconButton aria-label="up" icon={<FiArrowUp />} size="sm" variant="ghost" isDisabled={index === 0} onClick={() => moveFile(index, 'up')} borderRadius="lg" />
                          </Tooltip>
                          <Tooltip label="Move Down" hasArrow>
                            <IconButton aria-label="down" icon={<FiArrowDown />} size="sm" variant="ghost" isDisabled={index === files.length - 1} onClick={() => moveFile(index, 'down')} borderRadius="lg" />
                          </Tooltip>
                          <Divider orientation="vertical" h="20px" mx={2} />
                          <IconButton aria-label="remove" icon={<FiX />} size="sm" variant="ghost" colorScheme="red" onClick={() => removeFile(item.id)} borderRadius="lg" />
                        </HStack>
                      </MotionListItem>
                    ))}
                  </AnimatePresence>
                </List>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Merge Button */}
          <Button
            size="lg"
            colorScheme="blue"
            h="70px"
            borderRadius="2xl"
            fontSize="lg"
            fontWeight="bold"
            leftIcon={isMerging ? <Spinner size="sm" /> : <FiLink />}
            isDisabled={files.length < 2 || isMerging}
            onClick={mergePdfs}
            shadow="0 20px 40px -10px rgba(66, 153, 225, 0.5)"
            _hover={{ transform: 'translateY(-2px)', shadow: '0 25px 50px -12px rgba(66, 153, 225, 0.6)' }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.3s cubic-bezier(.23,1,.32,1)"
          >
            {isMerging ? 'Combining your files...' : `Merge Documents`}
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default PdfMerger;
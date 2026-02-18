"use client";

import React, { useState, useRef } from 'react';
import {
  Box, Button, Container, Heading, Text, VStack, useToast,
  Icon, Progress, HStack, ScaleFade, Flex, Badge, Divider,
  Center, SimpleGrid, Card, CardBody
} from '@chakra-ui/react';
import { FiUploadCloud, FiFileText, FiShield, FiZap, FiCheckCircle, FiTrash2, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import * as pdfjs from 'pdfjs-dist';

// Updated Worker Path for v4.x Compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MotionBox = motion(Box);

const PDFToWordConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const renderPDFPreview = async (data: Uint8Array) => {
    // We use .slice() to create a copy so the buffer isn't detached for the main converter
    const loadingTask = pdfjs.getDocument({ data: data.slice() });
    const pdf = await loadingTask.promise;

    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = ''; 
      const pagesToRender = Math.min(pdf.numPages, 3);
      
      for (let i = 1; i <= pagesToRender; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = "100%";
        canvas.style.marginBottom = "15px";
        canvas.style.borderRadius = "4px";

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          canvasContainerRef.current.appendChild(canvas);
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const uintArray = new Uint8Array(arrayBuffer);
      setFileData(uintArray);
      // Pass a slice to the preview so the original uintArray remains valid for conversion
      renderPDFPreview(uintArray.slice());
    } else {
      toast({
        title: "Selection Error",
        description: "Please select a valid PDF file.",
        status: "warning",
        variant: "subtle",
      });
    }
  };

  const convertToWord = async () => {
    if (!fileData) return;
    setIsConverting(true);

    try {
      // Use .slice() here as well to be safe
      const loadingTask = pdfjs.getDocument({ data: fileData.slice() });
      const pdf = await loadingTask.promise;
      const docSections: Paragraph[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines: Record<number, string> = {};
        
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]); 
          if (!lines[y]) lines[y] = "";
          lines[y] += item.str + " ";
        });

        const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);

        sortedY.forEach(y => {
          const text = lines[y].trim();
          if (text) {
            docSections.push(
              new Paragraph({
                children: [new TextRun({ text, size: 24 })],
                spacing: { after: 200 }
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{ properties: {}, children: docSections }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName?.replace('.pdf', '.docx') || 'converted-doc.docx');

      toast({
        title: "Conversion Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Conversion Error:", error);
      toast({
        title: "Conversion Failed",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={20}>
      <Container maxW="container.lg">
        <VStack spacing={12} align="stretch">
          
          <VStack spacing={4} textAlign="center">
            <Heading color="gray.800" size="2xl" fontWeight="900">
              PDF to <Text as="span" color="blue.500">Word</Text>
            </Heading>
            <Text color="gray.500">Secure, fast, and local browser-based conversion.</Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: fileName ? 2 : 1 }} spacing={8}>
            <Card variant="outline" borderRadius="3xl" boxShadow="2xl" border="none" bg="white">
              <CardBody p={8}>
                <VStack spacing={8}>
                  <Box
                    w="full" position="relative" p={10} border="2px dashed"
                    borderColor={fileName ? "blue.400" : "gray.200"}
                    borderRadius="2xl" bg={fileName ? "blue.50" : "gray.50"}
                  >
                    <input
                      type="file" accept="application/pdf"
                      onChange={handleFileChange}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1 }}
                    />
                    <VStack spacing={4}>
                      <Center boxSize="60px" bg={fileName ? "blue.500" : "blue.50"} color={fileName ? "white" : "blue.500"} borderRadius="xl">
                        <Icon as={fileName ? FiCheckCircle : FiUploadCloud} boxSize={8} />
                      </Center>
                      <Text fontSize="xl" fontWeight="bold">{fileName ? fileName : "Upload your PDF"}</Text>
                    </VStack>
                  </Box>

                  {isConverting && (
                    <Progress size="xs" isIndeterminate colorScheme="blue" w="full" borderRadius="full" />
                  )}

                  <ScaleFade in={!!fileName} unmountOnExit style={{ width: '100%' }}>
                    <HStack spacing={4}>
                      <Button leftIcon={<FiFileText />} colorScheme="blue" w="full" size="lg" height="60px" onClick={convertToWord} isLoading={isConverting}>
                        Convert to .docx
                      </Button>
                      <Button size="lg" height="60px" variant="ghost" colorScheme="red" onClick={() => { setFileName(null); setFileData(null); }}>
                        <FiTrash2 />
                      </Button>
                    </HStack>
                  </ScaleFade>
                </VStack>
              </CardBody>
            </Card>

            {/* Visual PDF View */}
            {fileName && (
              <Box>
                <HStack mb={4} color="gray.600">
                  <Icon as={FiEye} />
                  <Text fontWeight="bold">Visual Preview</Text>
                </HStack>
                <Box 
                  ref={canvasContainerRef} 
                  bg="gray.100" 
                  p={4} 
                  borderRadius="2xl" 
                  h="450px" 
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.200"
                />
              </Box>
            )}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <FeatureIcon icon={FiZap} title="Instant" desc="Fast extraction." />
            <FeatureIcon icon={FiShield} title="Secure" desc="Local device only." />
            <FeatureIcon icon={FiCheckCircle} title="Clean" desc="Optimized layout." />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

const FeatureIcon = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <HStack spacing={4} align="start">
    <Center boxSize="40px" bg="white" borderRadius="lg" shadow="sm" color="blue.500" flexShrink={0}>
      <Icon as={icon} />
    </Center>
    <VStack align="start" spacing={0}>
      <Text fontWeight="bold" color="gray.700">{title}</Text>
      <Text fontSize="xs" color="gray.500">{desc}</Text>
    </VStack>
  </HStack>
);

export default PDFToWordConverter;
"use client";

import React, { useState } from 'react';
import {
  Box, Button, Container, Heading, Text, VStack, useToast,
  Icon, Progress, HStack, ScaleFade, Flex, Badge, Divider,
  Center, SimpleGrid, Card, CardBody
} from '@chakra-ui/react';
import { FiUploadCloud, FiFileText, FiShield, FiZap, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
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
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      setFileData(new Uint8Array(arrayBuffer));
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
      const loadingTask = pdfjs.getDocument({ data: fileData });
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

        const sortedY = Object.keys(lines)
          .map(Number)
          .sort((a, b) => b - a);

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
        description: "Your document is downloading...",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Conversion Error:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "An error occurred while processing the PDF.",
        status: "error",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={20}>
      <Container maxW="container.md">
        <VStack spacing={12} align="stretch">
          
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
            <Heading color="gray.800" size="2xl" fontWeight="900" letterSpacing="tight">
              PDF to <Text as="span" color="blue.500">Word</Text>
            </Heading>
            <Text color="gray.500" fontSize="lg" maxW="lg">
              High-fidelity conversion powered by your browser. No files are ever sent to a server.
            </Text>
          </VStack>

          {/* Main Dropzone Area */}
          <Card 
            variant="outline" 
            borderRadius="3xl" 
            boxShadow="2xl" 
            overflow="hidden" 
            border="none"
            bg="white"
          >
            <CardBody p={8}>
              <VStack spacing={8}>
                <Box
                  w="full"
                  position="relative"
                  p={10}
                  border="2px dashed"
                  borderColor={fileName ? "blue.400" : "gray.200"}
                  borderRadius="2xl"
                  bg={fileName ? "blue.50" : "gray.50"}
                  transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                  _hover={{ borderColor: "blue.300", bg: "white" }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      opacity: 0, cursor: 'pointer', zIndex: 1
                    }}
                  />
                  <VStack spacing={4}>
                    <Center 
                      boxSize="60px" 
                      bg={fileName ? "blue.500" : "blue.50"} 
                      color={fileName ? "white" : "blue.500"} 
                      borderRadius="xl"
                      transition="0.3s"
                    >
                      <Icon as={fileName ? FiCheckCircle : FiUploadCloud} boxSize={8} />
                    </Center>
                    <VStack spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color="gray.700">
                        {fileName ? fileName : "Upload your PDF"}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Click or drag and drop your file here
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {isConverting && (
                  <Box w="full">
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase">
                        Reconstructing Document...
                      </Text>
                      <Text fontSize="xs" color="gray.400">Local processing active</Text>
                    </Flex>
                    <Progress size="xs" isIndeterminate colorScheme="blue" borderRadius="full" />
                  </Box>
                )}

                <ScaleFade in={!!fileName} unmountOnExit style={{ width: '100%' }}>
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<FiFileText />}
                      colorScheme="blue"
                      w="full"
                      size="lg"
                      height="60px"
                      fontSize="md"
                      boxShadow="0 4px 14px 0 rgba(0, 118, 255, 0.39)"
                      onClick={convertToWord}
                      isLoading={isConverting}
                      borderRadius="xl"
                    >
                      Convert to .docx
                    </Button>
                    <Button 
                      size="lg" 
                      height="60px" 
                      variant="ghost" 
                      colorScheme="red"
                      onClick={() => { setFileName(null); setFileData(null); }}
                      borderRadius="xl"
                    >
                      <FiTrash2 />
                    </Button>
                  </HStack>
                </ScaleFade>
              </VStack>
            </CardBody>
          </Card>

          {/* Feature Highlight Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <FeatureIcon 
              icon={FiZap} 
              title="Instant" 
              desc="Fast extraction right in your browser." 
            />
            <FeatureIcon 
              icon={FiShield} 
              title="Secure" 
              desc="Your data never leaves your device." 
            />
            <FeatureIcon 
              icon={FiCheckCircle} 
              title="Clean" 
              desc="Optimized line-by-line reconstruction." 
            />
          </SimpleGrid>

          <Divider />
          
          <Text textAlign="center" color="gray.400" fontSize="sm">
            Powered by PDF.js & Docx Engine
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

// Helper component for features
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
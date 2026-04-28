"use client";

import React, { useState, useRef } from 'react';
import { 
  Box, Button, Heading, VStack, Text, Input, useToast, 
  Container, Center, useColorModeValue, Icon, Badge, HStack,
  Spinner, Flex
} from '@chakra-ui/react';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import { Download, Eye, UploadCloud, Trash2, ShieldCheck, FileText } from 'lucide-react';

const WordToPdf = () => {
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const hiddenPrintRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  const pageBg = useColorModeValue("gray.50", "#0a0a0a");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      toast({ title: "Invalid Format", description: "Please upload a .docx file", status: "error" });
      return;
    }
    setFileName(file.name.replace('.docx', ''));
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Mammoth options to preserve more structure
      const options = {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Table'] => table:fresh"
        ]
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, options);

      // Advanced CSS for PDF Accuracy
      const styledHtml = `
        <style>
          .pdf-render-container { 
            font-family: 'Times New Roman', Times, serif; /* More standard for Word docs */
            color: #000;
            line-height: 1.5;
            font-size: 12pt;
            width: 100%;
            box-sizing: border-box;
          }
          /* Prevent text slicing across pages */
          .pdf-render-container p, 
          .pdf-render-container h1, 
          .pdf-render-container h2, 
          .pdf-render-container h3, 
          .pdf-render-container li,
          .pdf-render-container table tr { 
            page-break-inside: avoid; 
            break-inside: avoid;
            margin-bottom: 10pt;
          }
          .pdf-render-container h1 { font-size: 22pt; margin-top: 0; }
          .pdf-render-container h2 { font-size: 18pt; margin-top: 15pt; border-bottom: 0.5pt solid #ccc; }
          .pdf-render-container img { max-width: 100%; height: auto; }
          .pdf-render-container table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15pt 0;
            table-layout: fixed; 
          }
          .pdf-render-container td, .pdf-render-container th { 
            border: 0.5pt solid #666; 
            padding: 6pt; 
            vertical-align: top;
            word-wrap: break-word;
          }
        </style>
        <div class="pdf-render-container">
          ${result.value}
        </div>
      `;

      setHtmlPreview(styledHtml);
      toast({ title: "Document Processed", status: "success" });
    } catch (err) {
      toast({ title: "Conversion Failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!hiddenPrintRef.current) return;
    setIsGenerating(true);

    const opt = {
      margin: [0.75, 0.75, 0.75, 0.75] as [number, number, number, number], // Standard 0.75 inch Word margins
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg' as 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, // Increased scale for crisp text
        useCORS: true, 
        logging: false,
        letterRendering: true,
        windowWidth: 800 // Forces a specific width for layout calculation
      },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } 
    };

    try {
      await html2pdf().set(opt).from(hiddenPrintRef.current).save();
    } catch (error) {
      console.error(error);
      toast({ title: "Export Error", status: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 4, md: 10 }}>
      <Container maxW="container.xl">
        <Flex direction="column" gap={6}>
          
          <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={4}>
            <VStack align={{ base: "center", md: "start" }} spacing={0}>
              <Heading size="lg" letterSpacing="tight">
                Swift<Text as="span" color="blue.500">PDF</Text>
              </Heading>
              <Text fontSize="sm" color="gray.500">Professional Word to PDF Engine</Text>
            </VStack>
            <HStack spacing={3}>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                <Icon as={ShieldCheck} mr={1} verticalAlign="middle" /> High-Fidelity Mode
              </Badge>
              {htmlPreview && (
                <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<Trash2 size={16}/>} onClick={() => setHtmlPreview("")}>
                  Clear
                </Button>
              )}
            </HStack>
          </Flex>

          {!htmlPreview ? (
            <Center 
              w="full" minH="350px" bg={cardBg} borderRadius="3xl" border="2px dashed"
              borderColor={isDragging ? "blue.400" : "gray.200"}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <VStack spacing={6} p={6}>
                <Box p={6} bg="blue.50" borderRadius="full" color="blue.500">
                  <Icon as={UploadCloud} w={10} h={10} />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Text fontWeight="bold" fontSize="xl">Upload your .docx file</Text>
                  <Text color="gray.500" fontSize="sm">Converted locally. Content never leaves your device.</Text>
                </VStack>
                <Input type="file" accept=".docx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} display="none" id="file-upload" />
                <Button as="label" htmlFor="file-upload" colorScheme="blue" size="lg" px={10} borderRadius="full" cursor="pointer" isLoading={loading}>
                  Select File
                </Button>
              </VStack>
            </Center>
          ) : (
            <Flex direction={{ base: "column", lg: "row" }} gap={6} align="start">
              
              <Box flex={2} w="full" bg="white" borderRadius="2xl" boxShadow="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                <HStack p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100" justify="space-between">
                  <HStack>
                    <Icon as={Eye} color="blue.500" />
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">SMART PREVIEW</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.400" fontWeight="bold">{fileName}.docx</Text>
                </HStack>
                <Box p={{ base: 4, md: 10 }} maxH="70vh" overflowY="auto">
                   <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                </Box>
              </Box>

              <VStack flex={1} w="full" spacing={4} position={{ lg: "sticky" }} top="20px">
                <Box w="full" p={6} bg={cardBg} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
                  <VStack align="stretch" spacing={5}>
                    <HStack>
                      <Icon as={FileText} color="blue.500" />
                      <Text fontWeight="bold">Export Settings</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      We use a high-DPI rendering engine (300+ DPI equivalent) to ensure tables and fonts stay sharp in the final PDF.
                    </Text>
                    <Button 
                      w="full" colorScheme="blue" size="lg" h="70px"
                      leftIcon={isGenerating ? <Spinner size="sm" /> : <Download size={20} />}
                      onClick={downloadPdf}
                      isLoading={isGenerating}
                      loadingText="Finalizing PDF..."
                      borderRadius="xl"
                      boxShadow="lg"
                    >
                      Download PDF
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Flex>
          )}

          {/* This is the hidden engine room where the PDF is "photographed" */}
          <Box position="absolute" top="-9999px" left="-9999px" aria-hidden="true">
            <div 
              ref={hiddenPrintRef} 
              style={{ 
                width: '794px', // Standard A4 pixel width at 96dpi
                padding: '20px',
                background: 'white' 
              }} 
              dangerouslySetInnerHTML={{ __html: htmlPreview }} 
            />
          </Box>

        </Flex>
      </Container>
    </Box>
  );
};

export default WordToPdf;
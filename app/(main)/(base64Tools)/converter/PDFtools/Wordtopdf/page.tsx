"use client";

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Heading, 
  VStack, 
  Text, 
  Input, 
  useToast, 
  Divider, 
  Container, 
  Center,
  useColorModeValue, // Added for dark mode support
  Icon,
  Badge,
  HStack
} from '@chakra-ui/react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { FileText, Download, Eye, CheckCircle } from 'lucide-react';

const WordToPdf = () => {
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // --- Dark Mode Colors ---
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const previewPaperBg = "white"; // Always white for realistic document feel
  const dropzoneHoverBg = useColorModeValue("blue.50", "whiteAlpha.50");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({ title: "Invalid file type", status: "error", duration: 3000 });
      return;
    }

    setFileName(file.name.replace('.docx', ''));
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlPreview(result.value);
      
      toast({ title: "Preview Generated", status: "success", duration: 2000 });
    } catch (err) {
      console.error(err);
      toast({ title: "Error reading file", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    doc.html(previewRef.current, {
      callback: function (doc) {
        doc.save(`${fileName || 'document'}.pdf`);
      },
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 515,
      windowWidth: 800
    });
  };

  return (
    <Box minH="100vh" bg={pageBg} transition="background 0.2s">
      <Container maxW="container.md" py={10}>
        <VStack spacing={6} align="stretch">
          
          <VStack spacing={2} textAlign="center">
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Premium Word Engine
            </Badge>
            <Heading size="xl" fontWeight="900" letterSpacing="tight">
              Word <Text as="span" color="blue.500">to PDF</Text>
            </Heading>
            <Text color={textColor}>Upload a .docx file to preview and convert</Text>
          </VStack>

          <Box 
            p={10} 
            bg={cardBg}
            border="2px dashed" 
            borderColor={cardBorder} 
            borderRadius="3xl" 
            textAlign="center"
            transition="all 0.3s"
            _hover={{ borderColor: 'blue.500', bg: dropzoneHoverBg, shadow: 'xl' }}
            shadow="sm"
          >
            <Input 
              type="file" 
              accept=".docx" 
              onChange={handleFileChange} 
              display="none" 
              id="file-upload" 
            />
            <label htmlFor="file-upload">
              <Button 
                as="span" 
                leftIcon={<FileText size={18} />} 
                colorScheme="blue" 
                cursor="pointer" 
                isLoading={loading}
                borderRadius="full"
                size="lg"
                boxShadow="md"
              >
                Choose Word Document
              </Button>
            </label>
            {fileName && (
              <Text mt={4} fontSize="sm" fontWeight="bold" color="blue.500">
                {fileName}.docx
              </Text>
            )}
          </Box>

          {htmlPreview && (
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md" display="flex" alignItems="center">
                  <Eye size={20} style={{ marginRight: '8px' }} /> Live Preview
                </Heading>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHtmlPreview("")}
                    colorScheme="red"
                >
                    Clear
                </Button>
              </HStack>
              
              <Box 
                bg={previewPaperBg} 
                boxShadow="2xl" 
                p={12} 
                borderRadius="xl" 
                maxH="600px" 
                overflowY="auto"
                border="1px solid"
                borderColor={cardBorder}
                position="relative"
              >
                <div 
                  ref={previewRef}
                  dangerouslySetInnerHTML={{ __html: htmlPreview }} 
                  style={{ 
                    fontSize: '12pt', 
                    lineHeight: '1.6', 
                    color: '#1A202C', // Standard dark text for document readability
                    fontFamily: 'serif' 
                  }}
                />
              </Box>

              <Center mt={8}>
                <Button 
                  size="lg" 
                  colorScheme="green" 
                  leftIcon={<Download size={20} />} 
                  onClick={downloadPdf}
                  borderRadius="full"
                  px={10}
                  boxShadow="0 4px 14px 0 rgba(72, 187, 120, 0.39)"
                >
                  Download as PDF
                </Button>
              </Center>
            </Box>
          )}

          <HStack justify="center" opacity={0.5} pt={4}>
            <Icon as={CheckCircle} color="green.500" size={14} />
            <Text fontSize="xs" fontWeight="bold">Local browser processing</Text>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default WordToPdf;
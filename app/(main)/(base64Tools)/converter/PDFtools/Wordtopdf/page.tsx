"use client";

import React, { useState, useRef } from 'react';
import { 
  Box, Button, Heading, VStack, Text, Input, 
  useToast, Divider, Container, Center 
} from '@chakra-ui/react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { FileText, Download, Eye } from 'lucide-react';

const WordToPdf = () => {
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // 1. Handle File Upload and Preview
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
      // mammoth preserves styles like headings, lists, and tables
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

  // 2. Generate and Download PDF
  const downloadPdf = async () => {
    if (!previewRef.current) return;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    // We use the html method of jspdf to preserve the structure
    // Adding margins to look like a real document
    doc.html(previewRef.current, {
      callback: function (doc) {
        doc.save(`${fileName || 'document'}.pdf`);
      },
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 515, // A4 width (595) minus margins
      windowWidth: 800 // Scale the html for better resolution
    });
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading mb={2}>Word to PDF Converter</Heading>
          <Text color="gray.500">Upload a .docx file to preview and convert</Text>
        </Box>

        <Box 
          p={10} 
          border="2px dashed" 
          borderColor="gray.200" 
          borderRadius="xl" 
          textAlign="center"
        >
          <Input 
            type="file" 
            accept=".docx" 
            onChange={handleFileChange} 
            display="none" 
            id="file-upload" 
          />
          <label htmlFor="file-upload">
            <Button as="span" leftIcon={<FileText />} colorScheme="blue" cursor="pointer" isLoading={loading}>
              Choose Word Document
            </Button>
          </label>
          {fileName && <Text mt={3} fontSize="sm" fontWeight="bold">{fileName}.docx</Text>}
        </Box>

        {htmlPreview && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} display="flex" alignItems="center">
                <Eye size={20} style={{ marginRight: '8px' }} /> Live Preview
              </Heading>
              
              {/* This Box mimics a physical A4 page */}
              <Box 
                bg="white" 
                boxShadow="xl" 
                p={12} 
                borderRadius="md" 
                maxH="500px" 
                overflowY="auto"
                border="1px solid"
                borderColor="gray.100"
              >
                <div 
                  ref={previewRef}
                  className="prose" // If you use Tailwind, this handles typography
                  dangerouslySetInnerHTML={{ __html: htmlPreview }} 
                  style={{ fontSize: '12pt', lineHeight: '1.5', color: '#000' }}
                />
              </Box>

              <Center mt={6}>
                <Button 
                  size="lg" 
                  colorScheme="green" 
                  leftIcon={<Download />} 
                  onClick={downloadPdf}
                >
                  Download as PDF
                </Button>
              </Center>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default WordToPdf;
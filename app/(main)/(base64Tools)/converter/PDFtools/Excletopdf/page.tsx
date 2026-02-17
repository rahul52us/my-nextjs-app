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
  useToast,
  Center,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiX, 
  FiUploadCloud, 
  FiDownload, 
  FiRefreshCw, 
  FiCheckCircle,
  FiGrid
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MotionBox = motion(Box);

type ExcelRow = (string | number | null)[];

const ExcelToPdf = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // --- Process Excel File ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to Array of Arrays
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as ExcelRow[];
        setData(rawData);
        
        toast({
          title: "File Loaded",
          description: `Successfully imported ${rawData.length} rows.`,
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Could not read this Excel file. Try another.",
          status: "error",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- Generate PDF ---
  const generatePDF = () => {
    if (data.length === 0) return;

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(18);
      doc.text('Professional Data Report', 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Source: ${fileName} | Generated: ${new Date().toLocaleDateString()}`, 14, 22);

      autoTable(doc, {
        head: [data[0] as string[]],
        body: data.slice(1) as any[][],
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [49, 130, 206], textColor: 255 }, // Chakra blue.500
        styles: { fontSize: 8, cellPadding: 3 },
      });

      doc.save(`${fileName.split('.')[0]}_Export.pdf`);
    } catch (error) {
      toast({ title: "PDF Generation Failed", status: "error" });
    }
  };

  const reset = () => {
    setData([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box 
      minH="100vh" 
      bg="gray.50" 
      bgGradient="radial(circle at 10% 10%, blue.50 0%, transparent 30%), radial(circle at 90% 90%, purple.50 0%, transparent 30%)"
      py={20}
    >
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          
          {/* Header */}
          <VStack spacing={3} textAlign="center">
            <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
              Excel Engine v2.0
            </Badge>
            <Heading size="2xl" fontWeight="900" letterSpacing="tight">
              Excel <Text as="span" color="blue.500">to PDF</Text>
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Convert complex spreadsheets into clean, printable reports.
            </Text>
          </VStack>

          {/* Upload / Preview Logic */}
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <MotionBox
                key="uploader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Center
                  as="label"
                  htmlFor="excel-upload"
                  p={20}
                  cursor="pointer"
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="3xl"
                  bg="white"
                  transition="all 0.3s"
                  _hover={{ borderColor: 'blue.500', shadow: '2xl', bg: 'blue.50/20' }}
                  flexDirection="column"
                >
                  <VStack spacing={4}>
                    <Box bg="blue.500" color="white" p={5} borderRadius="2xl" shadow="lg">
                      {isProcessing ? <Spinner size="lg" /> : <Icon as={FiUploadCloud} boxSize={10} />}
                    </Box>
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="xl">Click to upload spreadsheet</Text>
                      <Text fontSize="sm" color="gray.400">Supports .XLSX and .XLS files</Text>
                    </VStack>
                  </VStack>
                  <input id="excel-upload" type="file" accept=".xlsx, .xls" hidden onChange={handleFileChange} ref={fileInputRef} />
                </Center>
              </MotionBox>
            ) : (
              <MotionBox
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                bg="white"
                shadow="2xl"
                borderRadius="3xl"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiGrid} color="blue.500" />
                      <Text fontWeight="bold" fontSize="sm">Sheet Preview: {fileName}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Tooltip label="Reset and upload new file">
                        <IconButton aria-label="reset" icon={<FiRefreshCw />} size="sm" variant="ghost" onClick={reset} />
                      </Tooltip>
                      <Button leftIcon={<FiDownload />} colorScheme="blue" size="sm" onClick={generatePDF} borderRadius="full">
                        Export PDF
                      </Button>
                    </HStack>
                  </HStack>
                </Box>

                <TableContainer maxH="400px" overflowY="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                      <Tr>
                        {data[0]?.map((header, i) => (
                          <Th key={i} py={4} borderColor="gray.100">{header || `Column ${i+1}`}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.slice(1, 15).map((row, i) => (
                        <Tr key={i} _hover={{ bg: 'blue.50/30' }}>
                          {row.map((cell, j) => (
                            <Td key={j} color="gray.600" borderColor="gray.50">{cell?.toString() || '-'}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                
                {data.length > 15 && (
                  <Box p={3} textAlign="center" bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                    <Text fontSize="xs" color="gray.400" fontWeight="bold">
                      + {data.length - 15} more rows will be included in the PDF export
                    </Text>
                  </Box>
                )}
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Bottom Security Note */}
          <HStack justify="center" spacing={2} opacity={0.6}>
            <Icon as={FiCheckCircle} color="green.500" />
            <Text fontSize="xs" fontWeight="bold">Data processing stays in your browser (No server uploads)</Text>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default ExcelToPdf;
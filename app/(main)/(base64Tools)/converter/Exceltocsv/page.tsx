"use client";
import React, { useState, useCallback, useRef } from "react";
import {
  Box, Button, VStack, Text, useToast, Heading, Icon, Center,
  HStack, Badge, Card, CardBody, IconButton, Divider, 
  Container, Flex, Tooltip, useColorModeValue
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { 
  FileUp, FileCheck, Download, Trash2, Table as TableIcon, 
  ArrowRightLeft, ShieldCheck, Zap
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// AG GRID V33 IMPORTS
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const gridRef = useRef<AgGridReact>(null);
  const toast = useToast();

  // Theme-aware colors
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = "blue.500";

  const clearState = () => {
    setFile(null);
    setRowData([]);
    setColumnDefs([]);
  };

  const onGridReady = (params: any) => {
    setTimeout(() => params.api.sizeColumnsToFit(), 200);
  };

  const previewFile = useCallback((uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!jsonData.length) {
          toast({ title: "Empty file detected", status: "warning", position: "top" });
          return;
        }

        const columns = Object.keys(jsonData[0]).map((key) => ({
          headerName: key.toUpperCase().replace(/_/g, ' '),
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
          cellStyle: { fontSize: '14px' }
        }));

        setColumnDefs(columns);
        setRowData(jsonData);
      } catch (error) {
        toast({ title: "Read Error", status: "error", position: "top" });
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  }, [toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      previewFile(uploadedFile);
    }
  }, [previewFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const convertFile = () => {
    if (!file || rowData.length === 0) return;
    setLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(rowData);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      
      if (file.name.endsWith(".csv")) {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), `${baseName}.xlsx`);
      } else {
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        saveAs(new Blob([csv], { type: "text/csv" }), `${baseName}.csv`);
      }
      toast({ 
        title: "Conversion Complete", 
        description: "Your file has been downloaded.", 
        status: "success",
        isClosable: true 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="container.lg">
        <VStack spacing={8}>
          
          {/* Header Section */}
          <VStack spacing={3} textAlign="center">
            <HStack bg="blue.50" px={3} py={1} borderRadius="full" color="blue.600">
              <Icon as={Zap} size={14} />
              <Text fontSize="xs" fontWeight="bold">INSTANT CONVERSION</Text>
            </HStack>
            <Heading size="2xl" fontWeight="800" letterSpacing="tight">
              Format<Text as="span" color={accentColor}>Flow</Text>
            </Heading>
            <Text color="gray.500" fontSize="lg" maxW="500px">
              The professional way to convert CSV and Excel files. 
              Safe, fast, and stays in your browser.
            </Text>
          </VStack>

          <Card 
            w="full" 
            borderRadius="3xl" 
            variant="outline" 
            bg={cardBg} 
            boxShadow="2xl" 
            overflow="hidden"
            border="none"
          >
            <CardBody p={8}>
              
              {/* Step 1: Upload */}
              <Box
                {...getRootProps()}
                p={16}
                border="2px dashed"
                borderColor={isDragActive ? accentColor : "gray.200"}
                bg={isDragActive ? "blue.50" : "gray.50"}
                borderRadius="2xl"
                cursor="pointer"
                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                _hover={{ 
                  transform: "scale(1.01)", 
                  borderColor: accentColor,
                  bg: "white",
                  boxShadow: "inner" 
                }}
              >
                <input {...getInputProps()} />
                <VStack spacing={4}>
                  <Center 
                    w={20} h={20} 
                    bg="white" 
                    borderRadius="2xl" 
                    boxShadow="lg"
                    transform={file ? "rotate(0deg)" : "rotate(-5deg)"}
                  >
                    <Icon 
                      as={file ? FileCheck : FileUp} 
                      w={10} h={10} 
                      color={file ? "green.400" : accentColor} 
                    />
                  </Center>
                  <VStack spacing={1}>
                    <Text fontWeight="800" fontSize="xl" color="gray.700">
                      {file ? file.name : "Drag & Drop File"}
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Supports .csv, .xlsx, and .xls (Max 50MB)
                    </Text>
                  </VStack>
                  {file && (
                    <Badge colorScheme="green" variant="subtle" px={4} py={1} borderRadius="full">
                      Ready to process
                    </Badge>
                  )}
                </VStack>
              </Box>

              {/* Step 2: Preview Area */}
              {rowData.length > 0 && (
                <Box mt={10} animation="fadeIn 0.5s ease-in">
                  <Flex justify="space-between" align="flex-end" mb={6}>
                    <VStack align="start" spacing={0}>
                      <HStack color={accentColor}>
                        <TableIcon size={18} />
                        <Text fontWeight="bold" fontSize="sm" letterSpacing="widest" textTransform="uppercase">
                          Data Preview
                        </Text>
                      </HStack>
                      <Heading size="md" color="gray.700">Inspect Records</Heading>
                    </VStack>
                    <HStack>
                      <Badge variant="outline" colorScheme="blue" borderRadius="md" px={3}>
                        {rowData.length} Total Rows
                      </Badge>
                      <Tooltip label="Remove file">
                        <IconButton 
                          aria-label="clear" 
                          icon={<Trash2 size={18}/>} 
                          onClick={clearState} 
                          size="md" 
                          variant="ghost" 
                          colorScheme="red"
                          borderRadius="xl"
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>
                  
                  <Box 
                    className="ag-theme-alpine" 
                    h="400px" 
                    w="100%" 
                    borderRadius="2xl" 
                    overflow="hidden"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <AgGridReact
                      ref={gridRef}
                      rowData={rowData}
                      columnDefs={columnDefs}
                      onGridReady={onGridReady}
                      pagination={true}
                      paginationPageSize={10}
                      defaultColDef={{
                        flex: 1,
                        minWidth: 150,
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Step 3: Action */}
              <Box mt={10}>
                <Button
                  isDisabled={!file}
                  isLoading={loading}
                  loadingText="Processing..."
                  onClick={convertFile}
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  h="70px"
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="2xl"
                  leftIcon={<ArrowRightLeft size={22} />}
                  boxShadow="0 15px 30px -10px rgba(66, 153, 225, 0.5)"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 35px -10px rgba(66, 153, 225, 0.6)" 
                  }}
                  _active={{ transform: "scale(0.98)" }}
                >
                  Download as {file?.name.endsWith('.csv') ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                </Button>
              </Box>
            </CardBody>
          </Card>

          {/* Footer Info */}
          <HStack spacing={6} color="gray.400" fontSize="sm">
            <HStack>
              <Icon as={ShieldCheck} w={4} h={4} />
              <Text>Client-side only</Text>
            </HStack>
            <Divider orientation="vertical" h="15px" />
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default FileConverter;
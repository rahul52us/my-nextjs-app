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
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const accentHex = "#007AAC";

const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const gridRef = useRef<AgGridReact>(null);
  const toast = useToast();

  // ── Theme-aware colors ──
  const isDark = useColorModeValue(false, true);
  const bgColor = useColorModeValue("#f0f4f8", "#0d1117");
  const cardBg = useColorModeValue("#ffffff", "#161b22");
  const cardBorder = useColorModeValue("rgba(0,122,172,0.15)", "rgba(0,122,172,0.25)");
  const headingColor = useColorModeValue("#1a202c", "#e2e8f0");
  const subText = useColorModeValue("#718096", "#8b949e");
  const dropBg = useColorModeValue("#f7fafc", "#1c2128");
  const dropBgHover = useColorModeValue("#edf2f7", "#21262d");
  const dropBorder = useColorModeValue("#cbd5e0", "#30363d");
  const dropDragBg = useColorModeValue(`rgba(0,122,172,0.08)`, `rgba(0,122,172,0.15)`);
  const badgeBg = useColorModeValue("rgba(0,122,172,0.1)", "rgba(0,122,172,0.2)");
  const labelText = useColorModeValue("#4a5568", "#c9d1d9");
  const gridTheme = useColorModeValue("ag-theme-alpine", "ag-theme-alpine-dark");
  const gridBorder = useColorModeValue("#e2e8f0", "#30363d");
  const previewBg = useColorModeValue("rgba(0,122,172,0.05)", "rgba(0,122,172,0.08)");
  const statNumColor = useColorModeValue("#1a202c", "#e2e8f0");
  const footerColor = useColorModeValue("#a0aec0", "#6e7681");

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
          headerName: key.toUpperCase().replace(/_/g, " "),
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
          cellStyle: { fontSize: "14px" },
        }));

        setColumnDefs(columns);
        setRowData(jsonData);
      } catch {
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
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh"  py={10}>
      <style>{`
        .ag-theme-alpine {
          --ag-background-color: #ffffff;
          --ag-header-background-color: #f0f4f8;
          --ag-header-foreground-color: #1a202c;
          --ag-foreground-color: #2d3748;
          --ag-row-hover-color: rgba(0,122,172,0.06);
          --ag-selected-row-background-color: rgba(0,122,172,0.12);
          --ag-range-selection-border-color: ${accentHex};
          --ag-header-column-separator-color: #e2e8f0;
          --ag-border-color: #e2e8f0;
          --ag-secondary-border-color: #e2e8f0;
          --ag-cell-horizontal-border: solid #f0f4f8;
          --ag-font-size: 14px;
          --ag-font-family: inherit;
        }
        .ag-theme-alpine-dark {
          --ag-background-color: #161b22;
          --ag-odd-row-background-color: #1c2128;
          --ag-header-background-color: #1c2128;
          --ag-header-foreground-color: #c9d1d9;
          --ag-foreground-color: #c9d1d9;
          --ag-row-hover-color: rgba(0,122,172,0.12);
          --ag-selected-row-background-color: rgba(0,122,172,0.2);
          --ag-range-selection-border-color: ${accentHex};
          --ag-header-column-separator-color: #30363d;
          --ag-border-color: #30363d;
          --ag-secondary-border-color: #30363d;
          --ag-cell-horizontal-border: solid #21262d;
          --ag-font-size: 14px;
          --ag-font-family: inherit;
        }
        .ag-theme-alpine .ag-root-wrapper,
        .ag-theme-alpine-dark .ag-root-wrapper {
          border: none;
          border-radius: 16px;
          overflow: hidden;
        }
        .ag-theme-alpine .ag-header-cell-label,
        .ag-theme-alpine-dark .ag-header-cell-label {
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .ag-theme-alpine .ag-paging-panel,
        .ag-theme-alpine-dark .ag-paging-panel {
          border-top: 1px solid;
          border-color: inherit;
          color: inherit;
        }
      `}</style>

      <Container maxW="container.lg">
        <VStack spacing={8}>

          {/* ── Header ── */}
          <VStack spacing={3} textAlign="center">
            <HStack
              bg={badgeBg}
              px={3} py={1}
              borderRadius="full"
              border="1px solid"
              borderColor={`${accentHex}40`}
            >
              <Icon as={Zap} boxSize={3.5} color={accentHex} />
              <Text fontSize="xs" fontWeight="bold" color={accentHex} letterSpacing="wider">
                INSTANT CONVERSION
              </Text>
            </HStack>

            <Heading size="2xl" fontWeight="800" letterSpacing="tight" color={headingColor}>
              Format<Text as="span" color={accentHex}>Flow</Text>
            </Heading>

            <Text color={subText} fontSize="lg" maxW="500px">
              The professional way to convert CSV and Excel files.
              Safe, fast, and stays in your browser.
            </Text>
          </VStack>

          {/* ── Main Card ── */}
          <Card
            w="full"
            borderRadius="3xl"
            bg={cardBg}
            boxShadow={isDark
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,122,172,0.1)"}
            border="1px solid"
            borderColor={cardBorder}
            overflow="hidden"
          >
            <CardBody p={8}>

              {/* ── Dropzone ── */}
              <Box
                {...getRootProps()}
                p={16}
                border="2px dashed"
                borderColor={isDragActive ? accentHex : dropBorder}
                bg={isDragActive ? dropDragBg : dropBg}
                borderRadius="2xl"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  transform: "scale(1.01)",
                  borderColor: accentHex,
                  bg: dropBgHover,
                  boxShadow: `0 0 0 4px ${accentHex}18`,
                }}
              >
                <input {...getInputProps()} />
                <VStack spacing={4}>
                  <Center
                    w={20} h={20}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow={isDark ? "0 4px 16px rgba(0,0,0,0.4)" : "lg"}
                    border="1px solid"
                    borderColor={cardBorder}
                    transform={file ? "rotate(0deg)" : "rotate(-5deg)"}
                    transition="transform 0.3s ease"
                  >
                    <Icon
                      as={file ? FileCheck : FileUp}
                      w={10} h={10}
                      color={file ? "green.400" : accentHex}
                    />
                  </Center>

                  <VStack spacing={1}>
                    <Text fontWeight="800" fontSize="xl" color={headingColor}>
                      {file ? file.name : "Drag & Drop File"}
                    </Text>
                    <Text color={subText} fontSize="sm">
                      Supports .csv, .xlsx, and .xls (Max 50MB)
                    </Text>
                  </VStack>

                  {file ? (
                    <Badge
                      px={4} py={1}
                      borderRadius="full"
                      bg={badgeBg}
                      color={accentHex}
                      border="1px solid"
                      borderColor={`${accentHex}40`}
                      fontWeight="bold"
                    >
                      ✓ Ready to process
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      pointerEvents="none"
                      borderColor={accentHex}
                      color={accentHex}
                      _hover={{}}
                    >
                      Browse files
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* ── Data Preview ── */}
              {rowData.length > 0 && (
                <Box mt={10}>
                  <Flex justify="space-between" align="flex-end" mb={6}>
                    <VStack align="start" spacing={0}>
                      <HStack color={accentHex}>
                        <TableIcon size={18} />
                        <Text fontWeight="bold" fontSize="sm" letterSpacing="widest" textTransform="uppercase">
                          Data Preview
                        </Text>
                      </HStack>
                      <Heading size="md" color={headingColor}>Inspect Records</Heading>
                    </VStack>

                    <HStack>
                      <Badge
                        variant="outline"
                        px={3}
                        borderRadius="md"
                        color={accentHex}
                        borderColor={`${accentHex}50`}
                      >
                        {rowData.length} Total Rows
                      </Badge>
                      <Tooltip label="Remove file">
                        <IconButton
                          aria-label="clear"
                          icon={<Trash2 size={18} />}
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
                    className={gridTheme}
                    h="400px"
                    w="100%"
                    borderRadius="2xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={gridBorder}
                  >
                    <AgGridReact
                      ref={gridRef}
                      rowData={rowData}
                      columnDefs={columnDefs}
                      onGridReady={onGridReady}
                      pagination={true}
                      paginationPageSize={10}
                      defaultColDef={{ flex: 1, minWidth: 150 }}
                    />
                  </Box>
                </Box>
              )}

              {/* ── Convert Button ── */}
              <Box mt={10}>
                <Button
                  isDisabled={!file}
                  isLoading={loading}
                  loadingText="Processing..."
                  onClick={convertFile}
                  size="lg"
                  w="full"
                  h="70px"
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="2xl"
                  leftIcon={<ArrowRightLeft size={22} />}
                  bg={accentHex}
                  color="white"
                  boxShadow={`0 15px 30px -10px ${accentHex}88`}
                  _hover={{
                    bg: "#006a96",
                    transform: "translateY(-2px)",
                    boxShadow: `0 20px 35px -10px ${accentHex}99`,
                  }}
                  _active={{ transform: "scale(0.98)", bg: "#005d85" }}
                  _disabled={{ opacity: 0.5, cursor: "not-allowed", transform: "none" }}
                  transition="all 0.2s"
                >
                  Download as {file?.name.endsWith(".csv") ? "Excel (.xlsx)" : "CSV (.csv)"}
                </Button>
              </Box>
            </CardBody>
          </Card>

          {/* ── Footer ── */}
          <HStack spacing={6} color={footerColor} fontSize="sm" pb={4}>
            <HStack>
              <Icon as={ShieldCheck} w={4} h={4} />
              <Text>Client-side only</Text>
            </HStack>
            <Divider orientation="vertical" h="15px" />
            <HStack>
              <Icon as={Download} w={4} h={4} />
              <Text>No data uploaded to any server</Text>
            </HStack>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default FileConverter;
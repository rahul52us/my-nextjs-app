"use client";
import React, { useState, useCallback, useRef } from "react";
import {
  Box, Button, VStack, Text, useToast, Heading, Icon, Center,
  HStack, Badge, Card, CardBody, IconButton, Divider,
  Container, Flex, Tooltip, useColorModeValue, Progress,
  Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import {
  FileUp, FileCheck, Download, Trash2, Table as TableIcon,
  FileSpreadsheet, ShieldCheck, Zap, FileType2, CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// AG GRID V33 IMPORTS
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CsvToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [converted, setConverted] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = "green.500";
  const accentHex = "#38A169";

  const clearState = () => {
    setFile(null);
    setRowData([]);
    setColumnDefs([]);
    setConverted(false);
  };

  const onGridReady = (params: any) => {
    setTimeout(() => params.api.sizeColumnsToFit(), 200);
  };

  const parseCSVFile = useCallback(
    (uploadedFile: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;

          // Use XLSX to parse CSV — handles quotes, commas inside fields, etc.
          const workbook = XLSX.read(text, { type: "string" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!jsonData.length) {
            toast({
              title: "Empty CSV",
              description: "The file has no data rows.",
              status: "warning",
              position: "top",
            });
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
          setConverted(false);
        } catch {
          toast({ title: "CSV Parse Error", description: "Could not read the file.", status: "error", position: "top" });
        }
      };
      reader.readAsText(uploadedFile);
    },
    [toast]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (uploadedFile) {
        setFile(uploadedFile);
        parseCSVFile(uploadedFile);
      }
    },
    [parseCSVFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".csv"],
    },
    multiple: false,
  });

  const convertToExcel = () => {
    if (!file || rowData.length === 0) return;
    setLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(rowData);

      // Auto column widths based on header length
      const colWidths = Object.keys(rowData[0]).map((key) => ({
        wch: Math.max(key.length + 4, 14),
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${baseName}.xlsx`);

      setConverted(true);
      toast({
        title: "🎉 Conversion Successful!",
        description: `${baseName}.xlsx has been downloaded.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } catch {
      toast({ title: "Conversion Failed", status: "error", position: "top" });
    } finally {
      setLoading(false);
    }
  };

  const fileSizeKB = file ? (file.size / 1024).toFixed(1) : null;

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="container.lg">
        <VStack spacing={8}>

          {/* ── Header ── */}
          <VStack spacing={3} textAlign="center">
            <HStack bg="green.50" px={3} py={1} borderRadius="full" color="green.600">
              <Icon as={Zap} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="bold" letterSpacing="wider">
                CSV → EXCEL CONVERTER
              </Text>
            </HStack>
            <Heading size="2xl" fontWeight="800" letterSpacing="tight">
              CSV to{" "}
              <Text as="span" color={accentColor}>
                Excel
              </Text>
            </Heading>
            <Text color="gray.500" fontSize="lg" maxW="500px">
              Convert your CSV files to professional Excel (.xlsx) format instantly.
              100% browser-based — your data never leaves your device.
            </Text>
          </VStack>

          {/* ── Feature badges ── */}
          <HStack spacing={4} flexWrap="wrap" justify="center">
            {[
              { icon: ShieldCheck, label: "Client-side only" },
              { icon: Zap, label: "Instant conversion" },
              { icon: FileSpreadsheet, label: "Proper .xlsx format" },
            ].map(({ icon, label }) => (
              <HStack
                key={label}
                bg={cardBg}
                px={4}
                py={2}
                borderRadius="full"
                boxShadow="sm"
                color="gray.600"
                fontSize="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <Icon as={icon} boxSize={4} color={accentColor} />
                <Text fontWeight="medium">{label}</Text>
              </HStack>
            ))}
          </HStack>

          {/* ── Main Card ── */}
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

              {/* ── Step 1: Upload Dropzone ── */}
              <Box
                {...getRootProps()}
                p={16}
                border="2px dashed"
                borderColor={isDragActive ? accentColor : "gray.200"}
                bg={isDragActive ? "green.50" : "gray.50"}
                borderRadius="2xl"
                cursor="pointer"
                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                _hover={{
                  transform: "scale(1.01)",
                  borderColor: accentColor,
                  bg: "white",
                  boxShadow: "inner",
                }}
              >
                <input {...getInputProps()} />
                <VStack spacing={4}>
                  <Center
                    w={20}
                    h={20}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="lg"
                    transform={file ? "rotate(0deg)" : "rotate(-5deg)"}
                    transition="transform 0.3s ease"
                  >
                    <Icon
                      as={file ? FileCheck : FileUp}
                      w={10}
                      h={10}
                      color={file ? "green.400" : accentColor}
                    />
                  </Center>
                  <VStack spacing={1}>
                    <Text fontWeight="800" fontSize="xl" color="gray.700">
                      {file ? file.name : "Drag & Drop your CSV file"}
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Supports .csv files up to 50MB
                    </Text>
                  </VStack>
                  {file ? (
                    <HStack>
                      <Badge colorScheme="green" variant="subtle" px={4} py={1} borderRadius="full">
                        ✓ File loaded — {fileSizeKB} KB
                      </Badge>
                    </HStack>
                  ) : (
                    <Button size="sm" variant="outline" colorScheme="green" borderRadius="full" pointerEvents="none">
                      Browse files
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* ── Step 2: Stats bar ── */}
              {rowData.length > 0 && (
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mt={6}>
                  {[
                    { label: "Total Rows", value: rowData.length, help: "data rows detected" },
                    { label: "Columns", value: columnDefs.length, help: "fields found" },
                    { label: "File Size", value: `${fileSizeKB} KB`, help: "input CSV size" },
                  ].map(({ label, value, help }) => (
                    <Box
                      key={label}
                      bg="green.50"
                      borderRadius="xl"
                      p={4}
                      border="1px solid"
                      borderColor="green.100"
                    >
                      <Stat>
                        <StatLabel color="green.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">
                          {label}
                        </StatLabel>
                        <StatNumber color="gray.800" fontSize="2xl" fontWeight="800">
                          {value}
                        </StatNumber>
                        <StatHelpText color="gray.400" mb={0}>
                          {help}
                        </StatHelpText>
                      </Stat>
                    </Box>
                  ))}
                </SimpleGrid>
              )}

              {/* ── Step 3: AG Grid Preview ── */}
              {rowData.length > 0 && (
                <Box mt={8}>
                  <Flex justify="space-between" align="flex-end" mb={4}>
                    <VStack align="start" spacing={0}>
                      <HStack color={accentColor}>
                        <TableIcon size={18} />
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          letterSpacing="widest"
                          textTransform="uppercase"
                        >
                          Data Preview
                        </Text>
                      </HStack>
                      <Heading size="md" color="gray.700">
                        Inspect Your Records
                      </Heading>
                    </VStack>
                    <HStack>
                      <Badge variant="outline" colorScheme="green" borderRadius="md" px={3}>
                        {rowData.length} rows · {columnDefs.length} cols
                      </Badge>
                      <Tooltip label="Remove file and start over">
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
                      defaultColDef={{ flex: 1, minWidth: 150 }}
                    />
                  </Box>
                </Box>
              )}

              {/* ── Step 4: Convert Button ── */}
              <Box mt={8}>
                {loading && (
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="green"
                    borderRadius="full"
                    mb={4}
                  />
                )}

                <Button
                  isDisabled={!file || rowData.length === 0}
                  isLoading={loading}
                  loadingText="Converting..."
                  onClick={convertToExcel}
                  colorScheme="green"
                  size="lg"
                  w="full"
                  h="70px"
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="2xl"
                  leftIcon={
                    converted ? <CheckCircle2 size={22} /> : <FileSpreadsheet size={22} />
                  }
                  boxShadow={`0 15px 30px -10px ${accentHex}88`}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: `0 20px 35px -10px ${accentHex}99`,
                  }}
                  _active={{ transform: "scale(0.98)" }}
                  transition="all 0.2s"
                >
                  {converted
                    ? "✓ Downloaded! Convert Again?"
                    : "Download as Excel (.xlsx)"}
                </Button>
              </Box>
            </CardBody>
          </Card>

          {/* ── Footer ── */}
          <HStack spacing={6} color="gray.400" fontSize="sm" pb={4}>
            <HStack>
              <Icon as={ShieldCheck} w={4} h={4} />
              <Text>All processing happens in your browser</Text>
            </HStack>
            <Divider orientation="vertical" h="15px" />
            <HStack>
              <Icon as={FileType2} w={4} h={4} />
              <Text>No data is uploaded to any server</Text>
            </HStack>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default CsvToExcel;
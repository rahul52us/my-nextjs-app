"use client";
import { useState, useCallback, ChangeEvent, useMemo, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import {
  Box,
  Button,
  Heading,
  Textarea,
  VStack,
  FormControl,
  FormLabel,
  Text,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  HStack,
  Input,
  Select,
  Spinner,
  useToast,
  Tooltip,
  Skeleton,
  Checkbox,
  Progress,
  NumberInput,
  NumberInputField,
  FormHelperText,
  Icon,
  Divider,
  Card,
  useDisclosure,
  Flex,
  InputGroup,
  InputRightElement,
  CloseButton,
} from "@chakra-ui/react";
import { DownloadIcon, ViewIcon, ViewOffIcon, RepeatIcon, InfoOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import { AgGridReact } from "ag-grid-react";
import { ColDef, IHeaderParams, GridApi } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import * as XLSX from "xlsx";
import ReactSelect, { MultiValue } from "react-select";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./excelViewer.css";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Interfaces for type safety
interface SheetData {
  sheetName: string;
  data: any[][];
  rowData: Record<string, any>[];
}

interface SelectOption {
  value: string;
  label: string;
}

// Custom Header Component for AG Grid
const CustomHeader = ({ displayName }: IHeaderParams) => {
  const textColor = useColorModeValue("gray.800", "white");
  return (
    <Text fontWeight="bold" fontSize="sm" color={textColor}>
      {displayName}
    </Text>
  );
};

const JsonToExcel = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<SheetData[] | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, string[]>>({});
  const [selectAllColumns, setSelectAllColumns] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startRow, setStartRow] = useState<string>("1");
  const [endRow, setEndRow] = useState<string>("");
  const toast = useToast();
  const gridApiRef = useRef<GridApi | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const jsonInputRef = useRef<HTMLTextAreaElement>(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "teal.500";

  // Load saved column selections from localStorage
  useEffect(() => {
    const savedSelections = localStorage.getItem("selectedColumns");
    if (savedSelections) {
      try {
        setSelectedColumns(JSON.parse(savedSelections));
      } catch (err) {
        console.error("Error loading saved column selections:", err);
      }
    }
  }, []);

  // Save column selections to localStorage
  useEffect(() => {
    if (Object.keys(selectedColumns).length > 0) {
      localStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // Handle search input with debouncing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (gridApiRef.current) {
        gridApiRef.current.setGridOption("quickFilterText", value);
      }
    }, 300);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery("");
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption("quickFilterText", "");
    }
  };

  // Reset all inputs
  const resetAll = () => {
    setJsonInput("");
    setPreviewContent(null);
    setSelectedSheet("");
    setError(null);
    setIsLoading(false);
    setLoadingProgress(0);
    setShowPreview(false);
    setSelectedColumns({});
    setSelectAllColumns(false);
    setSearchQuery("");
    setStartRow("1");
    setEndRow("");
    localStorage.removeItem("selectedColumns");
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption("quickFilterText", "");
    }
    if (jsonInputRef.current) {
      jsonInputRef.current.focus();
    }
    toast({
      title: "Reset complete",
      description: "All inputs and selections have been cleared.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const parseJsonData = useCallback((jsonString: string) => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);

      // Parse JSON
      let parsedData = JSON.parse(jsonString);
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData]; // Wrap single object in array
      }

      if (parsedData.length === 0) {
        throw new Error("JSON data is empty. Please provide valid data.");
      }

      // Extract headers from the first object
      const headers = Object.keys(parsedData[0]);
      if (headers.length === 0) {
        throw new Error("No valid columns found in JSON data.");
      }

      // Ensure unique headers
      const headerCounts: Record<string, number> = {};
      const uniqueHeaders = headers.map((header) => {
        const baseHeader = String(header) || `Column ${headerCounts[header] || 1}`;
        headerCounts[baseHeader] = (headerCounts[baseHeader] || 0) + 1;
        return headerCounts[baseHeader] > 1 ? `${baseHeader}_${headerCounts[baseHeader] - 1}` : baseHeader;
      });

      // Convert JSON to row data for AG Grid
      const rowData = parsedData.map((item) => {
        const row: Record<string, any> = {};
        headers.forEach((header, i) => {
          const key = uniqueHeaders[i];
          row[key] = item[header] != null ? item[header] : "";
          if (typeof row[key] === "object") {
            row[key] = JSON.stringify(row[key], null, 2);
          }
        });
        return row;
      });

      // Create sheet data
      const sheetData: SheetData = {
        sheetName: "Sheet1",
        data: [uniqueHeaders, ...rowData.map((row) => uniqueHeaders.map((header) => row[header]))],
        rowData,
      };

      setPreviewContent([sheetData]);
      setSelectedSheet("Sheet1");
      setSelectedColumns({ Sheet1: uniqueHeaders }); // Auto-select all columns by default
      setSelectAllColumns(true);
      setEndRow(String(rowData.length));
      setError(null);
      setLoadingProgress(100);
      setIsLoading(false);
      toast({
        title: "JSON loaded successfully",
        description: `Loaded ${rowData.length} rows with ${uniqueHeaders.length} columns.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setError(
        error instanceof Error
          ? `Invalid JSON: ${error.message}`
          : "Failed to parse JSON. Ensure it is a valid JSON array or object."
      );
      setPreviewContent(null);
      setSelectedSheet("");
      setSelectedColumns({});
      setSelectAllColumns(false);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, []);

  const handleJsonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setJsonInput(value);
    setError(null); // Clear error on input change
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected. Please choose a .json file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB. Please upload a smaller file.");
      setIsLoading(false);
      return;
    }

    if (!file.name.endsWith(".json")) {
      setError("Invalid file type. Please upload a .json file.");
      setIsLoading(false);
      setLoadingProgress(0);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) {
        setError("Uploaded file is empty or invalid.");
        setIsLoading(false);
        setLoadingProgress(0);
        return;
      }
      setJsonInput(content);
      parseJsonData(content);
    };
    reader.onerror = () => {
      setError("Error reading the JSON file. Please try again.");
      setIsLoading(false);
      setLoadingProgress(0);
    };
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setLoadingProgress((e.loaded / e.total) * 100);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (jsonInput) {
      parseJsonData(jsonInput);
    } else {
      setPreviewContent(null);
      setSelectedSheet("");
      setError(null);
      setIsLoading(false);
      setLoadingProgress(0);
      setSelectedColumns({});
      setSelectAllColumns(false);
      setSearchQuery("");
      setStartRow("1");
      setEndRow("");
      localStorage.removeItem("selectedColumns");
      if (gridApiRef.current) {
        gridApiRef.current.setGridOption("quickFilterText", "");
      }
    }
  }, [jsonInput, parseJsonData]);

  const handleDownloadExcel = (sheetName: string) => {
    if (!previewContent || !selectedColumns[sheetName]?.length) {
      setError("Please select at least one column to export.");
      toast({
        title: "No columns selected",
        description: `Select columns for ${sheetName} to download as Excel.`,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const selectedSheetData = previewContent.find(
      (sheet) => sheet.sheetName === sheetName
    );
    if (!selectedSheetData || !selectedSheetData.rowData) {
      setError("No data available for the selected sheet.");
      return;
    }

    const range = validateRowRange(selectedSheetData);
    if (!range) return;

    const filteredData = selectedSheetData.rowData
      .slice(range.start, range.end + 1)
      .map((row) => {
        const filteredRow: Record<string, any> = {};
        selectedColumns[sheetName].forEach((col) => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return Object.keys(filteredRow).length > 0 ? filteredRow : null;
      })
      .filter((row): row is Record<string, any> => row !== null);

    if (filteredData.length === 0) {
      setError("No data available for the selected columns and row range.");
      toast({
        title: "No data to download",
        description: `No valid data for the selected columns and rows in ${sheetName}.`,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${sheetName}_rows_${range.start + 1}-${range.end + 1}_selected_columns.xlsx`);
    setError(null);
    toast({
      title: "Excel downloaded",
      description: `Successfully downloaded Excel for ${sheetName} (rows ${range.start + 1}-${range.end + 1}, ${selectedColumns[sheetName].length} columns).`,
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  };

  const validateRowRange = (sheetData: SheetData) => {
    const rowCount = sheetData.rowData.length;
    const start = parseInt(startRow, 10);
    const end = endRow ? parseInt(endRow, 10) : rowCount;

    if (isNaN(start) || start < 1) {
      setError("Start row must be a positive number (e.g., 1).");
      return null;
    }
    if (endRow && (isNaN(end) || end < start)) {
      setError("End row must be greater than or equal to start row.");
      return null;
    }
    if (start > rowCount) {
      setError(`Start row (${start}) exceeds total rows (${rowCount}).`);
      return null;
    }
    if (end > rowCount) {
      setError(`End row (${end}) exceeds total rows (${rowCount}).`);
      return null;
    }
    return { start: start - 1, end: end - 1 };
  };

  const handleResetColumns = () => {
    setSelectedColumns((prev) => ({
      ...prev,
      [selectedSheet]: [],
    }));
    setSelectAllColumns(false);
    toast({
      title: "Columns reset",
      description: `Column selections for ${selectedSheet} have been cleared.`,
      status: "info",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    const selectedSheetData = previewContent?.find(
      (sheet) => sheet.sheetName === selectedSheet
    );
    if (
      !selectedSheetData ||
      !selectedSheetData.data ||
      !Array.isArray(selectedSheetData.data) ||
      selectedSheetData.data.length === 0
    ) {
      return [
        {
          headerName: "Column 1",
          field: "Col0",
          sortable: true,
          filter: true,
          resizable: true,
          editable: false,
          minWidth: 150,
          maxWidth: 400,
          cellStyle: {
            textAlign: "left",
            padding: "8px",
            fontSize: "14px",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "1.4",
          },
          headerComponent: CustomHeader,
        },
      ];
    }
    const firstRow = selectedSheetData.data[0];
    return firstRow.map((header, index) => ({
      headerName: header,
      field: header || `Col${index}`,
      sortable: true,
      filter: true,
      resizable: true,
      editable: false,
      minWidth: 150,
      maxWidth: 400,
      cellStyle: {
        textAlign: "left",
        padding: "8px",
        fontSize: "14px",
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: "1.4",
      },
      headerComponent: CustomHeader,
    }));
  }, [previewContent, selectedSheet]);

  const columnOptions = useMemo<SelectOption[]>(() => {
    const selectedSheetData = previewContent?.find(
      (sheet) => sheet.sheetName === selectedSheet
    );
    if (!selectedSheetData || !selectedSheetData.data?.[0]) return [];
    const headerCounts: Record<string, number> = {};
    const options = selectedSheetData.data[0].map((header, index) => {
      const baseLabel = header || `Column ${index + 1}`;
      headerCounts[baseLabel] = (headerCounts[baseLabel] || 0) + 1;
      const value = headerCounts[baseLabel] > 1 ? `${baseLabel}_${headerCounts[baseLabel] - 1}` : baseLabel;
      return {
        value,
        label: baseLabel,
      };
    });
    return options;
  }, [previewContent, selectedSheet]);

  // Handle select all columns checkbox
  useEffect(() => {
    if (selectAllColumns && columnOptions.length > 0) {
      setSelectedColumns((prev) => ({
        ...prev,
        [selectedSheet]: columnOptions.map((opt) => opt.value),
      }));
    } else if (!selectAllColumns) {
      setSelectedColumns((prev) => ({
        ...prev,
        [selectedSheet]: [],
      }));
    }
  }, [selectAllColumns, columnOptions, selectedSheet]);

  // Update endRow when sheet changes
  useEffect(() => {
    const selectedSheetData = previewContent?.find(
      (sheet) => sheet.sheetName === selectedSheet
    );
    if (selectedSheetData?.rowData.length) {
      setEndRow(String(selectedSheetData.rowData.length));
    }
  }, [selectedSheet, previewContent]);

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgColor} color={textColor} minH="100vh">
      <Card p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="md" bg={cardBg}>
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          color={accentColor}
          textAlign="center"
          fontWeight="extrabold"
          mb={6}
          letterSpacing="tight"
        >
          JSON to Excel Converter
        </Heading>

        {error && (
          <Text
            color="red.500"
            bg="red.50"
            p={3}
            borderRadius="md"
            mb={4}
            textAlign="center"
            fontWeight="medium"
            role="alert"
            fontSize="sm"
          >
            <Icon as={InfoOutlineIcon} mr={2} />
            {error}
          </Text>
        )}

        {isLoading && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.700"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Spinner size="xl" color={accentColor} thickness="4px" speed="0.65s" />
            <Progress
              value={loadingProgress}
              size="sm"
              colorScheme="teal"
              width="300px"
              mt={4}
              borderRadius="md"
            />
            <Text mt={4} color="white" fontSize="md" fontWeight="medium">
              Processing JSON... {Math.round(loadingProgress)}%
            </Text>
          </Box>
        )}

        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel fontWeight="semibold" color={textColor} fontSize="md">
              Paste JSON String
              <Tooltip
                label="Enter a JSON array or object (e.g., [{'name': 'John', 'age': 30}, ...])."
                hasArrow
                placement="top"
              >
                <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
              </Tooltip>
            </FormLabel>
            <Skeleton isLoaded={!isLoading}>
              <Textarea
                ref={jsonInputRef}
                value={jsonInput}
                onChange={handleJsonChange}
                placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                rows={6}
                bg={cardBg}
                borderColor={borderColor}
                borderRadius="md"
                fontFamily="'Courier New', monospace"
                fontSize="sm"
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                _hover={{ borderColor: "teal.400" }}
                transition="all 0.2s"
                aria-label="JSON input"
                resize="vertical"
              />
            </Skeleton>
            <FormHelperText color={textColor} fontSize="xs">
              Enter a valid JSON string to preview and convert to Excel.
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color={textColor} fontSize="md">
              Upload JSON File
              <Tooltip
                label="Upload a .json file (max 100MB) containing an array or object."
                hasArrow
                placement="top"
              >
                <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
              </Tooltip>
            </FormLabel>
            <Skeleton isLoaded={!isLoading}>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                bg={cardBg}
                borderColor={borderColor}
                borderRadius="md"
                p={2}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                _hover={{ borderColor: "teal.400" }}
                transition="all 0.2s"
                aria-label="JSON file upload"
              />
            </Skeleton>
            <FormHelperText color={textColor} fontSize="xs">
              Supported format: .json (Max 100MB)
            </FormHelperText>
          </FormControl>

          <Flex justify="space-between" flexWrap="wrap" gap={3}>
            <Tooltip label="Convert selected columns and rows to Excel" hasArrow>
              <Button
                colorScheme="teal"
                onClick={() => handleDownloadExcel("Sheet1")}
                flex={1}
                minW="120px"
                isDisabled={!jsonInput || !selectedColumns["Sheet1"]?.length}
                leftIcon={<DownloadIcon />}
                bgGradient="linear(to-r, teal.500, teal.600)"
                _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                transform="scale(1)"
                transition="transform 0.2s, background 0.3s"
                _active={{ transform: "scale(0.98)" }}
                borderRadius="full"
                fontWeight="medium"
                fontSize="sm"
                aria-label="Download Excel"
              >
                Download Excel
              </Button>
            </Tooltip>
            <Tooltip
              label={showPreview ? "Hide data preview" : "Preview data in a table"}
              hasArrow
            >
              <Button
                colorScheme={showPreview ? "orange" : "teal"}
                onClick={() => {
                  if (!jsonInput) {
                    setError("Please enter a JSON string or upload a file.");
                    return;
                  }
                  if (!previewContent) {
                    setError("No data to preview. Ensure the JSON is valid.");
                    return;
                  }
                  setShowPreview((prev) => {
                    const newState = !prev;
                    if (newState) {
                      onOpen();
                    } else {
                      onClose();
                    }
                    return newState;
                  });
                }}
                flex={1}
                minW="120px"
                leftIcon={showPreview ? <ViewOffIcon /> : <ViewIcon />}
                bgGradient={showPreview ? "linear(to-r, orange.400, orange.500)" : "linear(to-r, teal.500, teal.600)"}
                _hover={
                  showPreview
                    ? { bgGradient: "linear(to-r, orange.500, orange.600)" }
                    : { bgGradient: "linear(to-r, teal.600, teal.700)" }
                }
                transform="scale(1)"
                transition="transform 0.2s, background 0.3s"
                _active={{ transform: "scale(0.98)" }}
                borderRadius="full"
                fontWeight="medium"
                fontSize="sm"
                aria-label={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </Tooltip>
            <Tooltip label="Clear all inputs and selections" hasArrow>
              <Button
                colorScheme="red"
                onClick={resetAll}
                flex={1}
                minW="120px"
                leftIcon={<RepeatIcon />}
                bgGradient="linear(to-r, red.400, red.500)"
                _hover={{ bgGradient: "linear(to-r, red.500, red.600)" }}
                transform="scale(1)"
                transition="transform 0.2s, background 0.3s"
                _active={{ transform: "scale(0.98)" }}
                borderRadius="full"
                fontWeight="medium"
                fontSize="sm"
                aria-label="Reset all"
              >
                Reset All
              </Button>
            </Tooltip>
          </Flex>

          <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
            Paste a JSON string or upload a .json file to preview and convert to Excel format.
          </Text>
        </VStack>
      </Card>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          onClose();
          setShowPreview(false);
          setSearchQuery("");
          if (gridApiRef.current) {
            gridApiRef.current.setGridOption("quickFilterText", "");
          }
        }}
        size={{ base: "full", md: "xl" }}
      >
        <DrawerOverlay />
        <DrawerContent bg={cardBg} css={{ minWidth: "90vw" }} borderLeft="1px" borderColor={borderColor}>
          <DrawerHeader
            bgGradient="linear(to-r, teal.500, teal.600)"
            color="white"
            py={4}
            px={6}
            borderBottomWidth="1px"
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
              Data Preview ({previewContent?.length || 0} sheet{previewContent?.length !== 1 ? "s" : ""})
            </Text>
            {selectedColumns[selectedSheet]?.length > 0 && (
              <Text fontSize="sm" opacity={0.8}>
                {selectedColumns[selectedSheet].length} column{selectedColumns[selectedSheet].length > 1 ? "s" : ""} selected
              </Text>
            )}
          </DrawerHeader>
          <DrawerBody p={{ base: 4, md: 6 }} overflowY="auto">
            {isLoading ? (
              <VStack spacing={4} py={10} align="center">
                <Spinner size="xl" color={accentColor} thickness="4px" speed="0.65s" />
                <Progress
                  value={loadingProgress}
                  size="sm"
                  colorScheme="teal"
                  width="300px"
                  borderRadius="md"
                />
                <Text color={textColor}>Loading data... {Math.round(loadingProgress)}%</Text>
              </VStack>
            ) : previewContent ? (
              <VStack spacing={5} align="stretch">
                <Card p={4} borderRadius="lg" boxShadow="sm" bg={cardBg}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                        Select Sheet
                        <Tooltip
                          label="Choose a sheet to preview its data."
                          hasArrow
                          placement="top"
                        >
                          <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
                        </Tooltip>
                      </FormLabel>
                      <Select
                        value={selectedSheet}
                        onChange={(e) => {
                          setSelectedSheet(e.target.value);
                          setSearchQuery("");
                          if (gridApiRef.current) {
                            gridApiRef.current.setGridOption("quickFilterText", "");
                          }
                        }}
                        bg={cardBg}
                        borderColor={borderColor}
                        borderRadius="md"
                        _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                        _hover={{ borderColor: "teal.400" }}
                        transition="all 0.2s"
                        fontSize="sm"
                        aria-label="Select sheet"
                      >
                        {previewContent.map((sheet) => (
                          <option key={sheet.sheetName} value={sheet.sheetName}>
                            {sheet.sheetName} ({sheet.rowData.length} rows)
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                        Select Columns to Export
                        <Tooltip
                          label="Choose columns to include in the Excel file."
                          hasArrow
                          placement="top"
                        >
                          <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
                        </Tooltip>
                      </FormLabel>
                      <ReactSelect
                        isMulti
                        isSearchable
                        options={columnOptions}
                        value={columnOptions.filter((opt) =>
                          selectedColumns[selectedSheet]?.includes(opt.value)
                        )}
                        onChange={(selected: MultiValue<SelectOption>) => {
                          const uniqueValues = [...new Set(selected.map((opt) => opt.value))];
                          setSelectedColumns((prev) => ({
                            ...prev,
                            [selectedSheet]: uniqueValues,
                          }));
                          setSelectAllColumns(
                            uniqueValues.length === columnOptions.length
                          );
                        }}
                        placeholder="Search and select columns..."
                        menuPortalTarget={document.body}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: cardBg,
                            borderColor: borderColor,
                            borderRadius: "8px",
                            padding: "4px",
                            boxShadow: useColorModeValue(
                              "0 1px 3px rgba(0,0,0,0.1)",
                              "none"
                            ),
                            transition: "all 0.2s",
                            fontSize: "14px",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: cardBg,
                            borderRadius: "8px",
                            border: `1px solid ${borderColor}`,
                            zIndex: 10000,
                          }),
                          menuPortal: (provided) => ({
                            ...provided,
                            zIndex: 10000,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? accentColor
                              : state.isFocused
                              ? useColorModeValue("#E6FFFA", "#2D3748")
                              : undefined,
                            color: state.isSelected
                              ? "white"
                              : useColorModeValue("gray.800", "white"),
                            padding: "8px 12px",
                            fontSize: "14px",
                            transition: "all 0.2s",
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: textColor,
                            fontSize: "14px",
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: useColorModeValue("teal.100", "teal.700"),
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            color: textColor,
                          }),
                        }}
                        aria-label="Select columns to export"
                      />
                    </FormControl>
                    <HStack spacing={4}>
                      <FormControl maxW="150px">
                        <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                          Start Row
                          <Tooltip
                            label="Enter the first row to include (minimum 1)."
                            hasArrow
                            placement="top"
                          >
                            <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
                          </Tooltip>
                        </FormLabel>
                        <NumberInput
                          value={startRow}
                          min={1}
                          onChange={(value) => setStartRow(value)}
                          bg={cardBg}
                          borderColor={borderColor}
                          borderRadius="md"
                          _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                          _hover={{ borderColor: "teal.400" }}
                          transition="all 0.2s"
                          size="sm"
                        >
                          <NumberInputField
                            _focus={{ borderColor: accentColor }}
                            _hover={{ borderColor: "teal.400" }}
                            aria-label="Start row"
                            fontSize="sm"
                          />
                        </NumberInput>
                        <FormHelperText color={textColor} fontSize="xs">
                          Row ≥ 1
                        </FormHelperText>
                      </FormControl>
                      <FormControl maxW="150px">
                        <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                          End Row
                          <Tooltip
                            label="Enter the last row to include (leave blank for last row)."
                            hasArrow
                            placement="top"
                          >
                            <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
                          </Tooltip>
                        </FormLabel>
                        <NumberInput
                          value={endRow}
                          min={parseInt(startRow, 10) || 1}
                          onChange={(value) => setEndRow(value)}
                          bg={cardBg}
                          borderColor={borderColor}
                          borderRadius="md"
                          _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                          _hover={{ borderColor: "teal.400" }}
                          transition="all 0.2s"
                          size="sm"
                        >
                          <NumberInputField
                            _focus={{ borderColor: accentColor }}
                            _hover={{ borderColor: "teal.400" }}
                            aria-label="End row"
                            fontSize="sm"
                          />
                        </NumberInput>
                        <FormHelperText color={textColor} fontSize="xs">
                          Blank for last row
                        </FormHelperText>
                      </FormControl>
                    </HStack>
                  </VStack>
                </Card>

                <Divider my={4} />

                <HStack spacing={4} align="center" justify="space-between">
                  <HStack spacing={4}>
                    <Checkbox
                      isChecked={selectAllColumns}
                      onChange={(e) => setSelectAllColumns(e.target.checked)}
                      colorScheme="teal"
                      size="md"
                      aria-label="Select all columns"
                    >
                      <Text fontSize="sm">Select All Columns</Text>
                    </Checkbox>
                    <Tooltip label="Clear selected columns" hasArrow>
                      <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<RepeatIcon />}
                        onClick={handleResetColumns}
                        isDisabled={!selectedColumns[selectedSheet]?.length}
                        bgGradient="linear(to-r, orange.400, orange.600)"
                        _hover={{ bgGradient: "linear(to-r, orange.500, orange.700)" }}
                        borderRadius="full"
                        transition="all 0.2s"
                        fontSize="sm"
                        aria-label="Reset column selections"
                      >
                        Clear Columns
                      </Button>
                    </Tooltip>
                  </HStack>
                  <FormControl maxW={{ base: "100%", md: "300px" }}>
                    <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                      Search Data
                      <Tooltip
                        label="Search within the table data."
                        hasArrow
                        placement="top"
                      >
                        <Icon as={InfoOutlineIcon} ml={2} color="gray.500" fontSize="sm" />
                      </Tooltip>
                    </FormLabel>
                    <InputGroup size="sm">
                      <Input
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search table..."
                        bg={cardBg}
                        borderColor={borderColor}
                        borderRadius="md"
                        _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                        _hover={{ borderColor: "teal.400" }}
                        transition="all 0.2s"
                        fontSize="sm"
                        aria-label="Search table"
                      />
                      {searchQuery && (
                        <InputRightElement>
                          <CloseButton
                            size="sm"
                            onClick={clearSearch}
                            aria-label="Clear search"
                          />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </FormControl>
                </HStack>

                <Card p={4} borderRadius="lg" boxShadow="sm" bg={cardBg}>
                  <HStack spacing={3} flexWrap="wrap" justify="space-between">
                    <Tooltip label={`Download Excel for ${selectedSheet}`} hasArrow>
                      <Button
                        colorScheme="teal"
                        onClick={() => handleDownloadExcel(selectedSheet)}
                        isDisabled={!selectedColumns[selectedSheet]?.length}
                        bgGradient="linear(to-r, teal.500, teal.600)"
                        _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                        size="sm"
                        borderRadius="full"
                        transition="all 0.2s"
                        fontSize="sm"
                        leftIcon={<DownloadIcon />}
                        aria-label={`Download Excel for ${selectedSheet}`}
                      >
                        Download Excel
                      </Button>
                    </Tooltip>
                  </HStack>
                </Card>

                {previewContent.find(
                  (sheet) => sheet.sheetName === selectedSheet
                )?.rowData.length > 0 ? (
                  <Card
                    className="excel-grid-container"
                    overflow="auto"
                    borderRadius="lg"
                    border="1px"
                    borderColor={borderColor}
                    boxShadow="sm"
                    bg={cardBg}
                  >
                    <Box
                      className={`ag-theme-alpine${useColorModeValue("", "-dark")}`}
                      h={{ base: "50vh", md: "60vh" }}
                      w="100%"
                    >
                      <AgGridReact
                        rowData={
                          previewContent.find(
                            (sheet) => sheet.sheetName === selectedSheet
                          )?.rowData || []
                        }
                        columnDefs={columnDefs}
                        domLayout="normal"
                        enableCellTextSelection={true}
                        suppressRowClickSelection={true}
                        pagination={true}
                        paginationPageSize={20}
                        noRowsOverlayComponent={() => (
                          <Text color={textColor} fontSize="sm">
                            No data available for this sheet.
                          </Text>
                        )}
                        headerHeight={40}
                        rowHeight={48}
                        animateRows={true}
                        onGridReady={(params) => {
                          gridApiRef.current = params.api;
                          params.api.sizeColumnsToFit();
                        }}
                      />
                    </Box>
                  </Card>
                ) : (
                  <Text color={textColor} p={4} fontSize="sm">
                    No data available for this sheet.
                  </Text>
                )}
              </VStack>
            ) : (
              <Text color={textColor} fontSize="sm">
                No data to preview. Please provide a valid JSON input.
              </Text>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor={borderColor} p={4}>
            <Button
              colorScheme="red"
              onClick={() => {
                onClose();
                setShowPreview(false);
                setSearchQuery("");
                if (gridApiRef.current) {
                  gridApiRef.current.setGridOption("quickFilterText", "");
                }
              }}
              bgGradient="linear(to-r, red.400, red.600)"
              _hover={{ bgGradient: "linear(to-r, red.500, red.700)" }}
              borderRadius="full"
              transition="all 0.2s"
              fontSize="sm"
              aria-label="Close preview"
            >
              Close Preview
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default JsonToExcel;
"use client";
import { useState, useCallback, ChangeEvent, useMemo, useEffect } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
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
  Image,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  HStack,
  Input,
  Link,
  Select,
  Spinner,
  Flex,
  useToast,
  Tooltip,
  Skeleton,
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { AgGridReact } from "ag-grid-react";
import { ColDef, IHeaderParams } from "ag-grid-community";
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
  return (
    <Text fontWeight="bold" fontSize="sm" color={useColorModeValue("gray.800", "white")}>
      {displayName}
    </Text>
  );
};

// MIME type detection and utility functions
const detectMimeTypeFromBase64 = (base64: string): string | null => {
  try {
    if (base64.length < 30) return null;
    const binary = atob(base64.slice(0, 30));
    const bytes = Array.from(binary)
      .slice(0, 4)
      .map((c) => c.charCodeAt(0));
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
      return "image/png";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      return "image/jpeg";
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    )
      return "application/pdf";
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    )
      return "image/gif";
    if (
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
      (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
    )
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0
    )
      return "application/vnd.ms-excel";
    return null;
  } catch (error) {
    console.error("Error in detectMimeTypeFromBase64:", error);
    return null;
  }
};

const extensionToMime: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
};

const mimeToExtension: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
};

const detectMimeTypeFromSuffix = (input: string): string | null => {
  const match = input.match(/\.([a-zA-Z0-9]+)$/);
  if (match) {
    const ext = match[1].toLowerCase();
    return extensionToMime[ext] || null;
  }
  return null;
};

const ensureBase64HasPrefix = (base64: string): string => {
  if (base64.startsWith("data:")) return base64;
  let mimeType = detectMimeTypeFromBase64(base64);
  if (!mimeType) mimeType = detectMimeTypeFromSuffix(base64);
  if (!mimeType) {
    throw new Error(
      "Unknown file type. Please ensure the Base64 string is valid and includes a correct data URI prefix or a supported file extension."
    );
  }
  const cleanBase64 = base64
    .replace(/\.([a-zA-Z0-9]+)$/, "")
    .replace(/\s/g, "");
  return `data:${mimeType};base64,${cleanBase64}`;
};

const extractMimeAndData = (input: string) => {
  const normalized = ensureBase64HasPrefix(input);
  const regex = /^data:(.*?);base64,(.*)$/;
  const matches = normalized.match(regex);
  if (matches) {
    return {
      mimeType: matches[1],
      base64Data: matches[2],
    };
  }
  throw new Error("Invalid base64 string");
};

const generateFileName = (mimeType: string) => {
  const extension = mimeToExtension[mimeType] || "bin";
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  return `file_${timestamp}.${extension}`;
};

const Base64ToFile = () => {
  const [base64, setBase64] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<SheetData[] | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, string[]>>(
    {}
  );
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const decodeBase64ToBlob = (
    input: string
  ): { blob: Blob; mimeType: string } | null => {
    try {
      const { mimeType, base64Data } = extractMimeAndData(input);
      const cleanedBase64 = base64Data.replace(/\s/g, "");
      const byteCharacters = atob(cleanedBase64);
      const byteArray = new Uint8Array(
        Array.from(byteCharacters, (char) => char.charCodeAt(0))
      );
      if (byteArray.length === 0) {
        setError("Decoded byte array is empty");
        return null;
      }
      const blob = new Blob([byteArray], { type: mimeType });
      return { blob, mimeType };
    } catch (error) {
      console.error("Error decoding base64 to blob:", error);
      setError("Invalid Base64 data. Check the console for details.");
      return null;
    }
  };

  const parseExcelFile = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetsData = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
          defval: "",
        }) as any[][];
        if (!jsonData.length) {
          return { sheetName, data: [], rowData: [] };
        }
        // Ensure unique headers by appending index to duplicates
        const headerCounts: Record<string, number> = {};
        const headers =
          Array.isArray(jsonData[0]) && jsonData[0].length
            ? jsonData[0].map((cell, index) => {
                const baseHeader = cell != null && cell !== "" ? String(cell) : `Column ${index + 1}`;
                headerCounts[baseHeader] = (headerCounts[baseHeader] || 0) + 1;
                return headerCounts[baseHeader] > 1 ? `${baseHeader}_${headerCounts[baseHeader] - 1}` : baseHeader;
              })
            : Array.from(
                {
                  length:
                    Math.max(
                      ...jsonData
                        .slice(1)
                        .map((row) => (Array.isArray(row) ? row.length : 0))
                    ) || 1,
                },
                (_, i) => `Column ${i + 1}`
              );
        console.log(`Headers for sheet ${sheetName}:`, headers); // Debug headers
        const rowData = jsonData
          .slice(1)
          .map((row) => {
            if (!Array.isArray(row)) return {};
            return row.reduce(
              (acc, cell, index) => {
                const key = headers[index] || `Col${index}`;
                acc[key] =
                  typeof cell === "object" && cell !== null
                    ? JSON.stringify(cell, null, 2)
                    : cell ?? "";
                return acc;
              },
              {} as Record<string, any>
            );
          })
          .filter((row) => Object.keys(row).length > 0);
        return { sheetName, data: [headers, ...jsonData.slice(1)], rowData };
      }).filter((sheet) => sheet.data.length > 0 || sheet.rowData.length > 0);
      if (!sheetsData.length) {
        throw new Error("No valid sheets found in the Excel file.");
      }
      setPreviewContent(sheetsData);
      setSelectedSheet(sheetsData[0].sheetName);
      setSelectedColumns(
        sheetsData.reduce(
          (acc, sheet) => {
            acc[sheet.sheetName] = [];
            return acc;
          },
          {} as Record<string, string[]>
        )
      );
      setFileType(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      setIsLoading(false);
      toast({
        title: "File loaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse the Excel file."
      );
      setIsLoading(false);
    }
  };

  const previewBase64 = useCallback((input: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { mimeType, base64Data } = extractMimeAndData(input);
      setFileType(mimeType);

      if (mimeType.startsWith("image") || mimeType === "application/pdf") {
        const previewUri = `data:${mimeType};base64,${base64Data}`;
        try {
          atob(base64Data.slice(0, 100));
        } catch (e) {
          throw new Error("Invalid Base64 encoding for image/PDF.");
        }
        setPreviewContent([
          { sheetName: "Preview", data: [[previewUri]], rowData: [] },
        ]);
        setSelectedSheet("Preview");
        setIsLoading(false);
      } else if (
        mimeType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/vnd.ms-excel"
      ) {
        const byteCharacters = atob(base64Data);
        const byteArray: any = new Uint8Array(
          Array.from(byteCharacters, (char) => char.charCodeAt(0))
        );
        parseExcelFile(byteArray);
      } else {
        setError("Unsupported file type for preview.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in previewBase64:", error);
      setPreviewContent(null);
      setFileType(null);
      setSelectedSheet("");
      setError(
        error instanceof Error
          ? error.message
          : "Failed to preview the file. Ensure the Base64 string is valid."
      );
      setIsLoading(false);
    }
  }, []);

  const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim().replace(/\s/g, "");
    setBase64(value);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected.");
      return;
    }
    setIsLoading(true);
    setError(null);

    if (file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = (ev.target?.result as string)?.trim().replace(/\s/g, "");
        if (!content) {
          setError("Uploaded file is empty or invalid.");
          setIsLoading(false);
          return;
        }
        setBase64(content);
      };
      reader.onerror = () => {
        setError("Error reading the file.");
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          setError("Error reading the Excel file.");
          setIsLoading(false);
          return;
        }
        parseExcelFile(arrayBuffer);
      };
      reader.onerror = () => {
        setError("Error reading the Excel file.");
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Please upload a .txt, .xlsx, or .xls file.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (base64) {
      previewBase64(base64);
    } else {
      setPreviewContent(null);
      setFileType(null);
      setSelectedSheet("");
      setError(null);
      setIsLoading(false);
      setSelectedColumns({});
    }
  }, [base64, previewBase64]);

  const handleDownload = () => {
    if (!base64.trim()) {
      setError("Please enter a valid Base64 string.");
      return;
    }
    const decoded = decodeBase64ToBlob(base64);
    if (!decoded) return;
    try {
      saveAs(decoded.blob, generateFileName(decoded.mimeType));
      setError(null);
      toast({
        title: "File downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error during file download:", error);
      setError("Failed to download the file.");
    }
  };

  const handleShare = async () => {
    if (!base64.trim()) {
      setError("Please enter a valid Base64 string.");
      return;
    }
    const decoded = decodeBase64ToBlob(base64);
    if (!decoded) return;
    const file = new File([decoded.blob], generateFileName(decoded.mimeType), {
      type: decoded.mimeType,
    });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Shared File",
          text: "Here is the file you requested.",
        });
        setError(null);
        toast({
          title: "File shared successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        console.error("Share failed:", err);
        setError("Sharing failed or not supported.");
      }
    } else {
      setError("Sharing is not supported on this device.");
    }
  };

  const handleTogglePreview = () => {
    if (!base64.trim() && !previewContent) {
      setError("Please provide a valid Base64 string or upload a file.");
      return;
    }
    if (!previewContent) {
      setError("No preview available. Please provide a valid input.");
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
  };

  const handleDownloadJson = (sheetName: string) => {
    if (!previewContent || !selectedColumns[sheetName]?.length) {
      setError("Please select at least one column for the sheet.");
      toast({
        title: "No columns selected",
        description: `Please select columns for ${sheetName} to download as JSON.`,
        status: "error",
        duration: 3000,
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

    const filteredData = selectedSheetData.rowData
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
      setError("No data available for the selected columns.");
      toast({
        title: "No data to download",
        description: `No valid data for the selected columns in ${sheetName}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, `${sheetName}_selected_columns.json`);
    setError(null);
    toast({
      title: "JSON downloaded",
      description: `Successfully downloaded JSON for ${sheetName}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleDownloadAllJsons = async () => {
    if (!previewContent) {
      setError("No sheets available to download.");
      return;
    }

    const zip = new JSZip();
    let hasData = false;

    previewContent.forEach((sheet) => {
      if (!selectedColumns[sheet.sheetName]?.length) return;
      const filteredData = sheet.rowData
        .map((row) => {
          const filteredRow: Record<string, any> = {};
          selectedColumns[sheet.sheetName].forEach((col) => {
            if (row.hasOwnProperty(col)) {
              filteredRow[col] = row[col];
            }
          });
          return Object.keys(filteredRow).length > 0 ? filteredRow : null;
        })
        .filter((row): row is Record<string, any> => row !== null);

      if (filteredData.length > 0) {
        hasData = true;
        zip.file(
          `${sheet.sheetName}_selected_columns.json`,
          JSON.stringify(filteredData, null, 2)
        );
      }
    });

    if (!hasData) {
      setError("No sheets with selected columns and valid data.");
      toast({
        title: "No data to download",
        description: "Please select columns for at least one sheet with valid data.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `all_sheets_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}.zip`);
      setError(null);
      toast({
        title: "Zip downloaded",
        description: "Successfully downloaded zip containing JSONs for all sheets.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error generating zip:", error);
      setError("Failed to generate zip file.");
    }
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
    console.log(`Column options for sheet ${selectedSheet}:`, options); // Debug options
    return options;
  }, [previewContent, selectedSheet]);

  return (
    <Box p={4} bg={bgColor} color={textColor} minH="78vh">
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        mb={6}
        textTransform="uppercase"
      >
        Excel File Processor
      </Heading>

      {error && (
        <Text
          color="red.500"
          textAlign="center"
          mb={4}
          bg="red.50"
          p={3}
          borderRadius="md"
        >
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
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text mt={4} color="white" fontSize="lg" fontWeight="medium">
            Processing file...
          </Text>
        </Box>
      )}

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontWeight="semibold">Base64 Input</FormLabel>
          <Skeleton isLoaded={!isLoading}>
            <Textarea
              value={base64}
              onChange={handleBase64Change}
              placeholder="Paste your Base64 string here"
              rows={5}
              bg={cardBg}
              borderColor={borderColor}
              borderRadius="md"
              fontFamily="'Courier New', monospace"
              fontSize="sm"
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 2px teal.500" }}
              _hover={{ borderColor: "teal.400" }}
              aria-label="Base64 input"
            />
          </Skeleton>
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold">Upload File (.txt, .xlsx, .xls)</FormLabel>
          <Skeleton isLoaded={!isLoading}>
            <Input
              type="file"
              accept=".txt,.xlsx,.xls"
              onChange={handleFileUpload}
              bg={cardBg}
              borderColor={borderColor}
              borderRadius="md"
              p={2}
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 2px teal.500" }}
              _hover={{ borderColor: "teal.400" }}
              aria-label="File upload"
            />
          </Skeleton>
        </FormControl>

        <Button
          colorScheme="green"
          onClick={handleDownload}
          width="full"
          isDisabled={!base64}
          leftIcon={<DownloadIcon />}
          bgGradient="linear(to-r, teal.500, teal.600)"
          _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
          transform="scale(1)"
          transition="transform 0.2s"
          _active={{ transform: "scale(0.95)" }}
          aria-label="Download file"
        >
          Download Original File
        </Button>

        <HStack spacing={4}>
          <Tooltip label="Share the file via browser share API" hasArrow>
            <Button
              colorScheme="blue"
              onClick={handleShare}
              width="full"
              isDisabled={!base64}
              leftIcon={<ExternalLinkIcon />}
              bgGradient="linear(to-r, teal.500, teal.600)"
              _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
              transform="scale(1)"
              transition="transform 0.2s"
              _active={{ transform: "scale(0.95)" }}
              aria-label="Share file"
            >
              Share File
            </Button>
          </Tooltip>
          <Tooltip label={showPreview ? "Hide file preview" : "Show file preview"} hasArrow>
            <Button
              colorScheme="blue"
              onClick={handleTogglePreview}
              width="full"
              leftIcon={showPreview ? <ViewOffIcon /> : <ViewIcon />}
              bgGradient="linear(to-r, teal.500, teal.600)"
              _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
              transform="scale(1)"
              transition="transform 0.2s"
              _active={{ transform: "scale(0.95)" }}
              aria-label={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </Tooltip>
        </HStack>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Upload an Excel file (.xlsx, .xls) or a .txt file with a Base64 string, or paste Base64 directly.
        </Text>
      </VStack>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          onClose();
          setShowPreview(false);
          setSelectedColumns({});
        }}
        size={{ base: "full", md: "xl" }}
      >
        <DrawerOverlay />
        <DrawerContent
          css={{
            minWidth:
              fileType ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              fileType === "application/vnd.ms-excel"
                ? "93vw"
                : "60vw",
          }}
          bg={cardBg}
        >
          <DrawerHeader
            bgGradient="linear(to-r, teal.500, teal.600)"
            color="white"
            py={4}
            px={6}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            File Preview ({previewContent?.length || 0} sheets)
            {selectedColumns[selectedSheet]?.length > 0 && (
              <Text as="span" fontSize="sm" ml={2}>
                - {selectedColumns[selectedSheet].length} column
                {selectedColumns[selectedSheet].length > 1 ? "s" : ""} selected
              </Text>
            )}
          </DrawerHeader>
          <DrawerBody p={6} overflowY="auto">
            {isLoading ? (
              <VStack spacing={4} py={10} align="center">
                <Spinner size="xl" color="teal.500" thickness="4px" />
                <Text color={textColor}>Loading file...</Text>
              </VStack>
            ) : previewContent ? (
              fileType?.startsWith("image") ? (
                <Image
                  src={previewContent[0].data[0][0]}
                  alt="Preview"
                  maxH="70vh"
                  mx="auto"
                  objectFit="contain"
                  borderRadius="md"
                  boxShadow="md"
                  onError={() =>
                    setError(
                      "Failed to load image preview. Ensure the Base64 string is valid."
                    )
                  }
                />
              ) : fileType === "application/pdf" ? (
                <iframe
                  src={previewContent[0].data[0][0]}
                  title="PDF Preview"
                  width="100%"
                  height="70vh"
                  style={{ border: "none", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  onError={() =>
                    setError(
                      "Failed to load PDF preview. Ensure the Base64 string is valid."
                    )
                  }
                />
              ) : fileType ===
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                fileType === "application/vnd.ms-excel" ? (
                <VStack spacing={6} align="stretch">
                  <HStack spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Select Sheet
                    </FormLabel>
                    <Select
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      bg={cardBg}
                      borderColor={borderColor}
                      borderRadius="md"
                      _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 2px teal.500" }}
                      _hover={{ borderColor: "teal.400" }}
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
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Select Columns to Export
                    </FormLabel>
                    <ReactSelect
                      isMulti
                      options={columnOptions}
                      value={columnOptions.filter((opt) =>
                        selectedColumns[selectedSheet]?.includes(opt.value)
                      )}
                      onChange={(selected: MultiValue<SelectOption>) => {
                        const uniqueValues = [...new Set(selected.map((opt) => opt.value))];
                        console.log(`Selected columns for ${selectedSheet}:`, uniqueValues); // Debug selections
                        setSelectedColumns((prev) => ({
                          ...prev,
                          [selectedSheet]: uniqueValues,
                        }));
                      }}
                      placeholder="Select columns to export..."
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
                            ? "teal.500"
                            : state.isFocused
                            ? useColorModeValue("#E6FFFA", "#2D3748")
                            : undefined,
                          color: state.isSelected
                            ? "white"
                            : useColorModeValue("gray.800", "white"),
                          padding: "8px 12px",
                        }),
                      }}
                      aria-label="Select columns"
                    />
                  </FormControl>
                  </HStack>
                  <HStack spacing={4} flexWrap="wrap">
                    <Tooltip label={`Download JSON for ${selectedSheet}`} hasArrow>
                      <Button
                        colorScheme="teal"
                        onClick={() => handleDownloadJson(selectedSheet)}
                        isDisabled={!selectedColumns[selectedSheet]?.length}
                        bgGradient="linear(to-r, teal.500, teal.600)"
                        _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                        size="sm"
                        transform="scale(1)"
                        transition="transform 0.2s"
                        _active={{ transform: "scale(0.95)" }}
                        aria-label={`Download JSON for ${selectedSheet}`}
                      >
                        Download JSON
                      </Button>
                    </Tooltip>
                    <Tooltip label="Download all sheets with selected columns as a zip" hasArrow>
                      <Button
                        colorScheme="teal"
                        variant="outline"
                        onClick={handleDownloadAllJsons}
                        isDisabled={
                          !previewContent ||
                          !Object.values(selectedColumns).some((cols) => cols.length > 0)
                        }
                        size="sm"
                        borderColor="teal.500"
                        _hover={{ bg: "teal.50" }}
                        aria-label="Download all sheets as zip"
                      >
                        Download All as Zip
                      </Button>
                    </Tooltip>
                    {base64 && (
                      <Tooltip label="Download the original file" hasArrow>
                        <Link
                          href={`data:${fileType};base64,${base64.includes(",") ? base64.split(",")[1] : base64}`}
                          download={generateFileName(fileType ?? "application/octet-stream")}
                          color="teal.500"
                          fontWeight="bold"
                          textDecoration="underline"
                          _hover={{ color: "teal.400" }}
                          isExternal
                          aria-label={`Download ${generateFileName(fileType ?? "application/octet-stream")}`}
                        >
                          Download Original
                        </Link>
                      </Tooltip>
                    )}
                  </HStack>
                  {previewContent.find(
                    (sheet) => sheet.sheetName === selectedSheet
                  )?.rowData.length > 0 ? (
                    <Box
                      className="excel-grid-container"
                      w="100%"
                      overflow="auto"
                      borderRadius="md"
                      border="1px"
                      borderColor={borderColor}
                      boxShadow="sm"
                    >
                      <Box
                        className={`ag-theme-alpine${useColorModeValue("", "-dark")}`}
                        h="60vh"
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
                            <Text color={textColor}>No data available for this sheet.</Text>
                          )}
                          headerHeight={40}
                          rowHeight={48}
                          onGridReady={() =>
                            console.log(
                              "AG Grid rendered with drawer width: 93vw"
                            )
                          }
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box w="100%" p={4}>
                      <Text color={textColor}>No data available for this sheet.</Text>
                    </Box>
                  )}
                </VStack>
              ) : (
                <Text color={textColor}>No preview available for this file type.</Text>
              )
            ) : (
              <Text color={textColor}>No preview content available.</Text>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor={borderColor} p={4}>
            <Button
              colorScheme="red"
              onClick={() => {
                onClose();
                setShowPreview(false);
                setSelectedColumns({});
              }}
              bgGradient="linear(to-r, red.400, red.600)"
              _hover={{ bgGradient: "linear(to-r, red.500, red.700)" }}
              transform="scale(1)"
              transition="transform 0.2s"
              _active={{ transform: "scale(0.95)" }}
              aria-label="Close preview"
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Base64ToFile;

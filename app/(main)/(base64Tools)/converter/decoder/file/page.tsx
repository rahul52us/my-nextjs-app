"use client";
import { useState, useCallback, ChangeEvent, useMemo, useEffect } from "react";
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
  Tabs,
  TabList,
  Tab,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import * as XLSX from "xlsx";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./excelViewer.css";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Detect MIME type from base64 magic bytes
const detectMimeTypeFromBase64 = (base64: string): string | null => {
  try {
    if (base64.length < 30) {
      console.warn("Base64 string too short for reliable MIME detection");
      return null;
    }
    const binary = atob(base64.slice(0, 30));
    const bytes = Array.from(binary)
      .slice(0, 4)
      .map((c) => c.charCodeAt(0));
    console.log("Magic bytes:", bytes);
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
    console.warn("No matching MIME type found for magic bytes");
    return null;
  } catch (error) {
    console.error("Error in detectMimeTypeFromBase64:", error);
    return null;
  }
};

// Mapping of extensions to mime types for suffix detection
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

// Explicit MIME to extension mapping for file naming
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
    console.error(
      "Failed to detect MIME type. Input may be malformed or unsupported."
    );
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
  const [previewContent, setPreviewContent] = useState<
    { sheetName: string; data: any[][]; rowData: any[] }[] | null
  >(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const itemsPerPage = 10;
  const maxRows = 1000;

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
      console.log(
        "Decoded byte array length:",
        byteArray.length,
        "MIME type:",
        mimeType
      );
      if (byteArray.length === 0) {
        console.error("Decoded byte array is empty");
        setError("Decoded byte array is empty");
        return null;
      }
      const blob = new Blob([byteArray], { type: mimeType });
      console.log("Blob created, size:", blob.size, "type:", blob.type);
      return { blob, mimeType };
    } catch (error) {
      console.error("Error decoding base64 to blob:", error);
      setError("Invalid Base64 data. Check the console for details.");
      return null;
    }
  };

  const previewBase64 = useCallback((input: string) => {
    console.log("previewBase64 called with input length:", input.length);
    setIsLoading(true);
    setError(null);
    try {
      const { mimeType, base64Data } = extractMimeAndData(input);
      console.log("Detected MIME type:", mimeType);
      setFileType(mimeType);

      if (mimeType.startsWith("image") || mimeType === "application/pdf") {
        console.log("Rendering image/PDF preview");
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
        console.log("Parsing Excel file");
        let byteArray;
        try {
          const byteCharacters = atob(base64Data);
          byteArray = new Uint8Array(
            Array.from(byteCharacters, (char) => char.charCodeAt(0))
          );
          console.log("Byte array created, length:", byteArray.length);
        } catch (e) {
          throw new Error("Invalid Base64 encoding for Excel file.");
        }
        let workbook;
        try {
          workbook = XLSX.read(byteArray, { type: "array", cellDates: true });
          console.log("Excel workbook parsed, sheets:", workbook.SheetNames);
        } catch (e) {
          throw new Error("Corrupt or unsupported Excel file format.");
        }
        const sheetsData = workbook.SheetNames.map((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            blankrows: false,
            defval: "",
          }) as any[][];
          console.log(
            `Sheet ${sheetName} jsonData length:`,
            jsonData.length,
            "data:",
            jsonData
          );
          if (!jsonData.length) {
            console.warn(`Sheet ${sheetName} is empty`);
            return { sheetName, data: [], rowData: [] };
          }
          const headers =
            Array.isArray(jsonData[0]) && jsonData[0].length
              ? jsonData[0].map((cell, index) =>
                  cell != null && cell !== ""
                    ? String(cell)
                    : `Column ${index + 1}`
                )
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
          console.log(`Sheet ${sheetName} headers:`, headers);
          const rowData = jsonData
            .slice(1)
            .slice(0, maxRows)
            .map((row, rowIndex) => {
              if (!Array.isArray(row)) {
                console.warn(`Row ${rowIndex + 1} is not an array:`, row);
                return {};
              }
              return row.reduce(
                (acc, cell, index) => {
                  const key = headers[index] || `Col${index}`;
                  if (
                    typeof cell === "object" &&
                    cell !== null &&
                    !Array.isArray(cell)
                  ) {
                    try {
                      acc[key] = JSON.stringify(cell, null, 2);
                      console.log(
                        `Stringified object in ${sheetName}, row ${
                          rowIndex + 1
                        }, col ${key}:`,
                        acc[key]
                      );
                    } catch (e) {
                      console.warn(
                        `Failed to stringify object in ${sheetName}, row ${
                          rowIndex + 1
                        }, col ${key}:`,
                        cell
                      );
                      acc[key] = "[Invalid Object]";
                    }
                  } else {
                    acc[key] = cell ?? "";
                  }
                  return acc;
                },
                {} as Record<string, any>
              );
            })
            .filter((row) => Object.keys(row).length > 0);
          console.log(
            `Sheet ${sheetName} rowData length:`,
            rowData.length,
            "rowData:",
            rowData
          );
          return { sheetName, data: jsonData, rowData };
        }).filter((sheet) => sheet.data.length > 0 || sheet.rowData.length > 0);
        if (!sheetsData.length) {
          throw new Error("No valid sheets found in the Excel file.");
        }
        console.log(
          "Setting previewContent with sheets:",
          sheetsData.map((s) => s.sheetName)
        );
        setPreviewContent(sheetsData);
        setSelectedSheet(sheetsData[0].sheetName);
        setCurrentPages(
          sheetsData.reduce(
            (acc, sheet) => {
              acc[sheet.sheetName] = 1;
              return acc;
            },
            {} as Record<string, number>
          )
        );
        setIsLoading(false);
      } else {
        console.warn("Unsupported file type:", mimeType);
        setPreviewContent(null);
        setSelectedSheet("");
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

  useEffect(() => {
    if (base64) {
      console.log("useEffect: Processing base64 input");
      previewBase64(base64);
    } else {
      console.log("useEffect: Clearing preview");
      setPreviewContent(null);
      setFileType(null);
      setCurrentPages({});
      setSelectedSheet("");
      setError(null);
      setIsLoading(false);
    }
  }, [base64, previewBase64]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      setError("Please upload a .txt file containing a Base64 string.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = (ev.target?.result as string)?.trim().replace(/\s/g, "");
      if (!content) {
        setError("Uploaded file is empty or invalid.");
        return;
      }
      console.log("File uploaded, setting base64");
      setBase64(content);
    };
    reader.onerror = () => {
      setError("Error reading the file.");
    };
    reader.readAsText(file);
  };

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
      } catch (err) {
        console.error("Share failed:", err);
        setError("Sharing failed or not supported.");
      }
    } else {
      setError("Sharing is not supported on this device.");
    }
  };

  const handleTogglePreview = () => {
    if (!base64.trim()) {
      setError("Please provide a valid Base64 string.");
      return;
    }
    if (!previewContent) {
      setError("No preview available. Please provide a valid Base64 string.");
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

  const handlePageChange = (sheetName: string, page: number) => {
    setCurrentPages((prev) => ({ ...prev, [sheetName]: page }));
  };

  const renderPaginatedData = (sheetData: any[][], sheetName: string) => {
    const currentPage = currentPages[sheetName] || 1;
    const totalItems = sheetData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sheetData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return (
      <Box>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "4px",
            overflowX: "auto",
            maxHeight: "60vh",
          }}
        >
          {JSON.stringify(paginatedData, null, 2)}
        </pre>
        {totalPages > 1 && (
          <HStack justify="center" mt={4}>
            <Button
              size="sm"
              onClick={() => handlePageChange(sheetName, currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(sheetName, currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        )}
      </Box>
    );
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    console.log("Computing columnDefs for sheet:", selectedSheet);
    const selectedSheetData = previewContent?.find(
      (sheet) => sheet.sheetName === selectedSheet
    );
    if (
      !selectedSheetData ||
      !selectedSheetData.data ||
      !Array.isArray(selectedSheetData.data) ||
      selectedSheetData.data.length === 0
    ) {
      console.log(
        "No valid data for columnDefs, sheet data:",
        selectedSheetData
      );
      return [
        {
          headerName: "Column 1",
          field: "Col0",
          sortable: true,
          filter: true,
          resizable: true,
          editable: false,
          minWidth: 120,
          maxWidth: 300,
          cellStyle: { textAlign: "left", padding: "8px" },
        },
      ];
    }
    const firstRow = selectedSheetData.data[0];
    const headers =
      Array.isArray(firstRow) && firstRow.length > 0
        ? firstRow.map((cell, index) =>
            cell != null && cell !== "" ? String(cell) : `Column ${index + 1}`
          )
        : Array.from(
            {
              length:
                Math.max(
                  ...selectedSheetData.data
                    .slice(1)
                    .map((row) => (Array.isArray(row) ? row.length : 0))
                ) || 1,
            },
            (_, i) => `Column ${i + 1}`
          );
    console.log("Generated headers for columnDefs:", headers);
    return headers.map((header, index) => ({
      headerName: header,
      field: header || `Col${index}`,
      sortable: true,
      filter: true,
      resizable: true,
      editable: false,
      minWidth: 120,
      maxWidth: 300,
      cellStyle: { textAlign: "left", padding: "8px" },
    }));
  }, [previewContent, selectedSheet]);

  // Compute the index of the selected sheet for Tabs
  const selectedSheetIndex = previewContent
    ? previewContent.findIndex((sheet) => sheet.sheetName === selectedSheet)
    : 0;

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
        Base64 to File Converter
      </Heading>

      {error && (
        <Text color="red.500" textAlign="center" mb={4}>
          {error}
        </Text>
      )}

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontWeight="semibold">Base64 Input</FormLabel>
          <Textarea
            value={base64}
            onChange={handleBase64Change}
            placeholder="Paste your Base64 string here"
            rows={5}
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
            fontFamily="'Courier New', monospace"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold">Upload Base64 File (.txt)</FormLabel>
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
          />
        </FormControl>

        <Button colorScheme="green" onClick={handleDownload} width="full">
          Download File
        </Button>

        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={handleShare} width="full">
            Share File
          </Button>
          <Button colorScheme="blue" onClick={handleTogglePreview} width="full">
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </HStack>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          If no prefix is given, the converter will attempt to detect the file
          type automatically.
        </Text>
      </VStack>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          onClose();
          setShowPreview(false);
        }}
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
        >
          <DrawerHeader borderBottomWidth="1px">File Preview</DrawerHeader>
          <DrawerBody>
            {isLoading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" />
                <Text mt={4}>Loading file...</Text>
              </Box>
            ) : previewContent ? (
              fileType?.startsWith("image") ? (
                <Image
                  src={previewContent[0].data[0][0]}
                  alt="Preview"
                  maxH="60vh"
                  mx="auto"
                  objectFit="contain"
                  rounded="md"
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
                  height="100%"
                  style={{ border: "none", minHeight: "80vh" }}
                  onError={() =>
                    setError(
                      "Failed to load PDF preview. Ensure the Base64 string is valid."
                    )
                  }
                />
              ) : fileType ===
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                fileType === "application/vnd.ms-excel" ? (
                <Box display="flex" flexDirection="column" height="100%">
                  <Flex mb={4} alignItems="end" justifyContent="end">
                    <Link
                      href={`data:${fileType};base64,${base64.includes(",") ? base64.split(",")[1] : base64}`}
                      download={generateFileName(fileType)}
                      color="teal.500"
                      fontWeight="bold"
                      textDecoration="underline"
                      isExternal
                      mt={4}
                      display="block"
                      textAlign="right"
                      w="full"
                      aria-label={`Download ${generateFileName(fileType)}`}
                    >
                      Download {generateFileName(fileType)}
                    </Link>
                  </Flex>
                  {previewContent.find(
                    (sheet) => sheet.sheetName === selectedSheet
                  )?.rowData.length > 0 || columnDefs.length > 0 ? (
                    <Box
                      className="excel-grid-container"
                      w="100%"
                      flex="1"
                      overflow="auto"
                    >
                      <Box
                        className={`ag-theme-alpine${useColorModeValue("", "-dark")}`}
                        h="60vh"
                        overflow="auto"
                        w="100%"
                      >
                        <AgGridReact
                          rowData={
                            previewContent.find(
                              (sheet) => sheet.sheetName === selectedSheet
                            )?.rowData || []
                          }
                          columnDefs={columnDefs}
                          domLayout="autoHeight"
                          enableCellTextSelection={true}
                          suppressRowClickSelection={true}
                          pagination={false}
                          noRowsOverlayComponent={() => (
                            <Text>No data available for this sheet.</Text>
                          )}
                          theme="legacy"
                          headerHeight={30}
                          onGridReady={() =>
                            console.log(
                              "AG Grid rendered with drawer width: 93vw"
                            )
                          }
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box w="100%" flex="1" overflow="auto">
                      <Text mb={4}>JSON View (Fallback):</Text>
                      {renderPaginatedData(
                        previewContent.find(
                          (sheet) => sheet.sheetName === selectedSheet
                        )?.data || [],
                        selectedSheet
                      )}
                    </Box>
                  )}
                  {previewContent.length > 1 && (
                    <Tabs
                      variant="unstyled"
                      index={selectedSheetIndex}
                      onChange={(index) => {
                        const newSheet = previewContent[index].sheetName;
                        setSelectedSheet(newSheet);
                        console.log("Selected sheet:", newSheet);
                      }}
                      mt={4}
                    >
                      <TabList
                        borderTop="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        overflowX="auto"
                        whiteSpace="nowrap"
                        bg={useColorModeValue("gray.50", "gray.700")}
                        px={2}
                      >
                        {previewContent.map((sheet) => (
                          <Tab
                            key={sheet.sheetName}
                            fontSize="sm"
                            py={1}
                            px={4}
                            borderRight="1px solid"
                            borderColor={useColorModeValue(
                              "gray.200",
                              "gray.600"
                            )}
                            _selected={{
                              bg: useColorModeValue("white", "gray.800"),
                              borderBottom: "2px solid",
                              borderColor: "teal.500",
                              fontWeight: "bold",
                            }}
                            _hover={{
                              bg: useColorModeValue("gray.100", "gray.600"),
                            }}
                          >
                            {sheet.sheetName}
                          </Tab>
                        ))}
                      </TabList>
                    </Tabs>
                  )}
                </Box>
              ) : (
                <Text>No preview available for this file type.</Text>
              )
            ) : (
              <Text>No preview content available.</Text>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button
              colorScheme="red"
              onClick={() => {
                onClose();
                setShowPreview(false);
              }}
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
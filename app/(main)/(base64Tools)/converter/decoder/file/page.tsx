"use client";

import { useState, ChangeEvent } from "react";
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
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";

// Detect MIME type from base64 magic bytes
const detectMimeTypeFromBase64 = (base64: string): string | null => {
  try {
    if (base64.length < 30) {
      console.warn("Base64 string too short for reliable MIME detection");
      return null;
    }

    const binary = atob(base64.slice(0, 30));
    const bytes = Array.from(binary).slice(0, 4).map((c) => c.charCodeAt(0));

    console.log("Magic bytes:", bytes);

    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
      return "image/png";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      return "image/jpeg";
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
      return "application/pdf";
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38)
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
    console.error("Failed to detect MIME type. Input may be malformed or unsupported.");
    throw new Error(
      "Unknown file type. Please ensure the Base64 string is valid and includes a correct data URI prefix or a supported file extension."
    );
  }

  const cleanBase64 = base64.replace(/\.([a-zA-Z0-9]+)$/, "").replace(/\s/g, "");
  return `data:${mimeType};base64,${cleanBase64}`;
};

const Base64ToFile = () => {
  const [base64, setBase64] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<{ sheetName: string; data: any[] }[] | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const itemsPerPage = 10; // Number of rows per page

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
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    return `file_${timestamp}.${extension}`;
  };

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

      console.log("Decoded byte array length:", byteArray.length, "MIME type:", mimeType);

      if (byteArray.length === 0) {
        console.error("Decoded byte array is empty");
        return null;
      }

      const blob = new Blob([byteArray], { type: mimeType });
      console.log("Blob created, size:", blob.size, "type:", blob.type);
      return { blob, mimeType };
    } catch (error) {
      console.error("Error decoding base64 to blob:", error);
      return null;
    }
  };

  const handleDownload = () => {
    if (!base64.trim()) {
      alert("Please enter a valid Base64 string.");
      return;
    }
    const decoded = decodeBase64ToBlob(base64);
    if (!decoded) {
      alert("Invalid Base64 data. Check the console for details.");
      return;
    }
    try {
      saveAs(decoded.blob, generateFileName(decoded.mimeType));
      console.log("File download initiated for MIME type:", decoded.mimeType);
    } catch (error) {
      console.error("Error during file download:", error);
      alert("Failed to download the file. Check the console for details.");
    }
  };

  const handleShare = () => {
    if (!base64.trim()) {
      alert("Please enter a valid Base64 string.");
      return;
    }
    const decoded = decodeBase64ToBlob(base64);
    if (!decoded) {
      alert("Invalid Base64 data. Check the console for details.");
      return;
    }
    const file = new File([decoded.blob], generateFileName(decoded.mimeType), {
      type: decoded.mimeType,
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator
        .share({
          files: [file],
          title: "Shared File",
          text: "Here is the file you requested.",
        })
        .then(() => console.log("File shared successfully!"))
        .catch((err) => {
          console.error("Share failed:", err);
          alert("Sharing failed or not supported.");
        });
    } else {
      alert("Sharing is not supported on your device.");
    }
  };

  const previewBase64 = (input: string) => {
    try {
      const { mimeType, base64Data } = extractMimeAndData(input);
      setFileType(mimeType);

      if (mimeType.startsWith("image") || mimeType === "application/pdf") {
        setPreviewContent([{ sheetName: "Preview", data: [`data:${mimeType};base64,${base64Data}`] }]);
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/vnd.ms-excel"
      ) {
        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(
          Array.from(byteCharacters, (char) => char.charCodeAt(0))
        );
        const workbook = XLSX.read(byteArray, { type: "array" });
        const sheetsData = workbook.SheetNames.map((sheetName) => ({
          sheetName,
          data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]),
        }));
        setPreviewContent(sheetsData);
        // Initialize pagination for each sheet
        setCurrentPages(
          workbook.SheetNames.reduce((acc, sheetName) => {
            acc[sheetName] = 1;
            return acc;
          }, {} as Record<string, number>)
        );
      } else {
        setPreviewContent(null);
      }
    } catch (error) {
      console.error("Error in previewBase64:", error);
      setPreviewContent(null);
      setFileType(null);
    }
  };

  const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim().replace(/\s/g, "");
    setBase64(value);
    if (value) {
      previewBase64(value);
    } else {
      setPreviewContent(null);
      setFileType(null);
      setCurrentPages({});
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".txt")) {
        alert("Please upload a .txt file containing a Base64 string.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = (ev.target?.result as string)?.trim().replace(/\s/g, "");
        if (!content) {
          alert("Uploaded file is empty or invalid.");
          return;
        }
        try {
          setBase64(content);
          previewBase64(content);
        } catch (error) {
          console.error("Error processing uploaded file:", error);
          alert("Failed to process the uploaded Base64 string. Ensure it is valid.");
        }
      };
      reader.onerror = () => {
        alert("Error reading the file.");
      };
      reader.readAsText(file);
    }
  };

  const handleTogglePreview = () => {
    if (!previewContent) {
      alert("No preview available.");
      return;
    }
    setShowPreview((prev) => {
      const newState = !prev;
      newState ? onOpen() : onClose();
      return newState;
    });
  };

  const handlePageChange = (sheetName: string, page: number) => {
    setCurrentPages((prev) => ({ ...prev, [sheetName]: page }));
  };

  const renderPaginatedData = (sheetData: any[], sheetName: string) => {
    const currentPage = currentPages[sheetName] || 1;
    const totalItems = sheetData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sheetData.slice(startIndex, startIndex + itemsPerPage);

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
          If no prefix is given, the converter will attempt to detect the file type
          automatically.
        </Text>
      </VStack>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          onClose();
          setShowPreview(false);
        }}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">File Preview</DrawerHeader>
          <DrawerBody>
            {previewContent ? (
              fileType?.startsWith("image") ? (
                <Image
                  src={previewContent[0].data[0]}
                  alt="Preview"
                  maxH="60vh"
                  mx="auto"
                  objectFit="contain"
                  rounded="md"
                />
              ) : fileType === "application/pdf" ? (
                <iframe
                  src={previewContent[0].data[0]}
                  title="PDF Preview"
                  width="100%"
                  height="100%"
                  style={{ border: "none", minHeight: "80vh" }}
                />
              ) : fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                fileType === "application/vnd.ms-excel" ? (
                <Box>
                  <Text mb={4}>Excel File Preview (All Sheets as JSON):</Text>
                  <Tabs variant="enclosed">
                    <TabList>
                      {previewContent.map((sheet) => (
                        <Tab key={sheet.sheetName}>{sheet.sheetName}</Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {previewContent.map((sheet) => (
                        <TabPanel key={sheet.sheetName}>
                          {renderPaginatedData(sheet.data, sheet.sheetName)}
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                  <Link
                    href={`data:${fileType};base64,${base64.split(",")[1] || base64}`}
                    download={generateFileName(fileType)}
                    color="teal.500"
                    fontWeight="bold"
                    isExternal
                    mt={4}
                    display="block"
                    textAlign="center"
                  >
                    Click here to download the Excel file
                  </Link>
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
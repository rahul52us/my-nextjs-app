"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  HStack,
  Spinner,
  Input,
} from "@chakra-ui/react";
import {
  FaExchangeAlt,
  FaTrashAlt,
  FaShareAlt,
  FaCopy,
  FaFileAlt,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../../store/stores";

const FileToBinaryContent: React.FC = () => {
  const [binaryOutput, setBinaryOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const convertFileToBinary = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const bytes = new Uint8Array(reader.result as ArrayBuffer);
          const binary = Array.from(bytes)
            .map((byte) => byte.toString(2).padStart(8, "0"))
            .join(" ");
          resolve(binary);
        } catch (error) {
          reject("Error converting file to binary");
        }
      };
      reader.onerror = () => {
        reject("Error reading file");
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const {
    themeStore: { themeConfig },
  } = stores;

  // Shared logic used by both click-upload and drag-drop
  const processFile = async (file: File) => {
    setLoading(true);
    setBinaryOutput("");

    try {
      const binary = await convertFileToBinary(file);
      setBinaryOutput(binary);
      setFileName(file.name);
      toast({
        title: "File converted successfully!",
        description: `${file.name} has been converted to binary.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error as string,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // reset input value so uploading the same file again re-triggers onChange
    event.target.value = "";
  };

  // --- Drag & Drop handlers ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only unset if we're leaving the drop zone itself, not a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleClear = () => {
    setBinaryOutput("");
    setFileName("");
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "The output has been copied successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed.",
          description: "Something went wrong while copying.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "output.txt");
  };

  const handleShare = async () => {
    const blob = new Blob([binaryOutput], { type: "text/plain" });
    const file = new File([blob], "output.txt", { type: "text/plain" });

    if (navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Binary Data",
            files: [file],
          });
          toast({
            title: "Shared Successfully",
            description:
              "The formatted output was shared successfully as a file.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Sharing Not Supported",
            description: "This device/browser does not support file sharing.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        console.error("Error sharing the file:", error);
        toast({
          title: "Share Failed",
          description: error?.message || "There was an issue sharing the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Share Unavailable",
        description: "Sharing is not supported on this device/browser.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        File to Binary
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Upload File
          </FormLabel>

          <Box
            as="label"
            htmlFor="file-upload"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={6}
            border="2px dashed"
            borderColor={
              isDragging
                ? "teal.500"
                : useColorModeValue("brand.300", "brand.500")
            }
            borderRadius="xl"
            bg={
              isDragging
                ? useColorModeValue("teal.50", "teal.900")
                : useColorModeValue("brand.50", "gray.700")
            }
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "brand.500",
              bg: useColorModeValue("brand.100", "gray.600"),
            }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon as={FaFileAlt} boxSize={8} color="brand.400" />
            <Text
              fontWeight="semibold"
              color={useColorModeValue("gray.700", "gray.200")}
            >
              {isDragging ? "Drop your file here" : "Click to upload or drag & drop"}
            </Text>
            <Text fontSize="sm" color="gray.400">
              Any file type supported
            </Text>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              display="none"
            />
          </Box>
        </FormControl>

        <HStack spacing={4} justify="space-between">
          <Text fontSize="sm" fontWeight="semibold">
            {fileName ? `File: ${fileName}` : "No file selected"}
          </Text>

          <Button
            colorScheme="red"
            size="lg"
            display={binaryOutput ? undefined : "none"}
            leftIcon={<Icon as={FaTrashAlt} />}
            onClick={handleClear}
          >
            Clear
          </Button>
        </HStack>

        <Divider borderColor="teal.500" />

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Binary Output
          </Text>
          <Box
            p={4}
            bg={useColorModeValue("gray.200", "gray.700")}
            color={useColorModeValue("gray.800", "white")}
            borderRadius="md"
            maxH="160px"
            overflowY="auto"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            mb={4}
          >
            {loading ? (
              <Flex justify="center" align="center" height="100%">
                <Spinner size="lg" color="teal.400" />
              </Flex>
            ) : (
              binaryOutput || "Your file will be converted to binary here."
            )}
          </Box>
          {binaryOutput && (
            <HStack spacing={4} align="stretch">
              <Button
                colorScheme="brand"
                size="sm"
                leftIcon={<Icon as={FaCopy} />}
                onClick={() => handleCopyToClipboard(binaryOutput)}
              >
                Copy to Clipboard
              </Button>

              <Button
                colorScheme="green"
                size="sm"
                onClick={() => handleDownload(binaryOutput)}
              >
                Download Output
              </Button>

              <Button
                colorScheme="teal"
                size="sm"
                leftIcon={<Icon as={FaShareAlt} />}
                onClick={handleShare}
              >
                Share Result
              </Button>
            </HStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default FileToBinaryContent;
"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  useToast,
  Heading,
  useColorModeValue,
  Text,
  FormControl,
  FormLabel,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { FaDownload, FaUpload } from "react-icons/fa";
import JSZip from "jszip";
import stores from "../../../../../store/stores";

const ZipCompression: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
    }
  };

  const handleCompressFiles = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to compress.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const zip = new JSZip();
    Array.from(files).forEach((file) => {
      zip.file(file.name, file);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "compressed_files.zip";
      link.click();

      toast({
        title: "ZIP Compression Successful",
        description: "Your files have been compressed into a ZIP file.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      toast({
        title: "Compression Error",
        description: "There was an error while compressing the files.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg={bgColor}
      color={textColor}
      minH="78vh"
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading
        as="h1"
        size={{ base: "xl", md: "2xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={4}
      >
        Compress Files into a ZIP
      </Heading>
      <Text fontSize={{ base: "md", md: "lg" }} textAlign="center" mb={6}>
        Choose files from your device to compress into a single ZIP file.
      </Text>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="bold">
            Choose Files to Compress
          </FormLabel>

          {/* ✅ Hidden actual input */}
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileChange}
            multiple
            display="none"
          />

          {/* ✅ Custom styled upload box */}
          <Box
            as="label"
            htmlFor="file"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={3}
            p={8}
            border="2px dashed"
            borderColor={files && files.length > 0 ? "teal.400" : borderColor}
            borderRadius="xl"
            bg={
              files && files.length > 0
                ? useColorModeValue("teal.50", "teal.900")
                : cardBg
            }
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "teal.400",
              bg: useColorModeValue("teal.50", "teal.900"),
            }}
          >
            <Icon
              as={FaUpload}
              boxSize={8}
              color={files && files.length > 0 ? "teal.500" : "gray.400"}
            />
            <Text
              fontWeight={files && files.length > 0 ? "semibold" : "normal"}
              color={files && files.length > 0 ? "teal.600" : "gray.500"}
              fontSize="sm"
              textAlign="center"
            >
              {files && files.length > 0
                ? `✓ ${files.length} file${files.length > 1 ? "s" : ""} selected`
                : "Click to choose files or drag & drop"}
            </Text>
            <Text fontSize="xs" color="gray.400">
              All file types supported
            </Text>
          </Box>

          {/* ✅ Selected files list */}
          {files && files.length > 0 && (
            <Box mt={3} p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
              {Array.from(files).map((file, index) => (
                <Text key={index} fontSize="xs" color={textColor} isTruncated>
                  📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Text>
              ))}
            </Box>
          )}
        </FormControl>

        {/* ✅ Responsive button — full width mobile, auto desktop */}
        <Button
          colorScheme="teal"
          onClick={handleCompressFiles}
          leftIcon={<FaDownload />}
          size="lg"
          fontSize={{ base: "md", md: "lg" }}
          borderRadius="full"
          bgGradient="linear(to-r, teal.500, teal.600)"
          _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
          width={{ base: "100%", md: "auto" }}
          alignSelf={{ base: "stretch", md: "center" }}
          isDisabled={!files || files.length === 0}
        >
          Compress Files to ZIP
        </Button>
      </VStack>
    </Box>
  );
};

export default ZipCompression;
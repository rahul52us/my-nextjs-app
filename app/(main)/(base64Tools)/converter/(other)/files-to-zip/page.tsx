"use client";

import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";
import JSZip from "jszip";

const ZipCompression: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const toast = useToast();

  // Handle file selection for compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
    }
  };

  // Compress files into a ZIP
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

    // Add each selected file to the zip
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
    <Box p={8} bg={bgColor} color={textColor} minH={"78vh"} borderRadius="lg" boxShadow="md">
      <Heading as="h1" size="2xl" color="teal.500" textAlign="center" mb={4}>
        Compress Files into a ZIP
      </Heading>
      <Text fontSize="lg" textAlign="center" mb={6}>
        Choose files from your device to compress into a single ZIP file.
      </Text>

      <VStack spacing={6} align="stretch">
        {/* File Input */}
        <FormControl>
          <FormLabel htmlFor="file" fontSize="lg" fontWeight="bold">
            Choose Files to Compress
          </FormLabel>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            multiple
            bg="white"
            _hover={{ bg: "gray.200" }}
            borderColor="teal.300"
          />
        </FormControl>

        {/* Compress Button */}
        <Button
          colorScheme="teal"
          onClick={handleCompressFiles}
          leftIcon={<FaDownload />}
          size="lg"
          fontSize="lg"
          _hover={{ bg: "teal.600" }}
        >
          Compress Files to ZIP
        </Button>
      </VStack>
    </Box>
  );
};

export default ZipCompression;

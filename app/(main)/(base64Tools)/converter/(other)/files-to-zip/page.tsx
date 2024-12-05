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
} from "@chakra-ui/react";
import JSZip from "jszip";
import { FaDownload } from "react-icons/fa";

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
    <Box p={6} bg={bgColor} color={textColor} minH={"80vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Compress Files to ZIP
      </Heading>
      <Text fontSize="lg" color="gray.600" textAlign="center" mb={6}>
        Choose files from your device to compress into a single ZIP file.
      </Text>
      <Input type="file" onChange={handleFileChange} multiple mb={4} />
      <Button
        colorScheme="blue"
        onClick={handleCompressFiles}
        leftIcon={<FaDownload />}
      >
        Compress Files to ZIP
      </Button>
    </Box>
  );
};

export default ZipCompression;
"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Box,
  Spinner,
  Text,
  useToast,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  HStack,
  Spacer,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import JSZip from "jszip";
import { FaUpload, FaEye, FaDownload, FaTrash } from "react-icons/fa";

const ZipDecompression: React.FC = () => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileToView, setFileToView] = useState<any | null>(null);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.200");

  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setZipFile(selectedFile);
    }
  };

  const handleDecompressZip = async () => {
    if (!zipFile) {
      toast({
        title: "No ZIP file selected",
        description: "Please upload a ZIP file first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    const zip = new JSZip();

    try {
      const zipData = await zip.loadAsync(zipFile);
      const files = Object.keys(zipData.files);

      if (files.length === 0) {
        toast({
          title: "No files found",
          description: "The ZIP file does not contain any files.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const extractedFiles = await Promise.all(
        files.map(async (filename) => {
          const fileData = await zipData.files[filename].async("blob");
          return { name: filename, content: fileData };
        })
      );

      setOutput(extractedFiles);

      toast({
        title: "ZIP Decompression Successful",
        description: "ZIP file has been decompressed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error decompressing ZIP file:", error);
      toast({
        title: "Decompression Error",
        description: "There was an error while decompressing the ZIP file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFile = (file: { name: string; content: Blob }) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();
    const fileURL = URL.createObjectURL(file.content);

    if (fileType === "pdf") {
      setFileToView({ type: "pdf", url: fileURL });
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileType || "")) {
      setFileToView({ type: "image", url: fileURL });
    } else {
      setFileToView({ type: "download", url: fileURL });
    }

    onOpen();
  };

  const handleDownloadAll = () => {
    output.forEach((file) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file.content);
      link.download = file.name;
      link.click();
    });
  };

  // Clear All Functionality
  const handleClearAll = () => {
    setZipFile(null);
    setOutput([]);
    setFileToView(null);
  };

  return (
    <Box p={6} bg={bgColor} color={textColor} minH={"78vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Decompress ZIP File
      </Heading>
      <Text fontSize="lg" color="gray.500" textAlign="center" mb={6}>
        Upload a ZIP file to extract its contents and download individual files.
      </Text>
      {/* File Input */}
      <Input
        type="file"
        onChange={handleFileChange}
        accept=".zip"
        mb={4}
        borderColor="blue.500"
        focusBorderColor="blue.700"
        size="lg"
        fontSize="md"
        borderRadius="md"
        _hover={{ borderColor: "blue.700" }}
      />

      {/* Decompress Button */}
      <Button
        colorScheme="green"
        onClick={handleDecompressZip}
        leftIcon={<FaUpload />}
        isLoading={isLoading}
        width="100%"
        mb={6}
        size="lg"
        fontSize="lg"
        borderRadius="md"
        boxShadow="md"
        _hover={{ boxShadow: "lg" }}
      >
        Decompress ZIP File
      </Button>

      {/* Loading Spinner */}
      {isLoading && <Spinner size="lg" color="green.500" />}

      {/* Extracted Files List */}
      {!isLoading && output.length > 0 && (
        <>
          <Text mt={3} fontSize="lg" fontWeight="bold">
            Extracted Files:
          </Text>
          {output.map((file, index) => (
            <Card
              key={index}
              mt={3}
              borderWidth="1px"
              borderRadius="lg"
              shadow="md"
              _hover={{ boxShadow: "lg" }}
            >
              <CardHeader>
                <Text fontWeight="bold" fontSize="lg">
                  {file.name}
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={0} align="start">
                  <HStack spacing={2}>
                    <Link
                      href={URL.createObjectURL(file.content)}
                      download={file.name}
                      color="blue.500"
                      isExternal
                    >
                      <IconButton
                        icon={<FaDownload />}
                        aria-label="Download file"
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                      />
                    </Link>

                    {/* Show View button only for images */}
                    {["jpg", "jpeg", "png", "gif"].includes(
                      file.name.split(".").pop()?.toLowerCase() || ""
                    ) && (
                      <Button
                        colorScheme="blue"
                        onClick={() => handleViewFile(file)}
                        leftIcon={<FaEye />}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </>
      )}

      {/* Download All Button */}
      <Button
        colorScheme="blue"
        onClick={handleDownloadAll}
        mt={6}
        isDisabled={output.length === 0}
        width="100%"
        size="lg"
        fontSize="lg"
        borderRadius="md"
        boxShadow="md"
        _hover={{ boxShadow: "lg" }}
      >
        Download All Files
      </Button>

      {/* Clear All Button */}
      <Button
        colorScheme="red"
        onClick={handleClearAll}
        leftIcon={<FaTrash />}
        mt={4}
        width="100%"
        size="lg"
        fontSize="lg"
        borderRadius="md"
        boxShadow="md"
        _hover={{ boxShadow: "lg" }}
      >
        Clear All
      </Button>

      {/* Modal to View File Content */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {fileToView?.type === "pdf" && (
              <iframe
                src={fileToView.url}
                width="100%"
                height="100%"
                style={{ border: "none", maxHeight: "80vh" }}
                title="PDF View"
              />
            )}

            {fileToView?.type === "image" && (
              <img
                src={fileToView.url}
                alt="Image"
                width="100%"
                height="auto"
                style={{ borderRadius: "8px" }}
              />
            )}
            {fileToView?.type === "download" && (
              <Text>
                The file format is not supported for direct viewing. You can
                download it instead.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose} mr={3}>
              Close
            </Button>
            <Link href={fileToView?.url} download="file" isExternal>
              <Button colorScheme="green">Download File</Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ZipDecompression;

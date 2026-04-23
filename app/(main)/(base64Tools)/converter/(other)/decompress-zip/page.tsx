"use client";

import React, { useState, useRef } from "react";
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
  Wrap,
  WrapItem,
  Heading,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import JSZip from "jszip";
import { FaUpload, FaEye, FaDownload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import stores from "../../../../../store/stores";

const ZipDecompression: React.FC = () => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileToView, setFileToView] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const toast = useToast();
  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) setZipFile(selectedFile);
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
      setFileToView({ type: "pdf", url: fileURL, name: file.name, content: file.content });
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileType || "")) {
      setFileToView({ type: "image", url: fileURL, name: file.name, content: file.content });
    } else {
      setFileToView({ type: "download", url: fileURL, name: file.name, content: file.content });
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

  const handleClearAll = () => {
    setZipFile(null);
    setOutput([]);
    setFileToView(null);
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg={bgColor} color={textColor} minH="78vh">
      <Heading
        as="h1"
        size={{ base: "lg", md: "xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={4}
      >
        Decompress ZIP File
      </Heading>
      <Text
        fontSize={{ base: "sm", md: "lg" }}
        color="gray.500"
        textAlign="center"
        mb={6}
      >
        Upload a ZIP file to extract its contents and download individual files.
      </Text>

      {/* ✅ Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".zip"
        display="none"
        id="zip-upload-input"
      />

      {/* ✅ Custom styled upload box */}
      <Box
        as="label"
        htmlFor="zip-upload-input"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={3}
        p={8}
        mb={6}
        border="2px dashed"
        borderColor={zipFile ? "blue.400" : borderColor}
        borderRadius="xl"
        bg={zipFile ? useColorModeValue("blue.50", "blue.900") : cardBg}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: "blue.400",
          bg: useColorModeValue("blue.50", "blue.900"),
        }}
      >
        <Icon
          as={FaUpload}
          boxSize={8}
          color={zipFile ? "blue.500" : "gray.400"}
        />
        <Text
          fontWeight={zipFile ? "semibold" : "normal"}
          color={zipFile ? "blue.600" : "gray.500"}
          fontSize="sm"
          textAlign="center"
        >
          {zipFile ? `✓ ${zipFile.name}` : "Click to choose ZIP file or drag & drop"}
        </Text>
        {zipFile && (
          <Text fontSize="xs" color="blue.400">
            {(zipFile.size / 1024).toFixed(1)} KB
          </Text>
        )}
        {!zipFile && (
          <Text fontSize="xs" color="gray.400">
            Supported format: .zip
          </Text>
        )}
      </Box>

      {/* Loading Spinner */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mb={4}>
          <Spinner size="lg" color="green.500" />
        </Box>
      )}

      {/* Extracted Files List */}
      {!isLoading && output.length > 0 && (
        <>
          <Text mt={3} mb={2} fontSize="lg" fontWeight="bold">
            Extracted Files ({output.length}):
          </Text>
          {output.map((file, index) => (
            <Card
              key={index}
              mt={3}
              borderWidth="1px"
              borderRadius="lg"
              shadow="md"
              bg={cardBg}
              _hover={{ boxShadow: "lg" }}
            >
              <CardHeader pb={1}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} isTruncated>
                  📄 {file.name}
                </Text>
              </CardHeader>
              <CardBody pt={1}>
                <VStack spacing={0} align="start">
                  <Wrap spacing={2}>
                    <WrapItem>
                      <Link
                        href={URL.createObjectURL(file.content)}
                        download={file.name}
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
                    </WrapItem>
                    {["jpg", "jpeg", "png", "gif"].includes(
                      file.name.split(".").pop()?.toLowerCase() || ""
                    ) && (
                      <WrapItem>
                        <Button
                          colorScheme="blue"
                          onClick={() => handleViewFile(file)}
                          leftIcon={<FaEye />}
                          size="sm"
                          variant="outline"
                        >
                          View
                        </Button>
                      </WrapItem>
                    )}
                  </Wrap>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </>
      )}

      {/* ✅ Action Buttons — Wrap for mobile */}
      <Wrap spacing={3} mt={6} justify={{ base: "stretch", md: "flex-start" }}>
        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="green"
            onClick={handleDecompressZip}
            leftIcon={<FaUpload />}
            isLoading={isLoading}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, green.400, green.600)"
            _hover={{ bgGradient: "linear(to-r, green.500, green.700)" }}
            boxShadow="md"
            isDisabled={!zipFile}
          >
            Decompress ZIP
          </Button>
        </WrapItem>

        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="blue"
            onClick={handleDownloadAll}
            leftIcon={<FaDownload />}
            isDisabled={output.length === 0}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, blue.400, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.500, blue.700)" }}
            boxShadow="md"
          >
            Download All
          </Button>
        </WrapItem>

        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="red"
            onClick={handleClearAll}
            leftIcon={<FaTrash />}
            isDisabled={!zipFile && output.length === 0}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, red.400, red.500)"
            _hover={{ bgGradient: "linear(to-r, red.500, red.600)" }}
            boxShadow="md"
          >
            Clear All
          </Button>
        </WrapItem>
      </Wrap>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {fileToView?.type === "pdf" && (
              <iframe
                src={fileToView.url}
                width="100%"
                height="500px"
                style={{ border: "none" }}
                title="PDF View"
              />
            )}
            {fileToView?.type === "image" && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image
                  src={fileToView.url}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain", borderRadius: "8px" }}
                />
              </div>
            )}
            {fileToView?.type === "download" && (
              <Text>
                This file format is not supported for preview. Please download it.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose} mr={3}>
              Close
            </Button>
            {fileToView?.content && (
              <Link
                href={URL.createObjectURL(fileToView.content)}
                download={fileToView.name}
                isExternal
              >
                <Button colorScheme="green">Download File</Button>
              </Link>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ZipDecompression;
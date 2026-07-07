"use client";

import React, { useState, useRef } from "react";
import CryptoJS from "crypto-js";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  useColorModeValue,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { FaKey, FaUpload, FaLock } from "react-icons/fa";
import stores from "../../../../../store/stores";

const FileEncryption = () => {
  const [file, setFile] = useState<File | null>(null);
  const [secretKey, setSecretKey] = useState<string>("");
  // NEW: track drag-over state so the dropzone can be styled/labeled while dragging
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    // allow re-selecting the same file again later
    e.target.value = "";
  };

  const handleSecretKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretKey(e.target.value);
  };

  // NEW: Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounterRef.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Required: without preventDefault() the browser blocks the drop event
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      if (!isDragActive) setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    } else {
      alert("No file detected in the drop. Please try again.");
    }
    e.dataTransfer.clearData();
  };

  const encryptFile = () => {
    if (file && secretKey) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileContent = event.target.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(fileContent);
          const encrypted = CryptoJS.AES.encrypt(wordArray, secretKey).toString();
          const blob = new Blob([encrypted], { type: "application/octet-stream" });
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = file.name + ".enc";
          downloadLink.click();
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a file and enter a secret key.");
    }
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg="transparent"
      color={textColor}
      minH="80vh"
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading
        as="h1"
        size={{ base: "lg", md: "2xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={4}
      >
        Secure Your File with AES Encryption
      </Heading>
      <Text
        fontSize={{ base: "sm", md: "lg" }}
        textAlign="center"
        mb={8}
        color="gray.500"
      >
        Upload your file and enter a secret key to encrypt the file securely.
      </Text>

      <VStack spacing={6} align="stretch">

        {/* ✅ Custom Upload Box — now a working dropzone */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="bold">
            Choose a File to Encrypt
          </FormLabel>

          {/* Hidden input */}
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileChange}
            display="none"
          />

          {/* Styled upload area */}
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
            borderColor={isDragActive ? "#007AAC" : file ? "#007AAC" : borderColor}
            borderRadius="xl"
            bg={
              isDragActive
                ? useColorModeValue("#cfeaf7", "#00527a")
                : file
                  ? useColorModeValue("#e6f4fa", "#003d56")
                  : cardBg
            }
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "#007AAC",
              bg: useColorModeValue("#e6f4fa", "#003d56"),
            }}
            // NEW: drag-and-drop wiring. onDragOver MUST call preventDefault()
            // or the browser will reject the drop (and just open the file instead).
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon
              as={FaUpload}
              boxSize={8}
              color={isDragActive || file ? "#007AAC" : "gray.400"}
            />
            <Text
              fontWeight={isDragActive || file ? "semibold" : "normal"}
              color={isDragActive || file ? "#007AAC" : "gray.500"}
              fontSize="sm"
              textAlign="center"
            >
              {isDragActive
                ? "Drop the file here"
                : file
                  ? `✓ ${file.name}`
                  : "Click to choose a file or drag & drop"}
            </Text>
            {file && !isDragActive && (
              <Text fontSize="xs" color="#007AAC">
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            )}
            {!file && !isDragActive && (
              <Text fontSize="xs" color="gray.400">
                All file types supported
              </Text>
            )}
          </Box>
        </FormControl>

        {/* Secret Key Input — same as before */}
        <FormControl>
          <FormLabel htmlFor="secret-key" fontSize="lg" fontWeight="bold">
            Enter Secret Key
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <IconButton
                aria-label="Key Icon"
                icon={<FaKey />}
                variant="link"
              />
            </InputLeftElement>
            <Input
              id="secret-key"
              type="text"
              value={secretKey}
              onChange={handleSecretKeyChange}
              placeholder="Enter encryption key"
              bg={cardBg}
              _hover={{ borderColor: "#007AAC" }}
              borderColor={borderColor}
              _focus={{
                borderColor: "#007AAC",
                boxShadow: "0 0 0 2px #007AAC",
              }}
            />
          </InputGroup>
        </FormControl>

        {/* ✅ Responsive Encrypt Button */}
        <Button
          onClick={encryptFile}
          leftIcon={<FaLock />}
          size="lg"
          fontSize={{ base: "md", md: "lg" }}
          borderRadius="full"
          bg="#007AAC"
          color="white"
          _hover={{ bg: "#005f85" }}
          _active={{ transform: "scale(0.98)" }}
          transition="all 0.2s"
          width={{ base: "100%", md: "auto" }}
          alignSelf={{ base: "stretch", md: "center" }}
          isDisabled={!file || !secretKey}
        >
          Encrypt File
        </Button>
      </VStack>
    </Box>
  );
};

export default FileEncryption;
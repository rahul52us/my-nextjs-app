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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSecretKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretKey(e.target.value);
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
      bg={bgColor}
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

        {/* ✅ Custom Upload Box */}
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
            borderColor={file ? "teal.400" : borderColor}
            borderRadius="xl"
            bg={file ? useColorModeValue("teal.50", "teal.900") : cardBg}
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
              color={file ? "teal.500" : "gray.400"}
            />
            <Text
              fontWeight={file ? "semibold" : "normal"}
              color={file ? "teal.600" : "gray.500"}
              fontSize="sm"
              textAlign="center"
            >
              {file
                ? `✓ ${file.name}`
                : "Click to choose a file or drag & drop"}
            </Text>
            {file && (
              <Text fontSize="xs" color="teal.400">
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            )}
            {!file && (
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
              _hover={{ borderColor: "teal.400" }}
              borderColor={borderColor}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 2px teal",
              }}
            />
          </InputGroup>
        </FormControl>

        {/* ✅ Responsive Encrypt Button */}
        <Button
          onClick={encryptFile}
          leftIcon={<FaLock />}
          colorScheme="teal"
          size="lg"
          fontSize={{ base: "md", md: "lg" }}
          borderRadius="full"
          bgGradient="linear(to-r, teal.500, teal.600)"
          _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
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
"use client";

import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { FaKey } from "react-icons/fa";

const FileEncryption = () => {
  const [file, setFile] = useState<File | null>(null);
  const [secretKey, setSecretKey] = useState<string>("");
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

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

          // Encrypt the binary data using AES
          const encrypted = CryptoJS.AES.encrypt(wordArray, secretKey).toString();

          // Create a Blob from the encrypted data (Base64 encoded)
          const blob = new Blob([encrypted], {
            type: "application/octet-stream",
          });

          // Create a download link for the encrypted file
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = file.name + ".enc";
          downloadLink.click();
        }
      };
      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer (binary)
    } else {
      alert("Please select a file and enter a secret key.");
    }
  };

  return (
    <Box p={8} bg={bgColor} color={textColor} minH={"80vh"} borderRadius="lg" boxShadow="md">
      <Heading as="h1" size="2xl" color="teal.500" textAlign="center" mb={4}>
        Secure Your File with AES Encryption
      </Heading>
      <Text fontSize="lg" textAlign="center" mb={8}>
        Upload your file and enter a secret key to encrypt the file securely.
      </Text>
      <VStack spacing={6} align="stretch">
        {/* File Input */}
        <FormControl>
          <FormLabel htmlFor="file" fontSize="lg" fontWeight="bold">
            Choose a File to Encrypt
          </FormLabel>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            placeholder="Select a file"
            bg="white"
            _hover={{ bg: "gray.200" }}
            borderColor="teal.300"
          />
        </FormControl>

        {/* Secret Key Input */}
        <FormControl>
          <FormLabel htmlFor="secret-key" fontSize="lg" fontWeight="bold">
            Enter Secret Key
          </FormLabel>
          <InputGroup>
          <InputLeftElement pointerEvents="none">
  <IconButton aria-label="Key Icon" icon={<FaKey />} variant="link" />
</InputLeftElement>

            <Input
              id="secret-key"
              type="text"
              value={secretKey}
              onChange={handleSecretKeyChange}
              placeholder="Enter encryption key"
              bg="white"
              _hover={{ bg: "gray.200" }}
              borderColor="teal.300"
            />
          </InputGroup>
        </FormControl>

        {/* Encrypt Button */}
        <Button
          onClick={encryptFile}
          colorScheme="teal"
          size="lg"
          fontSize="lg"
          _hover={{ bg: "teal.600" }}
        >
          Encrypt File
        </Button>
      </VStack>
    </Box>
  );
};

export default FileEncryption;

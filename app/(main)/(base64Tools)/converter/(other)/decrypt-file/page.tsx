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

const FileDecryption = () => {
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

  const decryptFile = () => {
    if (file && secretKey) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          const encryptedDataWithMeta = event.target.result as string;

          try {
            // Decrypt the encrypted data
            const bytes = CryptoJS.AES.decrypt(encryptedDataWithMeta, secretKey);

            if (bytes.sigBytes <= 0) {
              throw new Error("Invalid decryption or incorrect key.");
            }

            const decryptedData = bytes.toString(CryptoJS.enc.Base64);
            const binaryString = atob(decryptedData);

            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              byteArray[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: "application/octet-stream" });

            const filenameParts = file.name.split(".");
            filenameParts.pop(); // Remove the last '.enc'
            const originalExtension = filenameParts.pop() || ""; // Get the real extension

            const originalName = filenameParts.join(".");

            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${originalName}.${originalExtension}`;
            downloadLink.click();
          } catch (error) {
            alert("Decryption failed: Invalid secret key or corrupted file.");
            console.error("Decryption Error:", error);
          }
        }
      };

      reader.readAsText(file);
    } else {
      alert("Please select a file and enter a secret key.");
    }
  };

  return (
    <Box p={8} bg={bgColor} color={textColor} minH={"80vh"} borderRadius="lg" boxShadow="md">
      <Heading as="h1" size="2xl" color="teal.500" textAlign="center" mb={4}>
        Decrypt Your File Securely
      </Heading>
      <Text fontSize="lg" textAlign="center" mb={8}>
        Upload your encrypted file and enter the secret key to decrypt it.
      </Text>
      <VStack spacing={6} align="stretch">
        {/* File Input */}
        <FormControl>
          <FormLabel htmlFor="file" fontSize="lg" fontWeight="bold">
            Choose an Encrypted File
          </FormLabel>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            placeholder="Select an encrypted file"
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
              placeholder="Enter decryption key"
              bg="white"
              _hover={{ bg: "gray.200" }}
              borderColor="teal.300"
            />
          </InputGroup>
        </FormControl>

        {/* Decrypt Button */}
        <Button
          onClick={decryptFile}
          colorScheme="teal"
          size="lg"
          fontSize="lg"
          _hover={{ bg: "teal.600" }}
        >
          Decrypt File
        </Button>
      </VStack>
    </Box>
  );
};

export default FileDecryption;

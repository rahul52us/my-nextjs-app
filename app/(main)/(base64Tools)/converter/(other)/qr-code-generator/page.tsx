"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  HStack,
  Select,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import QRCode from "react-qr-code";
import { FaDownload, FaTrash } from "react-icons/fa";
import html2canvas from "html2canvas";

const QRCodeGenerator: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [size, setSize] = useState<number>(256);
  const [isLoading] = useState<boolean>(false);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const toast = useToast(); // For showing toast notifications

  // Handle download as image (PNG)
  const handleDownload = async () => {
    const qrCodeElement = document.getElementById("qr-code");
    if (!qrCodeElement) {
      toast({
        title: "QR Code Not Found",
        description: "Please enter a valid input to generate the QR code.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const canvas = await html2canvas(qrCodeElement);
      const dataUrl = canvas.toDataURL("image/png"); // Convert canvas to image (PNG)
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "qr-code.png"; // Set the filename
      link.click();

      toast({
        title: "Download Successful",
        description: "QR code downloaded successfully as PNG.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the QR code.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
    }
  };

  // Handle clear action
  const handleClear = () => {
    setInput("");
  };

  // Handle input change and loading state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH={"78vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        QR Code Generator
        <Text fontSize="lg" color="gray.500" mt={2}>
          Create and download custom QR codes from any text or URL
        </Text>
      </Heading>

      <Input
        placeholder="Enter text or URL"
        value={input}
        onChange={handleInputChange}
        size="lg"
        mb={3}
        autoFocus
      />

      <Select
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
        mb={5}
      >
        <option value={128}>128x128</option>
        <option value={256}>256x256</option>
        <option value={512}>512x512</option>
      </Select>

      {isLoading ? (
        <Box mt={5} display="flex" justifyContent="center">
          <Spinner size="lg" />
        </Box>
      ) : input ? (
        <Box
          id="qr-code"
          mt={5}
          bg="white"
          p={5}
          borderRadius="md"
          display="inline-block"
          maxWidth="100%"
          boxShadow="md"
        >
          <QRCode value={input} size={size} />
        </Box>
      ) : (
        <Text mt={5} textAlign="center" color="gray.500">
          Enter text or URL to generate a QR code
        </Text>
      )}

      <HStack spacing={4} mt={5} justify="center">
        <Button
          leftIcon={<FaDownload />}
          colorScheme="blue"
          onClick={handleDownload}
          isDisabled={!input || isLoading}
          isLoading={isLoading}
        >
          Download QR
        </Button>
        <Button
          leftIcon={<FaTrash />}
          colorScheme="red"
          onClick={handleClear}
          isDisabled={!input}
        >
          Clear
        </Button>
      </HStack>
    </Box>
  );
};

export default QRCodeGenerator;

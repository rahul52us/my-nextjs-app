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
import JsBarcode from "jsbarcode";
import { FaDownload, FaTrash } from "react-icons/fa";
import html2canvas from "html2canvas";

const BarcodeGenerator: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [size, setSize] = useState<number>(256);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const toast = useToast(); // For showing toast notifications

  // Handle download as image (PNG)
  const handleDownload = async () => {
    const barcodeElement = document.getElementById("barcode");
    if (!barcodeElement) {
      toast({
        title: "Barcode Not Found",
        description: "Please enter a valid input to generate the barcode.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const canvas = await html2canvas(barcodeElement);
      const dataUrl = canvas.toDataURL("image/png"); // Convert canvas to image (PNG)
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "barcode.png"; // Set the filename
      link.click();

      toast({
        title: "Download Successful",
        description: "Barcode downloaded successfully as PNG.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading Barcode:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the barcode.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

  // Generate Barcode (on input change)
  const generateBarcode = () => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, input, {
      format: "CODE128",
      lineColor: "#000000",
      width: 2,
      height: 50,
      displayValue: false,
    });
    return canvas.toDataURL();
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH={"80vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Barcode Generator
      </Heading>

      <Input
        placeholder="Enter text or number"
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
          id="barcode"
          mt={5}
          bg="white"
          p={5}
          borderRadius="md"
          display="inline-block"
          maxWidth="100%"
          boxShadow="md"
        >
          <img src={generateBarcode()} alt="Generated Barcode" />
        </Box>
      ) : (
        <Text mt={5} textAlign="center" color="gray.500">
          Enter text or number to generate a barcode
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
          Download Barcode
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

export default BarcodeGenerator;

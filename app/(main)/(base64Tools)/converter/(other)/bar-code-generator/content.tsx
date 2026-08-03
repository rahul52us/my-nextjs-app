"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { FaDownload, FaTrash, FaBarcode } from "react-icons/fa";
import stores from "../../../../../store/stores";

const BarcodeGenerator: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [size, setSize] = useState<number>(256);
  const [isLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ---- Theme-aware colors ----
  const pageColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const previewBorder = useColorModeValue("gray.200", "gray.600");

  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  // Handle download as image (PNG) — reads directly from the canvas we drew on
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !input) {
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
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "barcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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

  // Draw the barcode directly on the visible canvas whenever the input changes
  useEffect(() => {
    if (!input || !canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, input, {
        format: "CODE128",
        lineColor: "#000000",
        width: 2,
        height: 50,
        displayValue: false,
      });
    } catch (error) {
      console.error("Error generating barcode:", error);
    }
  }, [input]);

  return (
    <Box bg="transparent" color={pageColor} minH={"78vh"} py={8} px={4}>
      {/* ---- Header ---- */}
      <Box textAlign="center" mb={8}>
        <HStack justify="center" spacing={3} mb={2}>
          <Box
            bg={themeConfig.colors.brand[300]}
            color="white"
            borderRadius="full"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaBarcode size={20} />
          </Box>
          <Heading as="h1" size="xl" color={themeConfig.colors.brand[300]}>
            Barcode Generator
          </Heading>
        </HStack>
        <Text color={subTextColor} fontSize="md">
          Enter text or a number below and get an instant, downloadable barcode.
        </Text>
      </Box>

      {/* ---- Main card ---- */}
      <Box
        maxW="640px"
        mx="auto"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        boxShadow="sm"
        p={{ base: 5, md: 8 }}
      >
        <Box mb={5}>
          <Text fontWeight="semibold" mb={2} fontSize="sm">
            Text or Number
          </Text>
          <Input
            placeholder="Enter text or number"
            value={input}
            onChange={handleInputChange}
            size="lg"
            autoFocus
            borderRadius="md"
          />
        </Box>

        <Box mb={6}>
          <Text fontWeight="semibold" mb={2} fontSize="sm">
            Size
          </Text>
          <Select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            size="lg"
            borderRadius="md"
          >
            <option value={128}>128x128</option>
            <option value={256}>256x256</option>
            <option value={512}>512x512</option>
          </Select>
        </Box>

        {/* ---- Live preview ---- */}
        <Box
          bg={sectionBg}
          border="1px dashed"
          borderColor={previewBorder}
          borderRadius="lg"
          minH="180px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={5}
          mb={6}
        >
          {isLoading ? (
            <Spinner size="lg" color={themeConfig.colors.brand[300]} />
          ) : (
            <>
              <Box
                bg="white"
                p={5}
                borderRadius="md"
                display={input ? "inline-block" : "none"}
                maxWidth="100%"
                boxShadow="md"
              >
                <canvas
                  ref={canvasRef}
                  style={{ display: "block", maxWidth: "100%", height: "auto" }}
                />
              </Box>
              {!input && (
                <Text textAlign="center" color={subTextColor}>
                  Enter text or number to generate a barcode
                </Text>
              )}
            </>
          )}
        </Box>

        <HStack spacing={4} justify="center">
          <Button
            leftIcon={<FaDownload />}
            colorScheme="brand"
            size="lg"
            onClick={handleDownload}
            isDisabled={!input || isLoading}
            isLoading={isLoading}
          >
            Download Barcode
          </Button>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            variant="outline"
            size="lg"
            onClick={handleClear}
            isDisabled={!input}
          >
            Clear
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default BarcodeGenerator;
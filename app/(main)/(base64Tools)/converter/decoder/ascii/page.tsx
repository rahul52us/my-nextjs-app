"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  HStack,
  Spinner, // Import Spinner
} from "@chakra-ui/react";
import {
  FaExchangeAlt,
  FaClipboard,
  FaDownload,
  FaTrashAlt,
} from "react-icons/fa";
import { saveAs } from "file-saver";

const Base64ToAscii: React.FC = () => {
  const [base64Input, setBase64Input] = useState<string>("");
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Track loading state
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // Function to convert Base64 to ASCII using Buffer
  const convertBase64ToAscii = (base64: string): string => {
    try {
      const buffer = Buffer.from(base64, "base64");
      return buffer.toString("ascii");
    } catch {
      return "Invalid Base64 string";
    }
  };

  const handleConversion = () => {
    setLoading(true); // Set loading state to true when conversion starts
    setAsciiOutput(""); // Clear previous output
    const output = convertBase64ToAscii(base64Input);
    setAsciiOutput(output);
    setLoading(false); // Set loading state to false after conversion is complete
  };

  // Function to copy the output to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(asciiOutput)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "The ASCII output has been copied successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed.",
          description: "Something went wrong while copying.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  const handleDownload = () => {
    const blob = new Blob([asciiOutput], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "output.txt");
  };

  // Function to clear the input and output fields
  const handleClear = () => {
    setBase64Input("");
    setAsciiOutput("");
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        Base64 to ASCII
      </Heading>

      {/* Base64 Input Section */}
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter Base64 String
          </FormLabel>
          <Textarea
            placeholder="Paste your Base64 encoded text here"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            size="lg"
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
            rows={5}
            rounded="md"
            fontFamily="'Courier New', monospace"
          />
        </FormControl>

        {/* Buttons Section */}
        <HStack spacing={4} justify="space-between">
          <Button
            colorScheme="teal"
            size="lg"
            leftIcon={<Icon as={FaExchangeAlt} />}
            onClick={handleConversion}
          >
            Convert to ASCII
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            display={base64Input?.trim() ? undefined : "none"}
            leftIcon={<Icon as={FaTrashAlt} />}
            onClick={handleClear}
          >
            Clear Input
          </Button>
        </HStack>

        <Divider borderColor="teal.500" />

        {/* ASCII Output Section */}
        <Box>
          <Flex justifyContent="space-between" mb={2}>
            <Text fontSize="lg" fontWeight="semibold">
              ASCII Output
            </Text>
            {asciiOutput && (
              <HStack spacing={4} align="stretch">
                <Text
                  color="blue.500"
                  onClick={handleCopyToClipboard}
                  cursor="pointer"
                  fontWeight="semibold"
                  textDecoration="underline"
                  fontSize="sm"
                >
                  Copy to Clipboard
                </Text>

                <Text
                  color="green.500"
                  onClick={handleDownload}
                  cursor="pointer"
                  fontWeight="semibold"
                  textDecoration="underline"
                  fontSize="sm"
                >
                  Download ASCII Output
                </Text>
              </HStack>
            )}
          </Flex>

          <Box
            p={4}
            bg={useColorModeValue("gray.200", "gray.700")}
            color={useColorModeValue("gray.800", "white")}
            borderRadius="md"
            maxH="160px"
            overflowY="auto"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            mb={4}
          >
            {loading ? (
              <Flex justify="center" align="center" height="100%">
                <Spinner size="lg" color="teal.400" />
              </Flex>
            ) : (
              asciiOutput || "Your converted text will appear here."
            )}
          </Box>
        </Box>
        <Box mb={6}>
        <Text fontSize="lg" fontWeight="semibold" textAlign="center">
          Instructions:
        </Text>
        <VStack align="stretch" spacing={3} mt={2}>
          <Text fontSize="sm">
            1. Paste your <strong>Base64 string</strong> into the provided input field.
          </Text>
          <Text fontSize="sm">
            2. Click <strong>"Convert to ASCII"</strong> to convert the Base64 string to ASCII.
          </Text>
          <Text fontSize="sm">
            3. The converted ASCII output will appear below. You can <strong>copy it</strong> to the clipboard or <strong>download</strong> it as a text file.
          </Text>
          <Text fontSize="sm" color="red.500">
            * Make sure the Base64 string is valid for a successful conversion.
          </Text>
        </VStack>
      </Box>
      </VStack>
    </Box>
  );
};

export default Base64ToAscii;

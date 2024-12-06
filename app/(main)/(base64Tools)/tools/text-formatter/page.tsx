"use client";

import { useState, ChangeEvent, useRef } from "react";
import {
  Box,
  Textarea,
  Button,
  VStack,
  Heading,
  Text,
  Input,
  IconButton,
  useToast,
  HStack,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";
import { FaCopy, FaDownload, FaUpload } from "react-icons/fa";

// Utility function to download text as a .txt file
const downloadTextFile = (text: string, filename: string) => {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const TextFormatter = () => {
  const [inputText, setInputText] = useState<string>("");
  const [formattedText, setFormattedText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false); // New state for uploading file
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const toast = useToast();

  // Handle input text change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Remove extra spaces
  const handleRemoveExtraSpaces = () => {
    setFormattedText(inputText.replace(/\s+/g, " ").trim());
  };

  // Capitalize text
  const handleCapitalizeText = () => {
    setFormattedText(inputText.replace(/\b\w/g, (char) => char.toUpperCase()));
  };

  // Convert to uppercase
  const handleToUppercase = () => {
    setFormattedText(inputText.toUpperCase());
  };

  // Convert to lowercase
  const handleToLowercase = () => {
    setFormattedText(inputText.toLowerCase());
  };

  // Copy formatted text to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
      toast({
        title: "Text copied!",
        description: "Formatted text has been copied to clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true); // Start uploading state
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
        setIsUploading(false); // End uploading state
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box p={6} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        mb={6}
        textTransform="uppercase"
      >
        Text Formatter
      </Heading>
      <VStack spacing={6} align="stretch">
        {/* Text Input Area */}
        <Textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter text here"
          rows={8}
          borderColor="teal.300"
          _focus={{ borderColor: "teal.500" }}
          resize="vertical"
        />

        {/* Text Manipulation Buttons */}
        <HStack spacing={4} width="100%" align="stretch">
          <Button
            onClick={handleRemoveExtraSpaces}
            colorScheme="blue"
            size="lg"
            variant="solid"
          >
            Remove Extra Spaces
          </Button>
          <Button
            onClick={handleCapitalizeText}
            colorScheme="blue"
            size="lg"
            variant="solid"
          >
            Capitalize Text
          </Button>
          <Button
            onClick={handleToUppercase}
            colorScheme="blue"
            size="lg"
            variant="solid"
          >
            Convert to Uppercase
          </Button>
          <Button
            onClick={handleToLowercase}
            colorScheme="blue"
            size="lg"
            variant="solid"
          >
            Convert to Lowercase
          </Button>
          <IconButton
            aria-label="Copy to clipboard"
            icon={<FaCopy />}
            onClick={handleCopyToClipboard}
            colorScheme="green"
            size="lg"
          />
          <IconButton
            aria-label="Download as .txt"
            icon={<FaDownload />}
            onClick={() =>
              downloadTextFile(formattedText, "formatted-text.txt")
            }
            colorScheme="teal"
            size="lg"
          />
          <IconButton
            aria-label="Upload .txt File"
            icon={<FaUpload />}
            onClick={() => fileInputRef.current?.click()}
            colorScheme="orange"
            size="lg"
          />
        </HStack>

        {/* Output Area */}
        <Box
          mt={4}
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.100"
          maxH={'250px'} overflowY="auto"
        >
          <Text fontSize="sm" wordBreak="break-word" whiteSpace="pre-wrap">
            {formattedText || "Formatted text will appear here"}
          </Text>
        </Box>

        {/* File Actions and Copy/Download/Upload */}

        {/* Hidden file input for uploading files */}
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".txt"
          display="none"
        />

        {/* Spinner for file upload */}
        {isUploading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Spinner size="lg" color="teal.500" />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TextFormatter;

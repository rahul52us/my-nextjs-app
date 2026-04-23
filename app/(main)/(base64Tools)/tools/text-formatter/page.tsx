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
  Wrap,
  WrapItem,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FaCopy, FaDownload, FaUpload } from "react-icons/fa";
import stores from "../../../../store/stores";

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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleRemoveExtraSpaces = () => {
    setFormattedText(inputText.replace(/\s+/g, " ").trim());
  };

  const handleCapitalizeText = () => {
    setFormattedText(inputText.replace(/\b\w/g, (char) => char.toUpperCase()));
  };

  const handleToUppercase = () => {
    setFormattedText(inputText.toUpperCase());
  };

  const handleToLowercase = () => {
    setFormattedText(inputText.toLowerCase());
  };

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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
        setIsUploading(false);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box p={6} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
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

        {/* ✅ FIX: Wrap ki jagah HStack nahi — buttons wrap honge mobile pe */}
        <Wrap spacing={3} width="100%">
          <WrapItem flex={{ base: "1 1 100%", md: "1" }}>
            <Button
              onClick={handleRemoveExtraSpaces}
              colorScheme="blue"
              size="lg"
              variant="solid"
              width="100%"
            >
              Remove Extra Spaces
            </Button>
          </WrapItem>

          <WrapItem flex={{ base: "1 1 100%", md: "1" }}>
            <Button
              onClick={handleCapitalizeText}
              colorScheme="blue"
              size="lg"
              variant="solid"
              width="100%"
            >
              Capitalize Text
            </Button>
          </WrapItem>

          <WrapItem flex={{ base: "1 1 100%", md: "1" }}>
            <Button
              onClick={handleToUppercase}
              colorScheme="blue"
              size="lg"
              variant="solid"
              width="100%"
            >
              Convert to Uppercase
            </Button>
          </WrapItem>

          <WrapItem flex={{ base: "1 1 100%", md: "1" }}>
            <Button
              onClick={handleToLowercase}
              colorScheme="blue"
              size="lg"
              variant="solid"
              width="100%"
            >
              Convert to Lowercase
            </Button>
          </WrapItem>

          {/* Icon Buttons — ek saath grouped */}
          <WrapItem>
            <HStack spacing={3}>
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
          </WrapItem>
        </Wrap>

        {/* Output Area */}
        <Box
          mt={4}
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.100"
          maxH="250px"
          overflowY="auto"
        >
          <Text fontSize="sm" wordBreak="break-word" whiteSpace="pre-wrap">
            {formattedText || "Formatted text will appear here"}
          </Text>
        </Box>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".txt"
          display="none"
        />

        {/* Upload spinner */}
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

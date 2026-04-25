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
  HStack,
  Stack,
} from "@chakra-ui/react";
import { FaTextHeight, FaTrashAlt, FaCopy } from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../store/stores";

const toTitleCase = (text: string) =>
  text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const toSentenceCase = (text: string) =>
  text
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);

const toToggleCase = (text: string) =>
  text
    .split("")
    .map((char) => (char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase()))
    .join("");

const TextCaseConverterContent: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleTransform = (mode: string) => {
    if (!inputText.trim()) {
      setErrorMessage("Please enter text to convert.");
      return;
    }
    setErrorMessage("");
    let transformed = "";

    switch (mode) {
      case "upper":
        transformed = inputText.toUpperCase();
        break;
      case "lower":
        transformed = inputText.toLowerCase();
        break;
      case "title":
        transformed = toTitleCase(inputText);
        break;
      case "sentence":
        transformed = toSentenceCase(inputText);
        break;
      case "toggle":
        transformed = toToggleCase(inputText);
        break;
      default:
        transformed = inputText;
    }

    setOutputText(transformed);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setErrorMessage("");
  };

  const handleCopy = (value: string, label: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(
      () => {
        toast({
          title: `${label} copied!`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      () => {
        toast({
          title: "Copy failed",
          description: "Could not copy text.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    );
  };

  const handleDownload = () => {
    const blob = new Blob([outputText || inputText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "text-case-conversion.txt");
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        Text Case Converter
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter text to convert
          </FormLabel>
          <Textarea
            placeholder="Type or paste text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
            rows={8}
            rounded="md"
          />
        </FormControl>

        <Stack spacing={3} direction={["column", "row"]} flexWrap="wrap">
          <Button colorScheme="teal" onClick={() => handleTransform("upper")}>Uppercase</Button>
          <Button colorScheme="teal" onClick={() => handleTransform("lower")}>Lowercase</Button>
          <Button colorScheme="teal" onClick={() => handleTransform("title")}>Title Case</Button>
          <Button colorScheme="teal" onClick={() => handleTransform("sentence")}>Sentence Case</Button>
          <Button colorScheme="teal" onClick={() => handleTransform("toggle")}>Toggle Case</Button>
          <Button colorScheme="red" onClick={handleClear}>Clear</Button>
        </Stack>

        {errorMessage && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text color="red.600" fontWeight="semibold">
              {errorMessage}
            </Text>
          </Box>
        )}

        <Divider borderColor="teal.500" />

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Converted Text
          </FormLabel>
          <Textarea
            placeholder="Converted text appears here..."
            value={outputText}
            readOnly
            bg={useColorModeValue("gray.200", "gray.700")}
            rows={10}
          />
        </FormControl>

        <HStack spacing={4} flexWrap="wrap">
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaCopy} />}
            onClick={() => handleCopy(outputText || inputText, "Text")}
            isDisabled={!outputText && !inputText}
          >
            Copy Text
          </Button>
          <Button colorScheme="green" onClick={handleDownload} isDisabled={!outputText && !inputText}>
            Download Text
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TextCaseConverterContent;

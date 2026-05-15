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
  Spinner,
  Input,
} from "@chakra-ui/react";
import {
  FaExchangeAlt,
  FaTrashAlt,
  FaShareAlt,
  FaCopy,
  FaFileAlt,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../../store/stores";

const HexToBinaryContent: React.FC = () => {
  const [hexInput, setHexInput] = useState<string>("");
  const [binaryOutput, setBinaryOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const convertHexToBinary = (hex: string): string => {
    try {
      const cleanHex = hex.replace(/\s/g, "").toUpperCase();
      if (!/^[0-9A-F]*$/.test(cleanHex)) {
        return "Invalid hexadecimal input";
      }
      return cleanHex
        .split("")
        .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
        .join(" ");
    } catch {
      return "Invalid input";
    }
  };

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleConversion = () => {
    setLoading(true);
    setBinaryOutput("");
    const output = convertHexToBinary(hexInput);
    setBinaryOutput(output);
    setLoading(false);
  };

  const handleClear = () => {
    setHexInput("");
    setBinaryOutput("");
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "The output has been copied successfully.",
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

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "output.txt");
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result?.toString();
      if (content) {
        setHexInput(content);
        toast({
          title: "File uploaded successfully!",
          description: "Hex content loaded from the file.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "File upload failed",
        description: "Unable to read the file. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };

    reader.readAsText(file);
  };

  const handleShare = async () => {
    const blob = new Blob([binaryOutput], { type: "text/plain" });
    const file = new File([blob], "output.txt", { type: "text/plain" });

    if (navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Binary Data",
            files: [file],
          });
          toast({
            title: "Shared Successfully",
            description:
              "The formatted output was shared successfully as a file.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Sharing Not Supported",
            description: "This device/browser does not support file sharing.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        console.error("Error sharing the file:", error);
        toast({
          title: "Share Failed",
          description: error?.message || "There was an issue sharing the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Share Unavailable",
        description: "Sharing is not supported on this device/browser.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
        Hex to Binary
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter Hexadecimal
          </FormLabel>
          <Textarea
            placeholder="Paste your hexadecimal value here (e.g., 1A2B3C)"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            size="lg"
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
            rows={5}
            rounded="md"
            fontFamily="'Courier New', monospace"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Upload Hex File
          </FormLabel>

          <Box
            as="label"
            htmlFor="file-upload"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={6}
            border="2px dashed"
            borderColor={useColorModeValue("blue.300", "blue.500")}
            borderRadius="xl"
            bg={useColorModeValue("blue.50", "gray.700")}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "blue.500",
              bg: useColorModeValue("blue.100", "gray.600"),
            }}
          >
            <Icon as={FaFileAlt} boxSize={8} color="blue.400" />
            <Text
              fontWeight="semibold"
              color={useColorModeValue("gray.700", "gray.200")}
            >
              Click to upload or drag & drop
            </Text>
            <Text fontSize="sm" color="gray.400">
              .txt files only
            </Text>
            <Input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              display="none"
            />
          </Box>
        </FormControl>

        <HStack spacing={4} justify="space-between">
          <Button
            colorScheme="teal"
            size="lg"
            leftIcon={<Icon as={FaExchangeAlt} />}
            onClick={handleConversion}
          >
            Convert to Binary
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            display={hexInput?.trim() ? undefined : "none"}
            leftIcon={<Icon as={FaTrashAlt} />}
            onClick={handleClear}
          >
            Clear Input
          </Button>
        </HStack>

        <Divider borderColor="teal.500" />

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Binary Output
          </Text>
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
              binaryOutput || "Your converted hex will appear here."
            )}
          </Box>
          {binaryOutput && (
            <HStack spacing={4} align="stretch">
              <Button
                colorScheme="blue"
                size="sm"
                leftIcon={<Icon as={FaCopy} />}
                onClick={() => handleCopyToClipboard(binaryOutput)}
              >
                Copy to Clipboard
              </Button>

              <Button
                colorScheme="green"
                size="sm"
                onClick={() => handleDownload(binaryOutput)}
              >
                Download Output
              </Button>

              <Button
                colorScheme="teal"
                size="sm"
                leftIcon={<Icon as={FaShareAlt} />}
                onClick={handleShare}
              >
                Share Result
              </Button>
            </HStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default HexToBinaryContent;

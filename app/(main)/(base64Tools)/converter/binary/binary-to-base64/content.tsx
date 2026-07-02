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

const BinaryToBase64Content: React.FC = () => {
  const [binaryInput, setBinaryInput] = useState<string>("");
  const [base64Output, setBase64Output] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const convertBinaryToBase64 = (binary: string): string => {
    try {
      const cleanBinary = binary.replace(/\s/g, "");
      if (!/^[01]*$/.test(cleanBinary)) {
        return "Invalid binary input. Only 0s and 1s allowed.";
      }
      const bytes: number[] = [];
      for (let i = 0; i < cleanBinary.length; i += 8) {
        bytes.push(parseInt(cleanBinary.substr(i, 8), 2));
      }
      const buffer = Buffer.from(bytes);
      return buffer.toString("base64");
    } catch {
      return "Invalid binary input";
    }
  };

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleConversion = () => {
    setLoading(true);
    setBase64Output("");
    const output = convertBinaryToBase64(binaryInput);
    setBase64Output(output);
    setLoading(false);
  };

  const handleClear = () => {
    setBinaryInput("");
    setBase64Output("");
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
        setBinaryInput(content);
        toast({
          title: "File uploaded successfully!",
          description: "Binary content loaded from the file.",
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
    const blob = new Blob([base64Output], { type: "text/plain" });
    const file = new File([blob], "output.txt", { type: "text/plain" });

    if (navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Base64 Data",
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
        Binary to Base64
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter Binary String
          </FormLabel>
          <Textarea
            placeholder="Paste your binary string here (space-separated bytes recommended)"
            value={binaryInput}
            onChange={(e) => setBinaryInput(e.target.value)}
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
            Upload Binary File
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
            borderColor={useColorModeValue("brand.300", "brand.500")}
            borderRadius="xl"
            bg={useColorModeValue("brand.50", "gray.700")}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "brand.500",
              bg: useColorModeValue("brand.100", "gray.600"),
            }}
          >
            <Icon as={FaFileAlt} boxSize={8} color="brand.400" />
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
            Convert to Base64
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            display={binaryInput?.trim() ? undefined : "none"}
            leftIcon={<Icon as={FaTrashAlt} />}
            onClick={handleClear}
          >
            Clear Input
          </Button>
        </HStack>

        <Divider borderColor="teal.500" />

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Base64 Output
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
              base64Output || "Your converted binary will appear here."
            )}
          </Box>
          {base64Output && (
            <HStack spacing={4} align="stretch">
              <Button
                colorScheme="brand"
                size="sm"
                leftIcon={<Icon as={FaCopy} />}
                onClick={() => handleCopyToClipboard(base64Output)}
              >
                Copy to Clipboard
              </Button>

              <Button
                colorScheme="green"
                size="sm"
                onClick={() => handleDownload(base64Output)}
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

export default BinaryToBase64Content;

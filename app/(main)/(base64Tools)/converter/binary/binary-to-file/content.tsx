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
  FaDownload,
} from "react-icons/fa";
import stores from "../../../../../store/stores";

const BinaryToFileContent: React.FC = () => {
  const [binaryInput, setBinaryInput] = useState<string>("");
  const [fileName, setFileName] = useState<string>("output.bin");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const convertBinaryToFile = (binary: string, fileName: string) => {
    try {
      const cleanBinary = binary.replace(/\s/g, "");
      if (!/^[01]*$/.test(cleanBinary)) {
        toast({
          title: "Invalid binary input",
          description: "Only 0s and 1s allowed.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const bytes: number[] = [];
      for (let i = 0; i < cleanBinary.length; i += 8) {
        bytes.push(parseInt(cleanBinary.substr(i, 8), 2));
      }

      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download successful!",
        description: `File ${fileName} has been downloaded.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Error converting binary to file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleConversion = () => {
    setLoading(true);
    convertBinaryToFile(binaryInput, fileName);
    setLoading(false);
  };

  const handleClear = () => {
    setBinaryInput("");
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
        Binary to File
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
            Output Filename
          </FormLabel>
          <Input
            placeholder="Enter filename (e.g., output.bin)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            size="lg"
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
            rounded="md"
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
            leftIcon={<Icon as={FaDownload} />}
            onClick={handleConversion}
            isLoading={loading}
          >
            Download as File
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
            ℹ️ Information
          </Text>
          <Box
            p={4}
            bg={useColorModeValue("brand.50", "gray.700")}
            borderRadius="md"
            border="1px solid"
            borderColor={useColorModeValue("brand.200", "brand.600")}
          >
            <Text fontSize="sm" color={textColor}>
              This tool converts binary strings to binary files. Your binary data
              will be downloaded as a file with the specified filename. Every 8
              binary digits (bits) will be converted to 1 byte.
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default BinaryToFileContent;

"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  useToast,
  VStack,
  useColorModeValue,
  Heading,
  Flex,
} from "@chakra-ui/react";
import * as Terser from "terser";

const FileUploaderAndEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState<string>(""); // User-provided code
  const [output, setOutput] = useState<string>(""); // Minified result
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.900", "gray.100");

  const toast = useToast();

  // Minify JavaScript using Terser
  const minifyJS = async (code: string): Promise<string> => {
    try {
      const result = await Terser.minify(code);
      return result.code || code;
    } catch (err) {
      console.error("JavaScript minification error:", err);
      return code; // Return original code on error
    }
  };

  // Simple CSS minification logic
  const minifyCSS = (code: string): string => {
    try {
      return code
        .replace(/\s+/g, " ") // Remove extra whitespace
        .replace(/\/\*.*?\*\//g, "") // Remove comments
        .trim();
    } catch (err) {
      console.error("CSS minification error:", err);
      return code;
    }
  };

  // Simple HTML minification logic
  const minifyHTML = (code: string): string => {
    try {
      return code
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    } catch (err) {
      console.error("HTML minification error:", err);
      return code;
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files ? e.target.files[0] : null;
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setCode(reader.result as string);
      };
      reader.readAsText(uploadedFile);
    }
  };

  // Minify code based on file type
  const handleProcessCode = async () => {
    if (!code) {
      toast({
        title: "No code to process!",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    let minifiedCode = code;

    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".js")) {
        minifiedCode = await minifyJS(code);
      } else if (fileName.endsWith(".css")) {
        minifiedCode = minifyCSS(code);
      } else if (fileName.endsWith(".html")) {
        minifiedCode = minifyHTML(code);
      } else {
        toast({
          title: "Unsupported file type!",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
    }

    setOutput(minifiedCode);
    toast({
      title: "Code processed successfully!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Download the processed code
  const downloadMinifiedCode = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    const extension = file ? file.name.split(".").pop() : "txt";
    link.href = URL.createObjectURL(blob);
    link.download = `minifiedCode.${extension}`;
    link.click();
  };

  // Copy the output to the clipboard
  const copyToClipboard = () => {
    const textarea = document.createElement("textarea");
    textarea.value = output;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    toast({
      title: "Output copied to clipboard!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} bg={bgColor} color={textColor}>
      <VStack spacing={6} align="stretch">
        <Heading
          as="h1"
          size="xl"
          color="teal.500"
          textAlign="center"
          fontWeight="bold"
          mb={6}
          textTransform="uppercase"
        >
          Code Minifier
        </Heading>

        {/* File Upload */}
        <Input
          type="file"
          accept=".js, .css, .html"
          onChange={handleFileChange}
          bg="gray.50"
          borderColor="gray.300"
          _hover={{ borderColor: "teal.400" }}
          focusBorderColor="teal.500"
          size="lg"
        />

        {/* Code Editor */}
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter or paste your code here"
          size="lg"
          minH="200px"
          bg="gray.50"
          borderColor="gray.300"
          _hover={{ borderColor: "teal.400" }}
          focusBorderColor="teal.500"
        />

        {/* Process Button */}
        <Button colorScheme="teal" onClick={handleProcessCode} size="lg">
          Process Code
        </Button>

        {/* Output Display */}
        {output && (
          <Box
            p={4}
            bg="gray.100"
            borderRadius="md"
            borderWidth="1px"
            fontSize="sm"
            maxH="250px"
            overflowY="auto"
          >
            <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
          </Box>
        )}

        {/* Copy and Download Buttons */}
        {output && (
          <Flex gap={4}>
            <Button colorScheme="blue" onClick={copyToClipboard} size="lg">
              Copy Output
            </Button>
            <Button colorScheme="blue" onClick={downloadMinifiedCode} size="lg">
              Download Minified Code
            </Button>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default FileUploaderAndEditor;

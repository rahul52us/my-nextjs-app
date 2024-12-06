'use client';

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
  Spinner,
  useColorModeValue,
  Grid,
  VStack,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormLabel,
  HStack,
  IconButton,
  Text,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import JSON5 from "json5";
import { FaAdjust } from "react-icons/fa";

// Dynamically import ReactJson to ensure it's only used on the client-side (not server-side)
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const JsonFormatter = () => {
  const [rawJson, setRawJson] = useState("");
  const [formattedJson, setFormattedJson] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [fontSize, setFontSize] = useState(14); // Initial font size
  const [jsonTheme, setJsonTheme] = useState<any>("rjv-default"); // Initial theme
  const [file, setFile] = useState<File | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const buttonColor = useColorModeValue("teal", "blue");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  const handleJsonInput = (value: string) => {
    setRawJson(value);
  };

  const handleFormatJson = useCallback(() => {
    setLoading(true);
    try {
      const trimmedJson = rawJson.trim();
      console.log("Raw JSON after trimming:", trimmedJson);  // Debugging output

      // Use JSON5 to parse relaxed JSON
      const parsedJson = JSON5.parse(trimmedJson);
      console.log("Parsed JSON:", parsedJson);  // Debugging output

      setFormattedJson(parsedJson);
      setError(null);
    } catch (err: any) {
      // Enhanced error handling
      setFormattedJson(null);
      console.error("Error parsing JSON:", err);  // Debugging output
      setError(`Invalid JSON format! Please check the input. ${err.message}`);
    }
    setLoading(false);
  }, [rawJson]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const fileContent = reader.result as string;
          setRawJson(fileContent);
          setFile(file);
          onClose(); // Close the modal after successful file upload
        } catch (err) {
          setError("Failed to read the file.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please upload a valid JSON file.");
    }
  };

  useEffect(() => {
    if (rawJson) {
      handleFormatJson(); // Format the JSON when rawJson changes
    }
  }, [rawJson, handleFormatJson]);

  if (!isClient) {
    return (
      <Flex
        justify="center"
        align="center"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={10}
        width="100%"
        height="100%"
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={1} bg={bgColor} color={textColor} minH="80vh">
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={4}>
        JSON Formatter & Validator
      </Heading>

      <VStack spacing={4} align="stretch">
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={4}
          autoRows="minmax(300px, auto)"
        >
          {/* Monaco Editor */}
          <Box
            borderRadius="md"
            overflow="hidden"
            bg={cardBgColor}
            boxShadow="lg"
            height="100%"
            p={4}
            _hover={{ boxShadow: "xl" }}
          >
            <Editor
              height="410px"
              language="json"
              theme={useColorModeValue("vs-light", "vs-dark")}
              value={rawJson}
              onChange={(value) => handleJsonInput(value || "")}
              options={{
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </Box>

          {/* Formatted JSON Result */}
          <Box
            borderRadius="md"
            overflow="hidden"
            bg={cardBgColor}
            boxShadow="lg"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            p={4}
            _hover={{ boxShadow: "xl" }}
          >
            {error && (
              <Alert status="error" mt={4} borderRadius="md">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Formatted JSON View */}
            {formattedJson && !error && (
              <Box
                flex="1"
                p={2}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
                overflow="auto"
                height="400px"
              >
                <HStack justify="space-between" mb={2} align="center">
                  {/* Font Size Slider and Text */}
                  <HStack spacing={2} align="center">
                    <Slider
                      aria-label="font-size-slider"
                      min={10}
                      max={24}
                      value={fontSize}
                      onChange={(value) => setFontSize(value)}
                      size="sm"
                      width="150px" // Limit width for better spacing
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text fontSize="sm">Size: {fontSize}px</Text>
                  </HStack>

                  {/* Theme Toggle Icon */}
                  <IconButton
                    aria-label="Toggle Theme"
                    icon={<FaAdjust />}
                    onClick={() =>
                      setJsonTheme(jsonTheme === "rjv-default" ? "monokai" : "rjv-default")
                    }
                    variant="ghost"
                    size="sm"
                  />
                </HStack>

                {/* ReactJson Component */}
                <ReactJson
                  src={formattedJson}
                  theme={jsonTheme}
                  displayDataTypes={false}
                  collapsed={false}
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    maxHeight: "410px",
                    overflowY: "auto",
                    fontSize: `${fontSize}px`,
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Upload JSON Button */}
        <Flex gap={4}>
        <Button
          onClick={onOpen}
          colorScheme={buttonColor}
          width="full"
          borderRadius="md"
          _hover={{ bg: `${buttonColor}.600` }}
        >
          Upload JSON
        </Button>

        {/* Format Button */}
        <Button
          onClick={handleFormatJson}
          colorScheme={buttonColor}
          width="full"
          isLoading={loading}
          loadingText="Formatting"
          spinnerPlacement="start"
          borderRadius="md"
          _hover={{ bg: `${buttonColor}.600` }}
        >
          Format & Validate JSON
        </Button>
        </Flex>
      </VStack>

      {/* Modal for Uploading JSON File */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload JSON File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormLabel htmlFor="file-upload">Choose a JSON File</FormLabel>
              <Input
                type="file"
                id="file-upload"
                accept=".json"
                onChange={handleFileUpload}
                borderRadius="md"
              />
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Upload Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JsonFormatter;

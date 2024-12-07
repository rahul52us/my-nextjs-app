"use client";

import React, { useState } from "react";
import { js as beautifyJs } from "js-beautify";
import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Select,
  useColorModeValue,
  useToast,
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

const CodeFormatter = () => {
  const [code, setCode] = useState<string>(""); // Original code
  const [formattedCode, setFormattedCode] = useState<string>(""); // Formatted code
  const [language, setLanguage] = useState<"javascript" | "json">("javascript"); // Language selection
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const sectionBg = useColorModeValue("white", "gray.700");
  const sectionBorder = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const buttonHoverColor = useColorModeValue("teal.500", "teal.300");

  // Handle changes in the editor
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        // Set language based on file type
        if (file.name.endsWith(".json")) {
          setLanguage("json");
        } else {
          setLanguage("javascript");
        }
      };
      reader.readAsText(file);
      onClose(); // Close the modal after file upload
    }
  };

  // Format the code
  const handleFormat = () => {
    try {
      let formatted = "";
      if (language === "javascript") {
        formatted = beautifyJs(code, {
          indent_size: 2,
          space_in_empty_paren: true,
        });
      } else if (language === "json") {
        formatted = JSON.stringify(JSON.parse(code), null, 2);
      }
      setFormattedCode(formatted);
      toast({
        title: "Code formatted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.log(err)
      toast({
        title: "Error formatting code!",
        description: "Ensure your code is valid before formatting.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Download formatted code
  const handleDownload = () => {
    const blob = new Blob([formattedCode], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `formatted-code.${language === "javascript" ? "js" : "json"}`;
    link.click();
  };

  return (
    <Box bg={bgColor} color={textColor} minH="80vh" py={3}>
      {/* Header */}
      <Container maxW="container.xl" mb={8}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading
            as="h1"
            size="xl"
            bgGradient="linear(to-r, teal.400, blue.500)"
            bgClip="text"
          >
            Code Formatter
          </Heading>
          <Select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "javascript" | "json")
            }
            width="200px"
            borderColor="teal.400"
            focusBorderColor="teal.500"
            bg={sectionBg}
            shadow="sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="json">JSON</option>
          </Select>
        </Flex>
      </Container>

      {/* Editors */}
      <Container maxW="container.xl">
        <Grid templateColumns={["1fr", null, "repeat(2, 1fr)"]} gap={6}>
          {/* Input Code Editor */}
          <GridItem>
            <Box
              bg={sectionBg}
              borderRadius="lg"
              border="1px"
              borderColor={sectionBorder}
              shadow="md"
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                bg={useColorModeValue("gray.100", "gray.600")}
                borderRadius="lg"
                px={4}
                py={2}
              >
                <Heading as="h2" size="sm">
                  Input Code
                </Heading>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => setCode("")}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                      toast({
                        title: "Input Code copied to clipboard!",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                  >
                    Copy
                  </Button>
                </Flex>
              </Flex>
              <Editor
                height="400px"
                language={language}
                theme={useColorModeValue("vs-light", "vs-dark")}
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </Box>
          </GridItem>

          {/* Formatted Code Editor */}
          <GridItem>
            <Box
              bg={sectionBg}
              borderRadius="lg"
              border="1px"
              borderColor={sectionBorder}
              shadow="md"
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                bg={useColorModeValue("gray.100", "gray.600")}
                borderRadius="lg"
                px={4}
                py={2}
              >
                <Heading as="h2" size="sm">
                  Formatted Code
                </Heading>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => setFormattedCode("")}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      navigator.clipboard.writeText(formattedCode);
                      toast({
                        title: "Formatted Code copied to clipboard!",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                  >
                    Copy
                  </Button>
                </Flex>
              </Flex>
              <Editor
                height="400px"
                language={language}
                theme={useColorModeValue("vs-light", "vs-dark")}
                value={formattedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* Action Buttons */}
      <Container maxW="container.xl" mt={8}>
        <Flex justifyContent="center" gap={4}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleFormat}
            _hover={{ bg: buttonHoverColor }}
            shadow="md"
          >
            Format Code
          </Button>
          {formattedCode && (
            <Button
              colorScheme="green"
              size="lg"
              onClick={handleDownload}
              _hover={{ bg: buttonHoverColor }}
              shadow="md"
            >
              Download Formatted Code
            </Button>
          )}
          <Button colorScheme="teal" size="lg" onClick={onOpen}>
            Upload Code File
          </Button>
        </Flex>
        <Flex justifyContent="center" mt={8}></Flex>
      </Container>

      {/* Modal for File Upload */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Code File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="file"
              accept=".js,.json"
              onChange={handleFileUpload}
              borderColor="teal.400"
              focusBorderColor="teal.500"
              bg={sectionBg}
              shadow="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CodeFormatter;
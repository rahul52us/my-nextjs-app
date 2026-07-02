"use client";

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
    VisuallyHiddenInput,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import JSON5 from "json5";

// Dynamically import ReactJson to ensure it's only used on the client-side (not server-side)
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const JsonFormatterContent = () => {
    const [rawJson, setRawJson] = useState("");
    const [formattedJson, setFormattedJson] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [fontSize, setFontSize] = useState(14); // Initial font size
    const [file, setFile] = useState<File | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bgColor = "transparent";
    const textColor = useColorModeValue("gray.800", "gray.100");
    const cardBgColor = useColorModeValue("white", "gray.800");
    const cardBorderColor = useColorModeValue("gray.200", "gray.700");
    const mutedTextColor = useColorModeValue("gray.600", "gray.400");
    const outputBgColor = useColorModeValue("gray.50", "gray.900");
    const outputBorderColor = useColorModeValue("gray.200", "gray.600");
    const modalBgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("white", "gray.700");
    const inputBorderColor = useColorModeValue("gray.200", "gray.600");
    const fileInputBgColor = useColorModeValue("gray.50", "gray.700");
    const fileInputHoverBgColor = useColorModeValue("brand.50", "gray.600");
    const editorTheme = useColorModeValue("vs-light", "vs-dark");
    const jsonTheme = useColorModeValue("rjv-default", "monokai");
    const primaryColor = "#007ACC";
    const primaryHoverColor = "#006bb3";

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
            console.log(err)
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
                    console.log(err)
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
            <Heading as="h1" size="xl" color={primaryColor} textAlign="center" mb={4}>
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
                        border="1px solid"
                        borderColor={cardBorderColor}
                        boxShadow="lg"
                        height="100%"
                        p={4}
                        _hover={{ boxShadow: "xl" }}
                    >
                        <Editor
                            height="410px"
                            language="json"
                            theme={editorTheme}
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
                        border="1px solid"
                        borderColor={cardBorderColor}
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
                                borderColor={outputBorderColor}
                                borderRadius="md"
                                bg={outputBgColor}
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
                                                <SliderFilledTrack bg={primaryColor} />
                                            </SliderTrack>
                                            <SliderThumb bg={primaryColor} />
                                        </Slider>
                                        <Text fontSize="sm" color={mutedTextColor}>Size: {fontSize}px</Text>
                                    </HStack>
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
                        bg={primaryColor}
                        color="white"
                        width="full"
                        borderRadius="md"
                        _hover={{ bg: primaryHoverColor }}
                        _active={{ bg: primaryHoverColor }}
                        _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                    >
                        Upload JSON File
                    </Button>

                    {/* Format Button */}
                    <Button
                        onClick={handleFormatJson}
                        bg={primaryColor}
                        color="white"
                        width="full"
                        isLoading={loading}
                        loadingText="Formatting"
                        spinnerPlacement="start"
                        borderRadius="md"
                        _hover={{ bg: primaryHoverColor }}
                        _active={{ bg: primaryHoverColor }}
                        _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                    >
                        Format & Validate JSON
                    </Button>
                </Flex>
            </VStack>

            {/* Modal for Uploading JSON File */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(3px)" />
                <ModalContent bg={modalBgColor} color={textColor} border="1px solid" borderColor={cardBorderColor} borderRadius="xl" overflow="hidden">
                    <ModalHeader color={textColor} borderBottom="1px solid" borderColor={cardBorderColor}>
                        Upload JSON File
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <FormLabel htmlFor="file-upload" color={mutedTextColor}>Choose a JSON File</FormLabel>
                            <Box
                                as="label"
                                htmlFor="file-upload"
                                cursor="pointer"
                                border="1px dashed"
                                borderColor={inputBorderColor}
                                bg={fileInputBgColor}
                                borderRadius="lg"
                                px={4}
                                py={5}
                                textAlign="center"
                                transition="all 0.2s"
                                _hover={{ borderColor: primaryColor, bg: fileInputHoverBgColor }}
                            >
                                <Text fontWeight="semibold" color={textColor}>
                                    {file ? file.name : "Click to choose a .json file"}
                                </Text>
                                <Text mt={1} fontSize="sm" color={mutedTextColor}>
                                    JSON files only
                                </Text>
                                <VisuallyHiddenInput
                                    type="file"
                                    id="file-upload"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                />
                            </Box>
                            {error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle>Upload Error!</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={cardBorderColor}>
                        <Button bg={primaryColor} color="white" _hover={{ bg: primaryHoverColor }} onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default JsonFormatterContent;

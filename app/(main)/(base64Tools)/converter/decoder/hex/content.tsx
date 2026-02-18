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
} from "@chakra-ui/react";
import { FaExchangeAlt, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";

const Base64ToHexContent: React.FC = () => {
    const [base64Input, setBase64Input] = useState<string>("");
    const [hexOutput, setHexOutput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // Track loading state
    const toast = useToast();

    const bgColor = useColorModeValue("gray.100", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");

    // Function to convert Base64 to Hex
    const convertBase64ToHex = (base64: string): string => {
        try {
            const buffer = Buffer.from(base64, "base64");
            return buffer.toString("hex");
        } catch {
            return "Invalid Base64 string";
        }
    };

    const handleConversion = () => {
        setLoading(true); // Set loading to true when starting conversion
        setHexOutput(""); // Clear previous hex output before converting

        // Simulate a delay for conversion (for demonstration purposes)
        setTimeout(() => {
            setHexOutput(convertBase64ToHex(base64Input));
            setLoading(false); // Set loading to false once conversion is complete
        }, 1000); // Simulate a 1-second delay for conversion
    };

    // Function to copy the output to clipboard
    const handleCopyToClipboard = (output: string) => {
        navigator.clipboard
            .writeText(output)
            .then(() => {
                toast({
                    title: "Copied to clipboard!",
                    description: "The hex output has been copied successfully.",
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

    const handleDownload = (output: string) => {
        const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "output.txt");
    };

    // Function to clear the input and output fields
    const handleClear = () => {
        setBase64Input("");
        setHexOutput("");
        setLoading(false); // Reset loading state when clearing
    };

    return (
        <Box p={4} bg={bgColor} color={textColor} borderRadius="md" boxShadow="lg">
            <Heading
                as="h1"
                size="xl"
                color="teal.500"
                textAlign="center"
                fontWeight="bold"
                letterSpacing="wider"
                lineHeight="short"
                mb={6}
                textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
                textTransform="uppercase"
                fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            >
                Base64 to Hex
            </Heading>

            <VStack spacing={6} align="stretch">
                {/* Base64 Input Section */}
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Enter Base64 String
                    </FormLabel>
                    <Textarea
                        placeholder="Paste your Base64 encoded text here"
                        value={base64Input}
                        onChange={(e) => setBase64Input(e.target.value)}
                        size="lg"
                        bg={useColorModeValue("white", "gray.700")}
                        _focus={{ borderColor: "teal.500" }}
                        rows={5}
                        rounded="md"
                        fontFamily="'Courier New', monospace"
                    />
                </FormControl>

                {/* Conversion and Clear Buttons */}
                <HStack spacing={4} justify="space-between">
                    <Button
                        colorScheme="teal"
                        size="lg"
                        leftIcon={<Icon as={FaExchangeAlt} />}
                        onClick={handleConversion}
                    >
                        Convert to Hex
                    </Button>

                    <Button
                        colorScheme="red"
                        size="lg"
                        display={base64Input?.trim() ? undefined : "none"}
                        leftIcon={<Icon as={FaTrashAlt} />}
                        onClick={handleClear}
                    >
                        Clear Input
                    </Button>
                </HStack>

                {/* Divider */}
                <Divider borderColor="teal.500" />

                {/* Hex Output Section */}
                <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={2}>
                        Hex Output
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
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : (
                            hexOutput || "Your converted hex will appear here."
                        )}
                    </Box>

                    {/* Action Buttons */}
                    {hexOutput ? (
                        <HStack spacing={4} align="stretch">
                            <Text
                                color="blue.500"
                                onClick={() => handleCopyToClipboard(hexOutput)}
                                cursor="pointer"
                                fontWeight="semibold"
                                textDecoration="underline"
                                fontSize="sm"
                            >
                                Copy to Clipboard
                            </Text>

                            <Text
                                color="green.500"
                                onClick={() => handleDownload(hexOutput)}
                                cursor="pointer"
                                fontWeight="semibold"
                                textDecoration="underline"
                                fontSize="sm"
                            >
                                Download Output
                            </Text>
                        </HStack>
                    ) : null}
                </Box>
                <Box mb={6}>
                    <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                        Instructions:
                    </Text>
                    <VStack align="stretch" spacing={3} mt={2}>
                        <Text fontSize="sm">
                            1. Paste your <strong>Base64 string</strong> into the provided input
                            field.
                        </Text>
                        <Text fontSize="sm">
                            2. Click <strong>"Convert to Hex"</strong> to convert the Base64 string.
                        </Text>
                        <Text fontSize="sm">
                            3. Optionally, click <strong>"Copy to Clipboard"</strong> to copy the
                            hex output or <strong>"Download Output"</strong> to save the result as a file.
                        </Text>
                        <Text fontSize="sm" color="red.500">
                            * Ensure the Base64 string starts with "data:" for accurate
                            conversion.
                        </Text>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default Base64ToHexContent;

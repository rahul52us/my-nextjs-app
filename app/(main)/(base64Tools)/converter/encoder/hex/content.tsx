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
import { FaExchangeAlt, FaTrashAlt, FaShareAlt, FaCopy } from "react-icons/fa";
import { saveAs } from "file-saver";

const HexToBase64Content: React.FC = () => {
    const [hexInput, setHexInput] = useState<string>("");
    const [base64Output, setBase64Output] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    const bgColor = useColorModeValue("gray.100", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");

    // Convert Hex to Base64
    const convertHexToBase64 = (hex: string): string => {
        try {
            // Clean up Hex input by removing spaces and newlines
            const cleanedHex = hex.replace(/[\s\n]/g, "");

            // Ensure the Hex string is even length (Hex pairs)
            if (cleanedHex.length % 2 !== 0) {
                throw new Error("Hex string must have an even length.");
            }

            // Convert Hex to Base64 using Buffer
            const buffer = Buffer.from(cleanedHex, "hex");
            return buffer.toString("base64");
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    };

    // Handle conversion when user clicks the button
    const handleConversion = () => {
        setLoading(true);
        setBase64Output("");
        const output = convertHexToBase64(hexInput);
        setBase64Output(output);
        setLoading(false);
    };

    // Handle file upload to load Hex from a file
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result?.toString();
            if (content) {
                setHexInput(content);
                toast({
                    title: "File uploaded successfully!",
                    description: "Hex string loaded from the file.",
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

    // Copy the output to clipboard
    const handleCopyToClipboard = () => {
        navigator.clipboard
            .writeText(base64Output)
            .then(() => {
                toast({
                    title: "Copied to clipboard!",
                    description: "The Base64 output has been copied successfully.",
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

    // Download the output as a text file
    const handleDownload = () => {
        const blob = new Blob([base64Output], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "base64_output.txt");
    };

    // Clear the input and output
    const handleClear = () => {
        setHexInput("");
        setBase64Output("");
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
                        description: "The formatted output was shared successfully as a file.",
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
                Hex to Base64
            </Heading>

            <VStack spacing={6} align="stretch">
                {/* Hex Input Section */}
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Enter Hex String
                    </FormLabel>
                    <Textarea
                        placeholder="Paste your Hex encoded text here"
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

                {/* File Upload Section */}
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Upload File with Hex Content
                    </FormLabel>
                    <Input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        size="lg"
                        bg={useColorModeValue("white", "gray.700")}
                        _hover={{ cursor: "pointer" }}
                    />
                </FormControl>

                {/* Action Buttons */}
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
                        display={hexInput?.trim() ? undefined : "none"}
                        leftIcon={<Icon as={FaTrashAlt} />}
                        onClick={handleClear}
                    >
                        Clear Input
                    </Button>
                </HStack>

                {/* Divider */}
                <Divider borderColor="teal.500" />

                {/* Output Section */}
                <Box>
                    <Flex justifyContent="space-between" mb={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                            Base64 Output
                        </Text>
                        {base64Output && (
                            <HStack spacing={4} align="stretch">
                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    leftIcon={<Icon as={FaCopy} />}
                                    onClick={handleCopyToClipboard}
                                >
                                    Copy to Clipboard
                                </Button>

                                <Button
                                    colorScheme="green"
                                    size="sm"
                                    onClick={handleDownload}
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
                    </Flex>

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
                            base64Output || "Your converted Base64 will appear here."
                        )}
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default HexToBase64Content;

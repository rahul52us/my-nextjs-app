"use client";

import React, { useState, useRef } from "react";
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
    Stack,
} from "@chakra-ui/react";
import {
    FaExchangeAlt,
    FaTrashAlt,
    FaShareAlt,
    FaCopy,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../../store/stores";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const Base64ToAsciiContent: React.FC = () => {
    const [base64Input, setBase64Input] = useState<string>("");
    const [asciiOutput, setAsciiOutput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);
    const dragCounter = useRef(0);
    const toast = useToast();
        const {
  themeStore: { themeConfig },
} = stores;
    const textColor = useColorModeValue("gray.800", "gray.100");

    // Dropzone theme tokens — same colorMode source as the rest of the box,
    // so the drag-active state stays correct in both light and dark mode.
    const dropzoneBorder = useColorModeValue("blue.300", "blue.500");
    const dropzoneBg = useColorModeValue("blue.50", "gray.700");
    const dropzoneHoverBg = useColorModeValue("blue.100", "gray.600");
    const dropzoneTextColor = useColorModeValue("gray.700", "gray.200");
    const dragActiveBg = useColorModeValue("blue.100", "gray.600");
    const dragActiveBorder = "blue.500";

    const isValidBase64 = (str: string): boolean => {
        try {
            return btoa(atob(str)) === str;
        } catch {
            return false;
        }
    };

    const convertBase64ToAscii = (base64: string): string => {
        try {
            const buffer = Buffer.from(base64, "base64");
            return buffer.toString("ascii");
        } catch {
            return "Invalid Base64 string";
        }
    };

    const handleConversion = () => {
        if (!isValidBase64(base64Input)) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid Base64 string.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setLoading(true);
        setAsciiOutput("");
        const output = convertBase64ToAscii(base64Input);
        setAsciiOutput(output);
        setLoading(false);
    };

    // Core reader — shared by both the <input> picker and drag-and-drop
    const readBase64File = (file: File) => {
        if (!file.name.toLowerCase().endsWith(".txt")) {
            toast({
                title: "Unsupported file type",
                description: "Only .txt files are supported.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 2MB.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result?.toString();
            if (content) {
                setBase64Input(content);
                toast({
                    title: "File uploaded successfully!",
                    description: "Base64 string loaded from the file.",
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        readBase64File(file);
        event.target.value = "";
    };

    // --- Drag and drop handlers ---
    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
            dragCounter.current += 1;
            setIsDragActive(true);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
            e.dataTransfer.dropEffect = "copy";
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            readBase64File(file);
            e.dataTransfer.clearData();
        }
    };

    const handleShare = async () => {
        const blob = new Blob([asciiOutput], { type: "text/plain" });
        const file = new File([blob], "output.txt", { type: "text/plain" });

        if (navigator.share) {
            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "ASCII Data",
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

    const handleCopyToClipboard = () => {
        navigator.clipboard
            .writeText(asciiOutput)
            .then(() => {
                toast({
                    title: "Copied to clipboard!",
                    description: "The ASCII output has been copied successfully.",
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

    const handleDownload = () => {
        const blob = new Blob([asciiOutput], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "ascii_output.txt");
    };

    const handleClear = () => {
        setBase64Input("");
        setAsciiOutput("");
    };

    return (
        <Box p={4} bg="transparent" color={textColor}>
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
                Base64 to ASCII
            </Heading>

            <VStack spacing={6} align="stretch">
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Enter Base64 String
                    </FormLabel>
                    <Textarea
                        placeholder="Paste your Base64 encoded text here (e.g., aGVsbG8gd29ybGQ=)"
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

                <FormControl>
  <FormLabel fontSize="lg" fontWeight="semibold">
    Upload File with Base64 Content
  </FormLabel>

  <Box
    as="label"
    htmlFor="base64-file-upload"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap={2}
    p={6}
    border="2px dashed"
    borderColor={isDragActive ? dragActiveBorder : dropzoneBorder}
    borderRadius="xl"
    bg={isDragActive ? dragActiveBg : dropzoneBg}
    transform={isDragActive ? "scale(1.01)" : "scale(1)"}
    cursor="pointer"
    transition="all 0.2s"
    _hover={{
      borderColor: "blue.500",
      bg: dropzoneHoverBg,
    }}
    onDragEnter={handleDragEnter}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    <Icon as={FaExchangeAlt} boxSize={8} color={isDragActive ? "blue.500" : "blue.400"} />
    <Text fontWeight="semibold" color={dropzoneTextColor}>
      {isDragActive ? "Drop it here" : "Click to upload or drag & drop Base64 file"}
    </Text>
    <Text fontSize="sm" color="gray.400">
      .txt files only • Max 2MB
    </Text>
    <Input
      id="base64-file-upload"
      type="file"
      accept=".txt"
      onChange={handleFileUpload}
      display="none"
    />
  </Box>
</FormControl>

                <Stack spacing={4} direction={["column", "row"]} justify="space-between">
                    <Button
                        colorScheme="teal"
                        size="lg"
                        leftIcon={<Icon as={FaExchangeAlt} />}
                        onClick={handleConversion}
                    >
                        Convert to ASCII
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
                </Stack>

                <Divider borderColor="teal.500" />

                <Box>
                    <Flex justifyContent="space-between" mb={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                            ASCII Output
                        </Text>
                        {asciiOutput && (
                            <HStack spacing={4} align="stretch">
                                <Button
                                    colorScheme="brand"
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
                            asciiOutput || "Your converted text will appear here."
                        )}
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default Base64ToAsciiContent;
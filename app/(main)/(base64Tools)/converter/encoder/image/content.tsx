"use client";

import { useState, ChangeEvent } from "react";
import {
    Box,
    Button,
    Heading,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    useColorModeValue,
    useToast,
    HStack,
    Image,
    Text,
    SimpleGrid,
} from "@chakra-ui/react";
import { FaClipboard, FaDownload, FaTrashAlt, FaShareAlt } from "react-icons/fa";
import { saveAs } from "file-saver";

const ImageToBase64Content = () => {
    const [base64, setBase64] = useState<string>("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [format, setFormat] = useState<string>("dataUri");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const toast = useToast();
    const bgColor = useColorModeValue("gray.100", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload an image file.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const reader = new FileReader();
            setFileName(file.name);
            setFileType(file.type);

            reader.onload = () => {
                const result = reader.result as string;
                setBase64(result);
                setImagePreview(result);
                toast({
                    title: "Conversion Successful",
                    description: "Image has been converted to Base64.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            };

            reader.onerror = () => {
                toast({
                    title: "Error",
                    description: "Failed to read the file. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            };

            reader.readAsDataURL(file);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard
            .writeText(formattedOutput())
            .then(() => {
                toast({
                    title: "Copied to Clipboard",
                    description: "Formatted output copied successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            })
            .catch(() => {
                toast({
                    title: "Copy Failed",
                    description: "Failed to copy to clipboard.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            });
    };

    const handleDownload = () => {
        let blob;
        let fileExtension = "txt";

        switch (format) {
            case "plainText":
                blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
                fileExtension = "txt";
                break;
            case "dataUri":
                blob = new Blob([formattedOutput()], {
                    type: "text/plain;charset=utf-8",
                });
                fileExtension = "txt";
                break;
            case "htmlLink":
            case "imgTag":
            case "cssBg":
                blob = new Blob([formattedOutput()], {
                    type: "text/html;charset=utf-8",
                });
                fileExtension = "html";
                break;
            case "json":
                blob = new Blob([formattedOutput()], {
                    type: "application/json;charset=utf-8",
                });
                fileExtension = "json";
                break;
            case "xml":
                blob = new Blob([formattedOutput()], {
                    type: "application/xml;charset=utf-8",
                });
                fileExtension = "xml";
                break;
            default:
                blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
        }

        const cleanedFileName = fileName?.replace(/\.[^.]+$/, "") || "output";
        saveAs(blob, `${cleanedFileName}.${fileExtension}`);
    };

    const handleReset = () => {
        setBase64("");
        setFileName(null);
        setFileType("");
        setImagePreview(null);
    };

    const handleShare = async () => {
        const textToShare = formattedOutput();
        const blob = new Blob([textToShare], { type: 'text/plain' });
        const file = new File([blob], "output.txt", { type: 'text/plain' });

        if (navigator.share) {
            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "Base64 Image Converter",
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

    const formattedOutput = () => {
        switch (format) {
            case "plainText":
                return base64.split(",")[1];
            case "dataUri":
                return base64;
            case "imgTag":
                return `<img src="${base64}" alt="${fileName || "image"}" />`;
            case "cssBg":
                return `background-image: url('${base64}');`;
            case "htmlLink":
                return `<a href="${base64}" download="${fileName || "image"}">Download Image</a>`;
            case "json":
                return JSON.stringify({ fileName, base64 }, null, 2);
            case "xml":
                return `<image><name>${fileName}</name><base64>${base64}</base64></image>`;
            default:
                return base64.split(",")[1];
        }
    };

    return (
        <Box p={4} bg={bgColor} color={textColor} minH="78vh">
            <Heading
                as="h1"
                size="xl"
                color="teal.500"
                textAlign="center"
                fontWeight="bold"
                letterSpacing="wider"
                mb={6}
                textTransform="uppercase"
            >
                Image to Base64
            </Heading>
            <VStack spacing={4} align="stretch">
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Choose an Image
                    </FormLabel>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        bg={useColorModeValue("white", "gray.700")}
                        rounded="md"
                        p={1}
                    />
                </FormControl>

                {imagePreview && (
                    <Box textAlign="center" py={4} bg={useColorModeValue("gray.50", "gray.700")} rounded="md">
                        <Text mb={2} fontWeight="semibold">Image Preview:</Text>
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            maxH="300px"
                            mx="auto"
                            objectFit="contain"
                            rounded="md"
                            shadow="md"
                        />
                        <Text mt={2} fontSize="sm" color="gray.500">{fileName} ({fileType})</Text>
                    </Box>
                )}

                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Select Output Format
                    </FormLabel>
                    <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="dataUri">Data URI (data:image/...;base64,...)</option>
                        <option value="imgTag">HTML Image Tag (&lt;img src="..." /&gt;)</option>
                        <option value="cssBg">CSS Background Image (background-image: url(...))</option>
                        <option value="plainText">Plain Base64 String</option>
                        <option value="htmlLink">HTML Hyperlink (Download)</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                    </Select>
                </FormControl>

                <Textarea
                    value={formattedOutput()}
                    readOnly
                    placeholder="Formatted output will appear here"
                    rows={8}
                    bg={useColorModeValue("white", "gray.700")}
                    rounded="md"
                    fontFamily="monospace"
                />

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <Button
                        colorScheme="blue"
                        leftIcon={<FaClipboard />}
                        onClick={handleCopyToClipboard}
                        isDisabled={!base64}
                        w="full"
                    >
                        Copy
                    </Button>

                    <Button
                        colorScheme="green"
                        leftIcon={<FaDownload />}
                        onClick={handleDownload}
                        isDisabled={!base64}
                        w="full"
                    >
                        Download
                    </Button>

                    <Button
                        colorScheme="teal"
                        leftIcon={<FaShareAlt />}
                        onClick={handleShare}
                        isDisabled={!base64}
                        w="full"
                    >
                        Share
                    </Button>

                    <Button
                        colorScheme="red"
                        leftIcon={<FaTrashAlt />}
                        onClick={handleReset}
                        isDisabled={!base64}
                        w="full"
                    >
                        Reset
                    </Button>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default ImageToBase64Content;

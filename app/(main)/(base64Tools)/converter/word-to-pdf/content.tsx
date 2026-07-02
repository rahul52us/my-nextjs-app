"use client";
import React, { useState, ChangeEvent } from "react";
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Text,
    VStack,
    HStack,
    Center,
    Icon,
    Progress,
    ScaleFade,
    useToast,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiUploadCloud, FiCheckCircle, FiTrash2, FiEye } from "react-icons/fi";
import ConversionPreviewModal from "../../../../component/common/ConversionPreviewModal";

const WordToPdfConverterContent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Preview modal state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const dropzoneBg = useColorModeValue("gray.50", "gray.600");
    const dropzoneActiveBg = useColorModeValue("brand.50", "brand.900");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (
            selectedFile &&
            selectedFile.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            setFile(selectedFile);
            // Clear any previous preview
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        } else {
            toast({
                title: "Invalid file",
                description: "Please upload a .docx file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setFile(null);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setLoading(true);

        // Open modal immediately with loading state
        setPreviewUrl(null);
        setPreviewOpen(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/convert/word-to-pdf`,
                { method: "POST", body: formData }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || "Conversion failed");
            }

            // The result is already a PDF — use it directly as the preview
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);

            toast({
                title: "Conversion Successful",
                description: "Review the preview, then download your PDF.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        } catch (error: any) {
            setPreviewOpen(false);
            console.error("Conversion error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to convert file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleClear = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const downloadName = `${file?.name.replace(/\.[^.]+$/, "") || "converted"}.pdf`;

    return (
        <Box bg={bgColor} minH="100vh" py={20} transition="background 0.2s">
            <Flex direction="column" align="center" gap={10} px={4}>

                {/* Title */}
                <VStack spacing={2} textAlign="center">
                    <Heading size="2xl" fontWeight="900" letterSpacing="tight" color={textColor}>
                        Word to{" "}
                        <Text as="span" color="brand.400">
                            PDF
                        </Text>{" "}
                        Converter
                    </Heading>
                    <Text color={subTextColor} fontSize="md">
                        Upload a .docx file — preview the PDF before downloading
                    </Text>
                </VStack>

                {/* Upload card */}
                <Box
                    bg={cardBg}
                    borderRadius="3xl"
                    boxShadow="2xl"
                    p={8}
                    w={{ base: "100%", md: "lg" }}
                >
                    <VStack spacing={8}>
                        {/* Dropzone */}
                        <Box
                            w="full"
                            position="relative"
                            p={10}
                            border="2px dashed"
                            borderColor={file ? "brand.400" : "gray.500"}
                            borderRadius="2xl"
                            bg={file ? dropzoneActiveBg : dropzoneBg}
                            transition="all 0.3s"
                            cursor="pointer"
                        >
                            <Input
                                type="file"
                                accept=".docx"
                                onChange={handleFileChange}
                                position="absolute"
                                top={0}
                                left={0}
                                w="full"
                                h="full"
                                opacity={0}
                                cursor="pointer"
                                zIndex={1}
                            />
                            <VStack spacing={4}>
                                <Center
                                    boxSize="60px"
                                    bg={file ? "brand.500" : "brand.900"}
                                    color="white"
                                    borderRadius="xl"
                                >
                                    <Icon
                                        as={file ? FiCheckCircle : FiUploadCloud}
                                        boxSize={8}
                                    />
                                </Center>
                                <VStack spacing={1}>
                                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                        {file ? file.name : "Upload your .docx file"}
                                    </Text>
                                    <Text fontSize="sm" color={subTextColor}>
                                        Click or drag and drop your file here
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        {/* Progress bar while converting */}
                        {loading && (
                            <Box w="full">
                                <Flex justify="space-between" mb={2}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="brand.400"
                                        textTransform="uppercase"
                                    >
                                        Converting &amp; generating preview
                                    </Text>
                                    <Text fontSize="xs" color={subTextColor}>
                                        Please wait
                                    </Text>
                                </Flex>
                                <Progress
                                    size="xs"
                                    isIndeterminate
                                    colorScheme="brand"
                                    borderRadius="full"
                                />
                            </Box>
                        )}

                        {/* Action buttons */}
                        <ScaleFade in={!!file} unmountOnExit style={{ width: "100%" }}>
                            <HStack spacing={4}>
                                <Button
                                    leftIcon={<FiEye />}
                                    w="full"
                                    size="lg"
                                    height="60px"
                                    onClick={handleConvert}
                                    isLoading={loading}
                                    loadingText="Converting…"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, brand.400, brand.600)"
                                    color="white"
                                    _hover={{
                                        bgGradient: "linear(to-r, brand.500, brand.700)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    transition="all 0.2s"
                                >
                                    Convert &amp; Preview
                                </Button>
                                <Button
                                    size="lg"
                                    height="60px"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={handleClear}
                                    borderRadius="xl"
                                    isDisabled={loading}
                                >
                                    <FiTrash2 />
                                </Button>
                            </HStack>
                        </ScaleFade>
                    </VStack>
                </Box>
            </Flex>

            {/* Preview Modal */}
            <ConversionPreviewModal
                isOpen={previewOpen}
                onClose={handlePreviewClose}
                previewUrl={previewUrl}
                downloadUrl={previewUrl}
                downloadName={downloadName}
                outputLabel="PDF"
            />
        </Box>
    );
};

export default WordToPdfConverterContent;

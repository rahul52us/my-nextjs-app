"use client";

import React, { useState } from 'react';
import {
    Box, Button, Container, Heading, Text, VStack, useToast,
    Icon, Progress, HStack, ScaleFade, Flex, Divider,
    Center, SimpleGrid, Card, CardBody, useColorModeValue
} from '@chakra-ui/react';
import { FiUploadCloud, FiShield, FiCheckCircle, FiTrash2, FiEye } from 'react-icons/fi';
import stores from "../../../../../store/stores";
import { useWorkflowAutoAdvance } from "../../../../../hooks/useWorkflowAutoAdvance";
import ConversionPreviewModal from "../../../../../component/common/ConversionPreviewModal";

const PDFToWordContent = () => {
    const [isConverting, setIsConverting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview modal state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const dropzoneBg = useColorModeValue("gray.50", "gray.600");
    const dropzoneActiveBg = useColorModeValue("brand.50", "brand.900");

    const { themeStore: { themeConfig } } = stores;
    const { advanceWorkflow } = useWorkflowAutoAdvance();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setFileName(file.name);
            setSelectedFile(file);
            setPreviewUrl(null);
            setDownloadUrl(null);
        } else {
            toast({
                title: "Selection Error",
                description: "Please select a valid PDF file.",
                status: "warning",
                variant: "subtle",
            });
        }
    };

    const convertToWord = async () => {
        if (!selectedFile) return;
        setIsConverting(true);

        // Open modal immediately (shows loading spinner inside)
        setPreviewUrl(null);
        setDownloadUrl(null);
        setPreviewOpen(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            // Step 1: Get a PDF preview of the converted DOCX
            const previewRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/convert/pdf-to-word/preview`,
                { method: "POST", body: formData }
            );

            if (!previewRes.ok) {
                const err = await previewRes.json().catch(() => ({}));
                throw new Error(err.error || "Preview generation failed");
            }

            const previewBlob = await previewRes.blob();
            const pUrl = URL.createObjectURL(previewBlob);
            setPreviewUrl(pUrl);

            // Step 2: Also fetch the actual DOCX so it's ready to download
            const formData2 = new FormData();
            formData2.append("file", selectedFile);

            const docxRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/convert/pdf-to-word`,
                { method: "POST", body: formData2 }
            );

            if (!docxRes.ok) {
                const err = await docxRes.json().catch(() => ({}));
                throw new Error(err.error || "Conversion failed");
            }

            const docxBlob = await docxRes.blob();
            const dUrl = URL.createObjectURL(docxBlob);
            setDownloadUrl(dUrl);

        } catch (error: any) {
            setPreviewOpen(false);
            console.error("Conversion Error:", error);
            toast({
                title: "Conversion Failed",
                description: error.message || "An error occurred while processing the PDF.",
                status: "error",
            });
        } finally {
            setIsConverting(false);
        }
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setTimeout(() => advanceWorkflow(), 500);
        }
        setPreviewUrl(null);
        setDownloadUrl(null);
    };

    const handleClear = () => {
        setFileName(null);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setPreviewUrl(null);
        setDownloadUrl(null);
    };

    const downloadName = fileName?.replace('.pdf', '.docx') || 'converted.docx';

    return (
        <Box bg={bgColor} minH="100vh" py={20} transition="background 0.2s">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF to Word",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                        "description": "Convert PDF to Word online for free.",
                        "url": "https://www.toolsahayata.com/converter/PDFtools/PDFtoWord"
                    })
                }}
            />
            <Container maxW="container.md">
                <VStack spacing={12} align="stretch">

                    <VStack spacing={4} textAlign="center">
                        <Heading
                            color="brand.300"
                            size="2xl"
                            fontWeight="900"
                            letterSpacing="tight"
                            textTransform="uppercase"
                        >
                            PDF to <Text as="span" color="brand.400">Word</Text> Converter
                        </Heading>
                    </VStack>

                    <Card borderRadius="3xl" boxShadow="2xl" overflow="hidden" border="none" bg={cardBg}>
                        <CardBody p={8}>
                            <VStack spacing={8}>
                                <Box
                                    w="full"
                                    position="relative"
                                    p={10}
                                    border="2px dashed"
                                    borderColor={fileName ? "brand.400" : "gray.500"}
                                    borderRadius="2xl"
                                    bg={fileName ? dropzoneActiveBg : dropzoneBg}
                                    transition="all 0.3s"
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        style={{
                                            position: 'absolute', top: 0, left: 0,
                                            width: '100%', height: '100%',
                                            opacity: 0, cursor: 'pointer', zIndex: 1
                                        }}
                                    />
                                    <VStack spacing={4}>
                                        <Center
                                            boxSize="60px"
                                            bg={fileName ? "brand.500" : "brand.900"}
                                            color="white"
                                            borderRadius="xl"
                                        >
                                            <Icon as={fileName ? FiCheckCircle : FiUploadCloud} boxSize={8} />
                                        </Center>
                                        <VStack spacing={1}>
                                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                                {fileName ? fileName : "Upload your PDF"}
                                            </Text>
                                            <Text fontSize="sm" color={subTextColor}>
                                                Click or drag and drop your file here
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Box>

                                {isConverting && (
                                    <Box w="full">
                                        <Flex justify="space-between" mb={2}>
                                            <Text fontSize="xs" fontWeight="bold" color="brand.400" textTransform="uppercase">
                                                Converting &amp; generating preview
                                            </Text>
                                            <Text fontSize="xs" color={subTextColor}>Please wait</Text>
                                        </Flex>
                                        <Progress size="xs" isIndeterminate colorScheme="brand" borderRadius="full" />
                                    </Box>
                                )}

                                <ScaleFade in={!!fileName} unmountOnExit style={{ width: '100%' }}>
                                    <HStack spacing={4}>
                                        <Button
                                            leftIcon={<FiEye />}
                                            w="full"
                                            size="lg"
                                            height="60px"
                                            onClick={convertToWord}
                                            isLoading={isConverting}
                                            loadingText="Converting…"
                                            borderRadius="xl"
                                            bgGradient="linear(to-r, brand.500, brand.700)"
                                            color="white"
                                            _hover={{
                                                bgGradient: "linear(to-r, brand.600, brand.800)",
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
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </HStack>
                                </ScaleFade>
                            </VStack>
                        </CardBody>
                    </Card>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                        <FeatureIcon
                            icon={FiEye}
                            title="Preview First"
                            desc="Inspect the converted document before downloading."
                            textColor={textColor}
                            subTextColor={subTextColor}
                            cardBg={cardBg}
                        />
                        <FeatureIcon
                            icon={FiShield}
                            title="Secure"
                            desc="Files deleted immediately after conversion."
                            textColor={textColor}
                            subTextColor={subTextColor}
                            cardBg={cardBg}
                        />
                        <FeatureIcon
                            icon={FiCheckCircle}
                            title="Clean Output"
                            desc="Editable .docx with proper formatting."
                            textColor={textColor}
                            subTextColor={subTextColor}
                            cardBg={cardBg}
                        />
                    </SimpleGrid>

                    <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />

                    <Text textAlign="center" color={subTextColor} fontSize="sm">
                        Powered by Toolsahayata Engine
                    </Text>
                </VStack>
            </Container>

            {/* Preview Modal */}
            <ConversionPreviewModal
                isOpen={previewOpen}
                onClose={handlePreviewClose}
                previewUrl={previewUrl}
                downloadUrl={downloadUrl}
                downloadName={downloadName}
                outputLabel=".docx"
            />
        </Box>
    );
};

const FeatureIcon = ({ icon, title, desc, textColor, subTextColor, cardBg }: any) => (
    <HStack spacing={4} align="start">
        <Center boxSize="40px" bg={cardBg} borderRadius="lg" shadow="md" color="brand.400" flexShrink={0}>
            <Icon as={icon} />
        </Center>
        <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color={textColor}>{title}</Text>
            <Text fontSize="xs" color={subTextColor}>{desc}</Text>
        </VStack>
    </HStack>
);

export default PDFToWordContent;
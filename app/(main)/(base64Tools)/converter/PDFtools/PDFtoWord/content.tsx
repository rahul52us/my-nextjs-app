"use client";

import React, { useState } from 'react';
import {
    Box, Button, Container, Heading, Text, VStack, useToast,
    Icon, Progress, HStack, ScaleFade, Flex, Divider,
    Center, SimpleGrid, Card, CardBody, useColorModeValue
} from '@chakra-ui/react';
import { FiUploadCloud, FiFileText, FiShield, FiZap, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import stores from "../../../../../store/stores";
import { useWorkflowAutoAdvance } from "../../../../../hooks/useWorkflowAutoAdvance";

const PDFToWordContent = () => {
    const [isConverting, setIsConverting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const dropzoneBg = useColorModeValue("gray.50", "gray.600");
    const dropzoneActiveBg = useColorModeValue("blue.50", "blue.900");

    const { themeStore: { themeConfig } } = stores;
    const { advanceWorkflow } = useWorkflowAutoAdvance();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setFileName(file.name);
            setSelectedFile(file);
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

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/convert/pdf-to-word`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Conversion failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName?.replace('.pdf', '.docx') || 'converted.docx';
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Conversion Successful",
                description: "Your document is downloading...",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setTimeout(() => {
                advanceWorkflow();
            }, 1200);

        } catch (error: any) {
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

    const handleClear = () => {
        setFileName(null);
        setSelectedFile(null);
    };

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
                            color={themeConfig.colors.brand[300]}
                            size="2xl"
                            fontWeight="900"
                            letterSpacing="tight"
                            textTransform="uppercase"
                        >
                            PDF to <Text as="span" color="blue.400">Word</Text> Converter
                        </Heading>
                        {/* <Text color={subTextColor} fontSize="lg" maxW="lg">
                            LibreOffice engine — pixel-perfect conversion with full formatting preserved.
                        </Text> */}
                    </VStack>

                    <Card borderRadius="3xl" boxShadow="2xl" overflow="hidden" border="none" bg={cardBg}>
                        <CardBody p={8}>
                            <VStack spacing={8}>
                                <Box
                                    w="full"
                                    position="relative"
                                    p={10}
                                    border="2px dashed"
                                    borderColor={fileName ? "blue.400" : "gray.500"}
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
                                            bg={fileName ? "blue.500" : "blue.900"}
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
                                            <Text fontSize="xs" fontWeight="bold" color="blue.400" textTransform="uppercase">
                                                Converting via LibreOffice...
                                            </Text>
                                            <Text fontSize="xs" color={subTextColor}>Please wait</Text>
                                        </Flex>
                                        <Progress size="xs" isIndeterminate colorScheme="blue" borderRadius="full" />
                                    </Box>
                                )}

                                <ScaleFade in={!!fileName} unmountOnExit style={{ width: '100%' }}>
                                    <HStack spacing={4}>
                                        <Button
                                            leftIcon={<FiFileText />}
                                            colorScheme="blue"
                                            w="full"
                                            size="lg"
                                            height="60px"
                                            onClick={convertToWord}
                                            isLoading={isConverting}
                                            loadingText="Converting..."
                                            borderRadius="xl"
                                        >
                                            Convert to .docx
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
                            icon={FiZap}
                            title="Accurate"
                            desc="Toolsahayata gives you perfect conversion of PDF to Word."
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
        </Box>
    );
};

const FeatureIcon = ({ icon, title, desc, textColor, subTextColor, cardBg }: any) => (
    <HStack spacing={4} align="start">
        <Center boxSize="40px" bg={cardBg} borderRadius="lg" shadow="md" color="blue.400" flexShrink={0}>
            <Icon as={icon} />
        </Center>
        <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color={textColor}>{title}</Text>
            <Text fontSize="xs" color={subTextColor}>{desc}</Text>
        </VStack>
    </HStack>
);

export default PDFToWordContent;
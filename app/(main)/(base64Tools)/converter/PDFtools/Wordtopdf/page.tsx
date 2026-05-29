"use client";

import React, { useState } from 'react';
import {
    Box, Button, Container, Heading, Text, VStack, useToast,
    Icon, Progress, HStack, ScaleFade, Flex, Divider,
    Center, SimpleGrid, Card, CardBody, useColorModeValue, Spinner, Badge
} from '@chakra-ui/react';
import { FiUploadCloud, FiFileText, FiShield, FiZap, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { ShieldCheck } from 'lucide-react';

const WordToPdf = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const dropzoneBg = useColorModeValue("gray.50", "gray.600");
    const dropzoneActiveBg = useColorModeValue("blue.50", "blue.900");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.docx')) {
            setFileName(file.name);
            setSelectedFile(file);
        } else {
            toast({
                title: "Invalid Format",
                description: "Please select a valid .docx file.",
                status: "warning",
            });
        }
    };

    const downloadPdf = async () => {
        if (!selectedFile) return;
        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/convert/word-to-pdf`,
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
            a.download = `${fileName?.replace('.docx', '')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast({ title: "Conversion Successful", status: "success" });
        } catch (error: any) {
            toast({ title: "Export Error", description: String(error), status: "error" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        setFileName(null);
        setSelectedFile(null);
    };

    return (
        <Box bg={bgColor} minH="100vh" py={20} transition="background 0.2s">
            <Container maxW="container.md">
                <VStack spacing={12} align="stretch">
                    
                    <VStack spacing={4} textAlign="center">
                        <Heading size="2xl" fontWeight="900" letterSpacing="tight">
                            Word to <Text as="span" color="blue.400">PDF</Text>
                        </Heading>
                        <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                            <Icon as={ShieldCheck} mr={1} verticalAlign="middle" /> LibreOffice Engine
                        </Badge>
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
                                        accept=".docx"
                                        onChange={handleFileChange}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1 }}
                                    />
                                    <VStack spacing={4}>
                                        <Center boxSize="60px" bg={fileName ? "blue.500" : "blue.900"} color="white" borderRadius="xl">
                                            <Icon as={fileName ? FiCheckCircle : FiUploadCloud} boxSize={8} />
                                        </Center>
                                        <VStack spacing={1}>
                                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                                {fileName ? fileName : "Upload your .docx file"}
                                            </Text>
                                            <Text fontSize="sm" color={subTextColor}>Click or drag and drop your file here</Text>
                                        </VStack>
                                    </VStack>
                                </Box>

                                {isGenerating && (
                                    <Box w="full">
                                        <Text fontSize="xs" fontWeight="bold" color="blue.400" mb={2}>Converting via LibreOffice...</Text>
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
                                            onClick={downloadPdf}
                                            isLoading={isGenerating}
                                            loadingText="Converting..."
                                            borderRadius="xl"
                                        >
                                            Convert & Download
                                        </Button>
                                        <Button size="lg" height="60px" variant="ghost" colorScheme="red" onClick={handleClear} borderRadius="xl">
                                            <FiTrash2 />
                                        </Button>
                                    </HStack>
                                </ScaleFade>
                            </VStack>
                        </CardBody>
                    </Card>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                        <FeatureIcon icon={FiZap} title="Accurate" desc="Preserves all formatting." textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        <FeatureIcon icon={FiShield} title="Secure" desc="Files deleted automatically." textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        <FeatureIcon icon={FiCheckCircle} title="Clean Output" desc="Perfect PDF quality." textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                    </SimpleGrid>
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

export default WordToPdf;
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
    useToast,
} from "@chakra-ui/react";
import { FaFileUpload, FaDownload } from "react-icons/fa";
import mammoth from "mammoth"; // For extracting .docx content
import { PDFDocument } from "pdf-lib"; // For creating PDFs

const WordToPdfConverterContent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const toast = useToast();

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (
            selectedFile &&
            selectedFile.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            setFile(selectedFile);
            setPdfUrl(null); // Reset previous PDF
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

    // Convert .docx to PDF
    const handleConvert = async () => {
        if (!file) return;

        setLoading(true);

        try {
            // Read the .docx file as an ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Extract text and basic HTML from .docx using mammoth
            const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer });

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            let page: any = pdfDoc.addPage([595, 842]); // A4 size in points (width, height)

            // Add text to the PDF (basic text extraction)
            const font = await pdfDoc.embedFont("Helvetica"); // Use a standard font
            const fontSize = 12;
            const maxWidth = 500; // Max width for text wrapping
            let yPosition = 800; // Starting Y position (top of page)

            // Split text into lines and handle basic formatting
            const lines = htmlContent
                .replace(/<[^>]+>/g, " ") // Strip HTML tags for simplicity
                .split("\n")
                .filter((line) => line.trim());

            for (const line of lines) {
                const textWidth = font.widthOfTextAtSize(line, fontSize);
                if (textWidth > maxWidth) {
                    // Simple word wrap for long lines
                    const words = line.split(" ");
                    let currentLine = "";
                    for (const word of words) {
                        const testLine = currentLine + (currentLine ? " " : "") + word;
                        if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
                            currentLine = testLine;
                        } else {
                            if (yPosition < 50) {
                                page = pdfDoc.addPage([595, 842]);
                                yPosition = 800;
                            }
                            page.drawText(currentLine, {
                                x: 50,
                                y: yPosition,
                                size: fontSize,
                                font,
                                color: { r: 0, g: 0, b: 0 }, // Black text
                            });
                            yPosition -= fontSize + 5; // Line spacing
                            currentLine = word;
                        }
                    }
                    if (currentLine && yPosition > 50) {
                        page.drawText(currentLine, {
                            x: 50,
                            y: yPosition,
                            size: fontSize,
                            font,
                            color: { r: 0, g: 0, b: 0 },
                        });
                        yPosition -= fontSize + 5;
                    }
                } else {
                    if (yPosition < 50) {
                        page = pdfDoc.addPage([595, 842]);
                        yPosition = 800;
                    }
                    page.drawText(line, {
                        x: 50,
                        y: yPosition,
                        size: fontSize,
                        font,
                        color: { r: 0, g: 0, b: 0 },
                    });
                    yPosition -= fontSize + 5;
                }
            }

            // Serialize the PDF to bytes
            const pdfBytes: any = await pdfDoc.save();

            // Create a Blob and URL for download
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            toast({
                title: "Success",
                description: "File converted successfully!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Conversion error:", error);
            toast({
                title: "Error",
                description: "Failed to convert file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH="100vh" justify="center" align="center" bg="gray.50" p={4}>
            <Box
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="lg"
                boxShadow="xl"
                w={{ base: "100%", md: "md" }}
            >
                <VStack spacing={6} align="stretch">
                    <Heading size="lg" textAlign="center" color="teal.600">
                        Word to PDF Converter
                    </Heading>

                    <Text textAlign="center" color="gray.600">
                        Upload a .docx file to convert it to PDF (client-side)
                    </Text>

                    <Input
                        type="file"
                        accept=".docx"
                        onChange={handleFileChange}
                        display="none"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <Button
                            as="span"
                            leftIcon={<FaFileUpload />}
                            colorScheme="teal"
                            variant="outline"
                            w="full"
                            py={6}
                            borderStyle="dashed"
                            borderColor={file ? "teal.500" : "gray.300"}
                            _hover={{ borderColor: "teal.400" }}
                        >
                            {file ? file.name : "Choose a .docx file"}
                        </Button>
                    </label>

                    <Button
                        colorScheme="teal"
                        onClick={handleConvert}
                        isLoading={loading}
                        loadingText="Converting..."
                        isDisabled={!file || loading}
                        w="full"
                    >
                        Convert to PDF
                    </Button>

                    {pdfUrl && (
                        <Button
                            as="a"
                            href={pdfUrl}
                            download={`${file?.name.split(".")[0] || "converted"}.pdf`}
                            leftIcon={<FaDownload />}
                            colorScheme="blue"
                            w="full"
                        >
                            Download PDF
                        </Button>
                    )}
                </VStack>
            </Box>
        </Flex>
    );
};

export default WordToPdfConverterContent;

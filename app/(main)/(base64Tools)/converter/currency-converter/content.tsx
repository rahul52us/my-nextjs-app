"use client";

import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Container,
    VStack,
    HStack,
    Text,
    Heading,
    Icon,
    IconButton,
    List,
    ListItem,
    useToast,
    Center,
    Divider,
    Spinner,
    Badge,
    Tooltip,
} from "@chakra-ui/react";
import {
    FiFileText,
    FiX,
    FiArrowUp,
    FiArrowDown,
    FiLink,
    FiTrash2,
    FiFilePlus,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);

interface FileWithId {
    id: string;
    file: File;
}

const PdfMergerContent = () => {
    const [files, setFiles] = useState<FileWithId[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                id: crypto.randomUUID(),
                file,
            }));
            setFiles((prev) => [...prev, ...newFiles]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearAll = () => setFiles([]);

    const moveFile = (index: number, direction: "up" | "down") => {
        const newFiles = [...files];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newFiles.length) return;

        [newFiles[index], newFiles[targetIndex]] = [
            newFiles[targetIndex],
            newFiles[index],
        ];

        setFiles(newFiles);
    };

    const mergePdfs = async () => {
        if (files.length < 2) return;

        setIsMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const fileItem of files) {
                const fileBytes = await fileItem.file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBytes);
                const copiedPages = await mergedPdf.copyPages(
                    pdf,
                    pdf.getPageIndices()
                );
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes: any = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });

            saveAs(blob, `merged_${Date.now()}.pdf`);

            toast({
                title: "Merged Successfully",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to merge PDFs.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <Box
            minH="100vh"
            bg="gray.50"
            bgGradient="radial(circle at 20% 20%, blue.50 0%, transparent 40%), radial(circle at 80% 80%, pink.50 0%, transparent 40%)"
            py={20}
        >
            <Container maxW="container.md">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <VStack spacing={3} textAlign="center">
                        <Badge
                            colorScheme="blue"
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="widest"
                        >
                            PDF Toolbox
                        </Badge>

                        <Heading
                            size="2xl"
                            color="gray.900"
                            fontWeight="900"
                            letterSpacing="tight"
                        >
                            PDF{" "}
                            <Text as="span" color="blue.500">
                                Merger
                            </Text>
                        </Heading>

                        <Text color="gray.500" fontSize="lg" fontWeight="medium">
                            Drag, reorder, and combine your documents with ease.
                        </Text>
                    </VStack>

                    {/* Upload Area */}
                    <MotionBox whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Center
                            as="label"
                            htmlFor="file-upload"
                            p={12}
                            cursor="pointer"
                            border="2px dashed"
                            borderColor="blue.200"
                            borderRadius="3xl"
                            bg="white"
                            shadow="sm"
                            transition="all 0.3s ease"
                            _hover={{
                                borderColor: "blue.500",
                                shadow: "2xl",
                                bg: "blue.50",
                            }}
                            flexDirection="column"
                        >
                            <VStack spacing={4}>
                                <Box
                                    bg="blue.500"
                                    color="white"
                                    p={4}
                                    borderRadius="2xl"
                                    shadow="lg"
                                >
                                    <Icon as={FiFilePlus} boxSize={8} />
                                </Box>

                                <VStack spacing={1}>
                                    <Text fontWeight="bold" fontSize="xl" color="gray.800">
                                        Choose PDF files
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        or drag and drop them here
                                    </Text>
                                </VStack>
                            </VStack>

                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="application/pdf"
                                hidden
                                onChange={handleFileChange}
                                ref={fileInputRef}
                            />
                        </Center>
                    </MotionBox>

                    {/* File List */}
                    <AnimatePresence>
                        {files.length > 0 && (
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                bg="white"
                                shadow="2xl"
                                borderRadius="3xl"
                                border="1px solid"
                                borderColor="gray.100"
                                overflow="hidden"
                            >
                                <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
                                    <HStack justify="space-between">
                                        <HStack spacing={3}>
                                            <Text
                                                fontWeight="800"
                                                fontSize="xs"
                                                color="blue.500"
                                                textTransform="uppercase"
                                                letterSpacing="widest"
                                            >
                                                Queue
                                            </Text>
                                            <Badge colorScheme="blue">{files.length}</Badge>
                                        </HStack>

                                        <Button
                                            leftIcon={<Icon as={FiTrash2} />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={clearAll}
                                            borderRadius="full"
                                        >
                                            Clear All
                                        </Button>
                                    </HStack>
                                </Box>

                                <List>
                                    {files.map((item, index) => (
                                        <MotionListItem
                                            key={item.id}
                                            layout
                                            px={6}
                                            py={4}
                                            borderBottom={
                                                index !== files.length - 1 ? "1px solid" : "none"
                                            }
                                            borderColor="gray.100"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            _hover={{ bg: "blue.50" }}
                                        >
                                            <HStack spacing={4}>
                                                <Text fontSize="xs" fontWeight="bold" color="gray.400">
                                                    {index + 1}
                                                </Text>

                                                <Icon as={FiFileText} color="red.400" boxSize={5} />

                                                <VStack align="start" spacing={0}>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="bold"
                                                        color="gray.700"
                                                        isTruncated
                                                        maxW="250px"
                                                    >
                                                        {item.file.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.400">
                                                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </Text>
                                                </VStack>
                                            </HStack>

                                            <HStack spacing={1}>
                                                <Tooltip label="Move Up">
                                                    <IconButton
                                                        aria-label="up"
                                                        icon={<Icon as={FiArrowUp} />}
                                                        size="sm"
                                                        variant="ghost"
                                                        isDisabled={index === 0}
                                                        onClick={() => moveFile(index, "up")}
                                                    />
                                                </Tooltip>

                                                <Tooltip label="Move Down">
                                                    <IconButton
                                                        aria-label="down"
                                                        icon={<Icon as={FiArrowDown} />}
                                                        size="sm"
                                                        variant="ghost"
                                                        isDisabled={index === files.length - 1}
                                                        onClick={() => moveFile(index, "down")}
                                                    />
                                                </Tooltip>

                                                <Divider orientation="vertical" h="20px" />

                                                <IconButton
                                                    aria-label="remove"
                                                    icon={<Icon as={FiX} />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => removeFile(item.id)}
                                                />
                                            </HStack>
                                        </MotionListItem>
                                    ))}
                                </List>
                            </MotionBox>
                        )}
                    </AnimatePresence>

                    {/* Merge Button */}
                    <Button
                        size="lg"
                        colorScheme="blue"
                        h="70px"
                        borderRadius="2xl"
                        fontSize="lg"
                        fontWeight="bold"
                        leftIcon={
                            isMerging ? (
                                <Spinner size="sm" />
                            ) : (
                                <Icon as={FiLink} />
                            )
                        }
                        isDisabled={files.length < 2 || isMerging}
                        onClick={mergePdfs}
                        shadow="xl"
                        _hover={{ transform: "translateY(-2px)" }}
                        transition="all 0.3s ease"
                    >
                        {isMerging ? "Combining your files..." : "Merge Documents"}
                    </Button>
                </VStack>
            </Container>
        </Box>
    );
};

export default PdfMergerContent;

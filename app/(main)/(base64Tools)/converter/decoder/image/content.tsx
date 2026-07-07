"use client";

import { useState, ChangeEvent, DragEvent, useRef } from "react";
import { saveAs } from "file-saver";
import { FaImage  } from "react-icons/fa";
import {
    Box,
    Button,
    Heading,
    Textarea,
    VStack,
    FormControl,
    FormLabel,
    Text,
    useColorModeValue,
    Image,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    HStack,
} from "@chakra-ui/react";
import stores from "../../../../../store/stores";

const Base64ImageContent = () => {
    const [base64, setBase64] = useState<string>("");
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const setFileType = useState<string | null>(null)[1];
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);
    const dragCounter = useRef(0);
    const textColor = useColorModeValue("gray.800", "gray.100");

    // Dropzone theme tokens — same colorMode source as the rest of the box,
    // so the drag-active state stays correct in both light and dark mode.
    const dropzoneBorder = useColorModeValue("blue.300", "blue.500");
    const dropzoneBg = useColorModeValue("blue.50", "gray.700");
    const dropzoneHoverBg = useColorModeValue("blue.100", "gray.600");
    const dropzoneTextColor = useColorModeValue("gray.700", "gray.200");
    const dragActiveBg = useColorModeValue("blue.100", "gray.600");
    const dragActiveBorder = "blue.500";

    const extractMimeAndData = (input: string) => {
        const regex = /^data:(.*?);base64,(.*)$/;
        const matches = input.match(regex);
        if (matches) {
            return {
                mimeType: matches[1],
                base64Data: matches[2],
            };
        }
        return { mimeType: "application/octet-stream", base64Data: input };
    };
    const {
  themeStore: { themeConfig },
} = stores;
    const generateFileName = (mimeType: string) => {
        const extension = mimeType.split("/")[1] || "bin";
        const timestamp = new Date()
            .toISOString()
            .replace(/[^\d]/g, "")
            .slice(0, 14);
        return `file_${timestamp}.${extension}`;
    };

    const handleConvert = () => {
        if (!base64.trim()) {
            alert("Please enter a valid Base64 string.");
            return;
        }
        const { mimeType, base64Data } = extractMimeAndData(base64);
        try {
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(
                Array.from(byteCharacters, (char) => char.charCodeAt(0))
            );
            const blob = new Blob([byteArray], { type: mimeType });
            saveAs(blob, generateFileName(mimeType));
        } catch {
            alert("Invalid Base64 data. Please check the input format.");
        }
    };

    const previewBase64 = (input: string) => {
        const { mimeType, base64Data } = extractMimeAndData(input);
        setFileType(mimeType);

        if (mimeType.startsWith("image")) {
            setWarningMessage(null); // Clear any previous warnings
            setPreviewContent(`data:${mimeType};base64,${base64Data}`);
        } else {
            setWarningMessage("Warning: This is not an image file.");
            setPreviewContent(null);
        }
    };

    const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setBase64(e.target.value);
        previewBase64(e.target.value);
    };

    const handleShare = () => {
        if (!base64.trim()) {
            alert("Please enter a valid Base64 string.");
            return;
        }
        const { mimeType, base64Data } = extractMimeAndData(base64);
        try {
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(
                Array.from(byteCharacters, (char) => char.charCodeAt(0))
            );
            const blob = new Blob([byteArray], { type: mimeType });

            // Convert the Blob to a File object
            const file = new File([blob], generateFileName(mimeType), {
                type: mimeType,
            });

            // Try to use the native share API if available
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator
                    .share({
                        files: [file],
                        title: "Shared File",
                        text: "Here is the file you requested.",
                    })
                    .then(() => {
                        console.log("File shared successfully!");
                    })
                    .catch((error) => {
                        console.error("Error sharing the file:", error);
                        alert("Sharing failed or not supported on your device.");
                    });
            } else {
                alert("Sharing is not supported on your device.");
            }
        } catch (error) {
            console.log(error);
            alert("Invalid Base64 data. Please check the input format.");
        }
    };

    // Core reader — shared by both the <input> picker and drag-and-drop.
    // NOTE: images must be read as a Data URL (base64), not as plain text —
    // the original code used reader.readAsText() with accept=".txt", which
    // would never produce a valid base64 string for an actual image file.
    const readImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setWarningMessage("Please upload a valid image file (PNG, JPG, GIF, WEBP).");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setBase64(content);
            previewBase64(content);
        };
        reader.onerror = () => {
            setWarningMessage("Failed to read the image file. Please try again.");
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            readImageFile(file);
        }
        event.target.value = "";
    };

    // --- Drag and drop handlers ---
    const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
            dragCounter.current += 1;
            setIsDragActive(true);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
            e.dataTransfer.dropEffect = "copy";
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            readImageFile(file);
            e.dataTransfer.clearData();
        }
    };

    const handleTogglePreview = () => {
        setShowPreview((prev) => !prev);

        if (showPreview) {
            onClose();
        } else {
            onOpen();
        }
    };

    const handleReset = () => {
        setPreviewContent(null);
        setFileType(null);
        setShowPreview(false);
        setWarningMessage(null);
        onClose();
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
                Base64 to Image
            </Heading>

            <VStack spacing={4} align="stretch">
                <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold">
                        Base64 Input
                    </FormLabel>
                    <Textarea
                        value={base64}
                        onChange={handleBase64Change}
                        placeholder="Paste your Base64 string here"
                        rows={5}
                        size="lg"
                        bg={useColorModeValue("white", "gray.700")}
                        _focus={{ borderColor: "teal.500" }}
                        rounded="md"
                        fontFamily="'Courier New', monospace"
                    />
                </FormControl>
                <FormControl>
  <FormLabel fontSize="lg" fontWeight="semibold">
    Upload an Image
  </FormLabel>

  <Box
    as="label"
    htmlFor="image-upload"
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
    <Icon as={FaImage} boxSize={8} color={isDragActive ? "blue.500" : "blue.400"} />
    <Text fontWeight="semibold" color={dropzoneTextColor}>
      {isDragActive ? "Drop it here" : "Click to upload or drag & drop Image"}
    </Text>
    <Text fontSize="sm" color="gray.400">
      PNG, JPG, GIF, WEBP supported
    </Text>
    <Input
      id="image-upload"
      type="file"
      accept="image/*"
      onChange={handleFileUpload}
      display="none"
    />
  </Box>
</FormControl>
                <HStack mt={2}>
                    <Button
                        colorScheme="green"
                        width="full"
                        onClick={handleConvert}
                        _hover={{ bg: "green.600" }}
                        fontFamily="'Courier New', monospace"
                    >
                        Convert & Download
                    </Button>
                    <Button
                        colorScheme="brand"
                        width="full"
                        isDisabled={base64?.trim() ? false : true}
                        onClick={handleShare}
                        _hover={{ bg: "brand.600" }}
                        fontFamily="'Courier New', monospace"
                    >
                        Share File
                    </Button>
                    <Button
                        colorScheme="brand"
                        width="full"
                        onClick={handleTogglePreview}
                        _hover={{ bg: "brand.600" }}
                        fontFamily="'Courier New', monospace"
                    >
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </Button>
                </HStack>
                {warningMessage && (
                    <Text fontSize="sm" color="red.500" textAlign="center" mt={2}>
                        {warningMessage}
                    </Text>
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={handleReset} size="sm">
                <ModalOverlay />
                <ModalContent bg="black" color="green.300">
                    <ModalHeader>Preview</ModalHeader>
                    <ModalBody>
                        {previewContent ? (
                            <Image
                                src={previewContent}
                                alt="Base64 Preview"
                                maxH="300px"
                                objectFit="contain"
                            />
                        ) : (
                            <Text>No preview available for this file type.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="brand" onClick={handleReset}>
                            Reset
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Base64ImageContent;
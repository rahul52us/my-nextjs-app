"use client";

import { useState, ChangeEvent } from "react";
import { saveAs } from "file-saver";
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

const Base64Image = () => {
  const [base64, setBase64] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const setFileType = useState<string | null>(null)[1];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

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

  const generateFileName = (mimeType: string) => {
    const extension = mimeType.split("/")[1] || "bin";
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBase64(content);
        previewBase64(content);
      };
      reader.readAsText(file);
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
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
            size="lg"
          />
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
            colorScheme="blue"
            width="full"
            isDisabled={base64?.trim() ? false : true}
            onClick={handleShare}
            _hover={{ bg: "blue.600" }}
            fontFamily="'Courier New', monospace"
          >
            Share File
          </Button>
          <Button
            colorScheme="blue"
            width="full"
            onClick={handleTogglePreview}
            _hover={{ bg: "blue.600" }}
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
            <Button colorScheme="blue" onClick={handleReset}>
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

export default Base64Image;
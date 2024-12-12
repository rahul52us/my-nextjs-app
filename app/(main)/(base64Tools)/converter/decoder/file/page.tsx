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
} from "@chakra-ui/react";

const Base64ToFile = () => {
  const [base64, setBase64] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const setFileType = useState<string | null>(null)[1];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPreview, setShowPreview] = useState<boolean>(false);
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

      // Save the file using the correct MIME type and file name
      saveAs(blob, generateFileName(mimeType));
    } catch (error) {
      console.log(error)
      alert("Invalid Base64 data. Please check the input format.");
    }
  };

  const previewBase64 = (input: string) => {
    const { mimeType, base64Data } = extractMimeAndData(input);
    setFileType(mimeType);
    setPreviewContent(
      mimeType.startsWith("image")
        ? `data:${mimeType};base64,${base64Data}`
        : null
    );
  };

  const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBase64(e.target.value);
    previewBase64(e.target.value);
  };

  const handleTogglePreview = () => {
    setShowPreview((prev) => {
      const newState = !prev;
      if (newState) {
        onOpen();
      } else {
        onClose();
      }
      return newState;
    });
  };


  const handleReset = (reset ? : string) => {
    if(reset){
      setBase64("");
    }
    setPreviewContent(null);
    setFileType(null);
    setShowPreview(false);
    onClose();
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
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        Base64 to File
      </Heading>
      <VStack spacing={6} align="stretch">
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
          onClick={handleTogglePreview}
          mt={2}
          _hover={{ bg: "blue.600" }}
          fontFamily="'Courier New', monospace"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Ensure your Base64 starts with "data:" for accurate conversion.
        </Text>
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
            <Button colorScheme="blue" onClick={() => handleReset()}>
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

export default Base64ToFile;

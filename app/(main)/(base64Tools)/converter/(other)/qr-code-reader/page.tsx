"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Image,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  CardFooter,
  IconButton,
  useClipboard,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { BiCopy, BiQr, BiUpload, BiTrash } from "react-icons/bi";
import stores from "../../../../../store/stores";

const QRCodeReaderComponent: React.FC = () => {
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dropzoneBg = useColorModeValue("gray.50", "gray.800");
  const dropzoneBorderColor = useColorModeValue("gray.300", "gray.500");
  const dropzoneHoverBg = useColorModeValue("blue.50", "gray.700");
  const dropzoneActiveBorderColor = useColorModeValue("blue.400", "blue.300");
  const iconColor = useColorModeValue("gray.400", "gray.500");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  const toast = useToast();
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { onCopy } = useClipboard(scannedText || "");

  const {
    themeStore: { themeConfig },
  } = stores;

  useEffect(() => {
    if (typeof window !== "undefined") {
      codeReader.current = new BrowserMultiFormatReader();
    }
  }, []);

  const decodeQRCodeFromImage = (src: string) => {
    const imgElement = document.createElement("img");
    imgElement.src = src;

    imgElement.onload = () => {
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        codeReader.current
          ?.decodeFromImage(imgElement)
          .then((result) => {
            if (result && result.getText()) {
              setScannedText(result.getText());
              toast({
                title: "QR Code Scanned",
                description: `Data extracted successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            } else {
              toast({
                title: "Scan Failed",
                description: "Could not decode QR code from this image.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          })
          .catch(() => {
            toast({
              title: "Scan Failed",
              description: "Could not decode QR code from this image.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          });
      }
    };

    imgElement.onerror = () => {
      toast({
        title: "Image Load Error",
        description: "There was an error loading the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImageSrc(reader.result as string);
        setFileName(file.name);
        setScannedText(null);
        decodeQRCodeFromImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop an image file.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleCopy = () => {
    onCopy();
    toast({
      title: "Copied!",
      description: "QR code data copied to clipboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearAll = () => {
    setImageSrc(null);
    setFileName(null);
    setScannedText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Box px={{ base: 4, md: 6 }} py={6} bg={bgColor} color={textColor} minH="78vh">
      {/* Header */}
      <Box textAlign="center" mb={8}>
        <Heading
          as="h1"
          fontSize={{ base: "2xl", md: "3xl" }}
          color={themeConfig.colors.brand[300]}
          mb={2}
        >
          QR Code Reader
        </Heading>
        <Text fontSize={{ base: "sm", md: "md" }} color={subtitleColor}>
          Scan QR codes from images and extract the data easily
        </Text>
      </Box>

      {/* Upload Area */}
      <Box maxW="480px" mx="auto">
        {!imageSrc ? (
          <Box
            as="label"
            htmlFor="qr-file-input"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={3}
            border="2px dashed"
            borderColor={isDragging ? dropzoneActiveBorderColor : dropzoneBorderColor}
            borderRadius="xl"
            p={{ base: 8, md: 12 }}
            cursor="pointer"
            bg={isDragging ? dropzoneHoverBg : dropzoneBg}
            transition="all 0.2s ease"
            _hover={{ bg: dropzoneHoverBg, borderColor: dropzoneActiveBorderColor }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            minH={{ base: "180px", md: "220px" }}
          >
            <Icon
              as={BiQr}
              boxSize={{ base: 10, md: 12 }}
              color={isDragging ? "blue.400" : iconColor}
              transition="color 0.2s"
            />
            <Box textAlign="center">
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="600"
                color={textColor}
              >
                Tap to upload image
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={1}>
                or drag and drop here
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                PNG, JPG, WEBP, GIF supported
              </Text>
            </Box>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<BiUpload />}
              pointerEvents="none"
              mt={1}
              borderRadius="lg"
              px={6}
            >
              Browse Files
            </Button>
          </Box>
        ) : (
          /* Image Preview Card */
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
          >
            <CardBody p={4}>
              <Flex align="center" gap={4}>
                <Image
                  src={imageSrc}
                  alt="Uploaded QR Code"
                  boxSize={{ base: "72px", md: "88px" }}
                  objectFit="contain"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={dropzoneBg}
                  p={1}
                  flexShrink={0}
                />
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    noOfLines={1}
                    color={textColor}
                  >
                    {fileName}
                  </Text>
                  <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                    Image ready to scan
                  </Text>
                </Box>
                <IconButton
                  icon={<BiTrash />}
                  aria-label="Clear image"
                  onClick={clearAll}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  flexShrink={0}
                />
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="qr-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        {/* Scanned Result */}
        {scannedText && (
          <Card
            mt={4}
            bg={cardBg}
            border="1px solid"
            borderColor="green.300"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
          >
            <CardBody p={4}>
              <Flex align="center" gap={2} mb={2}>
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg="green.400"
                  flexShrink={0}
                />
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="green.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Scanned Result
                </Text>
              </Flex>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                wordBreak="break-all"
                color={textColor}
                lineHeight="tall"
              >
                {scannedText}
              </Text>
            </CardBody>
            <CardFooter
              p={4}
              pt={0}
              display="flex"
              gap={2}
              flexDirection={{ base: "column", sm: "row" }}
            >
              <Button
                flex={1}
                size="sm"
                colorScheme="teal"
                variant="outline"
                leftIcon={<BiCopy />}
                onClick={handleCopy}
                borderRadius="lg"
              >
                Copy to Clipboard
              </Button>
              <Button
                flex={1}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => setScannedText(null)}
                borderRadius="lg"
              >
                Clear Result
              </Button>
            </CardFooter>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default QRCodeReaderComponent;
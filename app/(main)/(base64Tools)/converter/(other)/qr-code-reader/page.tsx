"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Image,
  useColorModeValue,
  IconButton,
  useClipboard,
  Flex,
  Icon,
  Tabs,
  Heading,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Link,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { BrowserMultiFormatReader } from "@zxing/library";
import {
  BiCopy,
  BiUpload,
  BiX,
  BiLink,
  BiShareAlt,
  BiHistory,
  BiCamera,
  BiImage,
  BiFolderOpen,
  BiClipboard,
} from "react-icons/bi";
import stores from "../../../../../store/stores";

interface HistoryItem {
  text: string;
  timestamp: number;
}

const QRCodeReaderComponent: React.FC = () => {
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dropzoneBorderColor = useColorModeValue("gray.300", "gray.500");
  const dropzoneHoverBg = useColorModeValue("brand.50", "gray.700");
  const dropzoneActiveBorderColor = useColorModeValue("brand.400", "brand.300");
  const iconColor = useColorModeValue("gray.400", "gray.500");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");
  const resultBoxBg = useColorModeValue("gray.50", "gray.900");

  const toast = useToast();
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { onCopy } = useClipboard(scannedText || "");

  const {
    themeStore: { themeConfig },
  } = stores;

  useEffect(() => {
    if (typeof window !== "undefined") {
      codeReader.current = new BrowserMultiFormatReader();
    }
    return () => {
      codeReader.current?.reset();
    };
  }, []);

  const isURL = (text: string) => {
    try {
      const url = new URL(text);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const addToHistory = (text: string) => {
    setHistory((prev) => [{ text, timestamp: Date.now() }, ...prev].slice(0, 20));
  };

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
              addToHistory(result.getText());
              toast({
                title: "QR code detected!",
                status: "success",
                duration: 2000,
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

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-image.png", { type: imageType });
          processFile(file);
          return;
        }
      }
      toast({
        title: "No image found",
        description: "Clipboard doesn't contain an image.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Paste failed",
        description: "Clipboard access denied or unsupported.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };



  const handleCopy = (label = "Result") => {
    onCopy();
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = async () => {
    if (!scannedText) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: scannedText });
      } catch {
        // user cancelled share, ignore
      }
    } else {
      handleCopy();
    }
  };

  const clearAll = () => {
    setImageSrc(null);
    setScannedText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Box px={{ base: 4, md: 6 }} py={6} bg={pageBg} minH="78vh">
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
      <Box
        maxW="1200px"
        mx="auto"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="sm"
      >
        {/* Top bar */}
        <Flex
          justify="space-between"
          align="center"
          px={{ base: 4, md: 6 }}
          py={3}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Tabs
            index={tabIndex}
            onChange={setTabIndex}
            variant="line"
            colorScheme="brand"
          >
            <TabList border="none">
              <Tab fontWeight="600" fontSize="sm" gap={2}>
                <Icon as={BiImage} mr={1} /> Scan Image
              </Tab>
              
            </TabList>
          </Tabs>
          <Text fontSize="xs" color={subtitleColor} display={{ base: "none", md: "block" }}>
            100% Private • Runs in your browser
          </Text>
        </Flex>

        {/* Main grid */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={0}>
          {/* Left: upload / camera */}
          <GridItem
            p={{ base: 4, md: 6 }}
            borderRight={{ base: "none", md: "1px solid" }}
            borderBottom={{ base: "1px solid", md: "none" }}
            borderColor={borderColor}
          >
            {tabIndex === 0 ? (
              !imageSrc ? (
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
                  borderRadius="lg"
                  p={{ base: 8, md: 10 }}
                  cursor="pointer"
                  bg={isDragging ? dropzoneHoverBg : "transparent"}
                  transition="all 0.2s ease"
                  _hover={{ bg: dropzoneHoverBg, borderColor: dropzoneActiveBorderColor }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  minH="260px"
                >
                  <Icon as={BiFolderOpen} boxSize={12} color={iconColor} />
                  <Text fontWeight="600" fontSize="md" color={textColor}>
                    Drag & Drop or Browse
                  </Text>
                  <Text fontSize="xs" color={subtitleColor}>
                    PNG · JPG · WEBP · GIF · BMP
                  </Text>
                </Box>
              ) : (
                <Box position="relative" minH="260px" display="flex" alignItems="center" justifyContent="center">
                  <IconButton
                    icon={<BiX />}
                    aria-label="Clear image"
                    onClick={clearAll}
                    size="sm"
                    borderRadius="full"
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="blackAlpha"
                  />
                  <Image
                    src={imageSrc}
                    alt="Uploaded QR Code"
                    maxH="220px"
                    objectFit="contain"
                    borderRadius="lg"
                  />
                </Box>
              )
            ) : (
              <Box minH="260px" display="flex" alignItems="center" justifyContent="center" borderRadius="lg" overflow="hidden" bg="black">
                <video ref={videoRef} style={{ width: "100%", maxHeight: "260px" }} muted />
              </Box>
            )}

            <input
              ref={fileInputRef}
              id="qr-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {tabIndex === 0 && (
              <Flex gap={2} mt={4} justify="center">
                <Button
                  size="sm"
                  colorScheme="brand"
                  leftIcon={<BiUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  borderRadius="lg"
                >
                  Browse files
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<BiClipboard />}
                  onClick={handlePasteImage}
                  borderRadius="lg"
                >
                  Paste image
                </Button>
              </Flex>
            )}
          </GridItem>

          {/* Right: result */}
          <GridItem p={{ base: 4, md: 6 }}>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="700" fontSize="md" color={textColor}>
                Scanned Result
              </Text>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<BiHistory />}
                onClick={() => setShowHistory((s) => !s)}
                borderRadius="md"
              >
                History
              </Button>
            </Flex>

            {showHistory ? (
              <Box maxH="300px" overflowY="auto">
                {history.length === 0 ? (
                  <Text fontSize="sm" color={subtitleColor}>
                    No scans yet.
                  </Text>
                ) : (
                  history.map((item, idx) => (
                    <Box
                      key={idx}
                      p={2}
                      mb={2}
                      borderRadius="md"
                      bg={resultBoxBg}
                      cursor="pointer"
                      onClick={() => {
                        setScannedText(item.text);
                        setShowHistory(false);
                      }}
                    >
                      <Text fontSize="sm" noOfLines={1} color={textColor}>
                        {item.text}
                      </Text>
                    </Box>
                  ))
                )}
              </Box>
            ) : !scannedText ? (
              <Box
                bg={resultBoxBg}
                borderRadius="lg"
                p={5}
                minH="180px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" color={subtitleColor} fontStyle="italic">
                  Scan a QR code to see results here...
                </Text>
              </Box>
            ) : (
              <Box>
                <Badge
                  colorScheme={isURL(scannedText) ? "blue" : "gray"}
                  borderRadius="md"
                  px={2}
                  py={1}
                  mb={2}
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={BiLink} /> {isURL(scannedText) ? "URL" : "TEXT"}
                </Badge>

                <Box bg={resultBoxBg} borderRadius="lg" p={4} mb={4}>
                  {isURL(scannedText) ? (
                    <>
                      <Text fontSize="xs" color={subtitleColor} mb={1}>
                        URL
                      </Text>
                      <Link
                        href={scannedText}
                        isExternal
                        color={themeConfig?.colors?.brand?.[400] || "blue.500"}
                        wordBreak="break-all"
                        fontWeight="500"
                      >
                        {scannedText}
                      </Link>
                    </>
                  ) : (
                    <Text wordBreak="break-all" color={textColor}>
                      {scannedText}
                    </Text>
                  )}
                </Box>

                <Flex gap={2} mb={3} wrap="wrap">
                  {isURL(scannedText) && (
                    <Button
                      size="sm"
                      colorScheme="brand"
                      leftIcon={<BiLink />}
                      onClick={() => window.open(scannedText, "_blank")}
                      borderRadius="lg"
                    >
                      Open Link
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<BiCopy />}
                    onClick={() => handleCopy(isURL(scannedText) ? "URL" : "Text")}
                    borderRadius="lg"
                  >
                    Copy {isURL(scannedText) ? "URL" : "Result"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<BiShareAlt />}
                    onClick={handleShare}
                    borderRadius="lg"
                  >
                    Share
                  </Button>
                </Flex>

                <Button
                  w="full"
                  colorScheme="brand"
                  onClick={() => handleCopy(isURL(scannedText) ? "URL" : "Text")}
                  borderRadius="lg"
                >
                  Copy Result
                </Button>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Footer */}
        <Flex
          justify="center"
          align="center"
          gap={4}
          px={4}
          py={3}
          borderTop="1px solid"
          borderColor={borderColor}
          bg={resultBoxBg}
        >
          <Text fontSize="xs" color={subtitleColor}>
            🔒 Your images never leave this device — 100% browser-based
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            Powered by ZXing
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default QRCodeReaderComponent;
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Input,
  SimpleGrid,
  Spinner,
  Badge,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCloudUpload,
  MdFileDownload,
  MdDeleteForever,
  MdSettings,
  MdScale,
} from "react-icons/md";
import { AiFillThunderbolt } from "react-icons/ai";

const MotionBox = motion(Box);

const AICompressor: React.FC = () => {
  const [originalFile, setOriginalFile]     = useState<File | null>(null);
  const [originalUrl, setOriginalUrl]       = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl]   = useState<string | null>(null);
  const [loading, setLoading]               = useState<boolean>(false);

  const [mode, setMode]               = useState<"auto" | "manual">("auto");
  const [quality, setQuality]         = useState<number>(0.7);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(0.5);

  const toast = useToast();

  const bg           = useColorModeValue("gray.50", "gray.900");
  const cardBg       = useColorModeValue("white", "gray.800");
  const cardBorder   = useColorModeValue("gray.100", "gray.700");
  const secondaryBg  = useColorModeValue("gray.100", "gray.700");
  const textMuted    = useColorModeValue("gray.400", "gray.500");
  const dropBg       = useColorModeValue("white", "gray.800");
  const dropInnerBg  = useColorModeValue("gray.50", "gray.700");
  const dropBorder   = useColorModeValue("gray.200", "gray.600");
  const hoverBg      = useColorModeValue("blue.50", "blue.900");

  useEffect(() => {
    return () => {
      if (originalUrl)    URL.revokeObjectURL(originalUrl);
      if (compressedUrl)  URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  // ── Core compression ─────────────────────────────────────────────
  // Accepts explicit overrides so it always uses the latest slider values
  // even when called from onDrop (where stale closures can bite).
  const compressImage = useCallback(
    async (
      file: File,
      overrideMode?: "auto" | "manual",
      overrideQuality?: number,
      overrideTargetMB?: number
    ) => {
      setLoading(true);

      const activeMode      = overrideMode      ?? mode;
      const activeQuality   = overrideQuality   ?? quality;
      const activeTargetMB  = overrideTargetMB  ?? targetSizeMB;

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;

        img.onload = async () => {
          const canvas = document.createElement("canvas");
          let width  = img.width;
          let height = img.height;

          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width   = MAX_WIDTH;
          }

          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          let resultBlob: Blob | null = null;

          if (activeMode === "auto") {
            // ── Auto mode: directly use the quality slider value ──────
            resultBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", activeQuality)
            );
          } else {
            // ── Target mode: binary-search for target file size ───────
            const targetBytes = activeTargetMB * 1024 * 1024;
            let minQ = 0.05;
            let maxQ = 1.0;
            let bestBlob: Blob | null = null;

            for (let i = 0; i < 12; i++) {
              const midQ = (minQ + maxQ) / 2;
              const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", midQ)
              );
              if (!blob) continue;

              if (blob.size > targetBytes) {
                maxQ = midQ;
              } else {
                minQ     = midQ;
                bestBlob = blob;
              }
            }
            resultBlob = bestBlob;
          }

          if (resultBlob) {
            if (compressedUrl) URL.revokeObjectURL(compressedUrl);
            setCompressedFile(resultBlob);
            setCompressedUrl(URL.createObjectURL(resultBlob));
            toast({
              title: "Compressed ✓",
              description: `${activeMode === "auto"
                ? `Quality: ${Math.round(activeQuality * 100)}%`
                : `Target: ${activeTargetMB} MB`
              } → ${(resultBlob.size / 1024).toFixed(1)} KB`,
              status: "success",
              duration: 3000,
            });
          } else {
            toast({ title: "Compression failed", status: "error" });
          }

          setLoading(false);
        };
      };
    },
    // intentionally NOT listing mode/quality/targetSizeMB here —
    // we pass them explicitly so callers always control the values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compressedUrl, toast]
  );

  // ── Dropzone ─────────────────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setOriginalFile(file);
        setOriginalUrl(URL.createObjectURL(file));
        // Pass current slider values explicitly to avoid stale closure
        compressImage(file, mode, quality, targetSizeMB);
      }
    },
    [compressImage, mode, quality, targetSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": ["jpeg", "jpg", "png", "webp"] },
    multiple: false,
  });

  const handleDownload = () => {
    if (!compressedUrl) return;
    const link = document.createElement("a");
    link.href     = compressedUrl;
    link.download = `optimized_${originalFile?.name || "image.jpg"}`;
    link.click();
  };

  const reset = () => {
    setOriginalFile(null);
    setCompressedFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
  };

  const reduction =
    originalFile && compressedFile
      ? Math.round(
          ((originalFile.size - compressedFile.size) / originalFile.size) * 100
        )
      : 0;

  return (
    <Box minH="100vh" bg={bg} py={{ base: 6, md: 12 }}>
      <Container maxW="container.xl">

        {/* Header */}
        <Flex justify="space-between" align="center" mb={10}>
          <HStack spacing={3}>
            <Box bg="blue.600" p={2} borderRadius="xl" color="white" shadow="lg">
              <AiFillThunderbolt size="24px" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" letterSpacing="tight" fontWeight="900" textTransform="uppercase">
                IMAGE COMPRESS
              </Heading>
              <Badge colorScheme="green" fontSize="2xs" variant="subtle">
                Set your image size
              </Badge>
            </VStack>
          </HStack>
          {originalFile && (
            <Button variant="ghost" colorScheme="red" leftIcon={<MdDeleteForever />} onClick={reset} size="sm">
              Reset
            </Button>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>

          {/* ── Sidebar Controls ── */}
          <Box gridColumn={{ lg: "span 4" }}>
            <VStack spacing={6} align="stretch">
              <Box bg={cardBg} p={6} borderRadius="3xl" shadow="sm" border="1px" borderColor={cardBorder}>

                {/* Mode toggle */}
                <HStack bg={secondaryBg} p={1} borderRadius="2xl" mb={6}>
                  <Button
                    flex={1} size="sm" borderRadius="xl"
                    variant={mode === "auto" ? "solid" : "ghost"}
                    colorScheme={mode === "auto" ? "blue" : "gray"}
                    onClick={() => setMode("auto")}
                  >
                    Auto
                  </Button>
                  <Button
                    flex={1} size="sm" borderRadius="xl"
                    variant={mode === "manual" ? "solid" : "ghost"}
                    colorScheme={mode === "manual" ? "blue" : "gray"}
                    onClick={() => setMode("manual")}
                  >
                    Target
                  </Button>
                </HStack>

                {mode === "auto" ? (
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="end">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase">
                          Strength
                        </Text>
                        <Text fontSize="xs" color={textMuted}>
                          {quality >= 0.8 ? "High quality" : quality >= 0.5 ? "Balanced" : "Max compression"}
                        </Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="900" color="blue.600">
                        {Math.round(quality * 100)}%
                      </Text>
                    </Flex>
                    <Slider
                      aria-label="quality-slider"
                      min={0.1} max={1} step={0.05}
                      value={quality}
                      onChange={(v) => setQuality(v)}
                    >
                      <SliderTrack bg="blue.50">
                        <SliderFilledTrack bg="blue.500" />
                      </SliderTrack>
                      <SliderThumb boxSize={6} border="2px solid" borderColor="blue.500" />
                    </Slider>
                    <HStack justify="space-between">
                      <Text fontSize="10px" color={textMuted}>Max compress</Text>
                      <Text fontSize="10px" color={textMuted}>Best quality</Text>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase">
                      Target Size (MB)
                    </Text>
                    <Input
                      type="number"
                      value={targetSizeMB}
                      onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                      borderRadius="xl"
                      fontWeight="bold"
                      size="lg"
                      min={0.05}
                      step={0.1}
                    />
                    <Text fontSize="xs" color={textMuted}>
                      Binary search will find the closest quality
                    </Text>
                  </VStack>
                )}

                <Button
                  mt={6} w="full" colorScheme="blue" h="60px" borderRadius="2xl"
                  leftIcon={<MdSettings />}
                  isLoading={loading}
                  // Pass current values explicitly — avoids stale state issue
                  onClick={() =>
                    originalFile &&
                    compressImage(originalFile, mode, quality, targetSizeMB)
                  }
                  isDisabled={!originalFile}
                >
                  Apply Changes
                </Button>
              </Box>

              {compressedFile && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  bg="blue.600" p={6} borderRadius="3xl" color="white"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold" opacity={0.8}>REDUCTION</Text>
                      <Heading size="xl">-{reduction}%</Heading>
                      <Text fontSize="xs" opacity={0.7}>
                        {(originalFile!.size / 1024).toFixed(0)} KB →{" "}
                        {(compressedFile.size / 1024).toFixed(0)} KB
                      </Text>
                    </VStack>
                    <MdScale size="40px" style={{ opacity: 0.3 }} />
                  </HStack>
                </MotionBox>
              )}
            </VStack>
          </Box>

          {/* ── Main Display ── */}
          <Box gridColumn={{ lg: "span 8" }}>
            {!originalFile ? (
              <Box
                {...getRootProps()}
                h="500px" bg={dropBg}
                border="2px dashed"
                borderColor={isDragActive ? "blue.400" : dropBorder}
                borderRadius="3rem"
                transition="all 0.2s"
                cursor="pointer"
                _hover={{ borderColor: "blue.300", bg: hoverBg }}
              >
                <input {...getInputProps()} />
                <VStack h="full" justify="center" spacing={4}>
                  <Box p={6} bg={dropInnerBg} borderRadius="2xl" color={useColorModeValue("gray.300", "gray.500")}>
                    <MdCloudUpload size="48px" />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">Drop image here</Text>
                    <Text color={textMuted}>PNG, JPG or WebP (Max 10MB)</Text>
                  </VStack>
                </VStack>
              </Box>
            ) : (
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  {/* Original */}
                  <Box bg={cardBg} p={4} borderRadius="3xl" border="1px" borderColor={cardBorder}>
                    <HStack justify="space-between" mb={3} px={2}>
                      <Badge variant="subtle">Original</Badge>
                      <Text fontSize="xs" fontWeight="bold" color={textMuted}>
                        {(originalFile.size / 1024).toFixed(1)} KB
                      </Text>
                    </HStack>
                    <Box borderRadius="2xl" overflow="hidden" height="300px" bg={dropInnerBg}>
                      <Image src={originalUrl || ""} alt="original" w="full" h="full" objectFit="contain" />
                    </Box>
                  </Box>

                  {/* Compressed */}
                  <Box
                    bg={cardBg} p={4} borderRadius="3xl" border="1px"
                    borderColor={useColorModeValue("blue.100", "blue.600")} shadow="sm"
                  >
                    <HStack justify="space-between" mb={3} px={2}>
                      <Badge colorScheme="blue">Optimized</Badge>
                      <Text fontSize="xs" fontWeight="bold" color={useColorModeValue("blue.400", "blue.200")}>
                        {compressedFile ? (compressedFile.size / 1024).toFixed(1) : "—"} KB
                      </Text>
                    </HStack>
                    <Box
                      borderRadius="2xl" overflow="hidden" height="300px" bg={dropInnerBg}
                      display="flex" alignItems="center" justifyContent="center"
                    >
                      {loading ? (
                        <VStack spacing={3}>
                          <Spinner color="blue.500" size="xl" />
                          <Text fontSize="xs" color={textMuted}>Compressing…</Text>
                        </VStack>
                      ) : (
                        compressedUrl && (
                          <Image src={compressedUrl} alt="compressed" w="full" h="full" objectFit="contain" />
                        )
                      )}
                    </Box>
                  </Box>
                </SimpleGrid>

                <AnimatePresence>
                  {compressedFile && !loading && (
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      w="full"
                    >
                      <Button
                        w="full" h="70px" colorScheme="gray"
                        bg={useColorModeValue("gray.900", "gray.700")}
                        _hover={{ bg: "blue.600" }}
                        color="white" borderRadius="2xl"
                        leftIcon={<MdFileDownload size="20px" />}
                        onClick={handleDownload}
                      >
                        Download Optimized Image
                      </Button>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </VStack>
            )}
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default AICompressor;
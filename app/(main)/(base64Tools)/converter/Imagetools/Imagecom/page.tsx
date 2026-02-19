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
  IconButton, 
  SimpleGrid,
  Spinner,
  Badge,
  useToast
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdCloudUpload, 
  MdFileDownload, 
  MdDeleteForever, 
  MdSettings, 
  MdHighQuality, 
  MdScale 
} from "react-icons/md";
import { AiFillThunderbolt } from "react-icons/ai";

// Motion Wrapper
const MotionBox = motion(Box);

const AICompressor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [quality, setQuality] = useState<number>(0.7);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(0.5);
  
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  // Native Compression Logic using Canvas
  const compressImage = async (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Simple resizing logic if image is huge
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Calculate quality based on mode
        let finalQuality = quality;
        if (mode === "manual") {
          const targetBytes = targetSizeMB * 1024 * 1024;
          finalQuality = Math.min(0.9, targetBytes / file.size);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (compressedUrl) URL.revokeObjectURL(compressedUrl);
              setCompressedFile(blob);
              setCompressedUrl(URL.createObjectURL(blob));
              setLoading(false);
            }
          },
          "image/jpeg",
          finalQuality
        );
      };
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      compressImage(file);
    }
  }, [quality, mode, targetSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": ["jpeg", "jpg", "png", "webp"] },
    multiple: false,
  });

  const handleDownload = () => {
    if (!compressedUrl) return;
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `optimized_${originalFile?.name || "image.jpg"}`;
    link.click();
  };

  const reset = () => {
    setOriginalFile(null);
    setCompressedFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
  };

  const reduction = originalFile && compressedFile 
    ? Math.round(((originalFile.size - compressedFile.size) / originalFile.size) * 100)
    : 0;

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 6, md: 12 }}>
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
              <Badge colorScheme="green" fontSize="2xs" variant="subtle">Set your image size</Badge>
            </VStack>
          </HStack>
          {originalFile && (
            <Button 
              variant="ghost" 
              colorScheme="red" 
              leftIcon={<MdDeleteForever />} 
              onClick={reset}
              size="sm"
            >
              Reset
            </Button>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
          
          {/* Sidebar Controls */}
          <Box gridColumn={{ lg: "span 4" }}>
            <VStack spacing={6} align="stretch">
              <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px" borderColor="gray.100">
                <HStack bg="gray.100" p={1} borderRadius="2xl" mb={6}>
                  <Button
                    flex={1}
                    size="sm"
                    borderRadius="xl"
                    variant={mode === "auto" ? "white" : "ghost"}
                    bg={mode === "auto" ? "white" : "transparent"}
                    shadow={mode === "auto" ? "sm" : "none"}
                    onClick={() => setMode("auto")}
                  >
                    Auto
                  </Button>
                  <Button
                    flex={1}
                    size="sm"
                    borderRadius="xl"
                    variant={mode === "manual" ? "white" : "ghost"}
                    bg={mode === "manual" ? "white" : "transparent"}
                    shadow={mode === "manual" ? "sm" : "none"}
                    onClick={() => setMode("manual")}
                  >
                    Target
                  </Button>
                </HStack>

                {mode === "auto" ? (
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="end">
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Strength</Text>
                      <Text fontSize="2xl" fontWeight="900" color="blue.600">{Math.round(quality * 100)}%</Text>
                    </Flex>
                    <Slider aria-label="quality-slider" min={0.1} max={1} step={0.1} value={quality} onChange={(v) => setQuality(v)}>
                      <SliderTrack bg="blue.50">
                        <SliderFilledTrack bg="blue.500" />
                      </SliderTrack>
                      <SliderThumb boxSize={6} border="2px solid" borderColor="blue.500" />
                    </Slider>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Target Size (MB)</Text>
                    <Input 
                      type="number" 
                      value={targetSizeMB} 
                      onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                      borderRadius="xl"
                      fontWeight="bold"
                      size="lg"
                    />
                  </VStack>
                )}

                <Button
                  mt={6}
                  w="full"
                  colorScheme="blue"
                  h="60px"
                  borderRadius="2xl"
                  leftIcon={<MdSettings />}
                  isLoading={loading}
                  onClick={() => originalFile && compressImage(originalFile)}
                  disabled={!originalFile}
                >
                  Apply Changes
                </Button>
              </Box>

              {compressedFile && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  bg="blue.600"
                  p={6}
                  borderRadius="3xl"
                  color="white"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold" opacity={0.8}>REDUCTION</Text>
                      <Heading size="xl">-{reduction}%</Heading>
                    </VStack>
                    <MdScale size="40px" style={{ opacity: 0.3 }} />
                  </HStack>
                </MotionBox>
              )}
            </VStack>
          </Box>

          {/* Main Display */}
          <Box gridColumn={{ lg: "span 8" }}>
            {!originalFile ? (
              <Box
                {...getRootProps()}
                h="500px"
                bg="white"
                border="2px dashed"
                borderColor={isDragActive ? "blue.400" : "gray.200"}
                borderRadius="3rem"
                transition="all 0.2s"
                cursor="pointer"
                _hover={{ borderColor: "blue.300", bg: "blue.50/30" }}
              >
                <input {...getInputProps()} />
                <VStack h="full" justify="center" spacing={4}>
                  <Box p={6} bg="gray.50" borderRadius="2xl" color="gray.300">
                    <MdCloudUpload size="48px" />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">Drop image here</Text>
                    <Text color="gray.400">PNG, JPG or WebP (Max 10MB)</Text>
                  </VStack>
                </VStack>
              </Box>
            ) : (
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  {/* Original Card */}
                  <Box bg="white" p={4} borderRadius="3xl" border="1px" borderColor="gray.100">
                    <HStack justify="space-between" mb={3} px={2}>
                      <Badge variant="subtle">Original</Badge>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400">
                        {(originalFile.size / 1024).toFixed(1)} KB
                      </Text>
                    </HStack>
                    <Box borderRadius="2xl" overflow="hidden" height="300px" bg="gray.50">
                      <Image src={originalUrl || ""} alt="original" w="full" h="full" objectFit="contain" />
                    </Box>
                  </Box>

                  {/* Optimized Card */}
                  <Box bg="white" p={4} borderRadius="3xl" border="1px" borderColor="blue.100" shadow="sm">
                    <HStack justify="space-between" mb={3} px={2}>
                      <Badge colorScheme="blue">Optimized</Badge>
                      <Text fontSize="xs" fontWeight="bold" color="blue.400">
                        {compressedFile ? (compressedFile.size / 1024).toFixed(1) : "0"} KB
                      </Text>
                    </HStack>
                    <Box borderRadius="2xl" overflow="hidden" height="300px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                      {loading ? (
                        <Spinner color="blue.500" size="xl" />
                      ) : (
                        compressedUrl && <Image src={compressedUrl} alt="compressed" w="full" h="full" objectFit="contain" />
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
                        w="full"
                        h="70px"
                        colorScheme="gray"
                        bg="gray.900"
                        _hover={{ bg: "blue.600" }}
                        color="white"
                        borderRadius="2xl"
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
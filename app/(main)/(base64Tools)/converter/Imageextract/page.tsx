"use client";
import React, { useState, useCallback } from 'react';
import {
  Box, VStack, Heading, Text, SimpleGrid, Image, useToast,
  Spinner, Center, Icon, Container, Button, Badge,
  useColorModeValue, Stack, Flex, ScaleFade, HStack as ChakraHStack
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  FileUp,
  Download,
  Layers,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  Zap,
  Wand2
} from 'lucide-react';

// Initialize PDF.js Worker - Fixed URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface ExtractedImage {
  id: string;
  url: string;
  name: string;
  blob: Blob;
  dimensions: string;
  format: 'PDF' | 'Word';
}

const SkyBlueExtractor: React.FC = () => {
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  // Sky Blue Theme Palette
  const bgColor = useColorModeValue("blue.50", "gray.900");
  const cardColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("blue.100", "gray.700");

  const processWord = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const imageResults = await mammoth.convertToHtml({ arrayBuffer });
    const div = document.createElement('div');
    div.innerHTML = imageResults.value;
    const imgTags = div.getElementsByTagName('img');

    const wordImgs: ExtractedImage[] = [];
    for (let i = 0; i < imgTags.length; i++) {
      const src = imgTags[i].src;
      const response = await fetch(src);
      const blob = await response.blob();
      wordImgs.push({
        id: `word-${i}-${Date.now()}`,
        url: src,
        name: `word_asset_${i}.png`,
        blob,
        dimensions: "Original",
        format: 'Word'
      });
    }
    return wordImgs;
  };

  const processPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pdfImgs: ExtractedImage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const operatorList = await page.getOperatorList();
      const viewport = page.getViewport({ scale: 2.0 });
      let lastMatrix = [1, 0, 0, 1, 0, 0];

      for (let j = 0; j < operatorList.fnArray.length; j++) {
        const fn = operatorList.fnArray[j];
        const args = operatorList.argsArray[j];

        if (fn === pdfjs.OPS.transform) lastMatrix = args;

        if (fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintInlineImageXObject) {
          const imgKey = args[0];
          try {
            const img = await new Promise<any>((resolve) => {
              page.objs.get(imgKey, (obj) => resolve(obj));
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            if (img && img.data) {
              canvas.width = img.width;
              canvas.height = img.height;
              const imageData = ctx.createImageData(img.width, img.height);
              
              if (img.data.length === img.width * img.height * 4) {
                imageData.data.set(img.data);
              } else {
                for (let k = 0, l = 0; l < imageData.data.length; k += 3, l += 4) {
                  imageData.data[l] = img.data[k];
                  imageData.data[l + 1] = img.data[k + 1];
                  imageData.data[l + 2] = img.data[k + 2];
                  imageData.data[l + 3] = 255;
                }
              }
              ctx.putImageData(imageData, 0, 0);
            } else {
              const [scaleX, , , scaleY, translateX, translateY] = lastMatrix;
              const rect = viewport.convertToViewportRectangle([translateX, translateY, translateX + scaleX, translateY + scaleY]);
              const w = Math.max(1, Math.abs(rect[2] - rect[0]));
              const h = Math.max(1, Math.abs(rect[3] - rect[1]));
              
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = viewport.width; 
              pageCanvas.height = viewport.height;
              const pageCtx = pageCanvas.getContext('2d');

              if (!pageCtx) continue;
              await page.render({ canvasContext: pageCtx, viewport }).promise;
              
              canvas.width = w; 
              canvas.height = h;
              ctx.drawImage(pageCanvas, Math.min(rect[0], rect[2]), Math.min(rect[1], rect[3]), w, h, 0, 0, w, h);
            }

            const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
            if (blob) {
              pdfImgs.push({
                id: `pdf-${i}-${j}-${Math.random()}`,
                url: URL.createObjectURL(blob),
                name: `pdf_asset_p${i}_${j}.png`,
                blob,
                dimensions: `${Math.round(canvas.width)}x${Math.round(canvas.height)}`,
                format: 'PDF'
              });
            }
          } catch (e) { console.warn("Asset skipped", e); }
        }
      }
    }
    return pdfImgs;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setImages([]);

    try {
      let extracted: ExtractedImage[] = [];
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.docx')) {
        extracted = await processWord(file);
      } else if (fileName.endsWith('.pdf')) {
        extracted = await processPDF(file);
      }

      setImages(extracted);
      toast({
        title: "Extraction Complete",
        description: `Found ${extracted.length} high-quality assets.`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Unsupported or corrupted file.", 
        status: "error" 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const downloadAll = async () => {
    const zip = new JSZip();
    images.forEach((img) => zip.file(img.name, img.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'skyblue_assets.zip');
  };

  return (
    <Box minH="100vh" bg={bgColor} py={12} px={4}>
      <Container maxW="container.xl">
        <VStack spacing={10} align="stretch">
          {/* Hero Section */}
          <Flex direction="column" align="center" textAlign="center">
            <ChakraHStack spacing={2} mb={4}>
              <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">PDF</Badge>
              <Badge colorScheme="cyan" variant="solid" px={3} py={1} borderRadius="full">DOCX</Badge>
            </ChakraHStack>
            <Heading size="2xl" color="blue.800" fontWeight="900" mb={3} letterSpacing="tight">
              SkyBlue <Text as="span" color="blue.500">Asset Studio</Text>
            </Heading>
            <Text fontSize="lg" color="blue.600" maxW="2xl">
              Professional document deconstruction. Extract every embedded image layer with zero quality loss.
            </Text>
          </Flex>

          {/* Upload Area */}
          <Box
            {...getRootProps()}
            bg={cardColor}
            p={16}
            borderRadius="3xl"
            border="2px dashed"
            borderColor={isDragActive ? "blue.400" : "blue.200"}
            boxShadow="2xl"
            cursor="pointer"
            transition="0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{ transform: "translateY(-4px)", boxShadow: "3xl", borderColor: "blue.400" }}
          >
            <input {...getInputProps()} />
            <VStack spacing={6}>
              <Box p={5} bg="blue.50" borderRadius="full" border="1px solid" borderColor="blue.100">
                <Icon as={FileUp} w={10} h={10} color="blue.500" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color="blue.900">
                  {isDragActive ? "Release to Scan" : "Drag & Drop Document"}
                </Text>
                <Text color="blue.400">Supports .PDF and .DOCX formats</Text>
              </VStack>
            </VStack>
          </Box>

          {/* Features Bar */}
          <SimpleGrid columns={[1, 3]} spacing={6}>
            <FeatureItem icon={ShieldCheck} title="Privacy First" desc="Extraction happens entirely in-browser" />
            <FeatureItem icon={Zap} title="Instant Speed" desc="High-performance layer deconstruction" />
            <FeatureItem icon={Wand2} title="Smart Cropping" desc="Auto-detects hidden document graphics" />
          </SimpleGrid>

          {isProcessing && (
            <Center py={10} flexDirection="column">
              <Spinner size="xl" thickness="4px" speed="0.8s" color="blue.500" mb={4} />
              <Text fontWeight="bold" color="blue.700">Analyzing Document Layers...</Text>
              <Text fontSize="sm" color="blue.400">Isolating bitmap assets</Text>
            </Center>
          )}

          {/* Results Area */}
          {images.length > 0 && (
            <ScaleFade in={true}>
              <VStack align="stretch" spacing={6}>
                <Flex justify="space-between" align="center" bg="white" p={5} borderRadius="2xl" shadow="lg">
                  <ChakraHStack spacing={3}>
                    <Icon as={Layers} color="blue.500" />
                    <Text fontWeight="800" color="blue.800" fontSize="lg">
                      {images.length} Assets Recovered
                    </Text>
                  </ChakraHStack>
                  <Button
                    leftIcon={<Download size={18}/>}
                    colorScheme="blue"
                    borderRadius="full"
                    px={8}
                    onClick={downloadAll}
                    shadow="blue.200"
                  >
                    Download ZIP
                  </Button>
                </Flex>

                <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
                  {images.map((img) => (
                    <Box
                      key={img.id}
                      bg={cardColor}
                      borderRadius="2xl"
                      overflow="hidden"
                      border="1px solid"
                      borderColor={borderColor}
                      transition="0.2s"
                      _hover={{ shadow: "xl", transform: "scale(1.02)" }}
                    >
                      <Box h="200px" bg="gray.50" p={3} position="relative">
                        <Image src={img.url} alt="asset" h="100%" w="100%" objectFit="contain" />
                        <Badge position="absolute" top={3} right={3} colorScheme={img.format === 'PDF' ? 'blue' : 'cyan'} variant="solid">
                          {img.format}
                        </Badge>
                      </Box>
                      <Box p={4}>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1} color="blue.900" mb={1}>{img.name}</Text>
                        <Text fontSize="xs" fontWeight="medium" color="blue.300">{img.dimensions}</Text>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </ScaleFade>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <Flex align="center" gap={4} p={5} bg="white" borderRadius="2xl" border="1px solid" borderColor="blue.50" shadow="sm">
    <Icon as={icon} w={6} h={6} color="blue.500" />
    <Box>
      <Text fontWeight="bold" fontSize="sm" color="blue.900">{title}</Text>
      <Text fontSize="xs" color="blue.400">{desc}</Text>
    </Box>
  </Flex>
);

export default SkyBlueExtractor;
"use client";
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  SimpleGrid,
  Image,
  Progress,
  IconButton,
  useToast,
  Center,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiUpload, 
  FiFileText, 
  FiDownload, 
  FiTrash2, 
  FiArchive, 
  FiCheckCircle 
} from 'react-icons/fi';

// pdfjs-dist is a dependency of react-pdf
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Configure the worker using the CDN version compatible with your react-pdf version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface ImageResult {
  url: string;
  pageNumber: number;
  blob: Blob;
}

const PdfToJpgConverter = () => {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const clearImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setFileName('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertPdfToJpg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setLoading(true);
    setProgress(0);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const convertedImages: ImageResult[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95)
        );

        const url = URL.createObjectURL(blob);
        convertedImages.push({ url, pageNumber: i, blob });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setImages(convertedImages);
      toast({
        title: "Conversion Complete",
        description: `Successfully processed ${pdf.numPages} pages.`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. The file might be corrupted or encrypted.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    images.forEach((img) => {
      zip.file(`${fileName}-page-${img.pageNumber}.jpg`, img.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${fileName}-images.zip`);
  };

  return (
    <Container maxW="container.lg" py={10}>
      {/* Header */}
      <HStack justifyContent="space-between" mb={8} flexWrap="wrap" spacing={4}>
        <VStack align="start" spacing={0}>
          <HStack>
            <Box bg="blue.600" p={2} borderRadius="lg" color="white">
              <Icon as={FiFileText} boxSize={6} />
            </Box>
            <Heading size="lg" letterSpacing="tight">PDF to JPG</Heading>
          </HStack>
          <Text color="gray.500" fontWeight="medium">Convert document pages to high-quality images</Text>
        </VStack>

        {images.length > 0 && (
          <HStack spacing={3}>
            <Button 
              variant="ghost" 
              colorScheme="red" 
              leftIcon={<FiTrash2 />} 
              onClick={clearImages}
            >
              Reset
            </Button>
            <Button 
              colorScheme="messenger" 
              leftIcon={<FiArchive />} 
              onClick={downloadAllAsZip}
              boxShadow="lg"
            >
              Download ZIP
            </Button>
          </HStack>
        )}
      </HStack>

      {/* Main Area */}
      <Box 
        bg="white" 
        borderRadius="3xl" 
        p={8} 
        border="1px solid" 
        borderColor="gray.100" 
        shadow="xl"
      >
        {!loading && images.length === 0 ? (
          <Center
            as="label"
            htmlFor="pdf-upload"
            cursor="pointer"
            border="3px dashed"
            borderColor="gray.200"
            borderRadius="2xl"
            h="300px"
            transition="all 0.2s"
            _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
            flexDirection="column"
          >
            <VStack spacing={4}>
              <Box bg="blue.50" color="blue.600" p={4} borderRadius="full">
                <Icon as={FiUpload} boxSize={8} />
              </Box>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="bold">Choose a PDF file</Text>
                <Text color="gray.400">or drag and drop it here</Text>
              </VStack>
            </VStack>
            <input 
              id="pdf-upload"
              type="file" 
              hidden 
              accept="application/pdf" 
              onChange={convertPdfToJpg} 
              ref={fileInputRef}
            />
          </Center>
        ) : loading ? (
          <Center h="300px" flexDirection="column">
            <VStack spacing={6} w="full" maxW="md">
              <Box position="relative" display="inline-flex">
                <Progress 
                  value={progress} 
                  size="xs" 
                  width="200px" 
                  borderRadius="full" 
                  colorScheme="blue" 
                  isAnimated
                />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="bold">Processing Pages...</Text>
                <Text fontSize="sm" color="gray.500">{progress}% complete</Text>
              </VStack>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing={8}>
            {images.map((img) => (
              <Box 
                key={img.pageNumber} 
                bg="gray.50" 
                p={3} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="gray.100"
                role="group"
                position="relative"
              >
                <Box 
                  borderRadius="xl" 
                  overflow="hidden" 
                  bg="white" 
                  position="relative"
                  transition="transform 0.2s"
                  _groupHover={{ transform: 'translateY(-4px)' }}
                >
                  <Image src={img.url} alt={`Page ${img.pageNumber}`} />
                  
                  {/* Hover Overlay */}
                  <Center
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.600"
                    opacity={0}
                    transition="opacity 0.2s"
                    _groupHover={{ opacity: 1 }}
                  >
                    <Tooltip label="Download Image">
                      <IconButton
                        as="a"
                        href={img.url}
                        download={`${fileName}-page-${img.pageNumber}.jpg`}
                        aria-label="Download"
                        icon={<FiDownload />}
                        size="lg"
                        colorScheme="whiteAlpha"
                        variant="solid"
                        borderRadius="full"
                      />
                    </Tooltip>
                  </Center>
                </Box>

                <HStack justify="space-between" mt={4} px={1}>
                  <Text fontSize="xs" fontWeight="black" color="gray.400" letterSpacing="widest">
                    PAGE {img.pageNumber}
                  </Text>
                  <HStack spacing={1} color="green.500">
                    <Icon as={FiCheckCircle} boxSize={3} />
                    <Text fontSize="10px" fontWeight="bold">JPG</Text>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
};

export default PdfToJpgConverter;
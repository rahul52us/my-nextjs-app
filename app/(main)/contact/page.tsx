'use client';

import React, { useState } from 'react';
import { Box, Button, Input, Textarea, VStack, FormControl, FormLabel, Text, Container, Heading, useToast, Icon, useBreakpointValue } from '@chakra-ui/react';
import { FaImage, FaFileDownload, FaFilePdf } from 'react-icons/fa'; // Icons for image, file, and PDF

const FileUrlToBase64: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string>(''); // To store the URL
  const [base64String, setBase64String] = useState<string>(''); // To store the Base64 string
  const [loading, setLoading] = useState<boolean>(false); // To handle loading state
  const [fileType, setFileType] = useState<string>(''); // To store the file type (image, pdf, etc.)
  const toast = useToast(); // To show toast messages

  const fetchFile = async (url: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(url); // Fetch the file from the URL
      const blob = await response.blob(); // Convert it to a Blob
      const contentType = blob.type; // Get the file type (image, pdf, etc.)

      setFileType(contentType);

      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          setBase64String(reader.result as string); // Set the Base64 string
        }
      };

      if (contentType.startsWith('image/')) {
        reader.readAsDataURL(blob);
      } else if (contentType === 'application/pdf') {
        const fileURL = URL.createObjectURL(blob);
        setBase64String(fileURL); // Store the Blob URL
      } else {
        const fileURL = URL.createObjectURL(blob);
        setBase64String(fileURL); // For non-image types, store the Blob URL
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch file. Please check the URL.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFileUrl(e.target.value);
  };

  const handleConvert = (): void => {
    if (fileUrl.trim()) {
      fetchFile(fileUrl); // Fetch file from the URL
    } else {
      toast({
        title: 'Input Error',
        description: 'Please enter a valid file URL.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false }); // Mobile vs desktop layout

  const downloadFile = () => {
    if (fileType.startsWith('image/')) {
      const link = document.createElement('a');
      link.href = base64String;
      link.download = 'image';
      link.click();
    } else if (fileType === 'application/pdf') {
      const link = document.createElement('a');
      link.href = base64String;
      link.download = 'document.pdf';
      link.click();
    } else {
      toast({
        title: 'Unsupported File Type',
        description: 'This file type is not supported for download.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="xl" centerContent p={6} bg="gray.800" borderRadius="lg" boxShadow="xl" overflow="hidden">
      <VStack spacing={8} width="100%">
        <Heading as="h2" size="2xl" fontWeight="bold" color="teal.400" textAlign="center">
          Convert File URL to Base64
        </Heading>

        <Box width={isMobile ? '100%' : '80%'} bg="gray.900" p={6} borderRadius="lg" boxShadow="xl" color="white">
          <VStack spacing={6}>
            <FormControl>
              <FormLabel color="teal.300" fontWeight="semibold">Enter File URL</FormLabel>
              <Input
                type="url"
                value={fileUrl}
                onChange={handleFileUrlChange}
                placeholder="Paste file URL here"
                bg="gray.700"
                color="white"
                borderRadius="md"
                focusBorderColor="teal.400"
                borderColor="gray.600"
                size="lg"
                _placeholder={{ color: 'gray.500' }}
                transition="all 0.3s ease"
                _focus={{ borderColor: 'teal.500', transform: 'scale(1.05)' }}
              />
            </FormControl>

            <Button
              colorScheme="teal"
              onClick={handleConvert}
              isLoading={loading}
              isDisabled={!fileUrl.trim()}
              size="lg"
              width="full"
              borderRadius="full"
              _hover={{ transform: 'scale(1.1)', bg: 'teal.500' }}
              _active={{ bg: 'teal.600' }}
            >
              Convert to Base64
            </Button>
          </VStack>
        </Box>

        {base64String && (
          <Box mt={6} width="100%" bg="gray.700" p={4} borderRadius="lg" boxShadow="md">
            <Text fontSize="lg" fontWeight="semibold" color="teal.300" mb={2}>Base64 String</Text>
            <Textarea
              value={base64String}
              readOnly
              rows={6}
              bg="white"
              color="black"
              borderRadius="md"
              borderColor="gray.500"
              boxShadow="sm"
              _focus={{ borderColor: 'teal.500' }}
            />
          </Box>
        )}

        {fileType.startsWith('image/') && base64String && (
          <Box mt={6} width="100%" textAlign="center">
            <Text fontSize="lg" fontWeight="semibold" color="teal.300" mb={2}>Image Preview</Text>
            <Box p={4} borderRadius="lg" bg="gray.700" boxShadow="sm" display="inline-block" width="100%">
              <img
                src={base64String}
                alt="Image Preview"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: 'lg' }}
              />
            </Box>
          </Box>
        )}

        {fileType === 'application/pdf' && base64String && (
          <Box mt={6} width="100%" textAlign="center">
            <Text fontSize="lg" fontWeight="semibold" color="teal.300" mb={2}>PDF Document</Text>
            <Box p={4} borderRadius="lg" bg="gray.700" boxShadow="sm" display="inline-block" width="100%">
              <a href={base64String} target="_blank" rel="noopener noreferrer">
                <Button colorScheme="teal" size="lg" leftIcon={<FaFilePdf />} variant="solid">
                  Open PDF
                </Button>
              </a>
            </Box>
          </Box>
        )}

        <Button
          position="fixed"
          bottom={6}
          right={6}
          colorScheme="teal"
          borderRadius="full"
          size="lg"
          boxShadow="lg"
          onClick={downloadFile}
          aria-label="Download File"
        >
          <Icon as={FaFileDownload} />
        </Button>
      </VStack>
    </Container>
  );
};

export default FileUrlToBase64;

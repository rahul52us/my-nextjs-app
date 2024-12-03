'use client';

import { useState, ChangeEvent } from 'react';
import { saveAs } from 'file-saver';
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
} from '@chakra-ui/react';

const Base64ToFile = () => {
  const [base64, setBase64] = useState<string>('');

  const extractMimeAndData = (input: string) => {
    const regex = /^data:(.*?);base64,(.*)$/;
    const matches = input.match(regex);
    if (matches) {
      return {
        mimeType: matches[1],
        base64Data: matches[2],
      };
    }
    return { mimeType: 'application/octet-stream', base64Data: input };
  };

  const generateFileName = (mimeType: string) => {
    const extension = mimeType.split('/')[1] || 'bin';
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    return `file_${timestamp}.${extension}`;
  };

  const handleConvert = () => {
    if (!base64.trim()) {
      alert('Please enter a valid Base64 string.');
      return;
    }

    const { mimeType, base64Data } = extractMimeAndData(base64);
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const fileName = generateFileName(mimeType);
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error converting Base64:', error);
      alert('Invalid Base64 data. Please check the input format.');
    }
  };

  const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBase64(e.target.value);
  };

  return (
    <Box
      p={8}
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('gray.800', 'white')}
      rounded="lg"
      shadow="lg"
      maxW="lg"
      mx="auto"
    >
      <Heading as="h2" size="xl" textAlign="center" mb={6} fontWeight="bold" color="teal.500">
        Base64 to File Converter
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
            rows={8}
            bg={useColorModeValue('gray.100', 'gray.700')}
            color={useColorModeValue('gray.800', 'white')}
            rounded="md"
            shadow="sm"
            _hover={{ borderColor: 'teal.300' }}
            _focus={{ borderColor: 'teal.500', boxShadow: 'outline' }}
          />
        </FormControl>
        <Button
          colorScheme="teal"
          size="lg"
          width="full"
          onClick={handleConvert}
          _hover={{ bg: 'teal.600' }}
        >
          Convert & Download
        </Button>
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
          Ensure your Base64 starts with "data:" prefix for best results.
        </Text>
      </VStack>
    </Box>
  );
};

export default Base64ToFile;

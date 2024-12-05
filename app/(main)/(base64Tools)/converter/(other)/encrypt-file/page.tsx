'use client'

import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button, Input, VStack } from '@chakra-ui/react';

const FileEncryption = () => {
  const [file, setFile] = useState<File | null>(null);
  const [secretKey, setSecretKey] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSecretKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretKey(e.target.value);
  };

  const encryptFile = () => {
    if (file && secretKey) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileContent = event.target.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(fileContent);

          // Encrypt the binary data using AES
          const encrypted = CryptoJS.AES.encrypt(wordArray, secretKey).toString();

          // Create a Blob from the encrypted data (Base64 encoded)
          const blob = new Blob([encrypted], { type: 'application/octet-stream' });

          // Create a download link for the encrypted file
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = file.name + '.enc';
          downloadLink.click();
        }
      };
      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer (binary)
    } else {
      alert('Please select a file and enter a secret key.');
    }
  };









  return (
    <VStack spacing={4} align="stretch">
      <Input
        type="file"
        onChange={handleFileChange}
        placeholder="Choose a file to encrypt"
      />
      <Input
        type="text"
        value={secretKey}
        onChange={handleSecretKeyChange}
        placeholder="Enter secret key"
      />
      <Button onClick={encryptFile} colorScheme="blue">
        Encrypt File
      </Button>
    </VStack>
  );
};

export default FileEncryption;

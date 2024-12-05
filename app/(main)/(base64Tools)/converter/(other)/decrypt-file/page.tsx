'use client'

import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button, Input, VStack } from '@chakra-ui/react';

const FileDecryption = () => {
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

  const decryptFile = () => {
    if (file && secretKey) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          const encryptedDataWithMeta = event.target.result as string;

          try {
            // Decrypt the encrypted data
            const bytes = CryptoJS.AES.decrypt(encryptedDataWithMeta, secretKey);

            if (bytes.sigBytes <= 0) {
              throw new Error('Invalid decryption or incorrect key.');
            }

            const decryptedData = bytes.toString(CryptoJS.enc.Base64);
            const binaryString = atob(decryptedData);

            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              byteArray[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: 'application/octet-stream' });

            const filenameParts = file.name.split('.');
            filenameParts.pop(); // Remove the last '.enc'
            const originalExtension = filenameParts.pop() || ''; // Get the real extension

            const originalName = filenameParts.join('.');

            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${originalName}.${originalExtension}`;
            downloadLink.click();
          } catch (error) {
            alert('Decryption failed: Invalid secret key or corrupted file.');
            console.error('Decryption Error:', error);
          }
        }
      };

      reader.readAsText(file);
    } else {
      alert('Please select a file and enter a secret key.');
    }
  };





  return (
    <VStack spacing={4} align="stretch">
      <Input
        type="file"
        onChange={handleFileChange}
        placeholder="Choose an encrypted file"
      />
      <Input
        type="text"
        value={secretKey}
        onChange={handleSecretKeyChange}
        placeholder="Enter secret key"
      />
      <Button onClick={decryptFile} colorScheme="blue">
        Decrypt File
      </Button>
    </VStack>
  );
};

export default FileDecryption;

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Input,
  Image,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  CardFooter,
  IconButton,
  useClipboard,
} from "@chakra-ui/react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { BiCopy } from "react-icons/bi";

const QRCodeReaderComponent: React.FC = () => {
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const toast = useToast();
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { onCopy } = useClipboard(scannedText || ""); // Chakra's clipboard hook

  useEffect(() => {
    if (typeof window !== "undefined") {
      codeReader.current = new BrowserMultiFormatReader();
    }
  }, []);

  const decodeQRCodeFromImage = (imageSrc: string) => {
    const imgElement = document.createElement("img");
    imgElement.src = imageSrc;

    imgElement.onload = () => {
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        codeReader.current
          ?.decodeFromImage(imgElement)
          .then((result) => {
            if (result && result.getText()) {
              setScannedText(result.getText());
              toast({
                title: "QR Code Scanned",
                description: `Scanned data: ${result.getText()}`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            } else {
              toast({
                title: "Scan Failed",
                description: "Could not decode QR code from image.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          })
          .catch((error) => {
            console.log(error)
            toast({
              title: "Scan Failed",
              description: "Could not decode QR code from image.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          });
      } else {
        console.error("Image failed to load properly.");
      }
    };

    imgElement.onerror = () => {
      console.error("Error loading image.");
      toast({
        title: "Image Load Error",
        description: "There was an error loading the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageSrc(reader.result as string);
          decodeQRCodeFromImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    onCopy();
    toast({
      title: "Copied!",
      description: "The scanned QR code data has been copied to clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH={"78vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={4}>
        QR Code Reader
        <Text fontSize="lg" color="gray.500" mt={2}>
          Scan QR codes from images and extract the data easily
        </Text>
      </Heading>

      <Box mt={6} textAlign="center">
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          mb={4}
        />
        {imageSrc && (
          <Box>
            <Image
              src={imageSrc}
              alt="Uploaded QR Code"
              boxSize="200px"
              objectFit="contain"
              mb={4}
            />
            <Button
              colorScheme="red"
              onClick={() => setImageSrc(null)}
              variant="outline"
            >
              Clear Image
            </Button>
          </Box>
        )}
      </Box>

      {scannedText && (
        <Box textAlign="center" mt={6}>
          <Card maxW="lg" mx="auto" p={4} boxShadow="md" borderRadius="lg">
            <CardBody>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                Scanned Result:
              </Text>
              <Text
                fontSize="md"
                mt={2}
                wordBreak="break-word"
                textAlign="center"
              >
                {scannedText}
              </Text>
            </CardBody>
            <CardFooter
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                colorScheme="blue"
                onClick={() => setScannedText(null)}
                variant="outline"
                width="full"
              >
                Clear Scanned Data
              </Button>
              <IconButton
                icon={<BiCopy />}
                onClick={handleCopy}
                colorScheme="teal"
                aria-label="Copy to clipboard"
                variant="outline"
              />
            </CardFooter>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default QRCodeReaderComponent;

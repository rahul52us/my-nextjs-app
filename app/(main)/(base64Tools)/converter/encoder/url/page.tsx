"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  useColorModeValue,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { FaClipboard, FaDownload, FaTrashAlt, FaShareAlt } from "react-icons/fa";
import { saveAs } from "file-saver";

const UrlToBase64 = () => {
  const [base64, setBase64] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleUrlToBase64 = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBase64(base64String);
        setFileName(url.split("/").pop() || "file-from-url");
        toast({
          title: "Conversion Successful",
          description: "URL content has been converted to Base64.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to fetch or convert the URL content.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false); // End loading on error
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to fetch or convert the URL content.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false); // End loading on error
    }
  };

  const handleCopyToClipboard = () => {
    if (!base64) return;

    // Include the Base64 prefix (e.g., data:image/png;base64, or application/octet-stream)
    const base64WithPrefix = base64.startsWith("data:")
      ? base64
      : `data:${fileName ? `application/octet-stream` : ""};base64,${base64.split(",")[1]}`;

    navigator.clipboard
      .writeText(base64WithPrefix) // Copy the Base64 string with the prefix
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Base64 string with prefix copied successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy to clipboard.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleDownload = () => {
    if (!base64) return;

    const blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${fileName || "file-from-url"}.txt`);
  };

  const handleReset = () => {
    setBase64("");
    setUrl("");
    setFileName(null);
  };

  const handleShare = async () => {
    const textToShare = base64
    if(!base64){
      alert('Invalid Base64')
      return
    }
    // Create a Blob from the text content
    const blob = new Blob([textToShare], { type: 'text/plain' });
    const file = new File([blob], "output.txt", { type: 'text/plain' });

    if (navigator.share) {
      try {
        // Ensure the file is shareable by checking if the device supports it
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Base64 File Converter",
            files: [file],
          });
          toast({
            title: "Shared Successfully",
            description: "The formatted output was shared successfully as a file.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Sharing Not Supported",
            description: "This device/browser does not support file sharing.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error : any) {
        console.error("Error sharing the file:", error);
        toast({
          title: "Share Failed",
          description: error?.message || "There was an issue sharing the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Share Unavailable",
        description: "Sharing is not supported on this device/browser.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };




  return (
    <Box p={4} bg={bgColor} color={textColor} minH="78vh">
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        mb={6}
        textTransform="uppercase"
      >
        URL to Base64
      </Heading>
      <VStack spacing={2} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter URL
          </FormLabel>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com/image.png)"
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleUrlToBase64}
          isDisabled={!url || loading} // Disable button during loading
        >
          {loading ? <Spinner size="sm" /> : "Convert URL to Base64"}
        </Button>

        {fileName && (
          <FormControl>
            <FormLabel fontSize="lg" fontWeight="semibold">
              File Name: {fileName}
            </FormLabel>
          </FormControl>
        )}

        <Textarea
          value={base64}
          readOnly
          placeholder="Base64 output will appear here"
          rows={8}
          bg={useColorModeValue("white", "gray.700")}
          rounded="md"
        />

        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            leftIcon={<FaClipboard />}
            onClick={handleCopyToClipboard}
            isDisabled={!base64}
          >
            Copy to Clipboard
          </Button>

          <Button
            colorScheme="green"
            leftIcon={<FaDownload />}
            onClick={handleDownload}
            isDisabled={!base64}
          >
            Download Base64
          </Button>

          <Button
            colorScheme="purple"
            leftIcon={<FaShareAlt />}
            onClick={handleShare}
            isDisabled={!base64}
          >
            Share Base64
          </Button>

          <Button
            colorScheme="red"
            leftIcon={<FaTrashAlt />}
            onClick={handleReset}
          >
            Reset
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default UrlToBase64;

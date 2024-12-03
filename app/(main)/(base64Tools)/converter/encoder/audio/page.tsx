'use client'

import { useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useColorModeValue,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { FaClipboard, FaDownload, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";

const AudioToBase64 = () => {
  const [base64, setBase64] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [format, setFormat] = useState<string>("plainText");
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setFileName(file.name);
      setFileType(file.type);

      reader.onload = () => {
        const result = reader.result as string;
        setBase64(result);
        toast({
          title: "Conversion Successful",
          description: "File has been converted to Base64.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the file. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(formattedOutput())
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Formatted output copied successfully.",
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
    let blob;
    let fileExtension = "txt";

    switch (format) {
      case "plainText":
        blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
        fileExtension = "txt";
        break;
      case "dataUri":
        blob = new Blob([formattedOutput()], {
          type: "text/plain;charset=utf-8",
        });
        fileExtension = "uri";
        break;
      case "htmlLink":
        blob = new Blob([formattedOutput()], {
          type: "text/html;charset=utf-8",
        });
        fileExtension = "html";
        break;
      case "json":
        blob = new Blob([formattedOutput()], {
          type: "application/json;charset=utf-8",
        });
        fileExtension = "json";
        break;
      case "xml":
        blob = new Blob([formattedOutput()], {
          type: "application/xml;charset=utf-8",
        });
        fileExtension = "xml";
        break;
      default:
        blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
    }

    const cleanedFileName = fileName?.replace(/\.[^.]+$/, "") || "output";
    saveAs(blob, `${cleanedFileName}.${fileExtension}`);
  };

  const handleReset = () => {
    setBase64("");
    setFileName(null);
    setFileType("");
  };

  const formattedOutput = () => {
    switch (format) {
      case "plainText":
        return base64.split(",")[1];
      case "dataUri":
        return `data:${fileType};base64,${base64.split(",")[1]}`;
      case "htmlLink":
        return `<a href="${base64}" download="${fileName || "download"}">Download File</a>`;
      case "json":
        return JSON.stringify({ fileName, base64 }, null, 2);
      case "xml":
        return `<file><name>${fileName}</name><base64>${base64}</base64></file>`;
      default:
        return base64.split(",")[1];
    }
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
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
        Audio to Base64
      </Heading>
      <VStack spacing={2} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Choose a File
          </FormLabel>
          <Input
            type="file"
            accept="audio/*"  // This will limit the input to audio files
            onChange={handleFileChange}
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
          />
        </FormControl>

        {fileName && (
          <FormControl>
            <FormLabel fontSize="lg" fontWeight="semibold">
              File: {fileName}
            </FormLabel>
          </FormControl>
        )}

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Select Output Format
          </FormLabel>
          <Select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="plainText">Plain Text (Base64String)</option>
            <option value="dataUri">Data URI (data:;base64,Base64String)</option>
            <option value="htmlLink">HTML Hyperlink (Download)</option>
            <option value="json">JSON ("fileName": "filename", "base64": "Base64String")</option>
            <option value="xml">XML (&lt;file&gt;&lt;name&gt;filename&lt;/name&gt;&lt;base64&gt;Base64String&lt;/base64&gt;&lt;/file&gt;)</option>
          </Select>
        </FormControl>

        <Textarea
          value={formattedOutput()}
          readOnly
          placeholder="Formatted output will appear here"
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
            colorScheme="red"
            leftIcon={<FaTrashAlt />}
            onClick={handleReset}
            isDisabled={!base64}
          >
            Reset
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default AudioToBase64;

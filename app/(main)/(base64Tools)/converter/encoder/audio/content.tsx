"use client";

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
    Text,
    Icon,
} from "@chakra-ui/react";
import { FaClipboard, FaDownload, FaTrashAlt, FaMusic } from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../../store/stores";

const AudioToBase64Content = () => {
    const [base64, setBase64] = useState<string>("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [format, setFormat] = useState<string>("dataUri");
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
    
        const {
  themeStore: { themeConfig },
} = stores;

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
        <Box p={4} bg={bgColor} color={textColor} minH="78vh">
            <Heading
                as="h1"
                size="xl"
                color={themeConfig.colors.brand[300]}
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

  <Box
    as="label"
    htmlFor="audio-upload"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap={2}
    p={6}
    border="2px dashed"
    borderColor={useColorModeValue("blue.300", "blue.500")}
    borderRadius="xl"
    bg={useColorModeValue("blue.50", "gray.700")}
    cursor="pointer"
    transition="all 0.2s"
    _hover={{
      borderColor: "blue.500",
      bg: useColorModeValue("blue.100", "gray.600"),
    }}
  >
    <Icon as={FaMusic} boxSize={8} color="blue.400" />
    <Text fontWeight="semibold" color={useColorModeValue("gray.700", "gray.200")}>
      {fileName ? fileName : "Click to upload audio file"}
    </Text>
    <Text fontSize="sm" color="gray.400">
      MP3, WAV, OGG, AAC supported
    </Text>
    <Input
      id="audio-upload"
      type="file"
      accept="audio/*"
      onChange={handleFileChange}
      display="none"
    />
  </Box>
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

export default AudioToBase64Content;

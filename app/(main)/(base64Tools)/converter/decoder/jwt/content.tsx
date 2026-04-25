"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  HStack,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import {
  FaLock,
  FaTrashAlt,
  FaCopy,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUpload,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../../store/stores";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const decodeBase64UrlToText = (base64Url: string): string => {
  const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const parseJsonPart = (part: string) => {
  const text = decodeBase64UrlToText(part);
  return JSON.parse(text);
};

const JwtDecoderContent: React.FC = () => {
  const [jwtInput, setJwtInput] = useState<string>("");
  const [headerOutput, setHeaderOutput] = useState<string>("");
  const [payloadOutput, setPayloadOutput] = useState<string>("");
  const [signatureOutput, setSignatureOutput] = useState<string>("");
  const [validJwt, setValidJwt] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  const bgColor       = useColorModeValue("gray.100", "gray.800");
  const textColor     = useColorModeValue("gray.800", "gray.100");
  const fileBg        = useColorModeValue("gray.50", "gray.700");
  const fileBorder    = useColorModeValue("gray.300", "gray.600");
  const fileNameColor = useColorModeValue("gray.700", "gray.200");
  const mutedColor    = useColorModeValue("gray.500", "gray.400");
  const uploadHoverBg = useColorModeValue("teal.50", "gray.600");

  const resetOutput = () => {
    setHeaderOutput("");
    setPayloadOutput("");
    setSignatureOutput("");
    setValidJwt(null);
    setErrorMessage("");
  };

  const handleDecode = () => {
    resetOutput();
    const token = jwtInput.trim();
    if (!token) {
      toast({ title: "Input required", description: "Please paste a JWT token to decode.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("JWT must contain exactly 3 parts separated by dots.");
      const header = parseJsonPart(parts[0]);
      const payload = parseJsonPart(parts[1]);
      const signature = parts[2];
      setHeaderOutput(JSON.stringify(header, null, 2));
      setPayloadOutput(JSON.stringify(payload, null, 2));
      setSignatureOutput(signature);
      setValidJwt(true);
    } catch (error: any) {
      const message = error?.message || "Unable to decode this JWT token.";
      setValidJwt(false);
      setErrorMessage(message);
      toast({ title: "Invalid JWT", description: message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Please upload a file smaller than 2MB.", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result?.toString();
      if (content) {
        setJwtInput(content.trim());
        setUploadedFileName(file.name);
        toast({ title: "File uploaded", description: `"${file.name}" loaded successfully.`, status: "success", duration: 2500, isClosable: true });
      }
    };
    reader.onerror = () => {
      toast({ title: "Upload failed", description: "Could not read the file.", status: "error", duration: 3000, isClosable: true });
    };
    reader.readAsText(file);
    event.target.value = ""; // reset so same file can be re-picked
  };

  const handleRemoveFile = () => {
    setUploadedFileName("");
    setJwtInput("");
    resetOutput();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: `${label} copied!`, status: "success", duration: 2000, isClosable: true }))
      .catch(() => toast({ title: "Copy failed", description: "Unable to copy text.", status: "error", duration: 2000, isClosable: true }));
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`Header:\n${headerOutput}\n\nPayload:\n${payloadOutput}\n\nSignature:\n${signatureOutput}`],
      { type: "text/plain;charset=utf-8" }
    );
    saveAs(blob, "jwt-decoded.txt");
  };

  const handleClear = () => {
    setJwtInput("");
    setUploadedFileName("");
    resetOutput();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        JWT Decoder
      </Heading>

      <VStack spacing={6} align="stretch">

        {/* ── JWT Text Input ── */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">Enter JWT Token</FormLabel>
          <Textarea
            placeholder="Paste your JWT token here (header.payload.signature)"
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            size="lg"
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
            rows={5}
            rounded="md"
            fontFamily="'Courier New', monospace"
          />
        </FormControl>

        {/* ── Styled File Upload ── */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">Load JWT from File</FormLabel>

          {/* Hidden native input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {uploadedFileName ? (
            /* File selected state */
            <Flex
              align="center"
              justify="space-between"
              px={4}
              py={3}
              bg={fileBg}
              border="1.5px solid"
              borderColor="teal.400"
              borderRadius="lg"
              gap={3}
            >
              <HStack spacing={3} flex={1} minW={0}>
                <Icon as={FaFileAlt} color="teal.400" flexShrink={0} boxSize={4} />
                <Text fontSize="sm" color={fileNameColor} fontFamily="monospace" isTruncated>
                  {uploadedFileName}
                </Text>
              </HStack>
              <HStack spacing={2} flexShrink={0}>
                <Button size="xs" variant="ghost" colorScheme="teal" onClick={openFilePicker}>
                  Change
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<Icon as={FaTimes} />}
                  onClick={handleRemoveFile}
                >
                  Remove
                </Button>
              </HStack>
            </Flex>
          ) : (
            /* No file — dashed drop zone */
            <Flex
              align="center"
              justify="space-between"
              px={4}
              py={4}
              bg={fileBg}
              border="1.5px dashed"
              borderColor={fileBorder}
              borderRadius="lg"
              cursor="pointer"
              onClick={openFilePicker}
              _hover={{ borderColor: "teal.400", bg: uploadHoverBg }}
              transition="all 0.2s"
              gap={3}
              flexWrap="wrap"
            >
              <HStack spacing={3}>
                <Icon as={FaUpload} color={mutedColor} boxSize={4} />
                <Text fontSize="sm" color={mutedColor}>
                  Click to upload a <strong>.txt</strong> file containing your JWT
                </Text>
              </HStack>
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                leftIcon={<Icon as={FaUpload} />}
                onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                flexShrink={0}
              >
                Choose File
              </Button>
            </Flex>
          )}
        </FormControl>

        {/* ── Action Buttons ── */}
        <Stack spacing={4} direction={["column", "row"]} justify="space-between">
          <Button colorScheme="teal" size="lg" leftIcon={<Icon as={FaLock} />} onClick={handleDecode}>
            Decode JWT
          </Button>
          {jwtInput?.trim() && (
            <Button colorScheme="red" size="lg" leftIcon={<Icon as={FaTrashAlt} />} onClick={handleClear}>
              Clear
            </Button>
          )}
        </Stack>

        <Divider borderColor="teal.500" />

        {/* ── Output Header ── */}
        <Flex align="center" justify="space-between" mb={2}>
          <HStack spacing={3}>
            <Text fontSize="xl" fontWeight="semibold">Decoded JWT Output</Text>
            {validJwt === true && (
              <HStack color="green.400" spacing={1}>
                <Icon as={FaCheckCircle} />
                <Text>Valid format</Text>
              </HStack>
            )}
            {validJwt === false && (
              <HStack color="red.400" spacing={1}>
                <Icon as={FaExclamationTriangle} />
                <Text>Invalid JWT</Text>
              </HStack>
            )}
          </HStack>
        </Flex>

        {/* ── Output Sections ── */}
        <VStack spacing={4} align="stretch">
          {(["Header", "Payload", "Signature"] as const).map((section) => {
            const content =
              section === "Header" ? headerOutput :
              section === "Payload" ? payloadOutput :
              signatureOutput;
            return (
              <Box key={section} p={4} bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md">
                <Text fontSize="lg" fontWeight="semibold" mb={2}>{section}</Text>
                <Box
                  p={3}
                  bg={useColorModeValue("white", "gray.800")}
                  color={useColorModeValue("gray.800", "white")}
                  borderRadius="md"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                  minH={section === "Payload" ? "160px" : "120px"}
                  fontFamily="'Courier New', monospace"
                  fontSize="sm"
                >
                  {loading ? <Spinner size="sm" /> : content || `${section} will appear here.`}
                </Box>
              </Box>
            );
          })}
        </VStack>

        {/* ── Copy / Download ── */}
        {(headerOutput || payloadOutput || signatureOutput) && (
          <HStack spacing={4} pt={4} flexWrap="wrap">
            <Button
              colorScheme="blue"
              size="md"
              leftIcon={<Icon as={FaCopy} />}
              onClick={() => handleCopy(`${headerOutput}\n\n${payloadOutput}\n\n${signatureOutput}`, "JWT data")}
            >
              Copy All
            </Button>
            <Button colorScheme="green" size="md" onClick={handleDownload}>
              Download Result
            </Button>
            <Button
              colorScheme="teal"
              size="md"
              leftIcon={<Icon as={FaCopy} />}
              onClick={() => handleCopy(payloadOutput, "Payload")}
            >
              Copy Payload
            </Button>
          </HStack>
        )}

        {/* ── Error ── */}
        {errorMessage && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text color="red.600" fontWeight="semibold">{errorMessage}</Text>
          </Box>
        )}

      </VStack>
    </Box>
  );
};

export default JwtDecoderContent;
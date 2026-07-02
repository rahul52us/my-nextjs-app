"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  HStack,
  Icon,
  Badge,
  Image,
  Flex,
  Link,
  Divider,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUpload, FaTimes, FaLink, FaDownload } from "react-icons/fa";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function QRFileSharingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageBoxSize = useBreakpointValue({ base: "100%", md: "240px" });
  const sectionBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const highlightBg = useColorModeValue("brand.50", "brand.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.300");


  function onFileSelected(selected: FileList | null) {
    setError(null);
    if (!selected || !selected.length) return;
    const chosen = selected[0];
    if (chosen.size > MAX_FILE_SIZE) {
      setError(
        `Max file size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB`,
      );
      return;
    }
    setFile(chosen);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    onFileSelected(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function clearSelection() {
    setFile(null);
    setError(null);
    setShareUrl(null);
    setQrBase64(null);
  }

  function downloadQrCode() {
    if (!qrBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrBase64}`;
    link.download = `qr-share-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function upload() {
    setError(null);
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const backend =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (typeof window !== "undefined"
          ? window.location.origin.replace(":3000", ":5000")
          : "");
      const resp = await fetch(`${backend}/upload`, {
        method: "POST",
        body: fd,
      });
      const json = await resp.json();
      if (!resp.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      setShareUrl(json.url);

      const qrResp = await fetch(`/api/tools/qr-code-generator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: json.url, size: 400 }),
      });
      const qrJson = await qrResp.json();
      if (qrJson?.qrCode) {
        setQrBase64(qrJson.qrCode);
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch" maxW="6xl" mx="auto">
        <Box bg={sectionBg} rounded="3xl" p={6} shadow="lg">
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            mb={2}
            color="brand.400"
          >
            QR File Sharing
          </Text>
          <Text fontSize="md" color={secondaryTextColor} maxW="3xl">
            Upload a file and instantly generate a shareable download link with
            QR code support.
          </Text>
        </Box>

        <Box
          borderWidth={2}
          borderStyle="dashed"
          borderColor={file ? "brand.400" : borderColor}
          rounded="2xl"
          p={8}
          textAlign="center"
          bg={file ? highlightBg : cardBg}
          onDrop={onDrop}
          onDragOver={onDragOver}
          cursor="pointer"
          transition="all 0.2s ease"
        >
          <Text fontSize="xl" fontWeight="semibold" mb={3} color={textColor}>
            Drag & drop a file here
          </Text>
          <Text color={secondaryTextColor} mb={5}>
            or select one manually to create a download-ready QR share link.
          </Text>
          <HStack justify="center" spacing={3} wrap="wrap">
            <Button
              leftIcon={<Icon as={FaUpload} />}
              colorScheme="brand"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
            <Button
              variant="outline"
              onClick={clearSelection}
              leftIcon={<Icon as={FaTimes} />}
            >
              Clear
            </Button>
          </HStack>
          <Input
            ref={fileInputRef}
            type="file"
            display="none"
            onChange={(e) => onFileSelected(e.target.files)}
          />
        </Box>

        <Box bg={sectionBg} rounded="3xl" shadow="md" p={6}>
          <VStack spacing={5} align="stretch">
            <Box>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                mb={3}
                color={textColor}
              >
                Selected file
              </Text>
              <Box p={4} bg={cardBg} rounded="2xl">
                {file ? (
                  <>
                    <Text fontWeight="bold" color={textColor}>
                      {file.name}
                    </Text>
                    <Text color={secondaryTextColor} mt={1}>
                      {Math.round(file.size / 1024)} KB • {file.type || "Unknown type"}
                    </Text>
                    <Badge mt={3} colorScheme="brand">
                      {file.type ? file.type.toUpperCase() : "UNKNOWN"}
                    </Badge>
                  </>
                ) : (
                  <Text color={secondaryTextColor}>
                    No file selected yet. Use the button above to pick a file.
                  </Text>
                )}
              </Box>
            </Box>
            <Flex justify="center">
              <Button
                colorScheme="brand"
                size="lg"
                isLoading={uploading}
                onClick={upload}
                isDisabled={!file || uploading}
                w={{ base: "100%", md: "320px" }}
              >
                Upload & Generate QR
              </Button>
            </Flex>
          </VStack>
          {error && (
            <Text mt={4} color="red.400" fontWeight="medium">
              {error}
            </Text>
          )}
        </Box>

        {shareUrl && (
          <Box bg={sectionBg} rounded="3xl" shadow="md" p={6}>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
              Your share link
            </Text>
            <Box p={4} bg={cardBg} rounded="2xl">
              <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="space-between"
                gap={4}
              >
                <Text color={textColor} wordBreak="break-all">
                  {shareUrl}
                </Text>
                <HStack spacing={3}>
                  <Button
                    as={Link}
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    colorScheme="brand"
                    leftIcon={<Icon as={FaLink} />}
                  >
                    Open link
                  </Button>
                  <Button
                    colorScheme="gray"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy link
                  </Button>
                </HStack>
              </Flex>
            </Box>

            <Divider my={6} />

            <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
              QR code
            </Text>
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={6}
            >
              <Box flex={1} textAlign="center">
                {qrBase64 ? (
                  <Image
                    src={`data:image/png;base64,${qrBase64}`}
                    alt="QR code"
                    boxSize={imageBoxSize}
                    rounded="2xl"
                    bg={sectionBg}
                    shadow="md"
                    mx="auto"
                  />
                ) : (
                  <Box p={10} bg={cardBg} rounded="2xl">
                    <Text color={secondaryTextColor}>
                      QR code will appear here after upload.
                    </Text>
                  </Box>
                )}
              </Box>
              <Box w={{ base: "100%", md: "240px" }}>
                <Button
                  colorScheme="brand"
                  leftIcon={<Icon as={FaDownload} />}
                  onClick={downloadQrCode}
                  isDisabled={!qrBase64}
                  w="100%"
                >
                  Download QR
                </Button>
              </Box>
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

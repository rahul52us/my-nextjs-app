"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Text,
  HStack,
  Icon,
  Box,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiDownload, FiEye, FiFileText } from "react-icons/fi";

interface ConversionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Blob URL of the PDF to render in the preview iframe */
  previewUrl: string | null;
  /** Blob URL for the actual downloadable file */
  downloadUrl: string | null;
  /** Filename for the downloaded file, e.g. "converted.docx" or "output.pdf" */
  downloadName: string;
  /** Human-readable label shown in the header, e.g. ".docx" or "PDF" */
  outputLabel?: string;
}

const ConversionPreviewModal: React.FC<ConversionPreviewModalProps> = ({
  isOpen,
  onClose,
  previewUrl,
  downloadUrl,
  downloadName,
  outputLabel = "file",
}) => {
  const headerBg = useColorModeValue(
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    "linear-gradient(135deg, #0d0d1a 0%, #111827 50%, #0c2340 100%)"
  );
  const bodyBg = useColorModeValue("#f1f5f9", "#0f172a");
  const iframeBg = useColorModeValue("white", "#1e293b");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
      scrollBehavior="inside"
    >
      <ModalOverlay
        bg="blackAlpha.700"
        backdropFilter="blur(6px)"
      />
      <ModalContent
        borderRadius={{ base: 0, md: "2xl" }}
        overflow="hidden"
        maxH={{ base: "100vh", md: "95vh" }}
        maxW={{ base: "100vw", md: "90vw" }}
        mx="auto"
        my={{ base: 0, md: "2.5vh" }}
        bg={bodyBg}
        boxShadow="0 25px 60px rgba(0,0,0,0.5)"
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <Box
          bgImage={headerBg}
          px={{ base: 4, md: 8 }}
          py={4}
          position="relative"
        >
          <Flex align="center" justify="space-between" gap={4}>
            {/* Left: icon + title */}
            <HStack spacing={3} minW={0}>
              <Flex
                align="center"
                justify="center"
                boxSize="42px"
                borderRadius="lg"
                bg="whiteAlpha.200"
                flexShrink={0}
              >
                <Icon as={FiEye} color="white" boxSize={5} />
              </Flex>
              <Box minW={0}>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="800"
                  color="white"
                  letterSpacing="tight"
                  noOfLines={1}
                >
                  Conversion Preview
                </Text>
                <HStack spacing={2} mt={0.5}>
                  <Icon as={FiFileText} color="blue.300" boxSize={3} />
                  <Text
                    fontSize="xs"
                    color="blue.200"
                    noOfLines={1}
                    fontFamily="mono"
                  >
                    {downloadName}
                  </Text>
                </HStack>
              </Box>
            </HStack>

            {/* Right: actions */}
            <HStack spacing={3} flexShrink={0}>
              <Button
                leftIcon={<FiDownload />}
                onClick={handleDownload}
                isDisabled={!downloadUrl}
                size={{ base: "sm", md: "md" }}
                fontWeight="700"
                borderRadius="xl"
                bg="linear-gradient(135deg, #3b82f6, #6366f1)"
                color="white"
                _hover={{
                  bg: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 20px rgba(99,102,241,0.5)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                px={{ base: 4, md: 6 }}
              >
                Download {outputLabel}
              </Button>

              <ModalCloseButton
                position="static"
                color="whiteAlpha.800"
                _hover={{ color: "white", bg: "whiteAlpha.200" }}
                borderRadius="lg"
                size="lg"
              />
            </HStack>
          </Flex>

          {/* Subtle shimmer line */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="2px"
            bgGradient="linear(to-r, transparent, blue.400, indigo.400, transparent)"
          />
        </Box>

        {/* ── Preview Body ──────────────────────────────────────────── */}
        <ModalBody p={{ base: 3, md: 6 }} flex="1" display="flex" flexDir="column">
          {!previewUrl ? (
            /* Loading state */
            <Flex
              flex="1"
              align="center"
              justify="center"
              direction="column"
              gap={4}
              minH="60vh"
            >
              <Spinner size="xl" color="blue.400" thickness="4px" speed="0.65s" />
              <Text color={textColor} fontWeight="600" fontSize="md">
                Generating preview…
              </Text>
              <Text color="gray.500" fontSize="sm">
                This may take a few seconds
              </Text>
            </Flex>
          ) : (
            /* PDF iframe */
            <Box
              flex="1"
              borderRadius="xl"
              overflow="hidden"
              bg={iframeBg}
              boxShadow="inset 0 0 0 1px rgba(99,102,241,0.15)"
              minH={{ base: "75vh", md: "78vh" }}
              position="relative"
            >
              {/* Subtle gradient border glow */}
              <Box
                position="absolute"
                inset={0}
                borderRadius="xl"
                border="1px solid"
                borderColor="blue.500"
                opacity={0.3}
                pointerEvents="none"
                zIndex={1}
              />
              <iframe
                src={previewUrl}
                title="Converted File Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "inherit",
                  border: "none",
                  display: "block",
                  borderRadius: "inherit",
                }}
              />
            </Box>
          )}

          {/* Footer note */}
          <Flex justify="center" mt={3}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Preview shows the converted document. Verify formatting before downloading.
            </Text>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConversionPreviewModal;

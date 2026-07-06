"use client";

import React from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  Button,
  Flex,
  Text,
  HStack,
  Icon,
  Box,
  Spinner,
  Progress,
  VStack,
  Circle,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiAlertCircle, FiCheck, FiDownload, FiEye, FiFileText, FiRefreshCw } from "react-icons/fi";

const CONVERSION_STEPS = [
  { key: "uploading", label: "Uploading file", pct: 5 },
  { key: "extracting", label: "Extracting PDF layout", pct: 20 },
  { key: "converting", label: "Converting document", pct: 60 },
  { key: "compressing", label: "Optimising images", pct: 75 },
  { key: "preview", label: "Generating preview", pct: 90 },
  { key: "done", label: "Ready", pct: 100 },
];

interface ConversionPreviewDrawerProps {
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
  progress?: { step: string; pct: number; elapsed?: number; timedOut?: boolean } | null;
  onRetry?: () => void;
}

const ConversionPreviewDrawer: React.FC<ConversionPreviewDrawerProps> = ({
  isOpen,
  onClose,
  previewUrl,
  downloadUrl,
  downloadName,
  outputLabel = "file",
  progress,
  onRetry,
}) => {
  const headerBg = useColorModeValue(
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    "linear-gradient(135deg, #0d0d1a 0%, #111827 50%, #0c2340 100%)"
  );
  const bodyBg = useColorModeValue("#f1f5f9", "#0f172a");
  const iframeBg = useColorModeValue("white", "#1e293b");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const progressCardBg = useColorModeValue("white", "gray.800");
  const progressTrackBg = useColorModeValue("gray.100", "gray.700");

  const formatElapsed = (seconds = 0) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const currentPct = Math.max(0, Math.min(100, progress?.pct ?? 12));
  const currentStep = progress?.step || "Preparing conversion...";
  const timedOut = Boolean(progress?.timedOut);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
    >
      <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <DrawerContent
        width={{ base: "100%", md: "85%" }}
        maxW={{ base: "100%", md: "85%" }}
        height="100vh"
        maxH="100vh"
        borderTopRadius={{ base: "2xl", md: "3xl" }}
        overflow="hidden"
        bg={bodyBg}
        boxShadow="0 -10px 40px rgba(0,0,0,0.3)"
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
                  <Icon as={FiFileText} color="brand.300" boxSize={3} />
                  <Text
                    fontSize="xs"
                    color="brand.200"
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

              <DrawerCloseButton
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
        <DrawerBody p={{ base: 3, md: 6 }} flex="1" display="flex" flexDir="column" overflow="hidden">
          {!previewUrl ? (
            /* Loading state */
            <Flex
              flex="1"
              align="center"
              justify="center"
              direction="column"
              gap={5}
              minH="50vh"
            >
              <Box
                w="full"
                maxW="560px"
                bg={progressCardBg}
                borderRadius="lg"
                border="1px solid"
                borderColor={timedOut ? "red.200" : "blackAlpha.100"}
                boxShadow="0 18px 45px rgba(15,23,42,0.12)"
                p={{ base: 5, md: 7 }}
              >
                <VStack spacing={5} align="stretch">
                  <HStack justify="space-between" align="start" spacing={4}>
                    <HStack spacing={3} align="center">
                      <Flex
                        align="center"
                        justify="center"
                        boxSize="42px"
                        borderRadius="lg"
                        bg={timedOut ? "red.50" : "brand.50"}
                        color={timedOut ? "red.500" : "brand.500"}
                      >
                        <Icon as={timedOut ? FiAlertCircle : FiFileText} boxSize={5} />
                      </Flex>
                      <Box>
                        <Text color={textColor} fontWeight="800" fontSize="md">
                          {timedOut ? "Conversion is taking too long" : currentStep}
                        </Text>
                        <Text color={mutedTextColor} fontSize="sm">
                          Elapsed {formatElapsed(progress?.elapsed)}
                        </Text>
                      </Box>
                    </HStack>
                    <Text color={timedOut ? "red.500" : "brand.500"} fontWeight="800">
                      {currentPct}%
                    </Text>
                  </HStack>

                  <Progress
                    value={currentPct}
                    size="sm"
                    colorScheme={timedOut ? "red" : "brand"}
                    borderRadius="full"
                    bg={progressTrackBg}
                  />

                  <VStack spacing={3} align="stretch">
                    {CONVERSION_STEPS.map((step) => {
                      const isDone = currentPct >= step.pct;
                      const isCurrent = !timedOut && currentPct < 100 && currentPct >= step.pct - 15 && currentPct <= step.pct;
                      return (
                        <HStack key={step.key} spacing={3}>
                          <Circle
                            size="24px"
                            bg={isDone ? "brand.500" : isCurrent ? "brand.100" : "gray.100"}
                            color={isDone ? "white" : isCurrent ? "brand.600" : "gray.400"}
                            flexShrink={0}
                          >
                            {isDone ? <Icon as={FiCheck} boxSize={3} /> : isCurrent ? <Spinner size="xs" /> : null}
                          </Circle>
                          <Text
                            color={isDone || isCurrent ? textColor : mutedTextColor}
                            fontWeight={isCurrent ? "700" : "500"}
                            fontSize="sm"
                          >
                            {step.label}
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>

                  {timedOut && onRetry && (
                    <Button
                      leftIcon={<FiRefreshCw />}
                      colorScheme="red"
                      variant="solid"
                      alignSelf="start"
                      onClick={onRetry}
                    >
                      Retry
                    </Button>
                  )}
                </VStack>
              </Box>
            </Flex>
          ) : (
            /* PDF iframe */
            <Box
              flex="1"
              borderRadius="xl"
              overflow="hidden"
              bg={iframeBg}
              boxShadow="inset 0 0 0 1px rgba(99,102,241,0.15)"
              position="relative"
              height="100%"
            >
              {/* Subtle gradient border glow */}
              <Box
                position="absolute"
                inset={0}
                borderRadius="xl"
                border="1px solid"
                borderColor="brand.500"
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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ConversionPreviewDrawer;

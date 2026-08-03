"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  Badge,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  getDynamicRelatedTools,
  detectOutputType,
  outputContextSubtexts,
  TOOLS_REGISTRY,
  ToolMeta,
} from "../../config/toolsConfig";
import { useFileTransfer } from "../../context/FileTransferContext";

interface ContinueToSectionProps {
  /** Current tool slug e.g. "pdf-to-jpg" */
  currentTool: string;
  /** Converted image or file objects to carry forward to the destination tool */
  convertedFiles?: Array<{
    file?: File | Blob;
    blob?: Blob;
    url?: string;
    pageNumber?: number;
    name?: string;
    type?: string;
  }>;
  /** Optional custom title override */
  customTitle?: string;
  /** Optional custom subtext override */
  customSubtext?: string;
  /** Maximum number of suggested tool chips to display (default 4) */
  maxTools?: number;
}

export const ContinueToSection: React.FC<ContinueToSectionProps> = ({
  currentTool,
  convertedFiles = [],
  customTitle = "Continue to...",
  customSubtext,
  maxTools = 4,
}) => {
  const router = useRouter();
  const { setTransfer } = useFileTransfer();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // Semantic color tokens matching theme & dark mode
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.500", "gray.400");

  const chipBg = useColorModeValue("gray.50", "gray.750");
  const chipBorder = useColorModeValue("gray.200", "gray.700");
  const chipHoverBg = useColorModeValue("blue.50", "gray.700");
  const chipHoverBorder = useColorModeValue("brand.400", "brand.500");

  const iconBoxBg = useColorModeValue("brand.50", "brand.900");
  const iconColor = useColorModeValue("brand.600", "brand.300");

  const chevronColor = useColorModeValue("gray.400", "gray.500");
  const chevronHoverColor = useColorModeValue("brand.600", "brand.300");

  const currentToolMeta = TOOLS_REGISTRY[currentTool];
  const detectedFormat = detectOutputType(convertedFiles, currentToolMeta?.outputType);
  const relatedTools: ToolMeta[] = getDynamicRelatedTools(currentTool, detectedFormat, maxTools, convertedFiles);

  if (!relatedTools || relatedTools.length === 0) {
    return null;
  }

  const defaultSubtext = outputContextSubtexts[detectedFormat] || outputContextSubtexts.default;
  const displaySubtext = customSubtext || defaultSubtext;

  const handleToolClick = async (tool: ToolMeta) => {
    setNavigatingId(tool.id);

    if (convertedFiles && convertedFiles.length > 0) {
      await setTransfer({
        files: convertedFiles,
        sourceToolId: currentTool,
      });
    }

    router.push(tool.route);
  };

  return (
    <Box
      w="full"
      bg={containerBg}
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      mt={8}
      border="1px solid"
      borderColor={borderColor}
      shadow="md"
      transition="all 0.3s ease"
    >
      {/* Heading & Subtext */}
      <VStack align="start" spacing={1} mb={5}>
        <Heading
          as="h3"
          size="md"
          fontWeight="bold"
          color={headingColor}
          letterSpacing="tight"
        >
          {customTitle}
        </Heading>
        {displaySubtext && (
          <Text fontSize="sm" color={subtextColor} fontWeight="medium">
            {displaySubtext}
          </Text>
        )}
      </VStack>

      {/* Suggested Tool Chips Grid (Desktop: horizontal row / grid, Mobile: vertical stack) */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: relatedTools.length }} spacing={4}>
        {relatedTools.map((tool) => {
          const isNavigating = navigatingId === tool.id;

          return (
            <HStack
              key={tool.id}
              as="button"
              onClick={() => handleToolClick(tool)}
              w="full"
              p={4}
              borderRadius="xl"
              bg={chipBg}
              border="1px solid"
              borderColor={chipBorder}
              justifyContent="space-between"
              alignItems="center"
              cursor="pointer"
              role="group"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: chipHoverBg,
                borderColor: chipHoverBorder,
                transform: "translateY(-2px)",
                shadow: "md",
              }}
              _active={{
                transform: "translateY(0)",
                shadow: "sm",
              }}
              outline="none"
              _focus={{
                ring: 2,
                ringColor: "brand.400",
              }}
            >
              <HStack spacing={3} overflow="hidden" flex={1}>
                {/* Icon Container */}
                <Box
                  bg={iconBoxBg}
                  color={iconColor}
                  p={2.5}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  transition="all 0.2s ease"
                  _groupHover={{
                    bg: "brand.600",
                    color: "white",
                  }}
                >
                  <Icon as={tool.icon} boxSize={5} />
                </Box>

                {/* Tool Details */}
                <VStack align="start" spacing={0.5} overflow="hidden" textAlign="left">
                  <HStack spacing={1.5} maxW="full">
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={headingColor}
                      noOfLines={1}
                      _groupHover={{ color: "brand.600" }}
                      transition="color 0.2s"
                    >
                      {tool.name}
                    </Text>
                    {tool.badge && (
                      <Badge
                        colorScheme="brand"
                        variant="subtle"
                        fontSize="9px"
                        borderRadius="full"
                        px={1.5}
                      >
                        {tool.badge}
                      </Badge>
                    )}
                  </HStack>

                  {tool.subtext && (
                    <Text
                      fontSize="xs"
                      color={subtextColor}
                      noOfLines={1}
                      display={{ base: "none", lg: "block" }}
                    >
                      {tool.subtext}
                    </Text>
                  )}
                </VStack>
              </HStack>

              {/* Right Chevron Arrow / Spinner */}
              <Box flexShrink={0} ml={2}>
                {isNavigating ? (
                  <Spinner size="xs" color="brand.500" />
                ) : (
                  <Icon
                    as={FiChevronRight}
                    boxSize={4}
                    color={chevronColor}
                    transition="all 0.2s ease"
                    _groupHover={{
                      color: chevronHoverColor,
                      transform: "translateX(3px)",
                    }}
                  />
                )}
              </Box>
            </HStack>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default ContinueToSection;

"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Badge,
  useColorModeValue,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { FiChevronRight, FiArrowRight } from "react-icons/fi";
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
  /** Current tool slug e.g. "pdf-to-word" */
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
  /** Set true if rendered inside a drawer */
  isDrawer?: boolean;
  /** Display variant: "vertical" (sidebar stack), "horizontal" (bottom grid), "drawer" */
  variant?: "horizontal" | "vertical" | "drawer";
}

export const ContinueToSection: React.FC<ContinueToSectionProps> = ({
  currentTool,
  convertedFiles = [],
  customTitle = "Continue to...",
  customSubtext,
  maxTools = 4,
  isDrawer = false,
  variant,
}) => {
  const router = useRouter();
  const { setTransfer } = useFileTransfer();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const activeVariant = isDrawer ? "drawer" : (variant || "vertical");

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

  const isVertical = activeVariant === "vertical";
  const isDrawerVariant = activeVariant === "drawer";

  const gridColumns = isVertical
    ? 1
    : isDrawerVariant
    ? { base: 1, sm: 2 }
    : { base: 1, sm: 2, md: 2, lg: Math.min(relatedTools.length, 4) };

  return (
    <Box
      w="full"
      bg={containerBg}
      borderRadius="2xl"
      p={{ base: 4, sm: 5 }}
      border="1px solid"
      borderColor={borderColor}
      shadow="md"
      transition="all 0.3s ease"
    >
      {/* Heading & Subtext */}
      <Flex direction="column" align="flex-start" gap={1} mb={4}>
        <Flex align="center" justify="space-between" w="full">
          <Heading
            as="h3"
            size={isDrawerVariant || isVertical ? "sm" : "md"}
            fontWeight="bold"
            color={headingColor}
            letterSpacing="tight"
          >
            {customTitle}
          </Heading>
          {isVertical && (
            <Badge colorScheme="brand" variant="subtle" fontSize="10px" borderRadius="md" px={2} py={0.5}>
              Next Step
            </Badge>
          )}
        </Flex>
        {displaySubtext && (
          <Text fontSize="xs" color={subtextColor} fontWeight="medium">
            {displaySubtext}
          </Text>
        )}
      </Flex>

      {/* Suggested Tool Chips Grid */}
      <SimpleGrid columns={gridColumns} spacing={3}>
        {relatedTools.map((tool) => {
          const isNavigating = navigatingId === tool.id;

          return (
            <Flex
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              w="full"
              minW={0}
              p={3}
              borderRadius="xl"
              bg={chipBg}
              border="1px solid"
              borderColor={chipBorder}
              direction="row"
              align="center"
              justify="space-between"
              cursor="pointer"
              role="group"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: chipHoverBg,
                borderColor: chipHoverBorder,
                transform: isVertical ? "translateX(4px)" : "translateY(-2px)",
                shadow: "md",
              }}
              _active={{
                transform: "none",
                shadow: "sm",
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToolClick(tool);
                }
              }}
            >
              {/* Left: Icon */}
              <Flex
                bg={iconBoxBg}
                color={iconColor}
                boxSize="38px"
                borderRadius="lg"
                align="center"
                justify="center"
                flexShrink={0}
                mr={3}
                transition="all 0.2s ease"
                _groupHover={{
                  bg: "brand.600",
                  color: "white",
                }}
              >
                <Icon as={tool.icon} boxSize={5} />
              </Flex>

              {/* Middle: Text details */}
              <Flex
                direction="column"
                align="flex-start"
                flex={1}
                minW={0}
                overflow="hidden"
                textAlign="left"
              >
                <Flex align="center" gap={1.5} w="full" minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={headingColor}
                    noOfLines={1}
                    title={tool.name}
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
                      flexShrink={0}
                    >
                      {tool.badge}
                    </Badge>
                  )}
                </Flex>

                {tool.subtext && (
                  <Text
                    fontSize="xs"
                    color={subtextColor}
                    noOfLines={1}
                    w="full"
                    minW={0}
                    title={tool.subtext}
                  >
                    {tool.subtext}
                  </Text>
                )}
              </Flex>

              {/* Right: Chevron Arrow or Spinner */}
              <Flex flexShrink={0} ml={2} align="center" justify="center">
                {isNavigating ? (
                  <Spinner size="xs" color="brand.500" />
                ) : (
                  <Icon
                    as={isVertical ? FiArrowRight : FiChevronRight}
                    boxSize={4}
                    color={chevronColor}
                    transition="all 0.2s ease"
                    _groupHover={{
                      color: chevronHoverColor,
                      transform: isVertical ? "translateX(3px)" : "translateX(3px)",
                    }}
                  />
                )}
              </Flex>
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default ContinueToSection;

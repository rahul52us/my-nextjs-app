"use client";

import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  Textarea,
  Text,
  VStack,
  Grid,
  GridItem,
  Link,
  useToast,
  Icon,
  Container,
  Divider,
  useColorModeValue,
  Badge,
  IconButton,
  Image,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaCopy,
  FaArrowRight,
  FaArrowLeft,
  FaLock,
  FaUnlock,
  FaCogs,
  FaLightbulb,
  FaImage,
  FaCompress,
  FaEdit,
  FaEraser,
  FaFileCode,
  FaTerminal,
  FaShieldAlt,
  FaGlobe,
  FaUsers,
  FaRocket,
  FaHeart,
  FaCheckCircle,
  FaStar,
  FaCode,
  FaFileAlt,
  FaTools,
  FaTwitter,
  FaGithub,
  FaLinkedin
} from "react-icons/fa";
import { sidebarData } from "../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";

const MotionBox = motion(Box);

// ─── List of routes that are actually built ────────────────────────────────
// Keep this in sync with your Next.js pages/app directory.
// Any URL NOT in this set will be hidden from the UI.
const BUILT_ROUTES = new Set([
  "/converter/encoder/ascii",
  "/converter/encoder/audio",
  "/converter/encoder/hex",
  "/converter/encoder/file",
  "/converter/encoder/url",
  "/converter/encoder/json",
  "/converter/encoder/binary",
  "/converter/decoder/ascii",
  "/converter/decoder/audio",
  "/converter/decoder/file",
  "/converter/decoder/image",
  "/converter/decoder/pdf",
  "/converter/decoder/hex",
  "/converter/decoder/json",
  "/converter/decoder/jwt",
  "/converter/decoder/binary",
  "/tools/json-formatter",
  "/tools/text-formatter",
  "/tools/javascript-formatter",
  "/tools/sql-formatter",
  "/tools/excel-to-json",
  "/tools/json-to-excel",
  "/converter/images-to-pdf",
  "/converter/files-to-zip",
  "/converter/decompress-zip",
  "/converter/encrypt-file",
  "/converter/Exceltocsv",
  "/converter/qr-code-generator",
  "/converter/qr-code-reader",
  "/converter/bar-code-generator",
  "/generator/password",
  "/converter/unit-converter",
  "/converter/base-converter",
  "/converter/speed-converter",
  "/converter/currency-converter",
  "/converter/time-converter",
  "/converter/temperature-converter",
  "/converter/data-size-converter",
  "/tools/ip-lookup",
  "/converter/unix-timestamp",
  "/converter/color-converter",
  "/converter/text-case-converter",
  "/converter/PDFtools/PDFtoWord",
  "/converter/PDFtools/PdftoJpg",
  "/converter/PDFtools/Excletopdf",
  "/converter/PDFtools/Wordtopdf",
  "/converter/PDFtools/Pdfedit",
  "/converter/PDFtools/Pdfwatermark",
  "/converter/PDFtools/Pdfpageno",
  "/converter/PDFtools/Pdfmerge",
  "/converter/PDFtools/Pdfsplit",
  "/converter/PDFtools/Pdfpagerearange",
  "/converter/PDFtools/Pdfrotate",
  "/converter/PDFtools/Pdfsign",
  "/converter/PDFtools/Pdfdeffrence",
  "/converter/Imagetools/Imagecom",
  "/converter/Imagetools/Imageedit",
  "/converter/Imagetools/Imagetypeconvert",
  "/converter/Imagetools/Bgremove",
  "/converter/Cvbuilder",
  "/converter/Imageextract",
  "/converter/Regextool",
  "/converter/Codeformatter",
  "/converter/Datavisual",
  "/converter/Aichatboat",
]);

const isBuilt = (url: string) => url === "#" || BUILT_ROUTES.has(url);

export default function HomeContent() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // ── Color tokens – all dark-mode aware ──────────────────────────────────
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.800", "white");
  const subheadColor = useColorModeValue("gray.700", "gray.100");
  const imageToolsBg = useColorModeValue("blue.50", "gray.700");
  const proTipBg = useColorModeValue("gray.50", "gray.900");
  const proTipBorder = useColorModeValue("blue.300", "blue.500");
  const proTipHeading = useColorModeValue("blue.600", "blue.300");
  // Footer tokens
  const footerBg = useColorModeValue("gray.100", "gray.900");
  const footerBorder = useColorModeValue("gray.200", "gray.700");
  const footerText = useColorModeValue("gray.700", "gray.300");
  const footerMuted = useColorModeValue("gray.500", "gray.500");
  const footerHeading = useColorModeValue("gray.900", "white");
  const footerLinkColor = useColorModeValue("gray.600", "gray.400");
  const footerLinkHover = useColorModeValue("blue.600", "blue.400");
  const footerDivider = useColorModeValue("gray.300", "gray.700");
  const footerBrandSub = useColorModeValue("gray.800", "white");
  const footerIconColor = useColorModeValue("gray.600", "gray.400");
  const statCardBg = useColorModeValue("white", "gray.750");
  const featureBadgeBg = useColorModeValue("blue.50", "blue.900");
  const featureBadgeBorder = useColorModeValue("blue.100", "blue.700");

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box bg={pageBg} minH="100vh" transition="background 0.3s ease">
      {/* ══════════════════════════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════════════════════════ */}
      <Container maxW="6xl" pt={16} pb={8}>
        <Box position="relative" mb={16}>
          {/* Glow blob */}
          <Box
            position="absolute"
            top="-10%"
            left="10%"
            w="300px"
            h="300px"
            bg="blue.400"
            filter="blur(150px)"
            opacity={0.1}
            zIndex={0}
          />

          <Grid
            templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }}
            gap={12}
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            {/* Left */}
            <VStack
              spacing={8}
              align={{ base: "center", lg: "start" }}
              textAlign={{ base: "center", lg: "left" }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <HStack
                  bg={featureBadgeBg}
                  border="1px solid"
                  borderColor={featureBadgeBorder}
                  px={4}
                  py={1.5}
                  borderRadius="full"
                  spacing={3}
                  boxShadow="sm"
                  backdropFilter="blur(10px)"
                >
                  <Box
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      position="absolute"
                      w="8px"
                      h="8px"
                      bg="blue.500"
                      borderRadius="full"
                      animation="pulse 2s infinite"
                    />
                    <Box w="8px" h="8px" bg="blue.500" borderRadius="full" />
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    bgClip="text"
                  >
                    Professional Developer Utilities
                  </Text>
                  <Divider
                    orientation="vertical"
                    h="12px"
                    borderColor={useColorModeValue(
                      "blue.200",
                      "whiteAlpha.400",
                    )}
                  />
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    fontSize="2xs"
                    borderRadius="full"
                  >
                    v2.0
                  </Badge>
                </HStack>
              </motion.div>

              <VStack spacing={5} align={{ base: "center", lg: "start" }}>
                <Heading
                  color={headingColor}
                  as="h1"
                  fontSize={{ base: "4xl", md: "6xl", xl: "7xl" }}
                  fontWeight="900"
                  letterSpacing="tighter"
                  lineHeight="1.1"
                >
                  <Text
                    as="span"
                    bgGradient="linear(to-br, blue.400, blue.600)"
                    bgClip="text"
                  >
                    Tools for Developers
                  </Text>
                </Heading>
                <Text
                  color={mutedText}
                  fontSize={{ base: "md", md: "lg" }}
                  maxW="xl"
                  fontWeight="medium"
                  lineHeight="tall"
                >
                  Convert files, process images, encode text, and use powerful
                  utilities directly in your browser.{" "}
                  <Text as="span" color={headingColor}>
                    Built for developers who value security, speed, and privacy.
                  </Text>
                </Text>
              </VStack>

              <Flex
                gap={4}
                direction={{ base: "column", sm: "row" }}
                w={{ base: "full", sm: "auto" }}
              >
                <Button
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<FaArrowRight />}
                  onClick={() =>
                    document
                      .querySelector("#tools")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  px={10}
                  h="60px"
                  shadow="0px 10px 20px -5px rgba(66,153,225,0.4)"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "0px 15px 25px -5px rgba(66,153,225,0.4)",
                  }}
                >
                  Get Started Free
                </Button>
                <Link
                  as={NextLink}
                  href="#tools"
                  _hover={{ textDecoration: "none" }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor={borderColor}
                    h="60px"
                    px={8}
                    bg={cardBg}
                    color={headingColor}
                  >
                    View All Tools
                  </Button>
                </Link>
              </Flex>

              <HStack spacing={6} pt={4} color={mutedText}>
                <HStack spacing={2}>
                  <Icon as={FaShieldAlt} color="green.400" />
                  <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                    Local Processing
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaLock} color="purple.400" />
                  <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                    SSL Secured
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaTerminal} color="blue.400" />
                  <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                    RFC 4648
                  </Text>
                </HStack>
              </HStack>
            </VStack>

            {/* Right – illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box
                position="relative"
                p={2}
                bgGradient="linear(to-br, blue.500, purple.500)"
                borderRadius="3xl"
                shadow="2xl"
                transform="rotate3d(1,1,1,-5deg)"
              >
                <Image
                  src="https://static.vecteezy.com/system/resources/previews/019/018/890/non_2x/pdf-converter-from-jpeg-word-document-concept-screen-with-changing-or-converting-process-of-document-to-another-format-flat-illustration-for-app-website-banner-vector.jpg"
                  alt="Developer Tools"
                  borderRadius="2xl"
                  objectFit="cover"
                  h={{ base: "300px", md: "450px" }}
                  w="full"
                />
                <MotionBox
                  position="absolute"
                  bottom="-20px"
                  left="-20px"
                  bg={cardBg}
                  p={4}
                  borderRadius="xl"
                  shadow="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    repeatType: "reverse",
                  }}
                >
                  <HStack spacing={3}>
                    <Box
                      boxSize="40px"
                      bg="blue.500"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaFileCode} color="white" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={headingColor}
                      >
                        Auto-Detected
                      </Text>
                      <Text fontSize="2xs" color={mutedText}>
                        UTF-8 Plaintext
                      </Text>
                    </VStack>
                  </HStack>
                </MotionBox>
              </Box>
            </motion.div>
          </Grid>

          <style jsx global>{`
            @keyframes pulse {
              0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7);
              }
              70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(66, 153, 225, 0);
              }
              100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
              }
            }
          `}</style>
        </Box>

        {/* ══════════════════════════════════════════════════════════
                    STATS ROW
                ══════════════════════════════════════════════════════════ */}
        {/* <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} mb={20}>
                    {[
                        { label: "Tools Available", value: "50+",  icon: FaTools,    color: "blue.500"   },
                        { label: "Happy Users",      value: "10K+", icon: FaUsers,    color: "purple.500" },
                        { label: "Files Processed",  value: "1M+",  icon: FaFileAlt,  color: "green.500"  },
                        { label: "Countries",        value: "120+", icon: FaGlobe,    color: "orange.500" },
                    ].map((stat) => (
                        <MotionBox key={stat.label} whileHover={{ y: -4 }}
                            bg={cardBg} p={6} borderRadius="2xl"
                            border="1px solid" borderColor={borderColor} shadow="sm" textAlign="center">
                            <Icon as={stat.icon} boxSize={7} color={stat.color} mb={3} />
                            <Text fontSize="2xl" fontWeight="900" color={headingColor}>{stat.value}</Text>
                            <Text fontSize="xs" color={mutedText} fontWeight="medium">{stat.label}</Text>
                        </MotionBox>
                    ))}
                </SimpleGrid> */}

        {/* ══════════════════════════════════════════════════════════════
    FEATURED TOOLS SECTION — 12 Cards
    Paste karo "WHY CHOOSE US" section ke closing </Box> ke baad
    aur "EDUCATIONAL — BASE64" section se pehle — HomeContent.tsx mein
══════════════════════════════════════════════════════════════ */}

        <Box mb={20}>
          {/* Section Header */}
          <VStack spacing={3} mb={10} textAlign="center">
            <Badge
              colorScheme="blue"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              Popular Tools
            </Badge>
            <Heading color={headingColor} size="xl" fontWeight="900">
              Everything You Need,{" "}
              <Text
                as="span"
                bgGradient="linear(to-br, blue.400, blue.600)"
                bgClip="text"
              >
                Right Here
              </Text>
            </Heading>
            <Text color={mutedText} maxW="xl" fontSize="md">
              Most-used tools by thousands of developers — fast, free, and
              browser-based.
            </Text>
          </VStack>

          {/* 12 Tool Cards Grid */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
            {[
              {
                href: "/converter/PDFtools/PDFtoWord",
                iconBg: "#E6F1FB",
                label: "PDF to Word",
                desc: "Convert PDF into editable DOC/DOCX documents",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#185FA5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
              },
              {
                href: "/converter/PDFtools/Pdfmerge",
                iconBg: "#EEEDFE",
                label: "PDF Merge",
                desc: "Combine multiple PDFs into one single file",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#534AB7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="8" height="13" rx="1.5" />
                    <rect x="14" y="7" width="8" height="13" rx="1.5" />
                    <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                ),
              },
              {
                href: "/converter/PDFtools/Wordtopdf",
                iconBg: "#EAF3DE",
                label: "Word to PDF",
                desc: "Convert DOC/DOCX files to PDF format instantly",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B6D11"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                ),
              },
              {
                href: "/converter/PDFtools/Excletopdf",
                iconBg: "#E1F5EE",
                label: "Excel to PDF",
                desc: "Turn Excel spreadsheets into clean PDF files",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F6E56"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                ),
              },
              {
                href: "/converter/Imagetools/Imagecom",
                iconBg: "#FAEEDA",
                label: "Image Compressor",
                desc: "Reduce image file size without losing quality",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#854F0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ),
              },
              {
                href: "/tools/text-formatter",
                iconBg: "#FBEAF0",
                label: "Text Formatter",
                desc: "Format, clean, and transform any text content",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#993556"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="14" y2="12" />
                    <line x1="4" y1="18" x2="18" y2="18" />
                  </svg>
                ),
              },
              {
                href: "/converter/files-to-zip",
                iconBg: "#FAECE7",
                label: "Files to ZIP",
                desc: "Compress multiple files into a ZIP archive",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#993C1D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                ),
              },
              {
                href: "/converter/currency-converter",
                iconBg: "#E1F5EE",
                label: "Currency Converter",
                desc: "Convert between world currencies in real time",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F6E56"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
                    <line x1="12" y1="6" x2="12" y2="8" />
                    <line x1="12" y1="16" x2="12" y2="18" />
                  </svg>
                ),
              },
              {
                href: "/converter/Cvbuilder",
                iconBg: "#EEEDFE",
                label: "CV Builder",
                desc: "Create a professional resume in just minutes",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#534AB7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                ),
              },
              {
                href: "/converter/color-converter",
                iconBg: "#F1EFE8",
                label: "Color Converter",
                desc: "Convert HEX, RGB, HSL color codes instantly",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5F5E5A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.2-1-.53-1.36a.491.491 0 0 1 .35-.84H15c3.31 0 6-2.69 6-6 0-4.97-4.03-9-9-9z" />
                    <circle
                      cx="6.5"
                      cy="11.5"
                      r="1.5"
                      fill="#185FA5"
                      stroke="none"
                    />
                    <circle
                      cx="9.5"
                      cy="7.5"
                      r="1.5"
                      fill="#3B6D11"
                      stroke="none"
                    />
                    <circle
                      cx="14.5"
                      cy="7.5"
                      r="1.5"
                      fill="#993C1D"
                      stroke="none"
                    />
                    <circle
                      cx="17.5"
                      cy="11.5"
                      r="1.5"
                      fill="#854F0B"
                      stroke="none"
                    />
                  </svg>
                ),
              },
              {
                href: "/converter/qr-code-generator",
                iconBg: "#E6F1FB",
                label: "QR Code Generator",
                desc: "Generate QR codes for URLs, text, and more",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#185FA5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect
                      x="5"
                      y="5"
                      width="3"
                      height="3"
                      fill="#185FA5"
                      stroke="none"
                    />
                    <rect
                      x="16"
                      y="5"
                      width="3"
                      height="3"
                      fill="#185FA5"
                      stroke="none"
                    />
                    <rect
                      x="5"
                      y="16"
                      width="3"
                      height="3"
                      fill="#185FA5"
                      stroke="none"
                    />
                    <line x1="14" y1="14" x2="17" y2="14" />
                    <line x1="14" y1="17" x2="14" y2="21" />
                    <line x1="17" y1="21" x2="21" y2="21" />
                    <line x1="21" y1="14" x2="21" y2="17" />
                    <line x1="17" y1="17" x2="17" y2="17" />
                  </svg>
                ),
              },
              {
                href: "/converter/PDFtools/Pdfrotate",
                iconBg: "#FAEEDA",
                label: "PDF Rotate",
                desc: "Rotate PDF pages to any angle you need",
                svg: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#854F0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 13.5a3 3 0 1 0 6 0" />
                    <polyline points="15 11.5 15 13.5 13 13.5" />
                  </svg>
                ),
              },
            ].map((tool) => (
              <MotionBox
                key={tool.href}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link
                  as={NextLink}
                  href={tool.href}
                  _hover={{ textDecoration: "none" }}
                >
                  <Box
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    p={6}
                    display="flex"
                    flexDirection="column"
                    gap={4}
                    role="group"
                    transition="all 0.25s ease"
                    _hover={{
                      borderColor: "blue.300",
                      shadow: "lg",
                    }}
                    h="full"
                  >
                    {/* Icon + Arrow Row */}
                    <Flex justify="space-between" align="center">
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        bg={tool.iconBg}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        transition="transform 0.25s"
                        _groupHover={{ transform: "scale(1.1)" }}
                      >
                        {tool.svg}
                      </Box>
                      <Icon
                        as={FaArrowRight}
                        boxSize={3}
                        color={mutedText}
                        transition="transform 0.25s, color 0.25s"
                        _groupHover={{
                          color: "blue.500",
                          transform: "translateX(3px)",
                        }}
                      />
                    </Flex>

                    {/* Text */}
                    <Box>
                      <Text
                        fontWeight="700"
                        fontSize="sm"
                        color={headingColor}
                        mb={1}
                        _groupHover={{ color: "blue.500" }}
                        transition="color 0.2s"
                      >
                        {tool.label}
                      </Text>
                      <Text fontSize="xs" color={mutedText} lineHeight="1.6">
                        {tool.desc}
                      </Text>
                    </Box>
                  </Box>
                </Link>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>
        {/* ── END FEATURED TOOLS ── */}

        {/* ══════════════════════════════════════════════════════════
                    ABOUT / WHAT WE OFFER
                ══════════════════════════════════════════════════════════ */}
        <Box mb={20}>
          <VStack spacing={4} mb={12} textAlign="center">
            <Badge
              colorScheme="blue"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              About Toolsahayata
            </Badge>
            <Heading color={headingColor} size="xl" fontWeight="900">
              Your All-in-One Developer Toolbox
            </Heading>
            <Text color={mutedText} maxW="2xl" fontSize="md" lineHeight="tall">
              Toolsahayata is a free, browser-based platform offering 50+
              professional utilities for developers, designers, and digital
              professionals. Everything runs locally in your browser — your data
              never leaves your device.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {[
              {
                icon: FaCode,
                color: "blue.500",
                bg: useColorModeValue("blue.50", "blue.900"),
                title: "Encoding & Decoding",
                desc: "Base64 encode/decode, Binary conversions, JWT decoding, ASCII transformations — all the encoding tools you need in one place.",
              },
              {
                icon: FaFileAlt,
                color: "purple.500",
                bg: useColorModeValue("purple.50", "purple.900"),
                title: "File & PDF Tools",
                desc: "Merge, split, rotate, sign, watermark PDFs. Convert between Word, Excel, JPG and PDF formats seamlessly.",
              },
              {
                icon: FaImage,
                color: "green.500",
                bg: useColorModeValue("green.50", "green.900"),
                title: "Image Processing",
                desc: "Compress images, edit them, remove backgrounds, convert formats — professional grade image tools right in your browser.",
              },
              {
                icon: FaCogs,
                color: "orange.500",
                bg: useColorModeValue("orange.50", "orange.900"),
                title: "Formatters & Validators",
                desc: "Format JSON, JavaScript, SQL and more. Validate and pretty-print data structures instantly.",
              },
              {
                icon: FaGlobe,
                color: "teal.500",
                bg: useColorModeValue("teal.50", "teal.900"),
                title: "Unit & Currency Converters",
                desc: "Convert units, currencies, temperatures, data sizes, speed, and time zones — all with real-time accuracy.",
              },
              {
                icon: FaRocket,
                color: "pink.500",
                bg: useColorModeValue("pink.50", "pink.900"),
                title: "Generators & Utilities",
                desc: "QR codes, barcodes, passwords, regex tester, code formatter, data visualizer, and an AI chatbot — all in one toolkit.",
              },
            ].map((item) => (
              <MotionBox
                key={item.title}
                whileHover={{ y: -6 }}
                bg={cardBg}
                p={8}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                shadow="sm"
              >
                <Box
                  w="50px"
                  h="50px"
                  bg={item.bg}
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                >
                  <Icon as={item.icon} color={item.color} boxSize={5} />
                </Box>
                <Heading size="sm" color={headingColor} mb={2}>
                  {item.title}
                </Heading>
                <Text fontSize="sm" color={mutedText} lineHeight="tall">
                  {item.desc}
                </Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>

        {/* ══════════════════════════════════════════════════════════
                    VISUAL IMAGE TOOLS CARD  (dark mode fixed)
                ══════════════════════════════════════════════════════════ */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          mt={4}
          mb={20}
          bg={cardBg}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          shadow="2xl"
        >
          <Flex direction={{ base: "column", md: "row" }}>
            <Box
              flex="1"
              bg={imageToolsBg}
              p={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="https://media.istockphoto.com/id/1158584831/vector/photo-or-graphic-editor-on-tablet-vector-illustration-flat-cartoon-graphics-tablet-screen.jpg?s=612x612&w=0&k=20&c=ugL91d3Kav24OKmvFW_WXhbhn3RFCTFJ4yP29unOdx4="
                alt="Image Tools"
                maxW="250px"
              />
            </Box>
            <Box flex="1.2" p={{ base: 8, md: 12 }}>
              <Heading size="lg" mb={2}>
                <Text
                  as="span"
                  bgGradient="linear(to-br, blue.400, blue.600)"
                  bgClip="text"
                >
                  Visual Image Tools
                </Text>
              </Heading>
              <Text color={mutedText} mb={6}>
                Professional grade image processing right in your browser.
              </Text>

              <Grid
                templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                gap={4}
              >
                {[
                  {
                    href: "/converter/Imagetools/Imagecom",
                    icon: FaCompress,
                    label: "Image Compressor",
                  },
                  {
                    href: "/converter/Imagetools/Imageedit",
                    icon: FaEdit,
                    label: "Image Edit",
                  },
                  // { href: "/converter/Imagetools/Bgremove",      icon: FaEraser,   label: "BG Remover"       },
                  {
                    href: "/converter/Imagetools/Imagetypeconvert",
                    icon: FaImage,
                    label: "Type Converter",
                  },
                ]
                  .filter((item) => isBuilt(item.href))
                  .map((item) => (
                    <Link
                      key={item.href}
                      as={NextLink}
                      href={item.href}
                      _hover={{ textDecoration: "none" }}
                    >
                      <HStack
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={borderColor}
                        role="group"
                        bg={cardBg}
                        _hover={{ bg: imageToolsBg, borderColor: "blue.300" }}
                      >
                        <Icon
                          as={item.icon}
                          color="blue.500"
                          _groupHover={{ color: "blue.400" }}
                        />
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          color={subheadColor}
                          _groupHover={{ color: headingColor }}
                        >
                          {item.label}
                        </Text>
                      </HStack>
                    </Link>
                  ))}
              </Grid>
            </Box>
          </Flex>
        </MotionBox>

        {/* ══════════════════════════════════════════════════════════
                    DEVELOPER ECOSYSTEM (scrollable cards)
                    – only shows categories that have at least one built child
                ══════════════════════════════════════════════════════════ */}
        <Box mt={4} id="tools" position="relative" px={2} mb={20}>
          <Box
            position="absolute"
            top="-10%"
            left="-5%"
            w="400px"
            h="400px"
            bg="blue.400"
            filter="blur(120px)"
            opacity={0.15}
            zIndex={-1}
            borderRadius="full"
          />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Flex align="flex-end" justify="space-between" mb={12}>
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Box boxSize="8px" bg="blue.500" borderRadius="full" />
                  <Text
                    color="blue.500"
                    fontWeight="bold"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="widest"
                  >
                    Professional Toolkit
                  </Text>
                </HStack>
                <Heading
                  color={headingColor}
                  as="h2"
                  size="2xl"
                  fontWeight="900"
                  letterSpacing="tight"
                >
                  Developer{" "}
                  <Text as="span" color="blue.500" position="relative">
                    Ecosystem
                    <Box
                      as="span"
                      position="absolute"
                      bottom="2"
                      left="0"
                      w="full"
                      h="12px"
                      bg={useColorModeValue("blue.100", "blue.900")}
                      zIndex={-1}
                      opacity={0.6}
                    />
                  </Text>
                </Heading>
              </VStack>
              <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                <IconButton
                  aria-label="left"
                  icon={<FaArrowLeft />}
                  variant="ghost"
                  borderRadius="full"
                  onClick={() => scroll("left")}
                  _hover={{
                    transform: "translateX(-4px)",
                    bg: useColorModeValue("gray.200", "gray.700"),
                  }}
                />
                <IconButton
                  aria-label="right"
                  icon={<FaArrowRight />}
                  variant="solid"
                  colorScheme="blue"
                  borderRadius="full"
                  onClick={() => scroll("right")}
                  _hover={{ transform: "translateX(4px)", shadow: "lg" }}
                />
              </HStack>
            </Flex>
          </motion.div>

          <Box
            ref={scrollContainerRef}
            display="flex"
            overflowX="auto"
            gap={8}
            pb={12}
            sx={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
            }}
          >
            {/* Promo card */}
            <MotionBox
              minW={{ base: "300px", md: "350px" }}
              sx={{ scrollSnapAlign: "start" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                p={10}
                height="380px"
                borderRadius="3xl"
                shadow="2xl"
                position="relative"
                overflow="hidden"
                bgGradient="linear(to-br, blue.500, purple.600)"
                color="white"
              >
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  opacity={0.2}
                  transform="rotate(15deg)"
                >
                  <FaImage size="200px" />
                </Box>
                <VStack align="start" height="full" justify="space-between">
                  <Box>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="whiteAlpha.300"
                      color="white"
                      backdropFilter="blur(10px)"
                      mb={4}
                    >
                      Visual Studio
                    </Badge>
                    <Heading color="white" size="lg" mb={4}>
                      Next-Gen Image Processing
                    </Heading>
                    <Text fontSize="sm" opacity={0.9} noOfLines={3}>
                      Studio-grade tools for modern developers. Compress, edit,
                      and strip backgrounds in seconds.
                    </Text>
                  </Box>
                  <Link
                    as={NextLink}
                    href="/converter/Imagetools/Imagecom"
                    _hover={{ textDecoration: "none" }}
                  >
                    <Button
                      rightIcon={<FaArrowRight />}
                      variant="solid"
                      bg="white"
                      color="blue.600"
                      _hover={{ bg: "gray.100", transform: "scale(1.05)" }}
                      size="lg"
                      borderRadius="2xl"
                    >
                      Explore Studio
                    </Button>
                  </Link>
                </VStack>
              </Box>
            </MotionBox>

            {/* Dynamic sidebar cards — only show if category has built children */}
            {sidebarData
              .map((cat) => {
                // Flatten all leaf children and filter to built ones
                const allChildren =
                  cat.children?.flatMap((c: any) =>
                    c.children ? c.children : [c],
                  ) ?? [];
                const builtChildren = allChildren.filter((c: any) =>
                  isBuilt(c.url),
                );
                if (builtChildren.length === 0) return null;

                const firstBuiltUrl = builtChildren[0]?.url ?? "#";

                return { cat, builtChildren, firstBuiltUrl };
              })
              .filter(Boolean)
              .map(
                ({ cat, builtChildren, firstBuiltUrl }: any, index: number) => (
                  <MotionBox
                    key={cat.id}
                    minW={{ base: "300px", md: "350px" }}
                    sx={{ scrollSnapAlign: "start" }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -12 }}
                  >
                    <Link
                      as={NextLink}
                      href={firstBuiltUrl}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Box
                        p={8}
                        height="380px"
                        bg={cardBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="3xl"
                        transition="all 0.4s"
                        display="flex"
                        flexDirection="column"
                        shadow="sm"
                        _hover={{
                          shadow: "3xl",
                          borderColor: "blue.400",
                          bg: cardBg,
                        }}
                        role="group"
                      >
                        <Flex justify="space-between" align="center" mb={8}>
                          <Box
                            p={4}
                            bg={useColorModeValue("blue.50", "gray.700")}
                            color="blue.500"
                            borderRadius="2xl"
                            transition="all 0.3s"
                            _groupHover={{
                              bg: "blue.500",
                              color: "white",
                              transform: "rotate(-5deg)",
                            }}
                          >
                            <Box fontSize="2xl">{cat.icon}</Box>
                          </Box>
                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="lg"
                          >
                            {builtChildren.length} Tools
                          </Badge>
                        </Flex>

                        <Heading
                          size="md"
                          mb={3}
                          color={headingColor}
                          _groupHover={{ color: "blue.500" }}
                        >
                          {cat.name}
                        </Heading>
                        <Text fontSize="sm" color={mutedText} mb={6}>
                          The essential collection of utilities for{" "}
                          {cat.name.toLowerCase()}.
                        </Text>

                        <VStack align="start" spacing={3} flex="1">
                          {builtChildren
                            .slice(0, 3)
                            .map((tool: any, idx: number) => (
                              <HStack key={idx} spacing={3} role="group">
                                <Icon
                                  as={FaArrowRight}
                                  boxSize={3}
                                  color="blue.200"
                                  _groupHover={{ color: "blue.500" }}
                                />
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color={mutedText}
                                  _groupHover={{ color: headingColor }}
                                >
                                  {tool.name}
                                </Text>
                              </HStack>
                            ))}
                        </VStack>

                        <Divider my={4} borderColor={borderColor} />
                        <HStack
                          justify="space-between"
                          color="blue.500"
                          fontWeight="bold"
                          fontSize="xs"
                          letterSpacing="widest"
                        >
                          <Text>LAUNCH TOOLKIT</Text>
                          <Icon
                            as={FaArrowRight}
                            boxSize={3}
                            transition="transform 0.3s"
                            _groupHover={{ transform: "translateX(5px)" }}
                          />
                        </HStack>
                      </Box>
                    </Link>
                  </MotionBox>
                ),
              )}
          </Box>
        </Box>

        <Divider my={8} borderColor={borderColor} />

        {/* ══════════════════════════════════════════════════════════
                    HOW IT WORKS
                ══════════════════════════════════════════════════════════ */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={10}
          mb={20}
        >
          {[
            {
              icon: FaShieldAlt,
              color: "blue.500",
              title: "100% Private",
              desc: "Your data never leaves your device. All processing is performed locally using your browser's V8 engine, ensuring sensitive data remains secure.",
            },
            {
              icon: FaTerminal,
              color: "purple.500",
              title: "Developer Ready",
              desc: "Standardized for RFC 4648. Perfect for handling Web API responses, Basic Auth headers, or embedding small assets directly into your CSS and HTML files.",
            },
            {
              icon: FaLightbulb,
              color: "yellow.500",
              title: "Smart Validation",
              desc: "Our tool automatically detects padding errors and illegal characters in your Base64 strings, providing instant feedback if the decoding process fails.",
            },
          ].map((item) => (
            <VStack key={item.title} align="start" spacing={4}>
              <Icon as={item.icon} boxSize={8} color={item.color} />
              <Heading color={headingColor} size="md">
                {item.title}
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                {item.desc}
              </Text>
            </VStack>
          ))}
        </Grid>

        {/* ══════════════════════════════════════════════════════════
                    WHY CHOOSE US
                ══════════════════════════════════════════════════════════ */}
        <Box
          bg={cardBg}
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderColor}
          mb={20}
          shadow="sm"
        >
          <VStack spacing={2} mb={8} textAlign="center">
            <Badge
              colorScheme="purple"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              Why Toolsahayata?
            </Badge>
            <Heading color={headingColor} size="lg">
              Built With Developers in Mind
            </Heading>
            <Text color={mutedText} maxW="xl">
              We built the tools we always wished existed — fast, private, and
              completely free.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {[
              "No account required — use everything instantly",
              "All processing happens locally in your browser",
              "50+ tools covering every common dev task",
              "Works on any device — desktop, tablet, or mobile",
              "Continuously updated with new tools & improvements",
              "Clean, distraction-free interface for focused work",
            ].map((point) => (
              <HStack key={point} spacing={3} align="start">
                <Icon
                  as={FaCheckCircle}
                  color="green.400"
                  mt={0.5}
                  flexShrink={0}
                />
                <Text fontSize="sm" color={mutedText}>
                  {point}
                </Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* ══════════════════════════════════════════════════════════
                    EDUCATIONAL — BASE64
                ══════════════════════════════════════════════════════════ */}
        <Box
          bg={cardBg}
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderColor}
          mb={20}
        >
          <VStack align="start" spacing={6}>
            <Heading color={headingColor} size="lg">
              Understanding Base64 Encoding
            </Heading>
            <Text color={mutedText}>
              Base64 is a group of binary-to-text encoding schemes that
              represent binary data in an ASCII string format by translating it
              into a radix-64 representation. It is designed to carry data
              stored in binary formats across channels that only reliably
              support text content.
            </Text>
            <Grid
              templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }}
              gap={12}
              w="full"
            >
              <VStack align="start" spacing={4}>
                <Heading color={headingColor} size="sm">
                  Why use Base64?
                </Heading>
                <VStack
                  align="start"
                  spacing={2}
                  fontSize="sm"
                  color={mutedText}
                >
                  <Text>
                    •{" "}
                    <Text as="b" color={subheadColor}>
                      Data URLs:
                    </Text>{" "}
                    Embed images directly in HTML/CSS to reduce HTTP requests.
                  </Text>
                  <Text>
                    •{" "}
                    <Text as="b" color={subheadColor}>
                      Email Attachments:
                    </Text>{" "}
                    MIME uses Base64 for non-text data.
                  </Text>
                  <Text>
                    •{" "}
                    <Text as="b" color={subheadColor}>
                      Authentication:
                    </Text>{" "}
                    Basic Auth headers require Base64-encoded credentials.
                  </Text>
                  <Text>
                    •{" "}
                    <Text as="b" color={subheadColor}>
                      Legacy Systems:
                    </Text>{" "}
                    Transferring binary data over 7-bit ASCII systems.
                  </Text>
                </VStack>
              </VStack>
              <Box
                p={6}
                bg={proTipBg}
                borderRadius="2xl"
                border="1px dashed"
                borderColor={proTipBorder}
              >
                <Heading size="xs" mb={3} color={proTipHeading}>
                  Pro Tip: Character Set
                </Heading>
                <Text fontSize="xs" color={mutedText} lineHeight="tall">
                  Base64 uses{" "}
                  <Text as="b" color={subheadColor}>
                    A–Z
                  </Text>
                  ,{" "}
                  <Text as="b" color={subheadColor}>
                    a–z
                  </Text>
                  ,{" "}
                  <Text as="b" color={subheadColor}>
                    0–9
                  </Text>
                  ,{" "}
                  <Text as="b" color={subheadColor}>
                    +
                  </Text>{" "}
                  and{" "}
                  <Text as="b" color={subheadColor}>
                    /
                  </Text>
                  . The{" "}
                  <Text as="b" color={subheadColor}>
                    =
                  </Text>{" "}
                  sign is used for padding to ensure the encoded data is a
                  multiple of 4 bytes.
                </Text>
              </Box>
            </Grid>
          </VStack>
        </Box>

        {/* ══════════════════════════════════════════════════════════
                    FAQ
                ══════════════════════════════════════════════════════════ */}
        <VStack spacing={8} mb={20} align="start">
          <Heading color={headingColor} size="lg">
            Frequently Asked Questions
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            {[
              {
                q: "Is Base64 a form of encryption?",
                a: "No. Base64 is an encoding scheme, not encryption. It is easily reversible and provides zero security. Never use it to 'hide' passwords without actual encryption like AES.",
              },
              {
                q: "Does encoding increase file size?",
                a: "Yes. Base64 encoding typically increases data size by approximately 33% compared to the original binary data.",
              },
              {
                q: "Can I encode images here?",
                a: "Currently, this tool supports text-to-base64. For raw image files, use our specialized Image to Base64 tool in the Image Tools section.",
              },
              {
                q: "What is the 'atob' and 'btoa' limit?",
                a: "Browser-native functions generally handle strings up to several megabytes, but performance may vary based on your system RAM.",
              },
              {
                q: "Is Toolsahayata completely free?",
                a: "Yes! All tools are 100% free to use with no account required. We believe great developer tools should be accessible to everyone.",
              },
              {
                q: "Does my data get stored on your servers?",
                a: "No. All processing happens entirely in your browser. We do not transmit, store, or log any data you process through our tools.",
              },
            ].map(({ q, a }) => (
              <Box key={q}>
                <Text fontWeight="bold" mb={2} color={headingColor}>
                  {q}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  {a}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* ══════════════════════════════════════════════════════════════
                FOOTER  — fully theme-aware (light & dark)
            ══════════════════════════════════════════════════════════════ */}
      <Box
        as="footer"
        bg={footerBg}
        borderTop="1px solid"
        borderColor={footerBorder}
        mt={8}
      >
        <Container maxW="6xl" py={12}>
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }}
            gap={10}
            mb={10}
          >
            {/* Brand */}
            <VStack align="start" spacing={4}>
              <Heading size="md" color={footerHeading}>
                <Text as="span" color="blue.500">
                  Tools
                </Text>
                <Text as="span" color={footerBrandSub}>
                  ahayata
                </Text>
              </Heading>
              <Text
                fontSize="sm"
                color={footerMuted}
                lineHeight="tall"
                maxW="260px"
              >
                A free, browser-based toolkit for developers. 50+ tools. Zero
                uploads. 100% private.
              </Text>
              <HStack spacing={4} pt={2} color={footerIconColor}>
                <Icon
                  as={FaTwitter}
                  boxSize={5}
                  cursor="pointer"
                  _hover={{ color: "blue.400" }}
                />
                <Icon
                  as={FaGithub}
                  boxSize={5}
                  cursor="pointer"
                  _hover={{ color: footerHeading }}
                />
                <Icon
                  as={FaLinkedin}
                  boxSize={5}
                  cursor="pointer"
                  _hover={{ color: "blue.500" }}
                />
              </HStack>
            </VStack>

            {/* Quick Links */}
            <VStack align="start" spacing={3}>
              <Text
                fontWeight="bold"
                color={footerHeading}
                fontSize="sm"
                mb={1}
              >
                Quick Links
              </Text>
              {[
                { label: "JSON Formatter", href: "/tools/json-formatter" },
                { label: "Base64 Encoder", href: "/converter/encoder/ascii" },
                { label: "QR Generator", href: "/converter/qr-code-generator" },
                { label: "PDF Merge", href: "/converter/PDFtools/Pdfmerge" },
                {
                  label: "Image Compressor",
                  href: "/converter/Imagetools/Imagecom",
                },
              ]
                .filter((l) => isBuilt(l.href))
                .map((l) => (
                  <Link
                    key={l.href}
                    as={NextLink}
                    href={l.href}
                    fontSize="sm"
                    color={footerLinkColor}
                    _hover={{ color: footerLinkHover }}
                  >
                    {l.label}
                  </Link>
                ))}
            </VStack>

            {/* Tools */}
            <VStack align="start" spacing={3}>
              <Text
                fontWeight="bold"
                color={footerHeading}
                fontSize="sm"
                mb={1}
              >
                Tools
              </Text>
              {[
                { label: "PDF Tools", href: "/converter/PDFtools/Pdfedit" },
                {
                  label: "Image Tools",
                  href: "/converter/Imagetools/Imagecom",
                },
                { label: "File Converters", href: "/converter/files-to-zip" },
                { label: "Unit Converter", href: "/converter/unit-converter" },
                // { label: "Password Gen",    href: "/generator/password"            },
              ]
                .filter((l) => isBuilt(l.href))
                .map((l) => (
                  <Link
                    key={l.href}
                    as={NextLink}
                    href={l.href}
                    fontSize="sm"
                    color={footerLinkColor}
                    _hover={{ color: footerLinkHover }}
                  >
                    {l.label}
                  </Link>
                ))}
            </VStack>

            {/* More */}
            <VStack align="start" spacing={3}>
              <Text
                fontWeight="bold"
                color={footerHeading}
                fontSize="sm"
                mb={1}
              >
                More
              </Text>
              {[
                { label: "CV Builder", href: "/converter/Cvbuilder" },
                { label: "AI Chatbot", href: "/converter/Aichatboat" },
                { label: "Data Visualizer", href: "/converter/Datavisual" },
                { label: "Regex Tester", href: "/converter/Regextool" },
                { label: "Code Formatter", href: "/converter/Codeformatter" },
              ]
                .filter((l) => isBuilt(l.href))
                .map((l) => (
                  <Link
                    key={l.href}
                    as={NextLink}
                    href={l.href}
                    fontSize="sm"
                    color={footerLinkColor}
                    _hover={{ color: footerLinkHover }}
                  >
                    {l.label}
                  </Link>
                ))}
            </VStack>
          </Grid>

          <Divider borderColor={footerDivider} mb={6} />

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontSize="xs" color={footerMuted}>
              © {new Date().getFullYear()} Toolsahayata. All rights reserved.
              Built with ❤️ for developers.
            </Text>
            <HStack spacing={6} fontSize="xs" color={footerMuted}>
              <Text cursor="pointer" _hover={{ color: footerText }}>
                Privacy Policy
              </Text>
              <Text cursor="pointer" _hover={{ color: footerText }}>
                Terms of Service
              </Text>
              <Text cursor="pointer" _hover={{ color: footerText }}>
                Contact
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

"use client";

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
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
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaCopy,
  FaArrowRight,
  FaArrowLeft,
  FaLock,
  FaUnlock,
  FaCode,
  FaInfoCircle,
  FaLightbulb,
  FaCogs,
  FaUserShield,
  FaMap,
  FaDesktop,
  FaCheckCircle,
} from "react-icons/fa";
import { sidebarData } from "../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";

const MotionBox = motion(Box);

export default function HomePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("blue.50", "whiteAlpha.50");

  useEffect(() => {
    document.title = "Base64 Encoder & Decoder | Developer Toolkit";
  }, []);

  // Slider Scroll Logic
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleConvert = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const result = mode === "encode" ? btoa(input.trim()) : atob(input.trim());
        setOutput(result);
        setError("");
      } catch {
        setOutput("");
        setError(`Invalid ${mode === "encode" ? "text input" : "Base64"} for ${mode}.`);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
      variant: "subtle",
    });
  };

  return (
    <Box bg={bgColor} minH="100vh" transition="0.3s ease">
      <Head>
        <meta name="description" content="Simple Base64 encoding and decoding tool for developers." />
      </Head>

      <Container maxW="6xl" py={12}>
        {/* --- Hero Section --- */}
        <VStack spacing={6} textAlign="center" mb={16}>
          <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" mb={-2}>
            Professional Developer Utilities
          </Badge>
          <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="800" letterSpacing="tight">
            Base64 <Text as="span" color="blue.500">Encoder & Decoder</Text>
          </Heading>
          <Text color={mutedText} fontSize="lg" maxW="3xl">
            A high-performance utility for converting between binary data and text. Secure, client-side processing.
          </Text>

          <Flex gap={4} mt={4}>
            <Button size="lg" colorScheme="blue" rightIcon={<FaArrowRight />} onClick={() => document.querySelector('.text-area')?.scrollIntoView({ behavior: 'smooth' })} px={8} shadow="lg">
              Get Started
            </Button>
            <Link href="#tools" _hover={{ textDecoration: "none" }}>
              <Button size="lg" variant="ghost" colorScheme="blue">Explore Toolkit</Button>
            </Link>
          </Flex>
        </VStack>

        {/* --- Converter Workspace --- */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={8}>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Box bg={cardBg} p={8} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="xl">
              <Flex justify="space-between" align="center" mb={6}>
                <Flex bg={useColorModeValue("gray.100", "gray.700")} p={1} borderRadius="xl">
                  <Button size="sm" borderRadius="lg" leftIcon={<FaLock />} isActive={mode === "encode"} variant={mode === "encode" ? "solid" : "ghost"} colorScheme={mode === "encode" ? "blue" : "gray"} onClick={() => setMode("encode")}>
                    Encode
                  </Button>
                  <Button size="sm" borderRadius="lg" leftIcon={<FaUnlock />} isActive={mode === "decode"} variant={mode === "decode" ? "solid" : "ghost"} colorScheme={mode === "decode" ? "blue" : "gray"} onClick={() => setMode("decode")} ml={1}>
                    Decode
                  </Button>
                </Flex>
                <Text fontSize="xs" fontWeight="bold" color="blue.500" textTransform="uppercase" letterSpacing="widest">
                  {mode} Mode
                </Text>
              </Flex>

              <Textarea className="text-area" value={input} placeholder={mode === "encode" ? "Enter plain text..." : "Paste Base64..."} onChange={(e) => setInput(e.target.value)} minH="220px" borderRadius="xl" borderColor={borderColor} fontSize="md" fontFamily="mono" bg={useColorModeValue("gray.50", "gray.900")} p={4} />

              <Button mt={6} width="full" size="lg" colorScheme="blue" onClick={handleConvert} isLoading={loading} height="60px" borderRadius="xl">
                Execute {mode === "encode" ? "Encoding" : "Decoding"}
              </Button>

              {output && (
                <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} mt={10}>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="bold" fontSize="sm">RESULT</Text>
                    <Button size="xs" variant="outline" onClick={copyOutput} leftIcon={<FaCopy />}>Copy</Button>
                  </Flex>
                  <Box p={5} bg={useColorModeValue("blue.50", "gray.700")} borderRadius="xl" border="1px solid" borderColor="blue.100" fontFamily="mono" fontSize="sm">
                    {output}
                  </Box>
                </MotionBox>
              )}
            </Box>
          </GridItem>

          <GridItem>
            <VStack spacing={6} align="stretch">
              <Box p={6} bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                <Heading size="sm" mb={4}><Icon as={FaLightbulb} mr={2} color="yellow.500" /> Use Cases</Heading>
                <VStack align="start" spacing={3} fontSize="xs" color={mutedText}>
                  <Text>• Binary data in JSON</Text>
                  <Text>• Embedding CSS assets</Text>
                  <Text>• Data URL generation</Text>
                </VStack>
              </Box>
              <Box p={6} bg="blue.600" color="white" borderRadius="2xl">
                <Heading size="sm" mb={3}>Security Note</Heading>
                <Text fontSize="xs" opacity={0.9}>Processing happens entirely within your browser. Data is never transmitted to servers.</Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* --- CUSTOM SLIDER SECTION (No Packages) --- */}
        <Box mt={24} id="tools">
          <Flex align="center" mb={8} justify="space-between">
            <Flex align="center">
              <Icon as={FaCogs} mr={3} color="blue.500" boxSize={6} />
              <Heading as="h2" size="lg">Developer Ecosystem</Heading>
            </Flex>
            <Flex gap={2}>
              <IconButton aria-label="left" icon={<FaArrowLeft />} size="sm" borderRadius="full" onClick={() => scroll("left")} />
              <IconButton aria-label="right" icon={<FaArrowRight />} size="sm" borderRadius="full" onClick={() => scroll("right")} />
            </Flex>
          </Flex>

          <Box
            ref={scrollContainerRef}
            display="flex"
            overflowX="auto"
            gap={6}
            pb={8}
            px={2}
            sx={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
            }}
          >
            {sidebarData.map((cat) => (
              <Box
                key={cat.id}
                minW={{ base: "85%", sm: "45%", md: "30%", lg: "23%" }}
                sx={{ scrollSnapAlign: "start" }}
              >
                <Link href={cat.children?.[0]?.url || "#"} _hover={{ textDecoration: "none" }}>
                  <Box
                    p={6}
                    height="280px"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    bg={cardBg}
                    transition="all 0.3s ease"
                    _hover={{ shadow: "2xl", transform: "translateY(-6px)", borderColor: "blue.400" }}
                    display="flex"
                    flexDirection="column"
                  >
                    <Flex align="center" mb={4}>
                      <Box fontSize="2xl" color="blue.500" p={2} bg={useColorModeValue("blue.50", "whiteAlpha.100")} borderRadius="lg" mr={3}>
                        {cat.icon}
                      </Box>
                      <Text fontWeight="800" fontSize="md" letterSpacing="tight">{cat.name}</Text>
                    </Flex>
                    <VStack align="start" spacing={1} mb={4} flex="1">
                      {cat.children?.slice(0, 3).map((tool, idx) => (
                        <Text key={idx} fontSize="xs" color={mutedText} display="flex" alignItems="center" _before={{ content: '""', display: "inline-block", width: "4px", height: "4px", borderRadius: "full", bg: "blue.400", marginRight: "8px" }}>
                          {tool.name}
                        </Text>
                      ))}
                    </VStack>
                    <Flex justify="space-between" align="center" mt="auto" pt={4} borderTop="1px solid" borderColor={useColorModeValue("gray.50", "gray.700")}>
                      <Badge colorScheme="blue" fontSize="10px" borderRadius="full" px={2}>{cat.children?.length} Tools</Badge>
                      <Icon as={FaArrowRight} boxSize={3} color="blue.500" />
                    </Flex>
                  </Box>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider my={16} />

        <Flex justify="center" direction="column" align="center">
          <Text color={mutedText} fontSize="sm">Need advanced formatting?</Text>
          <Flex mt={2} gap={4}>
            <Link color="blue.500" fontSize="sm" fontWeight="semibold" href="/tools/json-formatter">JSON Formatter</Link>
            <Link color="blue.500" fontSize="sm" fontWeight="semibold" href="/converter/unit-converter">Unit Converter</Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
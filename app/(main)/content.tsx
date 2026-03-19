"use client";

import { useState, useEffect, useRef } from "react";
// Added NextLink import to handle client-side routing
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
} from "react-icons/fa";
import { sidebarData } from "../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";

const MotionBox = motion(Box);

export default function HomeContent() {
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
    const headingGradient = "linear(to-br, blue.400, blue.600)";
    const headingColor = useColorModeValue("gray.800", "white");

    useEffect(() => {
        // document.title removed for server-side metadata management
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
        <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" transition="0.3s ease">
            <Container maxW="6xl" py={12}>
                {/* --- Hero Section --- */}
                <Box position="relative" mb={16} pt={8}>
                    {/* --- Background Decorative Elements --- */}
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
                        {/* Left Side: Content */}
                        <VStack spacing={8} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <HStack
                                    bg={useColorModeValue("blue.50", "whiteAlpha.100")}
                                    border="1px solid"
                                    borderColor={useColorModeValue("blue.100", "whiteAlpha.200")}
                                    px={4}
                                    py={1.5}
                                    borderRadius="full"
                                    spacing={3}
                                    boxShadow="sm"
                                    backdropFilter="blur(10px)"
                                >
                                    <Box position="relative" display="flex" alignItems="center" justifyContent="center">
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
                                    <Divider orientation="vertical" h="12px" borderColor={useColorModeValue("blue.200", "whiteAlpha.400")} />
                                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs" borderRadius="full">
                                        v2.0
                                    </Badge>
                                </HStack>
                            </motion.div>

                            <VStack spacing={5} align={{ base: "center", lg: "start" }}>
                                <Heading color={headingColor}
                                    as="h1"
                                    fontSize={{ base: "4xl", md: "6xl", xl: "7xl" }}
                                    fontWeight="900"
                                    letterSpacing="tighter"
                                    lineHeight="1.1"
                                >
                                    {/* Powerful Online <br /> */}
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
                                    Convert files, process images, encode text,
                                    and use powerful utilities directly in your browser.
                                    <Text as="span" color={useColorModeValue("gray.800", "white")}> Built for developers who value security, speed, and privacy.</Text>
                                </Text>
                            </VStack>

                            <Flex gap={4} direction={{ base: "column", sm: "row" }} w={{ base: "full", sm: "auto" }}>
                                <Button
                                    size="lg"
                                    colorScheme="blue"
                                    rightIcon={<FaArrowRight />}
                                    onClick={() => document.querySelector('.text-area')?.scrollIntoView({ behavior: 'smooth' })}
                                    px={10}
                                    h="60px"
                                    shadow="0px 10px 20px -5px rgba(66, 153, 225, 0.4)"
                                    _hover={{ transform: 'translateY(-2px)', shadow: '0px 15px 25px -5px rgba(66, 153, 225, 0.4)' }}
                                >
                                    Get Started Free
                                </Button>
                                <Link href="#tools" _hover={{ textDecoration: "none" }}>
                                    <Button size="lg" variant="outline" borderColor={borderColor} h="60px" px={8} bg={cardBg}>
                                        View All Tools
                                    </Button>
                                </Link>
                            </Flex>

                            <HStack spacing={6} pt={4} color={mutedText}>
                                <HStack spacing={2}>
                                    <Icon as={FaShieldAlt} color="green.400" />
                                    <Text fontSize="xs" fontWeight="bold">Local Processing</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={FaLock} color="purple.400" />
                                    <Text fontSize="xs" fontWeight="bold">SSL Secured</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={FaTerminal} color="blue.400" />
                                    <Text fontSize="xs" fontWeight="bold">RFC 4648</Text>
                                </HStack>
                            </HStack>
                        </VStack>

                        {/* Right Side: Awesome Image/Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ perspective: "1000px" }}
                        >
                            <Box
                                position="relative"
                                p={2}
                                bgGradient="linear(to-br, blue.500, purple.500)"
                                borderRadius="3xl"
                                shadow="2xl"
                                transform="rotate3d(1, 1, 1, -5deg)"
                            >
                                <Image
                                    src="https://static.vecteezy.com/system/resources/previews/019/018/890/non_2x/pdf-converter-from-jpeg-word-document-concept-screen-with-changing-or-converting-process-of-document-to-another-format-flat-illustration-for-app-website-banner-vector.jpg"
                                    alt="Code Preview"
                                    borderRadius="2xl"
                                    objectFit="cover"
                                    h={{ base: "300px", md: "450px" }}
                                    w="full"
                                />
                                {/* Floating UI Card Overlay */}
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
                                    transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
                                >
                                    <HStack spacing={3}>
                                        <Box boxSize="40px" bg="blue.500" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                                            <Icon as={FaFileCode} color="white" />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xs" fontWeight="bold">Auto-Detected</Text>
                                            <Text fontSize="2xs" color={mutedText}>UTF-8 Plaintext</Text>
                                        </VStack>
                                    </HStack>
                                </MotionBox>
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Custom Animation CSS for the pulse */}
                    <style jsx global>{`
        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
        }
    `}</style>
                </Box>

                {/* --- Converter Workspace --- */}
                {/* <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={8}>
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
                                <Heading color={headingColor} size="sm" mb={4}><Icon as={FaLightbulb} mr={2} color="yellow.500" /> Use Cases</Heading>
                                <VStack align="start" spacing={3} fontSize="xs" color={mutedText}>
                                    <Text>• Binary data in JSON</Text>
                                    <Text>• Embedding CSS assets</Text>
                                    <Text>• Data URL generation</Text>
                                </VStack>
                            </Box>
                            <Box p={6} bg="blue.600" color="white" borderRadius="2xl">
                                <Heading color={headingColor} size="sm" mb={3}>Security Note</Heading>
                                <Text fontSize="xs" opacity={0.9}>Processing happens entirely within your browser. Data is never transmitted to servers.</Text>
                            </Box>
                        </VStack>
                    </GridItem>
                </Grid> */}

                {/* --- FEATURED IMAGE TOOLS CARD --- */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    mt={20}
                    bg={cardBg}
                    borderRadius="3xl"
                    border="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                    shadow="2xl"
                >
                    <Flex direction={{ base: "column", md: "row" }}>
                        <Box flex="1" bg={useColorModeValue("blue.50", "gray.700")} p={10} display="flex" alignItems="center" justifyContent="center">
                            <Image
                                src="https://media.istockphoto.com/id/1158584831/vector/photo-or-graphic-editor-on-tablet-vector-illustration-flat-cartoon-graphics-tablet-screen.jpg?s=612x612&w=0&k=20&c=ugL91d3Kav24OKmvFW_WXhbhn3RFCTFJ4yP29unOdx4="
                                alt="Image Tools"
                                maxW="250px"
                            />
                        </Box>
                        <Box flex="1.2" p={{ base: 8, md: 12 }}>
                            <Heading color={headingColor} size="lg" mb={2}>
                                <Text as="span" bgGradient={headingGradient} bgClip="text">
                                    Visual Image Tools
                                </Text>
                            </Heading>
                            <Text color={mutedText} mb={6}>Professional grade image processing right in your browser.</Text>

                            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                                {/* Using as={NextLink} prevents page reload */}
                                <Link as={NextLink} href="/converter/Imagetools/Imagecom" _hover={{ textDecoration: 'none' }}>
                                    <HStack
                                        p={4}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        role="group"
                                        _hover={{
                                            bg: useColorModeValue("blue.50", "gray.700"),
                                            borderColor: "blue.300"
                                        }}
                                    >
                                        <Icon as={FaCompress} color="blue.500" _groupHover={{ color: "blue.400" }} />
                                        <Text fontWeight="bold" fontSize="sm" _groupHover={{ color: useColorModeValue("gray.800", "white") }}>
                                            Image Compressor
                                        </Text>
                                    </HStack>
                                </Link>

                                <Link as={NextLink} href="/converter/Imagetools/Imageedit" _hover={{ textDecoration: 'none' }}>
                                    <HStack
                                        p={4}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        role="group"
                                        _hover={{
                                            bg: useColorModeValue("blue.50", "gray.700"),
                                            borderColor: "blue.300"
                                        }}
                                    >
                                        <Icon as={FaEdit} color="blue.500" _groupHover={{ color: "blue.400" }} />
                                        <Text fontWeight="bold" fontSize="sm" _groupHover={{ color: useColorModeValue("gray.800", "white") }}>
                                            Image Edit
                                        </Text>
                                    </HStack>
                                </Link>

                                <Link as={NextLink} href="/converter/Imagetools/Bgremove" _hover={{ textDecoration: 'none' }}>
                                    <HStack
                                        p={4}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        role="group"
                                        _hover={{
                                            bg: useColorModeValue("blue.50", "gray.700"),
                                            borderColor: "blue.300"
                                        }}
                                    >
                                        <Icon as={FaEraser} color="blue.500" _groupHover={{ color: "blue.400" }} />
                                        <Text fontWeight="bold" fontSize="sm" _groupHover={{ color: useColorModeValue("gray.800", "white") }}>
                                            Image BG Remove
                                        </Text>
                                    </HStack>
                                </Link>
                            </Grid>
                        </Box>
                    </Flex>
                </MotionBox>

                {/* --- AWESOME ANIMATED DEVELOPER ECOSYSTEM --- */}
                <Box mt={24} id="tools" position="relative" px={2}>
                    {/* Background Glow Decorations */}
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

                    {/* Section Header with Reveal Animation */}
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
                                    <Text color="blue.500" fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="widest">
                                        Professional Toolkit
                                    </Text>
                                </HStack>
                                <Heading color={headingColor} as="h2" size="2xl" fontWeight="900" letterSpacing="tight">
                                    Developer <Text as="span" color="blue.500" position="relative">
                                        Ecosystem
                                        <Box as="span" position="absolute" bottom="2" left="0" w="full" h="12px" bg={useColorModeValue("blue.100", "blue.900")} zIndex={-1} opacity={0.6} />
                                    </Text>
                                </Heading>
                            </VStack>

                            <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                                <IconButton
                                    aria-label="left" icon={<FaArrowLeft />} variant="ghost"
                                    borderRadius="full" onClick={() => scroll("left")}
                                    _hover={{
                                        transform: "translateX(-4px)",
                                        bg: useColorModeValue("gray.200", "gray.700")
                                    }}
                                />
                                <IconButton
                                    aria-label="right" icon={<FaArrowRight />} variant="solid" colorScheme="blue"
                                    borderRadius="full" onClick={() => scroll("right")}
                                    _hover={{ transform: "translateX(4px)", shadow: "lg" }}
                                />
                            </HStack>
                        </Flex>
                    </motion.div>

                    {/* Scrollable Container */}
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
                        {/* --- CARD 1: THE GRADIENT MASTER --- */}
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
                                p={10} height="380px" borderRadius="3xl" shadow="2xl" position="relative" overflow="hidden"
                                bgGradient="linear(to-br, blue.500, purple.600)" color="white"
                            >
                                <Box position="absolute" top="-20px" right="-20px" opacity={0.2} transform="rotate(15deg)">
                                    <FaImage size="200px" />
                                </Box>
                                <VStack align="start" height="full" justify="space-between">
                                    <Box>
                                        <Badge px={3} py={1} borderRadius="full" bg="whiteAlpha.300" color="white" backdropFilter="blur(10px)" mb={4}>
                                            Visual Studio
                                        </Badge>
                                        <Heading color={headingColor} size="lg" mb={4}>Next-Gen Image Processing</Heading>
                                        <Text fontSize="sm" opacity={0.9} noOfLines={3}>
                                            Studio-grade tools for modern developers. Compress, edit, and strip backgrounds in seconds.
                                        </Text>
                                    </Box>
                                    <Button
                                        rightIcon={<FaArrowRight />} variant="solid" bg="white" color={useColorModeValue("blue.600", "blue.300")}
                                        _hover={{ bg: "gray.100", transform: "scale(1.05)" }} size="lg" borderRadius="2xl"
                                    >
                                        Explore Studio
                                    </Button>
                                </VStack>
                            </Box>
                        </MotionBox>

                        {/* --- CARD 2: DYNAMIC CARDS FROM SIDEBAR --- */}
                        {sidebarData.map((cat, index) => (
                            <MotionBox
                                key={cat.id}
                                minW={{ base: "300px", md: "350px" }}
                                sx={{ scrollSnapAlign: "start" }}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }} // Staggered delay
                                whileHover={{ y: -12 }}
                            >
                                <Link as={NextLink} href={cat.children?.[0]?.url || "#"} _hover={{ textDecoration: "none" }}>
                                    <Box
                                        p={8} height="380px" bg={cardBg} border="1px solid" borderColor={borderColor}
                                        borderRadius="3xl" transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                        display="flex" flexDirection="column" shadow="sm"
                                        _hover={{ shadow: "3xl", borderColor: "blue.400", bg: useColorModeValue("white", "gray.750") }}
                                        role="group"
                                    >
                                        <Flex justify="space-between" align="center" mb={8}>
                                            <Box
                                                p={4} bg={useColorModeValue("blue.50", "gray.700")} color="blue.500" borderRadius="2xl"
                                                transition="all 0.3s" _groupHover={{ bg: "blue.500", color: "white", transform: "rotate(-5deg)" }}
                                            >
                                                <Box fontSize="2xl">{cat.icon}</Box>
                                            </Box>
                                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="lg">
                                                {cat.children?.length} Tools
                                            </Badge>
                                        </Flex>

                                        <Heading color={headingColor} size="md" mb={3} _groupHover={{ color: "blue.500" }}>{cat.name}</Heading>
                                        <Text fontSize="sm" color={mutedText} mb={6}>The essential collection of utilities for {cat.name.toLowerCase()}.</Text>

                                        <VStack align="start" spacing={3} flex="1">
                                            {cat.children?.slice(0, 3).map((tool, idx) => (
                                                <HStack key={idx} spacing={3} role="group">
                                                    <Icon as={FaArrowRight} boxSize={3} color="blue.200" _groupHover={{ color: "blue.500" }} />
                                                    <Text fontSize="sm" fontWeight="medium" color={mutedText} _groupHover={{ color: useColorModeValue("gray.800", "white") }}>{tool.name}</Text>
                                                </HStack>
                                            ))}
                                        </VStack>

                                        <Divider my={4} />
                                        <HStack justify="space-between" color="blue.500" fontWeight="bold" fontSize="xs" letterSpacing="widest">
                                            <Text>LAUNCH TOOLKIT</Text>
                                            <Icon as={FaArrowRight} boxSize={3} transition="transform 0.3s" _groupHover={{ transform: "translateX(5px)" }} />
                                        </HStack>
                                    </Box>
                                </Link>
                            </MotionBox>
                        ))}
                    </Box>
                </Box>

                <Divider my={16} />

                {/* --- HOW IT WORKS SECTION --- */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={10} mb={20}>
                    <VStack align="start" spacing={4}>
                        <Icon as={FaShieldAlt} boxSize={8} color="blue.500" />
                        <Heading color={headingColor} size="md">100% Private</Heading>
                        <Text fontSize="sm" color={mutedText}>
                            Your data never leaves your device. All encoding and decoding are performed locally using your browser's V8 engine, ensuring sensitive keys or strings remain secure.
                        </Text>
                    </VStack>
                    <VStack align="start" spacing={4}>
                        <Icon as={FaTerminal} boxSize={8} color="purple.500" />
                        <Heading color={headingColor} size="md">Developer Ready</Heading>
                        <Text fontSize="sm" color={mutedText}>
                            Standardized for RFC 4648. Perfect for handling Web API responses, Basic Auth headers, or embedding small assets directly into your CSS and HTML files.
                        </Text>
                    </VStack>
                    <VStack align="start" spacing={4}>
                        <Icon as={FaLightbulb} boxSize={8} color="yellow.500" />
                        <Heading color={headingColor} size="md">Smart Validation</Heading>
                        <Text fontSize="sm" color={mutedText}>
                            Our tool automatically detects padding errors and illegal characters in your Base64 strings, providing instant feedback if the decoding process fails.
                        </Text>
                    </VStack>
                </Grid>

                {/* --- EDUCATIONAL CONTENT SECTION --- */}
                <Box bg={cardBg} p={{ base: 8, md: 12 }} borderRadius="3xl" border="1px solid" borderColor={borderColor} mb={20}>
                    <VStack align="start" spacing={6}>
                        <Heading color={headingColor} size="lg">Understanding Base64 Encoding</Heading>
                        <Text color={mutedText}>
                            Base64 is a group of binary-to-text encoding schemes that represent binary data in an ASCII string format by translating it into a radix-64 representation. It is designed to carry data stored in binary formats across channels that only reliably support text content.
                        </Text>

                        <Grid templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }} gap={12} w="full">
                            <VStack align="start" spacing={4}>
                                <Heading color={headingColor} size="sm">Why use Base64?</Heading>
                                <VStack align="start" spacing={2} fontSize="sm" color={mutedText}>
                                    <Text>• <b>Data URLs:</b> Embed images directly in HTML/CSS to reduce HTTP requests.</Text>
                                    <Text>• <b>Email Attachments:</b> MIME (Multipurpose Internet Mail Extensions) uses Base64 for non-text data.</Text>
                                    <Text>• <b>Authentication:</b> Basic Auth headers require credentials to be Base64 encoded.</Text>
                                    <Text>• <b>Legacy Systems:</b> Transferring binary data over systems that only support 7-bit ASCII.</Text>
                                </VStack>
                            </VStack>

                            <Box p={6} bg={useColorModeValue("gray.50", "gray.900")} borderRadius="2xl" border="1px dashed" borderColor="blue.300">
                                <Heading color={headingColor} size="xs" mb={3} color={useColorModeValue("blue.600", "blue.300")}>Pro Tip: Character Set</Heading>
                                <Text fontSize="xs" color={mutedText} lineHeight="tall">
                                    Base64 uses the characters <b>A-Z</b>, <b>a-z</b>, <b>0-9</b>, <b>+</b>, and <b>/</b>. The <b>=</b> sign is used for padding at the end of the string to ensure the encoded data is a multiple of 4 bytes.
                                </Text>
                            </Box>
                        </Grid>
                    </VStack>
                </Box>

                {/* --- FAQ SECTION --- */}
                <VStack spacing={8} mb={20} align="start">
                    <Heading color={headingColor} size="lg">Frequently Asked Questions</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                        <Box>
                            <Text fontWeight="bold" mb={2}>Is Base64 a form of encryption?</Text>
                            <Text fontSize="sm" color={mutedText}>No. Base64 is an <b>encoding</b> scheme, not encryption. It is easily reversible and provides zero security. Never use it to "hide" passwords without actual encryption like AES.</Text>
                        </Box>
                        <Box>
                            <Text fontWeight="bold" mb={2}>Does encoding increase file size?</Text>
                            <Text fontSize="sm" color={mutedText}>Yes. Base64 encoding typically increases the data size by approximately <b>33%</b> compared to the original binary data.</Text>
                        </Box>
                        <Box>
                            <Text fontWeight="bold" mb={2}>Can I encode images here?</Text>
                            <Text fontSize="sm" color={mutedText}>Currently, this tool supports text-to-base64. For raw image files, we recommend using our specialized "Image to Base64" tool in the Image Tools section.</Text>
                        </Box>
                        <Box>
                            <Text fontWeight="bold" mb={2}>What is the "atob" and "btoa" limit?</Text>
                            <Text fontSize="sm" color={mutedText}>Browser-native functions generally handle strings up to several megabytes, but performance may vary based on your system RAM.</Text>
                        </Box>
                    </SimpleGrid>
                </VStack>

                <Divider my={16} />

                {/* <Flex justify="center" direction="column" align="center">
                    <Text color={mutedText} fontSize="sm">Need advanced formatting?</Text>
                    <Flex mt={2} gap={4}>
                        <Link as={NextLink} color="blue.500" fontSize="sm" fontWeight="semibold" href="/tools/json-formatter">JSON Formatter</Link>
                        <Link as={NextLink} color="blue.500" fontSize="sm" fontWeight="semibold" href="/converter/unit-converter">Unit Converter</Link>
                    </Flex>
                </Flex> */}

                {/* <Flex justify="center" direction="column" align="center">
                    <Text color={mutedText} fontSize="sm">Need advanced formatting?</Text>
                    <Flex mt={2} gap={4}>
                        <Link as={NextLink} color="blue.500" fontSize="sm" fontWeight="semibold" href="/tools/json-formatter">JSON Formatter</Link>
                        <Link as={NextLink} color="blue.500" fontSize="sm" fontWeight="semibold" href="/converter/unit-converter">Unit Converter</Link>
                    </Flex>
                </Flex> */}
            </Container>
        </Box>
    );
}
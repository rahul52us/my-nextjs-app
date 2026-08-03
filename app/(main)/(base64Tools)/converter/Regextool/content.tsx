"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  VStack,
  HStack,
  Stack,
  Button,
  Input,
  Textarea,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Icon,
  useToast,
  Badge,
  Container,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Tooltip,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  FileCode,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Code2,
  Globe,
  UserCheck,
  Database,
  Info,
} from "lucide-react";

type TabType = "tester" | "generator" | "cheatsheet";

const regexLibrary = {
  Validation: [
    { name: "Strong Password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", desc: "Min 8 chars, 1 upper, 1 lower, 1 number, 1 special." },
    { name: "Email Address", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", desc: "Standard RFC 5322 email format." },
    { name: "Username", pattern: "^[a-z0-9_-]{3,16}$", desc: "3-16 chars, lowercase, numbers, underscores." },
    { name: "Full Name", pattern: "^[a-zA-Z]{2,40}( [a-zA-Z]{2,40})+$", desc: "Matches First and Last name with a space." },
  ],
  Web: [
    { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)", desc: "Supports http/https and deep paths." },
    { name: "IPv4 Address", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", desc: "Standard IP address format." },
    { name: "HTML Tags", pattern: "<\\/?[^>]+>", desc: "Matches basic opening and closing HTML tags." },
    { name: "YouTube URL", pattern: "(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com|youtu\\.be)\\/(?:watch\\?v=)?(.+)", desc: "Extracts YouTube video IDs." },
  ],
  Data: [
    { name: "Dates (YYYY-MM-DD)", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", desc: "Matches ISO date format." },
    { name: "Hex Colors", pattern: "^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$", desc: "Matches 3 or 6 digit CSS hex colors." },
    { name: "Credit Card", pattern: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$", desc: "Visa/Mastercard validation." },
    { name: "Price Tag", pattern: "\\$\\d+(?:\\.\\d{2})?", desc: "Matches currency like $10.99 or $50." },
  ],
};

const cheatSheet = [
  { symbol: ".", meaning: "Any character except newline" },
  { symbol: "\\d", meaning: "Digit (0-9)" },
  { symbol: "\\D", meaning: "Non-digit" },
  { symbol: "\\w", meaning: "Word character (a-z, A-Z, 0-9, _)" },
  { symbol: "\\s", meaning: "Whitespace (space, tab, newline)" },
  { symbol: "^", meaning: "Start of string" },
  { symbol: "$", meaning: "End of string" },
  { symbol: "*", meaning: "0 or more times" },
  { symbol: "+", meaning: "1 or more times" },
  { symbol: "?", meaning: "Optional (0 or 1 time)" },
  { symbol: "{n}", meaning: "Exactly n times" },
  { symbol: "[abc]", meaning: "Any character in the set" },
  { symbol: "(...)", meaning: "Capture group" },
  { symbol: "(?:...)", meaning: "Non-capturing group" },
  { symbol: "|", meaning: "OR operator" },
];

const FLAG_INFO: Record<string, string> = {
  g: "Global — find all matches",
  i: "Case-insensitive",
  m: "Multiline — ^ $ match line breaks",
  s: "Dot matches newline",
  u: "Unicode",
  y: "Sticky",
};

const MotionBox = motion(Box);

export default function RegexTool() {
  const [activeTab, setActiveTab] = useState<TabType>("tester");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const toast = useToast();

  // Theme-aware palette — adapts to both light and dark mode via Chakra's
  // color mode context, so the page follows whichever theme the app is in.
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const headerBg = useColorModeValue("white", "gray.900");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const codeBg = useColorModeValue("gray.50", "gray.700");
  const outputBg = useColorModeValue("gray.50", "gray.900");
  const outputTextColor = useColorModeValue("gray.900", "gray.100");
  const tableBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("brand.50", "whiteAlpha.100");
  // The match-highlight <mark> stays yellow with dark text in both modes —
  // like a physical highlighter pen, it reads clearly against any card
  // background, so it's the one exception left constant.
  const highlightBg = "yellow.200";
  const highlightText = "gray.900";
  const exprBarBg = useColorModeValue("gray.100", "gray.900");
  const exprBarBorder = useColorModeValue("gray.300", "transparent");
  const exprSlashColor = useColorModeValue("gray.400", "whiteAlpha.500");
  const exprPatternColor = useColorModeValue("green.700", "green.300");
  const exprFlagsColor = useColorModeValue("orange.600", "orange.300");
  const successColor = useColorModeValue("green.600", "green.300");
  const errorColor = useColorModeValue("red.500", "red.300");

  const { highlighted, matches, error } = useMemo(() => {
    if (!pattern || !testString)
      return { highlighted: testString, matches: [] as RegExpMatchArray[], error: "" };

    try {
      const safeFlags = flags.replace(/[^gimsuy]/g, "");
      const regex = new RegExp(pattern, safeFlags);
      const foundMatches = [...testString.matchAll(regex)];

      let lastIndex = 0;
      const parts: React.ReactNode[] = [];

      foundMatches.forEach((match, i) => {
        const start = match.index ?? 0;
        const end = start + match[0].length;
        parts.push(testString.slice(lastIndex, start));
        parts.push(
          <Box
            as="mark"
            key={i}
            bg={highlightBg}
            color={highlightText}
            px="1"
            borderRadius="sm"
            fontWeight="bold"
          >
            {match[0]}
          </Box>
        );
        lastIndex = end;
      });

      parts.push(testString.slice(lastIndex));
      return { highlighted: parts, matches: foundMatches, error: "" };
    } catch (e: any) {
      return { highlighted: testString, matches: [], error: e?.message || "Invalid regular expression" };
    }
  }, [pattern, flags, testString, highlightBg, highlightText]);

  const copyToClipboard = (text: string, label: string = "Copied!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: label, status: "success", duration: 2000, isClosable: true, position: "bottom-right" });
  };

  const activeFlagList = flags.split("").filter((f) => FLAG_INFO[f]);

  return (
    <Box minH="100vh" bg={bgColor} color={textColor} pb={20}>
      {/* ---------- Header ---------- */}
      <Box bg={headerBg} borderBottom="1px" borderColor={borderColor} px={8} py={4} position="sticky" top={0} zIndex={10} shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Box bg="brand.600" p={2} borderRadius="lg">
                <Icon as={Zap} color="white" boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" letterSpacing="tight">Regex Studio</Heading>
                <Text fontSize="xs" color={secondaryTextColor} fontWeight="bold">v2.1 PRO</Text>
              </VStack>
            </HStack>

            <HStack spacing={2} bg={inputBg} p={2} borderRadius="2xl">
              {[
                { id: "tester", label: "Tester", icon: Search },
                { id: "generator", label: "Library", icon: FileCode },
                { id: "cheatsheet", label: "Cheat Sheet", icon: Copy },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={activeTab === tab.id ? "solid" : "ghost"}
                  colorScheme="brand"
                  leftIcon={<Icon as={tab.icon} size={16} />}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  px={6}
                  borderRadius="lg"
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* ================= TESTER TAB ================= */}
            {activeTab === "tester" && (
              <VStack align="stretch" spacing={6}>
                {/* Step 1 — Expression bar: pattern + flags fused together, like a real regex literal */}
                <Box bg={cardBg} borderRadius="2xl" shadow="md" border="1px" borderColor={borderColor} overflow="hidden">
                  <HStack px={5} pt={4} spacing={2}>
                    <Box bg="brand.500" color="white" borderRadius="full" w={5} h={5} display="flex" alignItems="center" justifyContent="center" fontSize="xs" fontWeight="bold" flexShrink={0}>1</Box>
                    <Text fontSize="xs" fontWeight="black" color={secondaryTextColor} textTransform="uppercase" letterSpacing="wide">
                      Write your expression
                    </Text>
                  </HStack>

                  <HStack
                    bg={exprBarBg}
                    border="1px"
                    borderColor={exprBarBorder}
                    mx={5}
                    my={4}
                    borderRadius="xl"
                    px={4}
                    py={3}
                    spacing={0}
                    fontFamily="mono"
                    fontSize="lg"
                    overflowX="auto"
                  >
                    <Text color={exprSlashColor} userSelect="none">/</Text>
                    <Input
                      variant="unstyled"
                      placeholder="^[a-z]+$"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      color={exprPatternColor}
                      fontFamily="mono"
                      px={1}
                      minW="200px"
                    />
                    <Text color={exprSlashColor} userSelect="none">/</Text>
                    <Input
                      variant="unstyled"
                      placeholder="g"
                      value={flags}
                      onChange={(e) => setFlags(e.target.value)}
                      color={exprFlagsColor}
                      fontFamily="mono"
                      w="70px"
                      px={1}
                    />
                  </HStack>

                  {/* Live status + active flags, directly under the expression that produced them */}
                  <Flex px={5} pb={5} justify="space-between" align="center" wrap="wrap" gap={3} maxW="100%">
                    <Box minW="0" flex="1 1 auto">
                      {error ? (
                        <HStack color={errorColor} fontSize="sm" fontWeight="medium">
                          <Icon as={AlertCircle} boxSize={4} flexShrink={0} />
                          <Text noOfLines={1}>{error}</Text>
                        </HStack>
                      ) : pattern ? (
                        <HStack color={successColor} fontSize="sm" fontWeight="medium">
                          <Icon as={CheckCircle2} boxSize={4} flexShrink={0} />
                          <Text noOfLines={1}>Valid pattern · {matches.length} {matches.length === 1 ? "match" : "matches"}</Text>
                        </HStack>
                      ) : (
                        <HStack color={secondaryTextColor} fontSize="sm">
                          <Icon as={Info} boxSize={4} flexShrink={0} />
                          <Text noOfLines={1}>Enter a pattern to begin testing</Text>
                        </HStack>
                      )}
                    </Box>

                    <Flex wrap="wrap" gap={2} flex="0 0 auto" maxW="100%">
                      {activeFlagList.length > 0 ? (
                        activeFlagList.map((f) => (
                          <Tooltip label={FLAG_INFO[f]} key={f}>
                            <Badge colorScheme="brand" borderRadius="md" px={2} flexShrink={0}>{f}</Badge>
                          </Tooltip>
                        ))
                      ) : (
                        <Text fontSize="xs" color={secondaryTextColor}>No flags set</Text>
                      )}
                    </Flex>
                  </Flex>
                </Box>

                {/* Step 2 — Test string in, highlighted result right beside it: cause and effect, side by side */}
                <Box pt={2}>
                  <HStack px={1} mb={3} spacing={2}>
                    <Box bg="brand.500" color="white" borderRadius="full" w={5} h={5} display="flex" alignItems="center" justifyContent="center" fontSize="xs" fontWeight="bold" flexShrink={0}>2</Box>
                    <Text fontSize="xs" fontWeight="black" color={secondaryTextColor} textTransform="uppercase" letterSpacing="wide">
                      Test it against your text
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                    <Box bg={cardBg} p={5} borderRadius="2xl" shadow="md" border="1px" borderColor={borderColor}>
                      <Text fontSize="xs" fontWeight="bold" color={secondaryTextColor} mb={2} textTransform="uppercase">
                        Your text
                      </Text>
                      <Textarea
                        placeholder="Type or paste text here to test matches…"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        minH="260px"
                        bg={inputBg}
                        focusBorderColor="brand.500"
                        borderRadius="xl"
                        fontFamily="mono"
                        fontSize="sm"
                      />
                    </Box>

                    <Box bg={cardBg} p={5} borderRadius="2xl" shadow="md" border="1px" borderColor={borderColor}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color={secondaryTextColor} textTransform="uppercase">
                          Result — highlighted
                        </Text>
                        <Badge colorScheme={matches.length ? "green" : "gray"} borderRadius="md">
                          {matches.length} {matches.length === 1 ? "match" : "matches"}
                        </Badge>
                      </HStack>
                      <Box
                        bg={outputBg}
                        color={outputTextColor}
                        p={4}
                        borderRadius="xl"
                        minH="260px"
                        whiteSpace="pre-wrap"
                        fontFamily="mono"
                        fontSize="sm"
                        border="1px"
                        borderColor={borderColor}
                        overflowY="auto"
                      >
                        {testString ? (
                          highlighted
                        ) : (
                          <Text color={secondaryTextColor} fontStyle="italic">
                            Matches will light up here as you type
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Step 3 — Match details + housekeeping actions, low-priority info kept out of the way */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                  <Box gridColumn={{ lg: "span 2" }} bg={cardBg} p={5} borderRadius="2xl" shadow="sm" border="1px" borderColor={borderColor}>
                    <Text fontSize="xs" fontWeight="bold" color={secondaryTextColor} mb={3} textTransform="uppercase">
                      Match breakdown
                    </Text>
                    {matches.length > 0 ? (
                      <VStack align="stretch" spacing={2} maxH="180px" overflowY="auto">
                        {matches.map((m, i) => (
                          <HStack key={i} justify="space-between" bg={inputBg} px={3} py={2} borderRadius="lg" fontFamily="mono" fontSize="sm">
                            <HStack spacing={3}>
                              <Badge colorScheme="brand" borderRadius="md">#{i + 1}</Badge>
                              <Text>{m[0]}</Text>
                            </HStack>
                            <Text color={secondaryTextColor} fontSize="xs">at index {m.index}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text color={secondaryTextColor} fontSize="sm">No matches yet — try a pattern and some text above.</Text>
                    )}
                  </Box>

                  <VStack align="stretch" spacing={3}>
                    <Box bg="brand.600" color="white" p={4} borderRadius="2xl" shadow="sm">
                      <Text fontSize="xs" fontWeight="bold" mb={2} textTransform="uppercase" opacity={0.9}>Flag reference</Text>
                      <VStack align="start" spacing={1} fontSize="xs">
                        <Text><b>g</b> — global · <b>i</b> — ignore case</Text>
                        <Text><b>m</b> — multiline · <b>s</b> — dot-all</Text>
                      </VStack>
                    </Box>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<Icon as={Trash2} />}
                      onClick={() => { setPattern(""); setTestString(""); setFlags("g"); }}
                      borderRadius="xl"
                    >
                      Clear everything
                    </Button>
                  </VStack>
                </SimpleGrid>
              </VStack>
            )}

            {/* ================= LIBRARY TAB ================= */}
            {activeTab === "generator" && (
              <VStack align="stretch" spacing={8}>
                <Box textAlign="center" mb={4}>
                  <Heading size="xl" mb={2}>Regex Library</Heading>
                  <Text color={secondaryTextColor}>Battle-tested patterns for everyday development tasks.</Text>
                </Box>

                <Tabs variant="soft-rounded" colorScheme="brand" align="center">
                  <TabList bg={cardBg} p={2} borderRadius="2xl" shadow="sm" border="1px" borderColor={borderColor}>
                    <Tab px={8}><Icon as={UserCheck} mr={2} /> Validation</Tab>
                    <Tab px={8}><Icon as={Globe} mr={2} /> Web & Network</Tab>
                    <Tab px={8}><Icon as={Database} mr={2} /> Data Extraction</Tab>
                  </TabList>

                  <TabPanels mt={8}>
                    {Object.entries(regexLibrary).map(([category, items]) => (
                      <TabPanel key={category} p={0}>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {items.map((item) => (
                            <Box key={item.name} p={6} bg={cardBg} borderRadius="2xl" border="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: "xl", transform: "translateY(-4px)" }} transition="all 0.3s">
                              <Heading size="xs" mb={1} color="brand.600" textTransform="uppercase" letterSpacing="widest">{item.name}</Heading>
                              <Text fontSize="xs" color={secondaryTextColor} mb={4}>{item.desc}</Text>
                              <Code p={3} borderRadius="xl" w="100%" mb={4} display="block" overflowX="auto" fontSize="xs" bg={codeBg}>{item.pattern}</Code>
                              <HStack>
                                <Button size="sm" variant="solid" colorScheme="brand" flex={1} onClick={() => { setPattern(item.pattern); setActiveTab("tester"); }} borderRadius="lg">
                                  Use in Tester
                                </Button>
                                <Tooltip label="Copy Pattern">
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.pattern)} borderRadius="lg">
                                    <Icon as={Copy} />
                                  </Button>
                                </Tooltip>
                              </HStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </VStack>
            )}

            {/* ================= CHEAT SHEET TAB ================= */}
            {activeTab === "cheatsheet" && (
              <VStack align="stretch" spacing={6}>
                <Box textAlign="center" mb={4}>
                  <Heading size="xl" mb={2}>Cheat Sheet</Heading>
                  <Text color={secondaryTextColor}>Quick reference for Regular Expression syntax.</Text>
                </Box>
                <Box bg={cardBg} borderRadius="3xl" shadow="xl" border="1px" borderColor={borderColor} overflow="hidden">
                  <Table variant="simple">
                    <Thead bg={tableBg}>
                      <Tr>
                        <Th py={5} fontSize="xs" color={secondaryTextColor}>Syntax</Th>
                        <Th py={5} fontSize="xs" color={secondaryTextColor}>Description</Th>
                        <Th py={5} textAlign="right"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cheatSheet.map((item, idx) => (
                        <Tr key={idx} _hover={{ bg: hoverBg }} transition="bg 0.2s">
                          <Td><Code colorScheme="brand" px={3} py={1} borderRadius="md" fontSize="md" fontWeight="bold">{item.symbol}</Code></Td>
                          <Td color={secondaryTextColor} fontSize="md" fontWeight="medium">{item.meaning}</Td>
                          <Td textAlign="right">
                            <Button size="xs" variant="ghost" onClick={() => copyToClipboard(item.symbol)}>Copy</Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            )}
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

// Fixed TabPanel to handle children correctly
function TabPanel({ children, ...props }: any) {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}
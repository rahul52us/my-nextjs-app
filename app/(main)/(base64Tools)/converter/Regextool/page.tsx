"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  VStack,
  HStack,
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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Zap, 
  FileCode, 
  Copy, 
  Trash2, 
  AlertCircle, 
  Code2,
  Globe,
  UserCheck,
  Hash,
  ShieldCheck,
  Database
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
    { name: "HTML Tags", pattern: "<\\/? [^> ]+>", desc: "Matches basic opening and closing HTML tags." },
    { name: "YouTube URL", pattern: "(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com|youtu\\.be)\\/(?:watch\\?v=)?(.+)", desc: "Extracts YouTube video IDs." },
  ],
  Data: [
    { name: "Dates (YYYY-MM-DD)", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", desc: "Matches ISO date format." },
    { name: "Hex Colors", pattern: "^#?([a-fA-G0-9]{3}|[a-fA-G0-9]{6})$", desc: "Matches 3 or 6 digit CSS hex colors." },
    { name: "Credit Card", pattern: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$", desc: "Visa/Mastercard validation." },
    { name: "Price Tag", pattern: "\\$\\d+(?:\\.\\d{2})?", desc: "Matches currency like $10.99 or $50." },
  ]
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

const MotionBox = motion(Box);

export default function RegexTool() {
  const [activeTab, setActiveTab] = useState<TabType>("tester");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const { highlighted, matches } = useMemo(() => {
    if (!pattern || !testString) return { highlighted: testString, matches: [] as RegExpMatchArray[] };
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
          <Box as="mark" key={i} bg="purple.200" color="purple.900" px="1" borderRadius="sm" fontWeight="bold">
            {match[0]}
          </Box>
        );
        lastIndex = end;
      });

      parts.push(testString.slice(lastIndex));
      setError("");
      return { highlighted: parts, matches: foundMatches };
    } catch (e) {
      setError("Invalid Regex Pattern");
      return { highlighted: testString, matches: [] };
    }
  }, [pattern, flags, testString]);

  const copyToClipboard = (text: string, label: string = "Copied!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: label, status: "success", duration: 2000, isClosable: true, position: "bottom-right" });
  };

  return (
    <Box minH="100vh" bg="gray.50" color="gray.800" pb={20}>
      <Box bg="white" borderBottom="1px" borderColor="gray.200" px={8} py={4} position="sticky" top={0} zIndex={10} shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Box bg="purple.600" p={2} borderRadius="lg">
                <Icon as={Zap} color="white" boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" letterSpacing="tight">Regex Studio</Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">v2.1 PRO</Text>
              </VStack>
            </HStack>

            <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl">
              {[
                { id: "tester", label: "Tester", icon: Search },
                { id: "generator", label: "Library", icon: FileCode },
                { id: "cheatsheet", label: "Cheat Sheet", icon: Copy },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={activeTab === tab.id ? "white" : "ghost"}
                  shadow={activeTab === tab.id ? "md" : "none"}
                  bg={activeTab === tab.id ? "white" : "transparent"}
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
            {activeTab === "tester" && (
              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                <VStack align="stretch" spacing={6} gridColumn={{ lg: "span 2" }}>
                  <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px" borderColor="gray.100">
                    <VStack spacing={6}>
                      <HStack w="100%" spacing={4}>
                        <Box flex={1}>
                          <Text fontSize="xs" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Regular Expression</Text>
                          <Input
                            placeholder="/ ^[a-z]+$ /"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            fontFamily="mono"
                            size="lg"
                            bg="gray.50"
                            focusBorderColor="purple.500"
                            borderRadius="xl"
                          />
                        </Box>
                        <Box w="120px">
                          <Text fontSize="xs" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Flags</Text>
                          <Input
                            placeholder="gim"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            size="lg"
                            textAlign="center"
                            bg="gray.50"
                            borderRadius="xl"
                          />
                        </Box>
                      </HStack>

                      <Box w="100%">
                        <Text fontSize="xs" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Test String</Text>
                        <Textarea
                          placeholder="Type or paste text here to test matches..."
                          value={testString}
                          onChange={(e) => setTestString(e.target.value)}
                          minH="250px"
                          size="lg"
                          bg="gray.50"
                          focusBorderColor="purple.500"
                          borderRadius="xl"
                        />
                      </Box>
                    </VStack>
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm" color="gray.600" display="flex" alignItems="center">
                        <Icon as={Code2} mr={2} /> Highlighted Output
                      </Heading>
                      <Badge colorScheme="purple" px={3} py={1} borderRadius="lg" variant="subtle">
                        {matches.length} matches
                      </Badge>
                    </HStack>
                    <Box bg="gray.900" color="gray.100" p={8} borderRadius="3xl" minH="150px" whiteSpace="pre-wrap" fontFamily="mono" fontSize="lg" boxShadow="2xl">
                      {highlighted || <Text color="gray.600" fontStyle="italic">No matches to display</Text>}
                    </Box>
                  </Box>
                </VStack>

                <VStack align="stretch" spacing={6}>
                  <Box bg="purple.600" color="white" p={6} borderRadius="3xl" shadow="lg">
                    <Heading size="sm" mb={4}>Quick Help</Heading>
                    <VStack align="start" spacing={3} fontSize="sm">
                      <HStack><Badge colorScheme="whiteAlpha">g</Badge><Text>Global search</Text></HStack>
                      <HStack><Badge colorScheme="whiteAlpha">i</Badge><Text>Case-insensitive</Text></HStack>
                      <HStack><Badge colorScheme="whiteAlpha">m</Badge><Text>Multiline</Text></HStack>
                      <Divider borderColor="whiteAlpha.400" />
                      <Text opacity={0.9} fontSize="xs">Use groups `()` to capture specific parts of the match.</Text>
                    </VStack>
                  </Box>
                  <Button h="70px" fontSize="lg" colorScheme="red" variant="subtle" leftIcon={<Icon as={Trash2} />} onClick={() => { setPattern(""); setTestString(""); }} borderRadius="2xl">
                    Clear Canvas
                  </Button>
                </VStack>
              </SimpleGrid>
            )}

            {activeTab === "generator" && (
              <VStack align="stretch" spacing={8}>
                <Box textAlign="center" mb={4}>
                  <Heading size="xl" mb={2}>Regex Library</Heading>
                  <Text color="gray.500">Battle-tested patterns for everyday development tasks.</Text>
                </Box>
                
                <Tabs variant="soft-rounded" colorScheme="purple" align="center">
                  <TabList bg="white" p={2} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
                    <Tab px={8}><Icon as={UserCheck} mr={2} /> Validation</Tab>
                    <Tab px={8}><Icon as={Globe} mr={2} /> Web & Network</Tab>
                    <Tab px={8}><Icon as={Database} mr={2} /> Data Extraction</Tab>
                  </TabList>

                  <TabPanels mt={8}>
                    {Object.entries(regexLibrary).map(([category, items]) => (
                      <TabPanel key={category} p={0}>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {items.map((item) => (
                            <Box key={item.name} p={6} bg="white" borderRadius="2xl" border="1px" borderColor="gray.200" shadow="sm" _hover={{ shadow: "xl", transform: "translateY(-4px)" }} transition="all 0.3s">
                              <Heading size="xs" mb={1} color="purple.600" textTransform="uppercase" letterSpacing="widest">{item.name}</Heading>
                              <Text fontSize="xs" color="gray.500" mb={4}>{item.desc}</Text>
                              <Code p={3} borderRadius="xl" w="100%" mb={4} display="block" overflowX="auto" fontSize="xs" bg="gray.50">{item.pattern}</Code>
                              <HStack>
                                <Button size="sm" variant="solid" colorScheme="purple" flex={1} onClick={() => { setPattern(item.pattern); setActiveTab("tester"); }} borderRadius="lg">
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

            {activeTab === "cheatsheet" && (
              <VStack align="stretch" spacing={6}>
                <Box textAlign="center" mb={4}>
                  <Heading size="xl" mb={2}>Cheat Sheet</Heading>
                  <Text color="gray.500">Quick reference for Regular Expression syntax.</Text>
                </Box>
                <Box bg="white" borderRadius="3xl" shadow="xl" border="1px" borderColor="gray.100" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th py={5} fontSize="xs" color="gray.400">Syntax</Th>
                        <Th py={5} fontSize="xs" color="gray.400">Description</Th>
                        <Th py={5} textAlign="right"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cheatSheet.map((item, idx) => (
                        <Tr key={idx} _hover={{ bg: "purple.50" }} transition="bg 0.2s">
                          <Td><Code colorScheme="purple" px={3} py={1} borderRadius="md" fontSize="md" fontWeight="bold">{item.symbol}</Code></Td>
                          <Td color="gray.600" fontSize="md" fontWeight="medium">{item.meaning}</Td>
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
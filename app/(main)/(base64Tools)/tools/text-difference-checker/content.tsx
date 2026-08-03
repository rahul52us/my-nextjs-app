"use client";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import {
  Box,
  Textarea,
  VStack,
  Heading,
  Text,
  HStack,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Radio,
  RadioGroup,
  Spinner,
  Input,
  Flex,
  useToast,
} from "@chakra-ui/react";

// Utility function for character-level comparison
const characterLevelComparison = (word1: string, word2: string) => {
  const maxLength = Math.max(word1.length, word2.length);
  return Array.from({ length: maxLength }, (_, i) => ({
    char1: word1[i] || "",
    char2: word2[i] || "",
    isDifferent: word1[i] !== word2[i],
  }));
};

// Utility function for word-level comparison with character differences
const wordLevelComparison = (text1: string, text2: string, caseSensitive: boolean) => {
  const lines1 = text1.split("\n").map(line => line.trim());
  const lines2 = text2.split("\n").map(line => line.trim());
  const maxLines = Math.max(lines1.length, lines2.length);

  const compareLines = (line1: string, line2: string) => {
    const words1 = line1.split(/\s+/).filter(Boolean);
    const words2 = line2.split(/\s+/).filter(Boolean);
    const maxWords = Math.max(words1.length, words2.length);

    return Array.from({ length: maxWords }, (_, i) => {
      const word1 = words1[i] || "";
      const word2 = words2[i] || "";
      const isDifferent = caseSensitive
        ? word1 !== word2
        : word1.toLowerCase() !== word2.toLowerCase();
      const charDiff = characterLevelComparison(word1, word2);
      return { word1, word2, isDifferent, charDiff };
    });
  };

  return Array.from({ length: maxLines }, (_, i) => ({
    lineNumber: i + 1,
    words: compareLines(lines1[i] || "", lines2[i] || ""),
  }));
};

const TextDifferenceChecker = () => {
  const [text1, setText1] = useState<string>("");
  const [text2, setText2] = useState<string>("");
  const [differences, setDifferences] = useState<any[] | null>(null);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [showIdenticalLines, setShowIdenticalLines] = useState<boolean>(true);
  const [viewFormat, setViewFormat] = useState<string>("table");
  const [loading, setLoading] = useState<boolean>(false);

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const toast = useToast();

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, setText: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result as string);
        setLoading(false);
        toast({
          title: "File Uploaded",
          description: `${file.name} loaded successfully.`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      };
      reader.onerror = () => {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to read the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsText(file);
    }
  };

  // Trigger comparison
  const handleCompareTexts = useCallback(() => {
    if (!text1 && !text2) {
      setDifferences(null);
      return;
    }
    setLoading(true);
    const diff = wordLevelComparison(text1, text2, caseSensitive);
    const filteredDiff = showIdenticalLines
      ? diff
      : diff.filter(line => line.words.some((word: any) => word.isDifferent));
    setDifferences(filteredDiff);
    setLoading(false);
  }, [text1, text2, caseSensitive, showIdenticalLines]);

  useEffect(() => {
    handleCompareTexts();
  }, [text1, text2, caseSensitive, showIdenticalLines, handleCompareTexts]);

  return (
    <Flex minH="100vh" bg={bgColor} color={textColor} p={{ base: 4, md: 6 }} w="100%" justify="center">
      <Box
        bg={cardBg}
        p={{ base: 6, md: 10 }}
        borderRadius="2xl"
        boxShadow="0 8px 24px rgba(0, 0, 0, 0.15)"
        w="100%"
        maxW="1200px"
        transition="all 0.3s ease"
        _hover={{ boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)" }}
      >
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Header */}
          <Heading as="h1" size="xl" color="teal.500" textAlign="center">
            Text Difference Checker
          </Heading>
          <Text textAlign="center" fontSize="md" color="gray.600" maxW="600px" mx="auto">
            Compare two texts and highlight differences at word and character levels.
          </Text>

          {/* Options */}
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <Checkbox
              isChecked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              colorScheme="teal"
            >
              Case Sensitive
            </Checkbox>
            <Checkbox
              isChecked={showIdenticalLines}
              onChange={(e) => setShowIdenticalLines(e.target.checked)}
              colorScheme="teal"
            >
              Show Identical Lines
            </Checkbox>
            <RadioGroup onChange={setViewFormat} value={viewFormat}>
              <HStack spacing={4}>
                <Radio value="table">Table View</Radio>
                <Radio value="side-by-side">Side-by-Side View</Radio>
              </HStack>
            </RadioGroup>
          </HStack>

          {/* File Upload and Text Areas */}
          <HStack spacing={4} align="stretch">
            <VStack flex="1" spacing={4}>
              <Input
                type="file"
                accept=".txt,.md"
                onChange={(e) => handleFileUpload(e, setText1)}
                border="none"
                p={1}
                colorScheme="teal"
              />
              <Textarea
                value={text1}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText1(e.target.value)}
                placeholder="Enter or paste first text here"
                rows={8}
                bg="white"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "teal.300" }}
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                resize="vertical"
              />
            </VStack>
            <VStack flex="1" spacing={4}>
              <Input
                type="file"
                accept=".txt,.md"
                onChange={(e) => handleFileUpload(e, setText2)}
                border="none"
                p={1}
                colorScheme="teal"
              />
              <Textarea
                value={text2}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText2(e.target.value)}
                placeholder="Enter or paste second text here"
                rows={8}
                bg="white"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "teal.300" }}
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                resize="vertical"
              />
            </VStack>
          </HStack>

          {/* Differences Output */}
          {loading ? (
            <HStack justify="center" mb={6}>
              <Spinner size="lg" color="teal.500" />
              <Text>Comparing texts...</Text>
            </HStack>
          ) : (
            <>
              {differences && differences.length > 0 ? (
                <>
                  {viewFormat === "table" && (
                    <Table variant="striped" colorScheme="teal">
                      <Thead>
                        <Tr>
                          <Th>Line</Th>
                          <Th>First Text</Th>
                          <Th>Second Text</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {differences.map((line, index) => (
                          <Tr key={index}>
                            <Td>{line.lineNumber}</Td>
                            <Td>
                              {line.words.map((word: any, i: number) => (
                                <Text
                                  as="span"
                                  key={i}
                                  color={word.isDifferent ? "red.500" : "gray.800"}
                                  fontWeight={word.isDifferent ? "bold" : "normal"}
                                  mr={2}
                                  overflowWrap={'break-word'}
                                >
                                  {word.word1}
                                </Text>
                              ))}
                            </Td>
                            <Td>
                              {line.words.map((word: any, i: number) => (
                                <Text
                                  as="span"
                                  key={i}
                                  color={word.isDifferent ? "red.500" : "gray.800"}
                                  fontWeight={word.isDifferent ? "bold" : "normal"}
                                  mr={2}
                                  overflowWrap={'break-word'}
                                >
                                  {word.word2}
                                </Text>
                              ))}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}

                  {viewFormat === "side-by-side" && (
                    <Box>
                      {differences.map((line, index) => (
                        <Box key={index} mb={4} p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold" color="teal.600">Line {line.lineNumber}</Text>
                          <HStack spacing={6} align="start">
                            <Box flex="1">
                              {line.words.map((word: any, i: number) => (
                                <Text
                                  as="span"
                                  key={i}
                                  color={word.isDifferent ? "red.500" : "gray.800"}
                                  fontWeight={word.isDifferent ? "bold" : "normal"}
                                  mr={2}
                                  overflowWrap={'break-word'}
                                >
                                  {word.word1}
                                </Text>
                              ))}
                            </Box>
                            <Box flex="1">
                              {line.words.map((word: any, i: number) => (
                                <Text
                                  as="span"
                                  key={i}
                                  color={word.isDifferent ? "red.500" : "gray.800"}
                                  fontWeight={word.isDifferent ? "bold" : "normal"}
                                  mr={2}
                                  overflowWrap={'break-word'}
                                >
                                  {word.word2}
                                </Text>
                              ))}
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Text textAlign="center" color="gray.500" mt={4}>
                  No differences to display. Enter text or upload files to compare.
                </Text>
              )}
            </>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default TextDifferenceChecker;
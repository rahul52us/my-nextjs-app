"use client";
import { useState, ChangeEvent, useEffect } from "react";
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
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const maxLines = Math.max(lines1.length, lines2.length);

  const compareLines = (line1: string, line2: string) => {
    const words1 = line1.split(" ");
    const words2 = line2.split(" ");
    const maxWords = Math.max(words1.length, words2.length);

    return Array.from({ length: maxWords }, (_, i) => {
      const word1 = words1[i] || "";
      const word2 = words2[i] || "";
      const isDifferent = caseSensitive ? word1 !== word2 : word1.toLowerCase() !== word2.toLowerCase();
      const charDiff = characterLevelComparison(word1, word2);
      return { word1, word2, isDifferent, charDiff };
    });
  };

  const diff1 = Array.from({ length: maxLines }, (_, i) => ({
    lineNumber: i + 1,
    words: compareLines(lines1[i] || "", lines2[i] || ""),
  }));

  const diff2 = Array.from({ length: maxLines }, (_, i) => ({
    lineNumber: i + 1,
    words: compareLines(lines1[i] || "", lines2[i] || ""),
  }));

  return { diff1, diff2 };
};

const TextDifferenceChecker = () => {
  const [text1, setText1] = useState<string>("");
  const [text2, setText2] = useState<string>("");
  const [differences, setDifferences] = useState<{ diff1: any[]; diff2: any[] } | null>(null);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [showIdenticalLines, setShowIdenticalLines] = useState<boolean>(true);
  const [viewFormat, setViewFormat] = useState<string>("table"); // "table" or "side-by-side"
  const [loading, setLoading] = useState<boolean>(false); // New state for loading
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // Handle file upload
  const handleFileUpload = async (file: File, setText: React.Dispatch<React.SetStateAction<string>>) => {
    const reader = new FileReader();
    reader.onload = () => {
      setText(reader.result as string);
    };
    reader.readAsText(file);
  };

  // Trigger comparison on text change
  const handleCompareTexts = () => {
    setLoading(true);
    setDifferences(wordLevelComparison(text1, text2, caseSensitive));
    setLoading(false);
  };

  // Run comparison when either text changes or settings change
  useEffect(() => {
    handleCompareTexts();
  }, [text1, text2, caseSensitive]);

  return (
    <Box p={6} bg={bgColor} color={textColor}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" fontWeight="bold" mb={6}>
        Text Difference Checker
      </Heading>
      <VStack spacing={6} align="stretch">
        {/* Instructions and Options */}
        <Text fontSize="lg" textAlign="center" mb={4}>
          Compare two texts and find the differences. You can upload text files or paste content directly.
        </Text>

        {/* File Upload */}
        <HStack justify="space-between">
          <Input
            type="file"
            accept=".txt,.md"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile1(e.target.files[0]);
                handleFileUpload(e.target.files[0], setText1);
              }
            }}
            placeholder="Upload first text file"
            colorScheme="teal"
            width="45%"
          />
          <Input
            type="file"
            accept=".txt,.md"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile2(e.target.files[0]);
                handleFileUpload(e.target.files[0], setText2);
              }
            }}
            placeholder="Upload second text file"
            colorScheme="teal"
            width="45%"
          />
        </HStack>

        {/* Options */}
        <HStack justify="space-between">
          <Checkbox
            isChecked={caseSensitive}
            onChange={(e) => {
              setCaseSensitive(e.target.checked);
            }}
            colorScheme="teal"
          >
            Case Sensitive Comparison
          </Checkbox>
          <Checkbox
            isChecked={showIdenticalLines}
            onChange={(e) => setShowIdenticalLines(e.target.checked)}
            colorScheme="teal"
          >
            Show Identical Lines
          </Checkbox>
        </HStack>

        {/* View Format */}
        <RadioGroup onChange={setViewFormat} value={viewFormat}>
          <HStack spacing={6}>
            <Radio value="table">Table Format</Radio>
            <Radio value="side-by-side">Side-by-Side Format</Radio>
          </HStack>
        </RadioGroup>

        {/* Text Areas */}
        {/* If files are uploaded, display them in the text areas */}
        <HStack spacing={4} align="stretch">
          <Textarea
            value={file1 ? text1 : ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setText1(e.target.value);
            }}
            placeholder="Enter first text here"
            rows={8}
            borderColor="teal.300"
            _focus={{ borderColor: "teal.500" }}
            resize="vertical"
          />
          <Textarea
            value={file2 ? text2 : ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setText2(e.target.value);
            }}
            placeholder="Enter second text here"
            rows={8}
            borderColor="teal.300"
            _focus={{ borderColor: "teal.500" }}
            resize="vertical"
          />
        </HStack>

        {/* Output Differences */}
        {loading ? (
          <HStack justify="center" mb={6}>
            <Spinner size="lg" color="teal.500" />
            <Text>Comparing texts...</Text>
          </HStack>
        ) : (
          <>
            {differences && viewFormat === "table" && (
              <Table variant="striped" colorScheme="teal">
                <Thead>
                  <Tr>
                    <Th>Line</Th>
                    <Th>First Text</Th>
                    <Th>Second Text</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {differences.diff1.map((line, index) => {
                    const isLineDifferent = line.words.some((word: any) => word.isDifferent);
                    return (
                      <Tr key={index}>
                        <Td>{line.lineNumber}</Td>
                        <Td>
                          {line.words.map((word: any, i: number) => (
                            <Text
                              as="span"
                              key={i}
                              color={word.isDifferent ? "red.500" : "gray.800"}
                              fontWeight={word.isDifferent ? "bold" : "normal"}
                            >
                              {word.word1}{" "}
                            </Text>
                          ))}
                        </Td>
                        <Td>
                          {differences.diff2[index].words.map((word: any, i: number) => (
                            <Text
                              as="span"
                              key={i}
                              color={word.isDifferent ? "red.500" : "gray.800"}
                              fontWeight={word.isDifferent ? "bold" : "normal"}
                            >
                              {word.word2}{" "}
                            </Text>
                          ))}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}

            {differences && viewFormat === "side-by-side" && (
              <Box>
                {differences.diff1.map((line, index) => {
                  const isLineDifferent = line.words.some((word: any) => word.isDifferent);
                  return (
                    <Box key={index} mb={4}>
                      <Text fontWeight="bold">Line {line.lineNumber}</Text>
                      <HStack spacing={6}>
                        <Box flex="1">
                          {line.words.map((word: any, i: number) => (
                            <Text
                              as="span"
                              key={i}
                              color={word.isDifferent ? "red.500" : "gray.800"}
                              fontWeight={word.isDifferent ? "bold" : "normal"}
                            >
                              {word.word1}{" "}
                            </Text>
                          ))}
                        </Box>
                        <Box flex="1">
                          {differences.diff2[index].words.map((word: any, i: number) => (
                            <Text
                              as="span"
                              key={i}
                              color={word.isDifferent ? "red.500" : "gray.800"}
                              fontWeight={word.isDifferent ? "bold" : "normal"}
                            >
                              {word.word2}{" "}
                            </Text>
                          ))}
                        </Box>
                      </HStack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TextDifferenceChecker;

"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  HStack,
  Checkbox,
  Text,
  Spinner,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaClipboard, FaTrashAlt, FaLightbulb } from "react-icons/fa";

// Main Regex Tester Component
const RegexTester = () => {
  const [regex, setRegex] = useState<string>(""); // Holds the regular expression entered by the user
  const [testString, setTestString] = useState<string>(""); // Holds the test string
  const [flags, setFlags] = useState<string>("g"); // Regex flags
  const [matches, setMatches] = useState<string[]>([]); // Matched results after testing
  const [loading, setLoading] = useState<boolean>(false); // Indicates test progress
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // Function to test regex logic
  const handleTestRegex = () => {
    setLoading(true);
    try {
      const regexPattern = new RegExp(regex, flags); // Regex with user-provided flags
      const matchArray = Array.from(testString.matchAll(regexPattern));
      const matchResults = matchArray.map((match) => match[0]);
      setMatches(matchResults);

      toast({
        title: "Regex Tested Successfully",
        description: `${matchResults.length} match found.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.log(err)
      toast({
        title: "Invalid Regex",
        description: "Check your regular expression and try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setMatches([]); // Clear results
    }
    setLoading(false);
  };

  // Handle copy to clipboard
  const handleCopyMatches = () => {
    if (matches.length === 0) return;
    navigator.clipboard
      .writeText(matches.join("\n"))
      .then(() => {
        toast({
          title: "Matches Copied!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Reset UI state
  const handleReset = () => {
    setRegex("");
    setTestString("");
    setFlags("");
    setMatches([]);
  };

  // Handle toggle for simpler flags only
  const toggleFlag = (flag: string) => {
    setFlags((prevFlags) =>
      prevFlags.includes(flag) ? prevFlags.replace(flag, "") : prevFlags + flag
    );
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        mb={6}
        textTransform="uppercase"
      >
        Regex Tester
      </Heading>
      <VStack spacing={4} align="stretch">
        {/* Regex Input Section */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter Your Regex
          </FormLabel>
          <Input
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            placeholder="e.g., \\d{3}-\\d{2}-\\d{4}"
            rounded="md"
          />
        </FormControl>

        {/* Flags Section */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Select Flags
          </FormLabel>
          <HStack spacing={4}>
            {["g", "i", "m"].map((flag) => (
              <Checkbox
                key={flag}
                isChecked={flags.includes(flag)}
                onChange={() => toggleFlag(flag)}
              >
                {flag === "g" && "Global Search"}
                {flag === "i" && "Ignore Case"}
                {flag === "m" && "Multi-Line Search"}
              </Checkbox>
            ))}
          </HStack>
        </FormControl>

        {/* Input for Test String */}
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Enter Test String
          </FormLabel>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Paste text here to test against regex"
            rows={6}
            rounded="md"
          />
        </FormControl>

        {/* Test Regex Button */}
        <Button
          colorScheme="blue"
          onClick={handleTestRegex}
          isDisabled={!regex || !testString || loading}
        >
          {loading ? <Spinner size="sm" /> : "Test Regex"}
        </Button>

        {/* Matches Display */}
        {matches.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Matches Found:
            </Text>
            <Textarea
              value={matches.join("\n")}
              readOnly
              rows={matches.length + 2}
              rounded="md"
            />
          </Box>
        )}
        <Flex gap={4}>
          {/* Copy Button */}
          <Button
            colorScheme="blue"
            leftIcon={<FaClipboard />}
            onClick={handleCopyMatches}
            isDisabled={matches.length === 0}
          >
            Copy Matches
          </Button>

          {/* Example Regex Button */}
          <Button
            colorScheme="yellow"
            leftIcon={<FaLightbulb />}
            onClick={() => {
              setRegex("\\b\\w+\\b");
              setTestString("Sample text with multiple words!");
            }}
          >
            Example Test
          </Button>

          {/* Reset Button */}
          <Button
            colorScheme="red"
            leftIcon={<FaTrashAlt />}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default RegexTester;
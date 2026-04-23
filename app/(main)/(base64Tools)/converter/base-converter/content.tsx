"use client";
import { useState, useEffect } from "react";
import {
  Select,
  Input,
  Text,
  Divider,
  Box,
  Alert,
  Grid,
  useBreakpointValue,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Tooltip,
} from "@chakra-ui/react";
import stores from "../../../../store/stores";

const convertBase = (value: string, fromBase: number, toBase: number): string => {
  if (!value) return "";
  try {
    return parseInt(value, fromBase).toString(toBase).toUpperCase();
  } catch {
    throw new Error("Invalid conversion");
  }
};

export default function BaseConverterContent() {
  const [fromBase, setFromBase] = useState("10");
  const [toBase, setToBase] = useState("2");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const {
    themeStore: { themeConfig },
  } = stores;

  // 🌙 DARK MODE COLORS
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const resultBg = useColorModeValue("blue.50", "blue.900");

  const handleConversion = () => {
    if (value.trim() === "") {
      setResult("");
      setError("Please enter a value.");
      return;
    }

    try {
      const convertedValue = convertBase(value, parseInt(fromBase), parseInt(toBase));
      setResult(convertedValue);
      setError("");
    } catch {
      setError("Invalid input or conversion bases.");
      setResult("");
    }
  };

  useEffect(() => {
    handleConversion();
  }, [fromBase, toBase, value]);

  const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

  return (
    <Box p={4} bg={bgColor} color={textColor} minH="85vh">
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={6}
      >
        Base Converter
      </Heading>

      <Divider borderColor={borderColor} mb={6} />

      {/* Dropdown Section */}
      <Grid templateColumns={responsiveGridColumns} gap={6}>
        <Box p={4} shadow="md" bg={cardBg} borderRadius="md">
          <FormControl>
            <FormLabel fontWeight="bold">From Base</FormLabel>
            <Tooltip label="Select the base of the input value." hasArrow>
              <Select
                value={fromBase}
                onChange={(e) => setFromBase(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
              >
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10">Decimal</option>
                <option value="16">Hexadecimal</option>
              </Select>
            </Tooltip>
          </FormControl>
        </Box>

        <Box p={4} shadow="md" bg={cardBg} borderRadius="md">
          <FormControl>
            <FormLabel fontWeight="bold">To Base</FormLabel>
            <Tooltip label="Select the base to convert the value to." hasArrow>
              <Select
                value={toBase}
                onChange={(e) => setToBase(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
              >
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10">Decimal</option>
                <option value="16">Hexadecimal</option>
              </Select>
            </Tooltip>
          </FormControl>
        </Box>
      </Grid>

      {/* Input */}
      <Input
        placeholder="Enter value to convert"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        mt={6}
        bg={inputBg}
        borderColor={borderColor}
      />

      {/* Error */}
      {error && value?.length > 0 && (
        <Alert status="error" mt={2}>
          {error}
        </Alert>
      )}

      {/* Result */}
      <Box mt={6} p={4} bg={resultBg} borderRadius="md" shadow="md">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          Converted Value: {result || "---"}
        </Text>
      </Box>

      {/* Info */}
      <Box mt={6} p={4} bg={cardBg} borderRadius="md" shadow="md">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Number Base Overview:
        </Text>

        <Text mb={2}>
                    <strong>Binary (Base 2)</strong>: Uses digits 0 and 1. Common in computing and digital systems.
                </Text>
                <Text mb={2}>
                    <strong>Octal (Base 8)</strong>: Uses digits 0-7. Sometimes used in older computer systems.
                </Text>
                <Text mb={2}>
                    <strong>Decimal (Base 10)</strong>: The standard numbering system, using digits 0-9.
                </Text>
                <Text>
                    <strong>Hexadecimal (Base 16)</strong>: Uses digits 0-9 and letters A-F. Commonly used in programming for memory addresses.
                </Text>
      </Box>
    </Box>
  );
}
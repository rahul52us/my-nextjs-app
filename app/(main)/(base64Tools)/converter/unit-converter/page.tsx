"use client";
import { useState, useEffect } from "react";
import {
  Select,
  Input,
  VStack,
  Text,
  Divider,
  Box,
  Alert,
  AlertIcon,
  Grid,
  Flex,
  useBreakpointValue,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { performConversion, ConversionCategory, unitConversionMap } from "./conversionLogic";

export default function UnitConverter() {
  const [type, setType] = useState<ConversionCategory>("Weight");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleConversion = () => {
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || value.trim() === "") {
      setResult("");
      setError("Please enter a valid number.");
      return;
    }

    try {
      const convertedValue = performConversion(type, fromUnit, toUnit, numericValue);
      setResult(convertedValue.toFixed(2));
      setError("");
    } catch {
      setError("Invalid conversion options.");
      setResult("");
    }
  };

  useEffect(() => {
    handleConversion();
  }, [type, fromUnit, toUnit, value]);

  const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr 1fr" });

  return (
    <Box p={4} bg={bgColor} color={textColor} minH="78vh">
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Unit Converter
      </Heading>
      <Divider borderColor="blue.300" mb={6} />

      <Grid templateColumns={responsiveGridColumns} gap={6}>
        <Box p={4} shadow="md" bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">Category</Text>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value as ConversionCategory);
              setFromUnit("");
              setToUnit("");
            }}
            placeholder="Choose category"
          >
            {Object.keys(unitConversionMap).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Box>

        <Box p={4} shadow="md" bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">From Unit</Text>
          <Select
            value={fromUnit}
            onChange={(e) => {
              setFromUnit(e.target.value);
              setToUnit("");
            }}
            placeholder="Choose starting unit"
          >
            {Object.keys(unitConversionMap[type] || {}).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </Box>

        <Box p={4} shadow="md" bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">To Unit</Text>
          <Select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            placeholder="Choose target unit"
          >
            {Object.keys(unitConversionMap[type]?.[fromUnit] || {}).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </Box>
      </Grid>

      <Input
        placeholder="Enter value to convert"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        mt={4}
        bg="white"
      />

      {error && value?.length > 0 && <Alert status="error" mt={2}>{error}</Alert>}

      <Box mt={6} p={4} bg="blue.50">
        <Text fontSize="xl">Converted Value: {result || "---"}</Text>
      </Box>
    </Box>
  );
}

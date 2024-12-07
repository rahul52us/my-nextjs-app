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
} from "@chakra-ui/react";

// Helper function to handle speed conversion
const convertSpeed = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  const conversionRates : any = {
    "km/h": {
      "m/s": 1000 / 3600,
      "mph": 0.621371,
      "knots": 0.53996,
    },
    "m/s": {
      "km/h": 3600 / 1000,
      "mph": 2.23694,
      "knots": 0.53996,
    },
    "mph": {
      "km/h": 1.60934,
      "m/s": 0.44704,
      "knots": 0.868976,
    },
    "knots": {
      "km/h": 1.852,
      "m/s": 0.514444,
      "mph": 1.15078,
    },
  };

  if (!conversionRates[fromUnit] || !conversionRates[fromUnit][toUnit]) {
    throw new Error("Invalid conversion units");
  }

  return value * conversionRates[fromUnit][toUnit];
};

export default function SpeedConverter() {
  const [fromUnit, setFromUnit] = useState("km/h"); // Default from unit
  const [toUnit, setToUnit] = useState("m/s"); // Default to unit
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleConversion = () => {
    if (value.trim() === "") {
      setResult("");
      setError("Please enter a value.");
      return;
    }

    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      setError("Please enter a valid number.");
      setResult("");
      return;
    }

    try {
      const convertedValue = convertSpeed(
        parsedValue,
        fromUnit,
        toUnit
      );
      setResult(convertedValue.toFixed(2));
      setError("");
    } catch {
      setError("Invalid input or conversion units.");
      setResult("");
    }
  };

  useEffect(() => {
    handleConversion();
  }, [fromUnit, toUnit, value]);

  const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

  return (
    <Box p={4} bg={bgColor} color={textColor} minH="78vh">
      {/* Header Section */}
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Speed Converter
      </Heading>
      <Divider borderColor="blue.300" mb={6} />

      {/* Informational Section */}

      {/* Conversion Options */}
      <Grid templateColumns={responsiveGridColumns} gap={6}>
        {/* From Unit Dropdown */}
        <Box
          p={4}
          shadow="md"
          bg="gray.50"
          borderRadius="md"
          _hover={{ boxShadow: "lg" }}
          transition="all 0.2s ease-in-out"
        >
          <FormControl>
            <FormLabel fontWeight="bold">From Unit</FormLabel>
            <Select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              placeholder="Select unit"
              bg="white"
              border="1px"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            >
              <option value="km/h">Kilometers per hour</option>
              <option value="m/s">Meters per second</option>
              <option value="mph">Miles per hour</option>
              <option value="knots">Knots</option>
            </Select>
          </FormControl>
        </Box>

        {/* To Unit Dropdown */}
        <Box
          p={4}
          shadow="md"
          bg="gray.50"
          borderRadius="md"
          _hover={{ boxShadow: "lg" }}
          transition="all 0.2s ease-in-out"
        >
          <FormControl>
            <FormLabel fontWeight="bold">To Unit</FormLabel>
            <Select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              placeholder="Select unit"
              bg="white"
              border="1px"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            >
              <option value="km/h">Kilometers per hour</option>
              <option value="m/s">Meters per second</option>
              <option value="mph">Miles per hour</option>
              <option value="knots">Knots</option>
            </Select>
          </FormControl>
        </Box>
      </Grid>

      {/* Input Section */}
      <Input
        placeholder="Enter value to convert"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        mt={6}
        bg="white"
        border="1px"
        borderColor="gray.300"
      />

      {/* Error Alert */}
      {error && value?.length > 0 && <Alert status="error" mt={2}>{error}</Alert>}

      {/* Result Section */}
      <Box mt={6} p={4} bg="blue.50" borderRadius="md" shadow="md">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          Converted Speed: {result || "---"} {toUnit}
        </Text>
      </Box>
      <Box
        p={4}
        bg="blue.50"
        borderRadius="md"
        shadow="md"
        mb={6}
        _hover={{ boxShadow: "lg" }}
        transition="all 0.2s ease-in-out"
      >
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Speed Units Overview:
        </Text>
        <Text mb={2}>
          <strong>Kilometers per hour (km/h)</strong>: Used for measuring vehicle speeds, especially on highways.
        </Text>
        <Text mb={2}>
          <strong>Meters per second (m/s)</strong>: The standard unit in physics and engineering for speed measurements.
        </Text>
        <Text mb={2}>
          <strong>Miles per hour (mph)</strong>: Commonly used in the United States to represent vehicle speeds.
        </Text>
        <Text>
          <strong>Knots</strong>: A unit of speed commonly used in aviation and maritime navigation.
        </Text>
      </Box>
    </Box>
  );
}

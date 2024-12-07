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

// Helper function to handle time conversion
const convertTime = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  const conversionRates: any = {
    seconds: {
      minutes: 1 / 60,
      hours: 1 / 3600,
      days: 1 / 86400,
      weeks: 1 / 604800,
    },
    minutes: {
      seconds: 60,
      hours: 1 / 60,
      days: 1 / 1440,
      weeks: 1 / 10080,
    },
    hours: {
      seconds: 3600,
      minutes: 60,
      days: 1 / 24,
      weeks: 1 / 168,
    },
    days: {
      seconds: 86400,
      minutes: 1440,
      hours: 24,
      weeks: 1 / 7,
    },
    weeks: {
      seconds: 604800,
      minutes: 10080,
      hours: 168,
      days: 7,
    },
  };

  if (!conversionRates[fromUnit] || !conversionRates[fromUnit][toUnit]) {
    throw new Error("Invalid conversion units");
  }

  return value * conversionRates[fromUnit][toUnit];
};

export default function TimeConverter() {
  const [fromUnit, setFromUnit] = useState("seconds"); // Default from unit
  const [toUnit, setToUnit] = useState("minutes"); // Default to unit
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
      const convertedValue = convertTime(parsedValue, fromUnit, toUnit);
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
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Time Converter
      </Heading>
      <Divider borderColor="blue.300" mb={6} />

      {/* Dropdown Section */}
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
              transition="all 0.2s ease-in-out"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
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
              transition="all 0.2s ease-in-out"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </Select>
          </FormControl>
        </Box>
      </Grid>

      {/* Input for Value */}
      <Input
        placeholder="Enter value to convert"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        mt={6}
        bg="white"
        border="1px"
        borderColor="gray.300"
        _hover={{ borderColor: "blue.400" }}
        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        transition="all 0.2s ease-in-out"
      />

      {/* Error Alert */}
      {error && value?.length > 0 && <Alert status="error" mt={2}>{error}</Alert>}

      {/* Converted Value Display */}
      <Box mt={6} p={4} bg="blue.50" borderRadius="md" shadow="md">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          Converted Time: {result || "---"} {toUnit}
        </Text>
      </Box>

      {/* Time Conversion Overview */}
      <Box mb={6} p={4} bg="blue.50" borderRadius="md" shadow="md">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Time Conversion Overview:
        </Text>
        <Text mb={2}>
          <strong>Seconds (s)</strong>: The smallest standard unit of time. Useful for precise measurements.
        </Text>
        <Text mb={2}>
          <strong>Minutes (min)</strong>: Equivalent to 60 seconds. Commonly used for short-duration tasks.
        </Text>
        <Text mb={2}>
          <strong>Hours (hr)</strong>: Equivalent to 60 minutes. Commonly used for work shifts or event durations.
        </Text>
        <Text mb={2}>
          <strong>Days (d)</strong>: Equivalent to 24 hours. Useful for long-term planning and calculations.
        </Text>
        <Text>
          <strong>Weeks (wk)</strong>: Equivalent to 7 days. Often used to track schedules or timelines.
        </Text>
      </Box>
    </Box>
  );
}

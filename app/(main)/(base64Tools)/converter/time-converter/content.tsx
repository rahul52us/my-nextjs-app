"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Flex,
    Heading,
    Input,
    Select,
    Text,
    VStack,
    useToast,
    Fade,
    IconButton,
    Tooltip,
    FormControl,
    FormLabel,
    Alert,
    Grid,
    useBreakpointValue,
    useColorModeValue,
    HStack,
} from "@chakra-ui/react";
import { FaCopy, FaExchangeAlt } from "react-icons/fa";
import debounce from "lodash.debounce";

// Helper function to handle time conversion
const convertTime = (value: number, fromUnit: string, toUnit: string): number => {
    const conversionRates: Record<string, Record<string, number>> = {
        seconds: {
            seconds: 1,
            minutes: 1 / 60,
            hours: 1 / 3600,
            days: 1 / 86400,
            weeks: 1 / 604800,
        },
        minutes: {
            seconds: 60,
            minutes: 1,
            hours: 1 / 60,
            days: 1 / 1440,
            weeks: 1 / 10080,
        },
        hours: {
            seconds: 3600,
            minutes: 60,
            hours: 1,
            days: 1 / 24,
            weeks: 1 / 168,
        },
        days: {
            seconds: 86400,
            minutes: 1440,
            hours: 24,
            days: 1,
            weeks: 1 / 7,
        },
        weeks: {
            seconds: 604800,
            minutes: 10080,
            hours: 168,
            days: 7,
            weeks: 1,
        },
    };

    if (!conversionRates[fromUnit] || !conversionRates[fromUnit][toUnit]) {
        throw new Error("Invalid conversion units");
    }

    return value * conversionRates[fromUnit][toUnit];
};

const timeUnits = [
    { label: "Seconds (s)", value: "seconds" },
    { label: "Minutes (min)", value: "minutes" },
    { label: "Hours (hr)", value: "hours" },
    { label: "Days (d)", value: "days" },
    { label: "Weeks (wk)", value: "weeks" },
];

export default function TimeConverterContent() {
    const [fromUnit, setFromUnit] = useState("seconds");
    const [toUnit, setToUnit] = useState("minutes");
    const [value, setValue] = useState("");
    const [precision, setPrecision] = useState<number>(2);
    const [result, setResult] = useState<{
        value: string;
        steps: string[];
    } | any>(null);
    const [humanReadable] = useState<boolean>(false);
    const [history, setHistory] = useState<string[]>([]);
    const [error, setError] = useState("");
    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const cardBg = useColorModeValue("white", "gray.700");

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

    // Debounced conversion function
    const handleConversion = useCallback(
        debounce(() => {
            if (value.trim() === "") {
                setResult(null);
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
                let convertedValue = convertTime(parsedValue, fromUnit, toUnit);
                let displayValue = convertedValue.toFixed(precision);

                // Human-readable formatting
                if (humanReadable && convertedValue >= 60) {
                    const sizes = ["s", "min", "hr", "d", "wk"];
                    const thresholds = [1, 60, 3600, 86400, 604800];
                    let index = 0;
                    while (convertedValue >= thresholds[index + 1] && index < sizes.length - 1) {
                        convertedValue /= thresholds[index + 1] / thresholds[index];
                        index++;
                    }
                    displayValue = `${convertedValue.toFixed(2)} ${sizes[index]}`;
                }

                const fromFactor = 1 / convertTime(1, toUnit, fromUnit); // Inverse for step clarity
                const steps = [
                    `1. Convert to Base (Seconds): ${parsedValue} ${fromUnit} × ${fromFactor} = ${parsedValue * fromFactor
                    } Seconds`,
                    `2. Convert to ${toUnit}: ${parsedValue * fromFactor} Seconds × ${convertTime(
                        1,
                        "seconds",
                        toUnit
                    )} = ${convertedValue.toFixed(precision)} ${toUnit}`,
                ];

                setResult({ value: displayValue, steps });
                setHistory((prev) => [
                    `${parsedValue} ${fromUnit} = ${displayValue}`,
                    ...prev.slice(0, 4),
                ]);
                setError("");
            } catch {
                setError("Invalid conversion units.");
                setResult(null);
            }
        }, 300),
        [value, fromUnit, toUnit, precision, humanReadable]
    );

    useEffect(() => {
        handleConversion();
        return () => handleConversion.cancel();
    }, [value, fromUnit, toUnit, precision, humanReadable, handleConversion]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result.value);
            toast({
                title: "Copied!",
                description: "Result copied to clipboard",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }
    };

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
                        Time Converter
                    </Heading>
                    <Text textAlign="center" fontSize="md" color="gray.600" maxW="600px" mx="auto">
                        Convert time units instantly with detailed steps and history.
                    </Text>

                    {/* Input Section */}
                    <Grid templateColumns={responsiveGridColumns} gap={6}>
                        <FormControl>
                            <FormLabel fontWeight="bold" color="teal.600">From Unit</FormLabel>
                            <Select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                _hover={{ borderColor: "teal.300" }}
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                transition="all 0.2s ease"
                            >
                                {timeUnits.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontWeight="bold" color="teal.600">To Unit</FormLabel>
                            <Select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                _hover={{ borderColor: "teal.300" }}
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                transition="all 0.2s ease"
                            >
                                {timeUnits.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
                        <Input
                            placeholder="Enter value to convert (e.g., 3600)"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            bg="white"
                            border="2px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                            transition="all 0.2s ease"
                            flex="1"
                            py={6}
                        />
                        <HStack spacing={3}>
                            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                                Precision:
                            </Text>
                            <Input
                                type="number"
                                value={precision}
                                onChange={(e) => setPrecision(Math.max(0, Math.min(10, Number(e.target.value))))}
                                min={0}
                                max={10}
                                w="80px"
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                _hover={{ borderColor: "teal.300" }}
                                _focus={{ borderColor: "teal.400" }}
                                transition="all 0.2s ease"
                            />
                        </HStack>
                    </Flex>

                    <Flex align="center" justify="center" gap={4}>
                        <Tooltip label="Swap Units" placement="top">
                            <IconButton
                                aria-label="Swap units"
                                icon={<FaExchangeAlt />}
                                size="md"
                                colorScheme="teal"
                                variant="outline"
                                onClick={handleSwap}
                                borderRadius="full"
                                bg="white"
                                _hover={{ bg: "teal.50" }}
                            />
                        </Tooltip>
                    </Flex>

                    {/* Error Alert */}
                    {error && value.length > 0 && (
                        <Alert status="error" borderRadius="md" p={3}>
                            {error}
                        </Alert>
                    )}

                    {/* Result */}
                    {result && (
                        <Fade in={!!result}>
                            <Box
                                p={{ base: 4, md: 6 }}
                                bg="teal.50"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="teal.200"
                                boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                            >
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize={{ base: "lg", md: "xl" }} color="teal.800" fontWeight="semibold">
                                            {value} {fromUnit} ={" "}
                                            <Text as="span" fontWeight="bold" color="teal.900">
                                                {result.value}
                                            </Text>
                                        </Text>
                                        <Tooltip label="Copy to Clipboard" placement="top">
                                            <IconButton
                                                aria-label="Copy result"
                                                icon={<FaCopy />}
                                                size="sm"
                                                colorScheme="teal"
                                                variant="ghost"
                                                onClick={handleCopy}
                                                _hover={{ bg: "teal.100" }}
                                            />
                                        </Tooltip>
                                    </Flex>
                                    <Box>
                                        <Text fontSize="sm" color="teal.700" fontWeight="medium">
                                            Calculation Steps:
                                        </Text>
                                        {result?.steps?.map((step: any, index: number) => (
                                            <Text key={index} fontSize="sm" color="gray.600" mt={1} fontFamily="monospace">
                                                {step}
                                            </Text>
                                        ))}
                                    </Box>
                                </VStack>
                            </Box>
                        </Fade>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <Box mt={6}>
                            <Text fontSize="sm" color="teal.700" fontWeight="medium" mb={2} textAlign="center">
                                Recent Conversions:
                            </Text>
                            <VStack align="stretch" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                {history.map((entry, index) => (
                                    <Text
                                        key={index}
                                        fontSize="sm"
                                        color="gray.600"
                                        p={2}
                                        bg="white"
                                        borderRadius="md"
                                        _hover={{ bg: "gray.100" }}
                                    >
                                        {entry}
                                    </Text>
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {/* Overview */}
                    <Box mt={6} p={4} bg="blue.50" borderRadius="lg" shadow="md">
                        <Text fontSize="lg" fontWeight="bold" color="blue.700" mb={2}>
                            Time Conversion Overview:
                        </Text>
                        <VStack align="start" spacing={2}>
                            <Text><strong>Seconds (s):</strong> Base unit; 1 min = 60s.</Text>
                            <Text><strong>Minutes (min):</strong> 1 hr = 60 min, 1 min = 60s.</Text>
                            <Text><strong>Hours (hr):</strong> 1 day = 24 hr, 1 hr = 3600s.</Text>
                            <Text><strong>Days (d):</strong> 1 week = 7 days, 1 day = 86400s.</Text>
                            <Text><strong>Weeks (wk):</strong> 1 week = 604800s.</Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Flex>
    );
}

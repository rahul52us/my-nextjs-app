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
    IconButton,
    Tooltip,
    Alert,
    Grid,
    useBreakpointValue,
    useColorModeValue,
    HStack,
} from "@chakra-ui/react";
import { FaCopy, FaExchangeAlt } from "react-icons/fa";
import debounce from "lodash.debounce";

const convertTime = (value: number, fromUnit: string, toUnit: string): number => {
    const conversionRates: Record<string, Record<string, number>> = {
        seconds: { seconds: 1, minutes: 1/60, hours: 1/3600, days: 1/86400, weeks: 1/604800 },
        minutes: { seconds: 60, minutes: 1, hours: 1/60, days: 1/1440, weeks: 1/10080 },
        hours: { seconds: 3600, minutes: 60, hours: 1, days: 1/24, weeks: 1/168 },
        days: { seconds: 86400, minutes: 1440, hours: 24, days: 1, weeks: 1/7 },
        weeks: { seconds: 604800, minutes: 10080, hours: 168, days: 7, weeks: 1 },
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
    const [result, setResult] = useState<{ value: string; steps: string[] } | null>(null);
    const [error, setError] = useState("");
    const toast = useToast();

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

    // Dark mode aware color tokens
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const mutedText = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("brand.500", "brand.300");
    const resultBg = useColorModeValue("brand.50", "brand.900");
    const overviewBg = useColorModeValue("white", "gray.700");
    const stepText = useColorModeValue("gray.600", "gray.300");

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
                setResult(null);
                return;
            }
            try {
                const convertedValue = convertTime(parsedValue, fromUnit, toUnit);
                const displayValue = convertedValue.toFixed(precision);

                const fromFactor = 1 / convertTime(1, toUnit, fromUnit);
                const steps = [
                    `1. Convert to Base (Seconds): ${parsedValue} ${fromUnit} × ${fromFactor} = ${parsedValue * fromFactor} Seconds`,
                    `2. Convert to ${toUnit}: ${parsedValue * fromFactor} Seconds × ${convertTime(1, "seconds", toUnit)} = ${convertedValue.toFixed(precision)} ${toUnit}`,
                ];

                setResult({ value: displayValue, steps });
                setError("");
            } catch {
                setError("Invalid conversion units.");
                setResult(null);
            }
        }, 300),
        [value, fromUnit, toUnit, precision]
    );

    useEffect(() => {
        handleConversion();
        return () => handleConversion.cancel();
    }, [value, fromUnit, toUnit, precision, handleConversion]);

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
        <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }} w="100%" bg="transparent">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Heading as="h1" size="xl" color={headingColor} textAlign="center">
                    Time Converter
                </Heading>
                <Text textAlign="center" fontSize="md" color={mutedText} maxW="600px" mx="auto">
                    Convert time units instantly with detailed steps and history.
                </Text>

                {/* Input Section */}
                <Grid templateColumns={responsiveGridColumns} gap={6}>
                    <Box>
                        <Text fontWeight="bold" mb={2}>From Unit</Text>
                        <Select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                        >
                            {timeUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                            ))}
                        </Select>
                    </Box>

                    <Box>
                        <Text fontWeight="bold" mb={2}>To Unit</Text>
                        <Select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                        >
                            {timeUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                            ))}
                        </Select>
                    </Box>
                </Grid>

                <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
                    <Input
                        placeholder="Enter value to convert (e.g., 3600)"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        bg={cardBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        flex="1"
                    />
                    <HStack spacing={3}>
                        <Text fontSize="sm" color={mutedText} whiteSpace="nowrap">
                            Precision:
                        </Text>
                        <Input
                            type="number"
                            value={precision}
                            onChange={(e) => setPrecision(Math.max(0, Math.min(10, Number(e.target.value))))}
                            min={0}
                            max={10}
                            w="80px"
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                        />
                    </HStack>
                </Flex>

                <Flex align="center" justify="center">
                    <Tooltip label="Swap Units" placement="top">
                        <IconButton
                            aria-label="Swap units"
                            icon={<FaExchangeAlt />}
                            size="md"
                            variant="outline"
                            onClick={handleSwap}
                            borderRadius="full"
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
                    <Box
                        p={{ base: 4, md: 6 }}
                        bg={resultBg}
                        borderRadius="md"
                    >
                        <Flex justify="space-between" align="center">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
                                {value} {fromUnit} ={" "}
                                <Text as="span" fontWeight="bold">
                                    {result.value} {toUnit}
                                </Text>
                            </Text>
                            <Tooltip label="Copy to Clipboard" placement="top">
                                <IconButton
                                    aria-label="Copy result"
                                    icon={<FaCopy />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopy}
                                />
                            </Tooltip>
                        </Flex>
                        <Box mt={3}>
                            <Text fontSize="sm" fontWeight="medium">
                                Calculation Steps:
                            </Text>
                            {result.steps.map((step, index) => (
                                <Text key={index} fontSize="sm" color={stepText} mt={1} fontFamily="monospace">
                                    {step}
                                </Text>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Overview */}
                <Box p={4} bg={overviewBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
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
    );
}
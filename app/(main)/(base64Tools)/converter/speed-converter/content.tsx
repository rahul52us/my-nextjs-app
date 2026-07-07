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

const speedUnits = [
    { label: "Meters per Second (m/s)", value: "m/s", factor: 1 },
    { label: "Kilometers per Hour (km/h)", value: "km/h", factor: 0.277778 },
    { label: "Miles per Hour (mph)", value: "mph", factor: 0.44704 },
    { label: "Feet per Second (ft/s)", value: "ft/s", factor: 0.3048 },
    { label: "Knots (kn)", value: "kn", factor: 0.514444 },
];

const convertSpeed = (value: number, fromUnit: string, toUnit: string): number => {
    const fromFactor = speedUnits.find((u) => u.value === fromUnit)?.factor || 1;
    const toFactor = speedUnits.find((u) => u.value === toUnit)?.factor || 1;
    return (value * fromFactor) / toFactor;
};

export default function SpeedConverterContent() {
    const [fromUnit, setFromUnit] = useState("m/s");
    const [toUnit, setToUnit] = useState("km/h");
    const [value, setValue] = useState("");
    const [precision, setPrecision] = useState<number>(2);
    const [result, setResult] = useState<{ value: string; steps: string[] } | null>(null);
    const [error, setError] = useState("");
    const toast = useToast();

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

    // Dark mode aware color tokens
    const cardBg = useColorModeValue("white", "gray.700");
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const mutedText = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("blue.500", "blue.300");
    const resultBg = useColorModeValue("blue.50", "blue.900");
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
                const convertedValue = convertSpeed(parsedValue, fromUnit, toUnit);
                const displayValue = convertedValue.toFixed(precision);

                const fromFactor = speedUnits.find((u) => u.value === fromUnit)?.factor || 1;
                const toFactor = speedUnits.find((u) => u.value === toUnit)?.factor || 1;
                const steps = [
                    `1. Convert to m/s: ${parsedValue} ${fromUnit} × ${fromFactor} = ${(parsedValue * fromFactor).toFixed(4)} m/s`,
                    `2. Convert to ${toUnit}: ${(parsedValue * fromFactor).toFixed(4)} m/s ÷ ${toFactor} = ${convertedValue.toFixed(precision)} ${toUnit}`,
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
        <Box maxW="1200px" mx="auto" p={{ base: 4, md: 6 }} w="100%" bg={pageBg}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Heading as="h1" size="xl" color={headingColor} textAlign="center">
                    Speed Converter
                </Heading>
                <Text textAlign="center" fontSize="md" color={mutedText} maxW="600px" mx="auto">
                    Convert speed units instantly with detailed steps and history.
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
                            {speedUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
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
                            {speedUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </Select>
                    </Box>
                </Grid>

                <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
                    <Input
                        placeholder="Enter speed (e.g., 100)"
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
                        Speed Units Overview:
                    </Text>
                    <VStack align="start" spacing={2}>
                        <Text><strong>m/s:</strong> Meters per second, base SI unit.</Text>
                        <Text><strong>km/h:</strong> Kilometers per hour, 1 km/h = 0.277778 m/s.</Text>
                        <Text><strong>mph:</strong> Miles per hour, 1 mph = 0.44704 m/s.</Text>
                        <Text><strong>ft/s:</strong> Feet per second, 1 ft/s = 0.3048 m/s.</Text>
                        <Text><strong>kn:</strong> Knots, 1 kn = 0.514444 m/s (used in aviation/nautical).</Text>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
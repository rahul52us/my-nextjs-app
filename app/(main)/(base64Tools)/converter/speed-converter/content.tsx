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
    Switch,
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
import stores from "../../../../store/stores";

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
    const [humanReadable, setHumanReadable] = useState<boolean>(false);
    const [history, setHistory] = useState<string[]>([]);
    const [error, setError] = useState("");
    const toast = useToast();

    // ✅ All colors now respond to color mode
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const cardBg = useColorModeValue("white", "gray.800");
    const subtitleColor = useColorModeValue("gray.600", "gray.400");
    const labelColor = useColorModeValue("teal.600", "teal.300");
    const inputBg = useColorModeValue("white", "gray.700");
    const inputBorderColor = useColorModeValue("gray.200", "gray.600");
    const inputHoverBorder = useColorModeValue("teal.300", "teal.400");
    const inputTextColor = useColorModeValue("gray.800", "gray.100");
    const placeholderColor = useColorModeValue("gray.400", "gray.500");

    // Result box
    const resultBg = useColorModeValue("teal.50", "teal.900");
    const resultBorder = useColorModeValue("teal.200", "teal.700");
    const resultHeadingColor = useColorModeValue("teal.800", "teal.100");
    const resultValueColor = useColorModeValue("teal.900", "white");
    const resultStepLabelColor = useColorModeValue("teal.700", "teal.300");
    const resultStepTextColor = useColorModeValue("gray.600", "gray.300");

    // History box
    const historyBg = useColorModeValue("gray.50", "gray.700");
    const historyBorder = useColorModeValue("gray.200", "gray.600");
    const historyItemBg = useColorModeValue("white", "gray.600");
    const historyItemHoverBg = useColorModeValue("gray.100", "gray.500");
    const historyTextColor = useColorModeValue("gray.600", "gray.200");
    const historyLabelColor = useColorModeValue("teal.700", "teal.300");

    // Overview box
    const overviewBg = useColorModeValue("blue.50", "blue.900");
    const overviewHeadingColor = useColorModeValue("blue.700", "blue.200");
    const overviewTextColor = useColorModeValue("gray.700", "gray.200");

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr" });

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
                let displayValue = convertedValue.toFixed(precision);

                if (humanReadable && convertedValue >= 1000) {
                    const suffixes = ["", "k", "M"];
                    let index = 0;
                    let adjustedValue = convertedValue;
                    while (adjustedValue >= 1000 && index < suffixes.length - 1) {
                        adjustedValue /= 1000;
                        index++;
                    }
                    displayValue = `${adjustedValue.toFixed(2)} ${suffixes[index]}${toUnit.split("/")[0]}/s`;
                }

                const fromFactor = speedUnits.find((u) => u.value === fromUnit)?.factor || 1;
                const toFactor = speedUnits.find((u) => u.value === toUnit)?.factor || 1;
                const steps = [
                    `1. Convert to m/s: ${parsedValue} ${fromUnit} × ${fromFactor} = ${(parsedValue * fromFactor).toFixed(4)} m/s`,
                    `2. Convert to ${toUnit}: ${(parsedValue * fromFactor).toFixed(4)} m/s ÷ ${toFactor} = ${convertedValue.toFixed(precision)} ${toUnit}`,
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

    const {
        themeStore: { themeConfig },
    } = stores;

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
                    <Heading as="h1" size="xl" color={themeConfig.colors.brand[300]} textAlign="center">
                        Speed Converter
                    </Heading>
                    <Text textAlign="center" fontSize="md" color={subtitleColor} maxW="600px" mx="auto">
                        Convert speed units instantly with detailed steps and history.
                    </Text>

                    {/* Input Section */}
                    <Grid templateColumns={responsiveGridColumns} gap={6}>
                        <FormControl>
                            <FormLabel fontWeight="bold" color={labelColor}>From Unit</FormLabel>
                            <Select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                bg={inputBg}
                                color={inputTextColor}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                borderRadius="md"
                                _hover={{ borderColor: inputHoverBorder }}
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                transition="all 0.2s ease"
                            >
                                {speedUnits.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontWeight="bold" color={labelColor}>To Unit</FormLabel>
                            <Select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                bg={inputBg}
                                color={inputTextColor}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                borderRadius="md"
                                _hover={{ borderColor: inputHoverBorder }}
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                transition="all 0.2s ease"
                            >
                                {speedUnits.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
                        <Input
                            placeholder="Enter speed (e.g., 100)"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            bg={inputBg}
                            color={inputTextColor}
                            _placeholder={{ color: placeholderColor }}
                            border="2px solid"
                            borderColor={inputBorderColor}
                            borderRadius="md"
                            _hover={{ borderColor: inputHoverBorder }}
                            _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                            transition="all 0.2s ease"
                            flex="1"
                            py={6}
                        />
                        <HStack spacing={3}>
                            <Text fontSize="sm" color={subtitleColor} whiteSpace="nowrap">
                                Precision:
                            </Text>
                            <Input
                                type="number"
                                value={precision}
                                onChange={(e) => setPrecision(Math.max(0, Math.min(10, Number(e.target.value))))}
                                min={0}
                                max={10}
                                w="80px"
                                bg={inputBg}
                                color={inputTextColor}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                _hover={{ borderColor: inputHoverBorder }}
                                _focus={{ borderColor: "teal.400" }}
                                transition="all 0.2s ease"
                            />
                        </HStack>
                    </Flex>

                    <Flex align="center" justify="center" gap={4}>
                        <Switch
                            id="human-readable"
                            isChecked={humanReadable}
                            onChange={(e) => setHumanReadable(e.target.checked)}
                            colorScheme="teal"
                            display="none"
                        />
                        <Text display="none" fontSize="sm" color={subtitleColor}>Human-Readable Format</Text>
                        <Tooltip label="Swap Units" placement="top">
                            <IconButton
                                aria-label="Swap units"
                                icon={<FaExchangeAlt />}
                                size="md"
                                colorScheme="teal"
                                variant="outline"
                                onClick={handleSwap}
                                borderRadius="full"
                                bg={inputBg}
                                _hover={{ bg: useColorModeValue("teal.50", "teal.800") }}
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
                                bg={resultBg}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={resultBorder}
                                boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                            >
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize={{ base: "lg", md: "xl" }} color={resultHeadingColor} fontWeight="semibold">
                                            {value} {fromUnit} ={" "}
                                            <Text as="span" fontWeight="bold" color={resultValueColor}>
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
                                                _hover={{ bg: useColorModeValue("teal.100", "teal.800") }}
                                            />
                                        </Tooltip>
                                    </Flex>
                                    <Box>
                                        <Text fontSize="sm" color={resultStepLabelColor} fontWeight="medium">
                                            Calculation Steps:
                                        </Text>
                                        {result.steps.map((step, index) => (
                                            <Text key={index} fontSize="sm" color={resultStepTextColor} mt={1} fontFamily="monospace">
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
                            <Text fontSize="sm" color={historyLabelColor} fontWeight="medium" mb={2} textAlign="center">
                                Recent Conversions:
                            </Text>
                            <VStack
                                align="stretch"
                                spacing={2}
                                p={4}
                                bg={historyBg}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={historyBorder}
                            >
                                {history.map((entry, index) => (
                                    <Text
                                        key={index}
                                        fontSize="sm"
                                        color={historyTextColor}
                                        p={2}
                                        bg={historyItemBg}
                                        borderRadius="md"
                                        _hover={{ bg: historyItemHoverBg }}
                                    >
                                        {entry}
                                    </Text>
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {/* Overview */}
                    <Box mt={6} p={4} bg={overviewBg} borderRadius="lg" shadow="md">
                        <Text fontSize="lg" fontWeight="bold" color={overviewHeadingColor} mb={2}>
                            Speed Units Overview:
                        </Text>
                        <VStack align="start" spacing={2}>
                            <Text color={overviewTextColor}><strong>m/s:</strong> Meters per second, base SI unit.</Text>
                            <Text color={overviewTextColor}><strong>km/h:</strong> Kilometers per hour, 1 km/h = 0.277778 m/s.</Text>
                            <Text color={overviewTextColor}><strong>mph:</strong> Miles per hour, 1 mph = 0.44704 m/s.</Text>
                            <Text color={overviewTextColor}><strong>ft/s:</strong> Feet per second, 1 ft/s = 0.3048 m/s.</Text>
                            <Text color={overviewTextColor}><strong>kn:</strong> Knots, 1 kn = 0.514444 m/s (used in aviation/nautical).</Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Flex>
    );
}
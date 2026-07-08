"use client";
import React, { useState, useEffect } from "react";
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
    useColorModeValue,
    HStack,
} from "@chakra-ui/react";
import { FaDatabase, FaCopy, FaExchangeAlt } from "react-icons/fa";
import debounce from "lodash.debounce";

const units = [
    { group: "Bits", label: "Bits (b)", value: "b", factor: 1 / 8 },
    { group: "Bits", label: "Kilobits (Kb)", value: "Kb", factor: 1024 / 8 },
    { group: "Bits", label: "Megabits (Mb)", value: "Mb", factor: 1024 ** 2 / 8 },
    { group: "Bits", label: "Gigabits (Gb)", value: "Gb", factor: 1024 ** 3 / 8 },
    { group: "Bytes", label: "Bytes (B)", value: "B", factor: 1 },
    { group: "Bytes", label: "Kilobytes (KB)", value: "KB", factor: 1024 },
    { group: "Bytes", label: "Megabytes (MB)", value: "MB", factor: 1024 ** 2 },
    { group: "Bytes", label: "Gigabytes (GB)", value: "GB", factor: 1024 ** 3 },
    { group: "Bytes", label: "Terabytes (TB)", value: "TB", factor: 1024 ** 4 },
    { group: "Bytes", label: "Petabytes (PB)", value: "PB", factor: 1024 ** 5 },
];

const DataSizeConverterContent = () => {
    const [inputValue, setInputValue] = useState<string>("");
    const [fromUnit, setFromUnit] = useState<string>("B");
    const [toUnit, setToUnit] = useState<string>("MB");
    const [precision, setPrecision] = useState<number>(6);
    const [result, setResult] = useState<{
        value: string;
        bytes: number;
        steps: string[];
    } | null>(null);
    const toast = useToast();

    // Dark mode aware color tokens
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const mutedText = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("brand.500", "brand.300");
    const iconColor = useColorModeValue("brand.500", "brand.300");
    const resultBg = useColorModeValue("brand.50", "brand.900");
    const stepText = useColorModeValue("gray.600", "gray.300");

    const convert = debounce(() => {
        if (!inputValue || isNaN(Number(inputValue))) {
            setResult(null);
            return;
        }

        const value = parseFloat(inputValue);
        const fromFactor = units.find((u) => u.value === fromUnit)?.factor || 1;
        const toFactor = units.find((u) => u.value === toUnit)?.factor || 1;

        const bytes = value * fromFactor;
        const convertedValue = bytes / toFactor;
        const displayValue = convertedValue.toFixed(precision);

        const steps = [
            `1. Convert to Bytes: ${value} ${fromUnit} × ${fromFactor} = ${bytes} Bytes`,
            `2. Convert to ${toUnit}: ${bytes} Bytes ÷ ${toFactor} = ${convertedValue.toFixed(precision)} ${toUnit}`,
        ];
        setResult({ value: displayValue, bytes, steps });
    }, 300);

    useEffect(() => {
        convert();
        return () => convert.cancel();
    }, [inputValue, fromUnit, toUnit, precision]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(`${result.value} ${toUnit}`);
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
                <Flex align="center" justify="center" gap={3}>
                    <FaDatabase size={28} color={iconColor} />
                    <Heading size="xl" color={headingColor} textAlign="center">
                        Data Size Converter
                    </Heading>
                </Flex>
                <Text textAlign="center" fontSize="md" color={mutedText} maxW="600px" mx="auto">
                    Convert data sizes instantly with detailed steps.
                </Text>

                {/* Input Section */}
                <VStack spacing={6} w="100%">
                    <Flex direction={{ base: "column", md: "row" }} w="100%" gap={4} align="center">
                        <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter value (e.g., 1024)"
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            flex="1"
                        />
                        <Select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            w={{ base: "100%", md: "30%" }}
                        >
                            {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </Select>
                    </Flex>

                    <Flex align="center" justify="center" gap={4}>
                        <Text fontSize="md" color={mutedText} fontWeight="bold" textTransform="uppercase">
                            to
                        </Text>
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

                    <Flex direction={{ base: "column", md: "row" }} w="100%" gap={4} align="center">
                        <Select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            w={{ base: "100%", md: "30%" }}
                            flex="1"
                        >
                            {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </Select>
                        <HStack spacing={3} w={{ base: "100%", md: "auto" }}>
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
                </VStack>

                {/* Result */}
                {result && (
                    <Box p={{ base: 4, md: 6 }} bg={resultBg} borderRadius="md" w="100%">
                        <Flex justify="space-between" align="center">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
                                {inputValue} {fromUnit} ={" "}
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
            </VStack>
        </Box>
    );
};

export default DataSizeConverterContent;
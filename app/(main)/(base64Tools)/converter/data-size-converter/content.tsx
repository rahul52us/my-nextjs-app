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
    Fade,
    IconButton,
    Tooltip,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaDatabase, FaCopy, FaExchangeAlt } from "react-icons/fa";
import debounce from "lodash.debounce";
import stores from "../../../../store/stores";

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
    const [humanReadable] = useState<boolean>(false);
    const toast = useToast();

    const { themeStore: { themeConfig } } = stores;

    // ✅ All colors dark-mode aware
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const subtitleColor = useColorModeValue("gray.600", "gray.400");
    const toTextColor = useColorModeValue("teal.600", "teal.300");

    const inputBg = useColorModeValue("white", "gray.700");
    const inputTextColor = useColorModeValue("gray.800", "gray.100");
    const inputBorderColor = useColorModeValue("gray.200", "gray.600");
    const inputHoverBorder = useColorModeValue("teal.300", "teal.400");
    const placeholderColor = useColorModeValue("gray.400", "gray.500");

    const swapBg = useColorModeValue("white", "gray.700");
    const swapHoverBg = useColorModeValue("teal.50", "teal.800");

    const precisionLabelColor = useColorModeValue("gray.600", "gray.400");

    // Result box
    const resultBg = useColorModeValue("teal.50", "teal.900");
    const resultBorder = useColorModeValue("teal.200", "teal.700");
    const resultHeadingColor = useColorModeValue("teal.800", "teal.100");
    const resultValueColor = useColorModeValue("teal.900", "white");
    const resultStepLabelColor = useColorModeValue("teal.700", "teal.300");
    const resultStepTextColor = useColorModeValue("gray.600", "gray.300");
    const copyHoverBg = useColorModeValue("teal.100", "teal.800");

    const convert = debounce(() => {
        if (!inputValue || isNaN(Number(inputValue))) {
            setResult(null);
            return;
        }

        const value = parseFloat(inputValue);
        const fromFactor = units.find((u) => u.value === fromUnit)?.factor || 1;
        const toFactor = units.find((u) => u.value === toUnit)?.factor || 1;

        const bytes = value * fromFactor;
        let convertedValue = bytes / toFactor;

        let displayValue = convertedValue.toFixed(precision);
        if (humanReadable && convertedValue >= 1024) {
            const sizes = ["", "K", "M", "G", "T", "P"];
            let index = 0;
            while (convertedValue >= 1024 && index < sizes.length - 1) {
                convertedValue /= 1024;
                index++;
            }
            displayValue = `${convertedValue.toFixed(2)} ${sizes[index]}${toUnit[0]}`;
        }

        const steps = [
            `1. Convert to Bytes: ${value} ${fromUnit} × ${fromFactor} = ${bytes} Bytes`,
            `2. Convert to ${toUnit}: ${bytes} Bytes ÷ ${toFactor} = ${convertedValue.toFixed(precision)} ${toUnit}`,
        ];
        setResult({ value: displayValue, bytes, steps });
    }, 300);

    useEffect(() => {
        convert();
        return () => convert.cancel();
    }, [inputValue, fromUnit, toUnit, precision, humanReadable]);

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
        <Flex
            minH="100vh"
            bg={pageBg}
            p={{ base: 4, md: 2 }}
            w="100%"
            justify="center"
        >
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
                <VStack spacing={{ base: 6, md: 4 }} align="stretch" w="100%">

                    {/* Header */}
                    <Flex align="center" justify="center" gap={4} mb={2}>
                        <FaDatabase size={32} color="teal" />
                        <Heading
                            size={{ base: "lg", md: "xl" }}
                            color={themeConfig.colors.brand[300]}
                            fontWeight="extrabold"
                            textShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                        >
                            Data Size Converter
                        </Heading>
                    </Flex>
                    <Text
                        textAlign="center"
                        color={subtitleColor}
                        fontSize={{ base: "sm", md: "md" }}
                        maxW="600px"
                        mx="auto"
                    >
                        Convert data sizes instantly with detailed steps and history.
                    </Text>

                    {/* Input Section */}
                    <VStack spacing={6} w="100%">
                        <Flex
                            direction={{ base: "column", md: "row" }}
                            w="100%"
                            gap={{ base: 4, md: 4 }}
                            align="center"
                        >
                            <Input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter value (e.g., 1024)"
                                size="lg"
                                bg={inputBg}
                                color={inputTextColor}
                                _placeholder={{ color: placeholderColor }}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                borderRadius="md"
                                px={4}
                                py={6}
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                _hover={{ borderColor: inputHoverBorder }}
                                transition="all 0.2s ease"
                                fontSize="md"
                                fontWeight="medium"
                                step="any"
                                flex="1"
                            />
                            <Select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                size="lg"
                                bg={inputBg}
                                color={inputTextColor}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                borderRadius="md"
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                _hover={{ borderColor: inputHoverBorder }}
                                transition="all 0.2s ease"
                                fontSize="md"
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
                            <Text
                                fontSize={{ base: "lg", md: "xl" }}
                                color={toTextColor}
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="wide"
                            >
                                to
                            </Text>
                            <Tooltip label="Swap Units" placement="top">
                                <IconButton
                                    aria-label="Swap units"
                                    icon={<FaExchangeAlt />}
                                    size="md"
                                    colorScheme="teal"
                                    variant="outline"
                                    onClick={handleSwap}
                                    borderRadius="full"
                                    bg={swapBg}
                                    _hover={{ bg: swapHoverBg }}
                                />
                            </Tooltip>
                        </Flex>

                        <Flex
                            direction={{ base: "column", md: "row" }}
                            w="100%"
                            gap={{ base: 4, md: 4 }}
                            align="center"
                        >
                            <Select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                size="lg"
                                bg={inputBg}
                                color={inputTextColor}
                                border="2px solid"
                                borderColor={inputBorderColor}
                                borderRadius="md"
                                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)" }}
                                _hover={{ borderColor: inputHoverBorder }}
                                transition="all 0.2s ease"
                                fontSize="md"
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
                                <Text fontSize="sm" color={precisionLabelColor} whiteSpace="nowrap">
                                    Precision:
                                </Text>
                                <Input
                                    type="number"
                                    value={precision}
                                    onChange={(e) =>
                                        setPrecision(Math.max(0, Math.min(10, Number(e.target.value))))
                                    }
                                    min={0}
                                    max={10}
                                    w="80px"
                                    size="md"
                                    bg={inputBg}
                                    color={inputTextColor}
                                    border="2px solid"
                                    borderColor={inputBorderColor}
                                    _focus={{ borderColor: "teal.400" }}
                                    _hover={{ borderColor: inputHoverBorder }}
                                    transition="all 0.2s ease"
                                />
                            </HStack>
                        </Flex>
                    </VStack>

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
                                w="100%"
                            >
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text
                                            fontSize={{ base: "lg", md: "xl" }}
                                            color={resultHeadingColor}
                                            fontWeight="semibold"
                                        >
                                            {inputValue} {fromUnit} ={" "}
                                            <Text as="span" fontWeight="bold" color={resultValueColor}>
                                                {result.value} {toUnit}
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
                                                _hover={{ bg: copyHoverBg }}
                                            />
                                        </Tooltip>
                                    </Flex>
                                    <Box>
                                        <Text fontSize="sm" color={resultStepLabelColor} fontWeight="medium">
                                            Calculation Steps:
                                        </Text>
                                        {result.steps.map((step, index) => (
                                            <Text
                                                key={index}
                                                fontSize="sm"
                                                color={resultStepTextColor}
                                                mt={1}
                                                fontFamily="monospace"
                                            >
                                                {step}
                                            </Text>
                                        ))}
                                    </Box>
                                </VStack>
                            </Box>
                        </Fade>
                    )}

                </VStack>
            </Box>
        </Flex>
    );
};

export default DataSizeConverterContent;
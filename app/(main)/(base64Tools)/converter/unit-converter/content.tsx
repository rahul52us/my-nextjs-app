"use client";
import { useState, useEffect, useCallback } from "react";
import {
    Select,
    Input,
    Text,
    Divider,
    Box,
    Alert,
    AlertIcon,
    Grid,
    useBreakpointValue,
    Heading,
    useColorModeValue,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import { performConversion, ConversionCategory, unitConversionMap } from "./conversionLogic";
import stores from "../../../../store/stores";

export default function UnitConverterContent() {
    const [type, setType] = useState<ConversionCategory>("Weight");
    const [fromUnit, setFromUnit] = useState("");
    const [toUnit, setToUnit] = useState("");
    const [value, setValue] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    // ✅ All colors via useColorModeValue — dark + light dono sahi
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorderColor = useColorModeValue("gray.200", "gray.600");

    const selectBg = useColorModeValue("white", "gray.700");
    const selectColor = useColorModeValue("gray.800", "gray.100");
    const selectBorderColor = useColorModeValue("gray.300", "gray.500");
    const selectHoverBorderColor = useColorModeValue("blue.400", "blue.300");
    const selectFocusBorderColor = useColorModeValue("blue.500", "blue.300");

    const inputBg = useColorModeValue("white", "gray.700");
    const inputColor = useColorModeValue("gray.800", "gray.100");
    const inputBorderColor = useColorModeValue("gray.300", "gray.500");
    const placeholderColor = useColorModeValue("gray.400", "gray.400");

    const resultBg = useColorModeValue("blue.50", "blue.900");
    const resultBorderColor = useColorModeValue("blue.200", "blue.600");
    const resultTextColor = useColorModeValue("blue.800", "blue.100");

    const labelColor = useColorModeValue("gray.700", "gray.200");

    const {
        themeStore: { themeConfig },
    } = stores;

    const handleConversion = useCallback(() => {
        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || value.trim() === "") {
            setResult("");
            setError("Please enter a valid number.");
            return;
        }

        try {
            const convertedValue = performConversion(type, fromUnit, toUnit, numericValue);
            setResult(convertedValue.toFixed(4));
            setError("");
        } catch {
            setError("Invalid conversion options.");
            setResult("");
        }
    }, [type, fromUnit, toUnit, value]);

    useEffect(() => {
        handleConversion();
    }, [type, fromUnit, toUnit, value, handleConversion]);

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr 1fr" });

    return (
        <Box p={{ base: 4, md: 6 }} bg={bgColor} color={textColor} minH="78vh">
            {/* Header */}
            <Heading
                as="h1"
                size="xl"
                color={themeConfig.colors.brand[300]}
                textAlign="center"
                mb={2}
            >
                Unit Converter
            </Heading>
            <Divider borderColor={useColorModeValue("blue.300", "blue.500")} mb={6} />

            {/* Dropdowns Grid */}
            <Grid templateColumns={responsiveGridColumns} gap={4} mb={4}>
                {/* Category */}
                <Box
                    p={4}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorderColor}
                    borderRadius="lg"
                    boxShadow="sm"
                    _hover={{ boxShadow: "md" }}
                    transition="all 0.2s ease-in-out"
                >
                    <FormControl>
                        <FormLabel
                            fontWeight="600"
                            fontSize="sm"
                            color={labelColor}
                            mb={2}
                        >
                            Category
                        </FormLabel>
                        <Select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as ConversionCategory);
                                setFromUnit("");
                                setToUnit("");
                            }}
                            placeholder="Select category"
                            bg={selectBg}
                            color={selectColor}
                            border="1px solid"
                            borderColor={selectBorderColor}
                            _hover={{ borderColor: selectHoverBorderColor }}
                            _focus={{ borderColor: selectFocusBorderColor, boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
                            iconColor={selectColor}
                        >
                            {Object.keys(unitConversionMap).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* From Unit */}
                <Box
                    p={4}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorderColor}
                    borderRadius="lg"
                    boxShadow="sm"
                    _hover={{ boxShadow: "md" }}
                    transition="all 0.2s ease-in-out"
                >
                    <FormControl>
                        <FormLabel
                            fontWeight="600"
                            fontSize="sm"
                            color={labelColor}
                            mb={2}
                        >
                            From Unit
                        </FormLabel>
                        <Select
                            value={fromUnit}
                            onChange={(e) => {
                                setFromUnit(e.target.value);
                                setToUnit("");
                            }}
                            placeholder="Select starting unit"
                            bg={selectBg}
                            color={selectColor}
                            border="1px solid"
                            borderColor={selectBorderColor}
                            _hover={{ borderColor: selectHoverBorderColor }}
                            _focus={{ borderColor: selectFocusBorderColor, boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
                            iconColor={selectColor}
                        >
                            {Object.keys(unitConversionMap[type] || {}).map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* To Unit */}
                <Box
                    p={4}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorderColor}
                    borderRadius="lg"
                    boxShadow="sm"
                    _hover={{ boxShadow: "md" }}
                    transition="all 0.2s ease-in-out"
                >
                    <FormControl>
                        <FormLabel
                            fontWeight="600"
                            fontSize="sm"
                            color={labelColor}
                            mb={2}
                        >
                            To Unit
                        </FormLabel>
                        <Select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            placeholder="Select target unit"
                            bg={selectBg}
                            color={selectColor}
                            border="1px solid"
                            borderColor={selectBorderColor}
                            _hover={{ borderColor: selectHoverBorderColor }}
                            _focus={{ borderColor: selectFocusBorderColor, boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
                            iconColor={selectColor}
                        >
                            {Object.keys(unitConversionMap[type]?.[fromUnit] || {}).map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Grid>

            {/* Value Input */}
            <Input
                placeholder="Enter value to convert"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                bg={inputBg}
                color={inputColor}
                border="1px solid"
                borderColor={inputBorderColor}
                _hover={{ borderColor: selectHoverBorderColor }}
                _focus={{ borderColor: selectFocusBorderColor, boxShadow: "outline" }}
                _placeholder={{ color: placeholderColor }}
                transition="all 0.2s ease-in-out"
                borderRadius="lg"
                size="md"
                mb={2}
            />

            {/* Error Alert */}
            {error && value?.length > 0 && (
                <Alert status="error" borderRadius="lg" mt={1} mb={2}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {/* Result Box */}
            <Box
                mt={4}
                p={5}
                bg={resultBg}
                border="1px solid"
                borderColor={resultBorderColor}
                borderRadius="lg"
                boxShadow="sm"
            >
                <Text
                    fontSize="xs"
                    fontWeight="600"
                    color={resultTextColor}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={1}
                    opacity={0.7}
                >
                    Converted Value
                </Text>
                <Text
                    fontSize="2xl"
                    fontWeight="700"
                    color={resultTextColor}
                    textAlign="center"
                >
                    {result
                        ? `${result} ${toUnit}`
                        : "---"}
                </Text>
            </Box>
        </Box>
    );
}
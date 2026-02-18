"use client";
import { useState, useEffect, useCallback } from "react";
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
import { performConversion, ConversionCategory, unitConversionMap } from "./conversionLogic";

export default function UnitConverterContent() {
    const [type, setType] = useState<ConversionCategory>("Weight");
    const [fromUnit, setFromUnit] = useState("");
    const [toUnit, setToUnit] = useState("");
    const [value, setValue] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    const bgColor = useColorModeValue("gray.100", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");

    const handleConversion = useCallback(() => {
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
    }, [type, fromUnit, toUnit, value]);

    useEffect(() => {
        handleConversion();
    }, [type, fromUnit, toUnit, value, handleConversion]);

    const responsiveGridColumns = useBreakpointValue({ base: "1fr", md: "1fr 1fr 1fr" });

    return (
        <Box p={4} bg={bgColor} color={textColor} minH="78vh">
            <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
                Unit Converter
            </Heading>
            <Divider borderColor="blue.300" mb={6} />

            {/* Dropdown Section */}
            <Grid templateColumns={responsiveGridColumns} gap={6}>
                {/* Category Dropdown */}
                <Box
                    p={4}
                    shadow="md"
                    bg="gray.50"
                    borderRadius="md"
                    _hover={{ boxShadow: "lg" }}
                    transition="all 0.2s ease-in-out"
                >
                    <FormControl>
                        <FormLabel fontWeight="bold">Category</FormLabel>
                        <Select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as ConversionCategory);
                                setFromUnit("");
                                setToUnit("");
                            }}
                            placeholder="Select category"
                            bg="white"
                            border="1px"
                            borderColor="gray.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
                        >
                            {Object.keys(unitConversionMap).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

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
                            onChange={(e) => {
                                setFromUnit(e.target.value);
                                setToUnit("");
                            }}
                            placeholder="Select starting unit"
                            bg="white"
                            border="1px"
                            borderColor="gray.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
                        >
                            {Object.keys(unitConversionMap[type] || {}).map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
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
                            placeholder="Select target unit"
                            bg="white"
                            border="1px"
                            borderColor="gray.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                            transition="all 0.2s ease-in-out"
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

            {/* Input for Value */}
            <Input
                placeholder="Enter value to convert"
                type="number"
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
                    Converted Value: {result || "---"}
                </Text>
            </Box>
        </Box>
    );
}

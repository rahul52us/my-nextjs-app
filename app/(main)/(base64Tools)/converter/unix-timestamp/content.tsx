"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  HStack,
  Stack,
} from "@chakra-ui/react";
import { FaClock, FaTrashAlt, FaCopy, FaCalendarAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../store/stores";

const formatDate = (date: Date) => date.toLocaleString();

const UnixTimestampContent: React.FC = () => {
  const [timestampInput, setTimestampInput] = useState<string>("");
  const [dateTimeInput, setDateTimeInput] = useState<string>("");
  const [timestampResult, setTimestampResult] = useState<string>("");
  const [dateResult, setDateResult] = useState<string>("");
  const [unixSeconds, setUnixSeconds] = useState<string>("");
  const [unixMilliseconds, setUnixMilliseconds] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const parseTimestamp = (value: string) => {
    const clean = value.trim();
    if (!clean) throw new Error("Please enter a valid Unix timestamp.");
    const num = Number(clean);
    if (Number.isNaN(num)) throw new Error("Timestamp must be numeric.");
    const millis = clean.length >= 13 || num > 1e12 ? num : num * 1000;
    const date = new Date(millis);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid timestamp value.");
    return date;
  };

  const convertFromTimestamp = () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const date = parseTimestamp(timestampInput);
      setTimestampResult(date.toISOString());
      setDateResult(formatDate(date));
      const ms = date.getTime();
      setUnixMilliseconds(ms.toString());
      setUnixSeconds(Math.floor(ms / 1000).toString());
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to convert timestamp.");
    } finally {
      setLoading(false);
    }
  };

  const convertFromDateTime = () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const date = new Date(dateTimeInput.trim());
      if (Number.isNaN(date.getTime())) throw new Error("Enter a valid date/time string.");
      setDateResult(date.toISOString());
      setTimestampResult(formatDate(date));
      const ms = date.getTime();
      setUnixMilliseconds(ms.toString());
      setUnixSeconds(Math.floor(ms / 1000).toString());
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to convert date/time.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTimestampInput("");
    setDateTimeInput("");
    setTimestampResult("");
    setDateResult("");
    setUnixSeconds("");
    setUnixMilliseconds("");
    setErrorMessage("");
  };

  const handleCopy = (value: string, label: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(
      () => {
        toast({
          title: `${label} copied!`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      () => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    );
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Timestamp Input: ${timestampInput}\nDate/Time Input: ${dateTimeInput}\n\nISO Date: ${timestampResult}\nLocal Date: ${dateResult}\nUnix Seconds: ${unixSeconds}\nUnix Milliseconds: ${unixMilliseconds}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    saveAs(blob, "unix-timestamp-conversion.txt");
  };

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading
        as="h1"
        size="xl"
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        lineHeight="short"
        mb={6}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
        textTransform="uppercase"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        Unix Timestamp Converter
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Convert from Unix Timestamp
          </FormLabel>
          <Input
            placeholder="Enter timestamp in seconds or milliseconds"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Convert from Date / Time
          </FormLabel>
          <Input
            placeholder="Enter a date/time string (e.g. 2025-12-31 23:59:59)"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            bg={useColorModeValue("white", "gray.700")}
            _focus={{ borderColor: "teal.500" }}
          />
        </FormControl>

        <Stack spacing={4} direction={["column", "row"]} justify="space-between">
          <Button colorScheme="teal" size="lg" leftIcon={<Icon as={FaClock} />} onClick={convertFromTimestamp}>
            Convert Timestamp
          </Button>
          <Button colorScheme="blue" size="lg" leftIcon={<Icon as={FaCalendarAlt} />} onClick={convertFromDateTime}>
            Convert Date/Time
          </Button>
          <Button colorScheme="red" size="lg" leftIcon={<Icon as={FaTrashAlt} />} onClick={handleClear}>
            Clear
          </Button>
        </Stack>

        {loading && (
          <Flex justify="center">
            <Text>Converting…</Text>
          </Flex>
        )}

        {errorMessage && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text color="red.600" fontWeight="semibold">
              {errorMessage}
            </Text>
          </Box>
        )}

        <Divider borderColor="teal.500" />

        <VStack spacing={4} align="stretch">
          <Box p={4} bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md">
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Conversion Result
            </Text>
            <Text mb={2}>ISO Date: {timestampResult || "-"}</Text>
            <Text mb={2}>Local Date: {dateResult || "-"}</Text>
            <Text mb={2}>Unix Seconds: {unixSeconds || "-"}</Text>
            <Text>Unix Milliseconds: {unixMilliseconds || "-"}</Text>
          </Box>

          <HStack spacing={4} justify="flex-start">
            <Button
              colorScheme="blue"
              size="md"
              leftIcon={<Icon as={FaCopy} />}
              onClick={() => handleCopy(`ISO Date: ${timestampResult}\nLocal Date: ${dateResult}\nUnix Seconds: ${unixSeconds}\nUnix Milliseconds: ${unixMilliseconds}`, "Conversion result")}
              isDisabled={!timestampResult && !dateResult}
            >
              Copy Result
            </Button>
            <Button colorScheme="green" size="md" onClick={handleDownload} isDisabled={!timestampResult && !dateResult}>
              Download Result
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default UnixTimestampContent;

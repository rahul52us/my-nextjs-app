"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Select,
  SimpleGrid,
  Divider,
  useColorModeValue,
  useColorMode,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiDollarSign,
} from "react-icons/fi";
import { MdSwapHoriz } from "react-icons/md";

// ── Popular currencies ──────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", name: "US Dollar",         flag: "🇺🇸" },
  { code: "EUR", name: "Euro",              flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",     flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen",      flag: "🇯🇵" },
  { code: "INR", name: "Indian Rupee",      flag: "🇮🇳" },
  { code: "CAD", name: "Canadian Dollar",   flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc",       flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan",      flag: "🇨🇳" },
  { code: "SGD", name: "Singapore Dollar",  flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham",        flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal",       flag: "🇸🇦" },
  { code: "HKD", name: "Hong Kong Dollar",  flag: "🇭🇰" },
  { code: "NZD", name: "New Zealand Dollar",flag: "🇳🇿" },
  { code: "MXN", name: "Mexican Peso",      flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real",    flag: "🇧🇷" },
  { code: "ZAR", name: "South African Rand",flag: "🇿🇦" },
  { code: "TRY", name: "Turkish Lira",      flag: "🇹🇷" },
  { code: "RUB", name: "Russian Ruble",     flag: "🇷🇺" },
  { code: "KRW", name: "South Korean Won",  flag: "🇰🇷" },
];

const QUICK_AMOUNTS = [1, 10, 100, 500, 1000, 5000];

interface RateData {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

const CurrencyConverterContent: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [amount, setAmount]           = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency]   = useState("INR");
  const [rateData, setRateData]       = useState<RateData | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── Theme tokens ───────────────────────────────────────────────
  const pageBg        = useColorModeValue("gray.50",   "gray.950");
  const cardBg        = useColorModeValue("white",     "gray.900");
  const borderColor   = useColorModeValue("gray.100",  "gray.700");
  const inputBg       = useColorModeValue("gray.50",   "gray.800");
  const labelColor    = useColorModeValue("gray.500",  "gray.400");
  const headingColor  = useColorModeValue("gray.900",  "gray.50");
  const subTextColor  = useColorModeValue("gray.500",  "gray.400");
  const resultBg      = useColorModeValue("blue.50",   "blue.900");
  const resultBorder  = useColorModeValue("blue.100",  "blue.700");
  const resultText    = useColorModeValue("blue.700",  "blue.200");
  const rateCardBg    = useColorModeValue("gray.50",   "gray.800");
  const rateCardBorder = useColorModeValue("gray.100", "gray.700");
  const swapBg        = useColorModeValue("blue.500",  "blue.600");
  const stepBg        = useColorModeValue("gray.50",   "gray.800");
  const stepBorder    = useColorModeValue("gray.100",  "gray.700");

  // ── Fetch rates ────────────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Using open.er-api.com — free, no key required
      const res = await fetch(
        `https://open.er-api.com/v6/latest/${fromCurrency}`
      );
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      setRateData({ rates: data.rates, base: fromCurrency, timestamp: Date.now() });
      setLastUpdated(new Date());
    } catch (e) {
      // Fallback: approximate static rates relative to USD
      const fallbackUSD: Record<string, number> = {
        USD:1, EUR:0.92, GBP:0.79, JPY:149.5, INR:83.2, CAD:1.36,
        AUD:1.53, CHF:0.89, CNY:7.24, SGD:1.34, AED:3.67, SAR:3.75,
        HKD:7.82, NZD:1.63, MXN:17.1, BRL:4.97, ZAR:18.6, TRY:30.5,
        RUB:90.1, KRW:1325,
      };
      // Convert to fromCurrency base
      const baseRate = fallbackUSD[fromCurrency] || 1;
      const converted: Record<string, number> = {};
      Object.keys(fallbackUSD).forEach(cur => {
        converted[cur] = fallbackUSD[cur] / baseRate;
      });
      setRateData({ rates: converted, base: fromCurrency, timestamp: Date.now() });
      setLastUpdated(new Date());
      setError("Using estimated rates (offline mode)");
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // ── Derived values ─────────────────────────────────────────────
  const rate = rateData?.rates[toCurrency] ?? 0;
  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = numAmount * rate;

  const fromInfo = CURRENCIES.find(c => c.code === fromCurrency);
  const toInfo   = CURRENCIES.find(c => c.code === toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Popular pairs for quick reference
  const popularPairs = [
    { from: "USD", to: "INR" },
    { from: "USD", to: "EUR" },
    { from: "USD", to: "GBP" },
    { from: "EUR", to: "GBP" },
    { from: "USD", to: "JPY" },
    { from: "GBP", to: "INR" },
  ];

  const formatNumber = (num: number, decimals = 4) => {
    if (num >= 1000) return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return num.toLocaleString("en-US", { maximumFractionDigits: decimals });
  };

  return (
    <Box minH="100vh" bg={pageBg} transition="background 0.2s" py={{ base: 6, md: 10 }}>
      <Container maxW="900px">
        <VStack spacing={8} align="stretch">

          {/* ── Header ── */}
          <VStack spacing={2} textAlign="center">
            <Badge
              colorScheme="blue" variant="subtle"
              px={3} py={1} borderRadius="full"
              textTransform="uppercase" letterSpacing="widest" fontSize="10px"
            >
              Live Exchange Rates
            </Badge>
            <Heading
              size={{ base: "xl", md: "2xl" }}
              fontWeight="900" letterSpacing="tight"
              color={headingColor}
            >
              Currency{" "}
              <Text as="span" color="blue.500">Converter</Text>
            </Heading>
            <Text color={subTextColor} fontSize="sm">
              Real-time rates • {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Loading rates..."}
            </Text>
          </VStack>

          {/* ── Main Converter Card ── */}
          <Box
            bg={cardBg} borderRadius="3xl"
            border="1px solid" borderColor={borderColor}
            shadow="xl" overflow="hidden"
            transition="background 0.2s"
          >
            {/* Top bar */}
            <Flex
              px={6} py={4} borderBottom="1px solid" borderColor={borderColor}
              justify="space-between" align="center"
            >
              <HStack spacing={2}>
                <Icon as={FiDollarSign} color="blue.500" />
                <Text fontWeight="800" fontSize="xs" textTransform="uppercase"
                  letterSpacing="widest" color={labelColor}>
                  Converter
                </Text>
              </HStack>
              <HStack spacing={2}>
                {error && (
                  <Badge colorScheme="orange" fontSize="10px" borderRadius="full" px={2}>
                    {error}
                  </Badge>
                )}
                <Tooltip label="Refresh rates">
                  <IconButton
                    aria-label="Refresh"
                    icon={loading ? <Spinner size="xs" /> : <RepeatIcon />}
                    size="sm" variant="ghost"
                    onClick={fetchRates}
                    isDisabled={loading}
                    borderRadius="full"
                  />
                </Tooltip>
              </HStack>
            </Flex>

            <Box p={{ base: 4, md: 8 }}>
              {/* ── Amount Input + Currency Selectors ── */}
              <Grid
                templateColumns={{ base: "1fr", md: "1fr auto 1fr" }}
                gap={{ base: 4, md: 6 }}
                alignItems="end"
              >
                {/* FROM */}
                <GridItem>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" fontWeight="700" color={labelColor}
                      textTransform="uppercase" letterSpacing="wider">
                      From
                    </Text>
                    <Select
                      value={fromCurrency}
                      onChange={e => setFromCurrency(e.target.value)}
                      bg={inputBg} border="1px solid" borderColor={borderColor}
                      borderRadius="xl" size="lg" fontWeight="600"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} — {c.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      value={amount}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) setAmount(val);
                      }}
                      placeholder="Enter amount"
                      bg={inputBg} border="1px solid" borderColor={borderColor}
                      borderRadius="xl" size="lg"
                      fontSize="2xl" fontWeight="700"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                    <Text fontSize="xs" color={labelColor} pl={1}>
                      {fromInfo?.flag} {fromInfo?.name}
                    </Text>
                  </VStack>
                </GridItem>

                {/* SWAP Button */}
                <GridItem display="flex" justifyContent="center" alignItems="center" pb="38px">
                  <IconButton
                    aria-label="Swap currencies"
                    icon={<MdSwapHoriz size={24} />}
                    onClick={handleSwap}
                    bg={swapBg} color="white"
                    borderRadius="full" size="lg"
                    _hover={{ transform: "rotate(180deg)", bg: "blue.600" }}
                    transition="all 0.3s ease"
                    shadow="lg"
                  />
                </GridItem>

                {/* TO */}
                <GridItem>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" fontWeight="700" color={labelColor}
                      textTransform="uppercase" letterSpacing="wider">
                      To
                    </Text>
                    <Select
                      value={toCurrency}
                      onChange={e => setToCurrency(e.target.value)}
                      bg={inputBg} border="1px solid" borderColor={borderColor}
                      borderRadius="xl" size="lg" fontWeight="600"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} — {c.name}
                        </option>
                      ))}
                    </Select>
                    {/* Result box */}
                    <Box
                      bg={resultBg} border="1px solid" borderColor={resultBorder}
                      borderRadius="xl" px={4} py={3} minH="56px"
                      display="flex" alignItems="center"
                    >
                      {loading ? (
                        <Spinner size="sm" color="blue.500" />
                      ) : (
                        <Text fontSize="2xl" fontWeight="800" color={resultText}>
                          {formatNumber(convertedAmount, 4)}
                        </Text>
                      )}
                    </Box>
                    <Text fontSize="xs" color={labelColor} pl={1}>
                      {toInfo?.flag} {toInfo?.name}
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>

              {/* ── Exchange Rate Display ── */}
              {rate > 0 && !loading && (
                <Box
                  mt={6} p={4} bg={stepBg}
                  border="1px solid" borderColor={stepBorder}
                  borderRadius="2xl"
                >
                  <HStack justify="space-between" flexWrap="wrap" gap={2}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={labelColor} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Exchange Rate
                      </Text>
                      <Text fontWeight="800" fontSize="lg" color={headingColor}>
                        1 {fromCurrency} = {formatNumber(rate)} {toCurrency}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="xs" color={labelColor} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Inverse Rate
                      </Text>
                      <Text fontWeight="700" fontSize="md" color={subTextColor}>
                        1 {toCurrency} = {formatNumber(1 / rate)} {fromCurrency}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {/* ── Quick Amounts ── */}
              <Box mt={6}>
                <Text fontSize="xs" fontWeight="700" color={labelColor}
                  textTransform="uppercase" letterSpacing="wider" mb={3}>
                  Quick Amounts
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {QUICK_AMOUNTS.map(qa => (
                    <Box
                      key={qa}
                      as="button"
                      px={4} py={2}
                      bg={amount === String(qa) ? "blue.500" : inputBg}
                      color={amount === String(qa) ? "white" : subTextColor}
                      border="1px solid"
                      borderColor={amount === String(qa) ? "blue.500" : borderColor}
                      borderRadius="full" fontSize="sm" fontWeight="700"
                      cursor="pointer" transition="all 0.15s"
                      _hover={{ borderColor: "blue.400", color: "blue.400" }}
                      onClick={() => setAmount(String(qa))}
                    >
                      {qa.toLocaleString()}
                    </Box>
                  ))}
                </Flex>
              </Box>
            </Box>
          </Box>

          {/* ── Calculation Steps ── */}
          {rate > 0 && numAmount > 0 && !loading && (
            <Box
              bg={cardBg} borderRadius="3xl"
              border="1px solid" borderColor={borderColor}
              shadow="md" overflow="hidden"
              transition="background 0.2s"
            >
              <Box px={6} py={4} borderBottom="1px solid" borderColor={borderColor}>
                <Text fontWeight="800" fontSize="xs" color="blue.500"
                  textTransform="uppercase" letterSpacing="widest">
                  Calculation Steps
                </Text>
              </Box>
              <VStack align="stretch" spacing={0} px={6} py={4}>
                {[
                  {
                    step: "1",
                    label: "Your Amount",
                    value: `${formatNumber(numAmount, 2)} ${fromCurrency}`,
                  },
                  {
                    step: "×",
                    label: `Exchange Rate (1 ${fromCurrency} → ${toCurrency})`,
                    value: formatNumber(rate),
                  },
                  {
                    step: "=",
                    label: "Converted Amount",
                    value: `${formatNumber(convertedAmount, 4)} ${toCurrency}`,
                    highlight: true,
                  },
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <Flex
                      align="center" py={3}
                      justify="space-between"
                    >
                      <HStack spacing={4}>
                        <Box
                          w="32px" h="32px" borderRadius="full"
                          bg={item.highlight ? "blue.500" : inputBg}
                          display="flex" alignItems="center" justifyContent="center"
                          fontWeight="900" fontSize="sm"
                          color={item.highlight ? "white" : labelColor}
                          flexShrink={0}
                        >
                          {item.step}
                        </Box>
                        <Text fontSize="sm" color={labelColor} fontWeight="500">
                          {item.label}
                        </Text>
                      </HStack>
                      <Text
                        fontWeight={item.highlight ? "800" : "600"}
                        fontSize={item.highlight ? "lg" : "sm"}
                        color={item.highlight ? "blue.500" : headingColor}
                      >
                        {item.value}
                      </Text>
                    </Flex>
                    {i < 2 && <Divider borderColor={borderColor} />}
                  </React.Fragment>
                ))}
              </VStack>
            </Box>
          )}

          {/* ── Popular Pairs Quick Reference ── */}
          {rateData && (
            <Box
              bg={cardBg} borderRadius="3xl"
              border="1px solid" borderColor={borderColor}
              shadow="md" overflow="hidden"
              transition="background 0.2s"
            >
              <Box px={6} py={4} borderBottom="1px solid" borderColor={borderColor}>
                <Text fontWeight="800" fontSize="xs" color="blue.500"
                  textTransform="uppercase" letterSpacing="widest">
                  Popular Pairs
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 2, md: 3 }} gap={0}>
                {popularPairs.map((pair, i) => {
                  // Calculate rate between any two currencies via base
                  const fromRate = rateData.rates[pair.from] || 1;
                  const toRate   = rateData.rates[pair.to]   || 1;
                  const pairRate = (fromCurrency === pair.from)
                    ? (rateData.rates[pair.to] || 0)
                    : (toRate / fromRate);

                  const fromC = CURRENCIES.find(c => c.code === pair.from);
                  const toC   = CURRENCIES.find(c => c.code === pair.to);

                  // fetch actual rate for this pair from rateData
                  // rateData.base === fromCurrency, so for other pairs we compute
                  let displayRate = 0;
                  if (rateData.base === pair.from) {
                    displayRate = rateData.rates[pair.to] || 0;
                  } else {
                    // approximate: rates are relative to rateData.base
                    const baseToFrom = rateData.rates[pair.from] || 1;
                    const baseToTo   = rateData.rates[pair.to]   || 1;
                    displayRate = baseToTo / baseToFrom;
                  }

                  return (
                    <Box
                      key={i}
                      p={4}
                      bg={rateCardBg}
                      border="1px solid" borderColor={rateCardBorder}
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{ bg: resultBg }}
                      onClick={() => {
                        setFromCurrency(pair.from);
                        setToCurrency(pair.to);
                      }}
                    >
                      <Text fontSize="xs" color={labelColor} fontWeight="600">
                        {fromC?.flag} {pair.from} → {toC?.flag} {pair.to}
                      </Text>
                      <Text fontWeight="800" fontSize="lg" color={headingColor} mt={1}>
                        {formatNumber(displayRate, 4)}
                      </Text>
                      <HStack spacing={1} mt={1}>
                        <Icon as={FiTrendingUp} color="green.400" boxSize={3} />
                        <Text fontSize="10px" color="green.400" fontWeight="700">Live</Text>
                      </HStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

          {/* ── All Rates Table ── */}
          {rateData && (
            <Box
              bg={cardBg} borderRadius="3xl"
              border="1px solid" borderColor={borderColor}
              shadow="md" overflow="hidden"
              transition="background 0.2s"
            >
              <Box px={6} py={4} borderBottom="1px solid" borderColor={borderColor}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="800" fontSize="xs" color="blue.500"
                    textTransform="uppercase" letterSpacing="widest">
                    All Rates vs {fromCurrency}
                  </Text>
                  <Text fontSize="xs" color={labelColor}>
                    For {formatNumber(numAmount || 1, 0)} {fromCurrency}
                  </Text>
                </Flex>
              </Box>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={0}>
                {CURRENCIES.filter(c => c.code !== fromCurrency).map((c, i) => {
                  const r = rateData.rates[c.code] || 0;
                  const converted = (numAmount || 1) * r;
                  return (
                    <Flex
                      key={c.code}
                      px={4} py={3}
                      align="center"
                      justify="space-between"
                      borderBottom="1px solid" borderColor={borderColor}
                      cursor="pointer"
                      _hover={{ bg: resultBg }}
                      transition="background 0.15s"
                      onClick={() => setToCurrency(c.code)}
                      bg={toCurrency === c.code ? resultBg : "transparent"}
                    >
                      <HStack spacing={3}>
                        <Text fontSize="xl">{c.flag}</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="700" fontSize="sm" color={headingColor}>{c.code}</Text>
                          <Text fontSize="10px" color={labelColor}>{c.name}</Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="800" fontSize="sm" color={headingColor}>
                          {formatNumber(converted, 2)}
                        </Text>
                        <Text fontSize="10px" color={labelColor}>
                          1 {fromCurrency} = {formatNumber(r, 4)}
                        </Text>
                      </VStack>
                    </Flex>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

        </VStack>
      </Container>
    </Box>
  );
};

export default CurrencyConverterContent;
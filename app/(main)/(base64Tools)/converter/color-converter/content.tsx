"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  HStack,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import {
  FaPalette,
  FaTrashAlt,
  FaCopy,
  FaDownload,
  FaExclamationTriangle,
  FaEyeDropper,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import stores from "../../../../store/stores";

// ─── Color Conversion Utilities ───────────────────────────────────────────────

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  let cleaned = hex.replace(/^#/, "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  if (!/^([0-9A-Fa-f]{6})$/.test(cleaned)) {
    throw new Error("Invalid HEX color format.");
  }
  const int = parseInt(cleaned, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const diff = max - min;
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / diff + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / diff + 2; break;
      case bn: h = (rn - gn) / diff + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;
  if (sat === 0) {
    const val = Math.round(light * 255);
    return { r: val, g: val, b: val };
  }
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  return {
    r: Math.round(hue2rgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hue) * 255),
    b: Math.round(hue2rgb(p, q, hue - 1 / 3) * 255),
  };
};

const parseRgb = (value: string): { r: number; g: number; b: number } => {
  const match = value.trim().match(
    /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
  );
  if (!match) throw new Error("Invalid RGB format. Use rgb(255, 255, 255).");
  const [r, g, b] = match.slice(1).map(Number);
  if ([r, g, b].some((c) => c < 0 || c > 255))
    throw new Error("RGB values must be between 0 and 255.");
  return { r, g, b };
};

const parseHsl = (value: string): { h: number; s: number; l: number } => {
  const match = value.trim().match(
    /^hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i
  );
  if (!match) throw new Error("Invalid HSL format. Use hsl(180, 50%, 50%).");
  const [h, s, l] = match.slice(1).map(Number);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100)
    throw new Error("HSL values are out of range.");
  return { h, s, l };
};

// ─── Derive all outputs from a hex string ─────────────────────────────────────

const deriveFromHex = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
};

// ─── Output Row ───────────────────────────────────────────────────────────────

interface OutputRowProps {
  label: string;
  value: string;
  accentColor: string;
  onCopy: () => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
}

const OutputRow: React.FC<OutputRowProps> = ({
  label, value, accentColor, onCopy,
  cardBg, borderColor, textColor, mutedColor,
}) => (
  <Flex
    align="center"
    justify="space-between"
    bg={cardBg}
    border="1px solid"
    borderColor={borderColor}
    borderRadius="lg"
    px={4}
    py={3}
    gap={3}
  >
    <HStack spacing={3} flex={1} minW={0}>
      <Box w="10px" h="10px" borderRadius="full" bg={accentColor} flexShrink={0} />
      <Text
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color={mutedColor}
        flexShrink={0}
        w="36px"
      >
        {label}
      </Text>
      <Text
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
        fontSize="13px"
        color={value ? textColor : mutedColor}
        fontStyle={value ? "normal" : "italic"}
        isTruncated
      >
        {value || "—"}
      </Text>
    </HStack>
    <Tooltip label={`Copy ${label}`} placement="top" hasArrow>
      <IconButton
        aria-label={`Copy ${label}`}
        icon={<FaCopy />}
        size="xs"
        variant="ghost"
        colorScheme="gray"
        onClick={onCopy}
        isDisabled={!value}
        flexShrink={0}
      />
    </Tooltip>
  </Flex>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ColorConverterContent: React.FC = () => {
  const [colorInput, setColorInput] = useState("");
  const [pickerColor, setPickerColor] = useState("#3ecfb2");
  const [hexOutput, setHexOutput] = useState("");
  const [rgbOutput, setRgbOutput] = useState("");
  const [hslOutput, setHslOutput] = useState("");
  const [previewColor, setPreviewColor] = useState("#3ecfb2");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const colorPickerRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    themeStore: { themeConfig },
  } = stores;

  // ── Chakra color tokens ──
  const pageBg       = useColorModeValue("gray.50", "gray.900");
  const cardBg       = useColorModeValue("white", "gray.800");
  const borderColor  = useColorModeValue("gray.200", "gray.700");
  const textColor    = useColorModeValue("gray.800", "gray.100");
  const mutedColor   = useColorModeValue("gray.400", "gray.500");
  const inputBg      = useColorModeValue("white", "gray.800");
  const labelColor   = useColorModeValue("gray.600", "gray.400");
  const errorBg      = useColorModeValue("red.50", "rgba(254,178,178,0.08)");
  const errorBorder  = useColorModeValue("red.200", "red.800");
  const errorText    = useColorModeValue("red.700", "red.300");
  const swatchSideBg = useColorModeValue("gray.50", "gray.850");
  const hexBadgeBg   = useColorModeValue("teal.50", "teal.900");
  const hexBadgeColor= useColorModeValue("teal.700", "teal.200");

  const showToast = useCallback(
    (title: string, description?: string, status: "success" | "error" | "warning" = "success") => {
      toast({ title, description, status, duration: 2500, isClosable: true, position: "bottom-right" });
    },
    [toast]
  );

  const applyOutputs = (hex: string, rgb: string, hsl: string) => {
    setHexOutput(hex);
    setRgbOutput(rgb);
    setHslOutput(hsl);
    setPreviewColor(hex);
    setErrorMessage("");
  };

  // ── Real-time picker change ──
  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setPickerColor(hex);
    setColorInput(hex);
    try {
      const out = deriveFromHex(hex);
      applyOutputs(out.hex, out.rgb, out.hsl);
    } catch {
      // ignore mid-drag errors
    }
  };

  // ── Manual text input → convert ──
  const handleConvert = () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const value = colorInput.trim();
      if (!value) throw new Error("Please enter a color in HEX, RGB, or HSL format.");

      let rgb: { r: number; g: number; b: number };
      let hex: string;
      let hsl: { h: number; s: number; l: number };

      if (value.startsWith("#") || /^[0-9A-Fa-f]{3,6}$/.test(value)) {
        const normalized = value.replace(/^#/, "").trim();
        const hexVal = normalized.length === 3
          ? normalized.split("").map((c) => c + c).join("")
          : normalized;
        rgb = hexToRgb(`#${hexVal}`);
        hex = `#${hexVal.toUpperCase()}`;
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      } else if (/^rgb\s*\(/i.test(value)) {
        rgb = parseRgb(value);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      } else if (/^hsl\s*\(/i.test(value)) {
        hsl = parseHsl(value);
        rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      } else {
        throw new Error("Unsupported format. Use HEX (#fff), RGB (rgb(…)), or HSL (hsl(…)).");
      }

      const finalHex = hex;
      const finalRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      const finalHsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      applyOutputs(finalHex, finalRgb, finalHsl);
      setPickerColor(finalHex); // sync picker swatch
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to convert the color.");
      setHexOutput("");
      setRgbOutput("");
      setHslOutput("");
      setPreviewColor("#ffffff");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setColorInput("");
    setPickerColor("#3ecfb2");
    setHexOutput("");
    setRgbOutput("");
    setHslOutput("");
    setPreviewColor("#3ecfb2");
    setErrorMessage("");
  };

  const handleCopy = (value: string, label: string) => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => showToast(`${label} copied!`))
      .catch(() => showToast("Copy failed", "Could not copy to clipboard.", "error"));
  };

  const handleDownload = () => {
    if (!hexOutput && !rgbOutput && !hslOutput) return;
    const blob = new Blob(
      [`Input: ${colorInput}\nHEX: ${hexOutput}\nRGB: ${rgbOutput}\nHSL: ${hslOutput}`],
      { type: "text/plain;charset=utf-8" }
    );
    saveAs(blob, "color-conversion.txt");
  };

  const hasOutput = !!(hexOutput || rgbOutput || hslOutput);

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6, lg: 8 }}>
      <Box maxW="860px" mx="auto">

        {/* ── Page Header ── */}
        <Box mb={6}>
          <Text
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={mutedColor}
            mb={1}
          >
            Developer Tool
          </Text>
          <Text
            fontSize={{ base: "22px", md: "28px" }}
            fontWeight="800"
            color={textColor}
            lineHeight="1.1"
            letterSpacing="-0.02em"
          >
            Color{" "}
            <Box as="span" color={themeConfig?.colors?.brand?.[400] || "teal.500"}>
              Converter
            </Box>
          </Text>
          <Text fontSize="13px" color={mutedColor} mt={1}>
            Pick a color visually or type HEX / RGB / HSL to convert instantly.
          </Text>
        </Box>

        {/* ── Main Card: Picker + Text Input ── */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          mb={4}
        >
          {/* Terminal title bar */}
          <Flex
            align="center"
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor={borderColor}
            gap={2}
          >
            <Box w="10px" h="10px" borderRadius="full" bg="red.400" />
            <Box w="10px" h="10px" borderRadius="full" bg="yellow.400" />
            <Box w="10px" h="10px" borderRadius="full" bg="green.400" />
            <Text fontSize="11px" color={mutedColor} ml={2} fontFamily="monospace">
              color-picker + manual input
            </Text>
          </Flex>

          <Grid templateColumns={{ base: "1fr", sm: "auto 1fr" }} gap={0}>

            {/* ── LEFT: Color Picker Swatch ── */}
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={6}
              bg={swatchSideBg}
              borderRight={{ base: "none", sm: "1px solid" }}
              borderBottom={{ base: "1px solid", sm: "none" }}
              borderColor={borderColor}
              gap={4}
              minW={{ sm: "170px" }}
            >
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color={mutedColor}
              >
                Color Picker
              </Text>

              {/* Swatch — clicking it opens native color picker */}
              <Box position="relative" w="110px" h="110px">
                <Box
                  as="label"
                  htmlFor="native-color-picker"
                  cursor="pointer"
                  display="block"
                  w="110px"
                  h="110px"
                  borderRadius="2xl"
                  bg={pickerColor}
                  border="3px solid"
                  borderColor={borderColor}
                  transition="border-color 0.2s, transform 0.15s"
                  _hover={{ borderColor: "teal.400", transform: "scale(1.04)" }}
                  // display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Eyedropper icon overlay */}
                  <Flex
                    bg="blackAlpha.350"
                    borderRadius="full"
                    p={2}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaEyeDropper} color="white" boxSize={4} />
                  </Flex>
                </Box>

                {/* Hidden native input — covers swatch area to trigger picker */}
                <input
                  id="native-color-picker"
                  ref={colorPickerRef}
                  type="color"
                  value={pickerColor}
                  onChange={handlePickerChange}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    border: "none",
                    padding: 0,
                  }}
                />
              </Box>

              {/* Hex label under swatch */}
              <Box px={3} py={1} bg={hexBadgeBg} borderRadius="md">
                <Text
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="13px"
                  fontWeight="700"
                  color={hexBadgeColor}
                  letterSpacing="0.05em"
                >
                  {pickerColor.toUpperCase()}
                </Text>
              </Box>
            </Flex>

            {/* ── RIGHT: Manual Text Input ── */}
            <Box px={5} py={5}>
              <FormControl mb={4}>
                <FormLabel fontSize="13px" fontWeight="600" color={labelColor} mb={2}>
                  Or enter a color manually
                </FormLabel>
                <Input
                  placeholder="#ff5733 · rgb(255,87,51) · hsl(14,100%,60%)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  fontSize="13px"
                  fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                  _focus={{
                    borderColor: "teal.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
                  }}
                  _placeholder={{ color: mutedColor, fontFamily: "sans-serif", fontSize: "12px" }}
                />
              </FormControl>

              <Flex gap={3} flexWrap="wrap">
                <Button
                  leftIcon={<Icon as={FaPalette} />}
                  colorScheme="teal"
                  size="sm"
                  onClick={handleConvert}
                  isLoading={loading}
                  loadingText="Converting…"
                  fontWeight="700"
                  px={5}
                >
                  Convert
                </Button>
                {(colorInput.trim() || hasOutput) && (
                  <Button
                    leftIcon={<Icon as={FaTrashAlt} />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
            </Box>
          </Grid>
        </Box>

        {/* ── Error ── */}
        {errorMessage && (
          <Flex
            align="flex-start"
            gap={3}
            p={4}
            bg={errorBg}
            border="1px solid"
            borderColor={errorBorder}
            borderRadius="lg"
            mb={4}
          >
            <Box color="red.500" pt={0.5} flexShrink={0}>
              <FaExclamationTriangle />
            </Box>
            <Text fontSize="13px" color={errorText} fontFamily="monospace">
              {errorMessage}
            </Text>
          </Flex>
        )}

        {/* ── Output Rows + Preview ── */}
        <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={4} alignItems="start">
          <GridItem>
            <VStack spacing={2} align="stretch">
              <OutputRow
                label="HEX"
                value={hexOutput}
                accentColor="#5DCAA5"
                onCopy={() => handleCopy(hexOutput, "HEX")}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
              />
              <OutputRow
                label="RGB"
                value={rgbOutput}
                accentColor="#378ADD"
                onCopy={() => handleCopy(rgbOutput, "RGB")}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
              />
              <OutputRow
                label="HSL"
                value={hslOutput}
                accentColor="#D85A30"
                onCopy={() => handleCopy(hslOutput, "HSL")}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
              />
            </VStack>
          </GridItem>

          {/* Preview Box */}
          <GridItem>
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              w={{ base: "100%", md: "180px" }}
            >
              <Box
                h="130px"
                bg={previewColor}
                display="flex"
                alignItems="flex-end"
                p={3}
                transition="background 0.25s"
              >
                <Badge
                  bg="blackAlpha.500"
                  color="white"
                  fontSize="10px"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  fontFamily="monospace"
                >
                  {previewColor.toUpperCase()}
                </Badge>
              </Box>
              <Box px={3} py={2} borderTop="1px solid" borderColor={borderColor}>
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color={mutedColor}
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  Preview
                </Text>
              </Box>
            </Box>
          </GridItem>
        </Grid>

        {/* ── Actions ── */}
        {hasOutput && (
          <Flex gap={3} flexWrap="wrap" mt={4}>
            <Button
              leftIcon={<Icon as={FaCopy} />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() =>
                handleCopy(`HEX: ${hexOutput}\nRGB: ${rgbOutput}\nHSL: ${hslOutput}`, "All values")
              }
            >
              Copy all
            </Button>
            <Button
              leftIcon={<Icon as={FaDownload} />}
              size="sm"
              variant="outline"
              colorScheme="teal"
              onClick={handleDownload}
            >
              Download .txt
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default ColorConverterContent;
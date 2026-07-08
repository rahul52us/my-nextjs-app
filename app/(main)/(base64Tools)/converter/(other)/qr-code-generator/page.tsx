"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Badge,
  Flex,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDownload,
  FaLink,
  FaCheck,
  FaTimes,
  FaQrcode,
  FaGlobe,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaUpload,
  FaLayerGroup,
  FaShapes,
  FaImage,
  FaExchangeAlt,
} from "react-icons/fa";
import stores from "../../../../../store/stores";
import { useWorkflowAutoAdvance } from "../../../../../hooks/useWorkflowAutoAdvance";

const MotionBox = motion(Box as any);

// ── Types ─────────────────────────────────────────────────────────────────────
type ECLevel = "L" | "M" | "Q" | "H";
type DotStyle = "square" | "rounded" | "dots" | "diamond" | "vertical";
type FrameStyle = "none" | "scanme" | "social" | "border" | "badge" | "ribbon";

// ── Constants ─────────────────────────────────────────────────────────────────
const QR_AREA = 260;
const FRAME_H = 52;

const COLOR_PRESETS = [
  { fg: "#000000", bg: "#FFFFFF", label: "Classic" },
  { fg: "#1a1a2e", bg: "#FFFFFF", label: "Navy" },
  { fg: "#0F4C75", bg: "#BBE1FA", label: "Ocean" },
  { fg: "#6B48FF", bg: "#F0EBFF", label: "Purple" },
  { fg: "#E94560", bg: "#FFFFFF", label: "Rose" },
  { fg: "#00B4D8", bg: "#03045E", label: "Cyber" },
  { fg: "#2D6A4F", bg: "#D8F3DC", label: "Forest" },
  { fg: "#F4A261", bg: "#264653", label: "Sunset" },
  { fg: "#FFFFFF", bg: "#000000", label: "Inverse" },
];

const EC_LEVELS = [
  { value: "L" as ECLevel, label: "L", desc: "Low — 7% data recovery" },
  { value: "M" as ECLevel, label: "M", desc: "Medium — 15% data recovery" },
  { value: "Q" as ECLevel, label: "Q", desc: "Quartile — 25% data recovery" },
  { value: "H" as ECLevel, label: "H", desc: "High — 30% data recovery" },
];

const DOT_STYLES: { id: DotStyle; label: string; symbol: string }[] = [
  { id: "square", label: "Square", symbol: "⬛" },
  { id: "rounded", label: "Rounded", symbol: "🟫" },
  { id: "dots", label: "Dots", symbol: "⚫" },
  { id: "diamond", label: "Diamond", symbol: "🔷" },
  { id: "vertical", label: "Bars", symbol: "▪️" },
];

const FRAME_STYLES: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "scanme", label: "Scan Me!" },
  { id: "border", label: "Border" },
  { id: "badge", label: "Badge" },
  { id: "social", label: "Social" },
  { id: "ribbon", label: "Ribbon" },
];

const LOGO_PRESETS = [
  { id: "none", label: "None", emoji: null, color: "#9CA3AF" },
  { id: "whatsapp", label: "WhatsApp", emoji: "📱", color: "#25D366" },
  { id: "link", label: "Link", emoji: "🔗", color: "#7C3AED" },
  { id: "location", label: "Location", emoji: "📍", color: "#EF4444" },
  { id: "wifi", label: "WiFi", emoji: "📶", color: "#06B6D4" },
  { id: "email", label: "Email", emoji: "📧", color: "#3B82F6" },
  { id: "phone", label: "Phone", emoji: "☎️", color: "#10B981" },
  { id: "star", label: "Star", emoji: "⭐", color: "#F59E0B" },
  { id: "globe", label: "Globe", emoji: "🌐", color: "#6366F1" },
];

// ── URL helpers ───────────────────────────────────────────────────────────────
const isValidUrl = (val: string): boolean | null => {
  if (!val) return null;
  try {
    const url = new URL(val.startsWith("http") ? val : "https://" + val);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
};
const normalizeUrl = (val: string) => {
  if (!val) return "";
  return val.startsWith("http://") || val.startsWith("https://") ? val : "https://" + val;
};

// ── Canvas helpers ────────────────────────────────────────────────────────────
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  style: DotStyle, color: string
) {
  const g = s * 0.07;
  const xg = x + g, yg = y + g, sg = s - g * 2;
  ctx.fillStyle = color;
  switch (style) {
    case "rounded": {
      const r = sg * 0.32;
      rrect(ctx, xg, yg, sg, sg, r);
      ctx.fill();
      break;
    }
    case "dots":
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, (sg / 2) * 0.92, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "diamond":
      ctx.beginPath();
      ctx.moveTo(x + s / 2, yg);
      ctx.lineTo(xg + sg, y + s / 2);
      ctx.lineTo(x + s / 2, yg + sg);
      ctx.lineTo(xg, y + s / 2);
      ctx.closePath();
      ctx.fill();
      break;
    case "vertical":
      ctx.fillRect(x + s * 0.28, yg, s * 0.44, sg);
      break;
    default:
      ctx.fillRect(xg, yg, sg, sg);
  }
}

async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  opts: {
    qrValue: string;
    fgColor: string;
    bgColor: string;
    ecLevel: ECLevel;
    dotStyle: DotStyle;
    frameStyle: FrameStyle;
    frameText: string;
    frameFg: string;
    frameBg: string;
    logoId: string;
    customLogoSrc: string | null;
    scale?: number;
  }
) {
  const {
    qrValue, fgColor, bgColor, ecLevel,
    dotStyle, frameStyle, frameText, frameFg, frameBg,
    logoId, customLogoSrc, scale = 1,
  } = opts;

  // Dynamically import qrcode to get the modules matrix.
  // Support both ESM default export and CJS interop shapes.
  const QRLib = (await import("qrcode")) as any;
  const create = QRLib.create || QRLib.default?.create;
  if (!create) {
    throw new Error("qrcode library did not expose a `create` function");
  }
  const qrData = create(qrValue, { errorCorrectionLevel: ecLevel });
  const modules = qrData.modules;
  const count: number = modules.size;

  const pad = 18 * scale;
  const qrSide = QR_AREA * scale;
  const cellSize = qrSide / count;
  const hasFrame = frameStyle !== "none";
  const framePx = hasFrame ? FRAME_H * scale : 0;
  const W = qrSide + pad * 2;
  const H = qrSide + pad * 2 + framePx;

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ── background
  if (hasFrame) {
    ctx.fillStyle = frameBg;
    ctx.fillRect(0, 0, W, H);
    // white QR card
    ctx.fillStyle = bgColor;
    rrect(ctx, 6 * scale, 6 * scale, W - 12 * scale, qrSide + pad * 2 - 12 * scale, 12 * scale);
    ctx.fill();
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
  }

  // ── QR dots
  const ox = pad, oy = pad;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules.get(r, c)) {
        drawDot(ctx, ox + c * cellSize, oy + r * cellSize, cellSize, dotStyle, fgColor);
      }
    }
  }

  // ── frame text / decorations
  if (hasFrame) {
    const textY = qrSide + pad * 2 + framePx / 2;
    ctx.fillStyle = frameFg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (frameStyle === "border") {
      // Just a colored border, minimal text
      ctx.strokeStyle = frameBg;
      ctx.lineWidth = 4 * scale;
      ctx.strokeRect(3 * scale, 3 * scale, W - 6 * scale, H - 6 * scale);
    }
    if (frameStyle === "ribbon") {
      // Ribbon top
      ctx.fillStyle = frameBg;
      ctx.fillRect(0, 0, W, 28 * scale);
      ctx.fillStyle = frameFg;
      ctx.font = `bold ${14 * scale}px system-ui,sans-serif`;
      ctx.fillText(frameText || "Scan me!", W / 2, 14 * scale);
    } else {
      ctx.font = `bold ${16 * scale}px system-ui,sans-serif`;
      ctx.fillText(frameText || "Scan me!", W / 2, textY);
    }
  }

  // ── logo overlay
  if (logoId !== "none") {
    const logoZone = qrSide * 0.2;
    const lx = ox + (qrSide - logoZone) / 2;
    const ly = oy + (qrSide - logoZone) / 2;
    const cx = lx + logoZone / 2, cy = ly + logoZone / 2, cr = logoZone / 2 + 5 * scale;

    // white circle halo
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    if (logoId === "custom" && customLogoSrc) {
      await new Promise<void>((res) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, lx, ly, logoZone, logoZone); res(); };
        img.onerror = () => res();
        img.src = customLogoSrc;
      });
    } else {
      const preset = LOGO_PRESETS.find((l) => l.id === logoId);
      if (preset?.emoji) {
        ctx.fillStyle = preset.color;
        ctx.beginPath();
        ctx.arc(cx, cy, logoZone / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `${logoZone * 0.55}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(preset.emoji, cx, cy + 2);
      }
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
const QRCodeGenerator: React.FC = () => {
  const [urlInput, setUrlInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [ecLevel, setEcLevel] = useState<ECLevel>("M");
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [frameText, setFrameText] = useState("Scan me!");
  const [frameFg, setFrameFg] = useState("#FFFFFF");
  const [frameBg, setFrameBg] = useState("#000000");
  const [logoId, setLogoId] = useState("none");
  const [customLogoSrc, setCustomLogoSrc] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState(0);
  const [showDesignPanel, setShowDesignPanel] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderError, setRenderError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { themeStore: { themeConfig } } = stores;
  const { advanceWorkflow } = useWorkflowAutoAdvance();

  // Design tokens
  const pageBg = useColorModeValue("#F8FAFC", "#0B0D12");
  const cardBg = useColorModeValue("#FFFFFF", "#13161E");
  const cardBorder = useColorModeValue("#E2E8F0", "#1E2530");
  const sectionBg = useColorModeValue("#F1F5F9", "#1A1F2B");
  const textPrimary = useColorModeValue("#0F172A", "#EDF2F7");
  const textMuted = useColorModeValue("#64748B", "#8895AA");
  const accent = themeConfig?.colors?.brand?.[600] || "#6366F1";
  const accentLight = useColorModeValue("#EEF2FF", "#1E1B4B");
  const stepNumBg = useColorModeValue(accent, "#E2E8F0");
  const stepNumColor = useColorModeValue("#FFFFFF",  accent);
  const tabHover = useColorModeValue("#F1F5F9", "#1A1F2B");

  const urlValid = isValidUrl(urlInput);

  // Debounce URL → QR value
  useEffect(() => {
    const t = setTimeout(() => {
      if (urlValid) setQrValue(normalizeUrl(urlInput));
      else if (!urlInput) setQrValue("");
    }, 400);
    return () => clearTimeout(t);
  }, [urlInput, urlValid]);

  // Get current render options
  const getRenderOpts = useCallback(() => ({
    qrValue,
    fgColor,
    bgColor,
    ecLevel,
    dotStyle,
    frameStyle,
    frameText,
    frameFg,
    frameBg,
    logoId,
    customLogoSrc,
  }), [qrValue, fgColor, bgColor, ecLevel, dotStyle, frameStyle, frameText, frameFg, frameBg, logoId, customLogoSrc]);

  // Render live preview to canvas
  useEffect(() => {
    if (!canvasRef.current || !qrValue) return;
    setRenderError(false);
    renderQRToCanvas(canvasRef.current, getRenderOpts()).catch((err) => {
      console.error("QR render error:", err);
      setRenderError(true);
    });
  }, [getRenderOpts, qrValue]);

  // ── Download PNG
  const handleDownloadPNG = useCallback(async () => {
    if (!qrValue) return;
    setIsDownloading(true);
    try {
      const dlCanvas = document.createElement("canvas");
      await renderQRToCanvas(dlCanvas, { ...getRenderOpts(), scale: 3 });
      const link = document.createElement("a");
      link.href = dlCanvas.toDataURL("image/png");
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Downloaded!", description: "QR code saved as PNG (3× quality).", status: "success", duration: 2500, isClosable: true, position: "bottom-right" });
      setTimeout(() => advanceWorkflow(), 1200);
    } catch (e) {
      console.error("QR download error:", e);
      toast({ title: "Download failed", description: "Please try again.", status: "error", duration: 2500, isClosable: true, position: "bottom-right" });
    } finally {
      setIsDownloading(false);
    }
  }, [qrValue, getRenderOpts, toast, advanceWorkflow]);

  // ── Handlers
  const handleApplyPreset = (idx: number) => {
    setActivePreset(idx);
    setFgColor(COLOR_PRESETS[idx].fg);
    setBgColor(COLOR_PRESETS[idx].bg);
  };
  const handleCopyUrl = () => {
    if (!urlInput) return;
    navigator.clipboard.writeText(normalizeUrl(urlInput));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleClear = () => { setUrlInput(""); setQrValue(""); };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomLogoSrc(ev.target?.result as string);
      setLogoId("custom");
    };
    reader.readAsDataURL(file);
  };

  // ── Shared sub-section header
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Text fontSize="xs" fontWeight="700" color={textMuted} letterSpacing="0.08em" textTransform="uppercase" mb={3}>
      {children}
    </Text>
  );

  // ── Inline color picker row
  const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <Box>
      <Text fontSize="xs" color={textMuted} mb={1.5} fontWeight="600">{label}</Text>
      <HStack spacing={2} bg={sectionBg} p={2} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
        <Box
          as="input" type="color" value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          w="32px" h="32px" borderRadius="md" border="none" cursor="pointer" bg="transparent"
        />
        <Text fontSize="xs" fontWeight="700" color={textPrimary} fontFamily="monospace">{value.toUpperCase()}</Text>
      </HStack>
    </Box>
  );

  return (
    <Box minH="80vh" bg={pageBg} px={{ base: 4, md: 6, lg: 10 }} py={{ base: 6, md: 10 }}>
      {/* ── Header ── */}
      <VStack spacing={2} mb={10} align="center">
        {/* <HStack spacing={2} mb={1}>
          {["Free Tool", "No Sign-up", "Local Generation"].map((tag) => (
            <Box key={tag} bg={accentLight} color={accent} px={3} py={1} borderRadius="full"
              fontSize="xs" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase">
              {tag}
            </Box>
          ))}
        </HStack> */}
        <Heading as="h1" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="800"
          color={accent} textAlign="center" letterSpacing="-0.02em">
          QR Code Generator
        </Heading>
        <Text color={textMuted} fontSize={{ base: "sm", md: "md" }} textAlign="center" maxW="480px">
          Create beautiful, customizable QR codes for your website URL — frames, shapes, logos & more.
        </Text>
      </VStack>

      {/* ── Main layout ── */}
      <Flex gap={{ base: 5, lg: 8 }} maxW="1180px" mx="auto" direction={{ base: "column", lg: "row" }} align="flex-start">

        {/* ══ LEFT ══ */}
        <Box flex="1" minW={0}>

          {/* STEP 1 */}
          <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" p={{ base: 5, md: 6 }} mb={4}>
            <HStack spacing={3} mb={5}>
              <Flex w="28px" h="28px" borderRadius="full" bg={stepNumBg} color={stepNumColor}
                align="center" justify="center" fontSize="xs" fontWeight="800" flexShrink={0}>1</Flex>
              <Box flex={1}>
                <Text fontWeight="700" fontSize="md" color={textPrimary}>Complete the content</Text>
                <Text fontSize="xs" color={textMuted}>Enter your website URL</Text>
              </Box>
              {urlValid === true && <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs">✓ Valid URL</Badge>}
            </HStack>

            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Box color={urlValid ? "green.400" : textMuted}><FaGlobe /></Box>
              </InputLeftElement>
              <Input
                placeholder="https://yourwebsite.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                bg={sectionBg}
                border="2px solid"
                borderColor={urlValid === true ? "green.400" : urlValid === false && urlInput ? "red.400" : cardBorder}
                color={textPrimary}
                _placeholder={{ color: textMuted }}
                _focus={{ borderColor: accent, boxShadow: "0 0 0 3px " + accent + "22" }}
                borderRadius="xl" fontWeight="500" fontSize="md"
                pr={urlInput ? "80px" : "16px"}
              />
              {urlInput && (
                <InputRightElement w="fit-content" pr={2}>
                  <HStack spacing={1}>
                    <Tooltip label={copied ? "Copied!" : "Copy URL"}>
                      <IconButton aria-label="Copy" icon={copied ? <FaCheck /> : <FaCopy />}
                        size="sm" variant="ghost" color={copied ? "green.400" : textMuted} onClick={handleCopyUrl} />
                    </Tooltip>
                    <Tooltip label="Clear">
                      <IconButton aria-label="Clear" icon={<FaTimes />}
                        size="sm" variant="ghost" color={textMuted} onClick={handleClear} />
                    </Tooltip>
                  </HStack>
                </InputRightElement>
              )}
            </InputGroup>

            {urlValid === false && urlInput && (
              <Text fontSize="xs" color="red.400" mt={2} fontWeight="500">
                Please enter a valid URL (e.g. https://example.com)
              </Text>
            )}

            <HStack spacing={2} mt={3} flexWrap="wrap">
              <Text fontSize="xs" color={textMuted} flexShrink={0}>Try:</Text>
              {["google.com", "github.com", "youtube.com"].map((ex) => (
                <Box key={ex} as="button" fontSize="xs" color={accent} fontWeight="600"
                  px={2} py={0.5} borderRadius="md" bg={accentLight} _hover={{ opacity: 0.8 }}
                  onClick={() => setUrlInput("https://" + ex)}>{ex}</Box>
              ))}
            </HStack>
          </MotionBox>

          {/* STEP 2 — Design (collapsible) */}
          <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" overflow="hidden">

            <Flex align="center" px={{ base: 5, md: 6 }} py={4} cursor="pointer"
              onClick={() => setShowDesignPanel((p) => !p)} _hover={{ bg: sectionBg }} transition="background 0.2s">
              <HStack spacing={3} flex={1}>
                <Flex w="28px" h="28px" borderRadius="full" bg={stepNumBg} color={stepNumColor}
                  align="center" justify="center" fontSize="xs" fontWeight="800" flexShrink={0}>2</Flex>
                <Box>
                  <Text fontWeight="700" fontSize="md" color={textPrimary}>Design your QR</Text>
                  <Text fontSize="xs" color={textMuted}>Frame · Shape · Logo · Level</Text>
                </Box>
              </HStack>
              <Box color={textMuted} fontSize="xs">{showDesignPanel ? <FaChevronUp /> : <FaChevronDown />}</Box>
            </Flex>

            <AnimatePresence>
              {showDesignPanel && (
                <MotionBox key="dp" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} overflow="hidden">
                  <Box px={{ base: 5, md: 6 }} pb={6}>
                    <Divider borderColor={cardBorder} mb={5} />

                    <Tabs variant="unstyled" size="sm">
                      {/* Tab bar */}
                      <TabList
                        bg={sectionBg} borderRadius="xl" p={1} display="inline-flex"
                        gap={1} mb={5} flexWrap="wrap"
                      >
                        {[
                          { icon: <FaLayerGroup />, label: "Frame" },
                          { icon: <FaShapes />, label: "Shape" },
                          { icon: <FaImage />, label: "Logo" },
                          { icon: <FaQrcode />, label: "Level" },
                        ].map(({ icon, label }) => (
                          <Tab key={label}
                            _selected={{ bg: stepNumBg, color: stepNumColor, boxShadow: "sm" }}
                            color={textMuted} fontWeight="600" fontSize="sm"
                            borderRadius="lg" px={3} py={1.5}
                            _hover={{ bg: tabHover }}
                            transition="all 0.15s"
                          >
                            <HStack spacing={1.5}><Box fontSize="10px">{icon}</Box><Text>{label}</Text></HStack>
                          </Tab>
                        ))}
                      </TabList>

                      <TabPanels>
                        {/* ─────────── FRAME TAB ─────────── */}
                        <TabPanel p={0}>
                          <SectionLabel>Frame Style</SectionLabel>
                          <SimpleGrid columns={{ base: 3, sm: 3, md: 6 }} spacing={2} mb={5}>
                            {FRAME_STYLES.map((f) => {
                              const active = frameStyle === f.id;
                              return (
                                <Box key={f.id} as="button"
                                  bg={active ? stepNumBg : sectionBg}
                                  color={active ? stepNumColor : textMuted}
                                  border="2px solid" borderColor={active ? accent : cardBorder}
                                  borderRadius="xl" py={3} px={1}
                                  fontWeight="700" fontSize="xs" lineHeight="1.3"
                                  textAlign="center"
                                  onClick={() => setFrameStyle(f.id as FrameStyle)}
                                  _hover={{ opacity: 0.85 }}
                                  transition="all 0.15s"
                                  boxShadow={active ? "0 0 0 3px " + accent + "33" : "none"}
                                >
                                  {f.label}
                                </Box>
                              );
                            })}
                          </SimpleGrid>

                          {frameStyle !== "none" && (
                            <Box>
                              <Box mb={3}>
                                <Text fontSize="xs" color={textMuted} mb={1.5} fontWeight="600">Frame text</Text>
                                <Input
                                  value={frameText}
                                  onChange={(e) => setFrameText(e.target.value)}
                                  placeholder="Scan me!"
                                  bg={sectionBg} border="1px solid" borderColor={cardBorder}
                                  color={textPrimary} _placeholder={{ color: textMuted }}
                                  borderRadius="lg" size="sm"
                                />
                              </Box>
                              <SimpleGrid columns={2} spacing={3}>
                                <ColorRow label="Text color" value={frameFg} onChange={setFrameFg} />
                                <ColorRow label="Frame color" value={frameBg} onChange={setFrameBg} />
                              </SimpleGrid>
                            </Box>
                          )}
                        </TabPanel>

                        {/* ─────────── SHAPE TAB ─────────── */}
                        <TabPanel p={0}>
                          <SectionLabel>Dot Style</SectionLabel>
                          <SimpleGrid columns={{ base: 3, sm: 5 }} spacing={2} mb={5}>
                            {DOT_STYLES.map((d) => {
                              const active = dotStyle === d.id;
                              return (
                                <Box key={d.id} as="button"
                                  bg={active ? stepNumBg : sectionBg}
                                  color={active ? stepNumColor : textMuted}
                                  border="2px solid" borderColor={active ? accent : cardBorder}
                                  borderRadius="xl" py={3}
                                  fontWeight="600" fontSize="xs" textAlign="center"
                                  onClick={() => setDotStyle(d.id)}
                                  _hover={{ opacity: 0.85 }} transition="all 0.15s"
                                  boxShadow={active ? "0 0 0 3px " + accent + "33" : "none"}
                                >
                                  <Text fontSize="lg" mb={1}>{d.symbol}</Text>
                                  <Text>{d.label}</Text>
                                </Box>
                              );
                            })}
                          </SimpleGrid>

                          <SectionLabel>Preset Palettes</SectionLabel>
                          <SimpleGrid columns={{ base: 3, sm: 5 }} spacing={2} mb={5}>
                            {COLOR_PRESETS.map((p, i) => (
                              <Tooltip key={i} label={p.label} placement="top">
                                <Box as="button" w="full" h="36px" borderRadius="lg"
                                  border="2px solid" borderColor={activePreset === i ? accent : cardBorder}
                                  overflow="hidden" onClick={() => handleApplyPreset(i)}
                                  position="relative" _hover={{ transform: "scale(1.06)" }}
                                  transition="all 0.15s"
                                  boxShadow={activePreset === i ? "0 0 0 3px " + accent + "44" : "none"}>
                                  <Flex h="full"><Box flex={1} bg={p.fg} /><Box flex={1} bg={p.bg} /></Flex>
                                  {activePreset === i && (
                                    <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
                                      <Box bg="whiteAlpha.800" borderRadius="full" p="2px" color="green.600" fontSize="9px"><FaCheck /></Box>
                                    </Box>
                                  )}
                                </Box>
                              </Tooltip>
                            ))}
                          </SimpleGrid>

                          <SectionLabel>Custom Colors</SectionLabel>
                          <SimpleGrid columns={2} spacing={3} mb={4}>
                            <ColorRow label="QR Color" value={fgColor}
                              onChange={(v) => { setFgColor(v); setActivePreset(-1); }} />
                            <ColorRow label="Background" value={bgColor}
                              onChange={(v) => { setBgColor(v); setActivePreset(-1); }} />
                          </SimpleGrid>

                          <Button size="sm" variant="outline" borderColor={cardBorder} color={textMuted}
                            leftIcon={<FaExchangeAlt />} onClick={() => { const t = fgColor; setFgColor(bgColor); setBgColor(t); setActivePreset(-1); }}
                            borderRadius="lg" fontSize="xs">
                            Invert Colors
                          </Button>
                        </TabPanel>

                        {/* ─────────── LOGO TAB ─────────── */}
                        <TabPanel p={0}>
                          <SectionLabel>Select a logo</SectionLabel>
                          <SimpleGrid columns={{ base: 4, sm: 5 }} spacing={2} mb={4}>
                            {LOGO_PRESETS.map((logo) => {
                              const active = logoId === logo.id;
                              return (
                                <Tooltip key={logo.id} label={logo.label} placement="top">
                                  <Box as="button"
                                    bg={active ? logo.color : sectionBg}
                                    border="2px solid"
                                    borderColor={active ? accent : cardBorder}
                                    borderRadius="xl" h="52px"
                                    display="flex" flexDir="column" alignItems="center" justifyContent="center"
                                    onClick={() => setLogoId(logo.id)}
                                    _hover={{ opacity: 0.85, transform: "scale(1.06)" }}
                                    transition="all 0.15s"
                                    boxShadow={active ? "0 0 0 3px " + accent + "44" : "none"}
                                    position="relative"
                                  >
                                    {logo.id === "none" ? (
                                      <Text fontSize="xs" color={active ? "#fff" : textMuted} fontWeight="700">None</Text>
                                    ) : (
                                      <Text fontSize="xl">{logo.emoji}</Text>
                                    )}
                                    {active && (
                                      <Box position="absolute" top="4px" right="4px"
                                        w="12px" h="12px" bg="white" borderRadius="full"
                                        display="flex" alignItems="center" justifyContent="center"
                                        color="green.500" fontSize="8px">
                                        <FaCheck />
                                      </Box>
                                    )}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </SimpleGrid>

                          {/* Upload custom logo */}
                          <Box
                            as="button"
                            w="full"
                            border="2px dashed"
                            borderColor={logoId === "custom" ? accent : cardBorder}
                            borderRadius="xl" py={4}
                            display="flex" alignItems="center" justifyContent="center" gap={3}
                            color={textMuted} _hover={{ borderColor: accent, color: accent }}
                            transition="all 0.2s"
                            onClick={() => fileInputRef.current?.click()}
                            bg={logoId === "custom" ? accentLight : "transparent"}
                          >
                            <FaUpload />
                            <Text fontSize="sm" fontWeight="600">
                              {customLogoSrc && logoId === "custom" ? "✓ Custom logo selected" : "Drag & drop or click to upload a logo"}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>(JPG, PNG / 2MB max)</Text>
                          </Box>
                          <Box as="input" type="file" accept="image/*" ref={fileInputRef}
                            display="none" onChange={handleLogoUpload} />

                          {logoId !== "none" && (
                            <Box mt={3}>
                              <Text fontSize="xs" color={textMuted}>
                                💡 Use Error Correction Level <Box as="span" fontWeight="700" color={textPrimary}>H</Box> when adding a logo for best scannability.
                              </Text>
                            </Box>
                          )}
                        </TabPanel>

                        {/* ─────────── LEVEL TAB ─────────── */}
                        <TabPanel p={0}>
                          <SectionLabel>Error Correction Level</SectionLabel>
                          <SimpleGrid columns={4} spacing={2} mb={4}>
                            {EC_LEVELS.map((lv) => {
                              const active = ecLevel === lv.value;
                              return (
                                <Tooltip key={lv.value} label={lv.desc} placement="top">
                                  <Box as="button"
                                    bg={active ? stepNumBg : sectionBg}
                                    color={active ? stepNumColor : textMuted}
                                    border="2px solid"
                                    borderColor={active ? stepNumBg : cardBorder}
                                    borderRadius="xl" py={4}
                                    fontWeight="900" fontSize="xl"
                                    onClick={() => setEcLevel(lv.value)}
                                    _hover={{ opacity: 0.8 }} transition="all 0.15s"
                                    boxShadow={active ? "0 0 0 3px " + accent + "33" : "none"}
                                  >
                                    {lv.label}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </SimpleGrid>
                          <Box bg={sectionBg} borderRadius="lg" p={4} border="1px solid" borderColor={cardBorder}>
                            {EC_LEVELS.map((lv) => (
                              <HStack key={lv.value} spacing={3} mb={lv.value !== "H" ? 2 : 0}>
                                <Box w="24px" h="24px" bg={ecLevel === lv.value ? stepNumBg : cardBorder}
                                  color={ecLevel === lv.value ? stepNumColor : textMuted}
                                  borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                                  fontSize="10px" fontWeight="900" flexShrink={0}>
                                  {lv.label}
                                </Box>
                                <Text fontSize="xs" color={textMuted}>{lv.desc}</Text>
                              </HStack>
                            ))}
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionBox>
        </Box>

        {/* ══ RIGHT: Preview + Download ══ */}
        <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          w={{ base: "full", lg: "300px" }} flexShrink={0}>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl"
            overflow="hidden" position="sticky" top="20px">

            {/* Step 3 header */}
            <Flex align="center" px={5} pt={5} pb={4} borderBottom="1px solid" borderColor={cardBorder}>
              <HStack spacing={3}>
                <Flex w="28px" h="28px" borderRadius="full" bg={stepNumBg} color={stepNumColor}
                  align="center" justify="center" fontSize="xs" fontWeight="800">3</Flex>
                <Box>
                  <Text fontWeight="700" fontSize="md" color={textPrimary}>Download your QR</Text>
                  <Text fontSize="xs" color={textMuted}>High-quality PNG export</Text>
                </Box>
              </HStack>
            </Flex>

            {/* Canvas preview */}
            <Box px={5} py={5}>
              <Box bg={sectionBg} borderRadius="2xl" border="1px solid" borderColor={cardBorder}
                mb={4} minH="220px" display="flex" alignItems="center" justifyContent="center"
                position="relative" overflow="hidden" p={3}>
                {/* Canvas stays mounted at all times so canvasRef.current is never null
                    when the draw effect fires — only visibility toggles. */}
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "260px",
                    borderRadius: "10px",
                    display: qrValue ? "block" : "none",
                  }}
                />
                <AnimatePresence>
                  {!qrValue && (
                    <MotionBox key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }} textAlign="center">
                      <Box color={textMuted} fontSize="100px" mr={6} ml={5} opacity={0.25} mb={3}><FaQrcode /></Box>
                      <Text fontSize="sm" color={textMuted} fontWeight="500">Enter a URL to<br />generate your QR code</Text>
                    </MotionBox>
                  )}
                </AnimatePresence>

                {renderError && qrValue && (
                  <Box position="absolute" bottom="8px" left="8px" right="8px">
                    <Text fontSize="10px" color="red.400" textAlign="center">
                      Couldn't render preview — try again or check your input.
                    </Text>
                  </Box>
                )}

                {/* Corner brackets */}
                {qrValue && [
                  { top: "8px", left: "8px", borderRight: "none", borderBottom: "none" },
                  { top: "8px", right: "8px", borderLeft: "none", borderBottom: "none" },
                  { bottom: "8px", left: "8px", borderRight: "none", borderTop: "none" },
                  { bottom: "8px", right: "8px", borderLeft: "none", borderTop: "none" },
                ].map((pos, i) => (
                  <Box key={i} position="absolute" w="14px" h="14px"
                    border="2px solid" borderColor={accent} {...pos} borderRadius="2px" />
                ))}
              </Box>

              {/* URL chip */}
              {qrValue && (
                <MotionBox initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} mb={4}>
                  <HStack bg={sectionBg} px={3} py={2} borderRadius="lg" border="1px solid" borderColor={cardBorder} spacing={2}>
                    <Box color={accent} flexShrink={0} fontSize="xs"><FaLink /></Box>
                    <Text fontSize="xs" color={textMuted} noOfLines={1} flex={1} fontWeight="500">{normalizeUrl(urlInput)}</Text>
                  </HStack>
                </MotionBox>
              )}

              {/* Active options summary */}
              {qrValue && (
                <Flex gap={1.5} mb={4} flexWrap="wrap">
                  {[
                    dotStyle !== "square" && `${DOT_STYLES.find(d => d.id === dotStyle)?.label} dots`,
                    frameStyle !== "none" && FRAME_STYLES.find(f => f.id === frameStyle)?.label,
                    logoId !== "none" && (LOGO_PRESETS.find(l => l.id === logoId)?.label || "Custom logo"),
                    `Level ${ecLevel}`,
                  ].filter(Boolean).map((tag) => (
                    <Box key={String(tag)} bg={accentLight} color={accent} px={2} py={0.5}
                      borderRadius="md" fontSize="10px" fontWeight="700">
                      {tag}
                    </Box>
                  ))}
                </Flex>
              )}

              {/* Download button */}
              <Button
                w="full" size="md"
                bg={qrValue ? stepNumBg : sectionBg}
                color={qrValue ? stepNumColor : textMuted}
                _hover={qrValue ? { opacity: 0.88 } : {}}
                borderRadius="xl" fontWeight="700" fontSize="sm"
                leftIcon={isDownloading ? <Spinner size="xs" /> : <FaDownload />}
                onClick={handleDownloadPNG}
                isDisabled={!qrValue || isDownloading}
                transition="all 0.2s"
                _disabled={{ opacity: 0.38, cursor: "not-allowed" }}
                mb={2}
              >
                {isDownloading ? "Generating…" : "Download PNG"}
              </Button>
            </Box>

            {/* Footer */}
            <Box px={5} py={3.5} bg={sectionBg} borderTop="1px solid" borderColor={cardBorder}>
              <Text fontSize="xs" color={textMuted} textAlign="center">
                Generated{" "}
                <Box as="span" fontWeight="700" color={textPrimary}>locally in your browser</Box>
                . No data sent to servers.
              </Text>
            </Box>
          </Box>
        </MotionBox>
      </Flex>
    </Box>
  );
};

export default QRCodeGenerator;
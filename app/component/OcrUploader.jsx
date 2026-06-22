"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  VStack,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  Divider,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  SimpleGrid,
  Icon,
  IconButton,
  Textarea,
  Tooltip,
  Flex,
  useToast,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Send,
  Zap,
  Table as TableIcon,
  Layers,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Download,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Info,
  Lock,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import stores from "../store/stores";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Wrap framer-motion components for Chakra
const MotionBox = motion(Box);

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseOcrResponse(data) {
  const out = {
    paragraphs: [],
    tables: [],
    fields: null,
    rawText: "",
    boundingData: [],
  };
  if (!data?.results?.length) return out;

  for (const page of data.results) {
    const ocr = page?.ocr ?? {};

    if (ocr.paragraphs) {
      if (typeof ocr.paragraphs === "string") {
        const lines = ocr.paragraphs.split("\n").filter((l) => l.trim());
        lines.forEach((line) => {
          out.paragraphs.push({ text: line, boundingRegions: null });
        });
        out.rawText += ocr.paragraphs + "\n";
      } else if (Array.isArray(ocr.paragraphs)) {
        ocr.paragraphs.forEach((p) => {
          if (typeof p === "string") {
            out.paragraphs.push({ text: p, boundingRegions: null });
          } else {
            const text = p?.text ?? p?.content ?? JSON.stringify(p);
            if (text) {
              out.paragraphs.push({
                text,
                boundingRegions: p?.boundingRegions ?? null,
              });
            }
          }
        });
        out.rawText += out.paragraphs.map((p) => p.text).join("\n") + "\n";
      }
    }

    if (Array.isArray(ocr.tables)) {
      ocr.tables.forEach((tbl, idx) => {
        out.tables.push(normaliseTable(tbl, idx));
        out.boundingData.push(extractBoundingData(tbl, idx));
      });
    }

    if (page.fields && typeof page.fields === "object") {
      out.fields = { ...(out.fields ?? {}), ...page.fields };
    }
  }

  return out;
}

function normaliseTable(tbl, idx) {
  const title = `Table ${idx + 1}`;
  if (tbl.headers && tbl.rows) {
    const headers = tbl.headers.map((h) =>
      typeof h === "string" ? { text: h, boundingRegions: [] } : h,
    );
    const rows = tbl.rows.map((row) =>
      row.map((c) =>
        typeof c === "string" ? { text: c, boundingRegions: [] } : c,
      ),
    );
    return { title, headers, rows, tableBounds: tbl.boundingRegions ?? [] };
  }

  if (Array.isArray(tbl.cells)) {
    const rowCount = tbl.rowCount ?? 0;
    const colCount = tbl.columnCount ?? 0;
    const grid = Array.from({ length: rowCount }, () =>
      Array(colCount).fill(null),
    );
    let headerRowIndex = -1;

    tbl.cells.forEach((cell) => {
      grid[cell.rowIndex][cell.columnIndex] = {
        text: cell.content ?? "",
        boundingRegions: cell.boundingRegions ?? [],
        kind: cell.kind ?? "content",
      };
      if (cell.kind === "columnHeader") headerRowIndex = cell.rowIndex;
    });

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        if (!grid[r][c]) {
          grid[r][c] = { text: "", boundingRegions: [], kind: "content" };
        }
      }
    }

    const headers = headerRowIndex >= 0 ? grid[headerRowIndex] : [];
    const rows = grid.filter((_, i) => i !== headerRowIndex);
    return { title, headers, rows, tableBounds: tbl.boundingRegions ?? [] };
  }

  return { title, headers: [], rows: [], tableBounds: [] };
}

function extractBoundingData(tbl, idx) {
  const tableData = {
    title: `Table ${idx + 1}`,
    tableBounds: tbl.boundingRegions ?? [],
    cells: [],
  };

  if (Array.isArray(tbl.cells)) {
    tbl.cells.forEach((cell) => {
      tableData.cells.push({
        content: cell.content ?? "",
        kind: cell.kind ?? "content",
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        boundingRegions: cell.boundingRegions ?? [],
      });
    });
  }

  return tableData;
}

// ─── color palette for bounding boxes ────────────────────────────────────────
const BOX_COLORS = [
  {
    fill: "rgba(99, 102, 241, 0.12)",
    stroke: "rgba(99, 102, 241, 0.9)",
    label: "#6366f1",
  },
  {
    fill: "rgba(236, 72, 153, 0.12)",
    stroke: "rgba(236, 72, 153, 0.9)",
    label: "#ec4899",
  },
  {
    fill: "rgba(34, 197, 94, 0.12)",
    stroke: "rgba(34, 197, 94, 0.9)",
    label: "#22c55e",
  },
  {
    fill: "rgba(245, 158, 11, 0.12)",
    stroke: "rgba(245, 158, 11, 0.9)",
    label: "#f59e0b",
  },
  {
    fill: "rgba(14, 165, 233, 0.12)",
    stroke: "rgba(14, 165, 233, 0.9)",
    label: "#0ea5e9",
  },
  {
    fill: "rgba(168, 85, 247, 0.12)",
    stroke: "rgba(168, 85, 247, 0.9)",
    label: "#a855f7",
  },
];

const HEADER_COLOR = {
  fill: "rgba(251, 191, 36, 0.22)",
  stroke: "rgba(251, 191, 36, 0.95)",
  label: "#fbbf24",
};

function isNumericCell(cell) {
  return /^[\d,\.%\(\)₹$€£\s]+$/.test(String(cell).trim());
}

function normalizePageRange(input) {
  const val = (input || "").trim().toLowerCase();
  if (!val || val === "all") return "all";
  return val;
}

/** Point-in-polygon test (ray casting) */
function isPointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ParagraphsPanel({
  paragraphs,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
  onHoverItem,
}) {
  const toast = useToast();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "bottom-right",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!paragraphs.length)
    return <Text color={labelColor}>No paragraphs extracted.</Text>;

  return (
    <VStack align="stretch" spacing={5}>
      {paragraphs.map((p, i) => {
        const text = typeof p === "string" ? p : p.text;
        const bounds = typeof p === "string" ? null : p.boundingRegions;
        return (
          <FormControl
            key={i}
            onMouseEnter={() => {
              if (bounds && bounds.length > 0 && onHoverItem) {
                onHoverItem({
                  bounds,
                  type: "paragraph",
                  label: `Paragraph #${i + 1}`,
                  colorIndex: 0,
                });
              }
            }}
            onMouseLeave={() => {
              if (bounds && bounds.length > 0 && onHoverItem) {
                onHoverItem(null);
              }
            }}
          >
            <HStack justify="space-between" mb={1.5}>
              <FormLabel
                fontSize="xs"
                fontWeight="bold"
                color={labelColor}
                mb={0}
              >
                Paragraph #{i + 1}
              </FormLabel>
              <HStack spacing={1}>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Copy paragraph"
                  icon={
                    copiedIndex === i ? <Check size={12} /> : <Copy size={12} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(text, i);
                  }}
                />
                {/* <Icon as={Lock} boxSize={3.5} color="gray.400" /> */}
              </HStack>
            </HStack>
            <Textarea
              value={text}
              // isReadOnly
              fontSize="sm"
              color={textColor}
              bg={useColorModeValue("white", "gray.900")}
              borderColor={borderColor}
              borderRadius="xl"
              // cursor="not-allowed"
              rows={Math.max(2, Math.ceil(text.length / 85))}
              _focus={{ borderColor: borderColor }}
            />
          </FormControl>
        );
      })}
    </VStack>
  );
}

function TableExportModal({
  tables,
  isOpen,
  onClose,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
}) {
  const [selectedTables, setSelectedTables] = useState(
    new Set(tables.map((_, i) => i)),
  );

  const exportToCSV = () => {
    let csvContent = [];
    const tablesToExport = Array.from(selectedTables).sort((a, b) => a - b);

    tablesToExport.forEach((tableIdx) => {
      const tbl = tables[tableIdx];
      if (csvContent.length > 0) csvContent.push("");
      csvContent.push(`"${tbl.title}"`);

      if (tbl.headers.length > 0) {
        csvContent.push(
          tbl.headers
            .map((h) => `"${typeof h === "string" ? h : h.text}"`)
            .join(","),
        );
      }
      tbl.rows.forEach((row) => {
        csvContent.push(
          row
            .map((cell) => `"${typeof cell === "string" ? cell : cell.text}"`)
            .join(","),
        );
      });
    });

    const csv = csvContent.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ocr-tables-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    onClose();
  };

  const toggleTable = (idx) => {
    const newSet = new Set(selectedTables);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedTables(newSet);
  };

  return (
    <>
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={50}
          onClick={onClose}
        >
          <Box
            bg={sectionBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            p={6}
            maxW="sm"
            onClick={(e) => e.stopPropagation()}
            boxShadow="2xl"
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
              Export as CSV
            </Text>
            <VStack align="stretch" spacing={3} mb={5}>
              {tables.map((tbl, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTables.has(idx)}
                    onChange={() => toggleTable(idx)}
                    style={{ marginRight: "10px" }}
                  />
                  <Text fontSize="sm" color={textColor}>
                    {tbl.title}
                  </Text>
                </label>
              ))}
            </VStack>
            <HStack spacing={3}>
              <Button
                flex={1}
                size="sm"
                variant="outline"
                onClick={onClose}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                flex={1}
                size="sm"
                colorScheme="brand"
                borderRadius="xl"
                isDisabled={selectedTables.size === 0}
                onClick={exportToCSV}
              >
                Export
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </>
  );
}

function TablesPanel({
  tables,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
  onHoverItem,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!tables.length)
    return <Text color={labelColor}>No tables extracted.</Text>;

  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return String(text).toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <Box>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align="center" spacing={4}>
          <InputGroup maxW="260px" size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={14} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search table content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={sectionBg}
              borderColor={borderColor}
              borderRadius="xl"
              _focus={{ borderColor: "brand.400", boxShadow: "none" }}
            />
          </InputGroup>
          <Button
            size="sm"
            colorScheme="brand"
            onClick={() => setModalOpen(true)}
            leftIcon={<Download size={14} />}
            borderRadius="xl"
          >
            Export to CSV
          </Button>
        </HStack>

        {tables.map((tbl, ti) => {
          const tableBounds = tbl.tableBounds ?? [];
          return (
            <MotionBox
              key={ti}
              rounded="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              bg={sectionBg}
              onMouseEnter={() => {
                if (tableBounds.length > 0 && onHoverItem) {
                  onHoverItem({
                    bounds: tableBounds,
                    type: "table",
                    label: tbl.title,
                    colorIndex: ti,
                  });
                }
              }}
              onMouseLeave={() => {
                if (tableBounds.length > 0 && onHoverItem) {
                  onHoverItem(null);
                }
              }}
              _hover={{
                borderColor: "brand.300",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
              transition="all 0.2s"
            >
              <Box
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor={borderColor}
                bg={useColorModeValue("gray.50", "gray.850")}
              >
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  {tbl.title}
                </Text>
              </Box>
              <TableContainer overflowX="auto">
                <Table variant="simple" size="sm">
                  {tbl.headers.length > 0 && (
                    <Thead bg={useColorModeValue("gray.100", "gray.900")}>
                      <Tr>
                        {tbl.headers.map((h, hi) => {
                          const hText = typeof h === "string" ? h : h.text;
                          const hBounds =
                            typeof h === "string" ? null : h.boundingRegions;
                          return (
                            <Th
                              key={hi}
                              color={labelColor}
                              fontSize="xs"
                              py={3}
                              textTransform="uppercase"
                              onMouseEnter={(e) => {
                                if (
                                  hBounds &&
                                  hBounds.length > 0 &&
                                  onHoverItem
                                ) {
                                  e.stopPropagation();
                                  onHoverItem({
                                    bounds: hBounds,
                                    type: "cell",
                                    label: `${tbl.title} Header: ${hText}`,
                                    colorIndex: ti,
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                if (
                                  hBounds &&
                                  hBounds.length > 0 &&
                                  onHoverItem
                                ) {
                                  onHoverItem(null);
                                }
                              }}
                              _hover={{
                                bg: "brand.50",
                                color: "brand.600",
                              }}
                              style={{
                                cursor:
                                  hBounds && hBounds.length > 0
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {hText}
                            </Th>
                          );
                        })}
                      </Tr>
                    </Thead>
                  )}
                  <Tbody>
                    {tbl.rows.map((row, ri) => (
                      <Tr
                        key={ri}
                        _hover={{
                          bg: useColorModeValue(
                            "blackAlpha.50",
                            "whiteAlpha.50",
                          ),
                        }}
                      >
                        {row.map((cell, ci) => {
                          const cellText =
                            typeof cell === "string" ? cell : cell.text;
                          const cellBounds =
                            typeof cell === "string"
                              ? null
                              : cell.boundingRegions;
                          const isMatch =
                            searchQuery && matchesSearch(cellText);
                          return (
                            <Td
                              key={ci}
                              fontSize="sm"
                              color={textColor}
                              isNumeric={isNumericCell(cellText)}
                              bg={isMatch ? "yellow.100" : "transparent"}
                              _dark={{
                                bg: isMatch ? "yellow.900" : "transparent",
                              }}
                              py={3}
                              onMouseEnter={(e) => {
                                if (
                                  cellBounds &&
                                  cellBounds.length > 0 &&
                                  onHoverItem
                                ) {
                                  e.stopPropagation();
                                  onHoverItem({
                                    bounds: cellBounds,
                                    type: "cell",
                                    label: `${tbl.title} Cell (${ri + 1}, ${ci + 1}): ${cellText}`,
                                    colorIndex: ti,
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                if (
                                  cellBounds &&
                                  cellBounds.length > 0 &&
                                  onHoverItem
                                ) {
                                  onHoverItem(null);
                                }
                              }}
                              _hover={{
                                bg: "brand.50",
                                color: "brand.700",
                                fontWeight: "medium",
                              }}
                              style={{
                                cursor:
                                  cellBounds && cellBounds.length > 0
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {cellText}
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </MotionBox>
          );
        })}
      </VStack>

      <TableExportModal
        tables={tables}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        labelColor={labelColor}
        textColor={textColor}
        sectionBg={sectionBg}
        borderColor={borderColor}
      />
    </Box>
  );
}

function FieldsPanel({
  fields,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
  onHoverItem,
}) {
  const toast = useToast();
  const [copiedKey, setCopiedKey] = useState(null);

  const copyValue = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({
      title: `Copied ${key}`,
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "bottom-right",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!fields || !Object.keys(fields).length)
    return <Text color={labelColor}>No form fields extracted.</Text>;

  const getFieldValueText = (val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val !== "object") return String(val);
    if ("valueString" in val) return String(val.valueString);
    if ("valueDate" in val) return String(val.valueDate);
    if ("valueNumber" in val) return String(val.valueNumber);
    if ("valueInteger" in val) return String(val.valueInteger);
    if ("valuePhoneNumber" in val) return String(val.valuePhoneNumber);
    if ("valueSelectionMark" in val) return String(val.valueSelectionMark);
    if ("valueSignature" in val) return String(val.valueSignature);
    if ("valueCountryRegion" in val) return String(val.valueCountryRegion);
    if ("content" in val) return String(val.content);
    return null;
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
      {Object.entries(fields).map(([key, value]) => {
        const bounds = value?.boundingRegions ?? null;
        const textValue = getFieldValueText(value) || JSON.stringify(value);
        return (
          <FormControl
            key={key}
            onMouseEnter={() => {
              if (bounds && bounds.length > 0 && onHoverItem) {
                onHoverItem({
                  bounds,
                  type: "field",
                  label: `Field: ${key}`,
                  colorIndex: 3,
                });
              }
            }}
            onMouseLeave={() => {
              if (bounds && bounds.length > 0 && onHoverItem) {
                onHoverItem(null);
              }
            }}
          >
            <HStack justify="space-between" mb={1.5}>
              <FormLabel
                fontSize="xs"
                fontWeight="bold"
                color={labelColor}
                mb={0}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {key}
              </FormLabel>
              <HStack spacing={1}>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Copy field value"
                  icon={
                    copiedKey === key ? <Check size={12} /> : <Copy size={12} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    copyValue(key, textValue);
                  }}
                />
                {/* <Icon as={Lock} boxSize={3.5} color="gray.400" /> */}
              </HStack>
            </HStack>
            <Input
              value={textValue}
              // isReadOnly
              fontSize="sm"
              color={textColor}
              bg={useColorModeValue("white", "gray.900")}
              borderColor={borderColor}
              borderRadius="xl"
              // cursor="not-allowed"
              _focus={{ borderColor: borderColor }}
            />
          </FormControl>
        );
      })}
    </SimpleGrid>
  );
}

function RawTextPanel({ rawText, textColor, sectionBg, borderColor }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    toast({
      title: "Copied all text",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "bottom-right",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!rawText) return;
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `document-raw-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    toast({
      title: "Downloaded as TXT file",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "bottom-right",
    });
  };

  return (
    <Box
      rounded="2xl"
      bg={sectionBg}
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
    >
      <HStack
        px={4}
        py={2}
        borderBottomWidth="1px"
        borderColor={borderColor}
        justify="space-between"
        bg={useColorModeValue("gray.50", "gray.850")}
      >
        <HStack spacing={2}>
          <Box w={3} h={3} rounded="full" bg="red.400" />
          <Box w={3} h={3} rounded="full" bg="yellow.400" />
          <Box w={3} h={3} rounded="full" bg="green.400" />
          <Text fontSize="xs" fontWeight="medium" color={textColor} pl={2}>
            document-raw.txt
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Button
            size="xs"
            variant="outline"
            leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
            onClick={copyAll}
            borderRadius="lg"
          >
            Copy All
          </Button>
          <Button
            size="xs"
            colorScheme="brand"
            leftIcon={<Download size={12} />}
            onClick={downloadTxt}
            borderRadius="lg"
            isDisabled={!rawText}
          >
            Download TXT
          </Button>
        </HStack>
      </HStack>
      <Code
        display="block"
        whiteSpace="pre-wrap"
        fontSize="xs"
        p={4}
        bg="transparent"
        color={textColor}
        maxH="500px"
        overflowY="auto"
        fontFamily="JetBrains Mono, SFMono-Regular, Consolas, Monaco, monospace"
      >
        {rawText || "No raw text available."}
      </Code>
    </Box>
  );
}

function AiPromptPanel({
  prompt,
  setPrompt,
  apiResponse,
  onSendPrompt,
  loading,
  error,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
}) {
  const presets = [
    {
      label: "Summarize document",
      text: "Provide a concise summary of this document, listing the main points.",
    },
    {
      label: "List line items",
      text: "Extract all table line items and list them in a structured table or bullet list.",
    },
    {
      label: "Extract metadata",
      text: "Find the key dates, invoice numbers, total amounts, and participant names.",
    },
    {
      label: "Convert to JSON",
      text: "Convert the main structured data in this document to a clean JSON object.",
    },
  ];

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text
          fontSize="10px"
          color={labelColor}
          fontWeight="bold"
          mb={2}
          letterSpacing="wide"
        >
          SUGGESTED TASKS
        </Text>
        <HStack flexWrap="wrap" gap={2}>
          {presets.map((p, i) => (
            <Badge
              key={i}
              px={3}
              py={1.5}
              borderRadius="full"
              variant="subtle"
              colorScheme="brand"
              fontSize="xs"
              cursor="pointer"
              transition="all 0.15s"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "sm",
                opacity: 0.8,
              }}
              onClick={() => setPrompt(p.text)}
            >
              {p.label}
            </Badge>
          ))}
        </HStack>
      </Box>

      <FormControl isRequired>
        <FormLabel color={labelColor} fontSize="xs" fontWeight="bold">
          INSTRUCTION
        </FormLabel>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Summarize this invoice, extract total amount, list all line items..."
          minH="120px"
          resize="vertical"
          borderRadius="xl"
          bg={sectionBg}
          borderColor={borderColor}
          color={textColor}
          _placeholder={{ color: "gray.400" }}
          _focus={{ borderColor: "brand.400", boxShadow: "none" }}
        />
      </FormControl>

      {error && (
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Button
        leftIcon={<Send size={14} />}
        colorScheme="brand"
        onClick={onSendPrompt}
        isLoading={loading}
        loadingText="Sending..."
        isDisabled={!prompt.trim()}
        borderRadius="xl"
        alignSelf="flex-start"
        px={6}
      >
        Submit Instruction
      </Button>

      {apiResponse && (
        <FormControl mt={2}>
          <FormLabel color={labelColor} fontSize="xs" fontWeight="bold">
            AI RESPONSE
          </FormLabel>
          <Box
            p={4}
            rounded="2xl"
            bg={sectionBg}
            borderWidth="1px"
            borderColor={borderColor}
            position="relative"
          >
            <IconButton
              size="xs"
              position="absolute"
              top={3}
              right={3}
              variant="ghost"
              aria-label="Copy AI response"
              icon={<Copy size={12} />}
              onClick={() => navigator.clipboard.writeText(apiResponse)}
            />
            <Code
              display="block"
              whiteSpace="pre-wrap"
              fontSize="xs"
              bg="transparent"
              color={textColor}
              maxH="300px"
              overflowY="auto"
              fontFamily="system-ui, sans-serif"
            >
              {apiResponse}
            </Code>
          </Box>
        </FormControl>
      )}
    </VStack>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OcrUploader() {
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]); // Holds rendered pages: [{ url, width, height, pageNum }]
  const [fileType, setFileType] = useState(null);
  const pdfFileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pages, setPages] = useState("");
  const [extractParagraphs, setExtractParagraphs] = useState(true);
  const [extractTables, setExtractTables] = useState(false);
  const [extractFields, setExtractFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Chrome PDF viewer page states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageInput, setCurrentPageInput] = useState("1");

  // AI Drawer Disclosure
  const {
    isOpen: isAiOpen,
    onOpen: onAiOpen,
    onClose: onAiClose,
  } = useDisclosure();

  // States and refs for preview highlight overlay
  const canvasRefs = useRef([]);
  const [hoveredBounds, setHoveredBounds] = useState(null);

  // Colors
  const bg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const sectionBg = useColorModeValue("gray.50", "gray.950");
  const dragBg = useColorModeValue("brand.50", "rgba(99, 102, 241, 0.08)");
  const fileIconBg = useColorModeValue("blue.50", "rgba(10, 110, 240, 0.1)");
  const fileIconColor = useColorModeValue("blue.600", "blue.300");

  const {
    themeStore: { themeConfig },
  } = stores;
  const brandColor = themeConfig.colors?.brand?.[500] || "#3182ce";

  // Zoom / Pan / Rotation states
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const viewportRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleResetZoom = () => {
    setZoom(1.0);
    setRotation(0);
    if (viewportRef.current) {
      viewportRef.current.scrollLeft = 0;
      viewportRef.current.scrollTop = 0;
    }
  };

  const handleFitWidth = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const padding = 32;
    const availableWidth = viewport.clientWidth - padding;
    const baseWidth = 600;
    const newZoom = availableWidth / baseWidth;
    setZoom(Math.max(0.5, Math.min(newZoom, 3.0)));
  };

  const handleFitPage = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const padding = 32;
    const availableHeight = viewport.clientHeight - padding;
    const baseHeight = 800;
    const newZoom = availableHeight / baseHeight;
    setZoom(Math.max(0.5, Math.min(newZoom, 3.0)));
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - viewport.offsetLeft;
    startYRef.current = e.pageY - viewport.offsetTop;
    scrollLeftRef.current = viewport.scrollLeft;
    scrollTopRef.current = viewport.scrollTop;
  };

  const clearAll = () => {
    // File & Preview
    setFile(null);
    setPdfPages([]);
    setFileType(null);
    pdfFileRef.current = null;

    // OCR Data
    setParsed(null);
    setError(null);

    // Form Fields
    setPages("");
    setExtractParagraphs(true);
    setExtractTables(false);
    setExtractFields(false);

    // AI
    setAiPrompt("");
    setAiResponse("");
    setAiError(null);

    // Preview States
    setHoveredBounds(null);
    setZoom(1.0);
    setRotation(0);

    // PDF Navigation
    setCurrentPage(1);
    setCurrentPageInput("1");

    // Loading States
    setLoading(false);
    setAiLoading(false);

    // Cleanup blob URLs
    pdfPages.forEach((page) => {
      if (page.url?.startsWith("blob:")) {
        URL.revokeObjectURL(page.url);
      }
    });
  };
  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    e.preventDefault();
    const x = e.pageX - viewport.offsetLeft;
    const y = e.pageY - viewport.offsetTop;
    const walkX = (x - startXRef.current) * 1.5;
    const walkY = (y - startYRef.current) * 1.5;
    viewport.scrollLeft = scrollLeftRef.current - walkX;
    viewport.scrollTop = scrollTopRef.current - walkY;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  const pageWidthInches = useMemo(() => {
    let maxX = 0;
    if (parsed?.tables) {
      parsed.tables.forEach((tbl) => {
        tbl.tableBounds?.forEach((r) =>
          r.polygon?.forEach((p) => {
            if (p.x > maxX) maxX = p.x;
          }),
        );
        tbl.headers?.forEach((h) =>
          h.boundingRegions?.forEach((r) =>
            r.polygon?.forEach((p) => {
              if (p.x > maxX) maxX = p.x;
            }),
          ),
        );
        tbl.rows?.forEach((row) =>
          row.forEach((c) =>
            c.boundingRegions?.forEach((r) =>
              r.polygon?.forEach((p) => {
                if (p.x > maxX) maxX = p.x;
              }),
            ),
          ),
        );
      });
    }
    if (parsed?.paragraphs && Array.isArray(parsed.paragraphs)) {
      parsed.paragraphs.forEach((p) => {
        if (p.boundingRegions) {
          p.boundingRegions.forEach((r) =>
            r.polygon?.forEach((p) => {
              if (p.x > maxX) maxX = p.x;
            }),
          );
        }
      });
    }
    if (parsed?.fields && typeof parsed.fields === "object") {
      Object.values(parsed.fields).forEach((val) => {
        if (val && typeof val === "object" && val.boundingRegions) {
          val.boundingRegions.forEach((r) =>
            r.polygon?.forEach((p) => {
              if (p.x > maxX) maxX = p.x;
            }),
          );
        }
      });
    }
    return maxX > 6 ? maxX + 0.15 : 8.5;
  }, [parsed]);

  const drawPreviewBoxes = useCallback(() => {
    // Clear all page canvases
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    if (
      !hoveredBounds ||
      !hoveredBounds.bounds ||
      hoveredBounds.bounds.length === 0
    )
      return;

    hoveredBounds.bounds.forEach((region) => {
      const pageNum = region.pageNumber || 1;
      const canvas = canvasRefs.current[pageNum - 1];
      if (!canvas) return;

      const page = pdfPages[pageNum - 1];
      if (!page) return;

      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      const scaleX = width / pageWidthInches;
      const scaleY = height / (pageWidthInches * (height / width));

      const drawPolygon = (polygon, fillColor, strokeColor, lineWidth = 2) => {
        if (!polygon || polygon.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(polygon[0].x * scaleX, polygon[0].y * scaleY);
        for (let i = 1; i < polygon.length; i++) {
          ctx.lineTo(polygon[i].x * scaleX, polygon[i].y * scaleY);
        }
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth * (width / 500);
        ctx.stroke();
      };

      const color = BOX_COLORS[hoveredBounds.colorIndex % BOX_COLORS.length];
      const fill =
        hoveredBounds.type === "cell"
          ? "rgba(251, 191, 36, 0.35)"
          : color.fill
              .replace("0.12", "0.25")
              .replace("0.22", "0.4")
              .replace("0.05", "0.2");
      const stroke = hoveredBounds.type === "cell" ? "#fbbf24" : color.stroke;

      drawPolygon(region.polygon, fill, stroke, 2);

      if (hoveredBounds.label) {
        const minX = Math.min(...region.polygon.map((p) => p.x)) * scaleX;
        const minY = Math.min(...region.polygon.map((p) => p.y)) * scaleY;

        const labelText = hoveredBounds.label;
        const fontSize = Math.max(12, Math.round(width / 60));
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
        const metrics = ctx.measureText(labelText);
        const labelW = metrics.width + fontSize * 1.2;
        const labelH = fontSize * 1.8;
        const labelY = minY - labelH - 4 > 0 ? minY - labelH - 4 : minY + 4;

        ctx.fillStyle = stroke;
        ctx.beginPath();
        ctx.roundRect(minX, labelY, labelW, labelH, fontSize / 4);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, minX + fontSize * 0.6, labelY + labelH / 2);
      }
    });
  }, [hoveredBounds, pdfPages, pageWidthInches]);

  useEffect(() => {
    drawPreviewBoxes();
  }, [drawPreviewBoxes]);

  // Sync scroll position with page number indicator
  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const pageContainers = viewport.querySelectorAll(".pdf-page-container");
    const viewportRect = viewport.getBoundingClientRect();
    let detectedPage = 1;
    let minDiff = Infinity;

    pageContainers.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top - viewportRect.top);
      if (diff < minDiff) {
        minDiff = diff;
        detectedPage = index + 1;
      }
    });

    setCurrentPage(detectedPage);
  }, []);

  useEffect(() => {
    setCurrentPageInput(currentPage.toString());
  }, [currentPage]);

  // Jump to specific page
  const jumpToPage = useCallback(
    (pageNum) => {
      if (pageNum < 1 || pageNum > pdfPages.length) return;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const targetPage = viewport.querySelector(
        `#pdf-page-container-${pageNum}`,
      );
      if (targetPage) {
        const offsetTop = targetPage.offsetTop;
        viewport.scrollTo({ top: offsetTop, behavior: "smooth" });
        setCurrentPage(pageNum);
      }
    },
    [pdfPages.length],
  );

  // Render all PDF pages to data URL array
  const renderPdfToPages = useCallback(async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pagesData = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5; // Good balance of resolution and speed
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
        );
        const url = URL.createObjectURL(blob);

        pagesData.push({
          url,
          width: viewport.width,
          height: viewport.height,
          aspectRatio: viewport.width / viewport.height,
          pageNum: i,
        });
      }
      return pagesData;
    } catch (err) {
      console.error("PDF render error:", err);
      return [];
    }
  }, []);

  const applyFile = useCallback(
    async (selected) => {
      if (!selected) return;
      setFile(selected);
      setFileType(selected.type.startsWith("image/") ? "image" : "pdf");
      setPdfPages([]);
      setZoom(1.0);
      setRotation(0);
      setCurrentPage(1);
      setCurrentPageInput("1");

      if (selected.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(selected);
        setPdfPages([{ url: objectUrl, pageNum: 1 }]);
      } else {
        pdfFileRef.current = selected;
        const pagesData = await renderPdfToPages(selected);
        setPdfPages(pagesData);
      }
    },
    [renderPdfToPages],
  );

  const handleFileChange = (e) => {
    applyFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    pdfPages.forEach((p) => {
      if (p.url && p.url.startsWith("blob:")) URL.revokeObjectURL(p.url);
    });
    setFile(null);
    setPdfPages([]);
    setFileType(null);
    setParsed(null);
    setPages("");
    setError(null);
    setIsDragging(false);
    setHoveredBounds(null);
    setZoom(1.0);
    setRotation(0);
    setCurrentPage(1);
    setCurrentPageInput("1");
  };

  useEffect(() => {
    return () => {
      pdfPages.forEach((p) => {
        if (p.url && p.url.startsWith("blob:")) URL.revokeObjectURL(p.url);
      });
    };
  }, [pdfPages]);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setParsed(null);
    setHoveredBounds(null);
    setZoom(1.0);
    setRotation(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", normalizePageRange(pages));
    formData.append("extractParagraphs", extractParagraphs);
    formData.append("extractTables", extractTables);
    formData.append("extractFields", extractFields);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ocr`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OCR request failed");
      setParsed(parseOcrResponse(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAiPrompt = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a prompt.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      setAiResponse(
        `AI Analysis Complete.\n\nInstruction: "${aiPrompt.trim()}"\n\nResult:\nThis is a custom response from the AI helper drawer. Connect to your live API backend endpoints to execute instructions on paragraphs, table layouts, and metadata attributes.`,
      );
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const showParagraphsTab = extractParagraphs && parsed?.paragraphs?.length > 0;
  const showTablesTab = extractTables && parsed?.tables?.length > 0;
  const showFieldsTab =
    extractFields && parsed?.fields && Object.keys(parsed.fields).length > 0;
  const showForm = !parsed;
  const isRenderingPdf = file && fileType === "pdf" && pdfPages.length === 0;

  return (
    <Box minH="100vh" bg={bg} color={textColor} p={0} m={0}>
      <AnimatePresence mode="wait">
        {showForm ? (
          // ─── Welcome/Upload View (Edge-to-Edge Full Screen) ───
          <MotionBox
            key="upload-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            w="100%"
            minH="100vh"
          >
            <Box bg={cardBg} minH="100vh" display="flex" flexDirection="column">
              <Box
                bg={`linear-gradient(135deg, ${brandColor}10, transparent)`}
                p={8}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <HStack spacing={3} mb={2} maxW="7xl" mx="auto" w="full">
                  <Box
                    p={2.5}
                    borderRadius="2xl"
                    bg="brand.500"
                    color="white"
                    shadow="md"
                  >
                    <Zap size={22} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading
                      size="lg"
                      fontWeight="extrabold"
                      letterSpacing="-0.5px"
                    >
                      OCR Document Workspace
                    </Heading>
                    <Text fontSize="sm" color={labelColor}>
                      Extract structured tables, flow paragraphs, and key-value
                      forms seamlessly.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box flex={1} p={{ base: 6, md: 12 }}>
                <form onSubmit={handleSubmit} style={{ height: "100%" }}>
                  <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    spacing={12}
                    maxW="7xl"
                    mx="auto"
                    w="full"
                  >
                    {/* Left: Drag & Drop Zone */}
                    <VStack align="stretch" spacing={4}>
                      <FormLabel
                        color={labelColor}
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="wider"
                        textTransform="uppercase"
                      >
                        Upload Document
                      </FormLabel>

                      <MotionBox
                        position="relative"
                        border="2px dashed"
                        borderColor={isDragging ? "brand.400" : borderColor}
                        borderRadius="2xl"
                        bg={isDragging ? dragBg : "transparent"}
                        py={16}
                        px={6}
                        textAlign="center"
                        cursor="pointer"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        _hover={{ borderColor: "brand.400", bg: dragBg }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                      >
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          position="absolute"
                          top={0}
                          left={0}
                          width="100%"
                          height="100%"
                          opacity={0}
                          cursor="pointer"
                          zIndex={1}
                        />
                        <VStack spacing={3} pointerEvents="none">
                          <MotionBox
                            animate={isDragging ? { y: -5 } : { y: 0 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              repeatType: "reverse",
                            }}
                            w={14}
                            h={14}
                            borderRadius="2xl"
                            bg={useColorModeValue("gray.50", "gray.800")}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            shadow="inner"
                          >
                            <Upload size={24} color={brandColor} />
                          </MotionBox>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={textColor}
                          >
                            Drag and drop document here
                          </Text>
                          <Text fontSize="xs" color={labelColor}>
                            or{" "}
                            <Text as="span" color="brand.400" fontWeight="bold">
                              browse files
                            </Text>
                          </Text>
                        </VStack>
                      </MotionBox>

                      <HStack spacing={2} flexWrap="wrap">
                        {["PDF", "JPG", "PNG", "MAX 10MB"].map((tag) => (
                          <Badge
                            key={tag}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="10px"
                            colorScheme="gray"
                            variant="solid"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack>

                      {file && (
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.850")}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="xl"
                        >
                          <HStack spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              borderRadius="lg"
                              bg={fileIconBg}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <FileText size={18} color={fileIconColor} />
                            </Box>
                            <Box flex={1} minW={0}>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={textColor}
                                noOfLines={1}
                              >
                                {file.name}
                              </Text>
                              <Text fontSize="xs" color={labelColor}>
                                {(file.size / 1024).toFixed(1)} KB
                                {fileType && (
                                  <Badge
                                    ml={2}
                                    colorScheme={
                                      fileType === "image" ? "green" : "blue"
                                    }
                                    variant="subtle"
                                    fontSize="9px"
                                  >
                                    {fileType.toUpperCase()}
                                  </Badge>
                                )}
                              </Text>
                            </Box>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              aria-label="Remove file"
                              icon={<X size={16} />}
                              onClick={removeFile}
                              borderRadius="full"
                            />
                          </HStack>
                        </MotionBox>
                      )}
                    </VStack>

                    {/* Right: Extraction Configuration */}
                    <VStack align="stretch" spacing={5}>
                      <FormLabel
                        color={labelColor}
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="wider"
                        textTransform="uppercase"
                      >
                        Analysis Settings
                      </FormLabel>

                      <FormControl>
                        <FormLabel
                          fontSize="xs"
                          color={labelColor}
                          fontWeight="semibold"
                        >
                          PAGE RANGE
                        </FormLabel>
                        <Input
                          value={pages}
                          onChange={(e) => setPages(e.target.value)}
                          placeholder="e.g. 1, 3, 5-8 (leave blank for all)"
                          borderRadius="xl"
                          bg={sectionBg}
                          borderColor={borderColor}
                          _focus={{
                            borderColor: "brand.400",
                            boxShadow: "none",
                          }}
                        />
                        <Text fontSize="11px" color={labelColor} mt={1}>
                          Currently active:{" "}
                          <Text as="span" fontWeight="bold" color={textColor}>
                            {pages.trim() ? `Pages ${pages}` : "All Pages"}
                          </Text>
                        </Text>
                      </FormControl>

                      <Box
                        p={4}
                        rounded="2xl"
                        border="1px solid"
                        borderColor={borderColor}
                        bg={sectionBg}
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color={labelColor}
                          mb={3}
                          letterSpacing="wider"
                          textTransform="uppercase"
                        >
                          EXTRACT FEATURES
                        </Text>
                        <VStack spacing={3} align="stretch">
                          <HStack
                            p={3}
                            rounded="xl"
                            borderWidth="1px"
                            borderColor={
                              extractParagraphs ? "brand.400" : borderColor
                            }
                            bg={
                              extractParagraphs
                                ? `${brandColor}05`
                                : "transparent"
                            }
                            cursor="pointer"
                            onClick={() =>
                              setExtractParagraphs(!extractParagraphs)
                            }
                            _hover={{ borderColor: "brand.300" }}
                            transition="all 0.15s"
                          >
                            <Box
                              color={
                                extractParagraphs ? brandColor : "gray.400"
                              }
                              mr={1}
                            >
                              <FileText size={18} />
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="xs" fontWeight="bold">
                                Flowing Paragraphs
                              </Text>
                              <Text fontSize="10px" color={labelColor}>
                                Reads standard sentence structures and page
                                layout blocks
                              </Text>
                            </VStack>
                            <Checkbox
                              isChecked={extractParagraphs}
                              pointerEvents="none"
                              colorScheme="brand"
                            />
                          </HStack>

                          <HStack
                            p={3}
                            rounded="xl"
                            borderWidth="1px"
                            borderColor={
                              extractTables ? "brand.400" : borderColor
                            }
                            bg={
                              extractTables ? `${brandColor}05` : "transparent"
                            }
                            cursor="pointer"
                            onClick={() => setExtractTables(!extractTables)}
                            _hover={{ borderColor: "brand.300" }}
                            transition="all 0.15s"
                          >
                            <Box
                              color={extractTables ? brandColor : "gray.400"}
                              mr={1}
                            >
                              <TableIcon size={18} />
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="xs" fontWeight="bold">
                                Structured Tables
                              </Text>
                              <Text fontSize="10px" color={labelColor}>
                                Maps tabular items into digital spreadsheets +
                                bounding boxes
                              </Text>
                            </VStack>
                            <Checkbox
                              isChecked={extractTables}
                              pointerEvents="none"
                              colorScheme="brand"
                            />
                          </HStack>

                          <HStack
                            p={3}
                            rounded="xl"
                            borderWidth="1px"
                            borderColor={
                              extractFields ? "brand.400" : borderColor
                            }
                            bg={
                              extractFields ? `${brandColor}05` : "transparent"
                            }
                            cursor="pointer"
                            onClick={() => setExtractFields(!extractFields)}
                            _hover={{ borderColor: "brand.300" }}
                            transition="all 0.15s"
                          >
                            <Box
                              color={extractFields ? brandColor : "gray.400"}
                              mr={1}
                            >
                              <Layers size={18} />
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="xs" fontWeight="bold">
                                Form Fields & Key-Values
                              </Text>
                              <Text fontSize="10px" color={labelColor}>
                                Identifies metadata labels, dates, fields, and
                                checkboxes
                              </Text>
                            </VStack>
                            <Checkbox
                              isChecked={extractFields}
                              pointerEvents="none"
                              colorScheme="brand"
                            />
                          </HStack>
                        </VStack>
                      </Box>

                      {error && (
                        <Alert status="error" borderRadius="xl">
                          <AlertIcon />
                          {error}
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        size="lg"
                        width="full"
                        colorScheme="brand"
                        isDisabled={loading || !file || isRenderingPdf}
                        borderRadius="2xl"
                        shadow="md"
                        _hover={{ shadow: "lg" }}
                      >
                        {loading ? (
                          <HStack justify="center" spacing={3}>
                            <Spinner size="sm" />
                            <Text fontSize="sm">
                              Reading document stream...
                            </Text>
                          </HStack>
                        ) : isRenderingPdf ? (
                          <HStack justify="center" spacing={3}>
                            <Spinner size="sm" />
                            <Text fontSize="sm">Rendering PDF pages...</Text>
                          </HStack>
                        ) : (
                          <HStack spacing={2}>
                            <Zap size={18} />
                            <Text>Execute Analysis</Text>
                          </HStack>
                        )}
                      </Button>
                    </VStack>
                  </SimpleGrid>
                </form>
              </Box>
            </Box>
          </MotionBox>
        ) : (
          // ─── Workspace View (Edge-to-Edge Split Screen) ───
          <MotionBox
            key="workspace-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            w="100%"
            minH="100vh"
            display="flex"
            flexDirection="column"
          >
            {/* Top Navigation Bar */}
            <Flex
              justify="space-between"
              align="center"
              bg={cardBg}
              px={6}
              py={4}
              borderBottomWidth="1px"
              borderColor={borderColor}
              flexDirection={{ base: "column", md: "row" }}
              gap={4}
            >
              <HStack spacing={3}>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Back to config"
                  icon={<ArrowLeft size={16} />}
                  onClick={removeFile}
                  borderRadius="xl"
                />
                <VStack align="start" spacing={0}>
                  <HStack>
                    <Heading size="xs" fontWeight="bold">
                      {file?.name}
                    </Heading>
                    <Badge colorScheme="green" variant="subtle" fontSize="9px">
                      PROCESSED
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={labelColor}>
                    Size: {(file?.size / 1024).toFixed(1)} KB · Format:{" "}
                    {fileType?.toUpperCase()}
                  </Text>
                </VStack>
              </HStack>

              {/* Stats Summary */}
              {/* <HStack spacing={6} flexWrap="wrap">
                <Box textAlign="center" px={3} borderRightWidth="1px" borderColor={borderColor}>
                  <Text fontSize="10px" color={labelColor} fontWeight="semibold" textTransform="uppercase">PARAGRAPHS</Text>
                  <Text fontSize="md" fontWeight="bold" color="brand.500">{parsed.paragraphs.length}</Text>
                </Box>
                <Box textAlign="center" px={3} borderRightWidth="1px" borderColor={borderColor}>
                  <Text fontSize="10px" color={labelColor} fontWeight="semibold" textTransform="uppercase">TABLES</Text>
                  <Text fontSize="md" fontWeight="bold" color="purple.500">{parsed.tables.length}</Text>
                </Box>
                <Box textAlign="center" px={3} borderRightWidth="1px" borderColor={borderColor}>
                  <Text fontSize="10px" color={labelColor} fontWeight="semibold" textTransform="uppercase">FIELDS</Text>
                  <Text fontSize="md" fontWeight="bold" color="teal.500">{parsed.fields ? Object.keys(parsed.fields).length : 0}</Text>
                </Box>
                <Box textAlign="center" px={3}>
                  <Text fontSize="10px" color={labelColor} fontWeight="semibold" textTransform="uppercase">CHARACTERS</Text>
                  <Text fontSize="md" fontWeight="bold" color="orange.500">{parsed.rawText.length.toLocaleString()}</Text>
                </Box>
              </HStack> */}
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Trash2 size={18} />}
                aria-label="clear"
                onClick={clearAll}
              />
            </Flex>

            {/* Split Panels Container */}
            <Flex
              flex={1}
              flexDirection={{ base: "column", lg: "row" }}
              minH={0}
            >
              {/* Left Side: Document Preview (45% split) */}
              <Box
                flex={{ base: "none", lg: 4.5 }}
                borderRightWidth={{ base: "0px", lg: "1px" }}
                borderBottomWidth={{ base: "1px", lg: "0px" }}
                borderColor={borderColor}
                bg={sectionBg}
                p={6}
                display="flex"
                flexDirection="column"
                maxH={{ lg: "calc(100vh - 73px)" }}
                overflow="hidden"
              >
                <Flex align="center" justify="space-between" mb={4}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={labelColor}
                    letterSpacing="wider"
                    textTransform="uppercase"
                  >
                    DOCUMENT WORKSPACE MAP
                  </Text>
                </Flex>

                {pdfPages.length === 0 ? (
                  <Box
                    p={8}
                    textAlign="center"
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={sectionBg}
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Spinner size="md" color="brand.400" mb={3} />
                    <Text fontSize="sm" color={labelColor}>
                      Loading document preview pages...
                    </Text>
                  </Box>
                ) : (
                  <>
                    {/* Chrome-like PDF Toolbar */}
                    <HStack
                      w="100%"
                      bg={useColorModeValue("white", "gray.900")}
                      p={2}
                      mb={4}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor={borderColor}
                      shadow="md"
                      spacing={2}
                      justify="space-between"
                      flexWrap="wrap"
                    >
                      {/* Left: Page Navigation */}
                      <HStack
                        spacing={1}
                        bg={useColorModeValue("gray.50", "gray.800")}
                        px={2}
                        py={1}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Previous Page"
                          icon={<ChevronLeft size={14} />}
                          isDisabled={currentPage <= 1}
                          onClick={() => jumpToPage(currentPage - 1)}
                        />
                        <Input
                          size="xs"
                          value={currentPageInput}
                          onChange={(e) => setCurrentPageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt(currentPageInput);
                              if (
                                !isNaN(val) &&
                                val >= 1 &&
                                val <= pdfPages.length
                              ) {
                                jumpToPage(val);
                              } else {
                                setCurrentPageInput(currentPage.toString());
                              }
                            }
                          }}
                          w="32px"
                          textAlign="center"
                          variant="unstyled"
                          fontWeight="bold"
                          fontSize="xs"
                          p={0}
                          height="20px"
                        />
                        <Text
                          fontSize="xs"
                          color={labelColor}
                          fontWeight="bold"
                          userSelect="none"
                        >
                          / {pdfPages.length}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Next Page"
                          icon={<ChevronRight size={14} />}
                          isDisabled={currentPage >= pdfPages.length}
                          onClick={() => jumpToPage(currentPage + 1)}
                        />
                      </HStack>

                      {/* Center: Zoom Controls */}
                      <HStack spacing={1}>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Zoom Out"
                          icon={<ZoomOut size={14} />}
                          onClick={handleZoomOut}
                          isDisabled={zoom <= 0.5}
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          width="45px"
                          textAlign="center"
                          userSelect="none"
                        >
                          {Math.round(zoom * 100)}%
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Zoom In"
                          icon={<ZoomIn size={14} />}
                          onClick={handleZoomIn}
                          isDisabled={zoom >= 3.0}
                        />
                      </HStack>

                      {/* Right: Fit & Rotate */}
                      <HStack spacing={1.5}>
                        <Button
                          size="xs"
                          variant="outline"
                          fontSize="10px"
                          borderRadius="lg"
                          onClick={handleFitWidth}
                          px={2}
                          height="24px"
                        >
                          Fit Width
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          fontSize="10px"
                          borderRadius="lg"
                          onClick={handleFitPage}
                          px={2}
                          height="24px"
                        >
                          Fit Page
                        </Button>
                        <Divider
                          orientation="vertical"
                          height="16px"
                          borderColor={borderColor}
                        />
                        <Tooltip label="Rotate Counter-Clockwise" fontSize="xs">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Rotate CCW"
                            icon={<RotateCcw size={14} />}
                            onClick={handleRotateCcw}
                          />
                        </Tooltip>
                        <Tooltip label="Rotate Clockwise" fontSize="xs">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Rotate CW"
                            icon={<RotateCw size={14} />}
                            onClick={handleRotateCw}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>

                    {/* Scrollable Viewport Container */}
                    <Box
                      ref={viewportRef}
                      position="relative"
                      rounded="2xl"
                      overflow="auto"
                      flex={1}
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg={useColorModeValue("white", "gray.900")}
                      cursor={zoom > 1 ? "grab" : "default"}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                      onScroll={handleScroll}
                      p={4}
                      style={{ userSelect: "none" }}
                    >
                      {/* Stacked PDF Page container list */}
                      <VStack spacing={6} align="center" width="100%" py={4}>
                        {pdfPages.map((page, index) => {
                          const pageNum = index + 1;
                          const aspect =
                            page.aspectRatio ||
                            (page.width && page.height
                              ? page.width / page.height
                              : 0.77);
                          const standardPageWidth = 600;
                          const scaledWidth = standardPageWidth * zoom;

                          const w = scaledWidth;
                          const h = scaledWidth / aspect;
                          const isRotated90or270 = rotation % 180 !== 0;

                          return (
                            <Box
                              key={index}
                              id={`pdf-page-container-${pageNum}`}
                              className="pdf-page-container"
                              position="relative"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              style={{
                                width: isRotated90or270 ? `${h}px` : `${w}px`,
                                height: isRotated90or270 ? `${w}px` : `${h}px`,
                                transition:
                                  "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                              }}
                            >
                              <Box
                                position="absolute"
                                style={{
                                  width: `${w}px`,
                                  height: `${h}px`,
                                  transform: `rotate(${rotation}deg)`,
                                  transformOrigin: "center center",
                                  transition:
                                    "transform 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out",
                                }}
                              >
                                <img
                                  src={page.url}
                                  alt={`Page ${pageNum}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "block",
                                    borderRadius: "8px",
                                    pointerEvents: "none",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                  }}
                                  onLoad={(e) => {
                                    const img = e.currentTarget;
                                    const canvas = canvasRefs.current[index];
                                    if (canvas) {
                                      canvas.width = img.naturalWidth;
                                      canvas.height = img.naturalHeight;
                                    }
                                    drawPreviewBoxes();
                                  }}
                                />
                                <canvas
                                  ref={(el) => {
                                    canvasRefs.current[index] = el;
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    pointerEvents: "none",
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>
                  </>
                )}
              </Box>

              {/* Right Side: Data Inspector (55% split) */}
              <Box
                flex={{ base: "none", lg: 5.5 }}
                p={6}
                bg={cardBg}
                maxH={{ lg: "calc(100vh - 73px)" }}
                overflowY="auto"
              >
                {/* Inline AI Assistant Trigger Banner */}
                <Box
                  p={3.5}
                  mb={5}
                  bg={useColorModeValue("brand.50", "rgba(99, 102, 241, 0.08)")}
                  borderWidth="1px"
                  borderColor={useColorModeValue(
                    "brand.200",
                    "rgba(99, 102, 241, 0.2)",
                  )}
                  borderRadius="2xl"
                  shadow="sm"
                >
                  <HStack
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <HStack spacing={3.5}>
                      <Box
                        p={2}
                        borderRadius="xl"
                        bg="brand.500"
                        color="white"
                        shadow="sm"
                      >
                        <Sparkles size={14} />
                      </Box>
                      <VStack align="start" spacing={0.5}>
                        <Text fontSize="xs" fontWeight="bold">
                          AI Assistance
                        </Text>
                        <Text fontSize="10px" color={labelColor}>
                          You can run AI instructions, translations, or
                          summaries on this result.
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="xs"
                      colorScheme="brand"
                      onClick={onAiOpen}
                      leftIcon={<Sparkles size={12} />}
                      borderRadius="xl"
                      px={4.5}
                    >
                      Open AI drawer
                    </Button>
                  </HStack>
                </Box>

                <Tabs variant="unstyled" colorScheme="brand" isLazy>
                  <TabList
                    display="flex"
                    width="100%"
                    bg={useColorModeValue("gray.100", "gray.950")}
                    p={1.5}
                    borderRadius="2xl"
                    mb={6}
                    overflowX="auto"
                    whiteSpace="nowrap"
                    gap={1}
                  >
                    {showParagraphsTab && (
                      <Tab
                        flex={1}
                        fontSize="xs"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        _selected={{
                          bg: useColorModeValue("white", "gray.900"),
                          color: brandColor,
                          shadow: "sm",
                        }}
                      >
                        <HStack spacing={1.5} justify="center">
                          <FileText size={13} />
                          <Text>Paragraphs</Text>
                          <Badge
                            colorScheme="brand"
                            variant="solid"
                            borderRadius="full"
                            fontSize="9px"
                          >
                            {parsed.paragraphs.length}
                          </Badge>
                        </HStack>
                      </Tab>
                    )}
                    {showTablesTab && (
                      <Tab
                        flex={1}
                        fontSize="xs"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        _selected={{
                          bg: useColorModeValue("white", "gray.900"),
                          color: "purple.400",
                          shadow: "sm",
                        }}
                      >
                        <HStack spacing={1.5} justify="center">
                          <TableIcon size={13} />
                          <Text>Tables</Text>
                          <Badge
                            colorScheme="purple"
                            variant="solid"
                            borderRadius="full"
                            fontSize="9px"
                          >
                            {parsed.tables.length}
                          </Badge>
                        </HStack>
                      </Tab>
                    )}
                    {showFieldsTab && (
                      <Tab
                        flex={1}
                        fontSize="xs"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        _selected={{
                          bg: useColorModeValue("white", "gray.900"),
                          color: "teal.400",
                          shadow: "sm",
                        }}
                      >
                        <HStack spacing={1.5} justify="center">
                          <Layers size={13} />
                          <Text>Fields</Text>
                          <Badge
                            colorScheme="teal"
                            variant="solid"
                            borderRadius="full"
                            fontSize="9px"
                          >
                            {Object.keys(parsed.fields).length}
                          </Badge>
                        </HStack>
                      </Tab>
                    )}
                    <Tab
                      flex={1}
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2}
                      borderRadius="xl"
                      _selected={{
                        bg: useColorModeValue("white", "gray.900"),
                        color: "gray.500",
                        shadow: "sm",
                      }}
                    >
                      <HStack spacing={1.5} justify="center">
                        <FileText size={13} />
                        <Text>Raw</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {showParagraphsTab && (
                      <TabPanel px={0} py={1}>
                        <ParagraphsPanel
                          paragraphs={parsed.paragraphs}
                          labelColor={labelColor}
                          textColor={textColor}
                          sectionBg={sectionBg}
                          borderColor={borderColor}
                          onHoverItem={setHoveredBounds}
                        />
                      </TabPanel>
                    )}
                    {showTablesTab && (
                      <TabPanel px={0} py={1}>
                        <TablesPanel
                          tables={parsed.tables}
                          labelColor={labelColor}
                          textColor={textColor}
                          sectionBg={sectionBg}
                          borderColor={borderColor}
                          onHoverItem={setHoveredBounds}
                        />
                      </TabPanel>
                    )}
                    {showFieldsTab && (
                      <TabPanel px={0} py={1}>
                        <FieldsPanel
                          fields={parsed.fields}
                          labelColor={labelColor}
                          textColor={textColor}
                          sectionBg={sectionBg}
                          borderColor={borderColor}
                          onHoverItem={setHoveredBounds}
                        />
                      </TabPanel>
                    )}
                    <TabPanel px={0} py={1}>
                      <RawTextPanel
                        rawText={parsed.rawText}
                        textColor={textColor}
                        sectionBg={sectionBg}
                        borderColor={borderColor}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Flex>

            {/* Floating Action Trigger for AI Drawer
            <Box
              position="fixed"
              bottom={6}
              right={6}
              zIndex={99}
            >
              <Tooltip label="Ask AI Copilot" placement="left" fontSize="xs" borderRadius="lg" hasArrow>
                <MotionBox
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAiOpen}
                  cursor="pointer"
                  borderRadius="full"
                  bg={brandColor}
                  w={14}
                  h={14}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="2xl"
                  borderWidth="2px"
                  borderColor="white"
                  _dark={{ borderColor: 'gray.800' }}
                  position="relative"
                >
                  <Box
                    position="absolute"
                    inset={-1}
                    bg={brandColor}
                    borderRadius="full"
                    opacity={0.3}
                    zIndex={-1}
                    style={{
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <Sparkles size={24} color="white" />
                </MotionBox>
              </Tooltip>
            </Box> */}

            {/* AI Assistant Drawer */}
            <Drawer
              isOpen={isAiOpen}
              placement="right"
              onClose={onAiClose}
              size="md"
            >
              <DrawerOverlay backdropFilter="blur(4px)" />
              <DrawerContent
                bg={cardBg}
                borderColor={borderColor}
                borderLeftWidth="1px"
                shadow="2xl"
              >
                <DrawerCloseButton borderRadius="full" top={4} right={4} />
                <DrawerHeader
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  py={4}
                >
                  <HStack spacing={2.5}>
                    <Box p={1.5} borderRadius="lg" bg="brand.500" color="white">
                      <Sparkles size={16} />
                    </Box>
                    <Text fontSize="md" fontWeight="bold">
                      AI Document
                    </Text>
                  </HStack>
                </DrawerHeader>
                <DrawerBody py={6} overflowY="auto">
                  <AiPromptPanel
                    prompt={aiPrompt}
                    setPrompt={setAiPrompt}
                    apiResponse={aiResponse}
                    onSendPrompt={handleSendAiPrompt}
                    loading={aiLoading}
                    error={aiError}
                    labelColor={labelColor}
                    textColor={textColor}
                    sectionBg={sectionBg}
                    borderColor={borderColor}
                  />
                </DrawerBody>
              </DrawerContent>
            </Drawer>

            {/* CSS Animation for Floating Button Pulse */}
            <style jsx global>{`
              @keyframes pulse {
                0% {
                  transform: scale(1);
                  opacity: 0.4;
                }
                50% {
                  transform: scale(1.15);
                  opacity: 0.1;
                }
                100% {
                  transform: scale(1);
                  opacity: 0.4;
                }
              }
            `}</style>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

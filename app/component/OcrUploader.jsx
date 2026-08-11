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
  Menu,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import stores from "../store/stores";
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Wrap framer-motion components for Chakra
const MotionBox = motion(Box);

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseOcrResponse(data) {
  const out = {
    paragraphs: [],
    words: [],
    tables: [],
    fields: null,
    rawText: "",
    boundingData: [],
  };
  if (!data?.results?.length) return out;

  for (const page of data.results) {
    const ocr = page?.ocr ?? {};

    // ── Paragraphs ──
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

    // ── Words ── (from ocr.words or from ocr.lines[*].words)
    if (Array.isArray(ocr.words)) {
      ocr.words.forEach((w) => {
        const text = w?.content ?? w?.text ?? "";
        if (text) {
          let boundingRegions = null;

          if (Array.isArray(w?.boundingRegions)) {
            // already in the expected format
            boundingRegions = w.boundingRegions;
          } else if (Array.isArray(w?.boundingBox)) {
            // convert flat point-array -> {pageNumber, polygon} format
            boundingRegions = [
              {
                pageNumber: page.page ?? 1,
                polygon: w.boundingBox.map((pt) => ({ x: pt.x, y: pt.y })),
              },
            ];
          }

          out.words.push({
            text,
            confidence: w?.confidence ?? null,
            boundingRegions,
          });
        }
      });
    } else if (Array.isArray(ocr.lines)) {
      ocr.lines.forEach((line) => {
        if (Array.isArray(line.words)) {
          line.words.forEach((w) => {
            const text = w?.content ?? w?.text ?? "";
            if (text) {
              let boundingRegions = null;
              if (Array.isArray(w?.boundingRegions)) {
                boundingRegions = w.boundingRegions;
              } else if (Array.isArray(w?.boundingBox)) {
                boundingRegions = [
                  {
                    pageNumber: page.page ?? 1,
                    polygon: w.boundingBox.map((pt) => ({ x: pt.x, y: pt.y })),
                  },
                ];
              }
              out.words.push({
                text,
                confidence: w?.confidence ?? null,
                boundingRegions,
              });
            }
          });
        } else {
          const text = line?.content ?? line?.text ?? "";
          if (text) {
            let boundingRegions = null;
            if (Array.isArray(line?.boundingRegions)) {
              boundingRegions = line.boundingRegions;
            } else if (Array.isArray(line?.boundingBox)) {
              boundingRegions = [
                {
                  pageNumber: page.page ?? 1,
                  polygon: line.boundingBox.map((pt) => ({ x: pt.x, y: pt.y })),
                },
              ];
            }
            out.words.push({
              text,
              confidence: line?.confidence ?? null,
              boundingRegions,
            });
          }
        }
      });
    }

    // ── Tables ──
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

// ─── Words Panel ─────────────────────────────────────────────────────────────
function WordsPanel({ words, labelColor, textColor, sectionBg, borderColor, onHoverItem }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!words || !words.length)
    return <Text color={labelColor}>No words extracted. Enable paragraph or table extraction to get word-level data.</Text>;

  const filtered = searchQuery
    ? words.filter((w) => w.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : words;

  return (
    <Box>
      <Box mb={4}>
        <InputGroup size="sm" maxW="280px">
          <InputLeftElement pointerEvents="none">
            <Search size={14} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={sectionBg}
            borderColor={borderColor}
            borderRadius="xl"
            _focus={{ borderColor: "brand.400", boxShadow: "none" }}
          />
        </InputGroup>
      </Box>

      <Box
        maxH="480px"
        overflowY="auto"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        p={3}
        bg={sectionBg}
      >
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1.5}
        >
          {filtered.map((word, i) => {
            const hasBounds = word.boundingRegions && word.boundingRegions.length > 0;
            const conf = word.confidence !== null ? Math.round(word.confidence * 100) : null;
            const isHovered = hoveredIdx === i;
            return (
              <Box
                key={i}
                as="span"
                display="inline-flex"
                alignItems="center"
                gap={1}
                px={2}
                py={1}
                borderRadius="lg"
                fontSize="xs"
                fontWeight={isHovered ? "bold" : "medium"}
                color={hasBounds ? (isHovered ? "white" : textColor) : labelColor}
                bg={
                  hasBounds
                    ? isHovered
                      ? "brand.500"
                      : "brand.50"
                    : sectionBg
                }
                borderWidth="1px"
                borderColor={
                  hasBounds
                    ? isHovered
                      ? "brand.500"
                      : "brand.200"
                    : borderColor
                }
                cursor={hasBounds ? "pointer" : "default"}
                transition="all 0.12s"
                _hover={hasBounds ? { bg: "brand.500", color: "white", borderColor: "brand.500" } : {}}
                onMouseEnter={() => {
                  if (hasBounds && onHoverItem) {
                    setHoveredIdx(i);
                    onHoverItem({
                      bounds: word.boundingRegions,
                      type: "word",
                      label: word.text,
                      colorIndex: i % 6,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (hasBounds && onHoverItem) {
                    setHoveredIdx(null);
                    onHoverItem(null);
                  }
                }}
                title={conf !== null ? `Confidence: ${conf}%` : undefined}
              >
                {word.text}
                {conf !== null && conf < 90 && (
                  <Box
                    as="span"
                    fontSize="9px"
                    opacity={0.7}
                    ml={0.5}
                  >
                    {conf}%
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <HStack mt={3} spacing={4} fontSize="xs" color={labelColor}>
        <Text><strong>{words.length}</strong> total words</Text>
        {searchQuery && <Text><strong>{filtered.length}</strong> matching</Text>}
        <Text>Hover over a word to highlight it on the document preview</Text>
      </HStack>
    </Box>
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
    return <Text p={4} color="gray.500">No form fields extracted.</Text>;

  const getFieldValueText = (val) => {
    if (val === null || val === undefined) return "Not Found";
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
    <VStack spacing={5} align="stretch" w="100%" p={4} pb={8}>
      {Object.entries(fields).map(([key, value]) => {
        const bounds = value?.boundingRegions ?? null;
        let textValue = getFieldValueText(value) || JSON.stringify(value);
        if (!textValue || textValue.trim() === "") textValue = "Not Found";

        const isEdited = key === "Vendor Name"; 
        const borderColor = isEdited ? "red.500" : "gray.200";
        const labelText = isEdited ? `${key} (edited)` : key;
        const labelColor = isEdited ? "red.500" : "gray.600";

        return (
          <Box
            key={key}
            position="relative"
            mt={2}
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
            <Text
              position="absolute"
              top="-8px"
              left="12px"
              bg="white"
              px={1}
              fontSize="12px"
              fontWeight="500"
              color={labelColor}
              zIndex={1}
              lineHeight="1"
            >
              {labelText}
            </Text>
            
            <Flex
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              bg="white"
              align="center"
              _hover={{ borderColor: isEdited ? "red.600" : "gray.400" }}
            >
              <Input
                value={textValue}
                fontSize="sm"
                color="gray.800"
                variant="unstyled"
                px={3}
                h="38px"
                isReadOnly
              />
            </Flex>
          </Box>
        );
      })}
    </VStack>
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

const AiPromptPanel = ({
  aiPrompt,
  setAiPrompt,
  aiResponse,
  aiLoading,
  aiError,
  handleSendAiPrompt,
  aiMessages = [],
  file,
  labelColor,
  textColor,
  sectionBg,
  borderColor,
}) => {
  const historyEndRef = useRef(null);
  const chatBg = useColorModeValue("gray.50", "gray.950");
  const answerBg = useColorModeValue("white", "gray.900");
  const questionBg = useColorModeValue("brand.500", "brand.400");
  const questionColor = useColorModeValue("white", "gray.950");
  const composerBg = useColorModeValue("white", "gray.900");
  const hintBg = useColorModeValue("white", "whiteAlpha.100");
  const chipBg = useColorModeValue("brand.50", "whiteAlpha.100");

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [aiMessages, aiLoading]);

  const copyAnswer = async (answer) => {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
  };

  const handleComposerKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleSendAiPrompt();
    }
  };

  const presets = [
    {
      label: "Summarize",
      text: "Provide a concise summary of this document, listing the main points.",
    },
    {
      label: "Line items",
      text: "Extract all table line items and list them in a structured table or bullet list.",
    },
    {
      label: "Metadata",
      text: "Find the key dates, invoice numbers, total amounts, and participant names.",
    },
    {
      label: "JSON",
      text: "Convert the main structured data in this document to a clean JSON object.",
    },
  ];

  return (
    <Flex direction="column" h="100%" minH="0" bg={chatBg}>
      {/* <Box px={5} py={3} borderBottomWidth="1px" borderColor={borderColor}>
        <HStack justify="space-between" align="start" spacing={3}>
          <VStack align="start" spacing={0.5} minW={0}>
            <HStack spacing={2} minW={0}>
              <Box p={1.5} borderRadius="lg" bg="brand.500" color="white">
                <Sparkles size={14} />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                Ask this document
              </Text>
            </HStack>
            <Text fontSize="xs" color={labelColor} noOfLines={1} maxW="300px">
              {file?.name || "Current document"}
            </Text>
          </VStack>
          <Badge borderRadius="full" px={3} py={1} colorScheme="gray">
            PDF Q&A
          </Badge>
        </HStack>
      </Box> */}

      <VStack
        flex={1}
        minH={0}
        align="stretch"
        spacing={4}
        overflowY="auto"
        px={5}
        py={5}
      >
        {aiMessages.length === 0 && !aiResponse ? (
          <VStack align="stretch" spacing={3} mt={2}>
            <Box
              alignSelf="flex-start"
              maxW="88%"
              bg={hintBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              borderBottomLeftRadius="md"
              p={4}
              shadow="sm"
            >
              <HStack align="start" spacing={3}>
                <Box p={2} borderRadius="full" bg="brand.500" color="white">
                  <Sparkles size={14} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    Ready for questions
                  </Text>
                  <Text fontSize="sm" color={labelColor} mt={1}>
                    Ask about invoice numbers, totals, dates, line items, or anything visible in the extracted text.
                  </Text>
                </Box>
              </HStack>
            </Box>
          </VStack>
        ) : (
          aiMessages.map((item) => (
            <VStack key={item.id} spacing={3} align="stretch">
              <Box alignSelf="flex-end" maxW="82%">
                <Box
                  bg={questionBg}
                  color={questionColor}
                  borderRadius="2xl"
                  borderBottomRightRadius="md"
                  px={4}
                  py={3}
                  shadow="sm"
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {item.question}
                  </Text>
                </Box>
                <Text mt={1} fontSize="10px" color={labelColor} textAlign="right">
                  You
                </Text>
              </Box>

              <Box alignSelf="flex-start" maxW="88%">
                <HStack align="end" spacing={2}>
                  <Box
                    bg={answerBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    borderBottomLeftRadius="md"
                    px={4}
                    py={3}
                    shadow="sm"
                  >
                    {item.status === "loading" ? (
                      <HStack spacing={3}>
                        <Spinner size="sm" color="brand.500" />
                        <Text fontSize="sm" color={labelColor}>
                          Thinking...
                        </Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                        {item.answer}
                      </Text>
                    )}
                  </Box>
                  {item.answer && (
                    <Tooltip label="Copy answer" fontSize="xs">
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Copy answer"
                        icon={<Copy size={12} />}
                        onClick={() => copyAnswer(item.answer)}
                      />
                    </Tooltip>
                  )}
                </HStack>
                <Text mt={1} fontSize="10px" color={labelColor}>
                  Ask this document
                </Text>

              </Box>
            </VStack>
          ))
        )}
        <div ref={historyEndRef} />
      </VStack>

      <Box
        px={5}
        py={4}
        bg={composerBg}
        borderTopWidth="1px"
        borderColor={borderColor}
      >
        <HStack spacing={2} overflowX="auto" pb={2} mb={2}>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              size="xs"
              variant="ghost"
              flexShrink={0}
              borderRadius="full"
              bg={chipBg}
              color="brand.600"
              onClick={() => setAiPrompt(preset.text)}
            >
              {preset.label}
            </Button>
          ))}
        </HStack>

        {aiError && (
          <Alert status="error" mb={3} borderRadius="xl" fontSize="sm" py={2}>
            <AlertIcon />
            {aiError}
          </Alert>
        )}

        <HStack align="end" spacing={2}>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Ask a question about this document..."
            minH="48px"
            maxH="120px"
            resize="none"
            borderRadius="2xl"
            bg={sectionBg}
            borderColor={borderColor}
            color={textColor}
            fontSize="sm"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "brand.400", boxShadow: "none" }}
          />
          <Tooltip label="Send question" fontSize="xs">
            <IconButton
              aria-label="Send question"
              icon={<Send size={17} />}
              colorScheme="brand"
              borderRadius="full"
              flexShrink={0}
              h="44px"
              w="44px"
              onClick={handleSendAiPrompt}
              isLoading={aiLoading}
              isDisabled={!aiPrompt.trim()}
            />
          </Tooltip>
        </HStack>
      </Box>
    </Flex>
  );
};

// main component
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
  const [aiMessages, setAiMessages] = useState([]);
  const [activeView, setActiveView] = useState("pdf");

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

  // Colors (Premium Glassmorphism & Rich Gradients)
  const bg = useColorModeValue(
    "radial-gradient(circle at 0% 0%, #f1f5f9 0%, #e2e8f0 100%)",
    "radial-gradient(circle at 0% 0%, #0f172a 0%, #020617 100%)"
  );
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(15, 23, 42, 0.65)");
  const borderColor = useColorModeValue("rgba(203, 213, 225, 0.6)", "rgba(51, 65, 85, 0.6)");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.800", "gray.50");
  const sectionBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(30, 41, 59, 0.4)");
  const dragBg = useColorModeValue("rgba(99, 102, 241, 0.08)", "rgba(99, 102, 241, 0.15)");
  const fileIconBg = useColorModeValue("blue.100", "rgba(59, 130, 246, 0.15)");
  const fileIconColor = useColorModeValue("blue.600", "blue.300");
  const glassFilter = "blur(16px)";

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
    setAiMessages([]);

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
    if (parsed?.words && Array.isArray(parsed.words)) {
      parsed.words.forEach((w) => {
        if (w.boundingRegions) {
          w.boundingRegions.forEach((r) =>
            r.polygon?.forEach((pt) => {
              if (pt.x > maxX) maxX = pt.x;
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
          : hoveredBounds.type === "word"
            ? "rgba(251, 146, 60, 0.30)"
            : color.fill
              .replace("0.12", "0.25")
              .replace("0.22", "0.4")
              .replace("0.05", "0.2");
      const stroke =
        hoveredBounds.type === "cell"
          ? "#fbbf24"
          : hoveredBounds.type === "word"
            ? "#f97316"
            : color.stroke;

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
    setAiPrompt("");
    setAiResponse("");
    setAiError(null);
    setAiMessages([]);
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
    formData.append("extractWords", true);

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
    const question = aiPrompt.trim();
    const documentText = parsed?.rawText?.trim();

    setAiError("");

    if (!question) {
      setAiError("Please enter a question first.");
      return;
    }

    if (!documentText) {
      setAiError("No document text found to search in.");
      return;
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setAiLoading(true);
    setAiMessages((prev) => [
      ...prev,
      {
        id: messageId,
        question,
        answer: "",
        documentName: file?.name || "Current document",
        status: "loading",
      },
    ]);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/qna`,
        {
          text: documentText,
          question,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 90000,
          maxBodyLength: Infinity,
        },
      );

      const data = response.data;
      const answer =
        typeof data === "string"
          ? data
          : data?.answer ||
          data?.data?.answer ||
          data?.response ||
          data?.result ||
          data?.message ||
          JSON.stringify(data, null, 2);
      const cleanAnswer =
        String(answer || "")
          .replace(/\n{3,}/g, "\n\n")
          .trim() || "No answer was returned.";

      setAiResponse(cleanAnswer);
      setAiMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? {
              ...item,
              answer: cleanAnswer,
              status: "done",
            }
            : item,
        ),
      );
      setAiPrompt("");
    } catch (error) {
      const message =
        error?.code === "ECONNABORTED"
          ? "The Q&A server is taking longer than expected. This may take up to 30-60 seconds if the server was asleep. Please try again."
          : error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to get an answer right now. The server may be waking up and this can take up to 30-60 seconds. Please try again.";

      setAiError(message);
      setAiMessages((prev) => prev.filter((item) => item.id !== messageId));
    } finally {
      setAiLoading(false);
    }
  };
  const showParagraphsTab = extractParagraphs && parsed?.paragraphs?.length > 0;
  const showWordsTab = parsed?.words?.length > 0;
  const showTablesTab = extractTables && parsed?.tables?.length > 0;
  const showFieldsTab =
    extractFields && parsed?.fields && Object.keys(parsed.fields).length > 0;
  const showForm = !parsed;
  const isRenderingPdf = file && fileType === "pdf" && pdfPages.length === 0;

  return (
    <Box flex={1} display="flex" flexDirection="column" w="100%" h="100%" bg={bg} color={textColor} p={0} m={0} position="relative" overflow="hidden">
      {/* Background Decorative Globs */}
      <Box position="fixed" top="-10%" left="-10%" w="40vw" h="40vw" bg="brand.400" rounded="full" filter="blur(120px)" opacity={useColorModeValue(0.15, 0.08)} zIndex={0} pointerEvents="none" />
      <Box position="fixed" bottom="-10%" right="-10%" w="40vw" h="40vw" bg="purple.400" rounded="full" filter="blur(120px)" opacity={useColorModeValue(0.15, 0.08)} zIndex={0} pointerEvents="none" />
      
      <AnimatePresence mode="wait">
        {showForm ? (
          // ─── Welcome/Upload View (Edge-to-Edge Full Screen) ───
          <MotionBox
            key="upload-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            w="100%"
            h="100%"
            flex={1}
            display="flex"
            flexDirection="column"
            p={0}
            position="relative"
            zIndex={1}
          >
            <Box 
              bg={cardBg} 
              w="100%" 
              maxW="100%"
              backdropFilter={glassFilter} 
              borderRadius="0" 
              shadow="none" 
              borderWidth="0" 
              h="100%"
              flex={1}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Box
                bg={`linear-gradient(135deg, ${brandColor}15, transparent)`}
                py={4}
                px={6}
                borderBottomWidth="1px"
                borderColor={borderColor}
                position="relative"
              >
                <HStack spacing={4} w="full">
                  <Box
                    p={3}
                    borderRadius="2xl"
                    bg={`linear-gradient(135deg, ${brandColor}, #8b5cf6)`}
                    color="white"
                    shadow="lg"
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

              <Box flex={1} py={2} px={6}>
                <form onSubmit={handleSubmit} style={{ height: "100%" }}>
                  <Flex
                    direction={{ base: "column", lg: "row" }}
                    gap={6}
                    w="full"
                    minH={{ lg: file ? "600px" : "auto" }}
                    alignItems={file ? "stretch" : "center"}
                  >
                    {/* Left: Drag & Drop Zone or Hero Preview */}
                    <Box 
                      flex={file ? 1 : "none"} 
                      w={file ? "auto" : "100%"} 
                      maxW={file ? "auto" : "3xl"}
                      mx={file ? 0 : "auto"}
                      display="flex" 
                      flexDirection="column"
                    >
                      {!file && (
                        <FormLabel
                          color={labelColor}
                          fontSize="xs"
                          fontWeight="bold"
                          letterSpacing="wider"
                          textTransform="uppercase"
                          textAlign="center"
                          mb={4}
                        >
                          Upload Document to Begin
                        </FormLabel>
                      )}

                      {!file ? (
                        <MotionBox
                          position="relative"
                          border="2px dashed"
                          borderColor={isDragging ? "brand.400" : borderColor}
                          borderRadius="3xl"
                          bg={isDragging ? dragBg : useColorModeValue("rgba(255,255,255,0.4)", "rgba(15,23,42,0.4)")}
                          py={24}
                          px={6}
                          textAlign="center"
                          cursor="pointer"
                          backdropFilter={glassFilter}
                          whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(99, 102, 241, 0.4)" }}
                          transition={{ duration: 0.3 }}
                          _hover={{ borderColor: "brand.400", bg: dragBg }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          overflow="hidden"
                        >
                          {/* Decorative glow inside dropzone */}
                          <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="full" h="full" bg={`radial-gradient(circle, ${brandColor}20 0%, transparent 70%)`} opacity={isDragging ? 1 : 0} transition="opacity 0.3s" pointerEvents="none" />
                          
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
                            zIndex={2}
                          />
                          <VStack spacing={6} pointerEvents="none" position="relative" zIndex={1}>
                            <MotionBox
                              animate={isDragging ? { y: -10, scale: 1.15 } : { y: 0, scale: 1 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                repeatType: "reverse",
                                ease: "easeInOut"
                              }}
                              w={20}
                              h={20}
                              borderRadius="2xl"
                              bg={`linear-gradient(135deg, ${brandColor}, #8b5cf6)`}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                              shadow="2xl"
                            >
                              <Upload size={36} color="white" />
                            </MotionBox>
                            <VStack spacing={2}>
                              <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={textColor}
                              >
                                Drag and drop your document here
                              </Text>
                              <Text fontSize="sm" color={labelColor}>
                                Supports PDF, JPG, PNG (Max 10MB)
                              </Text>
                            </VStack>
                            <Button colorScheme="brand" variant="outline" size="md" borderRadius="xl">
                              Browse Files
                            </Button>
                          </VStack>
                        </MotionBox>
                      ) : (
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          display="flex"
                          flexDirection="column"
                          h="100%"
                          bg={useColorModeValue("rgba(255,255,255,0.4)", "rgba(15,23,42,0.4)")}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="3xl"
                          p={6}
                          position="relative"
                          overflow="hidden"
                          shadow="inner"
                        >
                          <Flex justify="space-between" align="center" mb={4}>
                            <HStack spacing={3}>
                              <Box w={10} h={10} borderRadius="lg" bg={fileIconBg} display="flex" alignItems="center" justifyContent="center">
                                <FileText size={18} color={fileIconColor} />
                              </Box>
                              <Box>
                                <Text fontSize="md" fontWeight="bold" color={textColor} noOfLines={1} maxW="200px">
                                  {file.name}
                                </Text>
                                <Text fontSize="xs" color={labelColor}>
                                  {(file.size / 1024).toFixed(1)} KB · {fileType?.toUpperCase()}
                                </Text>
                              </Box>
                            </HStack>
                            
                            <Box position="relative">
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
                                zIndex={2}
                              />
                              <Button size="sm" variant="outline" borderRadius="lg" leftIcon={<Upload size={14} />}>
                                Replace File
                              </Button>
                            </Box>
                          </Flex>
                          
                          <Box flex={1} bg={sectionBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden" display="flex" alignItems="center" justifyContent="center">
                             {fileType === "pdf" ? (
                               <iframe 
                                 src={URL.createObjectURL(file)} 
                                 width="100%" 
                                 height="100%"
                                 style={{ border: "none", background: "transparent" }}
                                 title="PDF Preview"
                               />
                             ) : fileType === "image" ? (
                               <img 
                                 src={URL.createObjectURL(file)} 
                                 alt="Document Preview" 
                                 style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} 
                               />
                             ) : (
                               <VStack spacing={3}>
                                 <FileText size={48} color={labelColor} opacity={0.5} />
                                 <Text color={labelColor} fontSize="sm">Preview not available</Text>
                               </VStack>
                             )}
                          </Box>
                        </MotionBox>
                      )}
                    </Box>

                    {/* Right: Extraction Configuration (Only shown if file exists) */}
                    {file && (
                      <MotionBox 
                        flex={1}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                      >
                        <VStack align="stretch" spacing={6} h="100%" justify="space-between">
                          <VStack align="stretch" spacing={6}>
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
                                size="lg"
                                _focus={{
                                  borderColor: "brand.400",
                                  boxShadow: "none",
                                }}
                              />
                              <Text fontSize="11px" color={labelColor} mt={2}>
                                Currently active:{" "}
                                <Text as="span" fontWeight="bold" color={textColor}>
                                  {pages.trim() ? `Pages ${pages}` : "All Pages"}
                                </Text>
                              </Text>
                            </FormControl>

                            <Box
                              p={5}
                              rounded="3xl"
                              border="1px solid"
                              borderColor={borderColor}
                              bg={sectionBg}
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color={labelColor}
                                mb={4}
                                letterSpacing="wider"
                                textTransform="uppercase"
                              >
                                EXTRACT FEATURES
                              </Text>
                              <VStack spacing={3} align="stretch">
                                <HStack
                                  p={4}
                                  rounded="2xl"
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
                                  _hover={{ borderColor: "brand.300", bg: useColorModeValue("white", "gray.800") }}
                                  transition="all 0.2s"
                                  shadow={extractParagraphs ? "md" : "none"}
                                >
                                  <Box
                                    color={
                                      extractParagraphs ? brandColor : "gray.400"
                                    }
                                    mr={2}
                                  >
                                    <FileText size={20} />
                                  </Box>
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">
                                      Flowing Paragraphs
                                    </Text>
                                    <Text fontSize="xs" color={labelColor}>
                                      Reads standard sentence structures and page blocks
                                    </Text>
                                  </VStack>
                                  <Checkbox
                                    isChecked={extractParagraphs}
                                    pointerEvents="none"
                                    colorScheme="brand"
                                    size="lg"
                                  />
                                </HStack>

                                <HStack
                                  p={4}
                                  rounded="2xl"
                                  borderWidth="1px"
                                  borderColor={
                                    extractTables ? "brand.400" : borderColor
                                  }
                                  bg={
                                    extractTables ? `${brandColor}05` : "transparent"
                                  }
                                  cursor="pointer"
                                  onClick={() => setExtractTables(!extractTables)}
                                  _hover={{ borderColor: "brand.300", bg: useColorModeValue("white", "gray.800") }}
                                  transition="all 0.2s"
                                  shadow={extractTables ? "md" : "none"}
                                >
                                  <Box
                                    color={extractTables ? brandColor : "gray.400"}
                                    mr={2}
                                  >
                                    <TableIcon size={20} />
                                  </Box>
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">
                                      Structured Tables
                                    </Text>
                                    <Text fontSize="xs" color={labelColor}>
                                      Maps tabular items into digital spreadsheets
                                    </Text>
                                  </VStack>
                                  <Checkbox
                                    isChecked={extractTables}
                                    pointerEvents="none"
                                    colorScheme="brand"
                                    size="lg"
                                  />
                                </HStack>

                                <HStack
                                  p={4}
                                  rounded="2xl"
                                  borderWidth="1px"
                                  borderColor={
                                    extractFields ? "brand.400" : borderColor
                                  }
                                  bg={
                                    extractFields ? `${brandColor}05` : "transparent"
                                  }
                                  cursor="pointer"
                                  onClick={() => setExtractFields(!extractFields)}
                                  _hover={{ borderColor: "brand.300", bg: useColorModeValue("white", "gray.800") }}
                                  transition="all 0.2s"
                                  shadow={extractFields ? "md" : "none"}
                                >
                                  <Box
                                    color={extractFields ? brandColor : "gray.400"}
                                    mr={2}
                                  >
                                    <Layers size={20} />
                                  </Box>
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">
                                      Form Fields & Key-Values
                                    </Text>
                                    <Text fontSize="xs" color={labelColor}>
                                      Identifies metadata labels, dates, and checkboxes
                                    </Text>
                                  </VStack>
                                  <Checkbox
                                    isChecked={extractFields}
                                    pointerEvents="none"
                                    colorScheme="brand"
                                    size="lg"
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
                          </VStack>

                          <Button
                            type="submit"
                            size="lg"
                            width="full"
                            colorScheme="brand"
                            isDisabled={loading || !file || isRenderingPdf}
                            borderRadius="2xl"
                            shadow="lg"
                            h="60px"
                            fontSize="md"
                            _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                          >
                            {loading ? (
                              <HStack justify="center" spacing={3}>
                                <Spinner size="sm" />
                                <Text>Reading document stream...</Text>
                              </HStack>
                            ) : isRenderingPdf ? (
                              <HStack justify="center" spacing={3}>
                                <Spinner size="sm" />
                                <Text>Rendering PDF pages...</Text>
                              </HStack>
                            ) : (
                              <HStack spacing={3}>
                                <Zap size={20} />
                                <Text fontWeight="bold">Execute Analysis</Text>
                              </HStack>
                            )}
                          </Button>
                        </VStack>
                      </MotionBox>
                    )}
                  </Flex>
                </form>
              </Box>
            </Box>
          </MotionBox>
        ) : (
          <MotionBox
            key="workspace-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            flex={1}
            display="flex"
            flexDirection="column"
            bg="white"
            w="100%"
            h="100%"
          >
            {/* Top Header */}
            <Flex
              h="60px"
              w="100%"
              align="center"
              justify="space-between"
              px={6}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="xl" fontWeight="bold" color="#3bb3b6">
                Document
              </Text>
              <IconButton
                icon={<X size={20} />}
                variant="ghost"
                onClick={clearAll}
                aria-label="Close Document"
              />
            </Flex>

              {/* Main Content Split */}
              <Flex flex={1} overflow="hidden" p={4} gap={6} bg="white">
                
                {/* Left Column: PDF Viewer */}
                <Box flex={1.8} display="flex" flexDirection="column" h="100%" minW={0}>
                  <HStack spacing={4} mb={2}>
                    <Button
                      px={6}
                      bg="#3bb3b6"
                      color="white"
                      _hover={{ bg: "#2a9d9f" }}
                      borderRadius="sm"
                      fontWeight="medium"
                    >
                      View Full Size
                    </Button>
                    <Button
                      px={6}
                      bg="#3182ce"
                      color="white"
                      _hover={{ bg: "#2b6cb0" }}
                      borderRadius="sm"
                      fontWeight="medium"
                    >
                      Download
                    </Button>
                  </HStack>

                  <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    borderWidth="1px"
                    borderColor="gray.300"
                    borderRadius="sm"
                    overflow="hidden"
                  >
                    {/* Dark Chrome-like PDF Toolbar */}
                    <HStack w="100%" bg="#323639" color="white" px={4} py={1.5} spacing={4} align="center">
                    {/* Left: Page Navigation */}
                    <HStack spacing={2} borderRight="1px solid #5F6368" pr={4}>
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Menu" icon={<Menu size={16} />} />
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Previous Page" icon={<ChevronLeft size={16} />} isDisabled={currentPage <= 1} onClick={() => jumpToPage(currentPage - 1)} />
                      <HStack spacing={1}>
                        <Input size="xs" value={currentPageInput} onChange={(e) => setCurrentPageInput(e.target.value)} onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseInt(currentPageInput);
                            if (!isNaN(val) && val >= 1 && val <= pdfPages.length) jumpToPage(val);
                            else setCurrentPageInput(currentPage.toString());
                          }
                        }} w="30px" textAlign="center" bg="#202124" border="none" color="white" fontSize="sm" px={1} />
                        <Text fontSize="sm" color="#9AA0A6">/ {pdfPages.length}</Text>
                      </HStack>
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Next Page" icon={<ChevronRight size={16} />} isDisabled={currentPage >= pdfPages.length} onClick={() => jumpToPage(currentPage + 1)} />
                    </HStack>
                    {/* Center: Zoom Controls */}
                    <HStack spacing={2} borderRight="1px solid #5F6368" pr={4}>
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Zoom Out" icon={<ZoomOut size={16} />} onClick={handleZoomOut} isDisabled={zoom <= 0.5} />
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Zoom In" icon={<ZoomIn size={16} />} onClick={handleZoomIn} isDisabled={zoom >= 3.0} />
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Fit Page" icon={<Box width="14px" height="16px" border="1px solid white" borderRadius="2px" />} onClick={handleFitPage} />
                      <IconButton size="xs" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} aria-label="Rotate" icon={<RotateCw size={16} />} onClick={handleRotateCw} />
                    </HStack>
                  </HStack>

                  {/* Scrollable Viewport Container */}
                  <Box ref={viewportRef} position="relative" overflow="auto" flex={1} bg="#525659" cursor={zoom > 1 ? "grab" : "default"} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave} onScroll={handleScroll} p={4} style={{ userSelect: "none" }}>
                    <VStack spacing={6} align="center" width="100%" py={4}>
                      {pdfPages.map((page, index) => {
                        const pageNum = index + 1;
                        const aspect = page.aspectRatio || (page.width && page.height ? page.width / page.height : 0.77);
                        const standardPageWidth = 600;
                        const scaledWidth = standardPageWidth * zoom;
                        const w = scaledWidth;
                        const h = scaledWidth / aspect;
                        const isRotated90or270 = rotation % 180 !== 0;

                        return (
                          <Box key={index} id={`pdf-page-container-${pageNum}`} className="pdf-page-container" position="relative" display="flex" alignItems="center" justifyContent="center" style={{ width: isRotated90or270 ? `${h}px` : `${w}px`, height: isRotated90or270 ? `${w}px` : `${h}px`, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <Box position="absolute" style={{ width: `${w}px`, height: `${h}px`, transform: `rotate(${rotation}deg)`, transformOrigin: "center center", transition: "transform 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out" }}>
                              <img src={page.url} alt={`Page ${pageNum}`} style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", backgroundColor: "white" }} onLoad={(e) => {
                                const img = e.currentTarget;
                                const canvas = canvasRefs.current[index];
                                if (canvas) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
                                drawPreviewBoxes();
                              }} />
                              <canvas ref={(el) => { canvasRefs.current[index] = el; }} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                </Box>
              </Box>

              {/* Right Column: Data Panels */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                h="100%"
                minW={0}
                borderWidth="1px"
                borderColor="#3bb3b6"
                borderRadius="md"
                bg="white"
                overflow="hidden"
              >
                {/* Custom Tabs */}
                <HStack
                  spacing={6}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  bg="white"
                >
                  <Text
                    px={4}
                    py={3}
                    fontSize="sm"
                    fontWeight={activeView === "fields" ? "600" : "500"}
                    color={activeView === "fields" ? "#3bb3b6" : "gray.500"}
                    borderBottom={activeView === "fields" ? "2px solid" : "2px solid transparent"}
                    borderColor={activeView === "fields" ? "#3bb3b6" : "transparent"}
                    cursor="pointer"
                    onClick={() => setActiveView("fields")}
                  >
                    Fields
                  </Text>
                  <Text
                    px={4}
                    py={3}
                    fontSize="sm"
                    fontWeight={activeView === "tables" ? "600" : "500"}
                    color={activeView === "tables" ? "#3bb3b6" : "gray.500"}
                    borderBottom={activeView === "tables" ? "2px solid" : "2px solid transparent"}
                    borderColor={activeView === "tables" ? "#3bb3b6" : "transparent"}
                    cursor="pointer"
                    onClick={() => setActiveView("tables")}
                  >
                    Invoice line Items
                  </Text>
                  <Text
                    px={4}
                    py={3}
                    fontSize="sm"
                    fontWeight="500"
                    color="gray.500"
                    cursor="pointer"
                  >
                    Financial Table
                  </Text>
                </HStack>

                {/* Tab Content Container */}
                <Box
                  flex={1}
                  overflowY="auto"
                  bg="white"
                >
                  {activeView === "fields" && (
                    <FieldsPanel
                      fields={parsed.fields}
                      onHoverItem={setHoveredBounds}
                    />
                  )}
                  {activeView === "tables" && (
                    <TablesPanel
                      tables={parsed.tables}
                      labelColor="gray.600"
                      textColor="gray.800"
                      sectionBg="white"
                      borderColor="gray.300"
                      onHoverItem={setHoveredBounds}
                    />
                  )}
                </Box>
              </Box>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

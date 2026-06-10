import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import stores from '../store/stores';

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseOcrResponse(data) {
  const out = { paragraphs: [], tables: [], fields: null, rawText: '', boundingData: [] };
  if (!data?.results?.length) return out;

  for (const page of data.results) {
    const ocr = page?.ocr ?? {};

    if (ocr.paragraphs) {
      if (typeof ocr.paragraphs === 'string') {
        const lines = ocr.paragraphs.split('\n').filter((l) => l.trim());
        out.paragraphs.push(...lines);
        out.rawText += ocr.paragraphs + '\n';
      } else if (Array.isArray(ocr.paragraphs)) {
        ocr.paragraphs.forEach((p) => {
          const text = typeof p === 'string' ? p : p?.text ?? p?.content ?? JSON.stringify(p);
          if (text) out.paragraphs.push(text);
        });
        out.rawText += out.paragraphs.join('\n') + '\n';
      }
    }

    if (Array.isArray(ocr.tables)) {
      ocr.tables.forEach((tbl, idx) => {
        out.tables.push(normaliseTable(tbl, idx));
        out.boundingData.push(extractBoundingData(tbl, idx));
      });
    }

    if (page.fields && typeof page.fields === 'object') {
      out.fields = { ...(out.fields ?? {}), ...page.fields };
    }
  }

  return out;
}

function normaliseTable(tbl, idx) {
  const title = `Table ${idx + 1}`;
  if (tbl.headers && tbl.rows) return { title, headers: tbl.headers, rows: tbl.rows };

  if (Array.isArray(tbl.cells)) {
    const rowCount = tbl.rowCount ?? 0;
    const colCount = tbl.columnCount ?? 0;
    const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(''));
    let headerRowIndex = -1;

    tbl.cells.forEach((cell) => {
      grid[cell.rowIndex][cell.columnIndex] = cell.content ?? '';
      if (cell.kind === 'columnHeader') headerRowIndex = cell.rowIndex;
    });

    const headers = headerRowIndex >= 0 ? grid[headerRowIndex] : [];
    const rows = grid.filter((_, i) => i !== headerRowIndex);
    return { title, headers, rows };
  }

  return { title, headers: [], rows: [] };
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
        content: cell.content ?? '',
        kind: cell.kind ?? 'content',
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
  { fill: 'rgba(99, 102, 241, 0.12)', stroke: 'rgba(99, 102, 241, 0.9)',  label: '#6366f1' },
  { fill: 'rgba(236, 72, 153, 0.12)', stroke: 'rgba(236, 72, 153, 0.9)',  label: '#ec4899' },
  { fill: 'rgba(34, 197, 94, 0.12)',  stroke: 'rgba(34, 197, 94, 0.9)',   label: '#22c55e' },
  { fill: 'rgba(245, 158, 11, 0.12)', stroke: 'rgba(245, 158, 11, 0.9)',  label: '#f59e0b' },
  { fill: 'rgba(14, 165, 233, 0.12)', stroke: 'rgba(14, 165, 233, 0.9)',  label: '#0ea5e9' },
  { fill: 'rgba(168, 85, 247, 0.12)', stroke: 'rgba(168, 85, 247, 0.9)',  label: '#a855f7' },
];

const HEADER_COLOR = {
  fill: 'rgba(251, 191, 36, 0.22)',
  stroke: 'rgba(251, 191, 36, 0.95)',
  label: '#fbbf24',
};

function isNumericCell(cell) {
  return /^[\d,\.%\(\)₹$€£\s]+$/.test(String(cell).trim());
}

function normalizePageRange(input) {
  const val = (input || '').trim().toLowerCase();
  if (!val || val === 'all') return 'all';
  return val;
}

/** Point-in-polygon test (ray casting) */
function isPointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ParagraphsPanel({ paragraphs, labelColor, textColor, sectionBg, borderColor }) {
  if (!paragraphs.length) return <Text color={labelColor}>No paragraphs extracted.</Text>;
  return (
    <VStack align="stretch" spacing={2}>
      {paragraphs.map((text, i) => (
        <Box key={i} p={3} rounded="xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="xs" color={labelColor} mb={1}>#{i + 1}</Text>
          <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">{text}</Text>
        </Box>
      ))}
    </VStack>
  );
}

function TableExportModal({ tables, isOpen, onClose, labelColor, textColor, sectionBg, borderColor }) {
  const [selectedTables, setSelectedTables] = useState(new Set(tables.map((_, i) => i)));

  const exportToCSV = (mode) => {
    let csvContent = [];
    const tablesToExport = Array.from(selectedTables).sort((a, b) => a - b);

    tablesToExport.forEach((tableIdx) => {
      const tbl = tables[tableIdx];
      if (csvContent.length > 0) csvContent.push('');
      csvContent.push(`"${tbl.title}"`);

      if (tbl.headers.length > 0) {
        csvContent.push(tbl.headers.map(h => `"${h}"`).join(','));
      }
      tbl.rows.forEach(row => {
        csvContent.push(row.map(cell => `"${cell}"`).join(','));
      });
    });

    const csv = csvContent.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
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
          position="fixed" inset={0} bg="blackAlpha.600" display="flex"
          alignItems="center" justifyContent="center" zIndex={50} onClick={onClose}
        >
          <Box
            bg={sectionBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl"
            p={6} maxW="sm" onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>Export as CSV</Text>
            <VStack align="stretch" spacing={3} mb={4}>
              {tables.map((tbl, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedTables.has(idx)}
                    onChange={() => toggleTable(idx)}
                    style={{ marginRight: '8px' }}
                  />
                  <Text fontSize="sm" color={textColor}>{tbl.title}</Text>
                </label>
              ))}
            </VStack>
            <HStack spacing={3}>
              <Button flex={1} size="sm" variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                flex={1} size="sm" colorScheme="brand"
                isDisabled={selectedTables.size === 0}
                onClick={() => exportToCSV('selected')}
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

function TablesPanel({ tables, labelColor, textColor, sectionBg, borderColor }) {
  const [modalOpen, setModalOpen] = React.useState(false);

  if (!tables.length) return <Text color={labelColor}>No tables extracted.</Text>;

  return (
    <Box>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align="center" spacing={4} mb={-2}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>Tables</Text>
          <Button size="sm" colorScheme="brand" onClick={() => setModalOpen(true)}>
            Export to CSV
          </Button>
        </HStack>
        {tables.map((tbl, ti) => (
          <Box key={ti} rounded="2xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
            <HStack px={4} py={2} bg={sectionBg} borderBottomWidth="1px" borderColor={borderColor} justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>{tbl.title}</Text>
            </HStack>
            <TableContainer overflowX="auto">
              <Table variant="simple" size="sm">
                {tbl.headers.length > 0 && (
                  <Thead bg={sectionBg}>
                    <Tr>
                      {tbl.headers.map((h, hi) => (
                        <Th key={hi} color={labelColor} fontSize="xs" textTransform="uppercase">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                )}
                <Tbody>
                  {tbl.rows.map((row, ri) => (
                    <Tr key={ri}>
                      {row.map((cell, ci) => (
                        <Td key={ci} fontSize="sm" color={textColor} isNumeric={isNumericCell(cell)}>{cell}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        ))}
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

function FieldsPanel({ fields, labelColor, textColor, sectionBg, borderColor }) {
  if (!fields || !Object.keys(fields).length)
    return <Text color={labelColor}>No form fields extracted.</Text>;

  const renderValue = (value, depth = 0) => {
    if (value === null || value === undefined) return <Text fontSize="sm" color={labelColor}>—</Text>;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return <Text fontSize="sm" color={textColor}>{String(value)}</Text>;
    }
    if (Array.isArray(value)) {
      return (
        <VStack align="stretch" spacing={1} pl={depth > 0 ? 3 : 0}>
          {value.map((item, i) => (
            <Box key={i}>
              {typeof item === 'object' ? (
                <Box pl={2} borderLeftWidth="2px" borderColor={borderColor} mt={1}>
                  {Object.entries(item).map(([k, v]) => (
                    <Box key={k} mb={1}>
                      <Text fontSize="xs" color={labelColor} fontWeight="semibold">{k}</Text>
                      {renderValue(v, depth + 1)}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Text fontSize="sm" color={textColor}>• {String(item)}</Text>
              )}
            </Box>
          ))}
        </VStack>
      );
    }
    if (typeof value === 'object') {
      return (
        <VStack align="stretch" spacing={1} pl={depth > 0 ? 3 : 0}>
          {Object.entries(value).map(([k, v]) => (
            <Box key={k}>
              <Text fontSize="xs" color={labelColor} fontWeight="semibold">{k}</Text>
              {renderValue(v, depth + 1)}
            </Box>
          ))}
        </VStack>
      );
    }
    return <Text fontSize="sm" color={textColor}>{JSON.stringify(value)}</Text>;
  };

  return (
    <VStack align="stretch" spacing={2}>
      {Object.entries(fields).map(([key, value]) => (
        <Box key={key} p={3} rounded="xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="xs" color={labelColor} mb={1} fontWeight="semibold" textTransform="uppercase">
            {key}
          </Text>
          {renderValue(value)}
        </Box>
      ))}
    </VStack>
  );
}

function RawTextPanel({ rawText, textColor, sectionBg, borderColor }) {
  return (
    <Box p={4} rounded="2xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
      <Code
        display="block"
        whiteSpace="pre-wrap"
        fontSize="xs"
        colorScheme="gray"
        color={textColor}
        maxH="400px"
        overflowY="auto"
      >
        {rawText || 'No raw text available.'}
      </Code>
    </Box>
  );
}

// ─── BoundingBoxOverlay ───────────────────────────────────────────────────────

/**
 * Renders an image with interactive bounding box overlays for table cells.
 *
 * Key fix: Azure Document Intelligence returns polygon coordinates in INCHES
 * measured from the top-left of the page. We scale inch coords to rendered
 * pixel positions using the formula:
 *
 *   pixelX = inchX * (displayWidth  / (naturalWidth  / DPI))
 *   pixelY = inchY * (displayHeight / (naturalHeight / DPI))
 *
 * where DPI = 96 (Azure's rendering DPI for images).
 * For PDFs, Azure uses 72 DPI by default unless you set a custom DPI.
 */
function BoundingBoxOverlay({ fileUrl, fileType, boundingData, sectionBg, borderColor, textColor, labelColor }) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const imgRef       = useRef(null);

  const [imgLoaded,       setImgLoaded]       = useState(false);
  const [showCells,       setShowCells]        = useState(true);
  const [showTableBounds, setShowTableBounds]  = useState(true);

  // Azure Document Intelligence polygon coords are in INCHES from page top-left.
  //
  // Correct scale:
  //   scaleX = displayWidth  / pageWidthInches
  //   scaleY = displayHeight / pageHeightInches
  //
  // We get pageWidthInches from the max X across all polygons (the table that
  // spans the page width gives us the real page width).
  //
  // CRITICAL: pageHeightInches must NOT come from max polygon Y — tables only
  // cover part of the page, so maxY ≈ 5.3" but the page is actually ~11".
  // Instead we derive pageH from the image's natural aspect ratio:
  //   pageH = pageW * (naturalHeight / naturalWidth)
  // This guarantees Y positions map correctly even when no table spans the
  // full page height.
  const pageWidthInches = useMemo(() => {
    let maxX = 0;
    boundingData.forEach((tbl) => {
      tbl.tableBounds?.forEach((r) => r.polygon?.forEach((p) => { if (p.x > maxX) maxX = p.x; }));
      tbl.cells?.forEach((c) => c.boundingRegions?.forEach((r) => r.polygon?.forEach((p) => { if (p.x > maxX) maxX = p.x; })));
    });
    return maxX > 6 ? maxX + 0.15 : 8.5;
  }, [boundingData]);

  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const rect     = img.getBoundingClientRect();
    const displayW = rect.width;
    const displayH = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width        = displayW * dpr;
    canvas.height       = displayH * dpr;
    canvas.style.width  = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    // Correct scale: inches → display pixels
    // pageH derived from image aspect ratio so Y coords map accurately
    // even when tables don't cover the full page height.
    const img2 = imgRef.current;
    const pageH = pageWidthInches * (img2.naturalHeight / img2.naturalWidth);
    const scaleX = displayW / pageWidthInches;
    const scaleY = displayH / pageH;

    const drawPolygon = (polygon, fillColor, strokeColor, lineWidth = 1.5) => {
      if (!polygon || polygon.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(polygon[0].x * scaleX, polygon[0].y * scaleY);
      for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i].x * scaleX, polygon[i].y * scaleY);
      }
      ctx.closePath();
      ctx.fillStyle   = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = lineWidth;
      ctx.stroke();
    };

    boundingData.forEach((tbl, tblIdx) => {
      const color = BOX_COLORS[tblIdx % BOX_COLORS.length];

      // Table-level bounding box + label badge
      if (showTableBounds && tbl.tableBounds?.length > 0) {
        tbl.tableBounds.forEach((region) => {
          if (!region.polygon) return;
          drawPolygon(region.polygon, 'rgba(99,102,241,0.05)', color.stroke, 2.5);

          // Compute top-left corner for label badge
          const minX = Math.min(...region.polygon.map((p) => p.x)) * scaleX;
          const minY = Math.min(...region.polygon.map((p) => p.y)) * scaleY;

          const labelText   = tbl.title;
          ctx.font          = 'bold 11px Inter, system-ui, sans-serif';
          const metrics     = ctx.measureText(labelText);
          const labelW      = metrics.width + 14;
          const labelH      = 20;
          const labelY      = minY - labelH - 4;

          // Badge background
          ctx.fillStyle = color.stroke;
          ctx.beginPath();
          ctx.roundRect(minX, labelY, labelW, labelH, 4);
          ctx.fill();

          // Badge text
          ctx.fillStyle    = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, minX + 7, labelY + labelH / 2);
        });
      }

      // Cell-level bounding boxes
      if (showCells) {
        tbl.cells.forEach((cell) => {
          cell.boundingRegions?.forEach((region) => {
            if (!region.polygon) return;
            const cellColor = cell.kind === 'columnHeader' ? HEADER_COLOR : color;
            drawPolygon(region.polygon, cellColor.fill, cellColor.stroke, 1.2);
          });
        });
      }
    });
  }, [boundingData, imgLoaded, showCells, showTableBounds, pageWidthInches]);

  // Re-draw whenever deps change or window resizes.
  // requestAnimationFrame ensures the canvas has non-zero dimensions even
  // when the tab was hidden on first render (display:none → zero getBoundingClientRect).
  useEffect(() => {
    const run = () => requestAnimationFrame(drawBoxes);
    run();
    // Retry once after a short delay in case the tab just became visible
    const timer = setTimeout(run, 100);
    window.addEventListener('resize', run);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', run);
    };
  }, [drawBoxes]);


  // ── if no image URL yet, show a loading/info state ─────────────────────────
  if (!fileUrl) {
    return (
      <Box
        p={6}
        rounded="2xl"
        bg={sectionBg}
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <Spinner size="sm" color="brand.400" mb={2} />
        <Text fontSize="sm" color={labelColor}>
          Rendering PDF preview…
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>

      {/* Controls */}
      <HStack spacing={4} flexWrap="wrap">
        <Checkbox
          isChecked={showTableBounds}
          onChange={(e) => setShowTableBounds(e.target.checked)}
          colorScheme="purple"
          size="sm"
        >
          <Text fontSize="sm">Table bounds</Text>
        </Checkbox>
        <Checkbox
          isChecked={showCells}
          onChange={(e) => setShowCells(e.target.checked)}
          colorScheme="blue"
          size="sm"
        >
          <Text fontSize="sm">Cell bounds</Text>
        </Checkbox>

        {/* Legend */}
        <HStack spacing={3} ml="auto" flexWrap="wrap">
          <HStack spacing={1}>
            <Box
              w={3} h={3} borderRadius="sm"
              bg="rgba(251,191,36,0.4)"
              border="1.5px solid" borderColor="#fbbf24"
            />
            <Text fontSize="xs" color={labelColor}>Header cell</Text>
          </HStack>
          <HStack spacing={1}>
            <Box
              w={3} h={3} borderRadius="sm"
              bg="rgba(99,102,241,0.2)"
              border="1.5px solid" borderColor="#6366f1"
            />
            <Text fontSize="xs" color={labelColor}>Content cell</Text>
          </HStack>
          {BOX_COLORS.slice(0, Math.min(boundingData.length, 3)).map((c, i) => (
            <HStack key={i} spacing={1}>
              <Box
                w={3} h={3} borderRadius="sm"
                bg={c.fill}
                border="2px solid" borderColor={c.stroke}
              />
              <Text fontSize="xs" color={labelColor}>Table {i + 1}</Text>
            </HStack>
          ))}
        </HStack>
      </HStack>

      {/* Image + Canvas overlay */}
      <Box
        ref={containerRef}
        position="relative"
        rounded="2xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        bg={sectionBg}
      >
        <img
          ref={imgRef}
          src={fileUrl}
          alt="Uploaded document with bounding boxes"
          style={{ width: '100%', display: 'block' }}
          onLoad={() => {
            setImgLoaded(true);
            // Force redraw after image loads — needed when tab was already active
            requestAnimationFrame(() => requestAnimationFrame(drawBoxes));
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Loading overlay while image loads */}
        {!imgLoaded && (
          <Box
            position="absolute" top={0} left={0} right={0} bottom={0}
            display="flex" alignItems="center" justifyContent="center"
            bg={sectionBg}
          >
            <Spinner size="md" color="brand.400" />
          </Box>
        )}
      </Box>

      {/* Summary cards per table */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
        {boundingData.map((tbl, idx) => {
          const color       = BOX_COLORS[idx % BOX_COLORS.length];
          const headerCount = tbl.cells.filter((c) => c.kind === 'columnHeader').length;
          const cellCount   = tbl.cells.length - headerCount;
          return (
            <Box key={idx} p={3} rounded="xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
              <HStack mb={2} spacing={2}>
                <Box
                  w={3} h={3} borderRadius="sm" flexShrink={0}
                  bg={color.fill}
                  border="2px solid" borderColor={color.stroke}
                />
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>{tbl.title}</Text>
              </HStack>
              <HStack spacing={3}>
                <Badge colorScheme="yellow" fontSize="10px">{headerCount} headers</Badge>
                <Badge colorScheme="blue"   fontSize="10px">{cellCount} cells</Badge>
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>

    </VStack>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OcrUploader() {
  const [file,              setFile]              = useState(null);
  const [fileUrl,           setFileUrl]           = useState(null);   // object URL for image/pdf-render preview
  const [fileType,          setFileType]          = useState(null);   // 'image' | 'pdf'
  const pdfFileRef = useRef(null);                                     // holds raw PDF File for rendering
  const [isDragging,        setIsDragging]        = useState(false);
  const [pages,             setPages]             = useState('');
  const [extractParagraphs, setExtractParagraphs] = useState(true);
  const [extractTables,     setExtractTables]     = useState(false);
  const [extractFields,     setExtractFields]     = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [parsed,            setParsed]            = useState(null);
  const [error,             setError]             = useState(null);

  const bg          = useColorModeValue('gray.50',  'gray.950');
  const cardBg      = useColorModeValue('white',    'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor  = useColorModeValue('gray.600', 'gray.300');
  const textColor   = useColorModeValue('gray.700', 'gray.100');
  const sectionBg   = useColorModeValue('gray.50',  'gray.900');
  const statBg      = useColorModeValue('gray.100', 'gray.700');
  const dragBg      = useColorModeValue('brand.50', 'brand.900');
  const fileIconBg    = useColorModeValue('blue.50',  'blue.900');
  const fileIconColor = useColorModeValue('blue.600', 'blue.200');

  const { themeStore: { themeConfig } } = stores;

  // ── file selection helpers ─────────────────────────────────────────────────

  /** Render the first page of a PDF to a data-URL using PDF.js */
  const renderPdfToImage = useCallback(async (pdfFile) => {
    try {
      // Load PDF.js from CDN if not already loaded
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf         = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page        = await pdf.getPage(1);

      // Render at 2x scale for crisp display
      const scale    = 2;
      const viewport = page.getViewport({ scale });
      const canvas   = document.createElement('canvas');
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;

      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('PDF render error:', err);
      return null;
    }
  }, []);

  const applyFile = useCallback(async (selected) => {
    if (!selected) return;
    setFile(selected);

    // Revoke previous object URL to avoid memory leak (only for blob: URLs, not data: URLs)
    if (fileUrl && fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);

    if (selected.type.startsWith('image/')) {
      setFileUrl(URL.createObjectURL(selected));
      setFileType('image');
      pdfFileRef.current = null;
    } else {
      // PDF: render first page to image for bounding box overlay
      setFileType('pdf');
      setFileUrl(null);   // clear while rendering
      pdfFileRef.current = selected;
      const dataUrl = await renderPdfToImage(selected);
      if (dataUrl) setFileUrl(dataUrl);
    }
  }, [fileUrl, renderPdfToImage]);

  const handleFileChange = (e) => { applyFile(e.target.files?.[0]); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0]); // async – fileUrl updates when PDF renders
  };

  const removeFile = () => {
    if (fileUrl && fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl(null);
    setFileType(null);
    setParsed(null);
    setPages('');
    setError(null);
    setIsDragging(false);
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => { if (fileUrl && fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }

    setLoading(true);
    setError(null);
    setParsed(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pages', normalizePageRange(pages));
    formData.append('extractParagraphs', extractParagraphs);
    formData.append('extractTables', extractTables);
    formData.append('extractFields', extractFields);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ocr`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OCR request failed');
      setParsed(parseOcrResponse(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which result tabs to show
  const showParagraphsTab  = extractParagraphs && parsed?.paragraphs?.length > 0;
  const showTablesTab      = extractTables     && parsed?.tables?.length > 0;
  const showFieldsTab      = extractFields     && parsed?.fields && Object.keys(parsed.fields).length > 0;
  const showBoundingBoxTab = extractTables     && parsed?.boundingData?.length > 0;
  const showForm = !parsed;

  return (
    <Box minH="80vh" py={10} px={{ base: 4, md: 8 }} bg={bg} color={textColor}>
      <Box maxW={showForm ? '4xl' : '100%'} mx="auto" w="full">
        <Card w="full" bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="3xl" boxShadow="xl">
          <CardBody p={{ base: 6, md: 10 }}>
            <VStack align="stretch" spacing={6}>

              {/* Header */}
              <Box>
                <Heading size="xl" color={themeConfig.colors?.brand?.[300] ?? 'brand.500'} mb={2}>
                  OCR Scanner
                </Heading>
                <Text fontSize="md" color={labelColor}>
                  Upload a PDF or image to extract text, tables, and form fields.
                </Text>
              </Box>

              {/* Form */}
              {showForm && (
                <Box as="form" onSubmit={handleSubmit}>
                  <VStack spacing={5} align="stretch">

                    {/* Upload zone */}
                  <FormControl>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="medium" mb={2}>
                      Upload file
                    </FormLabel>

                    <Box
                      position="relative"
                      border="1.5px dashed"
                      borderColor={isDragging ? 'brand.400' : borderColor}
                      borderRadius="xl"
                      bg={isDragging ? dragBg : 'transparent'}
                      py={8}
                      px={4}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{ borderColor: 'brand.400', bg: dragBg }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      <Input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        position="absolute"
                        top={0} left={0}
                        width="100%" height="100%"
                        opacity={0}
                        cursor="pointer"
                        zIndex={1}
                      />
                      <VStack spacing={2} pointerEvents="none">
                        <Box
                          w={11} h={11} borderRadius="lg" bg={sectionBg}
                          display="flex" alignItems="center" justifyContent="center" mx="auto"
                        >
                          <Icon as={FiUpload} boxSize={5} color={labelColor} />
                        </Box>
                        <Text fontSize="sm" fontWeight="medium" color={textColor}>
                          Drop your file here
                        </Text>
                        <Text fontSize="xs" color={labelColor}>
                          or{' '}
                          <Text as="span" color="brand.400" fontWeight="medium">
                            browse to upload
                          </Text>
                        </Text>
                      </VStack>
                    </Box>

                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {['PDF', 'JPG', 'PNG', 'Max 10 MB'].map((t) => (
                        <Badge key={t} variant="subtle" colorScheme="gray" fontSize="10px" borderRadius="full" px={2}>
                          {t}
                        </Badge>
                      ))}
                    </HStack>

                    {file && (
                      <HStack
                        mt={3} p={2} pl={3}
                        bg={cardBg}
                        borderWidth="1px" borderColor={borderColor}
                        borderRadius="lg"
                        spacing={3}
                      >
                        <Box
                          w={8} h={8} borderRadius="md" bg={fileIconBg}
                          display="flex" alignItems="center" justifyContent="center"
                          flexShrink={0}
                        >
                          <Icon as={FiFile} boxSize={4} color={fileIconColor} />
                        </Box>
                        <Box flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight="medium" color={textColor} noOfLines={1}>
                            {file.name}
                          </Text>
                          <Text fontSize="xs" color={labelColor}>
                            {(file.size / 1024).toFixed(1)} KB
                            {fileType && (
                              <Badge ml={2} fontSize="9px" colorScheme={fileType === 'image' ? 'green' : 'blue'}>
                                {fileType === 'image' ? 'Image' : 'PDF'}
                              </Badge>
                            )}
                          </Text>
                        </Box>
                        <IconButton
                          size="xs" variant="ghost"
                          aria-label="Remove file"
                          icon={<Icon as={FiX} boxSize={3.5} />}
                          onClick={removeFile}
                          colorScheme="gray"
                          mr={1}
                        />
                      </HStack>
                    )}
                  </FormControl>

                  {/* Page range */}
                  <FormControl>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="medium">
                      Page range
                    </FormLabel>
                    <Input
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="blank = all pages · 3 · 1-4"
                      borderRadius="xl"
                      bg={sectionBg}
                    />
                    <Text fontSize="xs" color={labelColor} mt={1.5}>
                      Will extract:{' '}
                      <Text as="span" color={textColor} fontWeight="medium">
                        {(() => {
                          const val = pages.trim().toLowerCase();
                          if (!val || val === 'all') return 'all pages';
                          if (/^\d+-\d+$/.test(val)) return `pages ${val}`;
                          return `page ${val}`;
                        })()}
                      </Text>
                      {' '}·{' '}
                      <Text as="span" fontWeight="medium" color={textColor}>blank / "all"</Text> = every page,{' '}
                      <Text as="span" fontWeight="medium" color={textColor}>3</Text> = only page 3,{' '}
                      <Text as="span" fontWeight="medium" color={textColor}>1-4</Text> = pages 1–4
                    </Text>
                  </FormControl>

                  {/* Extract options */}
                  <Box p={4} rounded="2xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
                    <Text fontWeight="semibold" mb={3} color={textColor} fontSize="sm">
                      Extract options
                    </Text>
                    <VStack spacing={3} align="start">
                      <Checkbox
                        isChecked={extractParagraphs}
                        onChange={(e) => setExtractParagraphs(e.target.checked)}
                        colorScheme="brand"
                      >
                        <Text fontSize="sm">Paragraphs</Text>
                      </Checkbox>
                      <Checkbox
                        isChecked={extractTables}
                        onChange={(e) => setExtractTables(e.target.checked)}
                        colorScheme="brand"
                      >
                        <HStack spacing={2}>
                          <Text fontSize="sm">Tables</Text>
                          <Badge fontSize="9px" colorScheme="purple">+ bounding boxes</Badge>
                        </HStack>
                      </Checkbox>
                      <Checkbox
                        isChecked={extractFields}
                        onChange={(e) => setExtractFields(e.target.checked)}
                        colorScheme="brand"
                      >
                        <Text fontSize="sm">Form fields</Text>
                      </Checkbox>
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
                    isDisabled={loading}
                    borderRadius="2xl"
                  >
                    {loading ? (
                      <HStack justify="center" spacing={3}>
                        <Spinner size="sm" />
                        <Text>Processing…</Text>
                      </HStack>
                    ) : (
                      'Run OCR'
                    )}
                  </Button>
                </VStack>
              </Box>
              )}

              {/* Results - Split View */}
              {parsed && (
                <Box pt={4}>
                  <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={3} mb={4}>
                    <Text fontSize="sm" color={labelColor}>
                      Showing results for: {file?.name ?? 'uploaded file'}
                    </Text>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={removeFile}>
                      Remove file
                    </Button>
                  </Box>
                  <Divider mb={6} />

                  {/* Stats */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Paragraphs</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>
                        {parsed.paragraphs.length}
                      </Text>
                    </Box>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Tables</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>
                        {parsed.tables.length}
                      </Text>
                    </Box>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Fields</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>
                        {parsed.fields ? Object.keys(parsed.fields).length : 0}
                      </Text>
                    </Box>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Characters</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>
                        {parsed.rawText.length.toLocaleString()}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Side-by-side Layout */}
                  <Box display={{ base: 'block', lg: 'grid' }} gridTemplateColumns={{ lg: '1fr 1.2fr' }} gap={6} mb={8}>
                    {/* Left: Document Preview */}
                    {fileUrl && showBoundingBoxTab && (
                      <Box
                        p={4} rounded="2xl" borderWidth="1px" borderColor={borderColor}
                        bg={sectionBg} maxH="600px" overflowY="auto"
                      >
                        <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
                          Document
                        </Text>
                        <Box
                          position="relative" rounded="xl" overflow="hidden"
                          borderWidth="1px" borderColor={borderColor} bg={sectionBg}
                        >
                          <img
                            src={fileUrl}
                            alt="Uploaded document"
                            style={{ width: '100%', display: 'block' }}
                          />
                        </Box>
                        <Text fontSize="xs" color={labelColor} mt={3}>
                          {file?.name} · {fileType === 'image' ? '🖼️ Image' : '📄 PDF'} · {(file?.size / 1024).toFixed(1)} KB
                        </Text>
                      </Box>
                    )}

                    {/* Right: Results with Tabs */}
                    <Box>
                      <Tabs variant="soft-rounded" colorScheme="brand" isLazy>
                        <TabList flexWrap="wrap" gap={1} mb={4}>
                          {showParagraphsTab  && <Tab fontSize="sm">Paragraphs</Tab>}
                          {showTablesTab      && <Tab fontSize="sm">Tables</Tab>}
                          {showFieldsTab      && <Tab fontSize="sm">Fields</Tab>}
                          {showBoundingBoxTab && <Tab fontSize="sm">Bounding Boxes</Tab>}
                          <Tab fontSize="sm">Raw Text</Tab>
                        </TabList>

                        <TabPanels>
                          {showParagraphsTab && (
                            <TabPanel px={0} py={4}>
                              <Box maxH="600px" overflowY="auto" pr={3}>
                                <ParagraphsPanel
                                  paragraphs={parsed.paragraphs}
                                  labelColor={labelColor}
                                  textColor={textColor}
                                  sectionBg={sectionBg}
                                  borderColor={borderColor}
                                />
                              </Box>
                            </TabPanel>
                          )}
                          {showTablesTab && (
                            <TabPanel px={0} py={4}>
                              <Box maxH="600px" overflowY="auto" pr={3}>
                                <TablesPanel
                                  tables={parsed.tables}
                                  labelColor={labelColor}
                                  textColor={textColor}
                                  sectionBg={sectionBg}
                                  borderColor={borderColor}
                                />
                              </Box>
                            </TabPanel>
                          )}
                          {showFieldsTab && (
                            <TabPanel px={0} py={4}>
                              <Box maxH="600px" overflowY="auto" pr={3}>
                                <FieldsPanel
                                  fields={parsed.fields}
                                  labelColor={labelColor}
                                  textColor={textColor}
                                  sectionBg={sectionBg}
                                  borderColor={borderColor}
                                />
                              </Box>
                            </TabPanel>
                          )}
                          {showBoundingBoxTab && (
                            <TabPanel px={0} py={4}>
                              <Box maxH="700px" overflowY="auto" pr={3}>
                                <BoundingBoxOverlay
                                  fileUrl={fileUrl}
                                  fileType={fileType}
                                  boundingData={parsed.boundingData}
                                  sectionBg={sectionBg}
                                  borderColor={borderColor}
                                  textColor={textColor}
                                  labelColor={labelColor}
                                />
                              </Box>
                            </TabPanel>
                          )}
                          <TabPanel px={0} py={4}>
                            <Box maxH="600px" overflowY="auto" pr={3}>
                              <RawTextPanel
                                rawText={parsed.rawText}
                                textColor={textColor}
                                sectionBg={sectionBg}
                                borderColor={borderColor}
                              />
                            </Box>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  </Box>
                </Box>
              )}

            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
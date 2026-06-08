import React, { useState } from 'react';
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
  const out = { paragraphs: [], tables: [], fields: null, rawText: '' };
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
      ocr.tables.forEach((tbl, idx) => out.tables.push(normaliseTable(tbl, idx)));
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

function isNumericCell(cell) {
  return /^[\d,\.%\(\)₹$€£\s]+$/.test(String(cell).trim());
}

/**
 * Normalize page range before sending to the backend.
 * "4"   → "1-4"  (user means "up to page 4", NOT "only page 4")
 * "1"   → "1"
 * "2-4" → "2-4"  (explicit range, unchanged)
 * "all" → "all"
 */
function normalizePageRange(input) {
  const val = (input || '').trim().toLowerCase();
  if (!val || val === 'all') return 'all';
  // Single number = that exact page (e.g. "3" = page 3 only)
  // Explicit range = pass through (e.g. "1-4" = pages 1 to 4)
  return val;
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

function TablesPanel({ tables, labelColor, textColor, sectionBg, borderColor }) {
  if (!tables.length) return <Text color={labelColor}>No tables extracted.</Text>;
  return (
    <VStack align="stretch" spacing={5}>
      {tables.map((tbl, ti) => (
        <Box key={ti} rounded="2xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          <Box px={4} py={2} bg={sectionBg} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>{tbl.title}</Text>
          </Box>
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
  );
}

function FieldsPanel({ fields, labelColor, textColor, sectionBg, borderColor }) {
  if (!fields || !Object.keys(fields).length) return <Text color={labelColor}>No form fields extracted.</Text>;
  return (
    <VStack align="stretch" spacing={2}>
      {Object.entries(fields).map(([key, value]) => (
        <Box key={key} p={3} rounded="xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="xs" color={labelColor} mb={1} fontWeight="semibold">{key}</Text>
          <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </Text>
        </Box>
      ))}
    </VStack>
  );
}

function RawTextPanel({ rawText, textColor, sectionBg, borderColor }) {
  return (
    <Box p={4} rounded="2xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
      <Code display="block" whiteSpace="pre-wrap" fontSize="xs" colorScheme="gray" color={textColor} maxH="400px" overflowY="auto">
        {rawText || 'No raw text available.'}
      </Code>
    </Box>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OcrUploader() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pages, setPages] = useState('');
  const [extractParagraphs, setExtractParagraphs] = useState(true);
  const [extractTables, setExtractTables] = useState(false);
  const [extractFields, setExtractFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);

  const bg = useColorModeValue('gray.50', 'gray.950');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const sectionBg = useColorModeValue('gray.50', 'gray.900');
  const statBg = useColorModeValue('gray.100', 'gray.700');
  const dragBg = useColorModeValue('brand.50', 'brand.900');
  const fileIconBg = useColorModeValue('blue.50', 'blue.900');
  const fileIconColor = useColorModeValue('blue.600', 'blue.200');

  const { themeStore: { themeConfig } } = stores;

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

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
      const response = await fetch(`${BACKEND_URL}/api/ocr`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OCR request failed');
      setParsed(parseOcrResponse(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="80vh" py={10} px={{ base: 4, md: 8 }} bg={bg} color={textColor}>
      <Box maxW="4xl" mx="auto">
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="3xl" boxShadow="xl">
          <CardBody p={{ base: 6, md: 10 }}>
            <VStack align="stretch" spacing={6}>

              {/* header */}
              <Box>
                <Heading size="xl" color={themeConfig.colors?.brand?.[300] ?? 'brand.500'} mb={2}>
                  OCR Scanner
                </Heading>
                <Text fontSize="md" color={labelColor}>
                  Upload a PDF or image to extract text, tables, and form fields.
                </Text>
              </Box>

              {/* form */}
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">

                  {/* ── upload zone ── */}
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
                      {/* invisible input covers the full zone */}
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

                      <VStack spacing={2} pointerEvents="none">
                        <Box
                          w={11}
                          h={11}
                          borderRadius="lg"
                          bg={sectionBg}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mx="auto"
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

                    {/* type badges */}
                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {['PDF', 'JPG', 'PNG', 'Max 10 MB'].map((t) => (
                        <Badge key={t} variant="subtle" colorScheme="gray" fontSize="10px" borderRadius="full" px={2}>
                          {t}
                        </Badge>
                      ))}
                    </HStack>

                    {/* selected file pill */}
                    {file && (
                      <HStack
                        mt={3}
                        p={2}
                        pl={3}
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="lg"
                        spacing={3}
                      >
                        <Box
                          w={8}
                          h={8}
                          borderRadius="md"
                          bg={fileIconBg}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
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
                          </Text>
                        </Box>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Remove file"
                          icon={<Icon as={FiX} boxSize={3.5} />}
                          onClick={() => setFile(null)}
                          colorScheme="gray"
                          mr={1}
                        />
                      </HStack>
                    )}
                  </FormControl>

                  {/* page range */}
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
                    <HStack mt={1.5} spacing={1} align="center">
                      <Text fontSize="xs" color={labelColor}>
                        Will extract:{' '}
                        <Text as="span" color={textColor} fontWeight="medium">
                          {(() => {
                            const val = pages.trim().toLowerCase();
                            if (!val || val === 'all') return 'all pages';
                            if (/^\d+-\d+$/.test(val)) return `pages ${val}`;
                            return `page ${val}`;
                          })()}
                        </Text>
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={labelColor} mt={0.5}>
                      Tip: <Text as="span" fontWeight="medium" color={textColor}>blank or "all"</Text> = every page &nbsp;·&nbsp; <Text as="span" fontWeight="medium" color={textColor}>3</Text> = only page 3 &nbsp;·&nbsp; <Text as="span" fontWeight="medium" color={textColor}>1-4</Text> = pages 1 to 4.
                    </Text>
                  </FormControl>

                  {/* extract options */}
                  <Box p={4} rounded="2xl" bg={sectionBg} borderWidth="1px" borderColor={borderColor}>
                    <Text fontWeight="semibold" mb={3} color={textColor} fontSize="sm">
                      Extract options
                    </Text>
                    <VStack spacing={3} align="start">
                      <Checkbox isChecked={extractParagraphs} onChange={(e) => setExtractParagraphs(e.target.checked)} colorScheme="brand">
                        <Text fontSize="sm">Paragraphs</Text>
                      </Checkbox>
                      <Checkbox isChecked={extractTables} onChange={(e) => setExtractTables(e.target.checked)} colorScheme="brand">
                        <Text fontSize="sm">Tables</Text>
                      </Checkbox>
                      <Checkbox isChecked={extractFields} onChange={(e) => setExtractFields(e.target.checked)} colorScheme="brand">
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

              {/* results */}
              {parsed && (
                <Box pt={4}>
                  <Divider mb={6} />

                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Paragraphs</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>{parsed.paragraphs.length}</Text>
                    </Box>
                    <Box bg={statBg} p={3} rounded="xl" textAlign="center">
                      <Text fontSize="xs" color={labelColor} mb={1}>Tables</Text>
                      <Text fontSize="2xl" fontWeight="semibold" color={textColor}>{parsed.tables.length}</Text>
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

                  <Tabs variant="soft-rounded" colorScheme="brand">
                    <TabList flexWrap="wrap" gap={1}>
                      {extractParagraphs && parsed.paragraphs.length > 0 && <Tab>Paragraphs</Tab>}
                      {extractTables && parsed.tables.length > 0 && <Tab>Tables</Tab>}
                      {extractFields && parsed.fields && <Tab>Fields</Tab>}
                      <Tab>Raw text</Tab>
                    </TabList>

                    <TabPanels>
                      {extractParagraphs && parsed.paragraphs.length > 0 && (
                        <TabPanel px={0} py={4}>
                          <ParagraphsPanel paragraphs={parsed.paragraphs} labelColor={labelColor} textColor={textColor} sectionBg={sectionBg} borderColor={borderColor} />
                        </TabPanel>
                      )}
                      {extractTables && parsed.tables.length > 0 && (
                        <TabPanel px={0} py={4}>
                          <TablesPanel tables={parsed.tables} labelColor={labelColor} textColor={textColor} sectionBg={sectionBg} borderColor={borderColor} />
                        </TabPanel>
                      )}
                      {extractFields && parsed.fields && (
                        <TabPanel px={0} py={4}>
                          <FieldsPanel fields={parsed.fields} labelColor={labelColor} textColor={textColor} sectionBg={sectionBg} borderColor={borderColor} />
                        </TabPanel>
                      )}
                      <TabPanel px={0} py={4}>
                        <RawTextPanel rawText={parsed.rawText} textColor={textColor} sectionBg={sectionBg} borderColor={borderColor} />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              )}

            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
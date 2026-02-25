"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Container, Heading, VStack, HStack, Select, SimpleGrid,
  Text, useToast, FormControl, FormLabel, Card, Icon, Input, Badge, IconButton,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, Divider, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import {
  FileUp, Hash, Eye, Trash2,
  FileText, ChevronLeft, ChevronRight, Type, Settings2
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';

// Worker initialization
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFNumberingPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currPreviewPage, setCurrPreviewPage] = useState<number>(1);

  // Settings State
  const [prefix, setPrefix] = useState<string>('Page');
  const [format, setFormat] = useState<string>('of');
  const [position, setPosition] = useState<string>('bottom-center');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [color, setColor] = useState<string>('#4A5568'); // Professional Slate Gray
  const [fontSize, setFontSize] = useState<number>(11);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const toast = useToast();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
      setCurrPreviewPage(1);
    },
  });

  const previewText = useMemo(() => {
    const current = currPreviewPage + (startNumber - 1);
    const total = numPages + (startNumber - 1);
    const base = prefix ? `${prefix} ${current}` : `${current}`;

    if (format === 'of') return `${base} of ${total}`;
    if (format === 'bracket') return `[ ${base} ]`;
    return base;
  }, [prefix, format, startNumber, currPreviewPage, numPages]);

  const getOverlayStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      position: 'absolute',
      color: color,
      fontSize: `${fontSize}px`,
      fontWeight: '500',
      pointerEvents: 'none',
      width: '100%',
      display: 'flex',
      padding: '25px 45px',
      zIndex: 10,
      fontFamily: 'Helvetica, Arial, sans-serif'
    };

    if (position.includes('bottom')) styles.bottom = '0';
    if (position.includes('top')) styles.top = '0';
    if (position.includes('center')) styles.justifyContent = 'center';
    if (position.includes('left')) styles.justifyContent = 'flex-start';
    if (position.includes('right')) styles.justifyContent = 'flex-end';

    return styles;
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const current = index + startNumber;
        const total = pages.length + (startNumber - 1);
        const base = prefix ? `${prefix} ${current}` : `${current}`;

        let text = base;
        if (format === 'of') text = `${base} of ${total}`;
        if (format === 'bracket') text = `[ ${base} ]`;

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x = width / 2 - textWidth / 2;
        let y = 35;

        if (position.includes('left')) x = 50;
        if (position.includes('right')) x = width - textWidth - 50;
        if (position.includes('top')) y = height - 45;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(r, g, b) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Numbered_${file.name}`;
      link.click();

      toast({ title: "Document Ready", status: "success", isClosable: true });
    } catch (e) {
      toast({ title: "Error", description: "Failed to process PDF", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" color="gray.700">PDF Editor</Heading>
        <Text color="gray.500">Configure page numbering and branding for your documents</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
        {/* LEFT: SETTINGS */}
        <VStack spacing={6} align="stretch">
          <Card p={0} variant="outline" borderRadius="xl" shadow="sm" overflow="hidden">
            <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
              <HStack>
                <Icon as={Settings2} size={18} />
                <Text fontWeight="bold">Configuration</Text>
              </HStack>
            </Box>

            <VStack spacing={5} p={6}>
              {!file ? (
                <Box
                  {...getRootProps()}
                  w="full" py={10} border="2px dashed" borderColor="gray.200"
                  borderRadius="lg" bg="white" cursor="pointer" textAlign="center"
                  _hover={{ borderColor: "blue.400", bg: "blue.50" }} transition="all 0.2s"
                >
                  <input {...getInputProps()} />
                  <Icon as={FileUp} w={8} h={8} color="gray.400" mb={3} />
                  <Text fontWeight="semibold" color="gray.600">Drop your PDF file here</Text>
                  <Text fontSize="xs" color="gray.400">PDF format only (Max 50MB)</Text>
                </Box>
              ) : (
                <HStack w="full" p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                  <Icon as={FileText} color="blue.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold" fontSize="sm" noOfLines={1} color="blue.700">{file.name}</Text>
                    <Text fontSize="xs" color="blue.600">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                  </VStack>
                  <IconButton aria-label="remove" size="sm" variant="ghost" icon={<Trash2 size={16} />} onClick={() => setFile(null)} colorScheme="red" />
                </HStack>
              )}

              <Divider />

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">PREFIX</FormLabel>
                  <InputGroup size="sm">
                    <InputLeftElement children={<Type size={14} color="gray" />} />
                    <Input rounded="md" placeholder="e.g. Page" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">START FROM</FormLabel>
                  <Input size="sm" type="number" rounded="md" value={startNumber} onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">FORMAT</FormLabel>
                  <Select size="sm" rounded="md" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="simple">Simple (Page 1)</option>
                    <option value="of">Formal (Page 1 of X)</option>
                    <option value="bracket">Classic [ 1 ]</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">POSITION</FormLabel>
                  <Select size="sm" rounded="md" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">STYLE (COLOR & SIZE)</FormLabel>
                <HStack spacing={4}>
                  <Input type="color" w="50px" h="34px" p={1} value={color} onChange={(e) => setColor(e.target.value)} cursor="pointer" border="none" />
                  <Slider flex="1" value={fontSize} min={8} max={24} onChange={(v) => setFontSize(v)}>
                    <SliderTrack><SliderFilledTrack bg="blue.500" /></SliderTrack>
                    <SliderThumb boxSize={4} />
                  </Slider>
                  <Text fontSize="sm" fontWeight="bold" color="gray.600">{fontSize}px</Text>
                </HStack>
              </FormControl>

              <Button
                w="full" size="lg" colorScheme="blue" leftIcon={<Hash size={18} />}
                isDisabled={!file} isLoading={isProcessing} onClick={handleDownload}
                h="56px" fontSize="md"
              >
                Apply & Download PDF
              </Button>
            </VStack>
          </Card>
        </VStack>

        {/* RIGHT: PREVIEW */}
        <VStack spacing={4} align="stretch">
          <Card variant="outline" borderRadius="xl" bg="gray.50" h="full" minH="650px" shadow="inner" borderStyle="dashed">
            <HStack p={4} bg="white" borderBottom="1px solid" borderColor="gray.100" justifyContent="space-between">
              <HStack>
                <Icon as={Eye} size={16} color="blue.500" />
                <Text fontSize="sm" fontWeight="bold" color="gray.700">Visual Preview</Text>
              </HStack>
              {file && (
                <HStack spacing={3}>
                  <IconButton size="xs" variant="outline" icon={<ChevronLeft size={16} />} onClick={() => setCurrPreviewPage(p => Math.max(1, p - 1))} isDisabled={currPreviewPage === 1} aria-label="prev" />
                  <Badge colorScheme="gray" px={2} py={1} borderRadius="md" variant="solid">Page {currPreviewPage} / {numPages}</Badge>
                  <IconButton size="xs" variant="outline" icon={<ChevronRight size={16} />} onClick={() => setCurrPreviewPage(p => Math.min(numPages, p + 1))} isDisabled={currPreviewPage === numPages} aria-label="next" />
                </HStack>
              )}
            </HStack>
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" p={10} position="relative" overflow="hidden">
              {previewUrl ? (
                <Box position="relative" bg="white" shadow="2xl" border="1px solid" borderColor="gray.200">
                  <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    <Page
                      pageNumber={currPreviewPage}
                      width={420}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  {/* LIVE OVERLAY */}
                  <div style={getOverlayStyles()}>
                    {previewText}
                  </div>
                </Box>
              ) : (
                <VStack spacing={4} color="gray.400">
                  <Box p={6} borderRadius="full" bg="white" border="1px solid" borderColor="gray.100">
                    <Icon as={FileText} size={40} strokeWidth={1.5} />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium">No document active</Text>
                </VStack>
              )}
            </Box>
          </Card>
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default PDFNumberingPage;
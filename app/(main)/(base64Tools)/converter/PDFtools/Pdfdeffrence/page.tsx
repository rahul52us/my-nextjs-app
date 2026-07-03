"use client";
import React, { useState, useRef } from 'react';
import {
  Box, Container, Flex, Heading, HStack, Icon, Stack, Text, useToast,
  Center, VStack, Badge, Tabs, TabList, TabPanels,
  Tab, TabPanel, IconButton, Switch, FormControl, FormLabel,
  useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import { DiffEditor } from '@monaco-editor/react';
import { pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import {
  FileText, UploadCloud, Trash2, ArrowLeftRight,
  FileCheck, Zap, Image as ImageIcon, ScanEye, Maximize2
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'json', 'md', 'png', 'jpg', 'jpeg', 'webp'];

const FileComparer = () => {
  const [files, setFiles] = useState({ left: '', right: '' });
  const [previews, setPreviews] = useState({ left: '', right: '' });
  const [fileNames, setFileNames] = useState({ left: '', right: '' });
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // ── Header ke saath sync ──
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // ── Theme tokens ──
  const bgColor      = useColorModeValue('gray.50',   'gray.950');
  const cardBg       = useColorModeValue('white',     'gray.900');
  const borderColor  = useColorModeValue('gray.200',  'gray.700');
  const accentColor  = useColorModeValue('blue.600',  'blue.300');
  const subText      = useColorModeValue('gray.500',  'gray.400');
  const labelColor   = useColorModeValue('gray.400',  'gray.500');
  const editorTheme  = isDark ? 'vs-dark' : 'vs-light';

  // Tab bar
  const tabBarBg     = useColorModeValue('gray.200',  'gray.700');
  const tabSelBg     = useColorModeValue('white',     'gray.800');
  const tabSelColor  = useColorModeValue('blue.600',  'blue.300');

  // Pixel comparison banner
  const bannerBg     = useColorModeValue('blue.50',   'blue.900');
  const bannerBorder = useColorModeValue('blue.100',  'blue.700');
  const bannerText   = useColorModeValue('blue.700',  'blue.200');
  const bannerIcon   = useColorModeValue('blue.500',  'blue.300');

  // Swap button
  const swapBg       = useColorModeValue('white',     'gray.800');
  const swapBorder   = useColorModeValue('gray.200',  'gray.600');
  const swapHoverBg  = useColorModeValue('blue.50',   'blue.900');
  const swapHoverColor = useColorModeValue('blue.600','blue.300');
  const swapIconColor = useColorModeValue('gray.600',  'gray.300');

  // Overlay bg
  const overlayBg    = useColorModeValue('white',     'gray.900');

  // Right panel bg in side-by-side
  const rightPanelBg = useColorModeValue('gray.50',   'gray.800');

  // Upload box drag-active colors — theme-consistent, shared by both boxes
  const dragActiveBorder = useColorModeValue('blue.400', 'blue.300');
  const dragActiveBg     = useColorModeValue('blue.50',  'blue.900');

  const extractText = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    if (extension === 'docx') {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    if (extension === 'pdf') {
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
      }
      return fullText;
    }
    return (['txt', 'json', 'md'].includes(extension || '')) ? await file.text() : "";
  };

  const clearAll = () => {
    setFiles({ left: '', right: '' });
    setPreviews({ left: '', right: '' });
    setFileNames({ left: '', right: '' });
    if (leftInputRef.current)  leftInputRef.current.value  = '';
    if (rightInputRef.current) rightInputRef.current.value = '';
  };

  // Core loader — used by both the <input> picker and drag-and-drop
  const processFile = async (file: File, side: 'left' | 'right') => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
      toast({
        title: "Unsupported file type",
        description: "PDF, DOCX, TXT, MD, PNG, JPG and WEBP are supported.",
        status: "warning",
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    try {
      if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviews(prev => ({ ...prev, [side]: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }

      const text = await extractText(file);
      setFiles(prev => ({ ...prev, [side]: text }));
      setFileNames(prev => ({ ...prev, [side]: file.name }));

      toast({
        title: "Document Synced",
        description: `${file.name} is ready.`,
        status: "success",
        position: "top-right",
        variant: "left-accent"
      });
    } catch (error) {
      toast({ title: "Processing Error", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file, side);
    e.target.value = '';
  };

  const handleFileDrop = async (file: File, side: 'left' | 'right') => {
    await processFile(file, side);
  };

  const swapSides = () => {
    setFiles({ left: files.right, right: files.left });
    setFileNames({ left: fileNames.right, right: fileNames.left });
    setPreviews({ left: previews.right, right: previews.left });
  };

  return (
    <Box bg={bgColor} minH="100vh" color={useColorModeValue('gray.800', 'gray.100')}>

      {/* ── Navbar ── */}
      <Box
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={3} px={8}
        position="sticky" top={0} zIndex={10}
        shadow="sm"
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
          <HStack spacing={3}>
            <Box p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <Icon as={Zap} color={accentColor} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" fontWeight="800" letterSpacing="tight">
                DOCDIFF <Text as="span" color={accentColor}>VISUAL</Text>
              </Heading>
              <Text fontSize="10px" color={subText} fontWeight="bold">PRECISION DOCUMENT AUDIT</Text>
            </VStack>
          </HStack>
          <HStack spacing={4}>
            <Badge variant="subtle" colorScheme="brand" borderRadius="md" px={2}>Pro Edition</Badge>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<Trash2 size={18}/>}
              aria-label="clear"
               onClick={clearAll}
            />
          </HStack>
        </Flex>
      </Box>

      <Container maxW="1400px" py={8}>
        <Stack spacing={8}>

          {/* ── Upload Section ── */}
          <Flex gap={6} align="center" direction={{ base: "column", md: "row" }}>
            <UploadBox
              title="Reference"
              fileName={fileNames.left}
              inputRef={leftInputRef}
              onUpload={(e: any) => handleFileChange(e, 'left')}
              onFileDrop={(file: File) => handleFileDrop(file, 'left')}
              isDark={isDark}
              cardBg={cardBg}
              borderColor={borderColor}
              dragActiveBorder={dragActiveBorder}
              dragActiveBg={dragActiveBg}
            />
            <IconButton
  aria-label="Swap"
  icon={<ArrowLeftRight size={22} color="currentColor" />}
  onClick={swapSides}
  variant="unstyled"                        // ← solid hatao, unstyled lagao
  display="flex"
  alignItems="center"
  justifyContent="center"
  bg={swapBg}
  color={swapIconColor}                     // ← icon color theme-aware
  shadow="md"
  border="1px solid"
  borderColor={swapBorder}
  _hover={{ bg: swapHoverBg, color: swapHoverColor, transform: "rotate(180deg)" }}
  transition="all 0.3s ease"               // ← smooth rotate animation bonus 😄
  isRound
  w={10}
  h={10}
  flexShrink={0}
/>
            <UploadBox
              title="Comparison"
              fileName={fileNames.right}
              inputRef={rightInputRef}
              onUpload={(e: any) => handleFileChange(e, 'right')}
              onFileDrop={(file: File) => handleFileDrop(file, 'right')}
              isDark={isDark}
              cardBg={cardBg}
              borderColor={borderColor}
              dragActiveBorder={dragActiveBorder}
              dragActiveBg={dragActiveBg}
            />
          </Flex>

          {/* ── Tabs ── */}
          <Tabs variant="unstyled" isLazy>
            <TabList bg={tabBarBg} p={1} borderRadius="xl" w="fit-content">
              <Tab
                _selected={{ bg: tabSelBg, shadow: "sm", color: tabSelColor }}
                borderRadius="lg" px={6} fontSize="sm" fontWeight="bold"
              >
                <Icon as={ScanEye} mr={2} boxSize={4}/> Visual Audit
              </Tab>
              <Tab
                _selected={{ bg: tabSelBg, shadow: "sm", color: tabSelColor }}
                borderRadius="lg" px={6} fontSize="sm" fontWeight="bold"
              >
                <Icon as={FileText} mr={2} boxSize={4}/> Text Logic
              </Tab>
            </TabList>

            <TabPanels mt={4}>

              {/* Visual Audit Tab */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Flex
                    justify="space-between" align="center"
                    bg={bannerBg} p={3} borderRadius="xl"
                    border="1px solid" borderColor={bannerBorder}
                  >
                    <HStack>
                      <Icon as={Maximize2} color={bannerIcon} />
                      <Text fontSize="xs" fontWeight="bold" color={bannerText}>PIXEL COMPARISON</Text>
                    </HStack>
                    <FormControl display="flex" alignItems="center" w="auto">
                      <FormLabel htmlFor="overlay-mode" mb="0" fontSize="xs" fontWeight="extrabold" mr={3} color={bannerText}>
                        OVERLAY DIFFERENCE
                      </FormLabel>
                      <Switch
                        id="overlay-mode"
                        colorScheme="brand"
                        isChecked={showOverlay}
                        onChange={(e) => setShowOverlay(e.target.checked)}
                      />
                    </FormControl>
                  </Flex>

                  <Box
                    h="700px" bg={cardBg} borderRadius="2xl"
                    border="1px solid" borderColor={borderColor}
                    shadow="sm" overflow="hidden"
                  >
                    {showOverlay && previews.left && previews.right ? (
                      <Center h="full" bg={overlayBg} position="relative">
                        <Box position="relative" border="1px solid" borderColor={borderColor} shadow="2xl">
                          <img src={previews.left} alt="base" style={{ maxWidth: '100%', maxHeight: '650px' }} />
                          <img
                            src={previews.right}
                            alt="diff"
                            style={{
                              position: 'absolute', top: 0, left: 0,
                              maxWidth: '100%', maxHeight: '650px',
                              mixBlendMode: 'difference',
                              filter: 'contrast(2) invert(1)'
                            }}
                          />
                        </Box>
                        <Badge position="absolute" bottom={4} colorScheme="orange">
                          Highlighting differences in color
                        </Badge>
                      </Center>
                    ) : (
                      <Flex h="full">
                        <Box flex={1} borderRight="1px solid" borderColor={borderColor} overflow="auto" p={6}>
                          <Text fontSize="10px" fontWeight="bold" color={labelColor} mb={2}>VERSION A</Text>
                          {previews.left
                            ? <img src={previews.left} width="100%" alt="left" />
                            : <EmptyState icon={ImageIcon} label="Upload Image/Doc" />}
                        </Box>
                        <Box flex={1} overflow="auto" p={6} bg={rightPanelBg}>
                          <Text fontSize="10px" fontWeight="bold" color={labelColor} mb={2}>VERSION B</Text>
                          {previews.right
                            ? <img src={previews.right} width="100%" alt="right" />
                            : <EmptyState icon={ImageIcon} label="Upload Image/Doc" />}
                        </Box>
                      </Flex>
                    )}
                  </Box>
                </VStack>
              </TabPanel>

              {/* Text Logic Tab */}
              <TabPanel p={0}>
                <Box
                  h="700px" bg={cardBg} borderRadius="2xl"
                  border="1px solid" borderColor={borderColor}
                  shadow="sm" overflow="hidden"
                >
                  <DiffEditor
                    height="100%"
                    language="plaintext"
                    original={files.left}
                    modified={files.right}
                    theme={editorTheme}
                    options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false } }}
                  />
                </Box>
              </TabPanel>

            </TabPanels>
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
};

// ── Empty State ──
const EmptyState = ({ icon, label }: any) => (
  <Center h="full" flexDirection="column" opacity={0.4}>
    <Icon as={icon} boxSize={8} mb={2}/>
    <Text fontSize="xs" fontWeight="bold">{label}</Text>
  </Center>
);

// ── Upload Box — theme-aware, click OR drag-and-drop ──
const UploadBox = ({
  title, fileName, inputRef, onUpload, onFileDrop, isDark, cardBg, borderColor,
  dragActiveBorder, dragActiveBg,
}: any) => {
  const hoverBorder  = isDark ? 'blue.400' : 'blue.400';
  const hoverBg      = isDark ? 'gray.800' : 'gray.50';
  const iconBg       = fileName ? 'blue.600' : (isDark ? 'gray.700' : 'gray.100');
  const iconColor    = fileName ? 'white'    : (isDark ? 'gray.400' : 'gray.400');
  const titleColor   = isDark ? 'blue.300' : 'blue.600';
  const nameColor    = isDark ? 'gray.200' : 'gray.700';

  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounter.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileDrop?.(file);
      e.dataTransfer.clearData();
    }
  };

  return (
    <Box
      flex={1}
      bg={isDragActive ? dragActiveBg : cardBg}
      p={6}
      borderRadius="2xl"
      border="2px dashed"
      borderColor={isDragActive ? dragActiveBorder : (fileName ? 'blue.400' : borderColor)}
      transform={isDragActive ? "scale(1.01)" : "scale(1)"}
      transition="all 0.2s"
      _hover={{ borderColor: hoverBorder, bg: hoverBg }}
      cursor="pointer"
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" hidden ref={inputRef} accept=".pdf,.docx,.txt,.md,.json,.png,.jpg,.jpeg,.webp" onChange={onUpload} />
      <HStack spacing={5}>
        <Center bg={iconBg} p={4} borderRadius="xl">
          <Icon as={fileName ? FileCheck : UploadCloud} color={iconColor} boxSize={6} />
        </Center>
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" fontWeight="extrabold" color={titleColor} textTransform="uppercase">
            {title}
          </Text>
          <Text fontWeight="bold" fontSize="md" color={nameColor} noOfLines={1}>
            {isDragActive ? "Drop it here" : (fileName || "Select or drop Document")}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default FileComparer;
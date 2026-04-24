"use client";

import React, { useState, useRef, useMemo } from 'react';
import { 
  Box, Button, Container, Flex, Heading, Input, Select, Stack, Text, 
  IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, useToast, 
  HStack, Badge, SimpleGrid, Stat, StatLabel, StatNumber,
  useColorModeValue, Divider, VStack, Center, Icon,
  Tooltip as ChakraTooltip
} from '@chakra-ui/react';
import { 
  FiUploadCloud, FiBarChart2, FiPieChart, FiDownload, 
  FiTrendingUp, FiDatabase, FiArrowRight, FiEdit3, 
  FiMaximize2, FiActivity, FiLayers, FiCheckCircle
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import Editor from '@monaco-editor/react';
import html2canvas from 'html2canvas';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const DataVizStudio = () => {
  // WORKFLOW STATE
  const [step, setStep] = useState(1); 
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ label: '', value: '' });
  const [chartType, setChartType] = useState('bar');
  const [jsonValue, setJsonValue] = useState('[\n  {"label": "Jan", "value": 400},\n  {"label": "Feb", "value": 300}\n]');
  
  const chartRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Enhanced Theme Colors
  const bgColor = useColorModeValue("gray.50", "gray.950");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(26, 32, 44, 0.78)");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const secondaryText = useColorModeValue("gray.500", "gray.400");
  const tabBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const tabSelectedBg = useColorModeValue("white", "gray.700");
  const tabHoverBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBg = useColorModeValue("white", "whiteAlpha.50");
  const iconColor = useColorModeValue("indigo.500", "indigo.200");
  const uploadHoverBg = useColorModeValue("indigo.50", "indigo.900");
  const downloadImageBg = useColorModeValue("#ffffff", "#0a0a0c");
  const chartGridStroke = useColorModeValue("#e2e8f0", "#2d2d3d");

  const stats = useMemo(() => {
    if (!data.length || !mapping.value) return { avg: 0, max: 0, count: 0 };
    const values = data.map(d => Number(d[mapping.value])).filter(v => !isNaN(v));
    return {
      avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toLocaleString(undefined, {maximumFractionDigits: 1}) : 0,
      max: values.length ? Math.max(...values).toLocaleString() : 0,
      count: data.length.toLocaleString()
    };
  }, [data, mapping.value]);

  const syncColumns = (newData: any[]) => {
    if (Array.isArray(newData) && newData.length > 0) {
      const cols = Object.keys(newData[0]);
      setColumns(cols);
      setData(newData);
      setMapping({ 
        label: cols.find(c => typeof newData[0][c] === 'string') || cols[0], 
        value: cols.find(c => typeof newData[0][c] === 'number') || cols[1] || cols[0] 
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws);
        syncColumns(json);
        toast({ title: "Dataset Loaded", status: "success", position: 'top-right', variant: 'subtle' });
      } catch (err) {
        toast({ title: "Format error", status: "error" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      syncColumns(parsed);
      toast({ title: "JSON Synced", status: "success", variant: 'subtle' });
    } catch (err) {
      toast({ title: "Invalid JSON", status: "error" });
    }
  };

  const downloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { 
        backgroundColor: downloadImageBg,
        scale: 2 
    });
    const link = document.createElement('a');
    link.download = `vizpro_export_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box bg={bgColor} minH="100vh" py={12} px={4} transition="all 0.3s">
      <Container maxW="container.xl">
        
        {/* HEADER SECTION */}
        <Flex justify="space-between" align="center" mb={12}>
          <HStack spacing={4}>
            {/* <Center p={2} bg="indigo.500" borderRadius="12px" color="white" shadow="0 8px 20px -4px rgba(99, 102, 241, 0.6)">
                <FiActivity size={24} />
            </Center> */}
            <VStack align="start" spacing={0}>
              <Heading size="md" fontWeight="800" letterSpacing="-0.5px">VizPro <Text as="span" color="indigo.500">Studio</Text></Heading>
              <HStack spacing={2} fontSize="xs" color={secondaryText} fontWeight="bold">
                <Text color={step === 1 ? "indigo.500" : "inherit"}>1. INGESTION</Text>
                <Icon as={FiArrowRight} />
                <Text color={step === 2 ? "indigo.500" : "inherit"}>2. VISUALIZATION</Text>
              </HStack>
            </VStack>
          </HStack>
          
          {step === 2 && (
            <Button leftIcon={<FiEdit3 />} variant="ghost" colorScheme="indigo" onClick={() => setStep(1)} size="sm" borderRadius="full">
              Switch Data Source
            </Button>
          )}
        </Flex>

        {/* STEP 1: INGESTION */}
        {step === 1 && (
          <Center minH="50vh">
            <VStack spacing={8} w="full" maxW="720px">
              <Box 
                bg={glassBg} 
                backdropFilter="blur(10px)"
                p={{ base: 6, md: 10 }} 
                shadow="2xl" 
                borderRadius="40px" 
                border="1px solid" 
                borderColor={cardBorder} 
                w="full"
              >
                <Tabs variant="unstyled">
                  <TabList bg={tabBg} p={1.5} borderRadius="20px" mb={10} display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={2}>
                    <Tab w="100%" borderRadius="15px" fontWeight="bold" fontSize="sm" _selected={{ bg: tabSelectedBg, color: iconColor, shadow: "sm" }} _hover={{ bg: tabHoverBg }}>
                        <Icon as={FiUploadCloud} mr={2} color={iconColor} /> FILE UPLOAD
                    </Tab>
                    <Tab w="100%" borderRadius="15px" fontWeight="bold" fontSize="sm" _selected={{ bg: tabSelectedBg, color: iconColor, shadow: "sm" }} _hover={{ bg: tabHoverBg }}>
                        <Icon as={FiLayers} mr={2} color={iconColor} /> RAW JSON
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <Box 
                        border="2px dashed" borderColor={useColorModeValue("indigo.200", "whiteAlpha.200")} borderRadius="30px" p={{ base: 10, md: 16 }} textAlign="center" position="relative" 
                        _hover={{ bg: uploadHoverBg, borderColor: useColorModeValue("indigo.400", "indigo.300") }} transition="all 0.3s ease" cursor="pointer"
                      >
                        <FiUploadCloud size={48} style={{ margin: '0 auto 20px' }} color={iconColor} />
                        <Input type="file" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleFileUpload} />
                        <Heading size="sm" mb={2}>Drop your dataset here</Heading>
                        <Text fontSize="sm" color={secondaryText}>Supports XLSX, CSV, XLS</Text>
                      </Box>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Box borderRadius="24px" overflow="hidden" border="1px solid" borderColor={cardBorder}>
                        <Editor height="220px" defaultLanguage="json" theme={useColorModeValue("light", "vs-dark")} value={jsonValue} onChange={(val) => setJsonValue(val || '')} />
                      </Box>
                      <Button mt={6} w="full" colorScheme="indigo" borderRadius="18px" h="50px" onClick={handleJsonApply} shadow="lg">
                        Parse JSON Data
                      </Button>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                {columns.length > 0 && (
                  <Stack spacing={8} mt={12} pt={10} borderTop="1px solid" borderColor={cardBorder}>
                    <HStack spacing={2} flexWrap="wrap">
                        <Icon as={FiCheckCircle} color="green.400" />
                        <Heading size="xs" letterSpacing="1px" color={secondaryText}>MAPPING CONFIGURATION</Heading>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={3} ml={1} color={secondaryText}>LABEL (X-AXIS)</Text>
                        <Select h="55px" bg={inputBg} borderRadius="18px" value={mapping.label} onChange={(e) => setMapping({ ...mapping, label: e.target.value })}>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={3} ml={1} color={secondaryText}>VALUE (Y-AXIS)</Text>
                        <Select h="55px" bg={inputBg} borderRadius="18px" value={mapping.value} onChange={(e) => setMapping({ ...mapping, value: e.target.value })}>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                      </Box>
                    </SimpleGrid>
                    <Button 
                      size="lg" h="65px" colorScheme="indigo" borderRadius="22px" rightIcon={<FiMaximize2 />} shadow="0 15px 30px -10px rgba(99, 102, 241, 0.5)"
                      onClick={() => setStep(2)} isDisabled={!mapping.label || !mapping.value}
                    >
                      Generate Workspace
                    </Button>
                  </Stack>
                )}
              </Box>
            </VStack>
          </Center>
        )}

        {/* STEP 2: STUDIO */}
        {step === 2 && (
          <Stack spacing={10}>
            {/* STATS ROW */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <MetricCard label="Total Records" value={stats.count} icon={FiDatabase} />
                <MetricCard label="Average Value" value={stats.avg} icon={FiTrendingUp} />
                <MetricCard label="Peak Value" value={stats.max} icon={FiMaximize2} />
            </SimpleGrid>

            {/* CHART CANVAS */}
            <Box 
              bg={glassBg} backdropFilter="blur(15px)" p={{base: 6, md: 10}} shadow="2xl" borderRadius="40px" border="1px solid" borderColor={cardBorder}
            >
              <Flex justify="space-between" align="center" mb={12} direction={{ base: "column", sm: "row" }} gap={4}>
                <VStack align="start" spacing={1} w="full" maxW={{ base: "100%", md: "auto" }}>
                    <Badge colorScheme="indigo" variant="subtle" px={3} borderRadius="full">Active View</Badge>
                    <Heading size="md">{mapping.label} vs {mapping.value}</Heading>
                </VStack>
                
                <Stack direction={{ base: "column", sm: "row" }} bg={tabBg} p={2} borderRadius="20px" border="1px solid" borderColor={cardBorder} spacing={2} w={{ base: "full", sm: "auto" }}>
                    <IconButton 
                        aria-label="Bar" icon={<FiBarChart2 />} borderRadius="14px"
                        variant={chartType === 'bar' ? "solid" : "ghost"} 
                        colorScheme="indigo" onClick={() => setChartType('bar')} 
                    />
                    <IconButton 
                        aria-label="Pie" icon={<FiPieChart />} borderRadius="14px"
                        variant={chartType === 'pie' ? "solid" : "ghost"} 
                        colorScheme="indigo" onClick={() => setChartType('pie')} 
                    />
                    <Divider orientation="vertical" h="20px" mx={2} display={{ base: "none", sm: "block" }} />
                    <Button leftIcon={<FiDownload />} colorScheme="indigo" variant="solid" borderRadius="14px" size="sm" onClick={downloadImage} w={{ base: "100%", sm: "auto" }}>Export PNG</Button>
                </Stack>
              </Flex>

              <Box ref={chartRef} h={{ base: "360px", md: "500px" }} w="100%">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                        <XAxis dataKey={mapping.label} fontSize={11} tick={{ fill: secondaryText }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis fontSize={11} tick={{ fill: secondaryText }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey={mapping.value} radius={[10, 10, 0, 0]} barSize={35}>
                            {data.map((_, i) => <Cell key={i} fill="url(#indigoGradient)" />)}
                            <defs>
                            <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            </defs>
                        </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                        <Pie 
                            data={data} dataKey={mapping.value} nameKey={mapping.label} 
                            cx="50%" cy="50%" innerRadius={80} outerRadius={150} paddingAngle={5} stroke="none"
                        >
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                        </PieChart>
                    )}
                </ResponsiveContainer>
              </Box>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

// Helper Components
const MetricCard = ({ label, value, icon }: any) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box bg={cardBg} p={6} borderRadius="24px" border="1px solid" borderColor={cardBorder} shadow="sm">
        <Flex align="center" gap={4}>
            <Center p={3} bg={useColorModeValue("indigo.50", "indigo.900")} color={useColorModeValue("indigo.500", "indigo.200")} borderRadius="15px">
                <Icon as={icon} size={22} />
            </Center>
            <Box>
                <Text fontSize="xs" fontWeight="bold" color={labelColor} letterSpacing="0.5px" textTransform="uppercase">{label}</Text>
                <Text fontSize="2xl" fontWeight="800" letterSpacing="-1px">{value}</Text>
            </Box>
        </Flex>
    </Box>
  );
};

export default DataVizStudio;
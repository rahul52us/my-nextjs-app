"use client";

import React, { useState, useRef, useMemo } from 'react';
import { 
  Box, Button, Container, Flex, Heading, Input, Select, Stack, Text, 
  IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, useToast, 
  HStack, Badge, SimpleGrid, Stat, StatLabel, StatNumber,
  useColorModeValue, Divider, Tooltip as ChakraTooltip,
  VStack
} from '@chakra-ui/react';
import { 
  FiUploadCloud, FiBarChart2, FiPieChart, FiDownload, 
  FiPlus, FiSettings, FiTrendingUp, FiTrash2, FiFileText, FiDatabase
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
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ label: '', value: '' });
  const [chartType, setChartType] = useState('bar');
  const [jsonValue, setJsonValue] = useState('[\n  {"label": "Jan", "value": 400},\n  {"label": "Feb", "value": 300}\n]');
  
  const chartRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Dynamic Theme Colors
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const editorTheme = useColorModeValue("vs-light", "vs-dark");
  const chartGridColor = useColorModeValue("#f1f5f9", "#2D3748");
  const tooltipCursorColor = useColorModeValue('gray.50', 'whiteAlpha.50');
  
  // FIX: Dynamic Gradient Stops to prevent the black box in light mode
  const stopColorStop1 = useColorModeValue("#818cf8", "#6366f1");
  const stopColorStop2 = useColorModeValue("#a5b4fc", "#8b5cf6");

  const stats = useMemo(() => {
    if (!data.length || !mapping.value) return { avg: 0, max: 0, count: 0 };
    const values = data.map(d => Number(d[mapping.value])).filter(v => !isNaN(v));
    return {
      avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0,
      max: values.length ? Math.max(...values) : 0,
      count: data.length
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
        toast({ title: "Import Successful", status: "success", position: 'top-right' });
      } catch (err) {
        toast({ title: "Excel format error", status: "error" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      syncColumns(parsed);
      toast({ title: "JSON Workspace Synced", status: "success", variant: 'subtle' });
    } catch (err) {
      toast({ title: "Invalid JSON structure", status: "error" });
    }
  };

  const downloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { 
        backgroundColor: useColorModeValue("#ffffff", "#1A202C"),
        scale: 2 
    });
    const link = document.createElement('a');
    link.download = `vizpro_export_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box bg={bgColor} minH="100vh" pb={10} color={textColor} transition="background 0.2s">
      <Container maxW="container.xl" py={8}>
        
        {/* Header */}
        <Flex justify="space-between" align="center" mb={10} direction={{ base: "column", md: "row" }} gap={4}>
          <HStack spacing={4}>
            <Box bgGradient="linear(to-br, indigo.500, purple.600)" p={2.5} borderRadius="xl" shadow="lg">
              <FiTrendingUp size={24} color="white" />
            </Box>
            <Box>
              <Heading size="md" fontWeight="800" letterSpacing="tight">VizPro Studio</Heading>
              <Text fontSize="xs" color={secondaryTextColor} fontWeight="800">DATA ENGINE v2.0</Text>
            </Box>
          </HStack>
          <HStack spacing={3}>
            <Button variant="ghost" size="sm" leftIcon={<FiTrash2 />} onClick={() => setData([])}>Reset</Button>
            <Button colorScheme="indigo" size="md" shadow="xl" leftIcon={<FiDownload />} onClick={downloadImage}>Export Image</Button>
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <StatBox label="Total Records" value={stats.count} icon={<FiDatabase />} color="indigo.400" bg={cardBg} border={borderColor} />
          <StatBox label="Mean Value" value={stats.avg} icon={<FiTrendingUp />} color="purple.400" bg={cardBg} border={borderColor} />
          <StatBox label="Peak Measurement" value={stats.max} icon={<FiSettings />} color="pink.400" bg={cardBg} border={borderColor} />
        </SimpleGrid>

        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          {/* Controls Panel */}
          <Box flex="1.2">
            <Stack spacing={6}>
              <Box bg={cardBg} p={6} shadow="sm" borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="800" mb={4} color={secondaryTextColor} letterSpacing="widest">INGESTION ENGINE</Text>
                
                <Tabs variant="soft-rounded" colorScheme="indigo" size="sm">
                  {/* FIX: customTab now handles selected state text color */}
                  <TabList bg={useColorModeValue("gray.100", "gray.700")} p={1} borderRadius="xl" mb={6}>
                    <CustomTab label="EXCEL" />
                    <CustomTab label="JSON" />
                    <CustomTab label="MANUAL" />
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <Box border="2px dashed" borderColor={borderColor} borderRadius="xl" p={10} textAlign="center" position="relative" _hover={{ bg: useColorModeValue('indigo.50', 'whiteAlpha.50') }} transition="0.2s">
                        <FiUploadCloud size={32} style={{ margin: '0 auto 12px' }} color="#6366f1" />
                        <Input type="file" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleFileUpload} />
                        <Text fontSize="sm" fontWeight="700">Drop XLSX file here</Text>
                        <Text fontSize="xs" color={secondaryTextColor}>or click to browse local files</Text>
                      </Box>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor={borderColor}>
                        <Editor 
                            height="240px" 
                            defaultLanguage="json" 
                            theme={editorTheme} 
                            value={jsonValue} 
                            onChange={(val) => setJsonValue(val || '')} 
                            options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }} 
                        />
                      </Box>
                      <Button mt={3} w="100%" colorScheme="indigo" onClick={handleJsonApply} size="sm" borderRadius="lg">Apply Workspace Changes</Button>
                    </TabPanel>
                    <TabPanel p={0}>
                      <VStack align="stretch">
                        <Button leftIcon={<FiPlus />} variant="outline" onClick={() => setData([{ "label": "New Segment", "value": 0 }, ...data])}>Add New Row</Button>
                        <Text fontSize="xs" color={secondaryTextColor} textAlign="center">Manual editing is best for small adjustments.</Text>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {columns.length > 0 && (
                <Box bg={cardBg} p={6} shadow="sm" borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                  <Text fontSize="xs" fontWeight="800" mb={5} color={secondaryTextColor} letterSpacing="widest">AXIS MAPPING</Text>
                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" mb={1.5} color={secondaryTextColor} fontWeight="bold">DIMENSION (X-AXIS)</Text>
                      <Select borderRadius="xl" bg={bgColor} value={mapping.label} onChange={(e) => setMapping({ ...mapping, label: e.target.value })}>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Box>
                    <Box>
                      <Text fontSize="xs" mb={1.5} color={secondaryTextColor} fontWeight="bold">MEASURE (Y-AXIS)</Text>
                      <Select borderRadius="xl" bg={bgColor} value={mapping.value} onChange={(e) => setMapping({ ...mapping, value: e.target.value })}>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Visualization Panel */}
          <Box flex="2">
            <Box ref={chartRef} bg={cardBg} p={{ base: 4, md: 8 }} shadow="2xl" borderRadius="3xl" border="1px solid" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={10} direction={{ base: "column", sm: "row" }} gap={4}>
                <HStack>
                    <Badge colorScheme="indigo" px={3} py={1} borderRadius="md" variant="subtle">STAGING</Badge>
                    <Divider orientation="vertical" h="20px" />
                    <Text fontSize="sm" fontWeight="700" color={secondaryTextColor}>{mapping.label} vs {mapping.value}</Text>
                </HStack>
                <HStack bg={useColorModeValue("gray.50", "gray.700")} p={1} borderRadius="xl">
                  <IconButton 
                    aria-label="Bar Chart" 
                    icon={<FiBarChart2 />} 
                    size="sm" 
                    onClick={() => setChartType('bar')}
                    colorScheme={chartType === 'bar' ? "indigo" : "gray"}
                    variant={chartType === 'bar' ? "solid" : "ghost"} 
                    borderRadius="lg"
                  />
                  <IconButton 
                    aria-label="Pie Chart" 
                    icon={<FiPieChart />} 
                    size="sm" 
                    onClick={() => setChartType('pie')}
                    colorScheme={chartType === 'pie' ? "indigo" : "gray"}
                    variant={chartType === 'pie' ? "solid" : "ghost"} 
                    borderRadius="lg"
                  />
                </HStack>
              </Flex>
              
              <Box h="450px" w="100%">
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                        <XAxis dataKey={mapping.label} fontSize={10} axisLine={false} tickLine={false} tick={{ fill: secondaryTextColor }} dy={10} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: secondaryTextColor }} />
                        {/* FIX: Tooltip colors and cursor are now dynamic */}
                        <Tooltip 
                            cursor={{ fill: tooltipCursorColor }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                background: cardBg,
                                color: textColor 
                            }} 
                        />
                        {/* FIX: Bar now uses dynamic gradient definition to eliminate black box */}
                        <Bar dataKey={mapping.value} fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={32}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={stopColorStop1} />
                              <stop offset="100%" stopColor={stopColorStop2} />
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie 
                            data={data} 
                            dataKey={mapping.value} 
                            nameKey={mapping.label} 
                            cx="50%" cy="50%" 
                            innerRadius={70} 
                            outerRadius={140}
                            paddingAngle={5}
                            stroke="none"
                        >
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <Flex direction="column" align="center" justify="center" h="100%" color="gray.400" border="2px dashed" borderColor={borderColor} borderRadius="2xl">
                    <FiFileText size={48} />
                    <Text mt={4} fontWeight="800" fontSize="lg">No Data Active</Text>
                    <Text fontSize="sm">Import an Excel or JSON file to generate visuals</Text>
                  </Flex>
                )}
              </Box>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

// --- Helper Components ---

// FIX: customTab now handles dynamic text color for selected state in light mode
const CustomTab = ({ label }: { label: string }) => {
    const selectedTextColor = useColorModeValue("indigo.600", "white");
    return (
        <Tab 
            fontWeight="700" 
            px={8} 
            flex="1" 
            borderRadius="lg"
            _selected={{ bg: 'white', color: selectedTextColor, shadow: 'sm' }} 
            _active={{ bg: 'white' }}
        >
            {label}
        </Tab>
    );
};

const StatBox = ({ label, value, icon, color, bg, border }: any) => (
  <Stat bg={bg} p={5} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={border}>
    <HStack spacing={4}>
      <Box p={3} bg={useColorModeValue("gray.50", "whiteAlpha.100")} borderRadius="xl" color={color}>{icon}</Box>
      <Box>
        <StatLabel color="gray.500" fontWeight="800" fontSize="xs" letterSpacing="widest">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="900">{value}</StatNumber>
      </Box>
    </HStack>
  </Stat>
);

export default DataVizStudio;
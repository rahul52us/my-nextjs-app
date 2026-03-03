"use client";
import React, { useState, useRef, useMemo } from 'react';
import { 
  Box, Button, Container, Flex, Heading, Input, Select, Stack, Text, 
  IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, useToast, 
  HStack, Badge, Tooltip as ChakraTooltip, SimpleGrid, Stat, 
  StatLabel, StatNumber
} from '@chakra-ui/react';
import { 
  FiUploadCloud, FiEdit3, FiPieChart, FiBarChart2, FiDownload, 
  FiPlus, FiSettings, FiCode, FiWind, FiSave, FiTrendingUp 
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import Editor from '@monaco-editor/react';
import html2canvas from 'html2canvas';

const PRIMARY_HEX = '#6366f1';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const DataVizPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ label: '', value: '' });
  const [chartType, setChartType] = useState('bar');
  const [jsonValue, setJsonValue] = useState('[\n  \n]');
  
  const chartRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
    if (newData.length > 0) {
      const cols = Object.keys(newData[0]);
      setColumns(cols);
      setData(newData);
      setMapping({ label: cols[0], value: cols[1] || cols[0] });
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
        toast({ title: "Import Successful", status: "success" });
      } catch (err) {
        toast({ title: "Import Failed", status: "error" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      syncColumns(parsed);
      toast({ title: "JSON Applied", status: "success" });
    } catch (err) {
      toast({ title: "Parse Error", status: "error" });
    }
  };

  const downloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = `vizpro_export_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box bg="gray.50" minH="100vh" pb={10}>
      <Container maxW="container.xl" py={8}>
        
        {/* Header */}
        <Flex justify="space-between" align="center" mb={10}>
          <HStack spacing={4}>
            <Box bgGradient="linear(to-br, indigo.500, purple.600)" p={2.5} borderRadius="xl" shadow="lg">
              <FiTrendingUp size={24} color="white" />
            </Box>
            <Box>
              <Heading size="md" fontWeight="800">VizPro Studio</Heading>
              <Text fontSize="xs" color="gray.500" fontWeight="600">PRODUCTION ENGINE v2.0</Text>
            </Box>
          </HStack>
          <HStack spacing={3}>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Saved", status: "info" })}>Save State</Button>
            <Button colorScheme="indigo" size="sm" shadow="md" onClick={downloadImage}>Export high-res</Button>
          </HStack>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <StatBox label="Total Data Points" value={stats.count} icon={<FiPlus />} color="indigo.500" />
          <StatBox label="Average Value" value={stats.avg} icon={<FiTrendingUp />} color="purple.500" />
          <StatBox label="Peak Value" value={stats.max} icon={<FiSettings />} color="pink.500" />
        </SimpleGrid>

        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          {/* Controls Panel */}
          <Box flex="1.2">
            <Stack spacing={6}>
              <Box bg="white" p={6} shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="800" mb={4} color="gray.700">DATA SOURCE</Text>
                
                {/* Fixed Tabs Styling */}
                <Tabs variant="soft-rounded" colorScheme="indigo" size="sm">
                  <TabList bg="gray.100" p={1} borderRadius="xl" mb={6}>
                    <CustomTab label="EXCEL" />
                    <CustomTab label="JSON" />
                    <CustomTab label="MANUAL" />
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <Box border="2px dashed" borderColor="gray.200" borderRadius="xl" p={8} textAlign="center" position="relative" _hover={{ bg: 'indigo.50' }}>
                        <FiUploadCloud size={30} style={{ margin: '0 auto 12px' }} color={PRIMARY_HEX} />
                        <Input type="file" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleFileUpload} />
                        <Text fontSize="sm" fontWeight="600" color="gray.600">Click to upload Excel file</Text>
                      </Box>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
                        <Editor height="220px" defaultLanguage="json" theme="vs-light" value={jsonValue} onChange={(val) => setJsonValue(val || '')} options={{ minimap: { enabled: false }, fontSize: 13 }} />
                      </Box>
                      <Button mt={3} w="100%" colorScheme="indigo" onClick={handleJsonApply} size="sm">Sync JSON Workspace</Button>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Button w="100%" leftIcon={<FiPlus />} variant="outline" onClick={() => setData([...data, { label: 'New', value: 0 }])}>Add Record</Button>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {columns.length > 0 && (
                <Box bg="white" p={6} shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" fontWeight="800" mb={5} color="gray.700">MAPPING ENGINE</Text>
                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" mb={1.5} color="gray.500" fontWeight="bold">DIMENSION (X)</Text>
                      <Select borderRadius="xl" value={mapping.label} onChange={(e) => setMapping({ ...mapping, label: e.target.value })}>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Box>
                    <Box>
                      <Text fontSize="xs" mb={1.5} color="gray.500" fontWeight="bold">MEASURE (Y)</Text>
                      <Select borderRadius="xl" value={mapping.value} onChange={(e) => setMapping({ ...mapping, value: e.target.value })}>
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
            <Box ref={chartRef} bg="white" p={8} shadow="2xl" borderRadius="3xl" border="1px solid" borderColor="gray.100">
              <HStack justify="space-between" mb={10}>
                <Badge colorScheme="indigo" px={4} py={1.5} borderRadius="full">LIVE VISUALIZATION</Badge>
                <HStack bg="gray.50" p={1} borderRadius="xl">
                  <ChartTypeBtn active={chartType === 'bar'} icon={<FiBarChart2 />} onClick={() => setChartType('bar')} />
                  <ChartTypeBtn active={chartType === 'pie'} icon={<FiPieChart />} onClick={() => setChartType('pie')} />
                </HStack>
              </HStack>
              
              <Box h="420px">
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={mapping.label} fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                        <Bar dataKey={mapping.value} fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie data={data} dataKey={mapping.value} nameKey={mapping.label} cx="50%" cy="50%" innerRadius={80} outerRadius={130}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
                    <FiTrendingUp size={48} />
                    <Text mt={4} fontWeight="bold">Paste JSON or Upload Excel to start</Text>
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

const CustomTab = ({ label }: { label: string }) => (
  <Tab 
    fontWeight="700" 
    px={8} 
    _selected={{ bg: 'white', color: 'indigo.600', shadow: 'sm' }} 
    _active={{ bg: 'white' }}
    borderRadius="lg"
  >
    {label}
  </Tab>
);

const StatBox = ({ label, value, icon, color }: any) => (
  <Stat bg="white" p={5} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
    <HStack spacing={4}>
      <Box p={3} bg="gray.50" borderRadius="xl" color={color}>{icon}</Box>
      <Box>
        <StatLabel color="gray.500" fontWeight="bold" fontSize="xs">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="900">{value}</StatNumber>
      </Box>
    </HStack>
  </Stat>
);

const ChartTypeBtn = ({ active, icon, onClick }: any) => (
  <IconButton 
    aria-label="Toggle Chart" 
    icon={icon} 
    size="sm" 
    onClick={onClick}
    colorScheme={active ? "indigo" : "gray"}
    variant={active ? "solid" : "ghost"} 
    borderRadius="lg"
  />
);

export default DataVizPage;
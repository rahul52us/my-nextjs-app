"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, Textarea, VStack,
  Icon, Text, SimpleGrid, IconButton, Table, Tbody, Tr, Td, Badge, Progress,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Select, Image, HStack, Center, Divider, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Thead, Th,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb
} from '@chakra-ui/react';
import {
  Download, Plus, Trash2, Briefcase, GraduationCap,
  Mail, Phone, MapPin, Award, User, Type, Camera, PenTool, Layout, Star, Calendar, Languages, Zap
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';


// --- Types ---
interface Achievement { title: string; date: string; issuer: string; }
interface Experience { company: string; role: string; start: string; end: string; desc: string; }
interface Education { school: string; degree: string; year: string; grade: string; }
interface CustomEntry { key: string; value: string; }
interface Skill { name: string; level: number; }
interface Language { name: string; level: string; }

interface CVData {
  fullName: string; role: string; email: string; phone: string;
  location: string; summary: string;
  profileImg: string; signatureImg: string;
  experiences: Experience[];
  educations: Education[];
  achievements: Achievement[];
  customEntries: CustomEntry[];
  skills: Skill[];
  languages: Language[];
  themeColor: string;
  fontFamily: string;
}

const CVBuilder: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CVData>({
    fullName: 'JONATHAN WICK',
    role: 'Lead Systems Architect',
    email: 'j.wick@continental.com',
    phone: '+1 212-555-0199',
    location: 'New York, NY',
    summary: 'Strategic technology leader with 10+ years of experience in designing high-availability distributed systems. Proven track record in reducing operational costs and leading cross-functional engineering teams.',
    profileImg: '',
    signatureImg: '',
    experiences: [{ company: 'Global Solutions', role: 'Senior Architect', start: '2021-01', end: '2026-02', desc: 'Led the migration of legacy infrastructure to a multi-cloud environment.' }],
    educations: [
      { school: 'Stanford University', degree: 'B.Sc. Computer Science', year: '2019', grade: '4.0 GPA' },
      { school: 'MIT', degree: 'M.Sc. Systems Engineering', year: '2021', grade: 'Distinction' }
    ],
    achievements: [{ title: 'Innovator of the Year', date: '2024-05', issuer: 'Tech Corp' }],
    customEntries: [{ key: 'Interests', value: 'Cybersecurity, Restoration, Philosophy' }],
    skills: [{ name: 'TypeScript', level: 95 }, { name: 'Cloud Architecture', level: 90 }],
    languages: [{ name: 'English', level: 'Native' }, { name: 'Russian', level: 'Fluent' }],
    themeColor: '#1A365D',
    fontFamily: 'Inter, sans-serif',
  });

  const resumeRef = useRef<HTMLDivElement>(null);

  // 🔥 Receive signature from Signature Tool
  useEffect(() => {
    const savedSignature = sessionStorage.getItem('cvSignature');

    if (savedSignature) {
      setFormData(prev => ({
        ...prev,
        signatureImg: savedSignature
      }));

      sessionStorage.removeItem('cvSignature');
    }
  }, []);

  // --- Handlers ---
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, field: 'profileImg' | 'signatureImg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'profileImg' | 'signatureImg') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const updateItem = (category: keyof CVData, index: number, field: string, value: any) => {
    const newData: any = { ...formData };
    newData[category][index][field] = value;
    setFormData(newData);
  };

  const addItem = (category: keyof CVData, template: any) => {
    setFormData(prev => ({ ...prev, [category]: [...(prev[category] as any[]), template] }));
  };

  const removeItem = (category: keyof CVData, index: number) => {
    setFormData(prev => ({ ...prev, [category]: (prev[category] as any[]).filter((_, i) => i !== index) }));
  };

  // --- Optimized PDF Function ---
  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    // Reduced scale from 3 to 2 for smaller file size
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // Switched to JPEG 0.8 to dramatically reduce file size from 30MB to ~5MB
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const pdf = new jsPDF('p', 'mm', 'a4', true); // Added 'true' for compression
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_Professional_CV.pdf`);
  };

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* EDITOR SIDEBAR */}
      <Box w="500px" bg="white" p={6} overflowY="auto" borderRight="1px solid" borderColor="gray.200" boxShadow="2xl" zIndex={10}>
        <VStack align="stretch" spacing={6}>
          <Box borderLeft="4px solid" borderColor="blue.500" pl={4}>
            <Heading size="md" color="gray.800" letterSpacing="tight">CV ENGINE PRO</Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="bold">v2.5 EXECUTIVE EDITION (OPTIMIZED)</Text>
          </Box>

          <Accordion allowMultiple defaultIndex={[0]}>
            {/* PERSONAL & DESIGN */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg="gray.50" _hover={{ bg: "gray.100" }} borderRadius="md">
                <HStack flex="1"><Icon as={User} /><Text fontWeight="bold" fontSize="sm">Contact & Style</Text></HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack spacing={3} mt={2}>
                  <Input size="sm" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })} />
                  <Input size="sm" placeholder="Professional Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />

                  {/* MANUAL LOCATION INPUT ADDED HERE */}
                  <Input size="sm" placeholder="Location (e.g. New York, NY)" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

                  <SimpleGrid columns={2} spacing={2} w="full">
                    <Input size="sm" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <Input size="sm" type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold">PROFILE IMAGE</FormLabel>
                      <HStack>
                        <Button as="label" size="xs" w="full" cursor="pointer" leftIcon={<Camera size={14} />}>
                          {formData.profileImg ? 'Change' : 'Upload'}
                          <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'profileImg')} />
                        </Button>
                        {formData.profileImg && (
                          <IconButton aria-label="Remove Image" icon={<Trash2 size={14} />} size="xs" colorScheme="red" variant="ghost" onClick={() => removeImage('profileImg')} />
                        )}
                      </HStack>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold">SIGNATURE</FormLabel>
                      <HStack>
                        <Button
                          size="xs"
                          w="full"
                          leftIcon={<PenTool size={14} />}
                          onClick={() => router.push('/converter/PDFtools/Pdfsign?from=cv')}
                        >
                          {formData.signatureImg ? 'Change Signature' : 'Create Signature'}
                        </Button>
                        {formData.signatureImg && (
                          <IconButton aria-label="Remove Signature" icon={<Trash2 size={14} />} size="xs" colorScheme="red" variant="ghost" onClick={() => removeImage('signatureImg')} />
                        )}
                      </HStack>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold">THEME COLOR</FormLabel>
                      <Input type="color" size="sm" h="35px" value={formData.themeColor} onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold">FONT STYLE</FormLabel>
                      <Select size="sm" value={formData.fontFamily} onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}>
                        <option value="Inter, sans-serif">Modern Sans</option>
                        <option value="'Times New Roman', serif">Classic Serif</option>
                        <option value="'Courier New', monospace">Technical Mono</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* EXPERIENCE SECTION */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg="gray.50" borderRadius="md">
                <HStack flex="1"><Icon as={Briefcase} /><Text fontWeight="bold" fontSize="sm">Experience</Text></HStack>
                <IconButton aria-label="Add" icon={<Plus size={14} />} size="xs" colorScheme="blue" onClick={(e) => { e.stopPropagation(); addItem('experiences', { company: '', role: '', start: '', end: '', desc: '' }); }} />
              </AccordionButton>
              <AccordionPanel>
                {formData.experiences.map((exp, i) => (
                  <VStack key={i} p={3} bg="blue.50" mb={3} borderRadius="md" spacing={2} pos="relative" border="1px solid" borderColor="blue.100">
                    <IconButton aria-label="Remove" pos="absolute" right={-2} top={-2} size="xs" colorScheme="red" borderRadius="full" icon={<Trash2 size={12} />} onClick={() => removeItem('experiences', i)} />
                    <Input size="xs" bg="white" placeholder="Company" value={exp.company} onChange={(e) => updateItem('experiences', i, 'company', e.target.value)} />
                    <Input size="xs" bg="white" placeholder="Role" value={exp.role} onChange={(e) => updateItem('experiences', i, 'role', e.target.value)} />
                    <HStack w="full">
                      <Input size="xs" bg="white" type="month" value={exp.start} onChange={(e) => updateItem('experiences', i, 'start', e.target.value)} />
                      <Input size="xs" bg="white" type="month" value={exp.end} onChange={(e) => updateItem('experiences', i, 'end', e.target.value)} />
                    </HStack>
                    <Textarea size="xs" bg="white" placeholder="Key Responsibilities..." value={exp.desc} onChange={(e) => updateItem('experiences', i, 'desc', e.target.value)} />
                  </VStack>
                ))}
              </AccordionPanel>
            </AccordionItem>

            {/* DYNAMIC SKILLS & LANGUAGES */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg="gray.50" borderRadius="md">
                <HStack flex="1"><Icon as={Zap} /><Text fontWeight="bold" fontSize="sm">Skills & Languages</Text></HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Text fontSize="10px" fontWeight="bold" mb={2} color="gray.500">TECHNICAL SKILLS</Text>
                {formData.skills.map((skill, i) => (
                  <HStack key={i} mb={2}>
                    <Input size="xs" placeholder="Skill" value={skill.name} onChange={(e) => updateItem('skills', i, 'name', e.target.value)} />
                    <NumberInput size="xs" max={100} min={0} w="100px" value={skill.level} onChange={(_, val) => updateItem('skills', i, 'level', val)}>
                      <NumberInputField />
                    </NumberInput>
                    <IconButton aria-label="Delete" icon={<Trash2 size={12} />} size="xs" onClick={() => removeItem('skills', i)} />
                  </HStack>
                ))}
                <Button size="xs" leftIcon={<Plus size={12} />} onClick={() => addItem('skills', { name: '', level: 50 })} mb={4}>Add Skill</Button>

                <Divider mb={4} />

                <Text fontSize="10px" fontWeight="bold" mb={2} color="gray.500">LANGUAGES</Text>
                {formData.languages.map((lang, i) => (
                  <HStack key={i} mb={2}>
                    <Input size="xs" placeholder="Language" value={lang.name} onChange={(e) => updateItem('languages', i, 'name', e.target.value)} />
                    <Input size="xs" placeholder="Level (e.g. Native)" value={lang.level} onChange={(e) => updateItem('languages', i, 'level', e.target.value)} />
                    <IconButton aria-label="Delete" icon={<Trash2 size={12} />} size="xs" onClick={() => removeItem('languages', i)} />
                  </HStack>
                ))}
                <Button size="xs" leftIcon={<Plus size={12} />} onClick={() => addItem('languages', { name: '', level: '' })}>Add Language</Button>
              </AccordionPanel>
            </AccordionItem>

            {/* EDUCATION HISTORY */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg="gray.50" borderRadius="md">
                <HStack flex="1"><Icon as={GraduationCap} /><Text fontWeight="bold" fontSize="sm">Education History</Text></HStack>
                <IconButton aria-label="Add" icon={<Plus size={14} />} size="xs" colorScheme="purple" onClick={(e) => { e.stopPropagation(); addItem('educations', { school: '', degree: '', year: '', grade: '' }); }} />
              </AccordionButton>
              <AccordionPanel>
                {formData.educations.map((edu, i) => (
                  <VStack key={i} p={3} bg="purple.50" mb={3} borderRadius="md" spacing={2} pos="relative">
                    <IconButton aria-label="Remove" pos="absolute" right={-2} top={-2} size="xs" colorScheme="red" borderRadius="full" icon={<Trash2 size={12} />} onClick={() => removeItem('educations', i)} />
                    <Input size="xs" bg="white" placeholder="Institution" value={edu.school} onChange={(e) => updateItem('educations', i, 'school', e.target.value)} />
                    <Input size="xs" bg="white" placeholder="Degree / Certification" value={edu.degree} onChange={(e) => updateItem('educations', i, 'degree', e.target.value)} />
                    <HStack w="full">
                      <NumberInput size="xs" bg="white" w="full" min={1950} max={2100} value={edu.year} onChange={(_, val) => updateItem('educations', i, 'year', val.toString())}>
                        <NumberInputField placeholder="Year" />
                      </NumberInput>
                      <Input size="xs" bg="white" placeholder="Grade/GPA" value={edu.grade} onChange={(e) => updateItem('educations', i, 'grade', e.target.value)} />
                    </HStack>
                  </VStack>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Button colorScheme="blue" size="lg" leftIcon={<Download />} onClick={downloadPDF} py={8} fontSize="md" fontWeight="black" boxShadow="xl" _hover={{ transform: 'translateY(-2px)' }}>
            GENERATE PROFESSIONAL PDF
          </Button>
        </VStack>
      </Box>

      {/* PREVIEW PANEL */}
      <Box flex={1} bg="gray.800" overflowY="auto" display="flex" justifyContent="center" alignItems="flex-start" pt="40px" pb="100px">
        <Box
          ref={resumeRef}
          w="210mm"
          minH="297mm"
          bg="white"
          p="20mm"
          boxShadow="dark-lg"
          fontFamily={formData.fontFamily}
          position="relative"
          flexShrink={0}
        >
          {/* Executive Header */}
          <Flex align="center" justify="space-between" mb={10}>
            <VStack align="flex-start" spacing={1}>
              <Heading size="2xl" color={formData.themeColor} letterSpacing="-2px" lineHeight="1">{formData.fullName}</Heading>
              <Text fontSize="xl" color="gray.500" fontWeight="300" letterSpacing="3px" textTransform="uppercase">{formData.role}</Text>
              <HStack spacing={5} mt={4} fontSize="xs" fontWeight="bold" color="gray.600">
                <Flex align="center" gap={1}><Mail size={12} color={formData.themeColor} /> {formData.email}</Flex>
                <Flex align="center" gap={1}><Phone size={12} color={formData.themeColor} /> {formData.phone}</Flex>
                <Flex align="center" gap={1}><MapPin size={12} color={formData.themeColor} /> {formData.location}</Flex>
              </HStack>
            </VStack>
            {formData.profileImg && (
              <Image src={formData.profileImg} boxSize="130px" borderRadius="xl" objectFit="cover" border="4px solid" borderColor="gray.100" />
            )}
          </Flex>

          <Divider mb={8} borderColor={formData.themeColor} borderBottomWidth="3px" opacity={1} />

          <SimpleGrid columns={3} spacing={12}>
            {/* Main Content (Left 2/3) */}
            <Box gridColumn="span 2">
              <VStack align="stretch" spacing={10}>
                <Box>
                  <Heading size="xs" color={formData.themeColor} mb={3} textTransform="uppercase" letterSpacing="2px" borderBottom="1px solid" borderColor="gray.100" pb={1}>Professional Profile</Heading>
                  <Text fontSize="sm" lineHeight="1.7" color="gray.700" textAlign="justify">{formData.summary}</Text>
                </Box>

                <Box>
                  <Heading size="xs" color={formData.themeColor} mb={5} textTransform="uppercase" letterSpacing="2px" borderBottom="1px solid" borderColor="gray.100" pb={1}>Experience</Heading>
                  {formData.experiences.map((exp, i) => (
                    <Box key={i} mb={8} pos="relative" pl={4} borderLeft="2px solid" borderColor="gray.100">
                      <Flex justify="space-between" align="baseline" mb={1}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">{exp.role}</Text>
                        <Badge colorScheme="blue" variant="subtle" fontSize="9px" px={2}>{exp.start} — {exp.end || 'Present'}</Badge>
                      </Flex>
                      <Text fontSize="sm" color={formData.themeColor} fontWeight="700" mb={3}>{exp.company}</Text>
                      <Text fontSize="xs" color="gray.600" lineHeight="1.6" textAlign="justify">{exp.desc}</Text>
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Heading size="xs" color={formData.themeColor} mb={4} textTransform="uppercase" letterSpacing="2px" borderBottom="1px solid" borderColor="gray.100" pb={1}>Education History</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th fontSize="9px" px={0}>Institution</Th>
                        <Th fontSize="9px">Degree</Th>
                        <Th fontSize="9px" isNumeric>Year</Th>
                        <Th fontSize="9px" isNumeric>Result</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {formData.educations.map((edu, i) => (
                        <Tr key={i}>
                          <Td fontSize="xs" fontWeight="bold" px={0} py={3}>{edu.school}</Td>
                          <Td fontSize="xs" color="gray.600">{edu.degree}</Td>
                          <Td fontSize="xs" isNumeric fontWeight="bold">{edu.year}</Td>
                          <Td fontSize="xs" isNumeric><Badge size="sm" colorScheme="green">{edu.grade}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </Box>

            {/* Sidebar Content (Right 1/3) */}
            <Box>
              <VStack align="stretch" spacing={10}>
                <Box>
                  <Heading size="xs" color={formData.themeColor} mb={5} textTransform="uppercase" letterSpacing="1px">Technical Stack</Heading>
                  {formData.skills.map((s, i) => (
                    <Box key={i} mb={4}>
                      <Flex justify="space-between" mb={1} fontSize="10px" fontWeight="bold" color="gray.700">
                        <Text>{s.name}</Text>
                        <Text>{s.level}%</Text>
                      </Flex>
                      <Progress value={s.level} size="xs" colorScheme="blue" bg="gray.50" borderRadius="full" h="4px" />
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Heading size="xs" color={formData.themeColor} mb={4} textTransform="uppercase" letterSpacing="1px">Languages</Heading>
                  {formData.languages.map((lang, i) => (
                    <Box key={i} mb={2}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.800">{lang.name}</Text>
                      <Text fontSize="10px" color="gray.500">{lang.level}</Text>
                    </Box>
                  ))}
                </Box>

                <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Heading size="xs" color={formData.themeColor} mb={3} textTransform="uppercase" letterSpacing="1px">Additional Info</Heading>
                  {formData.customEntries.map((item, i) => (
                    <Box key={i} mb={3}>
                      <Text fontSize="9px" fontWeight="bold" color="gray.400" textTransform="uppercase">{item.key}</Text>
                      <Text fontSize="11px" fontWeight="bold" color="gray.700">{item.value}</Text>
                    </Box>
                  ))}
                </Box>

                {formData.signatureImg && (
                  <Box mt={6} textAlign="center">
                    <Image src={formData.signatureImg} maxH="50px" mx="auto" filter="contrast(1.2) grayscale(1)" />
                    <Box h="1px" bg="gray.200" w="80%" mx="auto" mt={1} />
                    <Text fontSize="9px" color="gray.400" mt={1} fontWeight="bold">Digitally Certified</Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </Flex>
  );
};

export default CVBuilder;
"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, Textarea, VStack,
  Icon, Text, SimpleGrid, IconButton, Table, Tbody, Tr, Td, Badge, Progress,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Select, Image, HStack, Center, Divider, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Thead, Th,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb
  , Circle
} from '@chakra-ui/react';
import {
  Download, Plus, Trash2, Briefcase, GraduationCap,
  Mail, Phone, MapPin, Award, User, Type, Camera, PenTool, Layout, Star, Calendar, Languages, Zap
  , BookOpen
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import { AcademicTemplate, BotanicalTemplate, CreativeBoldTemplate, MinimalCardTemplate, MonolithTemplate, StartupTemplate, SwissGridTemplate } from './CVTemplates';

// --- Shared Components for a Professional Look ---
const SectionHeading = ({ title, color, icon: Icon }: any) => (
  <HStack spacing={2} mb={4} borderBottom="2px solid" borderColor="gray.100" pb={2}>
    {Icon && <Icon size={18} color={color} />}
    <Heading size="sm" color={color} textTransform="uppercase" letterSpacing="2px">
      {title}
    </Heading>
  </HStack>
);

// --- Templates ---

// 1. THE EXECUTIVE (Classic Corporate)
export const ExecutiveTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="10mm" fontFamily={data.fontFamily}>
    <Flex align="center" justify="space-between" mb={10}>
      <VStack align="flex-start" spacing={1}>
        <Heading size="2xl" color={data.themeColor} fontWeight="800" letterSpacing="-1px">
          {data.fullName}
        </Heading>
        <Text fontSize="xl" color="gray.500" fontWeight="300" letterSpacing="4px" textTransform="uppercase">
          {data.role}
        </Text>
        <HStack spacing={6} mt={4} fontSize="xs" fontWeight="bold" color="gray.600">
          <Flex align="center" gap={1}><Mail size={14} color={data.themeColor} /> {data.email}</Flex>
          <Flex align="center" gap={1}><Phone size={14} color={data.themeColor} /> {data.phone}</Flex>
          <Flex align="center" gap={1}><MapPin size={14} color={data.themeColor} /> {data.location}</Flex>
        </HStack>
      </VStack>
      {data.profileImg && (
        <Image src={data.profileImg} boxSize="140px" borderRadius="2xl" objectFit="cover" border="6px solid" borderColor="gray.50" shadow="sm" />
      )}
    </Flex>

    <SimpleGrid columns={3} spacing={10}>
      <Box gridColumn="span 2">
        <VStack align="stretch" spacing={8}>
          <Box>
            <SectionHeading title="Summary" color={data.themeColor} />
            <Text fontSize="sm" lineHeight="1.8" color="gray.700" textAlign="justify">{data.summary}</Text>
          </Box>

          <Box>
            <SectionHeading title="Professional Experience" color={data.themeColor} icon={Briefcase} />
            {data.experiences.map((exp: any, i: number) => (
              <Box key={i} mb={6} pl={5} position="relative" borderLeft="2px solid" borderColor="gray.100">
                <Circle size="10px" bg={data.themeColor} position="absolute" left="-6px" top="6px" />
                <Flex justify="space-between" align="baseline">
                  <Text fontWeight="800" fontSize="md">{exp.role}</Text>
                  <Badge variant="subtle" colorScheme="gray" fontSize="10px">{exp.start} — {exp.end}</Badge>
                </Flex>
                <Text fontSize="sm" color={data.themeColor} fontWeight="700" mb={2}>{exp.company}</Text>
                <Text fontSize="xs" color="gray.600" lineHeight="1.6">{exp.desc}</Text>
              </Box>
            ))}
          </Box>
        </VStack>
      </Box>

      <Box>
        <VStack align="stretch" spacing={8}>
          <Box>
            <SectionHeading title="Skills" color={data.themeColor} icon={Zap} />
            {data.skills.map((s: any, i: number) => (
              <Box key={i} mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" fontWeight="bold">{s.name}</Text>
                  <Text fontSize="xs" color="gray.500">{s.level}%</Text>
                </Flex>
                <Progress value={s.level} size="xs" colorScheme="blue" borderRadius="full" />
              </Box>
            ))}
          </Box>

          <Box>
            <SectionHeading title="Education" color={data.themeColor} icon={BookOpen} />
            {data.educations.map((edu: any, i: number) => (
              <Box key={i} mb={4}>
                <Text fontSize="xs" fontWeight="bold">{edu.degree}</Text>
                <Text fontSize="xs" color="gray.600">{edu.school}</Text>
                <Text fontSize="10px" color={data.themeColor}>{edu.year} • {edu.grade}</Text>
              </Box>
            ))}
          </Box>

          {data.signatureImg && (
            <Box pt={10}>
              <Image src={data.signatureImg} maxH="50px" mx="auto" filter="grayscale(1)" />
              <Divider mt={2} />
              <Text fontSize="10px" textAlign="center" color="gray.400" mt={1}>Authorized Signature</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </SimpleGrid>
  </Box>
);

// 2. MODERN MINIMALIST (Clean & High Whitespace)
export const MinimalistTemplate: React.FC<{ data: any }> = ({ data }) => (
  <VStack spacing={12} align="stretch" p="10mm" fontFamily={data.fontFamily}>
    <VStack spacing={4} textAlign="center">
      <Heading size="2xl" fontWeight="200" letterSpacing="8px" textTransform="uppercase">{data.fullName}</Heading>
      <HStack spacing={6} color="gray.500" fontSize="xs" letterSpacing="1px">
        <Text>{data.email}</Text>
        <Circle size="4px" bg="gray.300" />
        <Text>{data.phone}</Text>
        <Circle size="4px" bg="gray.300" />
        <Text>{data.location}</Text>
      </HStack>
      <Divider w="100px" borderColor={data.themeColor} borderBottomWidth="2px" />
      <Text fontSize="md" color={data.themeColor} fontWeight="bold" textTransform="uppercase" letterSpacing="4px">{data.role}</Text>
    </VStack>

    <Box px={10}>
      <Text fontSize="sm" fontStyle="italic" textAlign="center" color="gray.600" lineHeight="1.8">
        {data.summary}
      </Text>
    </Box>

    <SimpleGrid columns={2} spacing={20}>
      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERIENCE</Heading>
          {data.experiences.map((exp: any, i: number) => (
            <Box key={i} mb={8}>
              <Text fontWeight="bold" fontSize="sm">{exp.role}</Text>
              <Text fontSize="xs" color={data.themeColor} mb={2}>{exp.company} / {exp.start} - {exp.end}</Text>
              <Text fontSize="xs" color="gray.600" textAlign="justify">{exp.desc}</Text>
            </Box>
          ))}
        </Box>
      </VStack>

      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERTISE</Heading>
          <SimpleGrid columns={2} spacing={3}>
            {data.skills.map((s: any, i: number) => (
              <Badge key={i} variant="outline" p={2} fontSize="9px" borderRadius="0" fontWeight="400" textAlign="center">
                {s.name}
              </Badge>
            ))}
          </SimpleGrid>
        </Box>
        <Box>
          <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EDUCATION</Heading>
          {data.educations.map((edu: any, i: number) => (
            <Box key={i} mb={4}>
              <Text fontSize="xs" fontWeight="bold">{edu.degree}</Text>
              <Text fontSize="xs" color="gray.500">{edu.school} • {edu.year}</Text>
            </Box>
          ))}
        </Box>
      </VStack>
    </SimpleGrid>
  </VStack>
);

// 3. THE TECH SIDEBAR (High Contrast / Developer Style)
export const TechSidebarTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Flex m="-20mm" h="297mm">
    <Box w="32%" bg="gray.900" color="white" p="12mm" pt="20mm">
      <VStack align="center" spacing={8}>
        {data.profileImg && (
          <Image src={data.profileImg} boxSize="160px" borderRadius="full" border="4px solid" borderColor="blue.500" p={1} />
        )}
        <VStack spacing={2} textAlign="center">
          <Heading size="md" letterSpacing="1px">{data.fullName}</Heading>
          <Badge colorScheme="blue" variant="solid" fontSize="10px" px={3}>{data.role}</Badge>
        </VStack>

        <VStack align="stretch" w="full" spacing={6} pt={6}>
          <Box>
            <Text fontSize="10px" color="blue.400" fontWeight="bold" mb={3} letterSpacing="2px">CONTACT</Text>
            <VStack align="stretch" spacing={3} fontSize="xs">
              <HStack><Mail size={12} /> <Text overflow="hidden" noOfLines={1}>{data.email}</Text></HStack>
              <HStack><Phone size={12} /> <Text>{data.phone}</Text></HStack>
              <HStack><MapPin size={12} /> <Text>{data.location}</Text></HStack>
            </VStack>
          </Box>

          <Box>
            <Text fontSize="10px" color="blue.400" fontWeight="bold" mb={4} letterSpacing="2px">TECH STACK</Text>
            {data.skills.map((s: any, i: number) => (
              <Box key={i} mb={4}>
                <Flex justify="space-between" mb={1} fontSize="10px">
                  <Text>{s.name}</Text>
                  <Text opacity={0.6}>{s.level}%</Text>
                </Flex>
                <Progress value={s.level} size="xs" colorScheme="blue" bg="gray.700" borderRadius="full" />
              </Box>
            ))}
          </Box>
        </VStack>
      </VStack>
    </Box>

    <Box w="68%" p="15mm" pt="20mm" bg="white">
      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Profile</Heading>
          <Text fontSize="sm" color="gray.600" lineHeight="1.8">{data.summary}</Text>
        </Box>

        <Box>
          <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Experience</Heading>
          {data.experiences.map((exp: any, i: number) => (
            <Box key={i} mb={8}>
              <Flex justify="space-between" mb={1}>
                <Text fontWeight="bold" color="gray.800">{exp.role}</Text>
                <Text fontSize="xs" fontWeight="bold" color="blue.600">{exp.start} - {exp.end}</Text>
              </Flex>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3}>{exp.company}</Text>
              <Text fontSize="sm" color="gray.600" lineHeight="1.6">{exp.desc}</Text>
            </Box>
          ))}
        </Box>

        <Box>
          <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Education</Heading>
          <SimpleGrid columns={2} spacing={6}>
            {data.educations.map((edu: any, i: number) => (
              <Box key={i} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
                <Text fontSize="xs" color="gray.500">{edu.school}</Text>
                <Text fontSize="xs" color="blue.600" fontWeight="bold">{edu.year}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  </Flex>
);

const CVTemplates = () => {
  return (
    <Box p={5}>
      <Text>Use the named exports to render specific layouts.</Text>
    </Box>
  );
};

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
  const [templateType, setTemplateType] = useState<'executive' | 'minimalist' | 'tech' | 'creative' | 'monolith' |
    'swiss' | 'botanical' | 'startup' | 'academic' | 'card'>('executive');
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

    // 1. Save original styles to restore them after download
    const originalStyle = element.style.cssText;

    try {
      // 2. FORCE A4 PIXEL DIMENSIONS (794px is roughly 210mm at 96 DPI)
      // This prevents the "shifting" seen in your second image.
      element.style.width = '794px';
      element.style.minHeight = '1123px';
      element.style.padding = '20mm'; // Ensure consistent padding
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 3, // High scale for crisp text and sharp lines
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // Forces the capture to think it's on a desktop screen
        onclone: (clonedDoc) => {
          // Additional safety: find the element in the clone and ensure it's visible
          const clonedElement = clonedDoc.body.querySelector('[ref="resumeRef"]') as HTMLElement;
          if (clonedElement) {
             clonedElement.style.width = '794px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // 210 x 297 is standard A4 mm
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_CV.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      // 3. RESTORE the original styles so the UI doesn't look broken
      element.style.cssText = originalStyle;
    }
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
                  <FormControl mt={3}>
                    <FormLabel fontSize="10px" fontWeight="bold">TEMPLATE</FormLabel>
                    <Select size="sm" value={templateType} onChange={(e) => setTemplateType(e.target.value as any)}>
                      <optgroup label="Professional">
                        <option value="executive">Executive (Classic)</option>
                        <option value="minimalist">Minimalist</option>
                        <option value="academic">Academic (Traditional)</option>
                      </optgroup>
                      <optgroup label="Modern & Creative">
                        <option value="tech">Tech Sidebar</option>
                        <option value="creative">Creative Bold</option>
                        <option value="monolith">The Monolith</option>
                        <option value="startup">Startup (Gradient)</option>
                      </optgroup>
                      <optgroup label="Design Focused">
                        <option value="swiss">Swiss Grid</option>
                        <option value="botanical">Botanical</option>
                        <option value="card">Minimal Card</option>
                      </optgroup>
                    </Select>
                  </FormControl>
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
          overflow="hidden"
        >

          {templateType === 'executive' && <ExecutiveTemplate data={formData} />}
          {templateType === 'minimalist' && <MinimalistTemplate data={formData} />}
          {templateType === 'tech' && <TechSidebarTemplate data={formData} />}
          {templateType === 'creative' && <CreativeBoldTemplate data={formData} />}
          {templateType === 'monolith' && <MonolithTemplate data={formData} />}
          {templateType === 'swiss' && <SwissGridTemplate data={formData} />}
          {templateType === 'botanical' && <BotanicalTemplate data={formData} />}
          {templateType === 'startup' && <StartupTemplate data={formData} />}
          {templateType === 'academic' && <AcademicTemplate data={formData} />}
          {templateType === 'card' && <MinimalCardTemplate data={formData} />}
        </Box>
      </Box>
    </Flex>
  );
};

export default CVBuilder;
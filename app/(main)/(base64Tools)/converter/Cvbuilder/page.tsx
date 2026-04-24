"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, Textarea, VStack,
  Icon, Text, SimpleGrid, IconButton, Table, Tbody, Tr, Td, Badge, Progress,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Select, Image, HStack, Center, Divider, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Thead, Th,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, Circle
} from '@chakra-ui/react';
import {
  Download, Plus, Trash2, Briefcase, GraduationCap,
  Mail, Phone, MapPin, Award, User, Type, Camera, PenTool, Layout, Star,
  Calendar, Languages, Zap, BookOpen, GripVertical
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';

// ─── DND-KIT IMPORTS ───────────────────────────────────────────────────────
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── TEMPLATE IMPORTS ──────────────────────────────────────────────────────
import {
  AcademicTemplate,
  BotanicalTemplate,
  CreativeBoldTemplate,
  MinimalCardTemplate,
  MonolithTemplate,
  StartupTemplate,
  SwissGridTemplate,
} from './CVTemplates';

// ─────────────────────────────────────────────────────────────────────────────
// FORCE LIGHT MODE STYLE OBJECT — apply to every form control
// ─────────────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#ffffff',
  color: '#1A202C',
  borderColor: '#CBD5E0',
  _placeholder: { color: '#A0AEC0' },
  _hover: { borderColor: '#4299E1' },
  _focus: { borderColor: '#3182CE', boxShadow: '0 0 0 1px #3182CE' },
};

const PANEL_BG   = '#F7F9FC';   // sidebar background
const SECTION_BG = '#EEF2F7';   // accordion header bg
const TEXT_PRIMARY   = '#1A202C';
const TEXT_SECONDARY = '#4A5568';
const TEXT_MUTED     = '#718096';
const BORDER_COLOR   = '#CBD5E0';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type SectionId =
  | 'summary'
  | 'experience'
  | 'skills'
  | 'languages'
  | 'education'
  | 'achievements'
  | 'custom';

interface SectionConfig {
  label: string;
  colorScheme: string;
  icon: React.ElementType;
}

const SECTION_CONFIG: Record<SectionId, SectionConfig> = {
  summary:      { label: 'Summary',       colorScheme: 'purple', icon: User          },
  experience:   { label: 'Experience',    colorScheme: 'blue',   icon: Briefcase     },
  skills:       { label: 'Skills',        colorScheme: 'teal',   icon: Zap           },
  languages:    { label: 'Languages',     colorScheme: 'cyan',   icon: Languages     },
  education:    { label: 'Education',     colorScheme: 'green',  icon: GraduationCap },
  achievements: { label: 'Achievements',  colorScheme: 'orange', icon: Award         },
  custom:       { label: 'Custom Section',colorScheme: 'pink',   icon: Star          },
};

const DEFAULT_SECTION_ORDER: SectionId[] = [
  'summary', 'experience', 'skills', 'languages', 'education', 'achievements', 'custom',
];

// ─────────────────────────────────────────────────────────────────────────────
// SORTABLE SECTION ROW
// ─────────────────────────────────────────────────────────────────────────────
const SortableSectionRow: React.FC<{ id: SectionId }> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const cfg = SECTION_CONFIG[id];
  const SectionIcon = cfg.icon;

  return (
    <HStack
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      opacity={isDragging ? 0.4 : 1}
      p={3}
      bg={isDragging ? '#EBF8FF' : '#F7F9FC'}
      borderRadius="md"
      mb={2}
      border="1px solid"
      borderColor={isDragging ? '#90CDF4' : BORDER_COLOR}
      boxShadow={isDragging ? 'md' : 'none'}
      spacing={3}
    >
      <Box
        {...listeners}
        {...attributes}
        cursor="grab"
        color={TEXT_MUTED}
        _hover={{ color: TEXT_SECONDARY }}
        _active={{ cursor: 'grabbing' }}
        display="flex"
        alignItems="center"
      >
        <GripVertical size={16} />
      </Box>
      <Icon as={SectionIcon} boxSize={4} color={`${cfg.colorScheme}.500`} />
      <Text fontSize="sm" fontWeight="bold" flex={1} color={TEXT_PRIMARY}>
        {cfg.label}
      </Text>
      <Badge colorScheme={cfg.colorScheme} variant="subtle" fontSize="9px">DRAG</Badge>
    </HStack>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TEMPLATE SECTION HEADING
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeading = ({ title, color, icon: IconComp }: any) => (
  <HStack spacing={2} mb={4} borderBottom="2px solid" borderColor="gray.100" pb={2}>
    {IconComp && <IconComp size={18} color={color} />}
    <Heading size="sm" color={color} textTransform="uppercase" letterSpacing="2px">
      {title}
    </Heading>
  </HStack>
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Achievement { title: string; date: string; issuer: string; }
interface Experience  { company: string; role: string; start: string; end: string; desc: string; isPresent?: boolean; }
interface Education   { school: string; degree: string; year: string; grade: string; }
interface CustomEntry { key: string; value: string; }
interface Skill       { name: string; level: number; }
interface Language    { name: string; level: string; }

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

// ─────────────────────────────────────────────────────────────────────────────
// INLINE TEMPLATES (Executive & Minimalist & TechSidebar)
// ─────────────────────────────────────────────────────────────────────────────
const renderOrdered = (order: SectionId[], map: Record<string, React.ReactNode>) =>
  order.filter((id) => map[id]).map((id) => (
    <React.Fragment key={id}>{map[id]}</React.Fragment>
  ));

// 1. EXECUTIVE
const ExecutiveTemplate: React.FC<{ data: CVData; sectionOrder: SectionId[] }> = ({ data, sectionOrder }) => {
  const mainSections: Partial<Record<SectionId, React.ReactNode>> = {
    summary: (
      <Box>
        <SectionHeading title="Summary" color={data.themeColor} />
        <Text fontSize="sm" lineHeight="1.8" color="gray.700" textAlign="justify">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box>
        <SectionHeading title="Professional Experience" color={data.themeColor} icon={Briefcase} />
        {data.experiences.map((exp, i) => (
          <Box key={i} mb={6} pl={5} position="relative" borderLeft="2px solid" borderColor="gray.100">
            <Circle size="10px" bg={data.themeColor} position="absolute" left="-6px" top="6px" />
            <Flex justify="space-between" align="baseline">
              <Text fontWeight="800" fontSize="md">{exp.role}</Text>
              <Badge variant="subtle" colorScheme="gray" fontSize="10px">
                {exp.start} — {exp.isPresent ? 'PRESENT' : exp.end}
              </Badge>
            </Flex>
            <Text fontSize="sm" color={data.themeColor} fontWeight="700" mb={2}>{exp.company}</Text>
            <Text fontSize="xs" color="gray.600" lineHeight="1.6" whiteSpace="pre-line">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box>
        <SectionHeading title="Achievements" color={data.themeColor} icon={Award} />
        {data.achievements.map((a, i) => (
          <Box key={i} mb={3} pl={4} borderLeft="2px solid" borderColor="gray.100">
            <Text fontWeight="700" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
    custom: (
      <Box>
        {data.customEntries.map((entry, i) => (
          <Box key={i} mb={3}>
            <Text fontWeight="700" fontSize="xs" color={data.themeColor} textTransform="uppercase">{entry.key}</Text>
            <Text fontSize="xs" color="gray.600">{entry.value}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const sideSections: Partial<Record<SectionId, React.ReactNode>> = {
    skills: (
      <Box>
        <SectionHeading title="Skills" color={data.themeColor} icon={Zap} />
        {data.skills.map((s, i) => (
          <Box key={i} mb={4}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="bold">{s.name}</Text>
              <Text fontSize="xs" color="gray.500">{s.level}%</Text>
            </Flex>
            <Progress value={s.level} size="xs" colorScheme="blue" borderRadius="full" />
          </Box>
        ))}
      </Box>
    ),
    languages: (
      <Box>
        <SectionHeading title="Languages" color={data.themeColor} icon={Languages} />
        {data.languages.map((l, i) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Badge fontSize="9px" colorScheme="gray">{l.level}</Badge>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box>
        <SectionHeading title="Education" color={data.themeColor} icon={BookOpen} />
        {data.educations.map((edu, i) => (
          <Box key={i} mb={4}>
            <Text fontSize="xs" fontWeight="bold">{edu.degree}</Text>
            <Text fontSize="xs" color="gray.600">{edu.school}</Text>
            <Text fontSize="10px" color={data.themeColor}>{edu.year} • {edu.grade}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="10mm" fontFamily={data.fontFamily}>
      <Flex align="center" justify="space-between" mb={10}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="2xl" color={data.themeColor} fontWeight="800" letterSpacing="-1px">{data.fullName}</Heading>
          <Text fontSize="xl" color="gray.500" fontWeight="300" letterSpacing="4px" textTransform="uppercase">{data.role}</Text>
          <HStack spacing={6} mt={4} fontSize="xs" fontWeight="bold" color="gray.600">
            <Flex align="center" gap={1}><Mail size={14} color={data.themeColor} /> {data.email}</Flex>
            <Flex align="center" gap={1}><Phone size={14} color={data.themeColor} /> {data.phone}</Flex>
            <Flex align="center" gap={1}><MapPin size={14} color={data.themeColor} /> {data.location}</Flex>
          </HStack>
        </VStack>
        {data.profileImg && (
          <Image src={data.profileImg} boxSize="140px" borderRadius="2xl" objectFit="cover"
            border="6px solid" borderColor="gray.50" shadow="sm" />
        )}
      </Flex>

      <SimpleGrid columns={3} spacing={10}>
        <Box gridColumn="span 2">
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, mainSections as Record<string, React.ReactNode>)}
          </VStack>
        </Box>
        <Box>
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, sideSections as Record<string, React.ReactNode>)}
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
};

// 2. MINIMALIST
const MinimalistTemplate: React.FC<{ data: CVData; sectionOrder: SectionId[] }> = ({ data, sectionOrder }) => {
  const leftSections: Partial<Record<SectionId, React.ReactNode>> = {
    experience: (
      <Box>
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERIENCE</Heading>
        {data.experiences.map((exp, i) => (
          <Box key={i} mb={8}>
            <Text fontWeight="bold" fontSize="sm">{exp.role}</Text>
            <Text fontSize="xs" color={data.themeColor} mb={2}>
              {exp.company} / {exp.start} - {exp.isPresent ? 'Present' : exp.end}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="justify">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box>
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">ACHIEVEMENTS</Heading>
        {data.achievements.map((a, i) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const rightSections: Partial<Record<SectionId, React.ReactNode>> = {
    skills: (
      <Box>
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERTISE</Heading>
        <SimpleGrid columns={2} spacing={3}>
          {data.skills.map((s, i) => (
            <Badge key={i} variant="outline" p={2} fontSize="9px" borderRadius="0" fontWeight="400" textAlign="center">
              {s.name}
            </Badge>
          ))}
        </SimpleGrid>
      </Box>
    ),
    languages: (
      <Box>
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">LANGUAGES</Heading>
        {data.languages.map((l, i) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Text fontSize="xs" color="gray.500">{l.level}</Text>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box>
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EDUCATION</Heading>
        {data.educations.map((edu, i) => (
          <Box key={i} mb={4}>
            <Text fontSize="xs" fontWeight="bold">{edu.degree}</Text>
            <Text fontSize="xs" color="gray.500">{edu.school} • {edu.year}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
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

      {sectionOrder.includes('summary') && (
        <Box px={10}>
          <Text fontSize="sm" fontStyle="italic" textAlign="center" color="gray.600" lineHeight="1.8">
            {data.summary}
          </Text>
        </Box>
      )}

      <SimpleGrid columns={2} spacing={20}>
        <VStack align="stretch" spacing={10}>
          {renderOrdered(sectionOrder, leftSections as Record<string, React.ReactNode>)}
        </VStack>
        <VStack align="stretch" spacing={10}>
          {renderOrdered(sectionOrder, rightSections as Record<string, React.ReactNode>)}
        </VStack>
      </SimpleGrid>
    </VStack>
  );
};

// 3. TECH SIDEBAR
const TechSidebarTemplate: React.FC<{ data: CVData; sectionOrder: SectionId[] }> = ({ data, sectionOrder }) => {
  const mainSections: Partial<Record<SectionId, React.ReactNode>> = {
    summary: (
      <Box>
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Profile</Heading>
        <Text fontSize="sm" color="gray.600" lineHeight="1.8">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box>
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Experience</Heading>
        {data.experiences.map((exp, i) => (
          <Box key={i} mb={8}>
            <Flex justify="space-between" mb={1}>
              <Text fontWeight="bold" color="gray.800">{exp.role}</Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                {exp.start} - {exp.isPresent ? 'Present' : exp.end}
              </Text>
            </Flex>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3}>{exp.company}</Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    education: (
      <Box>
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Education</Heading>
        <SimpleGrid columns={2} spacing={6}>
          {data.educations.map((edu, i) => (
            <Box key={i} p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
              <Text fontSize="xs" color="gray.500">{edu.school}</Text>
              <Text fontSize="xs" color="blue.600" fontWeight="bold">{edu.year}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    ),
    achievements: (
      <Box>
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Achievements</Heading>
        {data.achievements.map((a, i) => (
          <Box key={i} mb={3} p={3} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
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
                <HStack><Mail size={12} /><Text overflow="hidden" noOfLines={1}>{data.email}</Text></HStack>
                <HStack><Phone size={12} /><Text>{data.phone}</Text></HStack>
                <HStack><MapPin size={12} /><Text>{data.location}</Text></HStack>
              </VStack>
            </Box>

            {sectionOrder.includes('skills') && (
              <Box>
                <Text fontSize="10px" color="blue.400" fontWeight="bold" mb={4} letterSpacing="2px">TECH STACK</Text>
                {data.skills.map((s, i) => (
                  <Box key={i} mb={4}>
                    <Flex justify="space-between" mb={1} fontSize="10px">
                      <Text>{s.name}</Text>
                      <Text opacity={0.6}>{s.level}%</Text>
                    </Flex>
                    <Progress value={s.level} size="xs" colorScheme="blue" bg="gray.700" borderRadius="full" />
                  </Box>
                ))}
              </Box>
            )}

            {sectionOrder.includes('languages') && (
              <Box>
                <Text fontSize="10px" color="blue.400" fontWeight="bold" mb={3} letterSpacing="2px">LANGUAGES</Text>
                {data.languages.map((l, i) => (
                  <HStack key={i} justify="space-between" mb={2} fontSize="xs">
                    <Text>{l.name}</Text>
                    <Badge colorScheme="blue" variant="outline" fontSize="9px">{l.level}</Badge>
                  </HStack>
                ))}
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>

      <Box w="68%" p="15mm" pt="20mm" bg="white">
        <VStack align="stretch" spacing={10}>
          {renderOrdered(sectionOrder, mainSections as Record<string, React.ReactNode>)}
        </VStack>
      </Box>
    </Flex>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CV BUILDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CVBuilder: React.FC = () => {
  const router = useRouter();

  const [templateType, setTemplateType] = useState<
    'executive' | 'minimalist' | 'tech' | 'creative' | 'monolith' |
    'swiss' | 'botanical' | 'startup' | 'academic' | 'card'
  >('executive');

  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_SECTION_ORDER);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((prev) =>
        arrayMove(
          prev,
          prev.indexOf(active.id as SectionId),
          prev.indexOf(over.id as SectionId)
        )
      );
    }
  };

  const [formData, setFormData] = useState<CVData>({
    fullName: 'JONATHAN WICK',
    role: 'Lead Systems Architect',
    email: 'j.wick@continental.com',
    phone: '+1 212-555-0199',
    location: 'New York, NY',
    summary:
      'Strategic technology leader with 10+ years of experience in designing high-availability distributed systems. Proven track record in reducing operational costs and leading cross-functional engineering teams.',
    profileImg: '',
    signatureImg: '',
    experiences: [
      {
        company: 'Global Solutions',
        role: 'Senior Architect',
        start: '2021-01',
        end: '2026-02',
        desc: 'Led the migration of legacy infrastructure to a multi-cloud environment.',
        isPresent: false,
      },
    ],
    educations: [
      { school: 'Stanford University', degree: 'B.Sc. Computer Science', year: '2019', grade: '4.0 GPA' },
      { school: 'MIT', degree: 'M.Sc. Systems Engineering', year: '2021', grade: 'Distinction' },
    ],
    achievements: [{ title: 'Innovator of the Year', date: '2024-05', issuer: 'Tech Corp' }],
    customEntries: [{ key: 'Interests', value: 'Cybersecurity, Restoration, Philosophy' }],
    skills: [
      { name: 'TypeScript', level: 95 },
      { name: 'Cloud Architecture', level: 90 },
    ],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Russian', level: 'Fluent' },
    ],
    themeColor: '#1A365D',
    fontFamily: 'Inter, sans-serif',
  });

  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSignature = sessionStorage.getItem('cvSignature');
    if (savedSignature) {
      setFormData((prev) => ({ ...prev, signatureImg: savedSignature }));
      sessionStorage.removeItem('cvSignature');
    }
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, field: 'profileImg' | 'signatureImg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'profileImg' | 'signatureImg') =>
    setFormData((prev) => ({ ...prev, [field]: '' }));

  const updateItem = (category: keyof CVData, index: number, field: string, value: any) => {
    const newData: any = { ...formData };
    newData[category][index][field] = value;
    setFormData(newData);
  };

  const addItem = (category: keyof CVData, template: any) =>
    setFormData((prev) => ({ ...prev, [category]: [...(prev[category] as any[]), template] }));

  const removeItem = (category: keyof CVData, index: number) =>
    setFormData((prev) => ({ ...prev, [category]: (prev[category] as any[]).filter((_, i) => i !== index) }));

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;
    const originalStyle = element.style.cssText;
    try {
      element.style.width = '794px';
      element.style.minHeight = '1123px';
      element.style.padding = '20mm';
      element.style.transform = 'none';
      const canvas = await html2canvas(element, {
        scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: 794,
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      element.style.cssText = originalStyle;
    }
  };

  const tplProps = { data: formData, sectionOrder };

  // ── Shared input sx props ──────────────────────────────────────────────────
  // These force white background + dark text regardless of color mode
  const inputSx = {
    bg: '#ffffff !important',
    color: '#1A202C !important',
    borderColor: '#CBD5E0 !important',
    '&::placeholder': { color: '#A0AEC0 !important' },
    '&:hover': { borderColor: '#4299E1 !important' },
    '&:focus': { borderColor: '#3182CE !important', boxShadow: '0 0 0 1px #3182CE !important' },
  };

  const selectSx = {
    bg: '#ffffff !important',
    color: '#1A202C !important',
    borderColor: '#CBD5E0 !important',
    '& option': { bg: '#ffffff', color: '#1A202C' },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Flex h="100vh" bg={PANEL_BG} overflow="hidden">

      {/* ── EDITOR SIDEBAR ──────────────────────────────────────────────── */}
      <Box
        w="500px"
        bg="#ffffff"
        p={6}
        overflowY="auto"
        borderRight="1px solid"
        borderColor={BORDER_COLOR}
        boxShadow="2xl"
        zIndex={10}
        sx={{
          '& *': { colorScheme: 'light' },
        }}
      >
        <VStack align="stretch" spacing={6}>

          {/* Header */}
          <Box borderLeft="4px solid" borderColor="blue.500" pl={4}>
            <Heading size="md" color={TEXT_PRIMARY} letterSpacing="tight">CV ENGINE PRO</Heading>
            <Text fontSize="xs" color={TEXT_MUTED} fontWeight="bold">v3.0 — WITH DRAG &amp; DROP SECTIONS</Text>
          </Box>

          <Accordion allowMultiple defaultIndex={[0]}>

            {/* ── CONTACT & STYLE ─────────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton
                bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md"
                color={TEXT_PRIMARY}
              >
                <HStack flex="1">
                  <Icon as={User} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Contact &amp; Style</Text>
                </HStack>
                <AccordionIcon color={TEXT_SECONDARY} />
              </AccordionButton>
              <AccordionPanel pb={4} bg="#ffffff">
                <VStack spacing={3} mt={2}>
                  <Input size="sm" placeholder="Full Name" value={formData.fullName} sx={inputSx}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })} />
                  <Input size="sm" placeholder="Professional Role" value={formData.role} sx={inputSx}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                  <Input size="sm" placeholder="Location (e.g. New York, NY)" value={formData.location} sx={inputSx}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  <SimpleGrid columns={2} spacing={2} w="full">
                    <Input size="sm" type="email" placeholder="Email" value={formData.email} sx={inputSx}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <Input size="sm" type="tel" placeholder="Phone" value={formData.phone} sx={inputSx}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </SimpleGrid>
                  <Textarea size="sm" placeholder="Professional Summary" value={formData.summary} rows={4} sx={inputSx}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />

                  <Divider borderColor={BORDER_COLOR} />

                  {/* Profile & Signature */}
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold" color={TEXT_SECONDARY}>PROFILE IMAGE</FormLabel>
                      <HStack>
                        <Button as="label" size="xs" w="full" cursor="pointer" leftIcon={<Camera size={14} />}
                          bg="#EBF4FF" color="#2B6CB0" _hover={{ bg: '#BEE3F8' }} border="1px solid" borderColor="#90CDF4">
                          {formData.profileImg ? 'Change' : 'Upload'}
                          <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'profileImg')} />
                        </Button>
                        {formData.profileImg && (
                          <IconButton aria-label="Remove" icon={<Trash2 size={14} />} size="xs"
                            colorScheme="red" variant="ghost" onClick={() => removeImage('profileImg')} />
                        )}
                      </HStack>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold" color={TEXT_SECONDARY}>SIGNATURE</FormLabel>
                      <HStack>
                        <Button size="xs" w="full" leftIcon={<PenTool size={14} />}
                          bg="#EBF4FF" color="#2B6CB0" _hover={{ bg: '#BEE3F8' }} border="1px solid" borderColor="#90CDF4"
                          onClick={() => router.push('/converter/PDFtools/Pdfsign?from=cv')}>
                          {formData.signatureImg ? 'Change' : 'Create'}
                        </Button>
                        {formData.signatureImg && (
                          <IconButton aria-label="Remove" icon={<Trash2 size={14} />} size="xs"
                            colorScheme="red" variant="ghost" onClick={() => removeImage('signatureImg')} />
                        )}
                      </HStack>
                    </FormControl>
                  </SimpleGrid>

                  {/* Theme + Font */}
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold" color={TEXT_SECONDARY}>THEME COLOR</FormLabel>
                      <Input type="color" size="sm" h="35px" sx={inputSx} value={formData.themeColor}
                        onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="10px" fontWeight="bold" color={TEXT_SECONDARY}>FONT STYLE</FormLabel>
                      <Select size="sm" sx={selectSx} value={formData.fontFamily}
                        onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}>
                        <option value="Inter, sans-serif">Modern Sans</option>
                        <option value="'Times New Roman', serif">Classic Serif</option>
                        <option value="'Courier New', monospace">Technical Mono</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  {/* Template selector */}
                  <FormControl mt={3}>
                    <FormLabel fontSize="10px" fontWeight="bold" color={TEXT_SECONDARY}>TEMPLATE</FormLabel>
                    <Select size="sm" sx={selectSx} value={templateType} onChange={(e) => setTemplateType(e.target.value as any)}>
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

            {/* ── SECTION ORDER (DRAG & DROP) ──────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg="#EBF8FF" _hover={{ bg: '#BEE3F8' }} borderRadius="md">
                <HStack flex="1">
                  <Icon as={Layout} color="blue.500" />
                  <Text fontWeight="bold" fontSize="sm" color="#2C5282">Section Order</Text>
                  <Badge colorScheme="blue" fontSize="9px">DRAG TO REORDER</Badge>
                </HStack>
                <AccordionIcon color="#2C5282" />
              </AccordionButton>
              <AccordionPanel pb={4} bg="#ffffff">
                <Text fontSize="10px" color={TEXT_MUTED} mb={3} fontWeight="bold">
                  ⠿ DRAG ROWS TO REARRANGE — PREVIEW &amp; PDF UPDATE INSTANTLY
                </Text>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    {sectionOrder.map((id) => (
                      <SortableSectionRow key={id} id={id} />
                    ))}
                  </SortableContext>
                </DndContext>
                <Button size="xs" variant="ghost" color={TEXT_MUTED} mt={2}
                  _hover={{ bg: SECTION_BG, color: TEXT_PRIMARY }}
                  onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}>
                  Reset to default order
                </Button>
              </AccordionPanel>
            </AccordionItem>

            {/* ── EXPERIENCE ───────────────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md" color={TEXT_PRIMARY}>
                <HStack flex="1">
                  <Icon as={Briefcase} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Experience</Text>
                </HStack>
                <IconButton
                  aria-label="Add experience" icon={<Plus size={14} />} size="xs" colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem('experiences', { company: '', role: '', start: '', end: '', desc: '', isPresent: false });
                  }}
                />
              </AccordionButton>
              <AccordionPanel bg="#ffffff">
                {formData.experiences.map((exp, i) => (
                  <VStack key={i} p={3} bg="#EBF8FF" mb={3} borderRadius="md" spacing={2}
                    pos="relative" border="1px solid" borderColor="#90CDF4">
                    <IconButton
                      aria-label="Remove" pos="absolute" right={-2} top={-2} size="xs"
                      colorScheme="red" borderRadius="full" icon={<Trash2 size={12} />}
                      onClick={() => removeItem('experiences', i)}
                    />
                    <Input size="xs" placeholder="Company" value={exp.company} sx={inputSx}
                      onChange={(e) => updateItem('experiences', i, 'company', e.target.value)} />
                    <Input size="xs" placeholder="Role" value={exp.role} sx={inputSx}
                      onChange={(e) => updateItem('experiences', i, 'role', e.target.value)} />
                    <HStack w="full">
                      <Input size="xs" type="month" value={exp.start} sx={inputSx}
                        onChange={(e) => updateItem('experiences', i, 'start', e.target.value)} />
                      <Input size="xs" type="month" value={exp.end} sx={inputSx}
                        onChange={(e) => updateItem('experiences', i, 'end', e.target.value)} />
                    </HStack>
                    <HStack w="full" justify="flex-end" mt={1}>
                      <input
                        type="checkbox" id={`present-${i}`}
                        checked={exp.isPresent || false}
                        onChange={(e) => updateItem('experiences', i, 'isPresent', e.target.checked)}
                        style={{ accentColor: '#3182CE' }}
                      />
                      <label htmlFor={`present-${i}`} style={{ fontSize: '10px', color: TEXT_SECONDARY, fontWeight: 'bold', cursor: 'pointer' }}>
                        I CURRENTLY WORK HERE
                      </label>
                    </HStack>
                    <Textarea size="xs" placeholder="Key Responsibilities..." value={exp.desc} sx={inputSx}
                      onChange={(e) => updateItem('experiences', i, 'desc', e.target.value)} />
                  </VStack>
                ))}
              </AccordionPanel>
            </AccordionItem>

            {/* ── SKILLS & LANGUAGES ───────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md">
                <HStack flex="1">
                  <Icon as={Zap} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Skills &amp; Languages</Text>
                </HStack>
                <AccordionIcon color={TEXT_SECONDARY} />
              </AccordionButton>
              <AccordionPanel bg="#ffffff">
                <Text fontSize="10px" fontWeight="bold" mb={2} color={TEXT_MUTED}>TECHNICAL SKILLS</Text>
                {formData.skills.map((skill, i) => (
                  <HStack key={i} mb={2}>
                    <Input size="xs" placeholder="Skill" value={skill.name} sx={inputSx}
                      onChange={(e) => updateItem('skills', i, 'name', e.target.value)} />
                    <NumberInput size="xs" max={100} min={0} w="100px" value={skill.level}
                      onChange={(_, val) => updateItem('skills', i, 'level', val)}>
                      <NumberInputField sx={inputSx} />
                      <NumberInputStepper>
                        <NumberIncrementStepper color={TEXT_SECONDARY} />
                        <NumberDecrementStepper color={TEXT_SECONDARY} />
                      </NumberInputStepper>
                    </NumberInput>
                    <IconButton aria-label="Delete" icon={<Trash2 size={12} />} size="xs"
                      colorScheme="red" variant="ghost" onClick={() => removeItem('skills', i)} />
                  </HStack>
                ))}
                <Button size="xs" leftIcon={<Plus size={12} />} mb={4}
                  bg="#EBF4FF" color="#2B6CB0" _hover={{ bg: '#BEE3F8' }}
                  onClick={() => addItem('skills', { name: '', level: 50 })}>
                  Add Skill
                </Button>

                <Divider mb={4} borderColor={BORDER_COLOR} />

                <Text fontSize="10px" fontWeight="bold" mb={2} color={TEXT_MUTED}>LANGUAGES</Text>
                {formData.languages.map((lang, i) => (
                  <HStack key={i} mb={2}>
                    <Input size="xs" placeholder="Language" value={lang.name} sx={inputSx}
                      onChange={(e) => updateItem('languages', i, 'name', e.target.value)} />
                    <Input size="xs" placeholder="Level (e.g. Native)" value={lang.level} sx={inputSx}
                      onChange={(e) => updateItem('languages', i, 'level', e.target.value)} />
                    <IconButton aria-label="Delete" icon={<Trash2 size={12} />} size="xs"
                      colorScheme="red" variant="ghost" onClick={() => removeItem('languages', i)} />
                  </HStack>
                ))}
                <Button size="xs" leftIcon={<Plus size={12} />}
                  bg="#EBF4FF" color="#2B6CB0" _hover={{ bg: '#BEE3F8' }}
                  onClick={() => addItem('languages', { name: '', level: '' })}>
                  Add Language
                </Button>
              </AccordionPanel>
            </AccordionItem>

            {/* ── EDUCATION ────────────────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md">
                <HStack flex="1">
                  <Icon as={GraduationCap} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Education History</Text>
                </HStack>
                <IconButton
                  aria-label="Add education" icon={<Plus size={14} />} size="xs" colorScheme="purple"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem('educations', { school: '', degree: '', year: '', grade: '' });
                  }}
                />
              </AccordionButton>
              <AccordionPanel bg="#ffffff">
                {formData.educations.map((edu, i) => (
                  <VStack key={i} p={3} bg="#FAF5FF" mb={3} borderRadius="md" spacing={2}
                    pos="relative" border="1px solid" borderColor="#D6BCFA">
                    <IconButton
                      aria-label="Remove" pos="absolute" right={-2} top={-2} size="xs"
                      colorScheme="red" borderRadius="full" icon={<Trash2 size={12} />}
                      onClick={() => removeItem('educations', i)}
                    />
                    <Input size="xs" placeholder="Institution" value={edu.school} sx={inputSx}
                      onChange={(e) => updateItem('educations', i, 'school', e.target.value)} />
                    <Input size="xs" placeholder="Degree / Certification" value={edu.degree} sx={inputSx}
                      onChange={(e) => updateItem('educations', i, 'degree', e.target.value)} />
                    <HStack w="full">
                      <NumberInput size="xs" w="full" min={1950} max={2100} value={edu.year}
                        onChange={(_, val) => updateItem('educations', i, 'year', val.toString())}>
                        <NumberInputField sx={inputSx} placeholder="Year" />
                      </NumberInput>
                      <Input size="xs" placeholder="Grade/GPA" value={edu.grade} sx={inputSx}
                        onChange={(e) => updateItem('educations', i, 'grade', e.target.value)} />
                    </HStack>
                  </VStack>
                ))}
              </AccordionPanel>
            </AccordionItem>

            {/* ── ACHIEVEMENTS ─────────────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md">
                <HStack flex="1">
                  <Icon as={Award} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Achievements</Text>
                </HStack>
                <IconButton
                  aria-label="Add achievement" icon={<Plus size={14} />} size="xs" colorScheme="orange"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem('achievements', { title: '', date: '', issuer: '' });
                  }}
                />
              </AccordionButton>
              <AccordionPanel bg="#ffffff">
                {formData.achievements.map((ach, i) => (
                  <VStack key={i} p={3} bg="#FFFAF0" mb={3} borderRadius="md" spacing={2}
                    pos="relative" border="1px solid" borderColor="#FBD38D">
                    <IconButton
                      aria-label="Remove" pos="absolute" right={-2} top={-2} size="xs"
                      colorScheme="red" borderRadius="full" icon={<Trash2 size={12} />}
                      onClick={() => removeItem('achievements', i)}
                    />
                    <Input size="xs" placeholder="Achievement Title" value={ach.title} sx={inputSx}
                      onChange={(e) => updateItem('achievements', i, 'title', e.target.value)} />
                    <HStack w="full">
                      <Input size="xs" type="month" placeholder="Date" value={ach.date} sx={inputSx}
                        onChange={(e) => updateItem('achievements', i, 'date', e.target.value)} />
                      <Input size="xs" placeholder="Issuing Organization" value={ach.issuer} sx={inputSx}
                        onChange={(e) => updateItem('achievements', i, 'issuer', e.target.value)} />
                    </HStack>
                  </VStack>
                ))}
              </AccordionPanel>
            </AccordionItem>

            {/* ── CUSTOM ENTRIES ───────────────────────────────────────── */}
            <AccordionItem border="none" mb={4}>
              <AccordionButton bg={SECTION_BG} _hover={{ bg: '#DDE5EF' }} borderRadius="md">
                <HStack flex="1">
                  <Icon as={Star} color={TEXT_SECONDARY} />
                  <Text fontWeight="bold" fontSize="sm" color={TEXT_PRIMARY}>Custom Section</Text>
                </HStack>
                <IconButton
                  aria-label="Add custom" icon={<Plus size={14} />} size="xs" colorScheme="pink"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem('customEntries', { key: '', value: '' });
                  }}
                />
              </AccordionButton>
              <AccordionPanel bg="#ffffff">
                {formData.customEntries.map((entry, i) => (
                  <HStack key={i} mb={2} pos="relative">
                    <Input size="xs" placeholder="Label" value={entry.key} sx={inputSx}
                      onChange={(e) => updateItem('customEntries', i, 'key', e.target.value)} />
                    <Input size="xs" placeholder="Value" value={entry.value} sx={inputSx}
                      onChange={(e) => updateItem('customEntries', i, 'value', e.target.value)} />
                    <IconButton aria-label="Remove" icon={<Trash2 size={12} />} size="xs"
                      colorScheme="red" variant="ghost" onClick={() => removeItem('customEntries', i)} />
                  </HStack>
                ))}
              </AccordionPanel>
            </AccordionItem>

          </Accordion>

          {/* ── DOWNLOAD BUTTON ─────────────────────────────────────────── */}
          <Button
            bg="#2B6CB0" color="#ffffff" _hover={{ bg: '#2C5282', transform: 'translateY(-2px)' }}
            size="lg" leftIcon={<Download />}
            onClick={downloadPDF} py={8} fontSize="md" fontWeight="black"
            boxShadow="xl" transition="all 0.2s"
          >
            GENERATE PROFESSIONAL PDF
          </Button>
        </VStack>
      </Box>

      {/* ── PREVIEW PANEL ─────────────────────────────────────────────────── */}
      <Box flex={1} bg="#2D3748" overflowY="auto" display="flex"
        justifyContent="center" alignItems="flex-start" pt="40px" pb="100px">
        <Box
          ref={resumeRef}
          w="210mm" minH="297mm" bg="white" p="20mm"
          boxShadow="dark-lg" fontFamily={formData.fontFamily}
          position="relative" flexShrink={0} overflow="hidden"
        >
          {templateType === 'executive'  && <ExecutiveTemplate   {...tplProps} />}
          {templateType === 'minimalist' && <MinimalistTemplate  {...tplProps} />}
          {templateType === 'tech'       && <TechSidebarTemplate {...tplProps} />}
          {templateType === 'creative'   && <CreativeBoldTemplate  data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'monolith'   && <MonolithTemplate      data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'swiss'      && <SwissGridTemplate     data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'botanical'  && <BotanicalTemplate     data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'startup'    && <StartupTemplate       data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'academic'   && <AcademicTemplate      data={formData} sectionOrder={sectionOrder} />}
          {templateType === 'card'       && <MinimalCardTemplate   data={formData} sectionOrder={sectionOrder} />}
        </Box>
      </Box>
    </Flex>
  );
};

export default CVBuilder;
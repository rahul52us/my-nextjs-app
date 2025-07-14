'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Collapse,
  IconButton,
  Circle,
  HStack,
  Badge,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { DownloadIcon, DeleteIcon, ViewIcon, ChevronDownIcon, ChevronUpIcon, InfoOutlineIcon, MinusIcon } from '@chakra-ui/icons';
import { useReactToPrint } from 'react-to-print';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

// TypeScript interfaces
interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Theme {
  primaryColor: string;
  fontFamily: string;
}

interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  sectionOrder: string[];
  language: 'en' | 'es' | 'fr';
  theme: Theme;
}

interface TemplateProps {
  data: ResumeData;
}

interface SavedResume {
  id: string;
  name: string;
  timestamp: string;
}

// Mock translations
const translations: Record<string, Record<string, string>> = {
  en: { summary: 'Summary', education: 'Education', experience: 'Experience', skills: 'Skills', resumeBuilder: 'Resume Quest' },
  es: { summary: 'Resumen', education: 'Educación', experience: 'Experiencia', skills: 'Habilidades', resumeBuilder: 'Creador de Currículum' },
  fr: { summary: 'Résumé', education: 'Éducation', experience: 'Expérience', skills: 'Compétences', resumeBuilder: 'Créateur de CV' },
};

// Mock AI suggestions
const aiSuggestions = {
  summary: (role: string) => `Dynamic ${role} with a proven track record in innovative solutions and team leadership.`,
  experience: (role: string) => `Spearheaded ${role} projects, boosting efficiency by 25% through strategic planning.`,
  skills: ['JavaScript', 'Python', 'Leadership', 'Collaboration'],
};

// Simulated ATS score calculation
const calculateATSScore = (data: ResumeData): { score: number; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];
  if (data.name) score += 10; else feedback.push('Add your full name.');
  if (data.email && data.phone) score += 10; else feedback.push('Include email and phone.');
  if (data.summary && data.summary.length > 50) score += 20; else feedback.push('Write a summary (50+ characters).');
  score += Math.min(data.education.length * 10, 20);
  if (data.education.length === 0) feedback.push('Add at least one education entry.');
  score += Math.min(data.experience.length * 15, 30);
  if (data.experience.length === 0) feedback.push('Add at least one work experience.');
  score += Math.min(data.skills.length * 5, 20);
  if (data.skills.length < 3) feedback.push('List at least three skills.');
  const keywords = (data.summary + ' ' + data.experience.map(e => e.description).join(' ')).toLowerCase().match(/(javascript|python|management|leadership|teamwork)/g)?.length || 0;
  score += Math.min(keywords * 5, 20);
  if (keywords < 3) feedback.push('Add more industry keywords.');
  return { score: Math.min(score, 100), feedback };
};

// Timeline Component
const Timeline: React.FC<{ items: Array<Education | Experience> }> = ({ items }) => (
  <VStack align="start" spacing={6} position="relative" pl={8}>
    <Box position="absolute" left="2" top="0" bottom="0" w="2px" bg="teal.300" />
    {items.map((item, index) => (
      <Box key={index} position="relative" as={motion.div} whileHover={{ scale: 1.02 }}>
        <Circle size="4" bg="teal.500" position="absolute" left="-6" top="2" />
        <Box pl={6}>
          {'institution' in item ? (
            <>
              <Text fontWeight="bold" fontSize="md">{item.degree}</Text>
              <Text color="gray.600">{item.institution}, {item.year}</Text>
            </>
          ) : (
            <>
              <Text fontWeight="bold" fontSize="md">{item.role}</Text>
              <Text color="gray.600">{item.company}, {item.startDate} - {item.endDate}</Text>
              <Text>{item.description}</Text>
            </>
          )}
        </Box>
      </Box>
    ))}
  </VStack>
);

// Modern Template
const ModernTemplate: React.FC<TemplateProps> = ({ data }) => (
  <Box
    p={6}
    borderRadius="xl"
    bg="white"
    color="black"
    minH="100vh"
    fontFamily={data.theme.fontFamily}
    boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
  >
    <Heading size="lg" mb={4} color={data.theme.primaryColor}>{data.name}</Heading>
    <Text fontSize="sm" mb={6} color="gray.600">{data.email} | {data.phone}</Text>
    {data.sectionOrder.map(section => (
      <Box key={section} mb={6}>
        {section === 'summary' && data.summary && (
          <>
            <Heading size="md" mb={3} color={data.theme.primaryColor}>{translations[data.language].summary}</Heading>
            <Text>{data.summary}</Text>
          </>
        )}
        {section === 'education' && data.education.length > 0 && (
          <>
            <Heading size="md" mb={3} color={data.theme.primaryColor}>{translations[data.language].education}</Heading>
            <Timeline items={data.education} />
          </>
        )}
        {section === 'experience' && data.experience.length > 0 && (
          <>
            <Heading size="md" mb={3} color={data.theme.primaryColor}>{translations[data.language].experience}</Heading>
            <Timeline items={data.experience} />
          </>
        )}
        {section === 'skills' && data.skills.length > 0 && (
          <>
            <Heading size="md" mb={3} color={data.theme.primaryColor}>{translations[data.language].skills}</Heading>
            <Flex wrap="wrap" gap={2}>
              {data.skills.map(skill => (
                <Badge key={skill.id} p={2} bg="teal.100" color="teal.800" borderRadius="full">{skill.name}</Badge>
              ))}
            </Flex>
          </>
        )}
      </Box>
    ))}
  </Box>
);

// Professional Template
const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => (
  <Box
    p={8}
    border="2px solid"
    borderColor="gray.200"
    bg="white"
    color="black"
    minH="100vh"
    fontFamily={data.theme.fontFamily}
    boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
  >
    <Heading size="xl" textAlign="center" mb={6} color={data.theme.primaryColor}>{data.name}</Heading>
    <Text textAlign="center" fontSize="md" mb={8} color="gray.600">{data.email} | {data.phone}</Text>
    {data.sectionOrder.map(section => (
      <Box key={section} mb={8}>
        {section === 'summary' && data.summary && (
          <>
            <Heading size="md" borderBottom="2px solid" borderColor={data.theme.primaryColor} mb={3}>{translations[data.language].summary}</Heading>
            <Text>{data.summary}</Text>
          </>
        )}
        {section === 'education' && data.education.length > 0 && (
          <>
            <Heading size="md" borderBottom="2px solid" borderColor={data.theme.primaryColor} mb={3}>{translations[data.language].education}</Heading>
            {data.education.map(edu => (
              <Box key={edu.id} mb={4}>
                <Text fontWeight="bold" fontSize="md">{edu.degree}</Text>
                <Text color="gray.600">{edu.institution} | {edu.year}</Text>
              </Box>
            ))}
          </>
        )}
        {section === 'experience' && data.experience.length > 0 && (
          <>
            <Heading size="md" borderBottom="2px solid" borderColor={data.theme.primaryColor} mb={3}>{translations[data.language].experience}</Heading>
            {data.experience.map(exp => (
              <Box key={exp.id} mb={4}>
                <Text fontWeight="bold" fontSize="md">{exp.role}</Text>
                <Text color="gray.600">{exp.company} | {exp.startDate} - {exp.endDate}</Text>
                <Text>{exp.description}</Text>
              </Box>
            ))}
          </>
        )}
        {section === 'skills' && data.skills.length > 0 && (
          <>
            <Heading size="md" borderBottom="2px solid" borderColor={data.theme.primaryColor} mb={3}>{translations[data.language].skills}</Heading>
            <Text>{data.skills.map(skill => skill.name).join(', ')}</Text>
          </>
        )}
      </Box>
    ))}
  </Box>
);

// Creative Template
const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => (
  <Box
    p={6}
    bgGradient="linear(to-br, teal.100, purple.200)"
    color="black"
    minH="100vh"
    fontFamily={data.theme.fontFamily}
    boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
  >
    <Heading size="2xl" color={data.theme.primaryColor} mb={6}>{data.name}</Heading>
    <Text fontSize="md" mb={8} color="gray.700">{data.email} | {data.phone}</Text>
    {data.sectionOrder.map(section => (
      <Box key={section} mb={6} p={4} bg="whiteAlpha.900" borderRadius="xl">
        {section === 'summary' && data.summary && (
          <>
            <Heading size="md" color={data.theme.primaryColor} mb={3}>{translations[data.language].summary}</Heading>
            <Text>{data.summary}</Text>
          </>
        )}
        {section === 'education' && data.education.length > 0 && (
          <>
            <Heading size="md" color={data.theme.primaryColor} mb={3}>{translations[data.language].education}</Heading>
            <Timeline items={data.education} />
          </>
        )}
        {section === 'experience' && data.experience.length > 0 && (
          <>
            <Heading size="md" color={data.theme.primaryColor} mb={3}>{translations[data.language].experience}</Heading>
            <Timeline items={data.experience} />
          </>
        )}
        {section === 'skills' && data.skills.length > 0 && (
          <>
            <Heading size="md" color={data.theme.primaryColor} mb={3}>{translations[data.language].skills}</Heading>
            <Flex wrap="wrap" gap={2}>
              {data.skills.map(skill => (
                <Badge key={skill.id} p={2} bg="teal.100" color="teal.800" borderRadius="full">{skill.name}</Badge>
              ))}
            </Flex>
          </>
        )}
      </Box>
    ))}
  </Box>
);

// AI Assistant Component
const AIAssistant: React.FC<{ jobRole: string; applySuggestions: () => void }> = ({ jobRole, applySuggestions }) => (
  <Box
    position="fixed"
    bottom="4"
    right="4"
    p={3}
    bg="teal.500"
    color="white"
    borderRadius="full"
    boxShadow="lg"
    as={motion.div}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <Tooltip label="Get AI-powered suggestions!" placement="left">
      <Button size="sm" variant="ghost" color="white" onClick={applySuggestions}>
        AI Tip: {jobRole ? `Optimize for ${jobRole}` : 'Enter a job role for tips'}
      </Button>
    </Tooltip>
  </Box>
);

const ResumeBuilder: React.FC = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOnboardingOpen, onOpen: onOnboardingOpen, onClose: onOnboardingClose } = useDisclosure();
  const [resumeData, setResumeData] = useState<ResumeData>({
    id: uuidv4(),
    name: '',
    email: '',
    phone: '',
    summary: '',
    education: [{ id: uuidv4(), institution: '', degree: '', year: '' }],
    experience: [{ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' }],
    skills: [{ id: uuidv4(), name: '' }],
    sectionOrder: ['summary', 'education', 'experience', 'skills'],
    language: 'en',
    theme: { primaryColor: 'teal.500', fontFamily: 'Arial, sans-serif' },
  });
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [template, setTemplate] = useState<'modern' | 'professional' | 'creative'>('modern');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    personal: false,
    education: false,
    experience: false,
    skills: false,
    settings: false,
  });
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [atsScore, setAtsScore] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [jobRole, setJobRole] = useState<string>('');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  // Onboarding and badges
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      onOnboardingOpen();
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    const newBadges = [];
    if (resumeData.name && resumeData.email && resumeData.phone) newBadges.push('Contact Info Complete');
    if (resumeData.summary) newBadges.push('Summary Added');
    if (resumeData.education.length > 0) newBadges.push('Education Added');
    if (resumeData.experience.length > 0) newBadges.push('Experience Added');
    if (resumeData.skills.length >= 3) newBadges.push('Skills Complete');
    setBadges(newBadges);
  }, [resumeData, onOnboardingOpen]);

  // Load saved resumes and auto-save
  useEffect(() => {
    const stored = localStorage.getItem('resumes');
    if (stored) setSavedResumes(JSON.parse(stored));
    const autoSave = setInterval(() => {
      if (resumeData.name || resumeData.email || resumeData.summary) saveResume(true);
    }, 30000);
    return () => clearInterval(autoSave);
  }, [resumeData]);

  // Update ATS score
  useEffect(() => {
    setAtsScore(calculateATSScore(resumeData));
  }, [resumeData]);

  // Save resume
  const saveResume = (isAutoSave: boolean = false) => {
    const newResume: SavedResume = {
      id: resumeData.id,
      name: resumeData.name || 'Untitled Resume',
      timestamp: new Date().toISOString(),
    };
    const updatedResumes = [...savedResumes.filter(r => r.id !== resumeData.id), newResume];
    setSavedResumes(updatedResumes);
    localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    localStorage.setItem(resumeData.id, JSON.stringify(resumeData));
    if (!isAutoSave) {
      toast({
        title: 'Resume Saved',
        description: 'Your resume has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Load resume
  const loadResume = (id: string) => {
    const stored = localStorage.getItem(id);
    if (stored) {
      setResumeData(JSON.parse(stored));
      onClose();
      toast({
        title: 'Resume Loaded',
        description: 'Your resume has been loaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Delete resume
  const deleteResume = (id: string) => {
    const updatedResumes = savedResumes.filter(r => r.id !== id);
    setSavedResumes(updatedResumes);
    localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    localStorage.removeItem(id);
    toast({
      title: 'Resume Deleted',
      description: 'Your resume has been deleted.',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Export JSON
  const exportJson = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.name || 'resume'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'JSON Exported',
      description: 'Your resume has been exported as JSON.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Export DOCX
  const exportDocx = async () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun({ text: resumeData.name, bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun(`${resumeData.email} | ${resumeData.phone}`)] }),
          ...resumeData.sectionOrder.flatMap(section => {
            if (section === 'summary' && resumeData.summary) {
              return [
                new Paragraph({ children: [new TextRun({ text: translations[resumeData.language].summary, bold: true, size: 16 })] }),
                new Paragraph({ children: [new TextRun(resumeData.summary)] }),
              ];
            }
            if (section === 'education' && resumeData.education.length > 0) {
              return [
                new Paragraph({ children: [new TextRun({ text: translations[resumeData.language].education, bold: true, size: 16 })] }),
                ...resumeData.education.flatMap(edu => [
                  new Paragraph({ children: [new TextRun({ text: edu.degree, bold: true })] }),
                  new Paragraph({ children: [new TextRun(`${edu.institution}, ${edu.year}`)] }),
                ]),
              ];
            }
            if (section === 'experience' && resumeData.experience.length > 0) {
              return [
                new Paragraph({ children: [new TextRun({ text: translations[resumeData.language].experience, bold: true, size: 16 })] }),
                ...resumeData.experience.flatMap(exp => [
                  new Paragraph({ children: [new TextRun({ text: exp.role, bold: true })] }),
                  new Paragraph({ children: [new TextRun(`${exp.company}, ${exp.startDate} - ${exp.endDate}`)] }),
                  new Paragraph({ children: [new TextRun(exp.description)] }),
                ]),
              ];
            }
            if (section === 'skills' && resumeData.skills.length > 0) {
              return [
                new Paragraph({ children: [new TextRun({ text: translations[resumeData.language].skills, bold: true, size: 16 })] }),
                new Paragraph({ children: [new TextRun(resumeData.skills.map(s => s.name).join(', '))] }),
              ];
            }
            return [];
          }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${resumeData.name || 'resume'}.docx`);
    toast({
      title: 'DOCX Exported',
      description: 'Your resume has been exported as a Word document.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    const updatedEducation = resumeData.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setResumeData(prev => ({ ...prev, education: updatedEducation }));
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    const updatedExperience = resumeData.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setResumeData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const handleSkillChange = (id: string, value: string) => {
    const updatedSkills = resumeData.skills.map(skill =>
      skill.id === id ? { ...skill, name: value } : skill
    );
    setResumeData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: uuidv4(), institution: '', degree: '', year: '' }],
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' }],
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: uuidv4(), name: '' }],
    }));
  };

  const resetForm = () => {
    setResumeData({
      id: uuidv4(),
      name: '',
      email: '',
      phone: '',
      summary: '',
      education: [{ id: uuidv4(), institution: '', degree: '', year: '' }],
      experience: [{ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' }],
      skills: [{ id: uuidv4(), name: '' }],
      sectionOrder: ['summary', 'education', 'experience', 'skills'],
      language: 'en',
      theme: { primaryColor: 'teal.500', fontFamily: 'Arial, sans-serif' },
    });
  };

  const toggleSectionCollapse = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (type === 'SECTION') {
      const newOrder = [...resumeData.sectionOrder];
      const [reorderedItem] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, reorderedItem);
      setResumeData(prev => ({ ...prev, sectionOrder: newOrder }));
    } else if (type === 'EDUCATION') {
      const newEducation = [...resumeData.education];
      const [reorderedItem] = newEducation.splice(source.index, 1);
      newEducation.splice(destination.index, 0, reorderedItem);
      setResumeData(prev => ({ ...prev, education: newEducation }));
    } else if (type === 'EXPERIENCE') {
      const newExperience = [...resumeData.experience];
      const [reorderedItem] = newExperience.splice(source.index, 1);
      newExperience.splice(destination.index, 0, reorderedItem);
      setResumeData(prev => ({ ...prev, experience: newExperience }));
    } else if (type === 'SKILLS') {
      const newSkills = [...resumeData.skills];
      const [reorderedItem] = newSkills.splice(source.index, 1);
      newSkills.splice(destination.index, 0, reorderedItem);
      setResumeData(prev => ({ ...prev, skills: newSkills }));
    }
  };

  const handlePrint = useReactToPrint({
    documentTitle: resumeData.name || 'Resume',
    onAfterPrint: () => toast({
      title: 'PDF Generated',
      description: 'Your resume has been downloaded as a PDF.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    }),
    contentRef: printRef,
  });

  const applyAISuggestions = () => {
    setResumeData(prev => ({
      ...prev,
      summary: aiSuggestions.summary(jobRole || 'professional'),
      experience: prev.experience.map(exp => ({
        ...exp,
        description: aiSuggestions.experience(jobRole || 'professional'),
      })),
      skills: aiSuggestions.skills.map(name => ({ id: uuidv4(), name })),
    }));
    toast({
      title: 'AI Suggestions Applied',
      description: 'Mock AI suggestions applied. For real AI, use xAI API: https://x.ai/api',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const addCollaborator = () => {
    const collaborator = prompt('Enter collaborator email:');
    if (collaborator) {
      setCollaborators(prev => [...prev, collaborator]);
      toast({
        title: 'Collaborator Added',
        description: `${collaborator} can now view/edit this resume (mock).`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleVoiceInput = (field: string, sectionId?: string) => {
    const input = prompt(`Enter ${field} via voice (mock):`);
    if (!input) return;
    if (sectionId) {
      if (field.includes('education')) {
        handleEducationChange(sectionId, field.split('.')[1] as keyof Education, input);
      } else if (field.includes('experience')) {
        handleExperienceChange(sectionId, field.split('.')[1] as keyof Experience, input);
      } else if (field.includes('skills')) {
        handleSkillChange(sectionId, input);
      }
    } else {
      handleInputChange(field as keyof ResumeData, input);
    }
  };

  // Drag-to-resize logic
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newWidth = Math.min(Math.max(e.clientX, 300), 600);
      setSidebarWidth(newWidth);
    }
  };

  return (
    <Container maxW="100vw" p={0} bgGradient="linear(to-br, teal.50, purple.50)" minH="100vh" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <Flex direction={{ base: 'column', md: 'row' }} minH="100vh">
        {/* Sidebar */}
        <Box
          as={motion.div}
          w={{ base: '100%', md: `${sidebarWidth}px` }}
          bg="whiteAlpha.900"
          backdropFilter="blur(12px)"
          borderRadius={{ base: 'none', md: 'xl' }}
          p={6}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
          maxH="100vh"
          overflowY="auto"
          position={{ md: 'sticky' }}
          top="0"
        >
          <Heading size="lg" mb={4} color="teal.600">{translations[resumeData.language].resumeBuilder}</Heading>
          <VStack spacing={4} align="stretch">
            {/* Progress Dashboard */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex align="center" gap={2} mb={2}>
                <Text fontWeight="bold">Resume Quest</Text>
                <Tooltip label="Earn badges by completing sections!" placement="top">
                  <InfoOutlineIcon />
                </Tooltip>
              </Flex>
              <Progress value={atsScore.score} colorScheme="teal" size="sm" borderRadius="md" />
              <Text fontSize="sm" mt={1} color={atsScore.score > 80 ? 'green.500' : 'orange.500'}>
                {atsScore.score}% Complete
              </Text>
              <Flex wrap="wrap" gap={2} mt={2}>
                {badges.map(badge => (
                  <Badge key={badge} colorScheme="green" borderRadius="full">{badge}</Badge>
                ))}
              </Flex>
            </Box>
            {/* Action Buttons */}
            <HStack wrap="wrap" spacing={2}>
              <Button size="sm" colorScheme="blue" onClick={onOpen}>Load</Button>
              <Button size="sm" colorScheme="green" onClick={() => saveResume()}>Save</Button>
              <Button size="sm" colorScheme="gray" onClick={resetForm}>New</Button>
              <Button size="sm" colorScheme="purple" onClick={exportJson}>JSON</Button>
              <Button size="sm" colorScheme="orange" onClick={exportDocx}>DOCX</Button>
              <Button size="sm" colorScheme="teal" leftIcon={<DownloadIcon />} onClick={handlePrint}>PDF</Button>
            </HStack>
            {/* Personal Info Card */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm">Personal Info</Heading>
                <IconButton
                  size="sm"
                  aria-label="Toggle personal"
                  icon={collapsedSections.personal ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleSectionCollapse('personal')}
                />
              </Flex>
              <AnimatePresence>
                {!collapsedSections.personal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VStack spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Target Job Role</FormLabel>
                        <HStack>
                          <Input
                            size="sm"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            borderRadius="md"
                            _hover={{ borderColor: 'teal.300' }}
                          />
                          <Tooltip label="Use voice input" placement="top">
                            <IconButton
                              size="sm"
                              aria-label="Voice input job role"
                              icon={<MinusIcon />}
                              onClick={() => handleVoiceInput('jobRole')}
                            />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Name</FormLabel>
                        <HStack>
                          <Input
                            size="sm"
                            value={resumeData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="John Doe"
                            borderRadius="md"
                            _hover={{ borderColor: 'teal.300' }}
                            borderColor={resumeData.name ? 'green.300' : 'red.300'}
                          />
                          <Tooltip label="Use voice input" placement="top">
                            <IconButton
                              size="sm"
                              aria-label="Voice input name"
                              icon={<MinusIcon />}
                              onClick={() => handleVoiceInput('name')}
                            />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Email</FormLabel>
                        <HStack>
                          <Input
                            size="sm"
                            value={resumeData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john.doe@example.com"
                            borderRadius="md"
                            _hover={{ borderColor: 'teal.300' }}
                            borderColor={resumeData.email ? 'green.300' : 'red.300'}
                          />
                          <Tooltip label="Use voice input" placement="top">
                            <IconButton
                              size="sm"
                              aria-label="Voice input email"
                              icon={<MinusIcon />}
                              onClick={() => handleVoiceInput('email')}
                            />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Phone</FormLabel>
                        <HStack>
                          <Input
                            size="sm"
                            value={resumeData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="123-456-7890"
                            borderRadius="md"
                            _hover={{ borderColor: 'teal.300' }}
                            borderColor={resumeData.phone ? 'green.300' : 'red.300'}
                          />
                          <Tooltip label="Use voice input" placement="top">
                            <IconButton
                              size="sm"
                              aria-label="Voice input phone"
                              icon={<MinusIcon />}
                              onClick={() => handleVoiceInput('phone')}
                            />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Summary</FormLabel>
                        <HStack>
                          <Textarea
                            size="sm"
                            value={resumeData.summary}
                            onChange={(e) => handleInputChange('summary', e.target.value)}
                            placeholder="Tell your story..."
                            borderRadius="md"
                            _hover={{ borderColor: 'teal.300' }}
                            borderColor={resumeData.summary ? 'green.300' : 'red.300'}
                          />
                          <Tooltip label="Use voice input" placement="top">
                            <IconButton
                              size="sm"
                              aria-label="Voice input summary"
                              icon={<MinusIcon />}
                              onClick={() => handleVoiceInput('summary')}
                            />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                      <Button size="sm" colorScheme="yellow" onClick={addCollaborator}>Add Collaborator</Button>
                      {collaborators.length > 0 && (
                        <Text fontSize="sm">Collaborators: {collaborators.join(', ')}</Text>
                      )}
                    </VStack>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            {/* Education Card */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm">Education</Heading>
                <IconButton
                  size="sm"
                  aria-label="Toggle education"
                  icon={collapsedSections.education ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleSectionCollapse('education')}
                />
              </Flex>
              <AnimatePresence>
                {!collapsedSections.education && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="education" type="EDUCATION">
                        {(provided) => (
                          <VStack {...provided.droppableProps} ref={provided.innerRef} spacing={3}>
                            {resumeData.education.map((edu, index) => (
                              <Draggable key={edu.id} draggableId={edu.id} index={index}>
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    p={3}
                                    bg="whiteAlpha.900"
                                    borderRadius="md"
                                    boxShadow="sm"
                                    w="full"
                                    _hover={{ bg: 'teal.50' }}
                                    as={motion.div}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <VStack spacing={2}>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Institution"
                                          value={edu.institution}
                                          onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={edu.institution ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input institution"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('education.institution', edu.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Degree"
                                          value={edu.degree}
                                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={edu.degree ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input degree"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('education.degree', edu.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Year"
                                          value={edu.year}
                                          onChange={(e) => handleEducationChange(edu.id, 'year', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={edu.year ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input year"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('education.year', edu.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </VStack>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button size="sm" mt={3} onClick={addEducation} variant="outline">Add Education</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            {/* Experience Card */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm">Experience</Heading>
                <IconButton
                  size="sm"
                  aria-label="Toggle experience"
                  icon={collapsedSections.experience ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleSectionCollapse('experience')}
                />
              </Flex>
              <AnimatePresence>
                {!collapsedSections.experience && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="experience" type="EXPERIENCE">
                        {(provided) => (
                          <VStack {...provided.droppableProps} ref={provided.innerRef} spacing={3}>
                            {resumeData.experience.map((exp, index) => (
                              <Draggable key={exp.id} draggableId={exp.id} index={index}>
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    p={3}
                                    bg="whiteAlpha.900"
                                    borderRadius="md"
                                    boxShadow="sm"
                                    w="full"
                                    _hover={{ bg: 'teal.50' }}
                                    as={motion.div}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <VStack spacing={2}>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Company"
                                          value={exp.company}
                                          onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={exp.company ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input company"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('experience.company', exp.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Role"
                                          value={exp.role}
                                          onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={exp.role ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input role"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('experience.role', exp.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="Start Date"
                                          value={exp.startDate}
                                          onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={exp.startDate ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input start date"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('experience.startDate', exp.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Input
                                          size="sm"
                                          placeholder="End Date"
                                          value={exp.endDate}
                                          onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={exp.endDate ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input end date"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('experience.endDate', exp.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack>
                                        <Textarea
                                          size="sm"
                                          placeholder="Description"
                                          value={exp.description}
                                          onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                          borderRadius="md"
                                          _hover={{ borderColor: 'teal.300' }}
                                          borderColor={exp.description ? 'green.300' : 'red.300'}
                                        />
                                        <Tooltip label="Use voice input" placement="top">
                                          <IconButton
                                            size="sm"
                                            aria-label="Voice input description"
                                            icon={<MinusIcon />}
                                            onClick={() => handleVoiceInput('experience.description', exp.id)}
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </VStack>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button size="sm" mt={3} onClick={addExperience} variant="outline">Add Experience</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            {/* Skills Card */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm">Skills</Heading>
                <IconButton
                  size="sm"
                  aria-label="Toggle skills"
                  icon={collapsedSections.skills ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleSectionCollapse('skills')}
                />
              </Flex>
              <AnimatePresence>
                {!collapsedSections.skills && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="skills" type="SKILLS">
                        {(provided) => (
                          <VStack {...provided.droppableProps} ref={provided.innerRef} spacing={2}>
                            {resumeData.skills.map((skill, index) => (
                              <Draggable key={skill.id} draggableId={skill.id} index={index}>
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    w="full"
                                    as={motion.div}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <HStack>
                                      <Input
                                        size="sm"
                                        placeholder="Skill"
                                        value={skill.name}
                                        onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                                        borderRadius="md"
                                        _hover={{ borderColor: 'teal.300' }}
                                        borderColor={skill.name ? 'green.300' : 'red.300'}
                                      />
                                      <Tooltip label="Use voice input" placement="top">
                                        <IconButton
                                          size="sm"
                                          aria-label="Voice input skill"
                                          icon={<MinusIcon />}
                                          onClick={() => handleVoiceInput('skills.name', skill.id)}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </VStack>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button size="sm" mt={3} onClick={addSkill} variant="outline">Add Skill</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            {/* Settings Card */}
            <Box p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm">Settings</Heading>
                <IconButton
                  size="sm"
                  aria-label="Toggle settings"
                  icon={collapsedSections.settings ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleSectionCollapse('settings')}
                />
              </Flex>
              <AnimatePresence>
                {!collapsedSections.settings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VStack spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Primary Color</FormLabel>
                        <Select
                          size="sm"
                          value={resumeData.theme.primaryColor}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: e.target.value },
                          }))}
                          borderRadius="md"
                        >
                          <option value="teal.500">Teal</option>
                          <option value="blue.500">Blue</option>
                          <option value="purple.500">Purple</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Font Family</FormLabel>
                        <Select
                          size="sm"
                          value={resumeData.theme.fontFamily}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            theme: { ...prev.theme, fontFamily: e.target.value },
                          }))}
                          borderRadius="md"
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Times New Roman, serif">Times New Roman</option>
                          <option value="Helvetica, sans-serif">Helvetica</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Language</FormLabel>
                        <Select
                          size="sm"
                          value={resumeData.language}
                          onChange={(e) => setResumeData(prev => ({ ...prev, language: e.target.value as 'en' | 'es' | 'fr' }))}
                          borderRadius="md"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </Select>
                      </FormControl>
                      <Box w="full">
                        <Heading size="sm" mb={2}>Section Order</Heading>
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="sections" type="SECTION">
                            {(provided) => (
                              <VStack {...provided.droppableProps} ref={provided.innerRef} spacing={2}>
                                {resumeData.sectionOrder.map((section, index) => (
                                  <Draggable key={section} draggableId={section} index={index}>
                                    {(provided) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        p={2}
                                        bg="whiteAlpha.900"
                                        borderRadius="md"
                                        w="full"
                                        _hover={{ bg: 'teal.50' }}
                                        as={motion.div}
                                        whileHover={{ scale: 1.02 }}
                                      >
                                        {section.charAt(0).toUpperCase() + section.slice(1)}
                                      </Box>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </VStack>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </Box>
                      <FormControl>
                        <FormLabel fontSize="sm">Template</FormLabel>
                        <Select
                          size="sm"
                          value={template}
                          onChange={(e) => setTemplate(e.target.value as 'modern' | 'professional' | 'creative')}
                          borderRadius="md"
                        >
                          <option value="modern">Modern</option>
                          <option value="professional">Professional</option>
                          <option value="creative">Creative</option>
                        </Select>
                      </FormControl>
                      <Box w="full" p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" mb={2}>Theme Preview</Text>
                        <Box p={2} bg="white" borderRadius="md" fontFamily={resumeData.theme.fontFamily}>
                          <Text color={resumeData.theme.primaryColor}>Sample Text</Text>
                        </Box>
                      </Box>
                    </VStack>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </VStack>
        </Box>
        {/* Resize Divider */}
        <Box
          w="4px"
          bg="teal.200"
          cursor="col-resize"
          onMouseDown={handleMouseDown}
          display={{ base: 'none', md: 'block' }}
        />
        {/* Preview */}
        <Box
          flex="1"
          p={4}
          maxH="100vh"
          overflowY="auto"
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        //   transition={{ duration: 0.5 }}
        >
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
            <Box ref={printRef}>
              {template === 'modern' ? (
                <ModernTemplate data={resumeData} />
              ) : template === 'professional' ? (
                <ProfessionalTemplate data={resumeData} />
              ) : (
                <CreativeTemplate data={resumeData} />
              )}
            </Box>
          </Tilt>
        </Box>
      </Flex>
      {/* AI Assistant */}
      <AIAssistant jobRole={jobRole} applySuggestions={applyAISuggestions} />
      {/* Load Resume Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" bg="whiteAlpha.900" backdropFilter="blur(12px)">
          <ModalHeader>Saved Resumes</ModalHeader>
          <ModalBody>
            {savedResumes.length === 0 ? (
              <Text>No saved resumes found.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {savedResumes.map(resume => (
                  <Flex key={resume.id} justify="space-between" align="center" p={2} bg="whiteAlpha.800" borderRadius="md">
                    <Box>
                      <Text fontWeight="bold">{resume.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Saved: {new Date(resume.timestamp).toLocaleString()}
                      </Text>
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<ViewIcon />}
                        onClick={() => loadResume(resume.id)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<DeleteIcon />}
                        onClick={() => deleteResume(resume.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Onboarding Modal */}
      <Modal isOpen={isOnboardingOpen} onClose={onOnboardingClose}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" bg="whiteAlpha.900" backdropFilter="blur(12px)">
          <ModalHeader>Welcome to Resume Quest!</ModalHeader>
          <ModalBody>
            {onboardingStep === 0 && (
              <Text>Start your journey by filling in your personal details. Earn badges as you go!</Text>
            )}
            {onboardingStep === 1 && (
              <Text>Add your education and experience to unlock more badges and boost your ATS score.</Text>
            )}
            {onboardingStep === 2 && (
              <Text>Customize your resume’s look and feel in the Settings card. Ready to shine?</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={() => {
                if (onboardingStep < 2) setOnboardingStep(prev => prev + 1);
                else onOnboardingClose();
              }}
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {onboardingStep < 2 ? 'Next' : 'Start Building'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ResumeBuilder;
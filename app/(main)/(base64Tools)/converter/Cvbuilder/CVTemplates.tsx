"use client";
import React from 'react';
import {
  Box, Flex, Heading, Text, VStack, HStack, SimpleGrid, Divider,
  Progress, Badge, Image, Circle, Grid, GridItem, Icon,
} from '@chakra-ui/react';
import {
  Mail, Phone, MapPin, BookOpen, Briefcase,
  Zap, User, Languages
} from 'lucide-react';

// ─────────────────────────────────────────────
// Shared helper: renders sections in drag order
// ─────────────────────────────────────────────
const renderOrdered = (
  sectionOrder: string[],
  map: Record<string, React.ReactNode>
) =>
  sectionOrder
    .filter((id) => map[id])
    .map((id) => <React.Fragment key={id}>{map[id]}</React.Fragment>);

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────
const SectionHeading = ({ title, color, icon: IconComp }: any) => (
  <HStack spacing={2} mb={4} borderBottom="2px solid" borderColor="gray.100" pb={2}>
    {IconComp && <IconComp size={18} color={color} />}
    <Heading size="sm" color={color} textTransform="uppercase" letterSpacing="2px">
      {title}
    </Heading>
  </HStack>
);

// ─────────────────────────────────────────────
// 1. EXECUTIVE
// ─────────────────────────────────────────────
export const ExecutiveTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const mainSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <SectionHeading title="Summary" color={data.themeColor} />
        <Text fontSize="sm" lineHeight="1.8" color="gray.700" textAlign="justify">
          {data.summary}
        </Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <SectionHeading title="Professional Experience" color={data.themeColor} icon={Briefcase} />
        {data.experiences.map((exp: any, i: number) => (
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
      <Box key="achievements">
        <SectionHeading title="Achievements" color={data.themeColor} />
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={3} pl={4} borderLeft="2px solid" borderColor="gray.100">
            <Text fontWeight="700" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
    custom: (
      <Box key="custom">
        {data.customEntries.map((entry: any, i: number) => (
          <Box key={i} mb={3}>
            <Text fontWeight="700" fontSize="xs" color={data.themeColor} textTransform="uppercase">{entry.key}</Text>
            <Text fontSize="xs" color="gray.600">{entry.value}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const sideSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills">
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
    ),
    languages: (
      <Box key="languages">
        <SectionHeading title="Languages" color={data.themeColor} icon={Languages} />
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Badge fontSize="9px" colorScheme="gray">{l.level}</Badge>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box key="education">
        <SectionHeading title="Education" color={data.themeColor} icon={BookOpen} />
        {data.educations.map((edu: any, i: number) => (
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
          <Image src={data.profileImg} boxSize="140px" borderRadius="2xl" objectFit="cover"
            border="6px solid" borderColor="gray.50" shadow="sm" />
        )}
      </Flex>

      <SimpleGrid columns={3} spacing={10}>
        <Box gridColumn="span 2">
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, mainSections)}
          </VStack>
        </Box>
        <Box>
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, sideSections)}
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

// ─────────────────────────────────────────────
// 2. MINIMALIST
// ─────────────────────────────────────────────
export const MinimalistTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const leftSections: Record<string, React.ReactNode> = {
    experience: (
      <Box key="experience">
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERIENCE</Heading>
        {data.experiences.map((exp: any, i: number) => (
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
      <Box key="achievements">
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">ACHIEVEMENTS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const rightSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills">
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EXPERTISE</Heading>
        <SimpleGrid columns={2} spacing={3}>
          {data.skills.map((s: any, i: number) => (
            <Badge key={i} variant="outline" p={2} fontSize="9px" borderRadius="0" fontWeight="400" textAlign="center">
              {s.name}
            </Badge>
          ))}
        </SimpleGrid>
      </Box>
    ),
    languages: (
      <Box key="languages">
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Text fontSize="xs" color="gray.500">{l.level}</Text>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box key="education">
        <Heading size="xs" mb={6} letterSpacing="3px" color="gray.400">EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
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
        <Heading size="2xl" fontWeight="200" letterSpacing="8px" textTransform="uppercase">
          {data.fullName}
        </Heading>
        <HStack spacing={6} color="gray.500" fontSize="xs" letterSpacing="1px">
          <Text>{data.email}</Text>
          <Circle size="4px" bg="gray.300" />
          <Text>{data.phone}</Text>
          <Circle size="4px" bg="gray.300" />
          <Text>{data.location}</Text>
        </HStack>
        <Divider w="100px" borderColor={data.themeColor} borderBottomWidth="2px" />
        <Text fontSize="md" color={data.themeColor} fontWeight="bold" textTransform="uppercase" letterSpacing="4px">
          {data.role}
        </Text>
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
          {renderOrdered(sectionOrder, leftSections)}
        </VStack>
        <VStack align="stretch" spacing={10}>
          {renderOrdered(sectionOrder, rightSections)}
        </VStack>
      </SimpleGrid>
    </VStack>
  );
};

// ─────────────────────────────────────────────
// 3. TECH SIDEBAR
// ─────────────────────────────────────────────
export const TechSidebarTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const mainSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Profile</Heading>
        <Text fontSize="sm" color="gray.600" lineHeight="1.8">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Experience</Heading>
        {data.experiences.map((exp: any, i: number) => (
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
      <Box key="education">
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
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="md" mb={6} color="gray.800" borderLeft="4px solid" borderColor="blue.500" pl={4}>Achievements</Heading>
        {data.achievements.map((a: any, i: number) => (
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
            <Image src={data.profileImg} boxSize="160px" borderRadius="full"
              border="4px solid" borderColor="blue.500" p={1} />
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
            )}
            {sectionOrder.includes('languages') && (
              <Box>
                <Text fontSize="10px" color="blue.400" fontWeight="bold" mb={3} letterSpacing="2px">LANGUAGES</Text>
                {data.languages.map((l: any, i: number) => (
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
          {renderOrdered(sectionOrder, mainSections)}
        </VStack>
      </Box>
    </Flex>
  );
};

// ─────────────────────────────────────────────
// 4. CREATIVE BOLD
// ─────────────────────────────────────────────
export const CreativeBoldTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const leftSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills" bg="gray.50" p={6} borderRadius="2xl" shadow="xl">
        <Heading size="sm" mb={4} color={data.themeColor}>EXPERTISE</Heading>
        <Flex wrap="wrap" gap={2}>
          {data.skills.map((s: any, i: number) => (
            <Badge key={i} colorScheme="blackAlpha" variant="solid" px={3} py={1} borderRadius="full" fontSize="10px">
              {s.name}
            </Badge>
          ))}
        </Flex>
      </Box>
    ),
    languages: (
      <Box key="languages" bg="gray.50" p={6} borderRadius="2xl">
        <Heading size="sm" mb={4} color={data.themeColor}>LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Badge fontSize="9px">{l.level}</Badge>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box key="education" p={4}>
        <Heading size="sm" mb={4} color={data.themeColor}>EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
            <Text fontSize="xs">{edu.school}</Text>
            <Text fontSize="xs" color="gray.500">{edu.year}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box key="achievements" p={4}>
        <Heading size="sm" mb={4} color={data.themeColor}>ACHIEVEMENTS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={3}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const rightSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
          <Icon as={User} boxSize={5} /> PROFILE
        </Heading>
        <Text fontSize="md" color="gray.700" lineHeight="1.8">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
          <Icon as={Briefcase} boxSize={5} /> EXPERIENCE
        </Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Box key={i} mb={8} position="relative">
            <Text fontWeight="900" fontSize="lg" color={data.themeColor}>{exp.role}</Text>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" fontSize="sm">{exp.company}</Text>
              <Text fontSize="xs" bg="gray.100" px={2} borderRadius="md">
                {exp.start} - {exp.isPresent ? 'Present' : exp.end}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="0" fontFamily={data.fontFamily} bg="white" minH="297mm">
      <Box bg={data.themeColor} color="white" p="15mm" pb="25mm"
        clipPath="polygon(0 0, 100% 0, 100% 85%, 0 100%)">
        <Flex justify="space-between" align="center">
          <VStack align="flex-start" spacing={0}>
            <Heading size="3xl" fontWeight="900" textTransform="uppercase">{data.fullName}</Heading>
            <Text fontSize="xl" letterSpacing="5px" opacity={0.9}>{data.role}</Text>
          </VStack>
          <Box textAlign="right" fontSize="sm">
            <Text fontWeight="bold">{data.location}</Text>
            <Text>{data.email}</Text>
            <Text>{data.phone}</Text>
          </Box>
        </Flex>
      </Box>

      <Grid templateColumns="repeat(12, 1fr)" gap={10} px="15mm" mt="-10mm">
        <GridItem colSpan={4}>
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, leftSections)}
          </VStack>
        </GridItem>
        <GridItem colSpan={8}>
          <VStack align="stretch" spacing={8} pt={12}>
            {renderOrdered(sectionOrder, rightSections)}
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 5. MONOLITH
// ─────────────────────────────────────────────
export const MonolithTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const mainSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Text fontSize="xl" lineHeight="1.6" fontWeight="300" fontStyle="italic">"{data.summary}"</Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <Heading size="xs" letterSpacing="3px" mb={8} color={data.themeColor}>HISTORY</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Box key={i} mb={10}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="lg" fontWeight="bold">{exp.role}</Text>
              <Text fontSize="sm" color={data.themeColor}>
                {exp.start} — {exp.isPresent ? 'Present' : exp.end}
              </Text>
            </HStack>
            <Text color="whiteAlpha.600" mb={4} fontWeight="bold" fontSize="xs" textTransform="uppercase">
              {exp.company}
            </Text>
            <Text fontSize="sm" opacity={0.8} lineHeight="1.7">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>AWARDS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" opacity={0.6}>{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const sideSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills">
        <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>CAPABILITIES</Heading>
        <VStack align="stretch" spacing={4}>
          {data.skills.map((s: any, i: number) => (
            <Box key={i}>
              <Text fontSize="xs" mb={1} fontWeight="bold">{s.name}</Text>
              <Progress value={s.level} size="xs" colorScheme="whiteAlpha" bg="whiteAlpha.100" />
            </Box>
          ))}
        </VStack>
      </Box>
    ),
    languages: (
      <Box key="languages">
        <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Text fontSize="xs" opacity={0.6}>{l.level}</Text>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box key="education">
        <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>ACADEMICS</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
            <Text fontSize="xs" opacity={0.6}>{edu.school}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="15mm" bg="#1A1A1A" color="white" minH="297mm" fontFamily={data.fontFamily}>
      <VStack spacing={10} align="stretch">
        <Flex justify="space-between" align="flex-end" borderBottom="1px solid" borderColor="whiteAlpha.300" pb={8}>
          <VStack align="flex-start" spacing={0}>
            <Heading size="4xl" fontWeight="200">
              {data.fullName.split(' ')[0]} <b>{data.fullName.split(' ').slice(1).join(' ')}</b>
            </Heading>
            <Text letterSpacing="8px" color={data.themeColor} fontWeight="bold">{data.role}</Text>
          </VStack>
          <VStack align="flex-end" spacing={1} fontSize="xs" opacity={0.7}>
            <Text>{data.email}</Text>
            <Text>{data.phone}</Text>
            <Text>{data.location}</Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={3} gap={12}>
          <GridItem colSpan={2}>
            <VStack align="stretch" spacing={12}>
              {renderOrdered(sectionOrder, mainSections)}
            </VStack>
          </GridItem>
          <GridItem colSpan={1}>
            <VStack align="stretch" spacing={12}>
              {renderOrdered(sectionOrder, sideSections)}
            </VStack>
          </GridItem>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 6. SWISS GRID
// ─────────────────────────────────────────────
export const SwissGridTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const expSection = sectionOrder.includes('experience') ? (
    <>
      {data.experiences.map((exp: any, i: number) => (
        <Box key={i} mb={10}>
          <Grid templateColumns="1fr 2fr" gap={4}>
            <Text fontWeight="900" fontSize="sm">{exp.start}—{exp.isPresent ? 'Now' : exp.end}</Text>
            <Box>
              <Text fontWeight="900" fontSize="md" textTransform="uppercase">{exp.role}</Text>
              <Text fontWeight="bold" color="gray.500" mb={4}>{exp.company}</Text>
              <Text fontSize="xs" fontWeight="500">{exp.desc}</Text>
            </Box>
          </Grid>
          <Divider mt={6} borderColor="black" />
        </Box>
      ))}
    </>
  ) : null;

  const eduSection = sectionOrder.includes('education') ? (
    <>
      {data.educations.map((edu: any, i: number) => (
        <Box key={i} mb={6}>
          <Grid templateColumns="1fr 2fr" gap={4}>
            <Text fontWeight="900" fontSize="sm">{edu.year}</Text>
            <Box>
              <Text fontWeight="900" fontSize="sm" textTransform="uppercase">{edu.degree}</Text>
              <Text fontSize="xs" color="gray.500">{edu.school}</Text>
            </Box>
          </Grid>
        </Box>
      ))}
    </>
  ) : null;

  return (
    <Box p="10mm" bg="white" color="black" fontFamily="'Inter', sans-serif">
      <Grid templateColumns="repeat(4, 1fr)" templateRows="auto" gap={0} border="2px solid black">
        <GridItem colSpan={3} p={8} borderRight="2px solid black" borderBottom="2px solid black">
          <Heading size="4xl" fontWeight="900" lineHeight="0.8" letterSpacing="-2px">{data.fullName}</Heading>
        </GridItem>
        <GridItem colSpan={1} p={8} borderBottom="2px solid black" bg="gray.50">
          <Text fontWeight="900" fontSize="xs" mb={4}>CONTACT</Text>
          <VStack align="flex-start" spacing={1} fontSize="10px" fontWeight="bold">
            <Text>{data.email}</Text>
            <Text>{data.phone}</Text>
            <Text>{data.location}</Text>
          </VStack>
        </GridItem>

        {sectionOrder.includes('summary') && (
          <>
            <GridItem colSpan={1} p={8} borderRight="2px solid black" borderBottom="2px solid black">
              <Text fontWeight="900" fontSize="xs">PROFILE</Text>
            </GridItem>
            <GridItem colSpan={3} p={8} borderBottom="2px solid black">
              <Text fontSize="sm" fontWeight="500" lineHeight="1.6">{data.summary}</Text>
            </GridItem>
          </>
        )}

        <GridItem colSpan={1} p={8} borderRight="2px solid black">
          <Text fontWeight="900" fontSize="xs" mb={4}>
            {sectionOrder.includes('experience') ? 'EXPERIENCE' : 'SECTIONS'}
          </Text>
          <VStack align="flex-start" spacing={10} mt={20}>
            {sectionOrder.includes('skills') && data.skills.map((s: any, i: number) => (
              <Text key={i} fontSize="20px" fontWeight="900" lineHeight="1">{s.name.toUpperCase()}</Text>
            ))}
          </VStack>
        </GridItem>

        <GridItem colSpan={3} p={8}>
          {expSection}
          {eduSection}
          {sectionOrder.includes('achievements') && (
            <Box mt={4}>
              <Text fontWeight="900" fontSize="xs" mb={4}>ACHIEVEMENTS</Text>
              {data.achievements.map((a: any, i: number) => (
                <Box key={i} mb={3}>
                  <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
                  <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
                </Box>
              ))}
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 7. BOTANICAL
// ─────────────────────────────────────────────
export const BotanicalTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const leftSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">THE STORY</Heading>
        <Text fontSize="sm" lineHeight="1.9" textAlign="justify">{data.summary}</Text>
      </Box>
    ),
    education: (
      <Box key="education">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Box key={i} mb={6}>
            <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
            <Text fontSize="xs" fontStyle="italic">{edu.school} / {edu.year}</Text>
          </Box>
        ))}
      </Box>
    ),
    skills: (
      <Box key="skills">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">SKILLS</Heading>
        {data.skills.map((s: any, i: number) => (
          <Box key={i} mb={3}>
            <Text fontSize="sm" fontWeight="bold">{s.name}</Text>
            <Progress value={s.level} size="xs" colorScheme="green" borderRadius="full" mt={1} />
          </Box>
        ))}
      </Box>
    ),
    languages: (
      <Box key="languages">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Text fontSize="xs" color="gray.500">{l.level}</Text>
          </HStack>
        ))}
      </Box>
    ),
  };

  const rightSections: Record<string, React.ReactNode> = {
    experience: (
      <Box key="experience">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">EXPERIENCE</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Box key={i} mb={8}>
            <Text fontWeight="bold" fontSize="sm">{exp.role}</Text>
            <Text fontSize="xs" color="gray.500" mb={2}>
              {exp.company} • {exp.start} - {exp.isPresent ? 'Present' : exp.end}
            </Text>
            <Text fontSize="xs" lineHeight="1.6">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">ACHIEVEMENTS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={5}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500" fontStyle="italic">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="15mm" bg="#FAF9F6" color="#4A4A4A" fontFamily="serif">
      <Flex direction="column" align="center" textAlign="center" mb={16}>
        <Circle size="120px" border="1px solid" borderColor={data.themeColor} mb={6} overflow="hidden">
          {data.profileImg ? (
            <Image src={data.profileImg} objectFit="cover" w="full" h="full" />
          ) : (
            <Icon as={User} boxSize={10} color={data.themeColor} />
          )}
        </Circle>
        <Heading size="2xl" fontWeight="normal" fontStyle="italic" mb={2}>{data.fullName}</Heading>
        <Text letterSpacing="4px" textTransform="uppercase" fontSize="xs" color={data.themeColor}>{data.role}</Text>
        <HStack spacing={4} mt={6} fontSize="xs" color="gray.500">
          <Text>{data.email}</Text>
          <Text>•</Text>
          <Text>{data.phone}</Text>
          <Text>•</Text>
          <Text>{data.location}</Text>
        </HStack>
      </Flex>

      <SimpleGrid columns={2} spacing={16}>
        <VStack align="stretch" spacing={12}>
          {renderOrdered(sectionOrder, leftSections)}
        </VStack>
        <VStack align="stretch" spacing={12}>
          {renderOrdered(sectionOrder, rightSections)}
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 8. STARTUP
// ─────────────────────────────────────────────
export const StartupTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const leftSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills" bg="gray.50" p={6} borderRadius="2xl">
        <Heading size="sm" mb={4}>SKILL STACK</Heading>
        <VStack align="stretch" spacing={3}>
          {data.skills.map((s: any, i: number) => (
            <Box key={i}>
              <Flex justify="space-between" fontSize="xs" mb={1} fontWeight="bold">
                <Text>{s.name}</Text>
                <Text>{s.level}%</Text>
              </Flex>
              <Progress value={s.level} colorScheme="blue" borderRadius="full" size="sm" />
            </Box>
          ))}
        </VStack>
      </Box>
    ),
    summary: (
      <Box key="summary" bg="blue.50" p={6} borderRadius="2xl">
        <Heading size="sm" mb={4} color="blue.700">MISSION</Heading>
        <Text fontSize="xs" fontWeight="bold" color="blue.600">{data.summary}</Text>
      </Box>
    ),
    languages: (
      <Box key="languages" bg="gray.50" p={6} borderRadius="2xl">
        <Heading size="sm" mb={4}>LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2} fontSize="xs">
            <Text fontWeight="bold">{l.name}</Text>
            <Badge colorScheme="blue" variant="subtle">{l.level}</Badge>
          </HStack>
        ))}
      </Box>
    ),
    education: (
      <Box key="education" bg="gray.50" p={6} borderRadius="2xl">
        <Heading size="sm" mb={4}>EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
            <Text fontSize="xs" color="gray.500">{edu.school} • {edu.year}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const rightSections: Record<string, React.ReactNode> = {
    experience: (
      <Box key="experience">
        <Heading size="md" mb={6}>WORK HISTORY</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Flex key={i} mb={8} gap={4}>
            <VStack align="center" spacing={0}>
              <Circle size="12px" bg={data.themeColor} />
              <Box w="2px" h="full" bg="gray.100" />
            </VStack>
            <Box pb={4}>
              <Text fontWeight="bold" fontSize="lg">{exp.role}</Text>
              <Text color={data.themeColor} fontWeight="bold" fontSize="sm" mb={2}>
                {exp.company} | {exp.start} - {exp.isPresent ? 'Present' : exp.end}
              </Text>
              <Text fontSize="sm" color="gray.600">{exp.desc}</Text>
            </Box>
          </Flex>
        ))}
      </Box>
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="md" mb={6}>ACHIEVEMENTS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={4} p={3} bg="gray.50" borderRadius="xl">
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="10mm" fontFamily="sans-serif">
      <Box bgGradient={`linear(to-br, ${data.themeColor}, blue.900)`} borderRadius="3xl"
        p={10} color="white" mb={10} boxShadow="2xl">
        <Flex justify="space-between" align="center">
          <VStack align="flex-start" spacing={2}>
            <Badge colorScheme="whiteAlpha" variant="solid" px={3}>AVAILABLE FOR HIRE</Badge>
            <Heading size="2xl">{data.fullName}</Heading>
            <Text fontSize="xl" opacity={0.8}>{data.role}</Text>
          </VStack>
          <VStack align="flex-end" spacing={1} fontSize="sm">
            <HStack><Text>{data.email}</Text><Mail size={14} /></HStack>
            <HStack><Text>{data.phone}</Text><Phone size={14} /></HStack>
            <HStack><Text>{data.location}</Text><MapPin size={14} /></HStack>
          </VStack>
        </Flex>
      </Box>

      <SimpleGrid columns={3} spacing={8}>
        <GridItem colSpan={1}>
          <VStack align="stretch" spacing={6}>
            {renderOrdered(sectionOrder, leftSections)}
          </VStack>
        </GridItem>
        <GridItem colSpan={2}>
          <VStack align="stretch" spacing={8}>
            {renderOrdered(sectionOrder, rightSections)}
          </VStack>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 9. ACADEMIC
// ─────────────────────────────────────────────
export const AcademicTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const allSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={3}>RESEARCH &amp; SUMMARY</Heading>
        <Text fontSize="sm" textAlign="justify">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>PROFESSIONAL APPOINTMENTS</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Grid templateColumns="150px 1fr" gap={6} key={i} mb={4}>
            <Text fontSize="sm" fontWeight="bold">
              {exp.start} — {exp.isPresent ? 'Present' : exp.end}
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="bold">{exp.role}</Text>
              <Text fontSize="sm" fontStyle="italic" mb={1}>{exp.company}</Text>
              <Text fontSize="xs">{exp.desc}</Text>
            </Box>
          </Grid>
        ))}
      </Box>
    ),
    education: (
      <Box key="education">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Grid templateColumns="150px 1fr" gap={6} key={i} mb={2}>
            <Text fontSize="sm" fontWeight="bold">{edu.year}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
              <Text fontSize="sm">{edu.school}</Text>
              <Text fontSize="xs" color="gray.500">{edu.grade}</Text>
            </Box>
          </Grid>
        ))}
      </Box>
    ),
    skills: (
      <Box key="skills">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>SKILLS &amp; COMPETENCIES</Heading>
        <Flex wrap="wrap" gap={4}>
          {data.skills.map((s: any, i: number) => (
            <Text key={i} fontSize="sm">• {s.name}</Text>
          ))}
        </Flex>
      </Box>
    ),
    languages: (
      <Box key="languages">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>LANGUAGES</Heading>
        <Flex wrap="wrap" gap={6}>
          {data.languages.map((l: any, i: number) => (
            <Text key={i} fontSize="sm"><b>{l.name}</b> — {l.level}</Text>
          ))}
        </Flex>
      </Box>
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>HONOURS &amp; AWARDS</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Grid templateColumns="150px 1fr" gap={6} key={i} mb={2}>
            <Text fontSize="sm" fontWeight="bold">{a.date}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="bold">{a.title}</Text>
              <Text fontSize="xs" fontStyle="italic">{a.issuer}</Text>
            </Box>
          </Grid>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="20mm" bg="white" color="black" fontFamily="'Times New Roman', serif">
      <VStack spacing={2} mb={10}>
        <Heading size="xl" fontWeight="normal" textTransform="uppercase" letterSpacing="2px">
          {data.fullName}
        </Heading>
        <HStack divider={<Text mx={1}>|</Text>} spacing={3} fontSize="sm">
          <Text>{data.email}</Text>
          <Text>{data.phone}</Text>
          <Text>{data.location}</Text>
        </HStack>
        <Text fontSize="sm" color="gray.600" fontStyle="italic">{data.role}</Text>
      </VStack>
      <VStack align="stretch" spacing={8}>
        {renderOrdered(sectionOrder, allSections)}
      </VStack>
    </Box>
  );
};

// ─────────────────────────────────────────────
// 10. MINIMAL CARD
// ─────────────────────────────────────────────
export const MinimalCardTemplate: React.FC<{ data: any; sectionOrder: string[] }> = ({
  data,
  sectionOrder,
}) => {
  const rightSections: Record<string, React.ReactNode> = {
    summary: (
      <Box key="summary">
        <Heading size="md" mb={4}>About Me</Heading>
        <Text color="gray.600" lineHeight="1.8">{data.summary}</Text>
      </Box>
    ),
    experience: (
      <Box key="experience">
        <Heading size="md" mb={6}>Experience</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Box key={i} mb={8}>
            <Text fontWeight="bold">{exp.role}</Text>
            <Text color={data.themeColor} fontSize="sm">
              {exp.company} / {exp.start} - {exp.isPresent ? 'Present' : exp.end}
            </Text>
            <Text mt={2} fontSize="sm" color="gray.600">{exp.desc}</Text>
          </Box>
        ))}
      </Box>
    ),
    achievements: (
      <Box key="achievements">
        <Heading size="md" mb={6}>Achievements</Heading>
        {data.achievements.map((a: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{a.title}</Text>
            <Text fontSize="xs" color="gray.500">{a.issuer} • {a.date}</Text>
          </Box>
        ))}
      </Box>
    ),
    education: (
      <Box key="education">
        <Heading size="md" mb={6}>Education</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Box key={i} mb={4}>
            <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
            <Text fontSize="xs" color="gray.500">{edu.school} • {edu.year}</Text>
          </Box>
        ))}
      </Box>
    ),
  };

  const leftSections: Record<string, React.ReactNode> = {
    skills: (
      <Box key="skills">
        <Heading size="xs" mb={4}>SKILLS</Heading>
        <Flex wrap="wrap" gap={2}>
          {data.skills.map((s: any, i: number) => (
            <Badge key={i} variant="subtle" colorScheme="blue">{s.name}</Badge>
          ))}
        </Flex>
      </Box>
    ),
    languages: (
      <Box key="languages">
        <Heading size="xs" mb={4}>LANGUAGES</Heading>
        {data.languages.map((l: any, i: number) => (
          <HStack key={i} justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="bold">{l.name}</Text>
            <Text fontSize="xs" color="gray.500">{l.level}</Text>
          </HStack>
        ))}
      </Box>
    ),
  };

  return (
    <Box p="10mm" bg="gray.50" minH="297mm">
      <Box bg="white" shadow="2xl" borderRadius="3xl" overflow="hidden">
        <Flex h="200px">
          <Box w="40%" bg={data.themeColor} />
          <Box w="60%" bg="white" p={10}>
            <Heading size="2xl">{data.fullName}</Heading>
            <Text fontSize="xl" color="gray.500">{data.role}</Text>
          </Box>
        </Flex>

        <Box p={12} mt="-100px">
          <SimpleGrid columns={3} spacing={10}>
            <GridItem colSpan={1}>
              <VStack align="stretch" spacing={8} bg="white" p={8} shadow="lg" borderRadius="2xl">
                <Box>
                  <Heading size="xs" mb={4}>CONTACT</Heading>
                  <VStack align="stretch" spacing={2} fontSize="xs">
                    <Text>{data.email}</Text>
                    <Text>{data.phone}</Text>
                    <Text>{data.location}</Text>
                  </VStack>
                </Box>
                {renderOrdered(sectionOrder, leftSections)}
              </VStack>
            </GridItem>

            <GridItem colSpan={2}>
              <VStack align="stretch" spacing={10} pt={20}>
                {renderOrdered(sectionOrder, rightSections)}
              </VStack>
            </GridItem>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default function CVTemplates() {
  return (
    <Box p={10}>
      <Text fontSize="xl" fontWeight="bold">10 Professional CV Templates — All with drag-reorder support.</Text>
    </Box>
  );
}
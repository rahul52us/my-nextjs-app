"use client";
import React from 'react';
import {
  Box, Flex, Heading, Text, VStack, HStack, SimpleGrid, Divider, 
  Progress, Badge, Image, Circle, Grid, GridItem, Square, Icon
} from '@chakra-ui/react';
import { 
  Mail, Phone, MapPin, Globe, Award, BookOpen, Briefcase, 
  Zap, Star, User, Target, Rocket, Cpu, Languages 
} from 'lucide-react';

// --- Additional 7 Templates to complete the 10 ---

// 4. THE CREATIVE BOLD (High Impact / Design Oriented)
export const CreativeBoldTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="0" fontFamily={data.fontFamily} bg="white" minH="297mm">
    <Box bg={data.themeColor} color="white" p="15mm" pb="25mm" clipPath="polygon(0 0, 100% 0, 100% 85%, 0 100%)">
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
          <Box bg="gray.50" p={6} borderRadius="2xl" shadow="xl">
            <Heading size="sm" mb={4} color={data.themeColor}>EXPERTISE</Heading>
            <Flex wrap="wrap" gap={2}>
              {data.skills.map((s: any, i: number) => (
                <Badge key={i} colorScheme="blackAlpha" variant="solid" px={3} py={1} borderRadius="full" fontSize="10px">
                  {s.name}
                </Badge>
              ))}
            </Flex>
          </Box>
          <Box p={4}>
            <Heading size="sm" mb={4} color={data.themeColor}>EDUCATION</Heading>
            {data.educations.map((edu: any, i: number) => (
              <Box key={i} mb={4}>
                <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
                <Text fontSize="xs">{edu.school}</Text>
                <Text fontSize="xs" color="gray.500">{edu.year}</Text>
              </Box>
            ))}
          </Box>
        </VStack>
      </GridItem>
      
      <GridItem colSpan={8}>
        <VStack align="stretch" spacing={8} pt={12}>
          <Box>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              <Icon as={User} size={20} /> PROFILE
            </Heading>
            <Text fontSize="md" color="gray.700" lineHeight="1.8">{data.summary}</Text>
          </Box>
          <Box>
            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
              <Icon as={Briefcase} size={20} /> EXPERIENCE
            </Heading>
            {data.experiences.map((exp: any, i: number) => (
              <Box key={i} mb={8} position="relative">
                <Text fontWeight="900" fontSize="lg" color={data.themeColor}>{exp.role}</Text>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold" fontSize="sm">{exp.company}</Text>
                  <Text fontSize="xs" bg="gray.100" px={2} borderRadius="md">{exp.start} - {exp.end}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">{exp.desc}</Text>
              </Box>
            ))}
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  </Box>
);

// 5. THE MONOLITH (Dark, Elegant, Single Column Focus)
export const MonolithTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="15mm" bg="#1A1A1A" color="white" minH="297mm" fontFamily={data.fontFamily}>
    <VStack spacing={10} align="stretch">
      <Flex justify="space-between" align="flex-end" borderBottom="1px solid" borderColor="whiteAlpha.300" pb={8}>
        <VStack align="flex-start" spacing={0}>
          <Heading size="4xl" fontWeight="200">{data.fullName.split(' ')[0]} <b>{data.fullName.split(' ')[1]}</b></Heading>
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
            <Box>
              <Text fontSize="xl" lineHeight="1.6" fontWeight="300" fontStyle="italic">"{data.summary}"</Text>
            </Box>
            <Box>
              <Heading size="xs" letterSpacing="3px" mb={8} color={data.themeColor}>HISTORY</Heading>
              {data.experiences.map((exp: any, i: number) => (
                <Box key={i} mb={10}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="lg" fontWeight="bold">{exp.role}</Text>
                    <Text fontSize="sm" color={data.themeColor}>{exp.start} — {exp.end}</Text>
                  </HStack>
                  <Text color="whiteAlpha.600" mb={4} fontWeight="bold" fontSize="xs" textTransform="uppercase">{exp.company}</Text>
                  <Text fontSize="sm" opacity={0.8} lineHeight="1.7">{exp.desc}</Text>
                </Box>
              ))}
            </Box>
          </VStack>
        </GridItem>

        <GridItem colSpan={1}>
          <VStack align="stretch" spacing={12}>
            <Box>
              <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>CAPABILITIES</Heading>
              <VStack align="stretch" spacing={4}>
                {data.skills.map((s: any, i: number) => (
                  <Box key={i}>
                    <Text fontSize="xs" mb={1} fontWeight="bold">{s.name}</Text>
                    <Progress value={s.level} size="xxs" colorScheme="whiteAlpha" bg="whiteAlpha.100" />
                  </Box>
                ))}
              </VStack>
            </Box>
            <Box>
              <Heading size="xs" letterSpacing="3px" mb={6} color={data.themeColor}>ACADEMICS</Heading>
              {data.educations.map((edu: any, i: number) => (
                <Box key={i} mb={4}>
                  <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
                  <Text fontSize="xs" opacity={0.6}>{edu.school}</Text>
                </Box>
              ))}
            </Box>
          </VStack>
        </GridItem>
      </SimpleGrid>
    </VStack>
  </Box>
);

// 6. THE SWISS GRID (Clean, Geometric, Professional)
export const SwissGridTemplate: React.FC<{ data: any }> = ({ data }) => (
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
      <GridItem colSpan={1} p={8} borderRight="2px solid black" borderBottom="2px solid black">
        <Text fontWeight="900" fontSize="xs" mb={4}>PROFILE</Text>
      </GridItem>
      <GridItem colSpan={3} p={8} borderBottom="2px solid black">
        <Text fontSize="sm" fontWeight="500" lineHeight="1.6">{data.summary}</Text>
      </GridItem>
      <GridItem colSpan={1} p={8} borderRight="2px solid black">
        <Text fontWeight="900" fontSize="xs" mb={4}>EXPERIENCE</Text>
        <VStack align="flex-start" spacing={10} mt={20}>
           {data.skills.map((s: any, i: number) => (
             <Text key={i} fontSize="20px" fontWeight="900" lineHeight="1">{s.name.toUpperCase()}</Text>
           ))}
        </VStack>
      </GridItem>
      <GridItem colSpan={3} p={8}>
        {data.experiences.map((exp: any, i: number) => (
          <Box key={i} mb={10}>
            <Grid templateColumns="1fr 2fr" gap={4}>
              <Text fontWeight="900" fontSize="sm">{exp.start}—{exp.end}</Text>
              <Box>
                <Text fontWeight="900" fontSize="md" textTransform="uppercase">{exp.role}</Text>
                <Text fontWeight="bold" color="gray.500" mb={4}>{exp.company}</Text>
                <Text fontSize="xs" fontWeight="500">{exp.desc}</Text>
              </Box>
            </Grid>
            <Divider mt={6} borderColor="black" />
          </Box>
        ))}
      </GridItem>
    </Grid>
  </Box>
);

// 7. THE BOTANICAL (Soft, Elegant, Feminine/Modern)
export const BotanicalTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="15mm" bg="#FAF9F6" color="#4A4A4A" fontFamily="serif">
    <Flex direction="column" align="center" textAlign="center" mb={16}>
      <Circle size="120px" border="1px solid" borderColor={data.themeColor} mb={6} overflow="hidden">
        {data.profileImg ? <Image src={data.profileImg} objectFit="cover" /> : <Icon as={User} size={40} color={data.themeColor} />}
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
        <Box>
          <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">THE STORY</Heading>
          <Text fontSize="sm" lineHeight="1.9" textAlign="justify">{data.summary}</Text>
        </Box>
        <Box>
          <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">EDUCATION</Heading>
          {data.educations.map((edu: any, i: number) => (
            <Box key={i} mb={6}>
              <Text fontWeight="bold" fontSize="sm">{edu.degree}</Text>
              <Text fontSize="xs" fontStyle="italic">{edu.school} / {edu.year}</Text>
            </Box>
          ))}
        </Box>
      </VStack>

      <VStack align="stretch" spacing={12}>
        <Box>
          <Heading size="xs" mb={6} color={data.themeColor} letterSpacing="2px">EXPERIENCE</Heading>
          {data.experiences.map((exp: any, i: number) => (
            <Box key={i} mb={8}>
              <Text fontWeight="bold" fontSize="sm">{exp.role}</Text>
              <Text fontSize="xs" color="gray.500" mb={2}>{exp.company} • {exp.start} - {exp.end}</Text>
              <Text fontSize="xs" lineHeight="1.6">{exp.desc}</Text>
            </Box>
          ))}
        </Box>
      </VStack>
    </SimpleGrid>
  </Box>
);

// 8. THE STARTUP (Bold, Gradient, Fun)
export const StartupTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="10mm" fontFamily="sans-serif">
    <Box 
      bgGradient={`linear(to-br, ${data.themeColor}, blue.900)`} 
      borderRadius="3xl" 
      p={10} 
      color="white" 
      mb={10}
      boxShadow="2xl"
    >
      <Flex justify="space-between" align="center">
        <VStack align="flex-start" spacing={2}>
          <Badge colorScheme="whiteAlpha" variant="solid" px={3}>AVAILABLE FOR HIRE</Badge>
          <Heading size="2xl">{data.fullName}</Heading>
          <Text fontSize="xl" opacity={0.8}>{data.role}</Text>
        </VStack>
        <VStack align="flex-end" spacing={1} fontSize="sm">
          <HStack><Text>{data.email}</Text><Mail size={14}/></HStack>
          <HStack><Text>{data.phone}</Text><Phone size={14}/></HStack>
          <HStack><Text>{data.location}</Text><MapPin size={14}/></HStack>
        </VStack>
      </Flex>
    </Box>

    <SimpleGrid columns={3} spacing={8}>
      <GridItem colSpan={1}>
        <VStack align="stretch" spacing={6}>
          <Box bg="gray.50" p={6} borderRadius="2xl">
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
          <Box bg="blue.50" p={6} borderRadius="2xl">
            <Heading size="sm" mb={4} color="blue.700">MISSION</Heading>
            <Text fontSize="xs" fontWeight="bold" color="blue.600">{data.summary}</Text>
          </Box>
        </VStack>
      </GridItem>

      <GridItem colSpan={2}>
        <Heading size="md" mb={6}>WORK HISTORY</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Flex key={i} mb={8} gap={4}>
            <VStack align="center" spacing={0}>
              <Circle size="12px" bg={data.themeColor} />
              <Box w="2px" h="full" bg="gray.100" />
            </VStack>
            <Box pb={4}>
              <Text fontWeight="bold" fontSize="lg">{exp.role}</Text>
              <Text color={data.themeColor} fontWeight="bold" fontSize="sm" mb={2}>{exp.company} | {exp.start} - {exp.end}</Text>
              <Text fontSize="sm" color="gray.600">{exp.desc}</Text>
            </Box>
          </Flex>
        ))}
      </GridItem>
    </SimpleGrid>
  </Box>
);

// 9. THE ACADEMIC (Traditional, Text-Dense, Trustworthy)
export const AcademicTemplate: React.FC<{ data: any }> = ({ data }) => (
  <Box p="20mm" bg="white" color="black" fontFamily="'Times New Roman', serif">
    <VStack spacing={2} mb={10}>
      <Heading size="xl" fontWeight="normal" textTransform="uppercase" letterSpacing="2px">{data.fullName}</Heading>
      <HStack divider={<Text>|</Text>} spacing={3} fontSize="sm">
        <Text>{data.email}</Text>
        <Text>{data.phone}</Text>
        <Text>{data.location}</Text>
      </HStack>
    </VStack>

    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={3}>RESEARCH & SUMMARY</Heading>
        <Text fontSize="sm" textAlign="justify">{data.summary}</Text>
      </Box>

      <Box>
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>PROFESSIONAL APPOINTMENTS</Heading>
        {data.experiences.map((exp: any, i: number) => (
          <Grid templateColumns="150px 1fr" gap={6} key={i} mb={4}>
            <Text fontSize="sm" fontWeight="bold">{exp.start} — {exp.end}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="bold">{exp.role}</Text>
              <Text fontSize="sm" fontStyle="italic" mb={1}>{exp.company}</Text>
              <Text fontSize="xs">{exp.desc}</Text>
            </Box>
          </Grid>
        ))}
      </Box>

      <Box>
        <Heading size="xs" borderBottom="1px solid black" pb={1} mb={4}>EDUCATION</Heading>
        {data.educations.map((edu: any, i: number) => (
          <Grid templateColumns="150px 1fr" gap={6} key={i} mb={2}>
            <Text fontSize="sm" fontWeight="bold">{edu.year}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="bold">{edu.degree}</Text>
              <Text fontSize="sm">{edu.school}</Text>
            </Box>
          </Grid>
        ))}
      </Box>
    </VStack>
  </Box>
);

// 10. THE MINIMAL CARD (Modern, Centered, Card-based)
export const MinimalCardTemplate: React.FC<{ data: any }> = ({ data }) => (
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
                <Box>
                  <Heading size="xs" mb={4}>SKILLS</Heading>
                  <Flex wrap="wrap" gap={2}>
                    {data.skills.map((s: any, i: number) => (
                      <Badge key={i} variant="subtle" colorScheme="blue">{s.name}</Badge>
                    ))}
                  </Flex>
                </Box>
             </VStack>
          </GridItem>
          
          <GridItem colSpan={2}>
            <VStack align="stretch" spacing={10} pt={20}>
              <Box>
                <Heading size="md" mb={4}>About Me</Heading>
                <Text color="gray.600" lineHeight="1.8">{data.summary}</Text>
              </Box>
              <Box>
                <Heading size="md" mb={6}>Experience</Heading>
                {data.experiences.map((exp: any, i: number) => (
                  <Box key={i} mb={8}>
                    <Text fontWeight="bold">{exp.role}</Text>
                    <Text color={data.themeColor} fontSize="sm">{exp.company} / {exp.start} - {exp.end}</Text>
                    <Text mt={2} fontSize="sm" color="gray.600">{exp.desc}</Text>
                  </Box>
                ))}
              </Box>
            </VStack>
          </GridItem>
        </SimpleGrid>
      </Box>
    </Box>
  </Box>
);

const CVTemplates = () => {
  return (
    <Box p={10}>
      <Text fontSize="xl" fontWeight="bold">10 Professional CV Templates Loaded.</Text>
      <Text>Use Executive, Minimalist, TechSidebar, CreativeBold, Monolith, SwissGrid, Botanical, Startup, Academic, or MinimalCard.</Text>
    </Box>
  );
};

export default CVTemplates;
// src/components/InstructorDetails.tsx
import React from "react";
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
  useColorModeValue,
  Icon,
  Divider,
  SimpleGrid,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";

interface InstructorDetailsProps {
  name: string;
  bio: string;
  avatarUrl: string;
  expertise: string[];
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  contact?: string;
}

const InstructorDetails: React.FC<InstructorDetailsProps> = ({
  name,
  bio,
  avatarUrl,
  expertise,
  email,
  website,
  linkedin,
  twitter,
  github,
  contact,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      p={6}
      shadow="lg"
      maxW="5xl"
      mx="auto"
    >
      <HStack spacing={6} alignItems="start">
        <Image
          borderRadius="full"
          boxSize="150px"
          src={avatarUrl}
          alt={`${name} avatar`}
          shadow="md"
        />
        <VStack align="start" spacing={4} flex="1">
          <Text fontSize="3xl" fontWeight="bold">
            {name}
          </Text>
          <Text fontSize="lg" color="gray.500" maxW="3xl">
            {bio}
          </Text>
          <SimpleGrid columns={[1, 2]} spacing={4} w="full">
            <VStack align="start">
              <Text fontSize="md" fontWeight="semibold">
                Expertise:
              </Text>
              <HStack spacing={2} wrap="wrap">
                {expertise.map((skill, index) => (
                  <Tag key={index} colorScheme="teal">
                    {skill}
                  </Tag>
                ))}
              </HStack>
            </VStack>
            <VStack align="start">
              <Text fontSize="md" fontWeight="semibold">
                Contact Information:
              </Text>
              {email && (
                <HStack spacing={2}>
                  <Icon as={FaEnvelope} />
                  <Link href={`mailto:${email}`} color="teal.500">
                    {email}
                  </Link>
                </HStack>
              )}
              {contact && (
                <HStack spacing={2}>
                  <Icon as={FaGlobe} />
                  <Text color="gray.600">{contact}</Text>
                </HStack>
              )}
              {website && (
                <HStack spacing={2}>
                  <Icon as={FaGlobe} />
                  <Link href={website} target="_blank" color="teal.500">
                    {website}
                  </Link>
                </HStack>
              )}
            </VStack>
          </SimpleGrid>
          <Divider />
          <HStack spacing={4} mt={4} w="full">
            {linkedin && (
              <Tooltip label="LinkedIn Profile" aria-label="LinkedIn tooltip">
                <Button
                  as="a"
                  href={linkedin}
                  target="_blank"
                  leftIcon={<Icon as={FaLinkedin} />}
                  colorScheme="linkedin"
                >
                  LinkedIn
                </Button>
              </Tooltip>
            )}
            {twitter && (
              <Tooltip label="Twitter Profile" aria-label="Twitter tooltip">
                <Button
                  as="a"
                  href={twitter}
                  target="_blank"
                  leftIcon={<Icon as={FaTwitter} />}
                  colorScheme="twitter"
                >
                  Twitter
                </Button>
              </Tooltip>
            )}
            {github && (
              <Tooltip label="GitHub Profile" aria-label="GitHub tooltip">
                <Button
                  as="a"
                  href={github}
                  target="_blank"
                  leftIcon={<Icon as={FaGithub} />}
                  colorScheme="gray"
                >
                  GitHub
                </Button>
              </Tooltip>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default InstructorDetails;

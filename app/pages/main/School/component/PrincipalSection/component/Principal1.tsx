import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  IconButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion"; // Import motion from framer-motion
import { useSectionColorContext } from "../../../School";

const MotionBox = motion(Box); // Create a motion-enabled Box

export default function Principal1({ content, setContent, webColor }: any) {
  const { websiteMode } = useSectionColorContext() || {
    colors: webColor || {},
    websiteMode: true,
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue("gray.700", "gray.300");
  const bg = useColorModeValue("gray.50", "gray.900");
  const [editContent, setEditContent] = useState<any>(content);

  const handleInputChange = (field: string, value: string) => {
    setEditContent((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBioChange = (index: number, value: string) => {
    const newBio = [...editContent.bio];
    newBio[index] = value;
    setEditContent((prev: any) => ({ ...prev, bio: newBio }));
  };

  const addBioParagraph = () => {
    setEditContent((prev: any) => ({
      ...prev,
      bio: [...prev.bio, ""],
    }));
  };

  const removeBioParagraph = (index: number) => {
    const newBio = [...editContent.bio];
    newBio.splice(index, 1);
    setEditContent((prev: any) => ({ ...prev, bio: newBio }));
  };

  const handleSave = () => {
    setContent(editContent);
    onClose();
  };

  return (
    <MotionBox
      m={{ base: 2, md: 5 }}
      py={10}
      bg={bg}
      borderRadius="lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        maxW={{base : '98%', md : "88%"}}
      >
        <Flex direction="column" align="center" justify="center" mb={8}>
          <Heading
            as="h2"
            size="xl"
            mb={4}
            color={useColorModeValue(
              webColor?.headingColor?.light,
              webColor?.headingColor?.dark
            )}
            fontWeight="bold"
            textAlign="center" // Ensure the text itself is centered
          >
            {content.title}
          </Heading>

          <Text
            textAlign="center" // Centering the subtitle text
            fontSize={{ base: "md", md: "xl" }}
            mb={8}
            maxW={{ base: "100%", md: "600px" }}
            color={useColorModeValue(
              webColor?.subHeadingColor?.light,
              webColor?.subHeadingColor?.dark
            )}
            fontWeight="semibold"
          >
            {content.subheading}
          </Text>
        </Flex>

        <Flex
          direction={{ base: "column", md: "row" }}
          gap={10}
          align="center"
          justify="center"
          wrap="wrap"
        >
          <MotionBox
            flex="1"
            textAlign="center"
            data-aos="fade-up"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={content.imageUrl}
              alt={content.name}
              boxSize={{ base: "200px", md: "300px" }}
              objectFit="cover"
              rounded="full"
              boxShadow="2xl"
              transition="transform 0.3s"
              _hover={{ transform: "scale(1.05)" }}
            />
          </MotionBox>
          <MotionBox
            flex="2"
            data-aos="fade-left"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              as="h3"
              size="lg"
              mb={4}
              fontWeight="bold"
              color={useColorModeValue(
                webColor?.headingColor?.light,
                webColor?.headingColor?.dark
              )}
            >
              {content.name}
            </Heading>

            {content.bio.map((paragraph: string, index: number) => (
              <Text
                key={index}
                mb={4}
                color={textColor}
                fontSize={{ base: "md", md: "lg" }}
                lineHeight="tall"
              >
                {paragraph}
              </Text>
            ))}
          </MotionBox>
        </Flex>

        {websiteMode && (
          <Button mt={8} onClick={onOpen} colorScheme="blue">
            Edit Principal’s Message
          </Button>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize="2xl" fontWeight="bold" pb={1}>
              Edit Principal’s Message
            </ModalHeader>
            <Divider mb={4} />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="bold">Title</FormLabel>
                  <Input
                    value={editContent.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Subheading</FormLabel>
                  <Textarea
                    value={editContent.subheading}
                    onChange={(e) =>
                      handleInputChange("subheading", e.target.value)
                    }
                    placeholder="Enter subheading"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Principal's Name</FormLabel>
                  <Input
                    value={editContent.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter principal's name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Image URL</FormLabel>
                  <Input
                    value={editContent.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    placeholder="Enter image URL"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Bio</FormLabel>
                  <VStack
                    align="stretch"
                    spacing={3}
                    overflowY="auto"
                    maxHeight="200px"
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    rounded="md"
                  >
                    {editContent.bio.map((paragraph: string, index: number) => (
                      <HStack key={index} align="stretch">
                        <Textarea
                          value={paragraph}
                          onChange={(e) =>
                            handleBioChange(index, e.target.value)
                          }
                          placeholder={`Paragraph ${index + 1}`}
                          resize="none"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Delete paragraph"
                          colorScheme="red"
                          onClick={() => removeBioParagraph(index)}
                        />
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="green"
                      onClick={addBioParagraph}
                      variant="outline"
                    >
                      Add Paragraph
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </MotionBox>
  );
}
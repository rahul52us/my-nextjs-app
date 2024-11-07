import { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Center,
  Divider,
  Grid,
  GridItem,
  useBreakpointValue,
  useColorModeValue,
  Flex,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useColorMode,
} from "@chakra-ui/react";
import { FaBookOpen, FaPlus } from "react-icons/fa";
import { useSectionColorContext } from "../../../School";
import { motion } from "framer-motion";

const AnimatedBox = motion(Box);

const Curriculum1 = ({
  content,
  setContent,
  webColor,
  isEditable,
  titleColor,
  borderColor,
  textColor,
}: any) => {
  const { colorMode } = useColorMode();
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  const bg = useColorModeValue("gray.50", "gray.900");
  const sectionBgColor = useColorModeValue("white", "gray.800");

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isTitleSubtitleModalOpen, setIsTitleSubtitleModalOpen] =
    useState(false);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [isNewSection, setIsNewSection] = useState(false);
  const [editedContent, setEditedContent] = useState({
    title: "",
    content: "",
  });

  // Separate states for title and subtitle
  const [editedTitle, setEditedTitle] = useState(content?.title);
  const [editedSubtitle, setEditedSubtitle] = useState(content?.description);

  const openEditSectionModal = (sectionIndex: any = null) => {
    if (sectionIndex !== null) {
      const section = content.sections[sectionIndex];
      setEditedContent({ title: section.title, content: section.content });
      setCurrentSection(sectionIndex);
      setIsNewSection(false);
    } else {
      setEditedContent({ title: "", content: "" });
      setCurrentSection(null);
      setIsNewSection(true);
    }
    setIsSectionModalOpen(true);
  };

  const saveSectionChanges = () => {
    const updatedSections: any = [...content.sections];
    if (isNewSection) {
      updatedSections.push(editedContent);
    } else {
      updatedSections[currentSection] = { ...editedContent };
    }

    // Save only section changes
    setContent((prevContent: any) => ({
      ...prevContent,
      sections: updatedSections,
    }));
    setIsSectionModalOpen(false);
  };

  const saveTitleAndSubtitle = () => {
    setContent({ ...content, title: editedTitle, description: editedSubtitle });
    setIsTitleSubtitleModalOpen(false); // Close the modal after saving
  };

  return (
    <Box
      m={{ base: 2, md: 5 }}
      py={6}
      bg={bg}
      maxW={{ base: "98%", md: "100%" }}
      p={{ base: 5, md: 10 }}
    >
      <Center>
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          mb={3}
          fontWeight="bold"
          color={
            colorMode === "light"
              ? colors?.headingColor?.light
              : colors?.headingColor?.dark
          }
        >
          {editedTitle}
        </Heading>
      </Center>
      <Text
        textAlign="center"
        mb={10}
        maxW={{ base: "100%", md: "600px" }}
        mx="auto"
        fontWeight="semibold"
        fontSize={{ base: "md", md: "xl" }}
        color={
          colorMode === "light"
            ? colors?.subHeadingColor?.light
            : colors?.subHeadingColor?.dark
        }
      >
        {editedSubtitle}
      </Text>
      <Grid
        templateColumns={useBreakpointValue({
          base: "1fr",
          md: "repeat(2, 1fr)",
        })}
        gap={6}
      >
        {Array.isArray(content.sections)
          ? content?.sections?.map((section: any, index: number) => (
              <GridItem key={index}>
                <AnimatedBox
                  p={6}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={sectionBgColor}
                  boxShadow="lg"
                  transition="all 0.3s"
                  _hover={{ transform: "scale(1.05)" }}
                  cursor={isEditable ? "pointer" : "default"}
                  onClick={() => isEditable && openEditSectionModal(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Flex alignItems="center" mb={4}>
                    <Icon
                      as={FaBookOpen}
                      boxSize={7}
                      color={titleColor}
                      mr={3}
                    />
                    <Heading
                      as="h3"
                      size="md"
                      color={titleColor}
                      fontWeight="semibold"
                    >
                      {section.title}
                    </Heading>
                  </Flex>
                  <Divider
                    orientation="horizontal"
                    borderColor="gray.300"
                    my={3}
                  />
                  <Text color={textColor} fontSize="sm">
                    {section.content}
                  </Text>
                </AnimatedBox>
              </GridItem>
            ))
          : []}
      </Grid>

      {isEditable && (
        <Center mt={8}>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => openEditSectionModal()}
            size="lg"
          >
            Add New Section
          </Button>
          <Button
            ml={4}
            colorScheme="teal"
            onClick={() => setIsTitleSubtitleModalOpen(true)}
            size="lg"
          >
            Edit Title and Subtitle
          </Button>
        </Center>
      )}

      {/* Edit/Add Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg={sectionBgColor} borderRadius="md" boxShadow="lg">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
            {isNewSection ? "Add New Section" : "Edit Section"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              mb={4}
              placeholder="Section Title"
              value={editedContent.title}
              onChange={(e) =>
                setEditedContent({ ...editedContent, title: e.target.value })
              }
              bg={useColorModeValue("gray.100", "gray.700")}
              borderRadius="md"
              _focus={{ borderColor: "blue.400" }}
              size="lg"
            />
            <Textarea
              placeholder="Section Content"
              value={editedContent.content}
              onChange={(e) =>
                setEditedContent({ ...editedContent, content: e.target.value })
              }
              bg={useColorModeValue("gray.100", "gray.700")}
              borderRadius="md"
              _focus={{ borderColor: "blue.400" }}
              size="lg"
              rows={6}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={saveSectionChanges}
              mr={3}
              size="lg"
              px={6}
            >
              Save Section
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSectionModalOpen(false)}
              size="lg"
              px={6}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Separate Modal for Title and Subtitle Editing */}
      <Modal
        isOpen={isTitleSubtitleModalOpen}
        onClose={() => setIsTitleSubtitleModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg={sectionBgColor} borderRadius="md" boxShadow="lg">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
            Edit Title and Subtitle
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              mb={4}
              placeholder="Edit Title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              bg={useColorModeValue("gray.100", "gray.700")}
              borderRadius="md"
              _focus={{ borderColor: "blue.400" }}
              size="lg"
            />
            <Textarea
              placeholder="Edit Subtitle"
              value={editedSubtitle}
              onChange={(e) => setEditedSubtitle(e.target.value)}
              bg={useColorModeValue("gray.100", "gray.700")}
              borderRadius="md"
              _focus={{ borderColor: "blue.400" }}
              size="lg"
              rows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={saveTitleAndSubtitle}
              mr={3}
              size="lg"
              px={6}
            >
              Save Title & Subtitle
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTitleSubtitleModalOpen(false)}
              size="lg"
              px={6}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Curriculum1;
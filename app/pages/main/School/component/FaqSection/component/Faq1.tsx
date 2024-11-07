import { useState } from "react";
import {
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  useColorModeValue,
  Flex,
  UnorderedList,
  ListItem,
  Input,
  IconButton,
  Textarea,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  CloseButton,
} from "@chakra-ui/react";
import { InfoIcon, EditIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useSectionColorContext } from "../../../School";

interface Faq {
  question: string;
  answer: string[];
}

const Faq1 = ({ setContent, content, webColor }: any) => {
  const { colorMode } = useColorMode();
  const { colors, websiteMode } = useSectionColorContext() || {
    colors: webColor || {},
    websiteMode: true,
  };

  const buttonHoverColor = useColorModeValue(
    colors?.buttonHoverColor?.light,
    colors?.buttonHoverColor?.dark
  );
  const textColor = useColorModeValue("gray.800", "gray.200");
  const panelBgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Updated background color for modal
  const modalBgColor = useColorModeValue("white", "gray.800");

  const [faqSection, setFaqSection] = useState(content);
  const [isFaqEditing, setIsFaqEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<Faq>({
    question: "",
    answer: [],
  });

  const handleEditFaq = (index: number) => {
    setEditingIndex(index);
    setEditedContent({ ...faqSection.faqData[index] });
    setIsFaqEditing(true);
  };

  const handleSaveFaq = () => {
    if (editingIndex !== null) {
      setFaqSection((prev: any) => {
        const updatedData: any = [...prev.faqData];
        updatedData[editingIndex] = {
          ...editedContent,
        };
        return { ...prev, faqData: updatedData };
      });

      handleUpdatedFaq(editedContent);
    }

    setIsFaqEditing(false);
    setEditingIndex(null);
  };

  const handleUpdatedFaq = (updatedFaq: Faq) => {
    console.log("Handling updated FAQ:", updatedFaq);
  };

  const handleCancelFaq = () => {
    setIsFaqEditing(false);
    setEditingIndex(null);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedContent({ ...editedContent, question: e.target.value });
  };

  const handleAnswerChange = (value: string, idx: number) => {
    setEditedContent((prev) => {
      const updatedAnswers = [...prev.answer];
      updatedAnswers[idx] = value;
      return { ...prev, answer: updatedAnswers };
    });
  };

  const handleAddAnswer = () => {
    setEditedContent((prev) => ({
      ...prev,
      answer: [...prev.answer, ""],
    }));
  };

  const handleDeleteAnswer = (idx: number) => {
    setEditedContent((prev) => {
      const updatedAnswers = prev.answer.filter((_, index) => index !== idx);
      return { ...prev, answer: updatedAnswers };
    });
  };

  const handleAddFaq = () => {
    setFaqSection((prev: any) => ({
      ...prev,
      faqData: [...prev.faqData, { question: "", answer: [""] }],
    }));
    setEditingIndex(faqSection.faqData.length);
    setEditedContent({ question: "", answer: [""] });
    setIsFaqEditing(true);
  };

  const handleDeleteFaq = (index: number) => {
    setFaqSection((prev: any) => ({
      ...prev,
      faqData: prev.faqData.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleSaveAllFaqs = () => {
    setContent(faqSection);
  };

  return (
    <Box
      id="FAQ"
      p={4}
      mx="auto"
      borderRadius="md"
      m={0}
      mr={{ base: 2, md: 10 }}
      ml={{ base: 2, md: 10 }}
    >
      <Flex direction="column" alignItems="center" mb={4}>
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          fontWeight="bold"
          color={
            colorMode === "light"
              ? colors?.headingColor?.light
              : colors?.headingColor?.dark
          }
        >
          {faqSection?.title}
        </Heading>
        <Text
          mt={4}
          textAlign="center"
          fontSize="xl"
          color={
            colorMode === "light"
              ? colors?.subHeadingColor?.light
              : colors?.subHeadingColor?.dark
          }
          fontWeight="semibold"
        >
          {faqSection?.subtitle}
        </Text>
      </Flex>
      {websiteMode && (
        <Flex justifyContent="end" mb={2}>
          <Button
            color={
              colorMode === "light"
                ? colors?.buttonTextColor?.light
                : colors?.buttonTextColor?.dark
            }
            backgroundColor={
              colorMode === "light"
                ? colors?.buttonColor?.light
                : colors?.buttonColor?.dark
            }
            _hover={{
              backgroundColor:
                colorMode === "light"
                  ? colors?.buttonHoverColor?.light
                  : colors?.buttonHoverColor?.dark,

              color:
                colorMode === "light"
                  ? colors?.buttonTextHoverColor?.light
                  : colors?.buttonTextHoverColor?.dark,
            }}
            onClick={handleAddFaq}
            leftIcon={<AddIcon />}
          >
            Add FAQ
          </Button>
          <Button
            color={
              colorMode === "light"
                ? colors.buttonTextColor?.light
                : colors.buttonTextColor?.dark
            }
            backgroundColor={
              colorMode === "light"
                ? colors.buttonColor?.light
                : colors.buttonColor?.dark
            }
            _hover={{
              backgroundColor:
                colorMode === "light"
                  ? colors.buttonHoverColor?.light
                  : colors.buttonHoverColor?.dark,

              color:
                colorMode === "light"
                  ? colors.buttonTextHoverColor?.light
                  : colors.buttonTextHoverColor?.dark,
            }}
            onClick={handleSaveAllFaqs}
            ml={2}
          >
            Save All FAQs
          </Button>
        </Flex>
      )}
      <Accordion allowToggle>
        {Array.isArray(faqSection.faqData) &&
          faqSection.faqData.map((faq: any, index: number) => (
            <AccordionItem
              key={index}
              border="1px"
              borderColor={borderColor}
              borderRadius="md"
              mb={3}
            >
              <AccordionButton
                bgColor={
                  colorMode === "light"
                    ? colors?.buttonColor?.light
                    : colors?.buttonColor?.dark
                }
                _hover={{ bg: buttonHoverColor, boxShadow: "md" }}
                p={6}
                _expanded={{
                  bg:
                    colorMode === "light"
                      ? colors?.buttonColor?.light
                      : colors?.buttonColor?.dark,
                }}
                transition="background-color 0.2s, box-shadow 0.2s"
              >
                <Flex alignItems="center" flex="1" textAlign="left">
                  <InfoIcon
                    boxSize={5}
                    color={
                      colorMode === "light"
                        ? colors?.iconColor?.dark
                        : colors?.iconColor?.dark
                    }
                    mr={2}
                  />
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "lg" }}
                    color={
                      colorMode === "light"
                        ? colors?.buttonTextColor?.light
                        : colors?.buttonTextColor?.dark
                    }
                    _hover={
                      colorMode === "light"
                        ? colors?.buttonTextHoverColor?.light
                        : colors?.buttonTextHoverColor?.dark
                    }
                  >
                    {faq.question}
                  </Text>
                </Flex>
                <AccordionIcon color={textColor} />
              </AccordionButton>
              <AccordionPanel
                fontSize="md"
                pb={4}
                p={4}
                bg={panelBgColor}
                borderRadius="md"
                boxShadow="sm"
              >
                <UnorderedList spacing={2} color={textColor}>
                  {faq.answer.map((point: any, idx: number) => (
                    <ListItem key={idx}>{point}</ListItem>
                  ))}
                </UnorderedList>
                {websiteMode && (
                  <Flex mt={3} justifyContent="flex-end">
                    <IconButton
                      icon={
                        <EditIcon
                          color={
                            colorMode === "light"
                              ? colors?.iconTextColor?.light
                              : colors?.iconTextColor?.dark
                          }
                          _hover={{
                            color:
                              colorMode === "light"
                                ? colors?.iconTextHoverColor?.light
                                : colors?.iconTextHoverColor?.dark,
                          }}
                        />
                      }
                      color={
                        colorMode === "light"
                          ? colors?.buttonTextHoverColor?.light
                          : colors?.buttonTextHoverColor?.dark
                      }
                      _hover={{
                        backgroundColor:
                          colorMode === "light"
                            ? colors?.buttonHoverColor?.light
                            : colors?.buttonHoverColor?.dark,
                      }}
                      backgroundColor={
                        colorMode === "light"
                          ? colors?.buttonColor?.light
                          : colors?.buttonColor?.dark
                      }
                      aria-label="Edit FAQ"
                      onClick={() => handleEditFaq(index)}
                      colorScheme="teal"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete FAQ"
                      onClick={() => handleDeleteFaq(index)}
                      colorScheme="red"
                      ml={2}
                    />
                  </Flex>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
      </Accordion>

      <Modal isOpen={isFaqEditing} onClose={handleCancelFaq} size="md">
        <ModalOverlay />
        <ModalContent
          borderRadius="lg"
          bg={modalBgColor}
          boxShadow="lg"
          transition="all 0.3s"
        >
          <ModalHeader
            bg={useColorModeValue("teal.300", "teal.600")}
            color="white"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderTopRadius="lg"
          >
            {editingIndex !== null ? "Edit FAQ" : "Add FAQ"}
            <CloseButton onClick={handleCancelFaq} />
          </ModalHeader>
          <ModalBody p={6}>
            <Input
              placeholder="Question"
              value={editedContent.question}
              onChange={handleQuestionChange}
              mb={4}
            />
            {editedContent.answer.map((answer: string, idx: number) => (
              <Flex key={idx} mb={2} alignItems="center">
                <Textarea
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value, idx)}
                  placeholder={`Answer ${idx + 1}`}
                  variant="filled"
                  mr={2}
                  flex="1"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete Answer"
                  onClick={() => handleDeleteAnswer(idx)}
                  colorScheme="red"
                />
              </Flex>
            ))}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="teal"
              onClick={handleAddAnswer}
              mt={2}
            >
              Add Answer
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSaveFaq}>
              Save
            </Button>
            <Button colorScheme="gray" onClick={handleCancelFaq} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Faq1;
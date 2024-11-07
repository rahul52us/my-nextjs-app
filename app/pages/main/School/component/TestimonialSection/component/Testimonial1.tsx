import { useState } from "react";
import Slider from "react-slick";
import {
  Box,
  Image,
  Text,
  VStack,
  Heading,
  useColorModeValue,
  useColorMode,
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
  Center,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { useSectionColorContext } from "../../../School";

const Testimonial1 = ({ content, setContent, isEditable, webColor }: any) => {
  const { colorMode } = useColorMode();
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("teal.600", "teal.400");
  const testimonialColor = useColorModeValue("gray.600", "gray.300");

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<any>(null);
  const [editedContent, setEditedContent] = useState({
    title: content?.title || "What Our Community Says",
    subTitle:
      content?.subTitle ||
      "Hear from parents, students, and alumni about their experiences.",
    testimonials: Array.isArray(content?.sections)
      ? content?.sections?.map(({ name, testimonial, imageUrl }: any) => ({
          name,
          testimonial,
          imageUrl,
        }))
      : [],
  });

  const openEditModal = (testimonialIndex: number | null) => {
    setCurrentTestimonial(testimonialIndex);
    setIsModalOpen(true);
  };

  const saveChanges = () => {
    if (currentTestimonial === null) {
      setContent({
        ...content,
        title: editedContent.title,
        subTitle: editedContent.subTitle,
        sections: editedContent.testimonials,
      });
    } else {
      const updatedTestimonials = [...editedContent.testimonials];
      updatedTestimonials[currentTestimonial] = {
        ...updatedTestimonials[currentTestimonial],
        ...editedContent.testimonials[currentTestimonial],
      };
      setContent({ ...content, sections: updatedTestimonials });
    }
    setIsModalOpen(false);
  };

  const handleTestimonialChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedTestimonials = [...editedContent.testimonials];
    updatedTestimonials[index] = {
      ...updatedTestimonials[index],
      [field]: value,
    };
    setEditedContent({ ...editedContent, testimonials: updatedTestimonials });
  };

  return (
    <Box
      m={{ base: 2, md: 5 }}
      py={10}
      bg={bg}
      maxW={{ base: "98%", md: "100%" }}
      p={{ base: 5, md: 10 }}
      borderRadius="lg"
      boxShadow="md"
    >
      <Center>
        <Box>
        <Heading
          as="h2"
          size="xl"
          textAlign="center"

          mb={4}
          color={
            colorMode === "light"
              ? colors?.headingColor?.light
              : colors?.headingColor?.dark
          }
        >
          {editedContent.title}
          {isEditable && (
            <Button
              size="xs"
              ml={2}
              onClick={() => openEditModal(null)}
              variant="outline"
              colorScheme="teal"
              leftIcon={<FaEdit />}
            >
              Edit
            </Button>
          )}
        </Heading>
        <Text
          textAlign="center"
          color={
            colorMode === "light"
              ? colors?.subHeadingColor?.light
              : colors?.subHeadingColor?.dark
          }
          mb={6}
          maxW={{ base: "100%", md: "600px" }}
          fontWeight="semibold"
          fontSize={{ base: "md", md: "xl" }}
        >
          {editedContent.subTitle}
        </Text>
        </Box>
      </Center>
      <Slider {...settings}>
        {editedContent.testimonials.map(
          ({ name, testimonial, imageUrl }: any, index: number) => (
            <Box key={index} mx={2} my={3}>
              <VStack
                spacing={4}
                align="center"
                p={5}
                borderWidth={1}
                borderColor={borderColor}
                borderRadius="lg"
                boxShadow="md"
                bg={cardBg}
                transition="0.3s"
                mr={4}
                _hover={{ boxShadow: "xl", transform: "scale(1.03)" }}
                position="relative"
              >
                {isEditable && (
                  <Button
                    size="xs"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => openEditModal(index)}
                    variant="outline"
                    colorScheme="teal"
                    leftIcon={<FaEdit />}
                  >
                    Edit
                  </Button>
                )}
                <Image
                  borderRadius="full"
                  boxSize="100px"
                  src={imageUrl}
                  alt={name}
                  boxShadow="md"
                />
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  {name}
                </Text>
                <Text
                  fontStyle="italic"
                  color={testimonialColor}
                  textAlign="center"
                >
                  "{testimonial}"
                </Text>
              </VStack>
            </Box>
          )
        )}
      </Slider>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="md" boxShadow="lg">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
            {currentTestimonial === null
              ? "Edit Title and Subtitle"
              : "Edit Testimonial"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {currentTestimonial === null ? (
              <>
                <Input
                  mb={4}
                  placeholder="Title"
                  value={editedContent.title}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      title: e.target.value,
                    })
                  }
                  borderRadius="md"
                  _focus={{ borderColor: "teal.400" }}
                  size="lg"
                />
                <Textarea
                  placeholder="Subtitle"
                  value={editedContent.subTitle}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      subTitle: e.target.value,
                    })
                  }
                  borderRadius="md"
                  _focus={{ borderColor: "teal.400" }}
                  size="lg"
                  rows={3}
                />
              </>
            ) : (
              <>
                <Input
                  mb={4}
                  placeholder="Name"
                  value={editedContent.testimonials[currentTestimonial].name}
                  onChange={(e) =>
                    handleTestimonialChange(
                      currentTestimonial,
                      "name",
                      e.target.value
                    )
                  }
                  borderRadius="md"
                  _focus={{ borderColor: "teal.400" }}
                  size="lg"
                />
                <Textarea
                  placeholder="Testimonial"
                  value={
                    editedContent.testimonials[currentTestimonial].testimonial
                  }
                  onChange={(e) =>
                    handleTestimonialChange(
                      currentTestimonial,
                      "testimonial",
                      e.target.value
                    )
                  }
                  borderRadius="md"
                  _focus={{ borderColor: "teal.400" }}
                  size="lg"
                  rows={5}
                  mb={4}
                />
                <Input
                  placeholder="Image URL"
                  value={
                    editedContent.testimonials[currentTestimonial].imageUrl
                  }
                  onChange={(e) =>
                    handleTestimonialChange(
                      currentTestimonial,
                      "imageUrl",
                      e.target.value
                    )
                  }
                  borderRadius="md"
                  _focus={{ borderColor: "teal.400" }}
                  size="lg"
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={saveChanges}>
              Save
            </Button>
            <Button onClick={() => setIsModalOpen(false)} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Testimonial1;

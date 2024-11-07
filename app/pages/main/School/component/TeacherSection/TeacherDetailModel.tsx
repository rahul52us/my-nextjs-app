import {
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Box,
    Button,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { useEffect, useRef, useState } from "react";

  const TeacherDetailModal = ({
    isOpen,
    onClose,
    name,
    subject,
    imageUrl,
    bio,
    index,
    totalItems,
    colors
  }: any) => {
    const modalBodyRef = useRef<any>(null);
    const bg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const boxShadow = useColorModeValue(
      "0 4px 30px rgba(0, 0, 0, 0.1)",
      "0 4px 30px rgba(255, 255, 255, 0.1)"
    );

    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
      if (isOpen && modalBodyRef.current && isHovering) {
        const scrollToNextItem = () => {
          const nextIndex = (index + 1) % totalItems;
          const nextItem = document.getElementById(`teacher-card-${nextIndex}`);
          if (nextItem) {
            modalBodyRef.current.scrollTo({
              top: nextItem.offsetTop,
              behavior: "smooth",
            });
          }
        };

        const scrollInterval = setInterval(scrollToNextItem, 3000);

        return () => clearInterval(scrollInterval);
      }
    }, [isOpen, index, totalItems, isHovering]);

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={bg} borderRadius="lg" boxShadow="lg">
          <ModalHeader
            fontSize="2xl"
            textAlign="center"
            fontWeight="bold"
            color={textColor}
          >
            {name}
          </ModalHeader>
          <Button
            onClick={onClose}
            variant="ghost"
            color={useColorModeValue(colors?.iconColor?.light, colors?.iconColor?.dark)}
            position="absolute"
            top={4}
            right={4}
            _hover={{
              color: useColorModeValue("gray.800", "white"),
              transform: "scale(1.1)",
            }}
            _focus={{ outline: "none" }}
          >
            ✖
          </Button>
          <ModalBody
            ref={modalBodyRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={4}
              p={6}
              borderRadius="md"
              bg={useColorModeValue("gray.50", "gray.700")}
              boxShadow={boxShadow}
            >
              <Image
                src={imageUrl}
                alt={name}
                borderRadius="full"
                boxSize="150px"
                objectFit="cover"
                mb={4}
                border="3px solid"
                borderColor={useColorModeValue("teal.500", "teal.300")}
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.05)" }}
              />
              <Text fontSize="lg" fontWeight="bold" color={textColor} mt={2}>
                <strong>Subject:</strong> {subject}
              </Text>
              <Text mt={2} color={textColor} textAlign="center" px={4}>
                {bio}
              </Text>
              <Button
                mt={4}
                bgColor={useColorModeValue(colors?.buttonColor?.light, colors?.buttonColor?.dark)}
                color={useColorModeValue(colors?.buttonTextColor?.light, colors?.buttonTextColor?.dark)}
                onClick={onClose}
                width="full"
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue(colors?.buttonColor?.light, colors?.buttonColor?.dark),
                  transform: "scale(1.05)",
                }}
                transition="background 0.2s, transform 0.2s"
              >
                Close
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  export default TeacherDetailModal;

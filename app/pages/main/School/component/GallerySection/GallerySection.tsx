import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useSectionColorContext } from "../../School";

export default function GallerySection({ images }: any) {
  const {colors} = useSectionColorContext()
  const bg = useColorModeValue("gray.50", "gray.900");
  const {colorMode} = useColorMode()
  const sliderRef: any = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    rows: 2,
    slidesPerRow: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          rows: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          rows: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          rows: 1,
          centerMode: false,
        },
      },
    ],
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, goToNext, goToPrevious]);

  return (
    <Box id="gallery" m={{ base: 2, md: 5 }} py={10} bg={bg}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          mb={3}
          fontWeight="bold"
          color={useColorModeValue(
            colors?.headingColor?.light,
            colors?.headingColor?.dark
          )}        >
          Discover Our School Moments
        </Heading>
        <Text textAlign="center" fontSize="lg" color={useColorModeValue(
          colors?.subHeadingColor?.light,
          colors?.subHeadingColor?.dark
        )} mb={5}>
          A glimpse into our cherished school memories and events.
        </Text>

        <Slider ref={sliderRef} {...settings}>
          {images.map((image : any, index : number) => (
            <Box key={index} p={2} onClick={() => openModal(index)}>
              <Image
                src={image.src}
                rounded={8}
                objectFit="cover"
                alt={`Gallery image ${index + 1}`}
                width="100%"
                height="auto"
                maxH={{ base: "150px", md: "275px" }}
                display="block"
                cursor="pointer"
                loading="lazy"
              />
            </Box>
          ))}
        </Slider>

        <Stack direction="row" justifyContent="center" mt={4} spacing={4}>
          <IconButton
            aria-label="Previous"
            icon={<ArrowBackIcon />}
            onClick={() => sliderRef.current.slickPrev()}
            color={colorMode === "light" ? "white" : "white"}
            bgColor={
              colorMode === "light"
                ? colors?.iconColor?.light
                : colors?.iconColor?.dark
            }
            _hover={{
              bgColor:
                colorMode === "light"
                  ? colors?.iconColor?.light
                  : colors?.iconColor?.dark,
              color: colorMode === "light" ? "white" : "white",
            }}
          />
          <IconButton
            aria-label="Next"
            icon={<ArrowForwardIcon />}
            onClick={() => sliderRef.current.slickNext()}
            bgColor={
              colorMode === "light"
                ? colors?.iconColor?.light
                : colors?.iconColor?.dark
            }
            color={colorMode === "light" ? "white" : "white"}
            _hover={{
              bgColor:
                colorMode === "light"
                  ? colors?.iconColor?.light
                  : colors?.iconColor?.dark,
              color: colorMode === "light" ? "white" : "white",
            }}
          />
        </Stack>

        <Modal isOpen={isOpen} onClose={closeModal} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent h="90vh" bg={"blackAlpha.900"}>
            <Flex position="relative" height="100%">
              <ModalCloseButton color={"white"} />
              <IconButton
                aria-label="Previous Image"
                icon={<ArrowBackIcon />}
                onClick={goToPrevious}
                position="absolute"
                left={4}
                variant={"outline"}
                isRound
                top="50%"
                transform="translateY(-50%)"
                colorScheme="whiteAlpha"
                zIndex="overlay"
              />
              <IconButton
                aria-label="Next Image"
                icon={<ArrowForwardIcon />}
                onClick={goToNext}
                position="absolute"
                right={4}
                top="50%"
                variant={"outline"}
                isRound
                transform="translateY(-50%)"
                colorScheme="whiteAlpha"
                zIndex="overlay"
              />
              <ModalBody
                aria-live="polite"
                aria-label={`Image ${currentImageIndex + 1} of ${
                  images.length
                }`}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Image
                  src={images[currentImageIndex].src}
                  alt={`Gallery image ${currentImageIndex + 1}`}
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                  loading="lazy"
                />
                {images[currentImageIndex].caption && (
                  <Box
                    bg="blackAlpha.800"
                    color="white"
                    px={6}
                    py={3}
                    mt={4}
                    position="absolute"
                    bottom={5}
                    maxW="75%"
                    borderRadius="lg"
                    textAlign="center"
                    fontSize={{ base: "sm", md: "md" }}
                    boxShadow="lg"
                    backdropFilter="blur(4px)"
                    width="auto"
                  >
                    <Text
                      fontWeight="semibold"
                      textShadow="0px 2px 4px rgba(0, 0, 0, 0.6)"
                      textAlign="center"
                    >
                      {images[currentImageIndex].caption}
                    </Text>
                  </Box>
                )}
              </ModalBody>
            </Flex>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}

import React from "react";
import {
  Box,
  IconButton,
  useBreakpointValue,
  Stack,
  Heading,
  Text,
  Container,
} from "@chakra-ui/react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Type definition for a card
interface CarouselCard {
  image: string;
  title: string;
  text: string;
}

// Props for the CaptionCarousel
interface CaptionCarouselProps {
  content: CarouselCard[];
  sliderSettings?: object; // Optional slider settings
}

const defaultSettings = {
  dots: true,
  arrows: false,
  fade: true,
  infinite: true,
  autoplay: true,
  speed: 500,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const HeroCarousal: React.FC<CaptionCarouselProps> = ({
  content,
  sliderSettings = {},
}) => {
  const [slider, setSlider] = React.useState<Slider | null>(null);
  const top = useBreakpointValue({ base: "90%", md: "50%" });
  const side = useBreakpointValue({ base: "10px", md: "40px" });

  // Check if the screen is mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      position="relative"
      width="100%"
      height={{ base: "auto", md: "600px" }}
      overflow="hidden"
    >
      {/* Left Arrow */}
      <IconButton
        aria-label="left-arrow"
        variant="ghost"
        display={{ base: "none", md: "block" }}
        position="absolute"
        left={side}
        top={top}
        transform="translate(0%, -50%)"
        zIndex={2}
        onClick={() => slider?.slickPrev()}
      >
        <BiLeftArrowAlt size="40px" />
      </IconButton>

      {/* Right Arrow */}
      <IconButton
        aria-label="right-arrow"
        variant="ghost"
        display={{ base: "none", md: "block" }}
        position="absolute"
        right={side}
        top={top}
        transform="translate(0%, -50%)"
        zIndex={2}
        onClick={() => slider?.slickNext()}
      >
        <BiRightArrowAlt size="40px" />
      </IconButton>

      {/* Slider */}
      <Slider
        {...{ ...defaultSettings, ...sliderSettings }}
        ref={(slider) => setSlider(slider)}
      >
        {content.map((card, index) => (
          <Box
            key={index}
            position="relative"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="cover"
            backgroundImage={`url(${card.image})`}
            height={{ base: "350px", md: "600px" }}
          >
            <Container size="container.lg" height="100%" position="relative">
              <Stack
                spacing={{ base: 2, md: 4 }}
                w="full"
                maxW="lg"
                position={isMobile ? "relative" : "absolute"}
                bottom={isMobile ? "unset" : "10%"}
                top={isMobile ? "70%" : "unset"}
                transform={isMobile ? "none" : "translateX(10%)"}
                bg="rgba(0, 0, 0, 0.6)"
                p={{ base: 2, md: 6 }}
                rounded="lg"
                textAlign="center"
                marginTop={isMobile ? "10px" : "0"}
              >
                <Heading
                  fontSize={{ base: "xl", md: "3xl" }}
                  color="white"
                  textAlign="center"
                >
                  {card.title}
                </Heading>
                <Text
                  fontSize={{ base: "md", lg: "lg" }}
                  color="white"
                  textAlign="center"
                >
                  {card.text}
                </Text>
              </Stack>
            </Container>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HeroCarousal;

import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  Heading,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ToppersCard from "./ToppersCard";
import { toppersData } from "../../../Constant/constants";
import { useSectionColorContext } from "../../../School";

export default function TopperSlider() {
  const {colors} = useSectionColorContext()
  const sliderRef: any = useRef(null);
  const { colorMode } = useColorMode();

  // Define number of slides to show based on the screen size
  const slidesToShow = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
  });

  const settings = {
    centerMode: true,
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: slidesToShow, // Use responsive slidesToShow
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 500,
    slidesPerRow: 1,
  };

  return (
    <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
      <Box textAlign="center" mb={4}>
        <Text
          as="span"
          display="block"
          fontSize={{ base: "sm", md: "xl" }}
          color={useColorModeValue(
            colors?.headingColor?.light,
            colors?.headingColor?.dark
          )}
          letterSpacing="widest"
        >
          Our Achievers
        </Text>
        <Heading
          as="h2"
          size={{ base: "md", md: "2xl" }}
          fontWeight="bold"
          letterSpacing="tight"
          lineHeight="shorter"
          color={useColorModeValue(
            colors?.headingColor?.light,
            colors?.headingColor?.dark
          )}
        >
          Meet Our Top Performers
        </Heading>
      </Box>

      <Box
        p={{ base: 2, md: 4 }} // Adjust padding for smaller screens
        mt={{ base: 4, md: 0 }} // Add margin-top for mobile screens
      >
        <Slider ref={sliderRef} {...settings}>
          {toppersData.map((item, index) => (
            <Box key={index} px={{ base: 1, md: 1 }}>
              {" "}
              {/* Reduce padding on mobile */}
              <ToppersCard
                img={item.imageUrl}
                bio={item.bio}
                name={item.name}
                classs={item.className}
                year={item.year}
                percentage={item.percentage}
              />
            </Box>
          ))}
        </Slider>

        <Stack direction="row" justifyContent="center" mt={10} spacing={4}>
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
      </Box>
    </Container>
  );
}

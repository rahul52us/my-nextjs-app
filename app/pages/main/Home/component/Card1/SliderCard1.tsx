import { Heading, Box, Text, useBreakpointValue } from "@chakra-ui/react";
import Card1 from "./Card1";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const servicesData = [
  {
    id: 0,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "System Analysis & Integration",
    title: "System Analysis & Integration",
    description:
      "Understanding and working closely with Network Partners to analyze their systems and integration requirements.",
  },
  {
    id: 1,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "Gap Analysis",
    title: "Gap Analysis",
    description:
      "Identifying and addressing any discrepancies for ONDC integration.",
  },
  {
    id: 2,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "Guidance & Recommendations",
    title: "Guidance & Recommendations",
    description:
      "Advising on necessary changes and enhancements for compatibility.",
  },
  {
    id: 3,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "Custom Development",
    title: "Custom Development",
    description:
      "Creating adapters and extensions for mapping APIs to ONDC standards.",
  },
  {
    id: 3,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "Custom Development",
    title: "Custom Development",
    description:
      "Creating adapters and extensions for mapping APIs to ONDC standards.",
  },
  {
    id: 3,
    src: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
    alt: "Custom Development",
    title: "Custom Development",
    description:
      "Creating adapters and extensions for mapping APIs to ONDC standards.",
  },
];

const SliderCard1 = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: useBreakpointValue({base : 1 , md : 2 , lg : 3}),
    slidesToScroll: 1,
    arrow: true,
  };

  return (
    <>
      <Box mx={{base:'2rem',md:"6rem"}}>
        <Box mb={10}>
          <Text mt={"4rem"} textAlign={"center"} color={"gray"}>
            ARTICLES
          </Text>
          <Heading textAlign={"center"}>Latest Educational Articles</Heading>
        </Box>
        <Slider {...settings}>
          {servicesData.map((value) => {
            return (
              <Box key={value.id}>
                <Card1
                  id={value.id}
                  title={value.title}
                  description={value.description}
                  alt={value.alt}
                  image={value.src}
                />
              </Box>
            );
          })}
        </Slider>
      </Box>
    </>
  );
};

export default SliderCard1;

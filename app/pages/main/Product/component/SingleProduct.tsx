import { useState } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
Box,
Image,
Flex,
IconButton,
useBreakpointValue,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageMagnifiers from "../../../../config/component/ImageMagnifer/ImageMagnifier";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";

const images = [
"https://dev1-cdn.helioswatchstore.com/catalog/product/cache/dd1c3400e344f54d12df823ec560a116/g/w/gw0534l2_4_1.jpg",
"https://dev1-cdn.helioswatchstore.com/catalog/product/cache/dd1c3400e344f54d12df823ec560a116/g/w/gw0534l2_1_1.jpg",
"https://dev1-cdn.helioswatchstore.com/catalog/product/cache/dd1c3400e344f54d12df823ec560a116/g/w/gw0534l2_2_1.jpg",
"https://dev1-cdn.helioswatchstore.com/catalog/product/cache/dd1c3400e344f54d12df823ec560a116/g/w/gw0534l2_3_1.jpg",
];

const SingleProduct = () => {
const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
const [slider, setSlider] = useState<Slider | null>(null);

const settings: Settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index: number) => setSelectedImageIndex(index),
    prevArrow: <FiChevronLeft size={48} color="#333" />,
    nextArrow: <FiChevronRight size={48} color="#333" />,
};

const handleThumbnailClick = (index: number): void => {
    if (slider) {
    slider.slickGoTo(index);
    }
};

const top = useBreakpointValue({ base: "90%", md: "50%" });
const side = useBreakpointValue({ base: "30%", md: "40px" });

return (
    <Flex>
    <Box w="50vw">
        <Box
        position={"relative"}
        height={"600px"}
        // width={"full"}
        overflow={"hidden"}
        >
        <IconButton
            aria-label="left-arrow"
            variant="ghost"
            position="absolute"
            left={side}
            top={top}
            transform={"translate(0%, -50%)"}
            zIndex={2}
            onClick={() => slider?.slickPrev()}
        >
            <BiLeftArrowAlt size="40px" />
        </IconButton>
        {/* Right Icon */}
        <IconButton
            aria-label="right-arrow"
            variant="ghost"
            position="absolute"
            right={side}
            top={top}
            transform={"translate(0%, -50%)"}
            zIndex={2}
            onClick={() => slider?.slickNext()}
        >
            <BiRightArrowAlt size="40px" />
        </IconButton>
        <Slider {...settings} ref={(slider) => setSlider(slider)}>
            {images.map((image, index) => (
            <Box key={index}>
                <ImageMagnifiers image={image} />
            </Box>
            ))}
        </Slider>
        </Box>
        <Flex mt={4} justifyContent="center" alignItems="center">
        {images.map((image, index) => (
            <Box
            key={index}
            mx={2}
            cursor="pointer"
            onClick={() => handleThumbnailClick(index)}
            borderBottom={
                index === selectedImageIndex ? "2px solid blue" : "none"
            }
            pb={2}
            >
            <Image
                src={image}
                maxH="50px"
                maxW="50px"
                borderRadius="md"
                boxShadow="md"
            />
            </Box>
        ))}
        </Flex>
    </Box>
    <Box>Rahul</Box>
    </Flex>
);
};

export default SingleProduct;
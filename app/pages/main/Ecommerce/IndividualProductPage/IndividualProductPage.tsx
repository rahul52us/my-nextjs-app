import {
  ArrowForwardIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { FaRegComments, FaStar } from "react-icons/fa";
import { FaOpencart } from "react-icons/fa6";
import Slider from "react-slick";
import { useCallback, useEffect, useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PriceDisplay from "./PriceDisplay/PriceDisplay";
import ProductSpecification from "./ProductSpecification/ProductSpecification";
import ColorOptions from "./ColorOptions/ColorOptions";
import ProductFeatures from "./FeatureDescription/FeatureDescription";
import productData from "../IndividualProductPage/JSON/phoneData.json";
import RatingPerReview from "./ReviewComponent/RatingPerReview";
import ProductReviewCard from "./ReviewComponent/ReviewComponent";
// import productData from "../IndividualProductPage/JSON/tvData.json";
// import productData from '../IndividualProductPage/dummyData.json'

const IndividualProductPage = () => {
  const [mainImage, setMainImage] = useState<any>(productData?.images[0]);
  const [options] = useState({
    method: "GET",
    // url: "https://real-time-product-search.p.rapidapi.com/product-details",
    params: {
      product_id: "9222453800837864433",
      country: "us",
      language: "en",
    },
    headers: {
      "x-rapidapi-key": "d4c4126cb1mshddd553eb7fe95bap1bdf13jsn19c6b312de3f",
      "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    },
  });

  const [currentSlide, setCurrentSlide] = useState<any>(0);

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      slider.current.slickPrev();
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < productData.images.length - 4) {
      slider.current.slickNext();
    }
  };

  const slider: any = useRef(null);

  const settings = {
    vertical: true,
    infinite: false,
    slidesToShow: 4.5,
    slidesToScroll: 3,
    arrows: false,
    beforeChange: (newIndex: number) => setCurrentSlide(newIndex),
  };

  const getDetails = useCallback(async () => {
    try {
      await axios.request(options);
    } catch (error) {
      console.error(error);
    }
  }, [options]);

  useEffect(() => {
    getDetails();
  }, [getDetails]);

  return productData ? (
    <Container maxW={"8xl"} mx={"auto"} my={{ base: 2, md: 12 }}>
      <Grid templateColumns={"0.55fr 3fr 4fr"} gap={4} mb={4}>
        <Box>
          <Box maxH={"70vh"} h={"fit-content"} overflow={"auto"}>
            <Slider ref={slider} {...settings}>
              {productData?.images &&
                productData.images.map((img: any, index: any) => (
                  <Box
                    key={index}
                    onClick={() => setMainImage(img)}
                    boxSize={"6rem"}
                  >
                    <Image
                      src={img}
                      rounded={"2xl"}
                      // onMouseEnter={() => setMainImage(img)}
                      boxSize={"6rem"}
                      shadow={"md"}
                      objectFit={"cover"}
                      cursor={"pointer"}
                    />
                  </Box>
                ))}
            </Slider>
          </Box>
          <Box mt={2}>
            <IconButton
              aria-label="Previous slide"
              colorScheme="blackAlpha"
              size={"sm"}
              icon={<ChevronUpIcon />}
              isRound
              onClick={handlePrevSlide}
              isDisabled={currentSlide === 0}
            />
            <IconButton
              aria-label="Next slide"
              colorScheme="blackAlpha"
              isRound
              size={"sm"}
              icon={<ChevronDownIcon />}
              onClick={handleNextSlide}
              isDisabled={currentSlide >= productData.images.length - 4}
              ml={4}
            />
          </Box>
        </Box>
        <Flex align={"center"} justify={"center"} h={"80%"} p={2}>
          <Image
            w={"100%"}
            mx={{ base: 0, md: "auto" }}
            objectFit={"contain"}
            // h={"90%"}
            maxH={"78vh"}
            src={mainImage}
          />
        </Flex>
        <Box
          p={5}
          position="sticky"
          top={0}
          maxW={{ lg: "4fr" }}
          overflow={"auto"}
          maxH={"80vh"}
          className="custom-scrollbar"
        >
          <VStack spacing={6} align={"stretch"}>
            <Box>
              <Heading mb={2} fontSize={"2xl"}>
                {productData.name}
              </Heading>
              <Text color={"gray"}>{productData.short_desc}</Text>
            </Box>

            <Flex gap={12}>
              <Flex align={"center"} gap={"0.5"}>
                {Array(5)
                  .fill("")
                  .map((_, i) => (
                    <Icon
                      key={i}
                      fontSize={"lg"}
                      as={FaStar}
                      color={
                        i < Math.round(productData.rating) ? "gold" : "gray.300"
                      }
                    />
                  ))}
                <Text ml={2} color={"gray"} fontWeight={500}>
                  {productData.rating}
                </Text>
              </Flex>
              <Flex align={"center"} color={"gray"}>
                <Icon fontSize={"lg"} as={FaRegComments} />

                <Text ml={2} fontWeight={500}>
                  {productData.reviewsCount} Reviews
                </Text>
              </Flex>
            </Flex>

            <Box>
              <PriceDisplay
                price={productData.price}
                currency={productData.currency}
                discount={productData.discount}
              />
            </Box>

            {productData?.available_sizes.length > 0 && (
              <>
                <Flex align={"center"} gap={8}>
                  <Text fontWeight={500}>Select Size</Text>
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    color={"gray"}
                    rounded={"full"}
                    variant="link"
                  >
                    Size Guide
                  </Button>
                </Flex>
                <Flex gap={4}>
                  {productData?.available_sizes?.map((size: any) => (
                    <Button
                      key={size}
                      w={"fit-content"}
                      variant={"outline"}
                      borderWidth={2}
                      rounded={12}
                      fontSize={"sm"}
                      _hover={{ bg: "blackAlpha.800", color: "white" }}
                    >
                      {size}
                    </Button>
                  ))}
                </Flex>
              </>
            )}
            {productData?.available_colors.length > 0 && (
              <ColorOptions colors={productData.available_colors} />
            )}
            <Flex mt={2} w={"100%"}>
              <Button
                bg={"blue.300"}
                w={"30%"}
                _hover={{ bg: "blue.400" }}
                rounded={"full"}
                variant={"solid"}
                leftIcon={<FaOpencart />}
                fontWeight={700}
              >
                Add To Cart
              </Button>
            </Flex>
            <Divider borderColor={"gray.300"} />
            <Grid templateColumns={"1fr 1fr"} rowGap={6} w={"90%"}>
              {productData.features.map((feature: any, index: any) => (
                <Flex align={"center"} color={"gray.700"} key={index}>
                  <Icon fontSize={"lg"} as={FaRegComments} />
                  <Text ml={4} fontWeight={500}>
                    {feature}
                  </Text>
                </Flex>
              ))}
            </Grid>
            <ProductSpecification
              productSpecifications={productData?.product_specifications}
            />
            <ProductFeatures aboutItem={productData?.about_item} />
            <RatingPerReview
              ratings={productData?.reviews_summary?.reviews_per_rating}
            />

       {productData?.reviews.map((review: any) => (
          <ProductReviewCard review={review} />
        ))}

          </VStack>
        </Box>
      </Grid>

      <style>
        {`
.custom-scrollbar::-webkit-scrollbar-track {  
  background-color: transparent; /* Color of the track (the area behind the scrollbar) */  
}  

.custom-scrollbar::-webkit-scrollbar-thumb {  
  background-color: transparent; /* Color of the scrollbar thumb */  
  border-radius: 4px; /* Rounded corners of the scrollbar thumb */  
}  

.custom-scrollbar::-webkit-scrollbar-thumb:hover {  
  background-color: #666; /* Color of the scrollbar thumb on hover */  
}  

.custom-scrollbar::-webkit-scrollbar-button {  
  display: none; /* Hides the scrollbar buttons */  
}  

.custom-scrollbar::-webkit-scrollbar-corner {  
  background-color: transparent; /* Color of the corner where the horizontal and vertical scrollbars meet */  
}
        `}
      </style>
    </Container>
  ) : null;
};

export default IndividualProductPage;

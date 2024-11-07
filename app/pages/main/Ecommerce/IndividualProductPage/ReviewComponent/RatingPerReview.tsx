import React from "react";
import {
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Text,
  Box,
  Icon,
  Grid,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

interface RatingData {
  star: number;
  count: number;
}
interface RatingPerReviewProps {
  ratings: RatingData[];
}
const RatingPerReview: React.FC<RatingPerReviewProps> = ({ ratings }) => {
  const totalReviews = ratings.reduce(
    (total, rating) => total + rating.count,
    0
  );

  return (
    <Grid
      p={4}
      shadow={"base"}
      borderWidth={1}
      rounded={"sm"}
      templateColumns={"1fr 1.25fr"}
    >
      <Box>
        <Text textAlign={"start"} fontSize={"lg"} fontWeight={700} mb={2}>
          Reviews
        </Text>
        {ratings.map((rating) => {
          const percentage = (rating.count / totalReviews) * 100;

          return (
            <Flex key={rating.star} align="center" width="100%" mb={1}>
              <Text
                fontWeight="bold"
                display={"flex"}
                color={"gray"}
                alignItems={"center"}
                gap={1}
              >
                {rating.star} <Icon as={StarIcon} fontSize={"14px"} />
              </Text>
              <Slider
                value={percentage}
                isReadOnly
                width="90%"
                ml={2}
                aria-label={`slider-${rating.star}-stars`}
              >
                <SliderTrack bg="gray.300" rounded={"full"} h={"8px"}>
                  <SliderFilledTrack
                    bgGradient="linear(to-r, pink.300, purple.300)" // Gradient color
                  />
                </SliderTrack>
              </Slider>
              <Text ml={4} fontWeight="bold" color={"gray.600"}>
                {percentage.toFixed(0)}%
              </Text>
            </Flex>
          );
        })}
      </Box>
      <Box></Box>
    </Grid>
  );
};

export default RatingPerReview;
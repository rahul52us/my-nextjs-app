import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { BiBookContent, BiBookmark, BiCart, BiUser } from "react-icons/bi";
import StarRatingIcon from "../../StarRatingIcon/StarRatingIcon";
import LinkText from "../../LinkText/LinkText";
import styled from "styled-components";

const CategoryThumbnailWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
`;

const ThumbnailElement = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: lightgray;
`;

const ThumbnailElementNoImage = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: lightgray;
`;

const CategoryCard = ({
  thumbnail,
  title,
  description,
  username,
  userPic,
  discountPrice,
  originalPrice,
  rating,
  totalCount,
  handleClick,
  item,
}: any) => {
  const [thumbnailLoadError, setThumbnailLoadError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const bookmarkColor = useColorModeValue("gray.600", "gray.500");

  return (
    <Card
      p={5}
      borderRadius={5}
      cursor={isHovered ? "pointer" : "default"}
      boxShadow={isHovered ? "lg" : "base"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      transition="box-shadow 0.3s ease"
    >
      <CategoryThumbnailWrapper>
        {thumbnailLoadError ? (
          <ThumbnailElementNoImage />
        ) : (
          <ThumbnailElement
            src={thumbnail}
            alt={thumbnail}
            onError={() => {
              setThumbnailLoadError(true);
            }}
          />
        )}
      </CategoryThumbnailWrapper>
      <Flex mt={5} justify="space-between" alignItems="center">
        <StarRatingIcon rating={rating} size="1rem" color="gold" />
        <IconButton
          icon={<BiBookmark />}
          aria-label="Bookmark"
          borderRadius={20}
          title="Bookmark"
        />
      </Flex>
      <Heading
        fontSize="lg"
        mb={2}
        mt={1}
        cursor="pointer"
        color={bookmarkColor}
        _hover={{ color: "blue" }}
        transition="0.5s ease-in-out"
        onClick={() => handleClick && handleClick(item)}
      >
        {title}
      </Heading>
      <Flex mt={2} justify="space-between" alignItems="center">
        <Text color="gray" fontSize="sm" display="flex" alignItems="center">
          <BiBookContent style={{ marginRight: "10px" }} color="gray" />{" "}
          {totalCount} Lessons
        </Text>
        <Text color="gray" fontSize="sm" display="flex" alignItems="center">
          <BiUser style={{ marginRight: "10px" }} color="gray" /> Students
        </Text>
      </Flex>

      <Text textAlign="start" mt={4} mb={1} color="gray.500" fontSize={14}>
        {description}
      </Text>

      <Flex mt={3} alignItems="center">
        <Avatar
          src={userPic}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            padding: "1px",
            border: "2px solid #2f57ef21",
          }}
          name={username}
          borderRadius="100%"
        />
        <Text ml={3} color="gray.500" size="sm" fontWeight="bold">
          By
        </Text>
        <Text fontSize="sm" ml={2} fontWeight="bold">
          {username}
        </Text>
      </Flex>

      <Flex mt={4} justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            {originalPrice ? `$ ${originalPrice}` : "Available for All"}
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="gray.500"
            ml={2}
            textDecor="line-through"
          >
            {discountPrice && `$ ${discountPrice}`}
          </Text>
        </Box>
        <LinkText icon={<BiCart />} text="Add To Cart" />
      </Flex>
    </Card>
  );
};

export default CategoryCard;

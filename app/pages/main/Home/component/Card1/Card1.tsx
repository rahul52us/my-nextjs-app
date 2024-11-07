import { Box, Image, Text, useColorModeValue } from "@chakra-ui/react";

interface Props {
  title: string;
  description: string;
  alt: string;
  image: string;
  id?: any;
}

const Card1 = ({ title, description, alt, image, id }: Props) => {
  return (
    <Box
      key={id}
      shadow="md"
      p="1.2rem"
      borderRadius="0.8rem"
      cursor="pointer"
      _hover={{ transform: "scale(1.02)", borderRadius: "0.8rem" }}
      transition="transform 0.3s ease-in-out"
      bg={useColorModeValue("white", "blue.800")}
      minH={"25rem"}
      m={2}
    >
      <Image src={image} alt={alt} w="auto" h="auto" objectFit="contain" />
      <Text mt={2} fontWeight="600" fontSize={{ base: "1.8rem", md: "1.4rem" }}>
        {title}
      </Text>
      <Text mt=".8rem">{description}</Text>
    </Box>
  );
};

export default Card1;
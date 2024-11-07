import { Flex, Box, Image, Text } from "@chakra-ui/react";

interface CardProps {
  isImageLeft?: boolean;
  imageSrc?: string;
  title?: string;
  description?: string;
}

const HomeCard = ({
  isImageLeft,
  imageSrc,
  title,
  description,
}: CardProps) => {
  return (
    <Flex
      p={3}
      gap={4}
      bgGradient="linear(to-r, purple.100, pink.200)"
      justify="space-between"
      maxW="md"
      borderRadius="30px"
      direction={isImageLeft ? "row-reverse" : "row"}
    >
      <Box flex={1} pl={isImageLeft ? 0 : 4} pr={isImageLeft ? 4 : 0} my="auto">
        <Text fontWeight="bold" fontSize="xl">
          {title}
        </Text>
        <Text>{description}</Text>
      </Box>
      <Image
        src={imageSrc}
        alt="headphone"
        boxSize={{ base: "80", md: "140" }}
        objectFit="cover"
      />
    </Flex>
  );
};

export default HomeCard;

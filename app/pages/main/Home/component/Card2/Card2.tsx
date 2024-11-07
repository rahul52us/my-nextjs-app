import { Box, Flex, Image, Text } from "@chakra-ui/react";

interface CardProps {
  title: string;
  about: string;
  image: string;
  bgColor?: string;
  cardBg?: string;
}

const Card2 = ({
  title,
  about,
  image,
  bgColor,
  cardBg = "white",
}: CardProps) => {
  return (
    <Box py={4} bg={bgColor}>
      <Flex
        bg={cardBg}
        rounded={{ base: "1rem", md: "6rem" }}
        direction={{ base: "column", md: "row" }}
        alignItems="flex-start"
        mx={10}
      >
        <Flex
          bg={{ base: "white", md: bgColor }}
          p={{ base: "1rem", md: "1.8rem" }}
          borderRadius={{ md: "0 6rem 6rem 0" }}
        >
          <Image src={image} alt={title} width={70} height={70} />
        </Flex>
        <Box p="1rem" flex="1">
          <Text color={bgColor} fontWeight="600" fontSize="xl">
            {title}
          </Text>
          <Text 
          color={'black'}
          // color={useColorModeValue("")}
          fontSize={{ base: "1rem", md: "lg" }}>{about}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Card2;

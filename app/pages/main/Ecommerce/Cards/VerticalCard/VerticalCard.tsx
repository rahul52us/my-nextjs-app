import { Box, Image, Text, useColorModeValue } from "@chakra-ui/react";

const VerticalCard = ({
  imageSrc,
  altText = "Image",
  title,
  subtitle,
  maxW = "14rem",
  borderRadius = "24px",
  lightBg = "linear(to-b, gray.50, gray.100)",
  darkBg = "linear(to-b, gray.700, gray.800)",
}: any) => {
  // Using useColorModeValue to handle light and dark modes
  const bgGradient = useColorModeValue(lightBg, darkBg);
  const titleColor = useColorModeValue("gray.800", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      maxW={maxW}
      borderRadius={borderRadius}
      overflow={"hidden"}
      bgGradient={bgGradient}
      cursor={"pointer"}
      _hover={{ transform: "scale(1.02)" }}
      transition="all 0.5s "
    >
      <Box position="relative" width="13rem" height="16rem" mb={4}>
        <Image
          src={imageSrc}
          alt={altText}
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>
      <Box pl={4} pb={4}>
        <Text color={subtitleColor} fontSize={"sm"}>
          {subtitle}
        </Text>
        <Text fontWeight="bold" fontSize="lg" color={titleColor}>
          {title}
        </Text>
      </Box>
    </Box>
  );
};

export default VerticalCard;

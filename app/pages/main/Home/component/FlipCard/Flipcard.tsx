import { Box, Text, Image, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  imageUrl: string;
  imageAlt: string;
  name: string;
  backDescription: string;
}

const FlipCard = ({ imageUrl, imageAlt, name, backDescription }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipInnerStyles: React.CSSProperties = {
    transition: "transform 0.6s",
    transformStyle: "preserve-3d",
    width: "100%",
    height: "100%",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const cardFaceStyles: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  };

  const backFaceStyles: React.CSSProperties = {
    ...cardFaceStyles,
    transform: "rotateY(180deg)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    textAlign: "center",
  };
  return (
    <Box
      cursor={"pointer"}
      h="20rem"
      w={"14rem"}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      position="relative"
    >
      <Box style={flipInnerStyles}>
        <Box
          style={cardFaceStyles}
          rounded={16}
          boxShadow={"md"}
          p={"1rem"}
          bg={useColorModeValue("pink.100", "blue.800")}
        >
          <Image src={imageUrl} alt={imageAlt} objectFit="contain" />
          <Text
            fontSize="1.4rem"
            fontWeight="500"
            textAlign="center"
            pt="1.5rem"
            color={"black"}
          >
            {name}
          </Text>
          <Text textAlign="end" display={{ base: "block", lg: "none" }}>
            Learn More
          </Text>
        </Box>
        <Box style={backFaceStyles}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            rounded={16}
            h={"100%"}
            objectFit="cover"
            position="fixed"
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bg="rgba(0, 0, 0, 0.6)"
            rounded={16}
            backdropFilter={"blur(3px)"}
          />
          <Text lineHeight="2rem" color="white" zIndex={2}>
            {backDescription}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
export default FlipCard;

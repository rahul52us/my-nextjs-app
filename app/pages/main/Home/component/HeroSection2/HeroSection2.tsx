import {
  Flex,
  Image,
  Text,
  Box,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import HeroImage from "./heroimage.png";
import { useNavigate } from "react-router-dom";
import { main } from "../../../../../config/constant/routes";

const HeroSection2 = () => {
  const navigate = useNavigate()
  return (
    <Flex
      bg={useColorModeValue(
        "linear-gradient(70deg, rgba(208,106,255,1) 0%, rgba(255,167,234,1) 51%, rgba(255,205,247,1) 100%)",
        "linear-gradient(70deg, rgba(62,27,78,1) 0%, rgba(103,23,118,1) 51%, rgba(234,6,198,1) 100%)"
      )}
      direction={{ base: "column", lg: "row" }}
      align="center"
      justify="center"
      p={{ base: 4, md: 8, lg: "6rem" }}
      pt={{lg : "2rem"}}
      gap={{ base: 8, lg: 16 }} // Use gap for spacing between items
    >
      <Box
        maxW={{ base: "100%", lg: "50%" }}
        textAlign={{ base: "center", lg: "left" }}
        mb={{ base: 8, lg: 0 }}
      >
        <Text
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          fontWeight={700}
          color="white"
          fontFamily={"cursive"}
          mb={4}
        >
          Revolutionize Your Business with Digital Solutions
        </Text>
        <Text
          fontSize={{ base: "md", md: "lg", lg: "xl" }}
          color="white"
          mb={6}
        >
          Transform how you manage your operations, enhance efficiency across
          every department, and drive sustainable growth with our comprehensive
          digital tools.
        </Text>
        <Button
          variant={"solid"}
          colorScheme={"purple"}
          rounded={"full"}
          size={"lg"}
          _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
          _focus={{ boxShadow: "outline" }}
          onClick={() => navigate(main.contact)}
        >
          Get Started
        </Button>
      </Box>

      <Image
        src={HeroImage}
        w={{ base: "100%", lg: "50%" }}
        borderRadius="xl"
        objectFit="cover"
      />
    </Flex>
  );
};

export default HeroSection2;

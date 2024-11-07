import React from "react";
import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";

interface Card {
  icon: string;
  heading: string;
  text: string;
}

interface WhyUsProps {
  cards: Card[];
  whyus: string;
}

const WhyUs: React.FC<WhyUsProps> = ({ cards, whyus }: WhyUsProps) => {
  return (
    <>
      <Box position="relative">
        <Image
          position="absolute"
          width="100%"
          height={{ base: "100%", md: "100vh" }}
          objectFit="cover"
          src={whyus}
          filter={"brightness(0.5)"}
        />

        <Box position={"relative"} p={{ base: 6, md: 12, lg: 20 }}>
          <Heading
            color={"white"}
            fontSize={{ base: "2xl", md: "4xl", lg: "xxx-large" }}
          >
            Why Join The Honors College ?
          </Heading>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 6, md: 20 }}
            p={{ base: 2, md: 16, lg: 10 }}
          >
            {cards.map((card, index) => (
              <Flex key={index} alignItems="center">
                <Box
                  mr={{ md: "-3rem", lg: "-3.5rem" }}
                  zIndex={1}
                  display={{ base: "none", md: "block" }}
                >
                  <Image src={card.icon} w={"10rem"} objectFit={"contain"} />
                </Box>
                <Box
                  p={{ base: "1rem", md: "2rem 2rem 2rem 4rem" }}
                  bg="gray.300"
                  rounded={{ base: 12, md: "unset " }}
                >
                  <Box
                    zIndex={1}
                    display={{ base: "block", md: "none" }}
                    justifyContent={"center"}
                  >
                    <Center>
                      <Image src={card.icon} w={"24"} />
                    </Center>
                  </Box>
                  <Heading
                    textAlign={{ base: "center", md: "unset" }}
                    fontSize={{ base: "xl", md: "2xl", lg: "2xl" }}
                    color={"black"}
                  >
                    {card.heading}
                  </Heading>
                  <Text
                    color={"black"}
                    my={2}
                    textAlign={{ base: "center", md: "unset" }}
                  >
                    {card.text}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default WhyUs;

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const carouselSlides = [
  {
    image: "/Auth-image.jpg",
    title: "Build Modern Applications",
    subtitle: "Laravel, React, AWS & Cloud Solutions",
  },
  {
    image: "/Auth-image.jpg",
    title: "Scale Your Business",
    subtitle: "Enterprise Technology Solutions",
  },
  {
    image: "/Auth-image.jpg",
    title: "Cloud Powered Future",
    subtitle: "Secure and Reliable Infrastructure",
  },
  {
    image: "/Auth-image.jpg",
    title: "Developer Productivity",
    subtitle: "All Tools In One Platform",
  },
];

type AuthCarouselProps = {
  fullSize?: boolean;
};

const AuthCarousel = ({ fullSize = false }: AuthCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.4)",
    "rgba(255,255,255,0.03)"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      position="relative"
      w={fullSize ? "100%" : "90%"}
      maxW={fullSize ? "100%" : "720px"}
      h={fullSize ? "100%" : { base: "260px", md: "90%" }}
      mx={fullSize ? 0 : "auto"}
      my={fullSize ? 0 : { base: 4, md: 8 }}
      overflow="hidden"
      borderRadius={fullSize ? 0 : { base: "0", md: "28px" }}
      boxShadow={fullSize ? "none" : "0 20px 40px rgba(2,15,30,0.35)"}
      border={fullSize ? "none" : "1px solid rgba(255,255,255,0.06)"}
      bg={fullSize ? "transparent" : cardBg}
    >
      {carouselSlides.map((slide, idx) => (
        <Box
          key={idx}
          position="absolute"
          inset={0}
          opacity={idx === currentSlide ? 1 : 0}
          transform={idx === currentSlide ? "scale(1)" : "scale(1.03)"}
          transition="opacity 0.8s ease-in-out, transform 0.8s ease-in-out"
          bgImage={`url('${slide.image}')`}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: "rgba(10, 31, 51, 0.45)",
            zIndex: 1,
          }}
        />
      ))}

      <Flex
        position="relative"
        zIndex={2}
        h="100%"
        direction="column"
        align="center"
        justify={fullSize ? "flex-start" : "center"}
        pt={fullSize ? { base: 16, md: 0 } : 0}
        color="white"
        px={6}
        textAlign="center"
      >
        <Box>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="800"
            letterSpacing="-0.04em"
            mb={4}
            lineHeight="1"
          >
            Tool
            <Text as="span" color="#7ec8e3">
              sahayata
            </Text>
          </Text>

          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="700"
            mb={3}
            letterSpacing="-0.5px"
          >
            {carouselSlides[currentSlide].title}
          </Text>

          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="whiteAlpha.800"
            maxW="400px"
          >
            {carouselSlides[currentSlide].subtitle}
          </Text>
        </Box>
      </Flex>

      <HStack
        position="absolute"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        zIndex={3}
        spacing={2}
        display={fullSize ? "none" : "flex"}
      >
        {carouselSlides.map((_, idx) => (
          <Box
            key={idx}
            as="button"
            w={2}
            h={2}
            borderRadius="full"
            bg={idx === currentSlide ? "white" : "whiteAlpha.400"}
            transition="all 0.3s ease"
            onClick={() => setCurrentSlide(idx)}
            _hover={{ bg: "whiteAlpha.600" }}
          />
        ))}
      </HStack>
    </Box>
  );
};

export const AuthSplitLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pageBg = useColorModeValue(
    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    "linear-gradient(135deg, #0a1f33 0%, #132d47 100%)"
  );

  return (
    <Flex
      w="100%"
      minH="100dvh"
      direction={{ base: "column", md: "row" }}
      position="relative"
      overflow="hidden"
      bgGradient={pageBg}
    >
      <Box
        display={{ base: "none", md: "block" }}
        flex={{ base: 0, md: 0.5 }}
        h="100dvh"
        position="relative"
      >
        <AuthCarousel />
      </Box>

      <Box
        display={{ base: "block", md: "none" }}
        position="absolute"
        inset={0}
        zIndex={0}
      >
        <AuthCarousel fullSize />
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.6) 100%)"
        />
      </Box>

      <Flex
        display={{ base: "flex", md: "none" }}
        position="relative"
        zIndex={2}
        w="100%"
        h="100vh"
        align="center"
        justify="flex-start"
        px={4}
        pt={20}
        pb={6}
      >
        {children}
      </Flex>

      <Flex
        display={{ base: "none", md: "flex" }}
        flex={{ base: 1, md: 0.5 }}
        direction="column"
        justify="center"
        align="center"
        px={{ base: 6, md: 8, lg: 10 }}
        py={{ base: 8, md: 12 }}
        bg={pageBg}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default AuthCarousel;
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

const AuthCarousel = () => {
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
      w="90%"
      maxW="720px"
      h={{ base: "260px", md: "90%" }}
      mx="auto"
      my={{ base: 4, md: 8 }}
      overflow="hidden"
      borderRadius={{ base: "0", md: "28px" }}
      boxShadow="0 20px 40px rgba(2,15,30,0.35)"
      border="1px solid rgba(255,255,255,0.06)"
      bg={cardBg}
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
        justify="center"
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
      bgGradient={pageBg}
    >
      <Box
        flex={{ base: 0, md: 0.5 }}
        h={{ base: "300px", md: "100dvh" }}
        display={{ base: "none", md: "block" }}
        position="relative"
      >
        <AuthCarousel />
      </Box>

      <Box
        h="280px"
        display={{ base: "block", md: "none" }}
        position="relative"
        w="full"
      >
        <AuthCarousel />
      </Box>

      {children}
    </Flex>
  );
};

export default AuthCarousel;
'use client';

import { Box, Flex, Heading, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1600', // Windmills at sunset (Very close to TataROW UAT login)
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600', // Solar panels sunset
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1600', // Clean energy windmills
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600'  // Work/Automation
];

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      minH="100dvh"
      width="100%"
      overflowX="hidden"
      position="relative"
      bgColor="gray.950"
    >
      {/* Background Slideshow with Smooth Fades */}
      {BACKGROUND_IMAGES.map((img, idx) => (
        <Box
          key={img}
          position="absolute"
          inset={0}
          bgImage={`url('${img}')`}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          opacity={idx === bgIndex ? 1 : 0}
          transition="opacity 1.5s ease-in-out"
          zIndex={0}
        />
      ))}

      {/* Dark overlay to ensure high contrast */}
      <Box 
        position="absolute" 
        inset={0} 
        bg="linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)" 
        zIndex={1}
      />

      <Flex
        minH="100dvh"
        width="100%"
        position="relative"
        zIndex={2}
        flexDirection={{ base: "column", md: "row" }}
        alignItems="stretch"
      >
        {/* Left Side: Brand Identity (Visible on medium screens and up) */}
        <Flex
          flex={1}
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          justifyContent="center"
          pl={{ base: 8, lg: 20 }}
          pr={{ base: 4, lg: 8 }}
          color="white"
          userSelect="none"
        >
          <Box maxW="550px">
            <Heading
              as="h1"
              fontSize={{ md: "5xl", lg: "7xl" }}
              fontWeight="medium"
              letterSpacing="tight"
              mb={4}
              lineHeight="none"
            >
              Toolsahayata
            </Heading>
            <Box 
              w="100%" 
              h="2px" 
              bg="rgba(255, 255, 255, 0.4)" 
              my={6} 
            />
            <Text
              fontSize={{ md: "xl", lg: "3xl" }}
              fontWeight="semibold"
              lineHeight="short"
              color="whiteAlpha.900"
            >
              All-in-One Developer Utilities & Workflow Automation Hub
            </Text>
          </Box>
        </Flex>

        {/* Right Side: Authentication Card */}
        <Flex
          flex={{ base: "none", md: "1" }}
          w={{ base: "100%", md: "auto" }}
          minH={{ base: "100dvh", md: "auto" }}
          alignItems="center"
          justifyContent={{ base: "center", md: "flex-end" }}
          pr={{ base: 4, md: 8, lg: 24 }}
          pl={{ base: 4, md: 8 }}
          py={{ base: 6, md: 0 }}
        >
          <Box
            width="100%"
            maxW="520px"
            bg="transparent"
            borderRadius="0"
            boxShadow="none"
          >
            {children}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AuthenticationLayout;

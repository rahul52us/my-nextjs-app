'use client';

import { Box, Flex, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const overlay = useColorModeValue(
    'linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.62) 48%, rgba(255,255,255,0.95))',
    'linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.5) 48%, rgba(0,0,0,0.78))'
  );

  return (
    <Box
      minH="100dvh"
      width="100%"
      overflowX="hidden"
      overflowY={{ base: "auto", md: "hidden" }}
      position="relative"
      bgImage="url('/Auth-image.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgColor={useColorModeValue('gray.50', 'gray.900')}
    >
      <Box position="absolute" inset={0} bg={overlay} />


      <Flex
        minH="100dvh"
        width="100%"
        position="relative"
        px={{ base: 4, md: 8, xl: 16 }}
        py={{ base: 4, md: 0 }}
        justifyContent="center"
        alignItems={{ base: "flex-start", md: "center" }}
      >
        <Box
          width={{ base: '100%', md: '46%', lg: '38%' }}
          maxW="560px"
          maxH="none"
          overflowY="visible"
          bg="transparent"
          borderRadius="0"
          boxShadow="none"
          p={{ base: 0, md: 4 }}
          mb={{ base: 4, md: 0 }}
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AuthenticationLayout;

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
      height="100vh"
      width="100%"
      overflow="hidden"
      position="relative"
      bgImage="url('/Auth-image.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgColor={useColorModeValue('gray.50', 'gray.900')}
    >
      <Box position="absolute" inset={0} bg={overlay} />

      <Flex
        minHeight="100vh"
        width="100%"
        position="relative"
        px={{ base: 4, md: 8, xl: 16 }}
        py={{ base: 10, md: 14 }}
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width={{ base: '100%', md: '46%', lg: '38%' }}
          maxW="560px"
          maxHeight="calc(100vh - 84px)"
          overflow="hidden"
          bg="transparent"
          borderRadius="0"
          boxShadow="none"
          p={{ base: 5, md: 8 }}
          mb={{ base: 10, md: 12 }}
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AuthenticationLayout;
'use client';

import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      minH="100dvh"
      width="100%"
      overflowX="hidden"
      bg="gray.100"
      _dark={{ bg: 'gray.800' }}
      display="flex"
      alignItems="stretch"
    >
      <Box width="100%" display="flex">
        {children}
      </Box>
    </Box>
  );
};

export default AuthenticationLayout;
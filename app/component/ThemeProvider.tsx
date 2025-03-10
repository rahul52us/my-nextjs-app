// app/components/ThemeProvider.tsx
'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}

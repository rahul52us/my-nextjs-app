import { Box, VStack, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;

  return (
    <Box width="250px" height="100vh" bg="gray.800" color="white" p="4">
      <VStack align="start" spacing="4">
        <NextLink href="/" passHref>
          <Link color={isActive('/') ? 'teal.300' : 'white'}>Base64 to Text</Link>
        </NextLink>
        <NextLink href="/base64-to-image" passHref>
          <Link color={isActive('/base64-to-image') ? 'teal.300' : 'white'}>
            Base64 to Image
          </Link>
        </NextLink>
      </VStack>
    </Box>
  );
};

export default Sidebar;

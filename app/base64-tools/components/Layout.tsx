import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Box } from '@chakra-ui/react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box ml="260px" p="6" flex="1" bg="gray.50">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

'use client';

import Link from "next/link";
import Sidebar from "./layoutComponent/sidebar/Sidebar"; // Assuming Sidebar is in the same directory
import { Box, Flex, Text, useBreakpointValue, IconButton, useDisclosure } from "@chakra-ui/react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true }); // Sidebar is open by default
  const isMobile = useBreakpointValue({ base: true, md: false }); // Checking for mobile

  const mainContentMarginLeft = isMobile && !isOpen ? "0" : { base: "0", md: "250px" }; // Combine the logic for marginLeft

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {/* Sidebar */}
      <Box
        width={{ base: "100%", md: "250px" }} // Sidebar takes full width on mobile
        display={isMobile ? (isOpen ? "block" : "none") : "block"} // Show on mobile only if isOpen
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        bg="gray.800"
        color="white"
        boxShadow="lg"
        zIndex={9999} // Ensure it's on top
        transition="transform 0.3s ease-in-out"
        transform={isOpen ? "translateX(0)" : "translateX(-100%)"} // Sidebar slides in/out
      >
        <Sidebar />
      </Box>

      {/* Main Content Section */}
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        marginLeft={mainContentMarginLeft} // Apply the combined marginLeft value
        w="full"
        transition="margin-left 0.3s ease-in-out"
      >
        {/* Header */}
        <Flex
          bg="teal.700"
          p={4}
          position="fixed"
          width="100%"
          alignItems="center"
          zIndex={10}
          boxShadow="md"
          paddingX={{ base: "4", md: "8" }}
        >
          {/* Hamburger menu for mobile */}
          {isMobile && (
            <IconButton
              icon={isOpen ? <FaTimes /> : <FaBars />}
              aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
              variant="outline"
              color="white"
              onClick={onToggle}
              mr={4}
            />
          )}
          <Flex gap={6}>
            <Link href="/" passHref>
              <Text fontSize="lg" color="white">Home</Text>
            </Link>
            <Link href="/about" passHref>
              <Text fontSize="lg" color="white">About</Text>
            </Link>
            <Link href="/contact" passHref>
              <Text fontSize="lg" color="white">Contact</Text>
            </Link>
          </Flex>
        </Flex>

        {/* Main Layout Content */}
        <Box as="main" flex="1" p={4} bg="gray.50" w="full" pt="80px">
          {children}
        </Box>

        {/* Footer */}
        <Box bg="#2C3E50" p={4} color="white" textAlign="center" width="100%" boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)" position="relative" mt="auto">
          <Text>&copy; 2024 My Website. All rights reserved.</Text>
        </Box>
      </Box>
    </Flex>
  );
}

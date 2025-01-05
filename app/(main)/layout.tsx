"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // Use usePathname for detecting route changes
import {
  Box,
  Flex,
  Spinner,
  Avatar,
  useDisclosure,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from "@chakra-ui/react";
import Sidebar from "./layoutComponent/sidebar/Sidebar";
import { childrenHeight, footerHeight, headerHeight } from "./layoutComponent/utils/constant";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [loading, setLoading] = useState(false);
  const pathname = usePathname(); // Monitors the current route

  useEffect(() => {
    setLoading(true);

    // Simulate loading until component is fully mounted
    const timeout = setTimeout(() => setLoading(false), 500);

    return () => clearTimeout(timeout);
  }, [pathname]); // Trigger on pathname change

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Header */}
      <Flex
        bgGradient="linear(to-r, teal.600, teal.800)"
        p={4}
        align="center"
        justify="space-between"
        boxShadow="sm"
        zIndex={10}
        position="fixed"
        top="0"
        left="0"
        right="0"
        height={headerHeight}
      >
        {isMobile && (
          <button onClick={onOpen}>Menu</button>
        )}
        <Flex align="center" gap={2}>
          <Avatar size="sm" name="Company Logo" src="/path/to/logo.png" />
          <Box>HRMS Tools</Box>
        </Flex>
      </Flex>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="gray.800" color="white">
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : (
        <Box
          width="260px"
          bg="gray.800"
          color="white"
          position="fixed"
          top="0"
          bottom="0"
          boxShadow="lg"
          zIndex={9999}
          height={"100vh"}
          overflowY={"auto"}
        >
          <Sidebar />
        </Box>
      )}

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: "0", md: "260px" }}
        p={2}
        pt={{ base: "60px", md: "80px" }}
        height={childrenHeight}
      >
        {loading ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : (
          children
        )}
      </Box>

      {/* Footer */}
      <Box bg="blue.900" color="white" textAlign="center" py={4} height={footerHeight}>
        &copy; 2024 HRMS Tools. All rights reserved.
      </Box>
    </Flex>
  );
}

"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Flex,
  Text,
  IconButton,
  InputGroup,
  Input,
  InputLeftElement,
  Avatar,
  useDisclosure,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  List,
  ListItem,
} from "@chakra-ui/react";
import { FaBars, FaSearch } from "react-icons/fa";
import Sidebar from "./layoutComponent/sidebar/Sidebar";
import { features } from "./layoutComponent/utils/constant";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Search logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query) {
      setResults([]);
      return;
    }

    const allFeatures = Object.values(features).flat();
    const filtered = allFeatures.filter((item: any) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Header */}
      <Flex
        bg="teal.700"
        p={4}
        align="center"
        justify="space-between"
        boxShadow="sm"
        zIndex={10}
        position="fixed"
        top="0"
        left="0"
        right="0"
      >
        {/* Hamburger Menu for Mobile */}
        {isMobile && (
          <IconButton
            icon={<FaBars />}
            aria-label="Open Sidebar"
            onClick={onOpen}
            colorScheme="teal"
            variant="outline"
            mr={2}
          />
        )}

        {/* Logo */}
        <Flex align="center" gap={2}>
          <Avatar size="sm" name="Company Logo" src="/path/to/logo.png" />
          <Text fontSize="xl" fontWeight="bold" color="white">
            HRMS Tools
          </Text>
        </Flex>

        {/* Search */}
        <Box
          position="relative"
          width="300px"
          display={{ base: "none", md: "inline" }}
          ref={dropdownRef}
        >
          <InputGroup>
            <InputLeftElement>
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search tools or converters"
              bg="white"
              borderRadius="md"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
          {results.length > 0 && (
            <List
              bg="white"
              mt={2}
              borderRadius="lg"
              boxShadow="xl"
              position="absolute"
              width="100%"
              zIndex={100}
              border="1px solid"
              borderColor="gray.200"
              overflowX="hidden"
              overflowY={'auto'}
              maxH={'400px'}
            >
              {results.map((result: any, index: number) => (
                <ListItem
                  key={result.path}
                  px={4}
                  py={3}
                  _hover={{
                    bg: "teal.50",
                    cursor: "pointer",
                    transform: "scale(1.01)",
                    transition:
                      "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
                  }}
                  borderBottom={
                    index < results.length - 1 ? "1px solid" : "none"
                  }
                  borderColor="gray.100"
                >
                  <Link
                    href={result.path}
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <Flex align="center" gap={4}>
                      <Box as={result.icon} size="24px" color="teal.500" />
                      <Text
                        fontWeight="semibold"
                        fontSize="md"
                        color="gray.700"
                      >
                        {result.name}
                      </Text>
                    </Flex>
                  </Link>
                </ListItem>
              ))}
            </List>
          )}
          </Box>

        {/* Profile */}
        <Flex align="center">
          <Avatar size="sm" src="/path/to/avatar.jpg" />
          <Text ml={2} fontWeight="bold" color="white">
            John Doe
          </Text>
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
      >
        {children}
      </Box>

      {/* Footer */}
      <Box bg="teal.800" color="white" textAlign="center" py={4}>
        &copy; 2024 HRMS Tools. All rights reserved.
      </Box>
    </Flex>
  );
}

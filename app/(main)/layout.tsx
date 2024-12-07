"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import debounce from "lodash.debounce";
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
import { childrenHeight, features, footerHeight, headerHeight } from "./layoutComponent/utils/constant";

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

  // Debounced Search Handler
  const handleSearchDebounced = debounce(
    (query: string) => handleSearch(query),
    10
  );

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
        {/* Hamburger Menu for Mobile */}
        {isMobile && (
          <IconButton
            icon={<FaBars />}
            aria-label="Open Sidebar"
            onClick={onOpen}
            colorScheme="whiteAlpha"
            variant="ghost"
            mr={2}
          />
        )}

        {/* Logo */}
        <Flex align="center" gap={2}>
          <Avatar size="sm" name="Company Logo" src="/path/to/logo.png" />
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color="white"
            textShadow="1px 1px 2px rgba(0,0,0,0.5)"
          >
            HRMS Tools
          </Text>
        </Flex>

        {/* Search */}
        <Box
          position="relative"
          flex="1"
          maxWidth="400px"
          display={{ base: "none", md: "block" }}
          mx={4}
          ref={dropdownRef}
        >
          <InputGroup>
            <InputLeftElement>
              <FaSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search tools or converters"
              bg="white"
              border="none"
              borderRadius="lg"
              px={4}
              py={2}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 6px rgba(0, 128, 128, 0.6)",
              }}
              _hover={{
                boxShadow: "0 0 4px rgba(0, 128, 128, 0.3)",
              }}
              value={searchQuery}
              onChange={(e) => handleSearchDebounced(e.target.value)}
            />
          </InputGroup>

          {results.length > 0 && (
            <List
              bg="white"
              mt={2}
              borderRadius="lg"
              boxShadow="lg"
              position="absolute"
              width="100%"
              zIndex={100}
              border="1px solid"
              borderColor="gray.200"
              maxHeight="300px"
              overflowY="auto"
              overflowX="hidden"
            >
              {results.map((result: any, index: number) => (
                <ListItem
                  key={result.path}
                  px={4}
                  py={3}
                  _hover={{
                    bg: "teal.50",
                    cursor: "pointer",
                    transform: "scale(1.02)",
                    transition: "transform 0.2s ease-in-out",
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
                        dangerouslySetInnerHTML={{
                          __html: result.name.replace(
                            new RegExp(searchQuery, "gi"),
                            (match: any) =>
                              `<mark style="background: yellow;">${match}</mark>`
                          ),
                        }}
                      />
                    </Flex>
                  </Link>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Profile */}
        <Flex align="center" gap={2} cursor="pointer">
          <Avatar
            size="sm"
            src="/path/to/avatar.jpg"
            border="2px solid white"
            _hover={{
              boxShadow: "0 0 4px rgba(255, 255, 255, 0.8)",
            }}
          />
          <Text
            ml={2}
            fontWeight="bold"
            color="white"
            fontSize="sm"
            display={{ base: "none", md: "block" }}
          >
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
        {children}
      </Box>

      {/* Footer */}
      <Box bg="blue.900" color="white" textAlign="center" py={4} height={footerHeight}>
        &copy; 2024 HRMS Tools. All rights reserved.
      </Box>
    </Flex>
  );
}
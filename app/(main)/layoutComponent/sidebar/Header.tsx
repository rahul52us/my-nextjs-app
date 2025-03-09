"use client";
import React, { useState } from "react";
import {
  Flex,
  IconButton,
  Avatar,
  Text,
  InputGroup,
  Input,
  InputLeftElement,
  List,
  ListItem,
  Box,
} from "@chakra-ui/react";
import { FaBars, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import debounce from "lodash.debounce";
import { features } from "../utils/constant";
import Link from "next/link";

interface HeaderProps {
  isMobile: any;
  onOpen: () => void;
  onClose: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({
  isMobile,
  onOpen,
  onClose,
  sidebarOpen,
  toggleSidebar,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);
    if (!query) {
      setResults([]);
      return;
    }
    const filteredResults = Object.values(features)
      .flat()
      .filter((item: any) => item.name.toLowerCase().includes(query.toLowerCase()));
    setResults(filteredResults);
  }, 200);

  return (
    <Flex
      as="header"
      bgGradient="linear(to-r, teal.800, teal.900, blue.900, blue.800)" // Smoother, richer gradient
      p={{ base: 3, md: 4 }}
      align="center"
      justify="space-between"
      boxShadow="0 6px 16px rgba(0, 0, 0, 0.4)" // Deeper shadow for elevation
      zIndex={10}
      position="fixed"
      top="0"
      left="0"
      right="0"
      height={{ base: "60px", md: "70px" }} // Slightly taller for presence
      transition="all 0.3s ease"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.15)"
      _after={{
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "10%",
        right: "10%",
        height: "1px",
        bgGradient: "linear(to-r, transparent, teal.400, transparent)", // Subtle accent line
      }}
    >
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          icon={<FaBars />}
          aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          onClick={sidebarOpen ? onClose : onOpen}
          color="white"
          bg="rgba(255, 255, 255, 0.2)" // More pronounced glass effect
          _hover={{
            bg: "rgba(255, 255, 255, 0.3)",
            transform: "scale(1.1)",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
          _active={{ bg: "rgba(255, 255, 255, 0.4)" }}
          borderRadius="full"
          boxShadow="0 2px 6px rgba(0, 0, 0, 0.25)"
          mr={{ base: 2, md: 3 }}
          size="md"
          transition="all 0.2s ease"
        />
      )}

      {/* Logo */}
      <Flex align="center" gap={{ base: 2, md: 3 }}>
        <Avatar
          size={{ base: "sm", md: "md" }}
          name="HRMS Tools Logo"
          src="/path-to-logo.png"
          bg="white"
          p={1}
          border="3px solid"
          borderColor="teal.400" // Vibrant teal border
          borderRadius="full"
          transition="all 0.3s ease"
          _hover={{
            transform: "scale(1.2)",
            boxShadow: "0 0 15px rgba(56, 178, 172, 0.7)", // Stronger glow
            borderColor: "teal.200",
          }}
          cursor="pointer"
          onClick={() => window.location.href = "/"} // Navigate to home
          boxShadow="0 2px 6px rgba(0, 0, 0, 0.2)" // Default shadow
        />
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="black" // Bolder for impact
          color="white"
          letterSpacing="tight"
          bgGradient="linear(to-r, teal.200, white, teal.100)" // More dynamic gradient
          bgClip="text"
          textShadow="0 3px 8px rgba(0, 0, 0, 0.5)" // Deeper shadow
          transition="all 0.3s ease"
          _hover={{
            transform: "scale(1.05)",
            textShadow: "0 3px 10px rgba(56, 178, 172, 0.6)", // Glow on hover
          }}
        >
          HRMS Tools
        </Text>
      </Flex>

      {/* Sidebar Toggle for Desktop */}
      {!isMobile && (
        <IconButton
          icon={sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          onClick={toggleSidebar}
          color="white"
          bg="rgba(255, 255, 255, 0.2)"
          _hover={{
            bg: "rgba(255, 255, 255, 0.3)",
            transform: "scale(1.1)",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
          _active={{ bg: "rgba(255, 255, 255, 0.4)" }}
          borderRadius="full"
          boxShadow="0 2px 6px rgba(0, 0, 0, 0.25)"
          mr={{ base: 2, md: 3 }}
          size="md"
          transition="all 0.2s ease"
        />
      )}

      {/* Search Input */}
      <Box position="relative" maxW={{ base: "50%", md: "400px" }} mx={{ base: 2, md: 4 }}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.600" />
          </InputLeftElement>
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            bg="whiteAlpha.950" // Brighter white
            border="none"
            borderRadius="full"
            px={4}
            py={{ base: 2, md: 3 }}
            boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.06), 0 3px 10px rgba(0, 0, 0, 0.15)" // Enhanced shadow
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.6)" }}
            _hover={{ boxShadow: "0 5px 14px rgba(0, 0, 0, 0.2)" }}
            placeholder="Search tools or converters"
            fontSize={{ base: "sm", md: "md" }}
            transition="all 0.2s ease"
            _placeholder={{ color: "gray.500" }}
          />
        </InputGroup>
        {results.length > 0 && (
          <List
            bg="white"
            mt={2}
            borderRadius="lg"
            boxShadow="0 6px 16px rgba(0, 0, 0, 0.25)"
            position="absolute"
            width="100%"
            zIndex={100}
            border="1px solid"
            borderColor="gray.200"
            maxHeight="300px"
            overflowY="auto"
            sx={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { background: "teal.400", borderRadius: "3px" },
              "&::-webkit-scrollbar-thumb:hover": { background: "teal.500" },
            }}
          >
            {results.map((result: any, index: number) => (
              <ListItem
                key={result.path}
                px={4}
                py={3}
                _hover={{ bg: "teal.50", transform: "scale(1.01)" }}
                transition="all 0.2s ease"
                borderBottom={index < results.length - 1 ? "1px solid" : "none"}
                borderColor="gray.100"
              >
                <Link href={result.path} onClick={() => setResults([])}>
                  <Flex align="center" gap={3}>
                    <Box as={result.icon} size="20px" color="teal.500" />
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      {result.name}
                    </Text>
                  </Flex>
                </Link>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Profile Section */}
      <Flex align="center" gap={{ base: 2, md: 3 }} cursor="pointer">
        <Avatar
          size={{ base: "sm", md: "md" }}
          src="/path-to-avatar.jpg"
          border="3px solid"
          borderColor="teal.400"
          transition="all 0.3s ease"
          _hover={{
            transform: "scale(1.2)",
            boxShadow: "0 0 15px rgba(56, 178, 172, 0.7)", // Matching glow
            borderColor: "teal.200",
          }}
          boxShadow="0 2px 6px rgba(0, 0, 0, 0.2)"
        />
        <Text
          ml={2}
          fontWeight="bold" // Bolder for emphasis
          color="white"
          fontSize={{ base: "sm", md: "md" }}
          display={{ base: "none", md: "block" }}
          textShadow="0 2px 4px rgba(0, 0, 0, 0.4)"
          bgGradient="linear(to-r, teal.200, white)"
          bgClip="text"
          _hover={{
            transform: "scale(1.05)",
            textShadow: "0 2px 6px rgba(56, 178, 172, 0.6)",
          }}
          transition="all 0.3s ease"
        >
          John Doe
        </Text>
      </Flex>
    </Flex>
  );
}
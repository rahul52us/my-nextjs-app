"use client";
import React from "react";
import {
  Flex,
  IconButton,
  Avatar,
  Text,
  InputGroup,
  Input,
  InputLeftElement,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaBars, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import debounce from "lodash.debounce";
import { features } from "../utils/constant";

interface HeaderProps {
  isMobile: boolean;
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);

  const handleSearch = debounce((query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    const filteredResults = Object.values(features)
      .flat()
      .filter((item : any) => item.name.toLowerCase().includes(query.toLowerCase()));
    setResults(filteredResults);
  }, 200);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
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
      height="60px"
    >
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          icon={<FaBars />}
          aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          onClick={sidebarOpen ? onClose : onOpen}
          colorScheme="whiteAlpha"
          variant="ghost"
          mr={2}
        />
      )}

      {/* Logo */}
      <Flex align="center" gap={2}>
        <Avatar size="sm" name="HRMS Tools Logo" src="/path-to-logo.png" />
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="white"
          textShadow="1px 1px 2px rgba(0,0,0,0.5)"
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
          colorScheme="whiteAlpha"
          variant="ghost"
          mr={2}
        />
      )}

      {/* Search Input */}
      <InputGroup maxW="400px">
        <InputLeftElement>
          <FaSearch color="gray.400" />
        </InputLeftElement>
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
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
          placeholder="Search tools or converters"
        />
      </InputGroup>

      {/* Profile Section */}
      <Flex align="center" gap={2} cursor="pointer">
        <Avatar
          size="sm"
          src="/path-to-avatar.jpg"
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
  );
}

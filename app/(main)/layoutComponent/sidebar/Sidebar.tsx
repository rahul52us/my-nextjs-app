'use client';

import React, { useState, useEffect } from "react";
import { Box, VStack, Text, Icon, Collapse, Divider, Input, InputGroup, InputLeftElement, Tooltip, Flex } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { childrenHeight, features, footerHeight, headerHeight } from "../utils/constant";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSections, setActiveSections] = useState<{ [key: string]: boolean }>({
    decoders: true,
    encoders: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle a specific section
  const toggleSection = (section: string) => {
    setActiveSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Navigate to a specific route
  const handleRoute = (path: string) => {
    router.push(path);
  };

  // Filter features based on the search query
  const filteredFeatures = (featuresList: any[]) =>
    featuresList.filter((feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Set the active sections based on the current path
  useEffect(() => {
    const newActiveSections: { [key: string]: boolean } = {};
    Object.entries(features).forEach(([section, featuresList]: any) => {
      newActiveSections[section] = featuresList.some(
        (feature: any) => feature.path === pathname
      );
    });
    setActiveSections(newActiveSections);
  }, [pathname]);

  return (
    <Box bg="blue.900" color="white" boxShadow="md"  overflow='hidden'>
      <Flex flexDirection="column" height={headerHeight}>
      <Text
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight="bold"
            color="white"
            textShadow="1px 1px 2px rgba(0,0,0,0.5)"
            p={4}
            textAlign="center"
            mb={0.5}
          >
            HRMS Tools
          </Text>
      <Divider />
      </Flex>

      <InputGroup mb={4} display="none">
        <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.400" />} />
        <Input
          placeholder="Search features..."
          bg="gray.700"
          color="white"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>
      <Box p={4} maxH={'82vh'} minH={'82vh'} overflowY={'auto'}>
      {Object.entries(features).map(([section, featuresList]: any) => (
        <Box mb={4} key={section}>
          <Box
            onClick={() => toggleSection(section)}
            cursor="pointer"
            p={3}
            bg="gray.800"
            borderRadius="md"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="md" fontWeight="bold">{section.toUpperCase()}</Text>
            <Icon as={activeSections[section] ? FaChevronUp : FaChevronDown} />
          </Box>
          <Collapse in={activeSections[section]}>
            <VStack mt={2} align="stretch">
              {filteredFeatures(featuresList).map((feature: any) => (
                <Tooltip label={feature.name} key={feature.name}>
                  <Flex
                    alignItems="center"
                    p={3}
                    gap={2}
                    bg={pathname === feature.path ? "teal.600" : "gray.700"}
                    borderRadius="md"
                    _hover={{ bg: "teal.600" }}
                    cursor="pointer"
                    onClick={() => handleRoute(feature.path)}
                  >
                    <Icon as={feature.icon} />
                    <Text fontSize="sm">{feature.name}</Text>
                  </Flex>
                </Tooltip>
              ))}
            </VStack>
          </Collapse>
        </Box>
      ))}
      </Box>

      <Divider />
      <Box height={footerHeight}>
      <Text p={5} textAlign="center" color="gray.400">© 2024 HRMS Tools</Text>
      </Box>
    </Box>
  );
};

export default Sidebar;

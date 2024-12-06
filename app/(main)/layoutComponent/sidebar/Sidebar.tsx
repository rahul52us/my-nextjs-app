'use client';

import React, { useState, useEffect } from "react";
import { Box, VStack, Text, Icon, Collapse, Divider, Input, InputGroup, InputLeftElement, Tooltip, Flex } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { features } from "../utils/constant";



const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSections, setActiveSections] = useState<{ [key: string]: boolean }>({
    decoders: true,
    encoders: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (section: string) => {
    setActiveSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRoute = (path: string) => {
    router.push(path);
  };

  const filteredFeatures = (featuresList: any[]) =>
    featuresList.filter((feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Box p={4} bg="blue.900" color="white" minH="100vh" boxShadow="md" overflowY="auto">
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
        File Conversion
      </Text>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.400" />} />
        <Input
          placeholder="Search features..."
          bg="gray.700"
          color="white"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {Object.entries(features).map(([section, featuresList] : any) => (
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
              {filteredFeatures(featuresList).map((feature) => (
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

      <Divider my={4} />
      <Text textAlign="center" color="gray.400">© 2024 HRMS Tools</Text>
    </Box>
  );
};

export default Sidebar;

"use client";

import React, { useState, useEffect } from "react";
import { Box, VStack, Text, Icon, Collapse, Divider, Tooltip } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp, FaFileAlt, FaMusic, FaCode } from "react-icons/fa";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { usePathname } from "next/navigation"; // Use usePathname to track the current path

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Track the current path
  const router = useRouter(); // For programmatic navigation
  const [activeSections, setActiveSections] = useState<{ [key: string]: boolean }>({
    decoders: true,
    encoders: true,
  });
  const [activeFeature, setActiveFeature] = useState<string | null>(null); // Track active feature

  useEffect(() => {
    setActiveFeature(pathname); // Update active feature on pathname change
  }, [pathname]);

  const features: any = {
    decoders: [
      { name: "Base64 to ASCII", icon: FaCode, path: "/converter/decoder/ascii" },
      { name: "Base64 to Audio", icon: FaMusic, path: "/converter/decoder/audio" },
      { name: "Base64 to File", icon: FaFileAlt, path: "/converter/decoder/file" },
      { name: "Base64 to Image", icon: FaFileAlt, path: "/converter/decoder/image" },
      { name: "Base64 to Pdf", icon: FaFileAlt, path: "/converter/decoder/pdf" },
      { name: "Base64 to Hex", icon: FaCode, path: "/converter/decoder/hex" },
      { name: "Base64 to Text", icon: FaCode, path: "/converter/decoder/text" },
    ],
    encoders: [
      { name: "Audio to Base64", icon: FaMusic, path: "/converter/encoder/audio" },
      { name: "File to Base64", icon: FaFileAlt, path: "/converter/encoder/file" },
      { name: "Url to Base64", icon: FaCode, path: "/converter/encoder/url" },
    ],
    converters: [
      { name: "Images to Pdf & Base64", icon: FaCode, path: "/converter/images-to-pdf" },
    ],
  };

  const toggleSection = (section: string) => {
    setActiveSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const handleRoute = (path: string) => {
    setActiveFeature(path); // Set active feature when route changes
    router.push(path); // Use router.push for programmatic navigation
  };

  const renderFeature = (feature: any) => (
      <Box
        key={feature.name}
        display="flex"
        alignItems="center"
        p={3}
        bg={activeFeature === feature.path ? "teal.600" : "gray.700"} // Highlight active feature
        borderRadius="md"
        _hover={{ bg: "gray.600" }}
        cursor="pointer"
        onClick={() => handleRoute(feature.path)} // Trigger navigation
      >
        <Icon as={feature.icon} color="teal.300" boxSize={5} mr={3} />
        <Text fontSize="sm" color="white" fontWeight="medium">
          {feature.name}
        </Text>
      </Box>
  );

  const renderSection = (section: string, features: any[]) => (
    <Box mb={3} key={section}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        onClick={() => toggleSection(section)}
        cursor="pointer"
        p={3}
        _hover={{ bg: "gray.600" }} // Add hover effect for section title
        borderRadius="md"
      >
        <Text fontSize="md" fontWeight="bold" color="white">
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </Text>
        <Icon as={activeSections[section] ? FaChevronUp : FaChevronDown} color="white" boxSize={4} />
      </Box>
      <Collapse in={activeSections[section]} unmountOnExit>
        <Box mt={1} maxHeight="250px" overflowY="auto">
          <VStack align="stretch" spacing={2}>
            {features.map(renderFeature)}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );

  return (
    <Box
      p={4}
      bg="blue.800"
      color="white"
      minH="100vh"
      width={{ base: "200px", md: "250px" }} // Make sidebar responsive
      position="relative"
      overflowX="hidden"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
        File Conversion
      </Text>

      {Object.keys(features).map((section) => renderSection(section, features[section]))}

      <Divider borderColor="cyan.300" my={4} />
    </Box>
  );
};

export default Sidebar;

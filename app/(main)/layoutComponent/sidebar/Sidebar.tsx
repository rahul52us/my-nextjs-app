"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Collapse,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { features } from "../utils/constant";

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSections, setActiveSections] = useState<{ [key: string]: boolean }>({});

  // Set active sections based on pathname
  useEffect(() => {
    const newActiveSections: { [key: string]: boolean } = {};
    Object.entries(features).forEach(([section, featuresList]: any) => {
      newActiveSections[section] = featuresList.some(
        (feature: any) => feature.path === pathname
      );
    });
    setActiveSections(newActiveSections);
  }, [pathname]);

  const toggleSection = (section: string) =>
    setActiveSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleRoute = (path: string) => router.push(path);

  return (
    <Flex
      direction="column"
      bg="blue.900"
      color="white"
      h="100vh"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
      transition="all 0.3s ease"
      minW={collapsed ? "80px" : "260px"} // Ensure proper width
    >
      {/* Sidebar Header */}
      <Box
        p={{ base: 4, md: 2 }}
        bgGradient="linear(to-b, teal.700, blue.900)"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
        position="relative"
        _after={{
          content: '""',
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          bgGradient: "linear(to-r, transparent, teal.300, transparent)",
        }}
      >
        <Flex align="center" justify={collapsed ? "center" : "flex-start"}>
          <Box
            as="span"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={collapsed ? "48px" : "50px"}
            h={collapsed ? "48px" : "50px"}
            bg="white"
            borderRadius="full"
            border="3px solid"
            borderColor="teal.400"
            mr={collapsed ? 0 : 3}
            transition="all 0.3s ease"
            _hover={{
              transform: "scale(1.1)",
              boxShadow: "0 0 15px rgba(56, 178, 172, 0.6)",
            }}
            cursor="pointer"
            onClick={() => router.push("/")} // Navigate to home on click
          >
            <Text
              fontSize={{ base: "xl", md: "xl" }}
              fontWeight="black"
              color="teal.700"
              textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
            >
              H
            </Text>
          </Box>
          {!collapsed && (
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              bgGradient="linear(to-r, teal.100, white)"
              bgClip="text"
              textShadow="0 2px 6px rgba(0, 0, 0, 0.4)"
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.03)", color: "teal.200" }}
            >
              HRMS Tools
            </Text>
          )}
        </Flex>
      </Box>

      {/* Sidebar Content */}
      <Box
        flex="1"
        p={collapsed ? 2 : 4}
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "teal.500",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "teal.400",
          },
        }}
      >
        {Object.entries(features).map(([section, featuresList]: any) => (
          <Box key={section} mb={collapsed ? 3 : 4}>
            <Flex
              onClick={() => !collapsed && toggleSection(section)}
              cursor={collapsed ? "default" : "pointer"}
              p={3}
              bg="gray.800"
              borderRadius="lg"
              justify={collapsed ? "center" : "space-between"}
              align="center"
              boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.1)"
            >
              {collapsed ? (
                <Tooltip label={section.toUpperCase()} placement="right">
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="teal.300"
                    textTransform="uppercase"
                  >
                    {section.slice(0, 1)}
                  </Text>
                </Tooltip>
              ) : (
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="white"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {section}
                </Text>
              )}
              {!collapsed && (
                <Icon
                  as={activeSections[section] ? FaChevronUp : FaChevronDown}
                  color="gray.400"
                  transition="transform 0.2s ease"
                  _groupHover={{ transform: "rotate(180deg)" }}
                />
              )}
            </Flex>
            {!collapsed && (
              <Collapse in={activeSections[section]} animateOpacity>
                <VStack mt={2} align="stretch" spacing={1}>
                  {featuresList.map((feature: any) => (
                    <Tooltip label={feature.name} key={feature.path}>
                      <Flex
                        align="center"
                        p={3}
                        gap={3}
                        bg={pathname === feature.path ? "teal.600" : "gray.700"}
                        borderRadius="md"
                        _hover={{
                          bg: "teal.600",
                          transform: "translateX(4px)",
                          transition: "all 0.2s ease",
                        }}
                        cursor="pointer"
                        onClick={() => handleRoute(feature.path)}
                        transition="all 0.2s ease"
                        boxShadow={
                          pathname === feature.path
                            ? "0 0 8px rgba(56, 178, 172, 0.5)"
                            : "none"
                        }
                      >
                        <Icon
                          as={feature.icon}
                          boxSize={5}
                          color={pathname === feature.path ? "white" : "teal.300"}
                        />
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="white"
                          noOfLines={1}
                        >
                          {feature.name}
                        </Text>
                      </Flex>
                    </Tooltip>
                  ))}
                </VStack>
              </Collapse>
            )}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        p={{ base: 3, md: 3 }}
        bgGradient="linear(to-t, teal.700, blue.900)"
        boxShadow="0 -2px 8px rgba(0, 0, 0, 0.3)"
        borderTop="1px solid"
        borderColor="gray.700"
        mt="auto" // Push footer to the bottom
      >
        {!collapsed ? (
          <VStack spacing={1}>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="gray.300"
              letterSpacing="wide"
            >
              © {new Date().getFullYear()} HRMS Tools
            </Text>
            <Text
              fontSize="2xs"
              color="teal.400"
              opacity={0.8}
              _hover={{ opacity: 1, transition: "opacity 0.2s ease" }}
              cursor="pointer"
              onClick={() => window.open("https://edukateus.com", "_blank")}
            >
              Powered by Edukateus
            </Text>
          </VStack>
        ) : (
          <Tooltip label={`© ${new Date().getFullYear()} HRMS Tools`}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              ©
            </Text>
          </Tooltip>
        )}
      </Box>
    </Flex>
  );
};

export default Sidebar;
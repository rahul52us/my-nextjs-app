"use client";
import {
  Box,
  Flex,
  Image,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Center,
  HStack,
  Text,
  Switch,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NavItemsLayout from "./component/NavItemsLayout";
import HeroNavButton from "./component/HeroNavButton";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import WhatsAppButton from "../../../../component/common/whatsApp/whatsAppButton";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(colorMode === "dark");
  }, [colorMode]);

  const handleToggleDark = () => {
    toggleColorMode();
    setIsDark((prev) => !prev);
  };

  const headerBg = useColorModeValue("white", "gray.900");
  const drawerBg = useColorModeValue("white", "gray.800");
  const toggleLabelColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Box shadow="sm" position="sticky" top="0" zIndex="1000" bg={headerBg}>
      {/* Top Bar */}
      <Box
        h={{ lg: "2rem", xl: "2.5rem" }} // Reduce height
        color="white"
        textAlign="center"
        bg="#045B64"
        fontSize={{ base: "xs", lg: "lg" }} // Reduce font size
        p={1} // Reduce padding
      >
        Get 30% discount on your first therapy session!
      </Box>

      {/* Header for Mobile */}
      <Flex
        alignItems="center"
        justify="space-between"
        px={{ base: 2, md: 6 }}
        py={1} // Reduced padding
        bg={headerBg}
        display={{ base: "flex", md: "none" }}
        h="4rem" // Reduced height
      >
        <Image
          src="/images/logo.png"
          alt="best child psychologist in noida"
          h={{ base: "43px", sm: "48px" }}  // Reduced logo size
          cursor="pointer"
          onClick={() => router.push("/")}
          mr="auto"
        />
        <Flex gap={2} align="center">
          {/* Dark Mode Toggle — mobile header bar */}
          <IconButton
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            icon={isDark ? <SunIcon /> : <MoonIcon />}
            onClick={handleToggleDark}
            variant="ghost"
            size="md"
            fontSize="18px"
            color={isDark ? "yellow.400" : "gray.600"}
            _hover={{ bg: isDark ? "whiteAlpha.200" : "gray.100" }}
          />
          <IconButton
            icon={<HamburgerIcon fontSize={"22px"} />}
            onClick={onOpen}
            aria-label="Open menu"
            variant="ghost"
            size="md"
          />
        </Flex>
      </Flex>

      {/* Drawer for Mobile Navigation */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerBody>
            {/* Centered Logo */}
            <Center mt={6} mb={4}>
              <Image
                src="/images/logo.png"
                alt="Mental Health Clinic In Noida"
                h="50px"
                onClick={() => router.push("/")}
              />
            </Center>
            {/* Navigation Items */}
            <Box px={4}>
              <NavItemsLayout onClose={onClose} />
            </Box>
            <Center my={4}>
              <WhatsAppButton />
            </Center>

            {/* Dark Mode Toggle inside Drawer */}
            <Box
              px={4}
              py={3}
              mx={2}
              mb={4}
              borderRadius="lg"
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  {isDark ? (
                    <MoonIcon color="blue.300" boxSize={4} />
                  ) : (
                    <SunIcon color="orange.400" boxSize={4} />
                  )}
                  <Text fontSize="sm" fontWeight="500" color={toggleLabelColor}>
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </Text>
                </HStack>
                <Switch
                  isChecked={isDark}
                  onChange={handleToggleDark}
                  colorScheme="teal"
                  size="md"
                  aria-label="Toggle dark mode"
                />
              </HStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Header for Desktop */}
      <Flex
        alignItems="center"
        justify="space-between"
        px={{ lg: 5, xl: 8 }}
        py={2.5} // Reduced padding
        display={{ base: "none", md: "flex" }}
      // h="4rem" // Reduced height
      >
        <Image
          src="/images/logo.png"
          alt="Mental Health Doctor In Noida"
          h={{ base: "35px", lg: "50px", xl: "60px" }} // Reduced logo size
          cursor={"pointer"}
          onClick={() => router.push("/")}
        />
        <Flex flex={1} justify="center" pr={2}>
          <NavItemsLayout />
        </Flex>
        <HeroNavButton />
      </Flex>
    </Box>
  );
};

export default Header;

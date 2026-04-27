"use client";

import {
  Box,
  Flex,
  useBreakpointValue,
  Text,
  HStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  VStack,
  Divider,
  Icon
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HamburgerIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { BiHomeAlt } from "react-icons/bi";
import { keyframes } from "@emotion/react";
import { sidebarData } from "../../../SidebarLayout/utils/SidebarItems";
import stores from "../../../../../store/stores";
import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface SidebarItem {
  id: string | number;
  name: string;
  url?: string;
  icon?: React.ReactElement;
  children?: SidebarItem[];
}

const HeaderLogo = observer(() => {
  const {
    themeStore: { themeConfig },
  } = stores;

  const isDesktop = useBreakpointValue({ base: false, md: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Colors & Styles
  const textColor = "white";
  const accentColor = themeConfig.colors.brand[300];
  const menuTextColor = useColorModeValue("gray.800", "white");
  const hoverBg = "whiteAlpha.200";
  const menuBg = useColorModeValue("white", "gray.800");
  const mobileLinkHover = useColorModeValue("blue.50", "gray.700");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const shadowColor = useColorModeValue("0 10px 15px -3px rgba(0,0,0,0.1)", "0 20px 25px -5px rgba(0,0,0,0.4)");

  const slideDown = keyframes`
    0% { opacity: 0; transform: translateY(-10px) scale(0.98); }
    60% { opacity: 1; transform: translateY(0) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  `;

  const slideRight = keyframes`
    0% { opacity: 0; transform: translateX(-10px) scale(0.98); }
    60% { opacity: 1; transform: translateX(0) scale(1.02); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  `;

  // FIX: Close menu on scroll
  const handleScroll = useCallback(() => {
    if (window.scrollY > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }

    // Close desktop menu if user scrolls
    if (openMenu !== null) {
      setOpenMenu(null);
    }
  }, [openMenu]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close menus on path change
  useEffect(() => {
    onClose();
    setOpenMenu(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname, onClose]);

  return (
    <HStack
      spacing={8}
      width="100%"
      minW={0}
      px={{ base: 2, md: 6 }}
      height="70px"
      alignItems="center"
      justify="space-between"
      overflow="hidden"
      position="sticky"
      top={0}
      zIndex={1000}
      transition="all 0.3s ease"
    >
      {/* LOGO */}
      <HStack spacing={2}>
        <Link href="/" passHref>
          <Box cursor="pointer" _hover={{ transform: "scale(1.02)" }} transition="0.2s">
            <Text
              as="span"
              fontSize="24px"
              fontWeight="800"
              color={textColor}
              letterSpacing="-0.04em"
            >
              Tool
              <Text as="span" color={accentColor}>
                sahayata
              </Text>
            </Text>
          </Box>
        </Link>
      </HStack>

      {/* DESKTOP NAV */}
      {isDesktop ? (
        <Flex
          flex="1 1 auto"
          minW={0}
          maxW="100%"
          justify="center"
          overflowX="auto"
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          <HStack
            spacing={1}
            minW={0}
            flexWrap="nowrap"
            whiteSpace="nowrap"
            bg={scrolled ? "whiteAlpha.200" : "whiteAlpha.100"}
            p={1.5}
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(12px)"
            boxShadow={scrolled ? "xl" : "none"}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            {/* HOME */}
            <Box
              as={Link}
              href="/"
              px={5}
              py={2}
              borderRadius="full"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
              onClick={() => setOpenMenu(null)}
            >
              <Text
                fontSize="12px"
                fontWeight="700"
                color={textColor}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Home
              </Text>
            </Box>

            {/* DYNAMIC MENUS */}
            {(sidebarData as SidebarItem[]).map((mainItem) => (
              <Menu
                key={mainItem.id}
                isLazy
                closeOnSelect={false}
                isOpen={openMenu === mainItem.id}
                onOpen={() => setOpenMenu(mainItem.id)}
                onClose={() => setOpenMenu(null)}
              >
                <MenuButton
                  as={Box}
                  px={3}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ bg: hoverBg, transform: "translateY(-1px) scale(1.02)" }}
                  bg={openMenu === mainItem.id ? hoverBg : "transparent"}
                >
                  <HStack spacing={1}>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color={textColor}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      {mainItem.name}
                    </Text>
                    <ChevronDownIcon
                      color={textColor}
                      transition="transform 0.3s"
                      transform={openMenu === mainItem.id ? "rotate(180deg)" : "rotate(0deg)"}
                    />
                  </HStack>
                </MenuButton>

                <Portal>
                  <MenuList
                    bg={menuBg}
                    color={menuTextColor}
                    minW="240px"
                    zIndex={1500}
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow={shadowColor}
                    p={2}
                    borderRadius="2xl"
                    animation={`${slideDown} 0.24s ease-out`}
                  >
                    {mainItem.children?.map((subItem) =>
                      subItem.children ? (
                        <Menu
                          key={subItem.id}
                          placement="right-start"
                          isLazy
                          closeOnSelect={false}
                          offset={[0, 10]}
                        >
                          <MenuButton
                            as={MenuItem}
                            borderRadius="xl"
                            transition="all 0.2s ease"
                            _hover={{ bg: mobileLinkHover, transform: "translateX(6px)" }}
                            py={3}
                          >
                            <HStack justify="space-between" width="100%">
                              <HStack spacing={3}>
                                {subItem.icon && React.cloneElement(subItem.icon as React.ReactElement, { size: 18, color: accentColor })}
                                <Text fontWeight="600" fontSize="sm">{subItem.name}</Text>
                              </HStack>
                              <ChevronRightIcon opacity={0.5} />
                            </HStack>
                          </MenuButton>

                          <Portal>
                            <MenuList
                              bg={menuBg}
                              color={menuTextColor}
                              p={2}
                              borderRadius="2xl"
                              boxShadow={shadowColor}
                              border="1px solid"
                              borderColor={borderColor}
                              animation={`${slideRight} 0.24s ease-out`}
                            >
                              {subItem.children.map((nestedItem) => (
                                <MenuItem
                                  key={nestedItem.id}
                                  as={Link}
                                  href={nestedItem.url || "#"}
                                  icon={nestedItem.icon}
                                  borderRadius="xl"
                                  py={2.5}
                                  fontSize="sm"
                                  fontWeight="500"
                                  transition="all 0.18s ease"
                                  _hover={{ bg: mobileLinkHover, transform: "translateX(4px)" }}
                                  onClick={() => setOpenMenu(null)}
                                >
                                  {nestedItem.name}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Portal>
                        </Menu>
                      ) : (
                        <MenuItem
                          key={subItem.id}
                          as={Link}
                          href={subItem.url || "#"}
                          icon={subItem.icon}
                          borderRadius="xl"
                          py={3}
                          fontSize="sm"
                          fontWeight="500"
                          transition="all 0.18s ease"
                          _hover={{ bg: mobileLinkHover, transform: "translateX(3px)" }}
                          onClick={() => setOpenMenu(null)}
                        >
                          {subItem.name}
                        </MenuItem>
                      )
                    )}
                  </MenuList>
                </Portal>
              </Menu>
            ))}
          </HStack>
        </Flex>
      ) : (
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          _hover={{ bg: "whiteAlpha.200" }}
          icon={<HamburgerIcon color="white" boxSize={7} />}
          onClick={onOpen}
        />
      )}

      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent bg={menuBg} borderLeftRadius="3xl">
          <HStack p={6} justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="800" letterSpacing="-0.02em">
              Navigation
            </Text>
            <IconButton
              size="sm"
              variant="gray"
              aria-label="Close"
              icon={<CloseIcon boxSize={3} />}
              onClick={onClose}
              borderRadius="full"
            />
          </HStack>

          <DrawerBody px={2} pb={8}>
            <VStack align="stretch" spacing={1}>
              <Box
                as={Link}
                href="/"
                mx={2}
                p={4}
                borderRadius="2xl"
                onClick={onClose}
                bg={pathname === "/" ? mobileLinkHover : "transparent"}
                _hover={{ bg: mobileLinkHover }}
                transition="0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={BiHomeAlt} boxSize={5} color={pathname === "/" ? accentColor : "inherit"} />
                  <Text fontWeight={pathname === "/" ? "700" : "600"}>Home</Text>
                </HStack>
              </Box>

              <Divider my={4} opacity={0.5} mx={4} w="auto" />

              {(sidebarData as SidebarItem[]).map((item) => (
                <Box key={item.id} mb={6}>
                  <Text
                    px={5}
                    mb={3}
                    fontSize="11px"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing="2px"
                    color={accentColor}
                  >
                    {item.name}
                  </Text>

                  <VStack align="stretch" spacing={1}>
                    {item.children?.map((child) => (
                      <Box key={child.id}>
                        {child.children ? (
                          <Box mb={2}>
                            <HStack px={5} py={2} spacing={3} opacity={0.8}>
                              {child.icon && React.cloneElement(child.icon as React.ReactElement, { size: 18, color: accentColor })}
                              <Text fontSize="sm" fontWeight="700">
                                {child.name}
                              </Text>
                            </HStack>

                            <VStack align="stretch" spacing={1} mt={1} ml={8} borderLeft="1.5px solid" borderColor={borderColor}>
                              {child.children.map((nested) => (
                                <Box
                                  key={nested.id}
                                  as={Link}
                                  href={nested.url || "#"}
                                  p={2.5}
                                  pl={6}
                                  borderRadius="0 12px 12px 0"
                                  onClick={onClose}
                                  _hover={{ bg: mobileLinkHover }}
                                  bg={pathname === nested.url ? mobileLinkHover : "transparent"}
                                >
                                  <Text fontSize="sm" fontWeight={pathname === nested.url ? "700" : "500"}>
                                    {nested.name}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ) : (
                          <Box
                            as={Link}
                            href={child.url || "#"}
                            mx={2}
                            p={3.5}
                            borderRadius="2xl"
                            onClick={onClose}
                            _hover={{ bg: mobileLinkHover }}
                            bg={pathname === child.url ? mobileLinkHover : "transparent"}
                          >
                            <HStack spacing={3}>
                              {child.icon && React.cloneElement(child.icon as React.ReactElement, { size: 20 })}
                              <Text fontWeight={pathname === child.url ? "700" : "600"}>
                                {child.name}
                              </Text>
                            </HStack>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </HStack>
  );
});

export default HeaderLogo;
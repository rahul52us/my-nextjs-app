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
  Icon,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HamburgerIcon,
  CloseIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { BiHomeAlt } from "react-icons/bi";
import { keyframes } from "@emotion/react";
import { sidebarData } from "../../../SidebarLayout/utils/SidebarItems";
import stores from "../../../../../store/stores";
import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import GlobalSearch from "./GlobalSearch"; // ← import

interface SidebarItem {
  id: string | number;
  name: string;
  url?: string;
  icon?: React.ReactElement;
  iconColor?: string;
  columns?: number;
  children?: SidebarItem[];
}

const HeaderLogo = observer(() => {
  const {
    themeStore: { themeConfig },
  } = stores;

  const isDesktop = useBreakpointValue({ base: false, xl: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // ── Mobile search modal state ──────────────────────────────────
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const textColor = "white";
  const accentColor = themeConfig.colors.brand[300];
  const menuTextColor = useColorModeValue("gray.800", "white");
  const hoverBg = "whiteAlpha.200";
  const menuBg = useColorModeValue("white", "gray.800");
  const mobileLinkHover = useColorModeValue("blue.50", "gray.700");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const shadowColor = useColorModeValue(
    "0 10px 15px -3px rgba(0,0,0,0.1)",
    "0 20px 25px -5px rgba(0,0,0,0.4)"
  );

  const slideDown = keyframes`
    0%   { opacity: 0; transform: translateY(-10px) scale(0.98); }
    60%  { opacity: 1; transform: translateY(0) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  `;

  const slideRight = keyframes`
    0%   { opacity: 0; transform: translateX(-10px) scale(0.98); }
    60%  { opacity: 1; transform: translateX(0) scale(1.02); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  `;

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
    if (openMenu !== null) setOpenMenu(null);
  }, [openMenu]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    onClose();
    setOpenMenu(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname, onClose]);

  const renderIcon = (item: SidebarItem, size: number = 16) => {
    if (!item.icon) return null;
    return React.cloneElement(item.icon as React.ReactElement, {
      size,
      style: { color: item.iconColor || accentColor, flexShrink: 0 },
    });
  };

  return (
    <HStack
      spacing={0}
      width="100%"
      minW={0}
      overflow="visible"        // ← was "hidden", changed so search modal isn't clipped
      px={{ base: 2, md: 3, xl: 4 }}
      minH="64px"
      py={0}
      alignItems="center"
      justify="space-between"
    >
      {/* ── LOGO ── */}
      <HStack flexShrink={0} mr={{ xl: 2, "2xl": 4 }}>
        <Link href="/" passHref>
          <Box cursor="pointer" _hover={{ transform: "scale(1.02)" }} transition="0.2s">
            <Text
              as="span"
              fontSize={{ base: "18px", md: "20px", xl: "22px" }}
              fontWeight="800"
              color={textColor}
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
            >
              Tool
              <Text as="span" color={accentColor}>
                sahayata
              </Text>
            </Text>
          </Box>
        </Link>
      </HStack>

      {/* ── DESKTOP: Nav pills + Search ── */}
      {isDesktop ? (
        <Flex flex="1 1 0" minW={0} justify="center" alignItems="center" gap={3}>

          {/* Nav pills */}
          <HStack
            spacing={0}
            flexWrap="nowrap"
            justify="center"
            alignItems="center"
            bg={scrolled ? "whiteAlpha.200" : "whiteAlpha.100"}
            px="6px"
            py="4px"
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
              px={{ xl: "10px", "2xl": "14px" }}
              py="6px"
              borderRadius="full"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
              onClick={() => setOpenMenu(null)}
            >
              <Text
                fontSize="11px"
                fontWeight="700"
                color={textColor}
                textTransform="uppercase"
                letterSpacing="0.06em"
                whiteSpace="nowrap"
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
                  px={{ xl: "8px", "2xl": "12px" }}
                  py="6px"
                  borderRadius="full"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ bg: hoverBg }}
                  bg={openMenu === mainItem.id ? hoverBg : "transparent"}
                >
                  <HStack spacing="3px">
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color={textColor}
                      textTransform="uppercase"
                      letterSpacing="0.06em"
                      whiteSpace="nowrap"
                    >
                      {mainItem.name}
                    </Text>
                    <ChevronDownIcon
                      color={textColor}
                      w="12px"
                      h="12px"
                      transition="transform 0.3s"
                      transform={
                        openMenu === mainItem.id ? "rotate(180deg)" : "rotate(0deg)"
                      }
                    />
                  </HStack>
                </MenuButton>

                <Portal>
                  <MenuList
                    bg={menuBg}
                    color={menuTextColor}
                    minW={mainItem.columns === 2 ? "540px" : "240px"}
                    zIndex={9999}
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow={shadowColor}
                    p={2}
                    borderRadius="2xl"
                    animation={`${slideDown} 0.24s ease-out`}
                  >
                    {mainItem.columns === 2 ? (
                      (() => {
                        const children = mainItem.children ?? [];
                        const half = Math.ceil(children.length / 2);
                        const col1 = children.slice(0, half);
                        const col2 = children.slice(half);
                        return (
                          <Flex>
                            <Box flex={1} borderRight="1px solid" borderColor={borderColor} pr={1}>
                              <Text px={3} pt={1} pb={2} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em" color="gray.400">
                                Convert
                              </Text>
                              {col1.map((subItem) => (
                                <MenuItem key={subItem.id} as={Link} href={subItem.url || "#"} borderRadius="xl" py={2.5} fontSize="sm" fontWeight="700" transition="all 0.18s ease" _hover={{ bg: mobileLinkHover }} onClick={() => setOpenMenu(null)}>
                                  <HStack spacing={3}>{renderIcon(subItem, 16)}<span>{subItem.name}</span></HStack>
                                </MenuItem>
                              ))}
                            </Box>
                            <Box flex={1} pl={1}>
                              <Text px={3} pt={1} pb={2} fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em" color="gray.400">
                                Manage
                              </Text>
                              {col2.map((subItem) => (
                                <MenuItem key={subItem.id} as={Link} href={subItem.url || "#"} borderRadius="xl" py={2.5} fontSize="sm" fontWeight="700" transition="all 0.18s ease" _hover={{ bg: mobileLinkHover }} onClick={() => setOpenMenu(null)}>
                                  <HStack spacing={3}>{renderIcon(subItem, 16)}<span>{subItem.name}</span></HStack>
                                </MenuItem>
                              ))}
                            </Box>
                          </Flex>
                        );
                      })()
                    ) : (
                      mainItem.children?.map((subItem) =>
                        subItem.children ? (
                          <Menu key={subItem.id} placement="right-start" isLazy closeOnSelect={false} offset={[0, 10]}>
                            <MenuButton as={MenuItem} borderRadius="xl" transition="all 0.2s ease" _hover={{ bg: mobileLinkHover }} py={3}>
                              <HStack justify="space-between" width="100%">
                                <HStack spacing={3}>{renderIcon(subItem, 18)}<Text fontWeight="700" fontSize="sm">{subItem.name}</Text></HStack>
                                <ChevronRightIcon opacity={0.5} />
                              </HStack>
                            </MenuButton>
                            <Portal>
                              <MenuList bg={menuBg} color={menuTextColor} p={2} borderRadius="2xl" boxShadow={shadowColor} border="1px solid" borderColor={borderColor} zIndex={9999} animation={`${slideRight} 0.24s ease-out`}>
                                {subItem.children.map((nestedItem) => (
                                  <MenuItem key={nestedItem.id} as={Link} href={nestedItem.url || "#"} borderRadius="xl" py={2.5} fontSize="sm" fontWeight="700" transition="all 0.18s ease" _hover={{ bg: mobileLinkHover }} onClick={() => setOpenMenu(null)}>
                                    <HStack spacing={3}>{renderIcon(nestedItem, 16)}<span>{nestedItem.name}</span></HStack>
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Portal>
                          </Menu>
                        ) : (
                          <MenuItem key={subItem.id} as={Link} href={subItem.url || "#"} borderRadius="xl" py={3} fontSize="sm" fontWeight="700" transition="all 0.18s ease" _hover={{ bg: mobileLinkHover }} onClick={() => setOpenMenu(null)}>
                            <HStack spacing={3}>{renderIcon(subItem, 18)}<span>{subItem.name}</span></HStack>
                          </MenuItem>
                        )
                      )
                    )}
                  </MenuList>
                </Portal>
              </Menu>
            ))}
          </HStack>

          {/* ── Global Search Bar (desktop) ── */}
          <GlobalSearch />

        </Flex>
      ) : (
        /* ── MOBILE: search icon + hamburger ── */
        <HStack spacing={2}>
          {/* Mobile search icon button — opens the same GlobalSearch modal */}
          <GlobalSearch />

          <IconButton
            aria-label="Open menu"
            variant="ghost"
            flexShrink={0}
            _hover={{ bg: "whiteAlpha.200" }}
            icon={<HamburgerIcon color="white" boxSize={6} />}
            onClick={onOpen}
          />
        </HStack>
      )}

      {/* ── MOBILE DRAWER ── */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent bg={menuBg} borderLeftRadius="3xl">
          <HStack p={6} justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="800" letterSpacing="-0.02em">Navigation</Text>
            <IconButton size="sm" variant="ghost" aria-label="Close" icon={<CloseIcon boxSize={3} />} onClick={onClose} borderRadius="full" />
          </HStack>

          <DrawerBody px={2} pb={8}>
            <VStack align="stretch" spacing={1}>
              <Box as={Link} href="/" mx={2} p={4} borderRadius="2xl" onClick={onClose} bg={pathname === "/" ? mobileLinkHover : "transparent"} _hover={{ bg: mobileLinkHover }} transition="0.2s">
                <HStack spacing={3}>
                  <Icon as={BiHomeAlt} boxSize={5} color={pathname === "/" ? accentColor : "inherit"} />
                  <Text fontWeight="700">Home</Text>
                </HStack>
              </Box>

              <Divider my={4} opacity={0.5} mx={4} w="auto" />

              {(sidebarData as SidebarItem[]).map((item) => (
                <Box key={item.id} mb={6}>
                  <Text px={5} mb={3} fontSize="11px" fontWeight="800" textTransform="uppercase" letterSpacing="2px" color={accentColor}>
                    {item.name}
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {item.children?.map((child) => (
                      <Box key={child.id}>
                        {child.children ? (
                          <Box mb={2}>
                            <HStack px={5} py={2} spacing={3} opacity={0.8}>
                              {renderIcon(child, 18)}
                              <Text fontSize="sm" fontWeight="700">{child.name}</Text>
                            </HStack>
                            <VStack align="stretch" spacing={1} mt={1} ml={8} borderLeft="1.5px solid" borderColor={borderColor}>
                              {child.children.map((nested) => (
                                <Box key={nested.id} as={Link} href={nested.url || "#"} p={2.5} pl={6} borderRadius="0 12px 12px 0" onClick={onClose} _hover={{ bg: mobileLinkHover }} bg={pathname === nested.url ? mobileLinkHover : "transparent"}>
                                  <HStack spacing={2}>{renderIcon(nested, 14)}<Text fontSize="sm" fontWeight="700">{nested.name}</Text></HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ) : (
                          <Box as={Link} href={child.url || "#"} mx={2} p={3.5} borderRadius="2xl" onClick={onClose} _hover={{ bg: mobileLinkHover }} bg={pathname === child.url ? mobileLinkHover : "transparent"}>
                            <HStack spacing={3}>{renderIcon(child, 20)}<Text fontWeight="700">{child.name}</Text></HStack>
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
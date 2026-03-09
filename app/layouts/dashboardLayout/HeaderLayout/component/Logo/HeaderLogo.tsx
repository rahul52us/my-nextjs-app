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
import { sidebarData } from "../../../SidebarLayout/utils/SidebarItems";
import stores from "../../../../../store/stores";
import React, { useEffect, useState } from "react";
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

  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();

  // ✅ Controlled desktop menu state
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);

  const textColor = "white";
  const accentColor = themeConfig.colors.brand[300];
  const hoverBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.100");
  const menuBg = useColorModeValue("white", "gray.800");
  const mobileLinkHover = useColorModeValue("blue.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");

  // ✅ Close drawer + desktop menu on route change
  useEffect(() => {
    onClose();
    setOpenMenu(null);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

  return (
    <HStack
      spacing={8}
      width="100%"
      pr={6}
      height="64px"
      alignItems="center"
      justify="space-between"
    >
      {/* LOGO */}
      <HStack spacing={2}>
        <Link href="/" passHref>
          <Text
            as="span"
            fontSize="22px"
            fontWeight="800"
            color={textColor}
            letterSpacing="-0.04em"
            cursor="pointer"
          >
            BASI
            <Text as="span" color={accentColor}>
              FY
            </Text>
          </Text>
        </Link>
      </HStack>

      {/* DESKTOP NAV */}
      {isDesktop ? (
        <Flex flex={1} justify="center">
          <HStack spacing={2}>
            {/* HOME */}
            <Box
              as={Link}
              href="/"
              px={4}
              py={2}
              borderRadius="md"
              _hover={{ bg: hoverBg }}
              onClick={() => setOpenMenu(null)}
            >
              <Text
                fontSize="13px"
                fontWeight="700"
                color={textColor}
                textTransform="uppercase"
              >
                Home
              </Text>
            </Box>

            {/* DYNAMIC MENUS */}
            {(sidebarData as SidebarItem[]).map((mainItem) => (
              <Menu
                key={mainItem.id}
                isLazy
                closeOnSelect
                isOpen={openMenu === mainItem.id}
                onOpen={() => setOpenMenu(mainItem.id)}
                onClose={() => setOpenMenu(null)}
              >
                <MenuButton
                  as={Box}
                  px={4}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                >
                  <HStack spacing={1}>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color={textColor}
                      textTransform="uppercase"
                    >
                      {mainItem.name}
                    </Text>
                    <ChevronDownIcon color={textColor} />
                  </HStack>
                </MenuButton>

                <Portal>
                  <MenuList bg={menuBg} minW="220px" zIndex={1500}>
                    {mainItem.children?.map((subItem) =>
                      subItem.children ? (
                        <Menu
                          key={subItem.id}
                          placement="right-start"
                          isLazy
                          closeOnSelect={false}
                        >
                          <MenuButton as={MenuItem}>
                            <HStack justify="space-between" width="100%">
                              <HStack>
                                {subItem.icon}
                                <Text>{subItem.name}</Text>
                              </HStack>
                              <ChevronRightIcon />
                            </HStack>
                          </MenuButton>

                          <MenuList bg={menuBg}>
                            {subItem.children.map((nestedItem) => (
                              <MenuItem
                                key={nestedItem.id}
                                as={Link}
                                href={nestedItem.url || "#"}
                                icon={nestedItem.icon}
                                onClick={() => setOpenMenu(null)}
                              >
                                {nestedItem.name}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      ) : (
                        <MenuItem
                          key={subItem.id}
                          as={Link}
                          href={subItem.url || "#"}
                          icon={subItem.icon}
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
          icon={<HamburgerIcon color="white" boxSize={7} />}
          onClick={onOpen}
        />
      )}

      {/* MOBILE DRAWER */}
      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={menuBg} borderLeftRadius="2xl">
          <HStack p={6} justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="800" letterSpacing="-0.02em">
              Navigation
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Close"
              icon={<CloseIcon boxSize={3} />}
              onClick={onClose}
              borderRadius="full"
            />
          </HStack>

          <DrawerBody px={2} pb={8}>
            <VStack align="stretch" spacing={1}>
              {/* HOME LINK */}
              <Box
                as={Link}
                href="/"
                mx={2}
                p={3}
                borderRadius="xl"
                onClick={onClose}
                bg={pathname === "/" ? mobileLinkHover : "transparent"}
                _hover={{ bg: mobileLinkHover }}
                transition="0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={BiHomeAlt} boxSize={5} color={pathname === "/" ? accentColor : "inherit"} />
                  <Text fontWeight={pathname === "/" ? "700" : "500"}>Home</Text>
                </HStack>
              </Box>

              <Divider my={4} opacity={0.5} mx={4} w="auto" />

              {/* DYNAMIC SIDEBAR DATA */}
              {(sidebarData as SidebarItem[]).map((item) => (
                <Box key={item.id} mb={4}>
                  <Text
                    px={5}
                    mb={2}
                    fontSize="11px"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={accentColor}
                    opacity={0.8}
                  >
                    {item.name}
                  </Text>

                  <VStack align="stretch" spacing={1}>
                    {item.children?.map((child) => (
                      <Box key={child.id}>
                        {child.children ? (
                          <Box mb={2}>
                            {/* Nested Group Label */}
                            <HStack px={5} py={2} spacing={3} opacity={0.7}>
                              {child.icon && React.cloneElement(child.icon as React.ReactElement, { size: 18 })}
                              <Text fontSize="sm" fontWeight="700">
                                {child.name}
                              </Text>
                            </HStack>

                            {/* Nested Children (Sub-in-Sub) */}
                            <VStack align="stretch" spacing={1} mt={1} ml={4} borderLeft="2px solid" borderColor={borderColor}>
                              {child.children.map((nested) => (
                                <Box
                                  key={nested.id}
                                  as={Link}
                                  href={nested.url || "#"}
                                  mx={2}
                                  p={2}
                                  pl={6}
                                  borderRadius="lg"
                                  onClick={onClose}
                                  _hover={{ bg: mobileLinkHover }}
                                  bg={pathname === nested.url ? mobileLinkHover : "transparent"}
                                >
                                  <HStack spacing={3}>
                                    {nested.icon}
                                    <Text fontSize="sm" fontWeight={pathname === nested.url ? "700" : "500"}>
                                      {nested.name}
                                    </Text>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ) : (
                          /* Standard Item */
                          <Box
                            as={Link}
                            href={child.url || "#"}
                            mx={2}
                            p={3}
                            borderRadius="xl"
                            onClick={onClose}
                            _hover={{ bg: mobileLinkHover }}
                            bg={pathname === child.url ? mobileLinkHover : "transparent"}
                            transition="0.2s"
                          >
                            <HStack spacing={3}>
                              {child.icon && React.cloneElement(child.icon as React.ReactElement, { size: 20 })}
                              <Text fontWeight={pathname === child.url ? "700" : "500"}>
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
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
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={menuBg}>
          <HStack p={4} justify="space-between">
            <Text fontWeight="bold">Navigation</Text>
            <IconButton
              aria-label="Close"
              icon={<CloseIcon boxSize={3} />}
              onClick={onClose}
            />
          </HStack>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              <Box
                as={Link}
                href="/"
                p={4}
                onClick={onClose}
                _hover={{ bg: mobileLinkHover }}
              >
                <HStack>
                  <BiHomeAlt />
                  <Text>Home</Text>
                </HStack>
              </Box>

              <Divider />

              {(sidebarData as SidebarItem[]).map((item) => (
                <Box key={item.id}>
                  <Text
                    px={4}
                    py={2}
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color={themeConfig.colors.brand[300]}
                  >
                    {item.name}
                  </Text>

                  {item.children?.map((child) =>
                    child.children ? (
                      <Box key={child.id}>
                        <Text px={6} py={2} fontWeight="600">
                          {child.name}
                        </Text>

                        {child.children.map((nested) => (
                          <Box
                            key={nested.id}
                            as={Link}
                            href={nested.url || "#"}
                            p={3}
                            pl={10}
                            onClick={onClose}
                            _hover={{ bg: mobileLinkHover }}
                          >
                            <HStack>
                              {nested.icon}
                              <Text>{nested.name}</Text>
                            </HStack>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        key={child.id}
                        as={Link}
                        href={child.url || "#"}
                        p={3}
                        pl={8}
                        onClick={onClose}
                        _hover={{ bg: mobileLinkHover }}
                      >
                        <HStack>
                          {child.icon}
                          <Text>{child.name}</Text>
                        </HStack>
                      </Box>
                    )
                  )}
                  <Divider />
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
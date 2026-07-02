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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
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
import { usePathname, useRouter } from "next/navigation";
import { AUTH_TOKEN } from "../../../../../config/utils/variables";
import GlobalSearch from "./GlobalSearch";
import LoginContent from "../../../../../(authentication)/login/content";

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
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileSections, setOpenMobileSections] = useState<Record<string | number, boolean>>({});

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const textColor = "white";
  const accentColor = themeConfig.colors.brand[300];
  const menuTextColor = useColorModeValue("gray.800", "white");
  const hoverBg = "whiteAlpha.200";
  const menuBg = useColorModeValue("white", "#0f0f0f");
  const mobileLinkHover = useColorModeValue("brand.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.50");
  const menuBorderColor = useColorModeValue("#e2e8f0", "transparent");
  const shadowColor = useColorModeValue(
    "0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.07)",
    "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)"
  );
  const loginModalBg = useColorModeValue(
    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    "linear-gradient(135deg, #0a1f33 0%, #132d47 100%)"
  );
  const loginModalBorder = useColorModeValue(
    "1px solid rgba(2, 91, 151, 0.08)",
    "1px solid rgba(148, 163, 184, 0.14)"
  );
  const loginModalCloseColor = useColorModeValue("#025b97", "rgba(226, 232, 240, 0.92)");

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

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    const tokenKey = AUTH_TOKEN || "auth_token";
    return localStorage.getItem(tokenKey);
  }, []);

  const [loginRedirectPath, setLoginRedirectPath] = useState<string>("");

  useEffect(() => {
    if (!isLoginOpen) {
      setLoginRedirectPath("");
    }
  }, [isLoginOpen]);

  const handleWorkflowClick = useCallback(() => {
    setOpenMenu(null);
    onClose();

    if (getAuthToken()) {
      router.push("/tools/workflow");
      return;
    }

    setLoginRedirectPath("/tools/workflow");
    onLoginOpen();
  }, [getAuthToken, onClose, onLoginOpen, router]);

  const handleTaskManagerClick = useCallback(() => {
    setOpenMenu(null);
    onClose();

    if (getAuthToken()) {
      router.push("/tools/task-manager");
      return;
    }

    setLoginRedirectPath("/tools/task-manager");
    onLoginOpen();
  }, [getAuthToken, onClose, onLoginOpen, router]);

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

  const renderSubMenu = (subItem: SidebarItem, depth: number = 1) => {
    if (subItem.children && subItem.children.length > 0) {
      return (
        <Menu key={subItem.id} placement="right-start" isLazy closeOnSelect={false} offset={[0, 10]}>
          <MenuButton
            as={MenuItem}
            borderRadius="xl"
            transition="all 0.2s ease"
            _hover={{ bg: mobileLinkHover }}
            py={3}
          >
            <HStack justify="space-between" width="100%">
              <HStack spacing={3}>
                {renderIcon(subItem, 18)}
                <Text fontWeight="700" fontSize="sm">
                  {subItem.name}
                </Text>
              </HStack>
              <ChevronRightIcon opacity={0.5} />
            </HStack>
          </MenuButton>
          <MenuList
            bg={menuBg}
            color={menuTextColor}
            p={2}
            borderRadius="2xl"
            zIndex={9999}
            animation={`${slideRight} 0.24s ease-out`}
            sx={{
              border: "1px solid !important",
              borderColor: `${menuBorderColor} !important`,
              boxShadow: `${shadowColor} !important`,
              outline: "none !important",
            }}
          >
            {subItem.children.map((child) => renderSubMenu(child, depth + 1))}
          </MenuList>
        </Menu>
      );
    } else {
      // Auth-guarded items: show login popup if not logged in
      const isGuarded = subItem.url === "/tools/task-manager";
      if (isGuarded) {
        return (
          <MenuItem
            key={subItem.id}
            borderRadius="xl"
            py={depth === 1 ? 3 : 2.5}
            fontSize="sm"
            fontWeight="700"
            transition="all 0.18s ease"
            _hover={{ bg: mobileLinkHover }}
            onClick={handleTaskManagerClick}
          >
            <HStack spacing={3}>
              {renderIcon(subItem, depth === 1 ? 18 : 16)}
              <span>{subItem.name}</span>
            </HStack>
          </MenuItem>
        );
      }
      return (
        <MenuItem
          key={subItem.id}
          as={Link}
          href={subItem.url || "#"}
          borderRadius="xl"
          py={depth === 1 ? 3 : 2.5}
          fontSize="sm"
          fontWeight="700"
          transition="all 0.18s ease"
          _hover={{ bg: mobileLinkHover }}
          onClick={() => setOpenMenu(null)}
        >
          <HStack spacing={3}>
            {renderIcon(subItem, depth === 1 ? 18 : 16)}
            <span>{subItem.name}</span>
          </HStack>
        </MenuItem>
      );
    }
  };

  const toggleMobileSection = (id: string | number) => {
    setOpenMobileSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderMobileMenu = (child: SidebarItem, depth: number = 0) => {
    const isOpenSection = Boolean(openMobileSections[child.id]);

    if (child.children && child.children.length > 0) {
      return (
        <Box key={child.id} mb={depth === 0 ? 2 : 1} mx={2}>
          <Box
            px={4}
            py={3.5 - depth * 0.5}
            borderRadius={depth === 0 ? "2xl" : "0 12px 12px 0"}
            bg={isOpenSection ? mobileLinkHover : "transparent"}
            cursor="pointer"
            _hover={{ bg: mobileLinkHover }}
            onClick={() => toggleMobileSection(child.id)}
          >
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                {renderIcon(child, 20 - depth * 2)}
                <Text fontSize="sm" fontWeight="700">
                  {child.name}
                </Text>
              </HStack>
              <Icon
                as={ChevronRightIcon}
                transform={isOpenSection ? "rotate(90deg)" : "rotate(0deg)"}
                transition="transform 0.2s ease"
                w={4}
                h={4}
              />
            </HStack>
          </Box>
          {isOpenSection && (
            <VStack
              align="stretch"
              spacing={1}
              mt={1}
              ml={5 + depth * 3}
              borderLeft="1.5px solid"
              borderColor={borderColor}
            >
              {child.children.map((nested) => renderMobileMenu(nested, depth + 1))}
            </VStack>
          )}
        </Box>
      );
    } else {
      // Auth-guarded items in mobile drawer
      const isGuarded = child.url === "/tools/task-manager";
      if (isGuarded) {
        return (
          <Box
            key={child.id}
            mx={2}
            p={3.5 - depth * 0.5}
            borderRadius={depth === 0 ? "2xl" : "0 12px 12px 0"}
            onClick={handleTaskManagerClick}
            _hover={{ bg: mobileLinkHover }}
            bg={pathname === child.url ? mobileLinkHover : "transparent"}
            cursor="pointer"
          >
            <HStack spacing={3}>
              {renderIcon(child, 20 - depth * 2)}
              <Text fontSize="sm" fontWeight="700">
                {child.name}
              </Text>
            </HStack>
          </Box>
        );
      }
      return (
        <Box
          key={child.id}
          as={Link}
          href={child.url || "#"}
          mx={2}
          p={3.5 - depth * 0.5}
          borderRadius={depth === 0 ? "2xl" : "0 12px 12px 0"}
          onClick={onClose}
          _hover={{ bg: mobileLinkHover }}
          bg={pathname === child.url ? mobileLinkHover : "transparent"}
        >
          <HStack spacing={3}>
            {renderIcon(child, 20 - depth * 2)}
            <Text fontSize="sm" fontWeight="700">
              {child.name}
            </Text>
          </HStack>
        </Box>
      );
    }
  };

  // ── sidebarData ko 2 parts mein split karo ──
  // Last item = "More", baaki sab = other menus
  const sidebarItems = sidebarData as SidebarItem[];
  const mainMenuItems = sidebarItems.slice(0, -1); // More ko chhodkar sab
  const moreItem = sidebarItems[sidebarItems.length - 1]; // Sirf "More"

  // ── Single Menu render karne ka helper ──
  const renderMenu = (mainItem: SidebarItem) => (
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
          p={2}
          borderRadius="2xl"
          animation={`${slideDown} 0.24s ease-out`}
          sx={{
            border: "1px solid !important",
            borderColor: `${menuBorderColor} !important`,
            boxShadow: `${shadowColor} !important`,
            outline: "none !important",
          }}
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
            mainItem.children?.map((subItem) => renderSubMenu(subItem))
          )}
        </MenuList>
      </Portal>
    </Menu>
  );

  return (
    <HStack
      spacing={0}
      width="100%"
      minW={0}
      overflow="visible"
      px={{ base: 2, md: 3, xl: 4 }}
      minH="64px"
      py={0}
      alignItems="center"
      justify="flex-start"
    >
      {/* ── LOGO ── */}
      <HStack flexShrink={0} mr={{ base: 2, md: 3, xl: 4 }}>
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

      {/* ── SEARCH ICON NEXT TO LOGO ── */}
      {isDesktop && <GlobalSearch variant="compact" />}

      {/* ── DESKTOP: Nav pills ── */}
      {isDesktop ? (
        <Flex flex="1 1 0" minW={0} justify="center" alignItems="center" gap={3}>

          <HStack
            spacing={2}
            flexWrap="nowrap"
            justify="center"
            alignItems="center"
            px="4px"
            py="2px"
            transition="all 0.3s ease"
          >
            {/* ── HOME ── */}
            <Box
              as={Link}
              href="/"
              px={{ xl: "10px", "2xl": "14px" }}
              py="4px"
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

            {/* ── PDF Tools, Image Tools, Base64, Formatters, File Converters ── */}
            {mainMenuItems.map((mainItem) => renderMenu(mainItem))}

            {/* ── WORKFLOW (More se pehle) ── */}
            <Box
              px={{ xl: "10px", "2xl": "14px" }}
              py="6px"
              borderRadius="full"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              onClick={handleWorkflowClick}
            >
              <Text
                fontSize="11px"
                fontWeight="700"
                color={textColor}
                textTransform="uppercase"
                letterSpacing="0.06em"
                whiteSpace="nowrap"
              >
                Workflow
              </Text>
            </Box>

            {/* ── NOTES (After Workflow) ── */}
            <Box
              px={{ xl: "10px", "2xl": "14px" }}
              py="6px"
              borderRadius="full"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              onClick={handleTaskManagerClick}
            >
              <Text
                fontSize="11px"
                fontWeight="700"
                color={textColor}
                textTransform="uppercase"
                letterSpacing="0.06em"
                whiteSpace="nowrap"
              >
                Notes
              </Text>
            </Box>

            {/* ── MORE (Last mein) ── */}
            {renderMenu(moreItem)}

          </HStack>
        </Flex>
      ) : (
        /* ── MOBILE: search icon + hamburger ── */
        <HStack spacing={2}>
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
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent bg={menuBg} borderLeftRadius={{ base: "0", md: "3xl" }} maxW="100%">
          <HStack p={6} justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="800" letterSpacing="-0.02em">Navigation</Text>
            <IconButton size="sm" variant="ghost" aria-label="Close" icon={<CloseIcon boxSize={3} />} onClick={onClose} borderRadius="full" />
          </HStack>

          <DrawerBody px={2} pb={8}>
            <VStack align="stretch" spacing={1}>
              {/* Home */}
              <Box as={Link} href="/" mx={2} p={4} borderRadius="2xl" onClick={onClose} bg={pathname === "/" ? mobileLinkHover : "transparent"} _hover={{ bg: mobileLinkHover }} transition="0.2s">
                <HStack spacing={3}>
                  <Icon as={BiHomeAlt} boxSize={5} color={pathname === "/" ? accentColor : "inherit"} />
                  <Text fontWeight="700">Home</Text>
                </HStack>
              </Box>

              <Divider my={4} opacity={0.5} mx={4} w="auto" />

              {/* Main items (More chhodkar) */}
              {mainMenuItems.map((item) => (
                <Box key={item.id} mb={6}>
                  <Text px={5} mb={3} fontSize="11px" fontWeight="800" textTransform="uppercase" letterSpacing="2px" color={accentColor}>
                    {item.name}
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {item.children?.map((child) => renderMobileMenu(child))}
                  </VStack>
                </Box>
              ))}

              {/* Workflow - mobile drawer mein bhi */}
              <Divider my={2} opacity={0.5} mx={4} w="auto" />
              <Box mx={2} p={4} borderRadius="2xl" onClick={handleWorkflowClick} cursor="pointer" bg={pathname === "/tools/workflow" ? mobileLinkHover : "transparent"} _hover={{ bg: mobileLinkHover }} transition="0.2s">
                <HStack spacing={3}>
                  <Text fontWeight="700">Workflow</Text>
                </HStack>
              </Box>

              {/* More - mobile drawer mein last mein */}
              <Box key={moreItem.id} mb={6} mt={2}>
                <Text px={5} mb={3} fontSize="11px" fontWeight="800" textTransform="uppercase" letterSpacing="2px" color={accentColor}>
                  {moreItem.name}
                </Text>
                <VStack align="stretch" spacing={1}>
                  {moreItem.children?.map((child) => renderMobileMenu(child))}
                </VStack>
              </Box>

            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isLoginOpen} onClose={onLoginClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent
          borderRadius="2xl"
          overflow="hidden"
          mx={4}
          maxW="540px"
          w="full"
          bg={loginModalBg}
          border={loginModalBorder}
          boxShadow={shadowColor}
        >
          <ModalCloseButton
            top={4}
            right={4}
            zIndex={1}
            color={loginModalCloseColor}
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
          />
          <ModalBody p={{ base: 5, md: 7 }}>
            <LoginContent isModal onLoginSuccess={onLoginClose} redirectPath={loginRedirectPath} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </HStack>
  );
});

export default HeaderLogo;

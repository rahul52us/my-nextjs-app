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
  Icon,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { BiHomeAlt } from "react-icons/bi";
import { sidebarData } from "../../../SidebarLayout/utils/SidebarItems";

const HeaderLogo = observer(() => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Theming
  const textColor = "white";
  const accentColor = "blue.300";
  const hoverBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.100");
  const menuBg = useColorModeValue("white", "gray.800");
  const menuItemColor = useColorModeValue("gray.700", "gray.200");
  const mobileLinkHover = useColorModeValue("blue.50", "gray.700");

  return (
    <HStack
      spacing={8}
      width="100%"
      pr={6}
      height="64px"
      alignItems="center"
      justify="space-between"
    >
      {/* --- LOGO --- */}
      <HStack spacing={2} flexShrink={0}>
        <Link href="/" passHref>
          <Text
            fontSize="22px"
            fontWeight="800"
            color={textColor}
            letterSpacing="-0.04em"
            cursor="pointer"
            userSelect="none"
            ml={2}
            transition="opacity 0.2s"
            _hover={{ opacity: 0.9 }}
          >
            BASI<Text as="span" color={accentColor}>FY</Text>
          </Text>
        </Link>
      </HStack>

      {/* --- DESKTOP NAVIGATION --- */}
      {isDesktop ? (
        <Flex flex={1} justify="center">
          <HStack spacing={2}>
            {/* HOME LINK */}
            <Box
              as={Link}
              href="/"
              px={4}
              py={2}
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ bg: hoverBg }}
            >
              <HStack spacing={1}>
                {/* <Icon as={BiHomeAlt} color={textColor} boxSize={4} /> */}
                <Text
                  fontSize="13px"
                  fontWeight="700"
                  color={textColor}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Home
                </Text>
              </HStack>
            </Box>

            {/* DYNAMIC SIDEBAR LINKS */}
            {sidebarData.map((mainItem) => (
              <Menu key={mainItem.id} isLazy gutter={12}>
                <MenuButton
                  as={Box}
                  cursor="pointer"
                  px={4}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{ bg: hoverBg }}
                  role="group"
                >
                  <HStack spacing={1}>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color={textColor}
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      {mainItem.name}
                    </Text>
                    <Icon
                      as={ChevronDownIcon}
                      color="whiteAlpha.600"
                      transition="transform 0.2s"
                      _groupHover={{ transform: "translateY(1px)", color: "white" }}
                    />
                  </HStack>
                </MenuButton>

                <Portal>
                  <MenuList
                    bg={menuBg}
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={useColorModeValue("gray.100", "gray.700")}
                    borderRadius="xl"
                    py={2}
                    minW="220px"
                    zIndex={1500}
                  >
                    {mainItem.children?.map((subItem) => (
                      <MenuItem
                        key={subItem.id}
                        as={Link}
                        href={subItem.url}
                        fontSize="14px"
                        fontWeight="500"
                        color={menuItemColor}
                        py={2.5}
                        px={4}
                        mx={2}
                        borderRadius="lg"
                        width="auto"
                        _hover={{
                          bg: "blue.50",
                          color: "blue.600",
                        }}
                        _focus={{ bg: "blue.50" }}
                        icon={subItem.icon}
                      >
                        {subItem.name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Portal>
              </Menu>
            ))}
          </HStack>
        </Flex>
      ) : (
        /* --- MOBILE HAMBURGER BUTTON --- */
        <IconButton
          aria-label="Open navigation menu"
          variant="ghost"
          icon={<HamburgerIcon color="white" boxSize={7} />}
          onClick={onOpen}
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "whiteAlpha.300" }}
        />
      )}

      {/* --- MOBILE DRAWER --- */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={menuBg}>
          <HStack p={4} justify="space-between" borderBottomWidth="1px">
            <Text fontWeight="800" fontSize="lg" letterSpacing="-0.02em">
              NAVIGATION
            </Text>
            <IconButton 
              aria-label="Close menu" 
              icon={<CloseIcon boxSize={3} />} 
              variant="ghost" 
              onClick={onClose} 
            />
          </HStack>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              {/* Mobile Home Link */}
              <Box
                as={Link}
                href="/"
                p={4}
                onClick={onClose}
                _hover={{ bg: mobileLinkHover }}
                transition="background 0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={BiHomeAlt} boxSize={5} color="blue.500" />
                  <Text fontWeight="600">Home</Text>
                </HStack>
              </Box>

              <Divider />

              {/* Mobile Dynamic Links */}
              {sidebarData.map((item) => (
                <Box key={item.id} py={2}>
                  <Text 
                    px={4} 
                    py={2} 
                    fontSize="xs" 
                    fontWeight="bold" 
                    color="gray.400" 
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {item.name}
                  </Text>
                  
                  {item.children?.map((child) => (
                    <Box
                      key={child.id}
                      as={Link}
                      href={child.url}
                      display="block"
                      p={3}
                      pl={8}
                      onClick={onClose}
                      _hover={{ bg: mobileLinkHover }}
                      transition="background 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box color="gray.500">{child.icon}</Box>
                        <Text fontSize="md" fontWeight="500" color={menuItemColor}>
                          {child.name}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                  <Divider mt={2} />
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
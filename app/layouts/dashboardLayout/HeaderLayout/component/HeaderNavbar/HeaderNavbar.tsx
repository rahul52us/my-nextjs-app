"use client";

import {
  Flex,
  IconButton,
  HStack,
  Box,
  Divider,
  useColorModeValue,
  useBreakpointValue,
  Tooltip,
} from "@chakra-ui/react";
// import { FaBars } from "react-icons/fa";
import { observer } from "mobx-react-lite";
import HeaderProfile from "./HeaderProfile/HeaderProfile";
import HeaderThemeSwitch from "./HeaderThemeSwitch/HeaderThemeSwitch";
import stores from "../../../../../store/stores";

const HeaderNavbar = observer(() => {
  const { layout: { setOpenMobileSideDrawer } } = stores;
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  // Premium styling variables
  const borderColor = useColorModeValue("whiteAlpha.400", "whiteAlpha.300");
  const glassBg = useColorModeValue("whiteAlpha.200", "blackAlpha.300");
  const mobileMenuColor = "white";

  return (
    <HStack spacing={4} pr={2}>
      {/* Main Action Container 
          Using a glass effect and a subtle border makes the profile/theme section 
          look like a dedicated "User Control Center"
      */}
      <HStack 
        spacing={0} 
        bg={glassBg} 
        backdropFilter="blur(8px)"
        px={2} 
        py={1.5} 
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{ borderColor: "whiteAlpha.500", boxShadow: "sm" }}
      >
        <Tooltip label="Toggle Theme" fontSize="xs" placement="bottom">
          <Box px={1}>
            <HeaderThemeSwitch />
          </Box>
        </Tooltip>

        <Divider 
          orientation="vertical" 
          h="24px" 
          mx={2} 
          borderColor={borderColor} 
          opacity={0.6}
        />

        <Box px={1}>
          <HeaderProfile />
        </Box>
      </HStack>

      Mobile Menu - Enhanced with better hit area and animation
      {/* {!isDesktop && (
        <IconButton
          aria-label="Open Menu"
          variant="ghost"
          fontSize="20px"
          color={mobileMenuColor}
          borderRadius="lg"
          _hover={{ 
            bg: "whiteAlpha.200",
            transform: "translateY(-1px)"
          }}
          _active={{ 
            bg: "whiteAlpha.300",
            transform: "translateY(0)"
          }}
          transition="all 0.2s"
          icon={<FaBars />}
          onClick={() => setOpenMobileSideDrawer(true)}
        />
      )} */}
    </HStack>
  );
});

export default HeaderNavbar;
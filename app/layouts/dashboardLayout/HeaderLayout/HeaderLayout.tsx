"use client";

import { Flex, useColorModeValue, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import HeaderNavbar from "./component/HeaderNavbar/HeaderNavbar";
import HeaderLogo from "./component/Logo/HeaderLogo";
import { headerHeight, headerPadding } from "../../../component/config/utils/variable";
import React from "react";

const HeaderLayout = observer(() => {
  // Enhanced Professional Color Logic
  const bgGradient = useColorModeValue(
    "linear(to-r, skyblue.600, skyblue.500)", 
    "gray.900"
  );
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.100");
  
  return (
    <Flex
      as="header"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height={headerHeight}
      px={headerPadding} // Use horizontal padding only
      bg={bgGradient}
      // Glassmorphism effect
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
      transition="all 0.3s ease"
    >
      {/* LEFT: Logo & Toggle 
        We use a fixed width or min-width to prevent 
        the center links from shifting.
      */}
      <Flex flex={1} justify="flex-start" alignItems="center">
        <HeaderLogo />
      </Flex>

      {/* RIGHT: User Actions, Search, Profile 
        Wrapped in a Flex to ensure it stays pinned.
      */}
      <Flex flexShrink={0} alignItems="center">
        <HeaderNavbar />
      </Flex>

      {/* OPTIONAL: Subtle Top Progress Bar Decor 
        Gives it a high-tech "loading" or "active" feel.
      */}
      <Box
        position="absolute"
        bottom="-1px"
        left="0"
        width="100%"
        height="1px"
        bgGradient="linear(to-r, transparent, whiteAlpha.400, transparent)"
      />
    </Flex>
  );
});

export default HeaderLayout;
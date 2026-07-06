"use client";

import { Flex, useColorModeValue, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import HeaderNavbar from "./component/HeaderNavbar/HeaderNavbar";
import HeaderLogo from "./component/Logo/HeaderLogo";
import { headerHeight, headerPadding } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";
import React from "react";

const HeaderLayout = observer(() => {
  const { themeStore: { themeConfig } } = stores;

  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.100");

  return (
    <Flex
      as="header"
      width="full"
      maxW="100vw"
      overflow="visible"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height={headerHeight}
      px={{ base: 2, sm: 3, md: headerPadding }}
      bg={useColorModeValue("whiteAlpha.80", "blackAlpha.550")}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="none"
      position="sticky"
      top={0}
      zIndex={100}
      transition="all 0.3s ease"
    >
      {/* LEFT: Logo + nav (takes all remaining space) */}
      <Flex flex={1} minW={0} justify="flex-start" alignItems="center" overflow="hidden">
        <HeaderLogo />
      </Flex>

      {/* RIGHT: Theme switch + profile */}
      <Flex flex="0 0 auto" alignItems="center">
        <HeaderNavbar />
      </Flex>

      {/* Subtle bottom gradient line */}
      <Box
        position="absolute"
        bottom="-1px"
        left="0"
        width="100%"
        height="1px"
        bgGradient="linear(to-r, transparent, whiteAlpha.400, transparent)"
        pointerEvents="none"
      />
    </Flex>
  );
});

export default HeaderLayout;

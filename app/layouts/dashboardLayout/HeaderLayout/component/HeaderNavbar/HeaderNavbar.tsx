"use client";

import {
  HStack,
  Box,
  Divider,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import HeaderProfile from "./HeaderProfile/HeaderProfile";
import HeaderThemeSwitch from "./HeaderThemeSwitch/HeaderThemeSwitch";
import stores from "../../../../../store/stores";

const HeaderNavbar = observer(() => {
  const {
    themeStore: { themeConfig },
  } = stores;

  const borderColor = useColorModeValue("whiteAlpha.400", "whiteAlpha.300");
  const glassBg = useColorModeValue("whiteAlpha.200", "blackAlpha.300");

  return (
    /*
     * FIX: flex="0 0 auto" (shorthand: flexShrink={0}) ensures the right-side
     *      controls (theme switch + avatar) never get compressed or pushed
     *      off-screen when the nav items take up space.
     *      pr={2} gives a small right breathing room.
     */
    <HStack spacing={3} pr={2} flexShrink={0}>
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
    </HStack>
  );
});

export default HeaderNavbar;
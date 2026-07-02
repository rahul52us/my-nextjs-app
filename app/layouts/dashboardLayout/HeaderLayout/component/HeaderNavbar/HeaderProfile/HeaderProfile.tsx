"use client";

import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Box,
  Text,
  VStack,
  Icon,
  Portal,
  Button,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  FaCog,
  FaLock,
  FaPalette,
  FaSignOutAlt,
  FaUser,
  FaKey,
  FaHome,
} from "react-icons/fa";
import stores from "../../../../../../store/stores";
import { authentication, main } from "../../../../../../config/utils/routes";
import { useRouter, usePathname } from "next/navigation";
import { WEBSITE_TITLE } from "../../../../../../config/utils/variables";
import { themeStore } from "../../../../../../store/themeStore/themeStore";

const HeaderProfile = observer(() => {
  const { auth: { doLogout } } = stores;
  const pathname = usePathname();
  const router = useRouter();
  const {
    auth: { user },
  } = stores;

  const themeConfig = themeStore.themeConfig;

  return user ? (
    <Menu closeOnSelect={false} placement="bottom-end">
      {({ onClose }) => (
        <>
          <MenuButton
            as={IconButton}
            aria-label="User Menu"
            icon={
              <Avatar
                src={user?.pic?.url || undefined}
                size="sm"
                borderRadius={10}
                name={user?.name}
              />
            }
            size="sm"
            variant="ghost"
          />
          {/* Portal renders outside the navbar DOM node — no z-index clipping */}
          <Portal>
            <MenuList
              minWidth="220px"
              boxShadow="xl"
              borderRadius="md"
              zIndex={9999}   // ← HIGH enough to always sit above the sticky header (zIndex 1000)
              p={2}
            >
              <VStack spacing={2}>
                <Box textAlign="center">
                  <Avatar
                    src={user?.pic?.url || undefined}
                    size="lg"
                    name={user?.name}
                  />
                  <Text mt={2} fontWeight="bold">
                    {user?.name}
                  </Text>
                  <Text mt={0.5} fontWeight="xl" fontSize="sm" cursor="pointer">
                    {WEBSITE_TITLE?.split('-').join(' ')}
                  </Text>
                </Box>
                <Divider />
                {user && pathname !== main.home && (
                  <MenuItem
                    onClick={() => {
                      onClose();
                      router.push(main.home);
                    }}
                  >
                    <FaHome style={{ marginRight: "8px" }} /> Home
                  </MenuItem>
                )}
                <MenuItem display="none" onClick={() => {
                    onClose();
                    router.push(main.profile);
                  }}>
                  <FaCog style={{ marginRight: "8px" }} /> Profile Settings
                </MenuItem>
                <MenuItem display="none" onClick={() => {
                    onClose();
                    router.push(main.changePassword);
                  }}>
                  <FaLock style={{ marginRight: "8px" }} /> Change Password
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onClose();
                    themeStore.setOpenThemeDrawer();
                  }}
                >
                  <FaPalette style={{ marginRight: "8px" }} /> Customize Theme
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    onClose();
                    doLogout();
                    router.push(authentication.login);
                  }}
                >
                  <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
                </MenuItem>
              </VStack>
            </MenuList>
          </Portal>
        </>
      )}
    </Menu>
  ) : (
    <Button
  size="sm"
  variant="ghost"
  color="white"
  _hover={{
    bg: "whiteAlpha.200",
    color: "white",
  }}
  _active={{
    bg: "whiteAlpha.300",
  }}
  onClick={() => router.push(authentication.login)}
  leftIcon={<Icon as={FaUser} boxSize={4} color="white" />}
>
  Login
</Button>
  );
});

export default HeaderProfile;
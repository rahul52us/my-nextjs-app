"use client"; // Add this for client-side component in Next.js

import { useEffect, useState } from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { BiMoon, BiSun } from "react-icons/bi";


const HeaderThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== "undefined" ? colorMode === "dark" : false // Handle SSR
  );

  useEffect(() => {
    setIsDarkMode(colorMode === "dark");
  }, [colorMode]);

  const toggleMode = () => {
    toggleColorMode();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <IconButton
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      icon={isDarkMode ? <BiSun /> : <BiMoon />}
      onClick={toggleMode}
      variant="ghost"
      size="md"
      fontSize="22px"
      color="white"
      _hover={{
        bg: "whiteAlpha.200",
        color: "white",
      }}
      _active={{
        bg: "whiteAlpha.300",
      }}
      _focus={{
        boxShadow: "none",
      }}
    />
  );
};

export default HeaderThemeSwitch;
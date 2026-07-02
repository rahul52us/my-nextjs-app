"use client";

import { useColorModeValue } from "@chakra-ui/react";

export const useAuthFormStyles = () => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    "linear-gradient(135deg, #0a1f33 0%, #132d47 100%)"
  );

  const inputBg = "transparent";

  const inputBorder = useColorModeValue(
    "rgba(2, 91, 151, 0.2)",
    "rgba(3, 117, 196, 0.3)"
  );

  const inputTextColor = useColorModeValue("#0a1f33", "white");

  const subtextColor = useColorModeValue(
    "#64748b",
    "rgb(148, 163, 184)"
  );

  const textColor = useColorModeValue("#0a1f33", "white");

  const dividerColor = useColorModeValue(
    "rgba(2, 91, 151, 0.1)",
    "rgba(3, 117, 196, 0.2)"
  );

  const inputStyles = {
    bg: inputBg,
    border: "1px solid",
    borderColor: inputBorder,
    borderRadius: "12px",
    h: "48px",
    px: 4,
    fontSize: "sm",
    color: inputTextColor,
    transition: "all 0.3s ease",
    _placeholder: {
      color: subtextColor,
      fontWeight: "500",
    },
    _focus: {
      borderColor: "#025b97",
      boxShadow: "0 0 0 3px rgba(2, 91, 151, 0.1)",
    },
    _hover: {
      borderColor: "#0375c4",
    },
  };

  const primaryButtonStyles = {
    h: "48px",
    bg: "linear-gradient(135deg, #1f6feb 0%, #0b3aba 100%)",
    color: "white",
    borderRadius: "14px",
    fontSize: "sm",
    fontWeight: "700",
    letterSpacing: "0.6px",
    width: "100%",
    transition: "all 0.3s ease",
    _hover: {
      bg: "linear-gradient(135deg, #2566f3, #1255d1)",
      transform: "translateY(-1px)",
      boxShadow: "0 12px 24px rgba(31, 111, 235, 0.25)",
    },
    _active: {
      bg: "linear-gradient(135deg, #1647c6, #0a2f8d)",
      transform: "translateY(0px)",
    },
  };

  const linkStyles = {
    fontSize: "xs",
    color: "#025b97",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    _hover: {
      color: "#0375c4",
      textDecoration: "underline",
    },
  };

  return {
    bgGradient,
    inputBg,
    inputBorder,
    inputTextColor,
    subtextColor,
    textColor,
    dividerColor,
    inputStyles,
    primaryButtonStyles,
    linkStyles,
  };
};
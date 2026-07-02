import { extendTheme, StyleFunctionProps } from "@chakra-ui/react";
import stores from "../store/stores";

const breakpoints = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
    },
    sizes: {
      xl: {
        h: "56px",
        fontSize: "lg",
        px: "32px",
      },
    },
    variants: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: {
          bg: "brand.600",
        },
      },
    },
    Text: {
      baseStyle: {
        fontWeight: "300",
      },
    },
  },

  // ── Menu: dark mode ka ugly border/box fix ──────────────────
  Menu: {
    baseStyle: (props: StyleFunctionProps) => ({
      list: {
        bg: props.colorMode === "dark" ? "#111111" : "white",
        border: props.colorMode === "dark" ? "none" : "1px solid",
        borderColor: props.colorMode === "dark" ? "transparent" : "#e2e8f0",
        boxShadow:
          props.colorMode === "dark"
            ? "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)"
            : "0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.07)",
        outline: "none",
      },
      item: {
        bg: "transparent",
        _hover: {
          bg: props.colorMode === "dark" ? "whiteAlpha.100" : "brand.50",
        },
        _focus: {
          bg: props.colorMode === "dark" ? "whiteAlpha.100" : "brand.50",
        },
      },
    }),
  },
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: "FFFFFA",
      fontFamily: "var(--font-lato), sans-serif",
      color: props.colorMode === "light" ? "brand.900" : "darkBrand.50",
    },
  }),
};

const fonts = {
  heading: "Montserrat, sans-serif",
  body: "var(--font-lato), sans-serif",
};

const {
  themeStore: { themeConfig },
} = stores;

export { fonts, breakpoints, components, styles };

const theme = extendTheme({ ...themeConfig, fonts, breakpoints, components, styles });
export { theme };
export default theme;
import { action, makeObservable, observable } from "mobx";
import _ from "lodash";

class ThemeStore {
  openThemeDrawer = {
    open: false,
  };

  backthemeConfig = {
    fonts: {
      size: {
        xs: "0.8rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "1.8rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
        "4xl": "3.5rem",
      },
    },
    colors: {
      brand: {
        50: "#e6f3ff",
        100: "#cce7ff",
        200: "#99cfff",
        300: "#66b7ff",
        400: "#33a0ff",
        500: "#007acc",
        600: "#0066b3",
        700: "#005299",
        800: "#003d80",
        900: "#002966",
      },
      light: {
        primary: {
          50: "#FFEBEE",
          100: "#FFCDD2",
          200: "#EF9A9A",
          300: "#E57373",
          400: "#EF5350",
          500: "#F44336",
          600: "#E53935",
          700: "#D32F2F",
          800: "#C62828",
          900: "#B71C1C",
        },
        secondary: "#ffffff",
      },
      dark: {
        primary: {
          50: "#FFEBEE",
          100: "#FFCDD2",
          200: "#EF9A9A",
          300: "#E57373",
          400: "#EF5350",
          500: "#F44336",
          600: "#E53935",
          700: "#D32F2F",
          800: "#C62828",
          900: "#B71C1C",
        },
        secondary: "#000000",
      },
      custom: {
        light: {
          primary: "#1E90FF",
          secondary: "#ffffff",
        },
        dark: {
          primary: "#1A202C",
          secondary: "#000000",
        },
      },
    },
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
  };

  themeConfig = { ...this.backthemeConfig };

  constructor() {
    makeObservable(this, {
      themeConfig: observable,
      openThemeDrawer: observable,
      setOpenThemeDrawer: action,
      setThemeConfig: action,
      resetTheme: action,
    });

    if (typeof window !== "undefined") {
      // Ensure this only runs on the client-side
      const storedThemeConfig = localStorage.getItem(
        process.env.NEXT_PUBLIC_THEME_TOKEN_STORE || "theme_config"
      );
      if (storedThemeConfig) {
        try {
          this.themeConfig = JSON.parse(storedThemeConfig);
        } catch ({} : any) {
          this.resetTheme();
        }
      }
    }
  }

  setThemeConfig = (key: string, value: any) => {
    const newConfig = { ...this.themeConfig };
    _.set(newConfig, key, value);
    this.themeConfig = newConfig;
    if (typeof window !== "undefined") {
      localStorage.setItem(
        process.env.NEXT_PUBLIC_THEME_TOKEN_STORE || "theme_config",
        JSON.stringify(this.themeConfig)
      );
    }
  };

  setOpenThemeDrawer = () => {
    this.openThemeDrawer.open = !this.openThemeDrawer.open;
  };

  resetTheme = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(process.env.NEXT_PUBLIC_THEME_TOKEN_STORE || "theme_config");
    }
    this.themeConfig = { ...this.backthemeConfig };
  };
}

export const themeStore = new ThemeStore();

"use client"; // Only if using Next.js App Router

import { observer } from "mobx-react-lite";
import CustomDrawer from "../Drawer/CustomDrawer";
import { Box, Button, Flex, Grid, SystemStyleObject, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import stores from "../../../store/stores";
import ColorPickerComponent from "../ColorPicker/ColorPicker";
import theme from "../../../theme/theme";
import React from "react";

interface ColorOption {
  name: string;
  code: string;
  palette: { [key: number]: string };
}

interface CustomColorBoxProps {
  color: string;
  colorName: string;
  selected: boolean;
  onClick: () => void;
}

const CustomColorBox: React.FC<CustomColorBoxProps> = ({ color, colorName, selected, onClick }) => {
  const setHovered = useState(false)[1]

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  const boxStyle: SystemStyleObject = {
    width: "70px",
    height: "70px",
    backgroundColor: color,
    borderRadius: "50%",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: selected ? "2px solid black" : "1px solid lightgray",
  };

  return (
    <Box display="flex" flexDir="column" alignItems="center">
      <Box sx={boxStyle} onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {selected && <FaCheck color="white" />}
      </Box>
      <Text mt={2} fontSize="sm" fontWeight="bold">
        {colorName}
      </Text>
    </Box>
  );
};

const ThemeChangeContainer: React.FC = observer(() => {
  const {
    themeStore: { openThemeDrawer, setOpenThemeDrawer, resetTheme, setThemeConfig },
  } = stores;

  const colors: ColorOption[] = [
    { 
      name: "Blue", 
      code: "#007acc",
      palette: {
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
      }
    },
    { 
      name: "Green", 
      code: "#19a974",
      palette: {
        50: "#e8f8f2",
        100: "#d1f1e5",
        200: "#a3e3cb",
        300: "#75d5b1",
        400: "#47c797",
        500: "#19a974",
        600: "#14855c",
        700: "#0f6144",
        800: "#0a3e2c",
        900: "#051a14",
      }
    },
    { 
      name: "Yellow", 
      code: "#d6a407",
      palette: {
        50: "#fffbe6",
        100: "#fff7cc",
        200: "#ffef99",
        300: "#ffe766",
        400: "#ffdf33",
        500: "#d6a407",
        600: "#b38606",
        700: "#8f6905",
        800: "#6b4c04",
        900: "#473003",
      }
    },
    { 
      name: "Red", 
      code: "#ff6b6b",
      palette: {
        50: "#ffeaea",
        100: "#ffd5d5",
        200: "#ffabab",
        300: "#ff8181",
        400: "#ff5757",
        500: "#ff6b6b",
        600: "#ff3333",
        700: "#e62e2e",
        800: "#cc2929",
        900: "#b32424",
      }
    },
    { 
      name: "Purple", 
      code: "#6b37ff",
      palette: {
        50: "#f0eaff",
        100: "#e1d5ff",
        200: "#c3abff",
        300: "#a581ff",
        400: "#8757ff",
        500: "#6b37ff",
        600: "#572ecc",
        700: "#432599",
        800: "#2f1c66",
        900: "#1b1233",
      }
    },
    { 
      name: "Orange", 
      code: "#ffaa00",
      palette: {
        50: "#fff8e6",
        100: "#fff1cc",
        200: "#ffe399",
        300: "#ffd566",
        400: "#ffc733",
        500: "#ffaa00",
        600: "#e69500",
        700: "#cc8000",
        800: "#b36b00",
        900: "#995600",
      }
    },
  ];

  const [selectedColor, setSelectedColor] = useState<string | null>(null);


  const handleColorSelect = (color: ColorOption) => {
    theme.colors.brand = color.palette;
    setThemeConfig("colors.brand", color.palette);
    setSelectedColor(color.name);
  };

  return (
    <CustomDrawer open={openThemeDrawer.open} close={setOpenThemeDrawer} title="Select the Theme" size="xs">
      <Flex flexDir="column">
        <Box bgColor="#E5F6FD" borderRadius={5} p={3} mb={5} fontSize="md" mt={3}>
          <Text color="#014361" fontSize="sm">
            {`Welcome! Explore our style options below and select the ones that perfectly match your preferences.`}
          </Text>
        </Box>
        <Box>
          <ColorPickerComponent />
        </Box>
        <Box mt={5}>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gap={5}>
            {colors.map((color) => (
              <CustomColorBox
                key={color.code}
                color={color.code}
                colorName={color.name}
                selected={selectedColor === color.name}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </Grid>
        </Box>
        <Button mt={5} onClick={resetTheme}>
          Reset Theme
        </Button>
      </Flex>
    </CustomDrawer>
  );
});

export default ThemeChangeContainer;

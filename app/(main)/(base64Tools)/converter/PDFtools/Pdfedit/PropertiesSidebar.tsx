"use client";

import React from "react";
import {
  VStack, Heading, Text, Input, Button, Divider, HStack,
  FormControl, FormLabel, Select, Badge, Box, Center,
  useColorModeValue, Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Trash2, Download, RotateCcw, Pencil } from "lucide-react";

interface PropertiesSidebarProps {
  selectedElement: any;
  updateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
  updateElementSize: (id: string, w: number, h: number) => void;
  deleteElement: (id: string) => void;
  exportPDF: () => void;
  isExporting: boolean;
  onReset: () => void;
  onEditText: (mod: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({
  selectedElement,
  updateElementStyle,
  updateElementSize,
  deleteElement,
  exportPDF,
  isExporting,
  onReset,
  onEditText,
}: Omit<PropertiesSidebarProps, "isOpen" | "onClose">) => {
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("#E2E8F0", "#2D3748");
  const headingColor = useColorModeValue("gray.500", "gray.400");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.200", "gray.600");
  const inputTextColor = useColorModeValue("gray.800", "gray.100");
  const emptyBorderColor = useColorModeValue("#E2E8F0", "#4A5568");
  const emptyTextColor = useColorModeValue("gray.400", "gray.500");

  const handleStyleChange = (key: string, value: string) => {
    if (!selectedElement) return;
    updateElementStyle(selectedElement.id, { [key]: value });
  };

  return (
    <VStack
      w="full"
      bg={sidebarBg}
      borderLeft={`1px solid ${borderColor}`}
      p={6}
      align="stretch"
      spacing={6}
      shadow="sm"
      overflowY="auto"
      h="full"
    >
      <Heading size="xs" letterSpacing="widest" color={headingColor}>
        PROPERTIES
      </Heading>

      {selectedElement ? (
        <VStack align="stretch" spacing={4}>
          <Badge alignSelf="start" colorScheme="blue" px={2}>
            {selectedElement.type.toUpperCase()}
          </Badge>

          {selectedElement.type === "text" && (
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Pencil size={14} />}
              onClick={() => onEditText(selectedElement)}
            >
              Edit Text
            </Button>
          )}

          {/* Size Controls */}
          <HStack>
            <FormControl>
              <FormLabel fontSize="xs" color={labelColor}>Width</FormLabel>
              <Input
                size="sm"
                type="number"
                bg={inputBg}
                color={inputTextColor}
                borderColor={inputBorderColor}
                value={Math.round(selectedElement.width)}
                onChange={e =>
                  updateElementSize(
                    selectedElement.id,
                    parseInt(e.target.value) || 0,
                    selectedElement.height
                  )
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" color={labelColor}>Height</FormLabel>
              <Input
                size="sm"
                type="number"
                bg={inputBg}
                color={inputTextColor}
                borderColor={inputBorderColor}
                value={Math.round(selectedElement.height)}
                onChange={e =>
                  updateElementSize(
                    selectedElement.id,
                    selectedElement.width,
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </FormControl>
          </HStack>

          {/* Shape Controls */}
          {(selectedElement.type === "rect" || selectedElement.type === "circle") && (
            <>
              <FormControl>
                <FormLabel fontSize="xs" color={labelColor}>Fill Color</FormLabel>
                <Input
                  size="sm"
                  type="color"
                  bg={inputBg}
                  borderColor={inputBorderColor}
                  value={
                    selectedElement.style?.backgroundColor?.toString().startsWith("rgba")
                      ? "#ffffff"
                      : selectedElement.style?.backgroundColor || "#ffffff"
                  }
                  onChange={e => handleStyleChange("backgroundColor", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={labelColor}>Border Thickness</FormLabel>
                <Select
                  size="sm"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  onChange={e =>
                    handleStyleChange("border", `${e.target.value}px solid #3182CE`)
                  }
                >
                  <option value="0">None</option>
                  <option value="2">Thin</option>
                  <option value="5">Thick</option>
                </Select>
              </FormControl>
            </>
          )}

          <Divider borderColor={borderColor} />

          <Button
            size="sm"
            colorScheme="red"
            variant="ghost"
            leftIcon={<Trash2 size={14} />}
            onClick={() => deleteElement(selectedElement.id)}
          >
            Delete Object
          </Button>
        </VStack>
      ) : (
        <Center flex={0.2} border={`1px dashed ${emptyBorderColor}`} rounded="lg" p={4}>
          <Text fontSize="xs" color={emptyTextColor} textAlign="center">
            Select an element to edit its style
          </Text>
        </Center>
      )}

      <Divider borderColor={borderColor} />

      <VStack spacing={3} mt="auto">
        <Button
          w="full"
          colorScheme="red"
          variant="outline"
          h="44px"
          onClick={onReset}
          leftIcon={<RotateCcw size={16} />}
        >
          Reset All
        </Button>
        <Button
          w="full"
          colorScheme="blue"
          h="56px"
          onClick={exportPDF}
          isLoading={isExporting}
          leftIcon={<Download />}
        >
          Download PDF
        </Button>
      </VStack>
    </VStack>
  );
};

const PropertiesSidebar = ({
  isOpen = false,
  onClose = () => {},
  ...props
}: PropertiesSidebarProps) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const drawerBg = useColorModeValue("white", "gray.800");

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerHeader fontSize="sm" letterSpacing="widest">PROPERTIES</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent {...props} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Box w="300px" flexShrink={0} display={{ base: "none", lg: "block" }} h="full">
      <SidebarContent {...props} />
    </Box>
  );
};

export default PropertiesSidebar;
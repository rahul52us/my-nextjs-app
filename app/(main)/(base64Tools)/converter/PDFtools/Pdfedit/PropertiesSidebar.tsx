"use client";

import React from "react";
import {
  VStack, Heading, Text, Input, Button, Divider, HStack,
  FormControl, FormLabel, Select, Badge, Box, Center
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
}

const PropertiesSidebar = ({
  selectedElement,
  updateElementStyle,
  updateElementSize,
  deleteElement,
  exportPDF,
  isExporting,
  onReset,
  onEditText,
}: PropertiesSidebarProps) => {

  const handleStyleChange = (key: string, value: string) => {
    if (!selectedElement) return;
    updateElementStyle(selectedElement.id, { [key]: value });
  };

  return (
    <VStack
      w="320px"
      bg="white"
      borderLeft="1px solid #E2E8F0"
      p={6}
      align="stretch"
      spacing={6}
      shadow="sm"
      overflowY="auto"
    >
      <Heading size="xs" letterSpacing="widest" color="gray.500">
        PROPERTIES
      </Heading>

      {selectedElement ? (
        <VStack align="stretch" spacing={4}>
          <Badge alignSelf="start" colorScheme="blue" px={2}>
            {selectedElement.type.toUpperCase()}
          </Badge>

          {/* Edit Text Button - only for text elements */}
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
              <FormLabel fontSize="xs">Width</FormLabel>
              <Input
                size="sm"
                type="number"
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
              <FormLabel fontSize="xs">Height</FormLabel>
              <Input
                size="sm"
                type="number"
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
                <FormLabel fontSize="xs">Fill Color</FormLabel>
                <Input
                  size="sm"
                  type="color"
                  value={
                    selectedElement.style?.backgroundColor?.toString().startsWith("rgba")
                      ? "#ffffff"
                      : selectedElement.style?.backgroundColor || "#ffffff"
                  }
                  onChange={e => handleStyleChange("backgroundColor", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Border Thickness</FormLabel>
                <Select
                  size="sm"
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

          <Divider />

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
        <Center flex={0.2} border="1px dashed #E2E8F0" rounded="lg" p={4}>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Select an element to edit its style
          </Text>
        </Center>
      )}

      <Divider />

      <VStack spacing={3} mt="auto">
        {/* Reset Button */}
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

        {/* Download Button */}
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

export default PropertiesSidebar;
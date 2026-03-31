"use client";

import React from "react";
import {
  VStack, Heading, Text, Input, Button, Divider, HStack, 
  FormControl, FormLabel, Select, Badge, Box, Center
} from "@chakra-ui/react";
import { Trash2, Download } from "lucide-react";

interface PropertiesSidebarProps {
  selectedElement: any;
  pendingElement: any;
  tempModifiedText: string;
  setTempModifiedText: (val: string) => void;
  commitTextChange: () => void;
  updateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
  updateElementSize: (id: string, w: number, h: number) => void;
  deleteElement: (id: string) => void;
  exportPDF: () => void;
  isExporting: boolean;
}

const PropertiesSidebar = ({
  selectedElement,
  pendingElement,
  tempModifiedText,
  setTempModifiedText,
  commitTextChange,
  updateElementStyle,
  updateElementSize,
  deleteElement,
  exportPDF,
  isExporting
}: PropertiesSidebarProps) => {

  const handleStyleChange = (key: string, value: string) => {
    updateElementStyle(selectedElement.id, { [key]: value });
  };

  return (
    <VStack w="320px" bg="white" borderLeft="1px solid #E2E8F0" p={6} align="stretch" spacing={6} shadow="sm">
      <Heading size="xs" letterSpacing="widest" color="gray.500">PROPERTIES</Heading>

      {pendingElement ? (
        <VStack align="stretch" bg="blue.50" p={4} rounded="xl" spacing={3}>
          <Text fontSize="xs" fontWeight="bold">TEXT EDITOR</Text>
          <Input value={tempModifiedText} onChange={e => setTempModifiedText(e.target.value)} bg="white" autoFocus />
          <Button size="sm" colorScheme="blue" onClick={commitTextChange}>Apply Changes</Button>
        </VStack>
      ) : selectedElement ? (
        <VStack align="stretch" spacing={4}>
          <Badge alignSelf="start" colorScheme="blue" px={2}>{selectedElement.type.toUpperCase()}</Badge>
          
          <HStack>
            <FormControl>
              <FormLabel fontSize="xs">Width</FormLabel>
              <Input size="sm" type="number" value={Math.round(selectedElement.width)} 
                onChange={(e) => updateElementSize(selectedElement.id, parseInt(e.target.value) || 0, selectedElement.height)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Height</FormLabel>
              <Input size="sm" type="number" value={Math.round(selectedElement.height)} 
                onChange={(e) => updateElementSize(selectedElement.id, selectedElement.width, parseInt(e.target.value) || 0)} />
            </FormControl>
          </HStack>

          {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
            <>
              <FormControl>
                <FormLabel fontSize="xs">Fill Color</FormLabel>
                <Input size="sm" type="color" 
                  value={selectedElement.style.backgroundColor?.toString().startsWith('rgba') ? '#ffffff' : selectedElement.style.backgroundColor} 
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} 
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Border Thickness</FormLabel>
                <Select size="sm" onChange={(e) => handleStyleChange('border', `${e.target.value}px solid #3182CE`)}>
                  <option value="0">None</option>
                  <option value="2">Thin</option>
                  <option value="5">Thick</option>
                </Select>
              </FormControl>
            </>
          )}

          <Button size="sm" colorScheme="red" variant="ghost" leftIcon={<Trash2 size={14}/>} onClick={() => deleteElement(selectedElement.id)}>
            Delete Object
          </Button>
        </VStack>
      ) : (
        <Center flex={0.2} border="1px dashed #E2E8F0" rounded="lg" p={4}>
          <Text fontSize="xs" color="gray.400" textAlign="center">Select an element to edit its style</Text>
        </Center>
      )}

      <Divider />
      <Button mt="auto" colorScheme="blue" h="56px" onClick={exportPDF} isLoading={isExporting} leftIcon={<Download />}>
        Download PDF
      </Button>
    </VStack>
  );
};

export default PropertiesSidebar;
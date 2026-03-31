"use client";

import React from "react";
import { HStack, IconButton, Tooltip, Divider } from "@chakra-ui/react";
import { 
  MousePointer2, Type, Square, Circle, Eraser, Image as ImageIcon 
} from "lucide-react";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: any) => void;
  onImageUpload: () => void;
}

const Toolbar = ({ activeTool, setActiveTool, onImageUpload }: ToolbarProps) => {
  return (
    <HStack 
      w="full" 
      bg="white" 
      borderBottom="1px solid #E2E8F0" 
      px={6} 
      py={2} 
      spacing={2} 
      shadow="sm" 
      zIndex={10}
      justifyContent="center"
    >
      <Tooltip label="Select">
        <IconButton 
          aria-label="select" 
          icon={<MousePointer2 size={20}/>} 
          variant={activeTool === 'select' ? 'solid' : 'ghost'} 
          colorScheme="blue" 
          onClick={() => setActiveTool('select')} 
        />
      </Tooltip>
      
      <Tooltip label="Edit Text">
        <IconButton 
          aria-label="text" 
          icon={<Type size={20}/>} 
          variant={activeTool === 'text' ? 'solid' : 'ghost'} 
          colorScheme="blue" 
          onClick={() => setActiveTool('text')} 
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" />

      <Tooltip label="Rectangle">
        <IconButton 
          aria-label="rect" 
          icon={<Square size={20}/>} 
          variant={activeTool === 'rect' ? 'solid' : 'ghost'} 
          colorScheme="blue" 
          onClick={() => setActiveTool('rect')} 
        />
      </Tooltip>

      <Tooltip label="Circle">
        <IconButton 
          aria-label="circle" 
          icon={<Circle size={20}/>} 
          variant={activeTool === 'circle' ? 'solid' : 'ghost'} 
          colorScheme="blue" 
          onClick={() => setActiveTool('circle')} 
        />
      </Tooltip>

      <Tooltip label="Eraser / Whiteout">
        <IconButton 
          aria-label="eraser" 
          icon={<Eraser size={20}/>} 
          variant={activeTool === 'eraser' ? 'solid' : 'ghost'} 
          colorScheme="blue" 
          onClick={() => setActiveTool('eraser')} 
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" />

      <Tooltip label="Insert Image">
        <IconButton 
          aria-label="image" 
          icon={<ImageIcon size={20}/>} 
          variant="ghost" 
          colorScheme="blue" 
          onClick={onImageUpload} 
        />
      </Tooltip>
    </HStack>
  );
};

export default Toolbar;
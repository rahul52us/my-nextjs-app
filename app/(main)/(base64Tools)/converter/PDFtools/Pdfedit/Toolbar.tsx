"use client";

import React from "react";
import { HStack, IconButton, Tooltip, Divider, useColorModeValue } from "@chakra-ui/react";
import {
  MousePointer2, Type, Square, Circle, Eraser, Image as ImageIcon
} from "lucide-react";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: any) => void;
  onImageUpload: () => void;
}

const Toolbar = ({ activeTool, setActiveTool, onImageUpload }: ToolbarProps) => {
  const toolbarBg = useColorModeValue("white", "gray.800");
  const toolbarBorder = useColorModeValue("#E2E8F0", "#2D3748");

  return (
    <HStack
      w="full"
      bg={toolbarBg}
      borderBottom={`1px solid ${toolbarBorder}`}
      px={{ base: 2, md: 6 }}
      py={2}
      spacing={{ base: 1, md: 2 }}
      shadow="sm"
      zIndex={10}
      justifyContent="center"
      flexWrap="wrap"
    >
      <Tooltip label="Select">
        <IconButton
          aria-label="select"
          icon={<MousePointer2 size={18} />}
          variant={activeTool === "select" ? "solid" : "ghost"}
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={() => setActiveTool("select")}
        />
      </Tooltip>

      <Tooltip label="Edit Text">
        <IconButton
          aria-label="text"
          icon={<Type size={18} />}
          variant={activeTool === "text" ? "solid" : "ghost"}
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={() => setActiveTool("text")}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" />

      <Tooltip label="Rectangle">
        <IconButton
          aria-label="rect"
          icon={<Square size={18} />}
          variant={activeTool === "rect" ? "solid" : "ghost"}
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={() => setActiveTool("rect")}
        />
      </Tooltip>

      <Tooltip label="Circle">
        <IconButton
          aria-label="circle"
          icon={<Circle size={18} />}
          variant={activeTool === "circle" ? "solid" : "ghost"}
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={() => setActiveTool("circle")}
        />
      </Tooltip>

      <Tooltip label="Eraser / Whiteout">
        <IconButton
          aria-label="eraser"
          icon={<Eraser size={18} />}
          variant={activeTool === "eraser" ? "solid" : "ghost"}
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={() => setActiveTool("eraser")}
        />
      </Tooltip>

      <Divider orientation="vertical" h="24px" />

      <Tooltip label="Insert Image">
        <IconButton
          aria-label="image"
          icon={<ImageIcon size={18} />}
          variant="ghost"
          colorScheme="blue"
          size={{ base: "sm", md: "md" }}
          onClick={onImageUpload}
        />
      </Tooltip>
    </HStack>
  );
};

export default Toolbar;
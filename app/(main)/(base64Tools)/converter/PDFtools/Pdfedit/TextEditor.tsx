"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Box, VStack, HStack, IconButton, Tooltip, Select,
  Divider, Text, Button, Input
} from "@chakra-ui/react";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, Check, X, Type
} from "lucide-react";

interface TextEditorProps {
  initialText: string;
  initialStyle?: React.CSSProperties;
  position: { x: number; y: number; width: number; height: number };
  onCommit: (text: string, style: React.CSSProperties) => void;
  onCancel: () => void;
}

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "64"];
const FONT_FAMILIES = [
  { label: "Sans Serif", value: "Arial, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "Courier New, monospace" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
];

const TextEditor: React.FC<TextEditorProps> = ({
  initialText,
  initialStyle = {},
  position,
  onCommit,
  onCancel,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(
    initialStyle.fontSize?.toString().replace("px", "") || "16"
  );
  const [fontFamily, setFontFamily] = useState(
    initialStyle.fontFamily || "Arial, sans-serif"
  );
  const [textColor, setTextColor] = useState(
    initialStyle.color?.toString() || "#000000"
  );
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");

  useEffect(() => {
    if (editorRef.current) {
      // Convert plain text newlines to <br> for contenteditable
      const html = initialText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      editorRef.current.innerHTML = html;
      // Focus and select all
      editorRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const execCmd = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const handleBold = () => { execCmd("bold"); setIsBold(b => !b); };
  const handleItalic = () => { execCmd("italic"); setIsItalic(i => !i); };
  const handleUnderline = () => { execCmd("underline"); setIsUnderline(u => !u); };
  const handleAlign = (a: "left" | "center" | "right") => {
    execCmd(`justify${a.charAt(0).toUpperCase() + a.slice(1)}`);
    setAlign(a);
  };

  const handleFontSize = (size: string) => {
    setFontSize(size);
    // execCommand fontSize uses 1-7 scale — use inline style instead
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${size}px`;
    }
  };

  const handleFontFamily = (ff: string) => {
    setFontFamily(ff);
    execCmd("fontName", ff);
  };

  const handleColor = (color: string) => {
    setTextColor(color);
    execCmd("foreColor", color);
  };

  const handleCommit = () => {
    if (!editorRef.current) return;
    // Get text with newlines preserved
    const html = editorRef.current.innerHTML;
    // Convert <br> and block elements back to \n for storage
    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    const style: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontFamily,
      color: textColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderline ? "underline" : "none",
      textAlign: align,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    };
    onCommit(text, style);
  };

  return (
    <Box
      position="absolute"
      left={position.x - 2}
      top={position.y - 44}
      zIndex={2000}
      minW="320px"
    >
      {/* Toolbar */}
      <Box
        bg="white"
        border="1px solid #CBD5E0"
        borderBottom="none"
        borderTopRadius="lg"
        px={2}
        py={1}
        shadow="md"
      >
        <HStack spacing={1} wrap="wrap">
          {/* Font Family */}
          <Select
            size="xs"
            w="110px"
            value={fontFamily}
            onChange={e => handleFontFamily(e.target.value)}
            fontSize="11px"
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>

          {/* Font Size */}
          <Select
            size="xs"
            w="58px"
            value={fontSize}
            onChange={e => handleFontSize(e.target.value)}
            fontSize="11px"
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <Divider orientation="vertical" h="20px" />

          <Tooltip label="Bold (Ctrl+B)">
            <IconButton size="xs" aria-label="bold" icon={<Bold size={13} />}
              variant={isBold ? "solid" : "ghost"} colorScheme="blue"
              onClick={handleBold} />
          </Tooltip>
          <Tooltip label="Italic (Ctrl+I)">
            <IconButton size="xs" aria-label="italic" icon={<Italic size={13} />}
              variant={isItalic ? "solid" : "ghost"} colorScheme="blue"
              onClick={handleItalic} />
          </Tooltip>
          <Tooltip label="Underline (Ctrl+U)">
            <IconButton size="xs" aria-label="underline" icon={<Underline size={13} />}
              variant={isUnderline ? "solid" : "ghost"} colorScheme="blue"
              onClick={handleUnderline} />
          </Tooltip>

          <Divider orientation="vertical" h="20px" />

          <Tooltip label="Align Left">
            <IconButton size="xs" aria-label="left" icon={<AlignLeft size={13} />}
              variant={align === "left" ? "solid" : "ghost"} colorScheme="blue"
              onClick={() => handleAlign("left")} />
          </Tooltip>
          <Tooltip label="Align Center">
            <IconButton size="xs" aria-label="center" icon={<AlignCenter size={13} />}
              variant={align === "center" ? "solid" : "ghost"} colorScheme="blue"
              onClick={() => handleAlign("center")} />
          </Tooltip>
          <Tooltip label="Align Right">
            <IconButton size="xs" aria-label="right" icon={<AlignRight size={13} />}
              variant={align === "right" ? "solid" : "ghost"} colorScheme="blue"
              onClick={() => handleAlign("right")} />
          </Tooltip>

          <Divider orientation="vertical" h="20px" />

          {/* Color Picker */}
          <Tooltip label="Text Color">
            <Box position="relative">
              <Box
                w="22px" h="22px" borderRadius="md"
                bg={textColor} border="2px solid #CBD5E0"
                cursor="pointer" overflow="hidden"
                display="flex" alignItems="center" justifyContent="center"
              >
                <Type size={11} color={textColor === "#ffffff" ? "#000" : "#fff"} />
                <input
                  type="color"
                  value={textColor}
                  onChange={e => handleColor(e.target.value)}
                  style={{
                    position: "absolute", opacity: 0,
                    width: "100%", height: "100%", cursor: "pointer"
                  }}
                />
              </Box>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" h="20px" />

          {/* Commit / Cancel */}
          <Tooltip label="Apply (Enter)">
            <IconButton size="xs" aria-label="commit" icon={<Check size={13} />}
              colorScheme="green" onClick={handleCommit} />
          </Tooltip>
          <Tooltip label="Cancel (Esc)">
            <IconButton size="xs" aria-label="cancel" icon={<X size={13} />}
              colorScheme="red" variant="ghost" onClick={onCancel} />
          </Tooltip>
        </HStack>
      </Box>

      {/* Editable Area */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        minW={`${Math.max(position.width, 200)}px`}
        minH={`${Math.max(position.height, 40)}px`}
        border="2px solid #3182CE"
        bg="white"
        px={2}
        py={1}
        fontSize={`${fontSize}px`}
        fontFamily={fontFamily}
        color={textColor}
        outline="none"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        lineHeight="1.5"
        borderBottomRadius="lg"
        shadow="md"
        onKeyDown={e => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && e.ctrlKey) handleCommit();
          // Allow normal Enter for newlines (default contenteditable behavior)
        }}
        sx={{
          "&:focus": { outline: "none" },
          "& br": { display: "block", content: '""', marginBottom: "0" },
        }}
      />
      <Text fontSize="10px" color="gray.400" mt={1} textAlign="right">
        Enter = new line &nbsp;|&nbsp; Ctrl+Enter = apply &nbsp;|&nbsp; Esc = cancel
      </Text>
    </Box>
  );
};

export default TextEditor;
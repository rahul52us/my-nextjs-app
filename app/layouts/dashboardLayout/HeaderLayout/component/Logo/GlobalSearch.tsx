"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Portal,
  Text,
  HStack,
  VStack,
  Icon,
  Kbd,
  Badge,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { filterSearchData, SidebarItem } from "../../../SidebarLayout/utils/SidebarItems";
import { keyframes } from "@emotion/react";
import React_import from "react";

// ── animations ──────────────────────────────────────────────────────
const backdropIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: translateY(-20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
`;

// ── trigger button (shown in header) ────────────────────────────────
export const SearchTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const bg        = useColorModeValue("whiteAlpha.200", "blackAlpha.300");
  const border    = useColorModeValue("whiteAlpha.400", "whiteAlpha.200");
  const textColor = "whiteAlpha.700";

  return (
    <HStack
      as="button"
      onClick={onClick}
      spacing={2}
      px={3}
      py={1.5}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      backdropFilter="blur(8px)"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: "whiteAlpha.300", borderColor: "whiteAlpha.500" }}
      minW={{ base: "36px", md: "200px", lg: "260px" }}
      maxW="260px"
    >
      <Icon as={SearchIcon} boxSize={3.5} color={textColor} />
      <Text
        display={{ base: "none", md: "block" }}
        fontSize="13px"
        color={textColor}
        fontWeight="500"
        flex={1}
        textAlign="left"
      >
        Search tools...
      </Text>
      <HStack display={{ base: "none", md: "flex" }} spacing={1}>
        <Kbd fontSize="10px" bg="whiteAlpha.200" color={textColor} border="none">
          Ctrl
        </Kbd>
        <Kbd fontSize="10px" bg="whiteAlpha.200" color={textColor} border="none">
          K
        </Kbd>
      </HStack>
    </HStack>
  );
};

// ── main modal ───────────────────────────────────────────────────────
const GlobalSearch: React.FC = () => {
  const [isOpen,  setIsOpen]  = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SidebarItem[]>([]);
  const [active,  setActive]  = useState(0);

  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const router      = useRouter();

  // theme
  const overlayBg  = "blackAlpha.600";
  const modalBg    = useColorModeValue("white", "gray.900");
  const inputBg    = useColorModeValue("gray.50", "gray.800");
  const borderClr  = useColorModeValue("gray.200", "gray.700");
  const itemHover  = useColorModeValue("blue.50", "gray.700");
  const activeItem = useColorModeValue("blue.100", "blue.800");
  const textPri    = useColorModeValue("gray.800", "white");
  const textSec    = useColorModeValue("gray.500", "gray.400");

  // ── open / close helpers ──────────────────────────────────────────
  const open  = useCallback(() => { setIsOpen(true);  setQuery(""); setActive(0); }, []);
  const close = useCallback(() => { setIsOpen(false); setQuery(""); setResults([]); }, []);

  // ── global keyboard shortcut: Ctrl+K / Cmd+K ─────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? close() : open();
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, open, close]);

  // focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  // ── search logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults(filterSearchData.slice(0, 8));
      setActive(0);
      return;
    }
    const q = query.toLowerCase();
    const matched = filterSearchData.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
    setResults(matched.slice(0, 10));
    setActive(0);
  }, [query]);

  // show recent/popular on open
  useEffect(() => {
    if (isOpen) setResults(filterSearchData.slice(0, 8));
  }, [isOpen]);

  // ── keyboard navigation inside list ──────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      navigate(results[active]);
    }
  };

  // scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const navigate = (item: SidebarItem) => {
    if (item.url && item.url !== "#") {
      router.push(item.url);
      close();
    }
  };

  // helper: highlight matching text
  const highlight = (text: string, q: string) => {
    if (!q.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <Box as="mark" bg="yellow.200" color="gray.900" borderRadius="2px" px="1px">
          {text.slice(idx, idx + q.length)}
        </Box>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <SearchTrigger onClick={open} />

      {/* ── Modal portal ── */}
      {isOpen && (
        <Portal>
          {/* backdrop */}
          <Box
            position="fixed"
            inset={0}
            bg={overlayBg}
            zIndex={10000}
            backdropFilter="blur(4px)"
            onClick={close}
            animation={`${backdropIn} 0.18s ease`}
          />

          {/* modal */}
          <Box
            position="fixed"
            top={{ base: "10%", md: "15%" }}
            left="50%"
            transform="translateX(-50%)"
            w={{ base: "92vw", md: "600px", lg: "680px" }}
            maxH="70vh"
            bg={modalBg}
            borderRadius="2xl"
            boxShadow="0 25px 60px -10px rgba(0,0,0,0.35)"
            border="1px solid"
            borderColor={borderClr}
            zIndex={10001}
            overflow="hidden"
            animation={`${modalIn} 0.22s cubic-bezier(0.34,1.56,0.64,1)`}
            display="flex"
            flexDirection="column"
          >
            {/* search input */}
            <Box p={3} borderBottom="1px solid" borderColor={borderClr}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color={textSec} boxSize={4} />
                </InputLeftElement>
                <Input
                  ref={inputRef}
                  placeholder="Search tools, converters, generators…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  bg={inputBg}
                  border="none"
                  borderRadius="xl"
                  fontSize="15px"
                  fontWeight="500"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: textSec }}
                />
                <InputRightElement>
                  <Kbd
                    fontSize="10px"
                    bg={inputBg}
                    color={textSec}
                    mr={2}
                    cursor="pointer"
                    onClick={close}
                  >
                    Esc
                  </Kbd>
                </InputRightElement>
              </InputGroup>
            </Box>

            {/* label row */}
            <Flex px={4} pt={3} pb={1} justify="space-between" align="center">
              <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={textSec}>
                {query.trim() ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "Popular Tools"}
              </Text>
              <HStack spacing={1} color={textSec} fontSize="11px">
                <Kbd fontSize="10px">↑↓</Kbd>
                <Text>navigate</Text>
                <Kbd fontSize="10px">↵</Kbd>
                <Text>open</Text>
              </HStack>
            </Flex>

            {/* results list */}
            <Box
              ref={listRef}
              overflowY="auto"
              px={2}
              pb={3}
              flex={1}
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
              }}
            >
              {results.length === 0 ? (
                <VStack py={10} spacing={2}>
                  <Text fontSize="2xl">🔍</Text>
                  <Text color={textSec} fontWeight="600">No tools found for "{query}"</Text>
                  <Text color={textSec} fontSize="sm">Try a different keyword</Text>
                </VStack>
              ) : (
                results.map((item, idx) => (
                  <HStack
                    key={item.id}
                    px={3}
                    py={2.5}
                    borderRadius="xl"
                    cursor="pointer"
                    bg={idx === active ? activeItem : "transparent"}
                    _hover={{ bg: idx === active ? activeItem : itemHover }}
                    transition="all 0.15s"
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setActive(idx)}
                    spacing={3}
                  >
                    {/* icon */}
                    <Flex
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg={idx === active ? "blue.500" : useColorModeValue("gray.100", "gray.700")}
                      align="center"
                      justify="center"
                      flexShrink={0}
                      transition="0.15s"
                    >
                      {item.icon && React_import.cloneElement(item.icon as React.ReactElement, {
                        size: 14,
                        style: { color: idx === active ? "white" : (item.iconColor || "#666") },
                      })}
                    </Flex>

                    {/* name */}
                    <Text
                      fontSize="14px"
                      fontWeight="600"
                      color={textPri}
                      flex={1}
                    >
                      {highlight(item.name, query)}
                    </Text>

                    {/* url badge */}
                    {item.url && item.url !== "#" && (
                      <Badge
                        fontSize="10px"
                        colorScheme={idx === active ? "blue" : "gray"}
                        variant="subtle"
                        borderRadius="md"
                        px={2}
                        display={{ base: "none", md: "flex" }}
                      >
                        {item.url.split("/").filter(Boolean).join(" › ")}
                      </Badge>
                    )}

                    <Icon
                      as={SearchIcon}
                      boxSize={3}
                      color={idx === active ? "blue.400" : textSec}
                      opacity={idx === active ? 1 : 0}
                      transition="0.15s"
                    />
                  </HStack>
                ))
              )}
            </Box>

            {/* footer */}
            <Box
              px={4}
              py={2.5}
              borderTop="1px solid"
              borderColor={borderClr}
              bg={inputBg}
            >
              <Text fontSize="11px" color={textSec} fontWeight="500">
                {filterSearchData.length} tools available · Press{" "}
                <Kbd fontSize="10px">Ctrl K</Kbd> to toggle
              </Text>
            </Box>
          </Box>
        </Portal>
      )}
    </>
  );
};

export default GlobalSearch;
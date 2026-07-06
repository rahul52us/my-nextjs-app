"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Button,
  Box,
  useToast,
  Heading,
  useColorModeValue,
  Text,
  VStack,
  HStack,
  Icon,
  IconButton,
  Progress,
  Badge,
  Divider,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { FaDownload, FaFileAlt, FaFolder, FaTimes, FaFolderOpen } from "react-icons/fa";
import { MdUploadFile, MdCreateNewFolder } from "react-icons/md";
import JSZip from "jszip";
import stores from "../../../../../store/stores";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
interface ZipEntry {
  id: string;
  file: File;
  /** Path inside the ZIP, e.g. "myFolder/sub/file.txt" or just "file.txt" */
  zipPath: string;
  /** Human-readable display path */
  displayPath: string;
  fromFolder: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers — recursive FileSystemEntry traversal
───────────────────────────────────────────────────────────────────────────── */
async function readEntryAsFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function traverseEntry(
  entry: FileSystemEntry,
  pathPrefix: string,
  results: { file: File; zipPath: string }[]
): Promise<void> {
  if (entry.isFile) {
    const file = await readEntryAsFile(entry as FileSystemFileEntry);
    results.push({ file, zipPath: pathPrefix + entry.name });
  } else if (entry.isDirectory) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    await readAllEntries(dirReader, pathPrefix + entry.name + "/", results);
  }
}

async function readAllEntries(
  reader: FileSystemDirectoryReader,
  prefix: string,
  results: { file: File; zipPath: string }[]
): Promise<void> {
  // readEntries() may return at most 100 entries per call — loop until empty
  while (true) {
    const batch: FileSystemEntry[] = await new Promise((res, rej) =>
      reader.readEntries(res, rej)
    );
    if (batch.length === 0) break;
    for (const entry of batch) {
      await traverseEntry(entry, prefix, results);
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
const ZipCompression: React.FC = () => {
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReadingFolder, setIsReadingFolder] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const dragCounterRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const subText = useColorModeValue("gray.500", "gray.400");
  const dropZoneActiveBg = useColorModeValue("teal.50", "teal.900");
  const entryRowHover = useColorModeValue("gray.100", "gray.650");

  const toast = useToast();
  const {
    themeStore: { themeConfig },
  } = stores;
  const brandColor = themeConfig.colors.brand[300];

  /* ── uid helper ── */
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  /* ── Format bytes ── */
  const fmtSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  /* ── Add entries (de-duplicate by zipPath) ── */
  const addEntries = useCallback(
    (newEntries: ZipEntry[]) => {
      setEntries((prev) => {
        const existingPaths = new Set(prev.map((e) => e.zipPath));
        const unique = newEntries.filter((e) => !existingPaths.has(e.zipPath));
        if (unique.length < newEntries.length) {
          toast({
            title: "Duplicates skipped",
            description: `${newEntries.length - unique.length} file(s) already added.`,
            status: "info",
            duration: 2500,
            isClosable: true,
          });
        }
        return [...prev, ...unique];
      });
    },
    [toast]
  );

  /* ─────────────── FILE INPUT (individual files) ─────────────────────────── */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const newEntries: ZipEntry[] = Array.from(selected).map((file) => ({
      id: uid(),
      file,
      zipPath: file.name,
      displayPath: file.name,
      fromFolder: false,
    }));
    addEntries(newEntries);
    e.target.value = ""; // reset so same file can be re-added after removal
  };

  /* ─────────────── FOLDER INPUT (webkitdirectory) ────────────────────────── */
  const handleFolderInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) {
      toast({
        title: "Empty folder",
        description: "No files found inside the selected folder.",
        status: "warning",
        isClosable: true,
      });
      return;
    }
    const newEntries: ZipEntry[] = Array.from(selected).map((file) => {
      // webkitRelativePath = "folderName/sub/file.txt"
      const zipPath = (file as any).webkitRelativePath || file.name;
      return {
        id: uid(),
        file,
        zipPath,
        displayPath: zipPath,
        fromFolder: true,
      };
    });
    addEntries(newEntries);
    e.target.value = "";
  };

  /* ─────────────── DRAG & DROP ────────────────────────────────────────────── */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const items = Array.from(e.dataTransfer.items);
    const newEntries: ZipEntry[] = [];

    // Use FileSystem API to recursively read folders
    if (items.length > 0 && items[0].webkitGetAsEntry) {
      setIsReadingFolder(true);
      try {
        for (const item of items) {
          const entry = item.webkitGetAsEntry();
          if (!entry) continue;
          const collected: { file: File; zipPath: string }[] = [];
          await traverseEntry(entry, "", collected);
          collected.forEach(({ file, zipPath }) => {
            newEntries.push({
              id: uid(),
              file,
              zipPath,
              displayPath: zipPath,
              fromFolder: entry.isDirectory,
            });
          });
        }
        if (newEntries.length === 0) {
          toast({
            title: "Empty drop",
            description: "No files found in the dropped item(s).",
            status: "warning",
            isClosable: true,
          });
        } else {
          addEntries(newEntries);
        }
      } catch (err) {
        console.error("Drop read error:", err);
        toast({
          title: "Error reading dropped items",
          status: "error",
          isClosable: true,
        });
      } finally {
        setIsReadingFolder(false);
      }
    } else {
      // Fallback for browsers without FileSystem API
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) {
        toast({ title: "No files detected", status: "warning", isClosable: true });
        return;
      }
      addEntries(
        droppedFiles.map((file) => ({
          id: uid(),
          file,
          zipPath: file.name,
          displayPath: file.name,
          fromFolder: false,
        }))
      );
    }
  };

  /* ─────────────── REMOVE ENTRY ───────────────────────────────────────────── */
  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const clearAll = () => setEntries([]);

  /* ─────────────── ZIP GENERATION ─────────────────────────────────────────── */
  const handleCompressFiles = async () => {
    if (entries.length === 0) {
      toast({
        title: "No files selected",
        description: "Add files or a folder first.",
        status: "error",
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      entries.forEach(({ file, zipPath }) => {
        zip.file(zipPath, file);
      });

      const content = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (metadata) => setZipProgress(Math.round(metadata.percent))
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "compressed_files.zip";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 60_000);

      toast({
        title: "ZIP created successfully",
        description: `${entries.length} file(s) compressed.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("ZIP error:", err);
      toast({
        title: "Compression failed",
        description: "An error occurred while building the ZIP.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setZipProgress(0);
    }
  };

  /* ─────────────── RENDER ──────────────────────────────────────────────────── */
  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0);

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgColor} color={textColor} minH="78vh" borderRadius="lg">
      {/* ── Title ── */}
      <Heading
        as="h1"
        size={{ base: "xl", md: "2xl" }}
        color={brandColor}
        textAlign="center"
        mb={2}
      >
        Compress Files into a ZIP
      </Heading>
      <Text fontSize={{ base: "md", md: "lg" }} textAlign="center" mb={8} color={subText}>
        Select individual files <strong>or</strong> an entire folder — nested subfolders are
        supported and their structure is preserved in the ZIP.
      </Text>

      <VStack spacing={6} align="stretch" maxW="860px" mx="auto">

        {/* ── Selection Buttons ── */}
        <HStack spacing={3} wrap="wrap" justify="center">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
          {/* Hidden folder input */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore — webkitdirectory is valid but missing from TS lib types
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: "none" }}
            onChange={handleFolderInputChange}
          />

          <Button
            leftIcon={<Icon as={MdUploadFile} />}
            colorScheme="teal"
            variant="outline"
            size="md"
            borderRadius="full"
            onClick={() => fileInputRef.current?.click()}
            isDisabled={isProcessing}
          >
            Select Files
          </Button>

          <Button
            leftIcon={<Icon as={MdCreateNewFolder} />}
            colorScheme="purple"
            variant="outline"
            size="md"
            borderRadius="full"
            onClick={() => folderInputRef.current?.click()}
            isDisabled={isProcessing}
          >
            Select Folder
          </Button>
        </HStack>

        {/* ── Drop Zone ── */}
        <Box
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={2}
          p={8}
          border="2px dashed"
          borderColor={isDragActive ? "teal.400" : borderColor}
          borderRadius="xl"
          bg={isDragActive ? dropZoneActiveBg : cardBg}
          transition="all 0.2s"
          minH="140px"
        >
          <Icon
            as={isDragActive ? FaFolderOpen : FaFolder}
            boxSize={10}
            color={isDragActive ? "teal.400" : "gray.400"}
            transition="all 0.2s"
          />
          <Text
            fontWeight="semibold"
            color={isDragActive ? "teal.600" : subText}
            textAlign="center"
          >
            {isDragActive
              ? "Release to add files or folder…"
              : "Drag & drop files or an entire folder here"}
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Nested folders are supported — folder structure is preserved inside the ZIP
          </Text>
        </Box>

        {/* ── Reading folder indicator ── */}
        {isReadingFolder && (
          <Box>
            <Text fontSize="sm" color={subText} mb={1}>
              Reading folder contents…
            </Text>
            <Progress size="xs" isIndeterminate colorScheme="teal" borderRadius="full" />
          </Box>
        )}

        {/* ── ZIP progress ── */}
        {isProcessing && zipProgress > 0 && (
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm" color={subText}>
                Building ZIP…
              </Text>
              <Text fontSize="sm" color={subText}>
                {zipProgress}%
              </Text>
            </Flex>
            <Progress
              value={zipProgress}
              size="sm"
              colorScheme="teal"
              borderRadius="full"
            />
          </Box>
        )}

        {/* ── File List ── */}
        {entries.length > 0 && (
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            {/* Header */}
            <Flex
              px={4}
              py={3}
              justify="space-between"
              align="center"
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="sm">
                  {entries.length} file{entries.length !== 1 ? "s" : ""} selected
                </Text>
                <Badge colorScheme="gray" fontSize="xs">
                  {fmtSize(totalSize)} total
                </Badge>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={clearAll}
                leftIcon={<FaTimes />}
              >
                Clear all
              </Button>
            </Flex>

            {/* Rows */}
            <VStack align="stretch" spacing={0} maxH="320px" overflowY="auto">
              {entries.map((entry, i) => (
                <React.Fragment key={entry.id}>
                  {i > 0 && <Divider />}
                  <HStack
                    px={4}
                    py={2}
                    _hover={{ bg: entryRowHover }}
                    transition="background 0.15s"
                  >
                    <Icon
                      as={entry.fromFolder ? FaFolder : FaFileAlt}
                      color={entry.fromFolder ? "purple.400" : "teal.400"}
                      flexShrink={0}
                    />
                    <Tooltip label={entry.displayPath} openDelay={400}>
                      <Text
                        flex={1}
                        fontSize="xs"
                        isTruncated
                        color={textColor}
                        title={entry.displayPath}
                      >
                        {entry.displayPath}
                      </Text>
                    </Tooltip>
                    <Text
                      fontSize="xs"
                      color={subText}
                      flexShrink={0}
                      minW="60px"
                      textAlign="right"
                    >
                      {fmtSize(entry.file.size)}
                    </Text>
                    <IconButton
                      aria-label="Remove file"
                      icon={<FaTimes />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      flexShrink={0}
                      onClick={() => removeEntry(entry.id)}
                    />
                  </HStack>
                </React.Fragment>
              ))}
            </VStack>
          </Box>
        )}

        {/* ── Compress Button ── */}
        <Button
          leftIcon={<FaDownload />}
          size="lg"
          fontSize={{ base: "md", md: "lg" }}
          borderRadius="full"
          bgGradient="linear(to-r, teal.500, teal.600)"
          color="white"
          _hover={{
            bgGradient: "linear(to-r, teal.600, teal.700)",
            transform: "translateY(-1px)",
            boxShadow: "lg",
          }}
          _active={{ transform: "translateY(0)" }}
          width={{ base: "100%", md: "auto" }}
          alignSelf={{ base: "stretch", md: "center" }}
          isDisabled={entries.length === 0 || isProcessing}
          isLoading={isProcessing && zipProgress > 0}
          loadingText={`Compressing… ${zipProgress}%`}
          onClick={handleCompressFiles}
          transition="all 0.2s"
        >
          Compress Files to ZIP
        </Button>

      </VStack>
    </Box>
  );
};

export default ZipCompression;
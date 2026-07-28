"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Center,
  HStack,
  VStack,
  Text,
  Icon,
  Image,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiCheckCircle, FiTrash2, FiFileText, FiRefreshCw } from "react-icons/fi";
import { useFileTransfer } from "../../context/FileTransferContext";
import { TransferredItem, TransferState } from "../../config/fileTransferStore";
import { TOOLS_REGISTRY } from "../../config/toolsConfig";

interface UploadDropzoneProps {
  /** Target tool ID e.g. "compress-image" */
  targetToolId: string;
  /** Dropzone accept object e.g. { "image/*": ["jpeg", "jpg", "png", "webp"] } */
  accept?: Record<string, string[]>;
  /** Allow multiple files selection */
  multiple?: boolean;
  /** Primary action callback when files are selected or transferred */
  onFilesSelected: (files: File[]) => void;
  /** Reset/Clear callback */
  onClear?: () => void;
  /** Custom heading for upload box */
  label?: string;
  /** Custom sublabel */
  sublabel?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  targetToolId,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  multiple = false,
  onFilesSelected,
  onClear,
  label = "Choose a file",
  sublabel = "or drag and drop it here",
}) => {
  const { consumeTransferForTool, clearTransferState } = useFileTransfer();
  const [transferredState, setTransferredState] = useState<TransferState | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [activeFiles, setActiveFiles] = useState<File[]>([]);

  // Theme styling matching upload dropzone
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const dropzoneHoverBg = useColorModeValue("brand.50", "gray.700");
  const iconContainerBg = useColorModeValue("brand.50", "brand.900");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Check for cross-tool transferred files on component mount
  useEffect(() => {
    let isMounted = true;
    const checkTransfer = async () => {
      const state = await consumeTransferForTool(targetToolId);
      if (isMounted && state && state.items.length > 0) {
        setTransferredState(state);

        // Convert TransferredItems to standard File objects
        const files: File[] = state.items.map((it) => {
          if (it.file instanceof File) return it.file;
          return new File([it.file], it.fileName, { type: it.fileType });
        });

        setActiveFiles(files);
        onFilesSelected(multiple ? files : [files[0]]);
      }
    };

    void checkTransfer();
    return () => {
      isMounted = false;
    };
  }, [targetToolId]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        // Discard previous transfer state if user manually uploads a new file
        setTransferredState(null);
        setActiveFiles(acceptedFiles);
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  const handleClear = async () => {
    setTransferredState(null);
    setActiveFiles([]);
    await clearTransferState();
    if (onClear) onClear();
  };

  const handleSelectSpecificFile = (index: number) => {
    setSelectedFileIndex(index);
    if (activeFiles[index]) {
      onFilesSelected([activeFiles[index]]);
    }
  };

  // ── Render Pre-loaded / Transferred Preview State ─────────────────────────
  if (activeFiles.length > 0) {
    const isImage = activeFiles[0]?.type.startsWith("image/");
    const targetToolMeta = TOOLS_REGISTRY[targetToolId];
    const isSingleFileTool = targetToolMeta?.maxFiles === 1 || !multiple;

    return (
      <Box
        bg={bgColor}
        borderRadius="3xl"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        shadow="xl"
      >
        {/* Banner for Cross-Tool Handoff */}
        {transferredState && (
          <HStack
            bg="brand.50"
            color="brand.800"
            _dark={{ bg: "brand.900", color: "brand.200" }}
            px={4}
            py={2.5}
            borderRadius="xl"
            mb={5}
            justify="space-between"
            flexWrap="wrap"
          >
            <HStack spacing={2}>
              <Badge colorScheme="brand" variant="solid" borderRadius="full" px={2}>
                ✨ Auto-Loaded
              </Badge>
              <Text fontSize="xs" fontWeight="bold">
                Continued from {transferredState.sourceToolName} ({transferredState.items.length}{" "}
                {transferredState.items.length === 1 ? "file" : "files"})
              </Text>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={handleClear}
            >
              ✕ Clear & upload new file
            </Button>
          </HStack>
        )}

        {/* Multi-file selector if tool takes single file but multiple were transferred */}
        {isSingleFileTool && activeFiles.length > 1 && (
          <VStack align="start" spacing={2} mb={4}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Select which file to continue with:
            </Text>
            <HStack spacing={2} overflowX="auto" w="full" py={1}>
              {activeFiles.map((f, idx) => (
                <Button
                  key={idx}
                  size="xs"
                  borderRadius="lg"
                  colorScheme={selectedFileIndex === idx ? "brand" : "gray"}
                  variant={selectedFileIndex === idx ? "solid" : "outline"}
                  onClick={() => handleSelectSpecificFile(idx)}
                >
                  File {idx + 1}: {f.name}
                </Button>
              ))}
            </HStack>
          </VStack>
        )}

        {/* File Cards Preview */}
        <SimpleGrid columns={{ base: 1, sm: activeFiles.length > 1 ? 2 : 1 }} spacing={4}>
          {(isSingleFileTool && activeFiles.length > 1 ? [activeFiles[selectedFileIndex]] : activeFiles).map(
            (file, i) => {
              const previewUrl = transferredState?.items[i]?.previewUrl || (file ? URL.createObjectURL(file) : "");
              return (
                <HStack
                  key={i}
                  bg={cardBg}
                  p={4}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  justify="space-between"
                  align="center"
                >
                  <HStack spacing={4} overflow="hidden">
                    {file.type.startsWith("image/") && previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="xl"
                      />
                    ) : (
                      <Box bg={iconContainerBg} color="brand.600" p={3} borderRadius="xl">
                        <Icon as={FiFileText} boxSize={6} />
                      </Box>
                    )}
                    <VStack align="start" spacing={0} overflow="hidden">
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || "File"}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2}>
                    <Badge colorScheme="green" variant="subtle" borderRadius="full">
                      Ready
                    </Badge>
                    <Tooltip label="Remove this file">
                      <IconButton
                        aria-label="Remove file"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleClear}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              );
            }
          )}
        </SimpleGrid>
      </Box>
    );
  }

  // ── Render Normal Drag and Drop Zone ──────────────────────────────────────
  return (
    <Box
      bg={bgColor}
      borderRadius="3xl"
      p={8}
      border="1px solid"
      borderColor={borderColor}
      shadow="xl"
    >
      <Center
        {...getRootProps()}
        cursor="pointer"
        border="3px dashed"
        borderColor={isDragActive ? "brand.400" : borderColor}
        bg={isDragActive ? dropzoneHoverBg : "transparent"}
        borderRadius="2xl"
        h="300px"
        transition="all 0.2s"
        _hover={{ borderColor: "brand.400", bg: dropzoneHoverBg }}
        flexDirection="column"
      >
        <input {...getInputProps()} />
        <VStack spacing={4}>
          <Box bg={iconContainerBg} color="brand.600" p={4} borderRadius="full">
            <Icon as={FiUpload} boxSize={8} />
          </Box>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              {label}
            </Text>
            <Text color="gray.400">{sublabel}</Text>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
};

export default UploadDropzone;

"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  Spinner,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Wrap,
  WrapItem,
  Heading,
  useColorModeValue,
  Icon,
  Link,
} from "@chakra-ui/react";
import JSZip from "jszip";
import {
  FaUpload,
  FaEye,
  FaDownload,
  FaTrash,
  FaFolder,
  FaFolderOpen,
  FaFileAlt,
  FaChevronRight,
} from "react-icons/fa";
import Image from "next/image";
import stores from "../../../../../store/stores";

interface ZipEntry {
  name: string;
  content: Blob;
}

interface ZipTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  children: ZipTreeNode[];
  content?: Blob;
}

interface FolderTreeItemProps {
  node: ZipTreeNode;
  depth: number;
  expandedPaths: Record<string, boolean>;
  toggleFolder: (path: string) => void;
  downloadNode: (node: ZipTreeNode) => Promise<void> | void;
  handleViewFile: (file: { name: string; content: Blob }) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FolderTreeItem = React.memo<FolderTreeItemProps>(
  ({ node, depth, expandedPaths, toggleFolder, downloadNode, handleViewFile }) => {
    const isExpanded = expandedPaths[node.path];

    return (
      <Box key={node.path} pl={depth * 5} py={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="md"
          p={2}
          _hover={node.isDirectory ? { bg: useColorModeValue("gray.50", "gray.700") } : undefined}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flex="1"
            cursor={node.isDirectory ? "pointer" : "default"}
            onClick={() => node.isDirectory && toggleFolder(node.path)}
          >
            {node.isDirectory ? (
              <Icon
                as={FaChevronRight}
                boxSize={4}
                style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              />
            ) : (
              <Box boxSize={4} />
            )}
            <Icon as={node.isDirectory ? (isExpanded ? FaFolderOpen : FaFolder) : FaFileAlt} boxSize={4} color="gray.500" />
            <Box>
              <Text fontWeight={node.isDirectory ? "bold" : "normal"} noOfLines={1}>
                {node.name}{node.isDirectory ? " /" : ""}
              </Text>
              {!node.isDirectory && node.size !== undefined && (
                <Text fontSize="xs" color="gray.500">
                  {formatBytes(node.size)}
                </Text>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={2} alignItems="center" flexShrink={0}>
            {node.isDirectory ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  downloadNode(node);
                }}
              >
                Download Folder
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    downloadNode(node);
                  }}
                >
                  Download
                </Button>
                {/[.](jpg|jpeg|png|gif)$/i.test(node.name) && node.content && (
                  <Button
                    size="sm"
                    variant="solid"
                    colorScheme="brand"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleViewFile({ name: node.name, content: node.content! });
                    }}
                  >
                    View
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
        {node.isDirectory && isExpanded && node.children.length > 0 && (
          <Box mt={2}>
            {node.children.map((child) => (
              <FolderTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                toggleFolder={toggleFolder}
                downloadNode={downloadNode}
                handleViewFile={handleViewFile}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }
);

const ZipDecompression: React.FC = () => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<ZipTreeNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileToView, setFileToView] = useState<any | null>(null);
  const [loadedZipData, setLoadedZipData] = useState<JSZip | null>(null);
  // NEW: track drag-over state so the dropzone can be styled/labeled while dragging
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const toast = useToast();
  const {
    themeStore: { themeConfig },
  } = stores;

  const buildTree = (entries: ZipEntry[]): ZipTreeNode[] => {
    const root: ZipTreeNode[] = [];

    const findOrCreateChild = (
      nodes: ZipTreeNode[],
      segment: string,
      fullPath: string,
      isDirectory: boolean,
    ) => {
      let child = nodes.find((node) => node.name === segment);
      if (!child) {
        child = {
          name: segment,
          path: fullPath,
          isDirectory,
          children: [],
        };
        nodes.push(child);
      }
      return child;
    };

    entries.forEach((entry) => {
      const segments = entry.name.split("/").filter(Boolean);
      let currentNodes = root;
      let currentPath = "";

      segments.forEach((segment, index) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        const isLast = index === segments.length - 1;
        const node = findOrCreateChild(currentNodes, segment, currentPath, !isLast ? true : false);

        if (isLast) {
          node.isDirectory = false;
          node.content = entry.content;
          node.size = entry.content.size;
        }

        currentNodes = node.children;
      });
    });

    const sortTree = (nodes: ZipTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
      });
      nodes.forEach((node) => sortTree(node.children));
    };

    sortTree(root);
    return root;
  };

  const countFiles = (nodes: ZipTreeNode[]): number =>
    nodes.reduce((count, node) => count + (node.isDirectory ? countFiles(node.children) : 1), 0);

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const downloadNode = async (node: ZipTreeNode) => {
    if (node.isDirectory) {
      const zip = new JSZip();
      const addFiles = (tree: ZipTreeNode[], folder: JSZip) => {
        tree.forEach((child) => {
          if (child.isDirectory) {
            addFiles(child.children, folder.folder(child.name)!);
          } else if (child.content) {
            folder.file(child.name, child.content);
          }
        });
      };
      addFiles(node.children, zip.folder(node.name)!);
      const zipContent = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipContent);
      link.download = `${node.name}.zip`;
      link.click();
      return;
    }

    if (node.content) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(node.content);
      link.download = node.path;
      link.click();
    }
  };

  const handleViewFile = (file: { name: string; content: Blob }) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();
    const fileURL = URL.createObjectURL(file.content);

    if (fileType === "pdf") {
      setFileToView({ type: "pdf", url: fileURL, name: file.name, content: file.content });
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileType || "")) {
      setFileToView({ type: "image", url: fileURL, name: file.name, content: file.content });
    } else {
      setFileToView({ type: "download", url: fileURL, name: file.name, content: file.content });
    }
    onOpen();
  };

  // NEW: shared logic to validate + set a chosen zip file, used by both
  // the file input and drag-and-drop so both paths behave identically.
  const setSelectedZip = (file: File | undefined | null) => {
    if (!file) {
      toast({
        title: "No File Detected",
        description: "Please drop or select a .zip file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast({
        title: "Invalid File Type",
        description: "Please select or drop a .zip file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setZipFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setSelectedZip(selectedFile);
    // allow re-selecting the same file again later
    e.target.value = "";
  };

  // NEW: Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounterRef.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Required: without preventDefault() the browser blocks the drop event
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      if (!isDragActive) setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    setSelectedZip(droppedFile);
    e.dataTransfer.clearData();
  };

  const handleDecompressZip = async () => {
    if (!zipFile) {
      toast({
        title: "No ZIP file selected",
        description: "Please upload a ZIP file first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    const zip = new JSZip();

    try {
      const zipData = await zip.loadAsync(zipFile);
      const files = Object.keys(zipData.files).filter(
        (filename) => !zipData.files[filename].dir,
      );

      if (files.length === 0) {
        toast({
          title: "No files found",
          description: "The ZIP file does not contain any files.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const extractedFiles = await Promise.all(
        files.map(async (filename) => {
          const fileData = await zipData.files[filename].async("blob");
          return { name: filename, content: fileData };
        })
      );

      setTreeData(buildTree(extractedFiles));
      setLoadedZipData(zip);
      toast({
        title: "ZIP Decompression Successful",
        description: "ZIP file has been decompressed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error decompressing ZIP file:", error);
      toast({
        title: "Decompression Error",
        description: "There was an error while decompressing the ZIP file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (treeData.length === 0) return;

    const zip = new JSZip();
    const addFiles = (nodes: ZipTreeNode[], folder: JSZip) => {
      nodes.forEach((node) => {
        if (node.isDirectory) {
          addFiles(node.children, folder.folder(node.name)!);
        } else if (node.content) {
          folder.file(node.name, node.content);
        }
      });
    };

    addFiles(treeData, zip);
    const zipContent = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipContent);
    link.download = `${zipFile?.name.replace(/\.zip$/i, "") || "archive"}_all.zip`;
    link.click();
  };

  const handleClearAll = () => {
    setZipFile(null);
    setTreeData([]);
    setExpandedPaths({});
    setLoadedZipData(null);
    setFileToView(null);
  };

  const renderTreeNode = (node: ZipTreeNode, depth: number) => (
    <FolderTreeItem
      key={node.path}
      node={node}
      depth={depth}
      expandedPaths={expandedPaths}
      toggleFolder={toggleFolder}
      downloadNode={downloadNode}
      handleViewFile={handleViewFile}
    />
  );

  return (
    <Box p={{ base: 4, md: 6 }} bg={bgColor} color={textColor} minH="78vh">
      <Heading
        as="h1"
        size={{ base: "lg", md: "xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={4}
      >
        Decompress ZIP File
      </Heading>
      <Text
        fontSize={{ base: "sm", md: "lg" }}
        color="gray.500"
        textAlign="center"
        mb={6}
      >
        Upload a ZIP file to extract its contents and download individual files or folders.
      </Text>

      {/* ✅ Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".zip"
        display="none"
        id="zip-upload-input"
      />

      {/* ✅ Custom styled upload box — now a working dropzone */}
      <Box
        as="label"
        htmlFor="zip-upload-input"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={3}
        p={8}
        mb={6}
        border="2px dashed"
        borderColor={
          isDragActive ? "brand.400" : zipFile ? "brand.400" : borderColor
        }
        borderRadius="xl"
        bg={
          isDragActive
            ? useColorModeValue("brand.100", "brand.800")
            : zipFile
              ? useColorModeValue("brand.50", "brand.900")
              : cardBg
        }
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: "brand.400",
          bg: useColorModeValue("brand.50", "brand.900"),
        }}
        // NEW: drag-and-drop wiring. onDragOver MUST call preventDefault()
        // or the browser will reject the drop (and just open the file instead).
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Icon
          as={FaUpload}
          boxSize={8}
          color={isDragActive || zipFile ? "brand.500" : "gray.400"}
        />
        <Text
          fontWeight={isDragActive || zipFile ? "semibold" : "normal"}
          color={isDragActive || zipFile ? "brand.600" : "gray.500"}
          fontSize="sm"
          textAlign="center"
        >
          {isDragActive
            ? "Drop the .zip file here"
            : zipFile
              ? `✓ ${zipFile.name}`
              : "Click to choose ZIP file or drag & drop"}
        </Text>
        {zipFile && !isDragActive && (
          <Text fontSize="xs" color="brand.400">
            {(zipFile.size / 1024).toFixed(1)} KB
          </Text>
        )}
        {!zipFile && !isDragActive && (
          <Text fontSize="xs" color="gray.400">
            Supported format: .zip
          </Text>
        )}
      </Box>

      {/* Loading Spinner */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mb={4}>
          <Spinner size="lg" color="green.500" />
        </Box>
      )}

      {/* Extracted Files List */}
      {!isLoading && treeData.length > 0 && (
        <>
          <Text mt={3} mb={2} fontSize="lg" fontWeight="bold">
            Extracted Files ({countFiles(treeData)}):
          </Text>
          <Box>{treeData.map((node) => renderTreeNode(node, 0))}</Box>
        </>
      )}

      {/* ✅ Action Buttons — Wrap for mobile */}
      <Wrap spacing={3} mt={6} justify={{ base: "stretch", md: "flex-start" }}>
        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="green"
            onClick={handleDecompressZip}
            leftIcon={<FaUpload />}
            isLoading={isLoading}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, green.400, green.600)"
            _hover={{ bgGradient: "linear(to-r, green.500, green.700)" }}
            boxShadow="md"
            isDisabled={!zipFile}
          >
            Decompress ZIP
          </Button>
        </WrapItem>

        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="brand"
            onClick={handleDownloadAll}
            leftIcon={<FaDownload />}
            isDisabled={treeData.length === 0}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, blue.400, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.500, blue.700)" }}
            boxShadow="md"
          >
            Download All
          </Button>
        </WrapItem>

        <WrapItem flex={{ base: "1 1 100%", md: "0 1 auto" }}>
          <Button
            colorScheme="red"
            onClick={handleClearAll}
            leftIcon={<FaTrash />}
            isDisabled={!zipFile && treeData.length === 0}
            width="100%"
            size="lg"
            fontSize={{ base: "md", md: "lg" }}
            borderRadius="full"
            bgGradient="linear(to-r, red.400, red.500)"
            _hover={{ bgGradient: "linear(to-r, red.500, red.600)" }}
            boxShadow="md"
          >
            Clear All
          </Button>
        </WrapItem>
      </Wrap>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {fileToView?.type === "pdf" && (
              <iframe
                src={fileToView.url}
                width="100%"
                height="500px"
                style={{ border: "none" }}
                title="PDF View"
              />
            )}
            {fileToView?.type === "image" && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image
                  src={fileToView.url}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain", borderRadius: "8px" }}
                />
              </div>
            )}
            {fileToView?.type === "download" && (
              <Text>
                This file format is not supported for preview. Please download it.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={onClose} mr={3}>
              Close
            </Button>
            {fileToView?.content && (
              <Link
                href={URL.createObjectURL(fileToView.content)}
                download={fileToView.name}
                isExternal
              >
                <Button colorScheme="green">Download File</Button>
              </Link>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ZipDecompression;
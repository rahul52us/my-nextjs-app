"use client";

import { useState, ChangeEvent, DragEvent, useRef } from "react";
import jsPDF from "jspdf";
import {
  Box,
  Heading,
  VStack,
  Input,
  Text,
  IconButton,
  Flex,
  Spinner,
  useToast,
  useColorModeValue,
  Wrap,
  WrapItem,
  Button,
  Textarea,
  Icon,
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaFilePdf, FaTrashAlt, FaTrash, FaCode, FaClipboard, FaUpload } from "react-icons/fa";
import stores from "../../../../../store/stores";

import { useEffect } from "react";
import { useFileTransfer } from "../../../../../context/FileTransferContext";
import ContinueToSection from "../../../../../component/common/ContinueToSection";

const ImagesToPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [base64Strings, setBase64Strings] = useState<string[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  // NEW: track drag-over state so the dropzone can be styled/labeled while dragging
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const { consumeTransferForTool, clearTransferState } = useFileTransfer();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    let isMounted = true;
    const checkTransfer = async () => {
      const state = await consumeTransferForTool("image-to-pdf");
      if (isMounted && state && state.items.length > 0) {
        const incoming: File[] = state.items.map(it => it.file instanceof File ? it.file : new File([it.file], it.fileName, { type: it.fileType }));
        addFiles(incoming);
        toast({
          title: "✨ Files Auto-Loaded",
          description: `Loaded ${incoming.length} image(s) from ${state.sourceToolName}`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        await clearTransferState();
      }
    };
    void checkTransfer();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      setPdfBlob(null);
      return;
    }
    let isMounted = true;
    const generatePdfSilent = async () => {
      try {
        const pdf = new jsPDF();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const imgData = await readFileAsDataURL(file);
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              const imgWidth = img.width;
              const imgHeight = img.height;
              let width, height;
              if (imgWidth / imgHeight > pdfWidth / pdfHeight) {
                width = pdfWidth;
                height = (imgHeight * width) / imgWidth;
              } else {
                height = pdfHeight;
                width = (imgWidth * height) / imgHeight;
              }
              const x = (pdfWidth - width) / 2;
              const y = (pdfHeight - height) / 2;
              if (i > 0) pdf.addPage();
              pdf.addImage(img, "JPEG", x, y, width, height);
              resolve();
            };
            img.onerror = () => reject(new Error("Failed to load image"));
          });
        }
        if (isMounted) {
          const blob = pdf.output("blob");
          setPdfBlob(blob);
        }
      } catch (err) {
        console.error("Silent PDF blob generation error:", err);
      }
    };
    void generatePdfSilent();
    return () => { isMounted = false; };
  }, [files]);

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
      // allow re-selecting the same file(s) again later
      e.target.value = "";
    }
  };

  // NEW: shared logic to validate + add files, used by both the file input
  // and drag-and-drop so both paths behave identically.
  const addFiles = (incoming: File[]) => {
    const imageFiles = incoming.filter((file) => file.type.startsWith("image/"));
    const rejectedCount = incoming.length - imageFiles.length;

    if (imageFiles.length > 0) {
      setFiles((prev) => [...prev, ...imageFiles]);
    }

    if (rejectedCount > 0) {
      toast({
        title: "Some files skipped",
        description: `${rejectedCount} file${rejectedCount > 1 ? "s were" : " was"} not an image and ${rejectedCount > 1 ? "were" : "was"} skipped.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    if (imageFiles.length === 0 && incoming.length === 0) {
      toast({
        title: "No files detected",
        description: "Please drop or select image files.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // NEW: Drag & drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragCounterRef.current += 1;
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    // Required: without preventDefault() the browser blocks the drop event
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      if (!isDragActive) setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addFiles(droppedFiles);
    e.dataTransfer.clearData();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleGeneratePDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one image.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const pdf = new jsPDF();

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const imgData = await readFileAsDataURL(file);

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = imgData;
          img.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = img.width;
            const imgHeight = img.height;
            let width, height;
            if (imgWidth / imgHeight > pdfWidth / pdfHeight) {
              width = pdfWidth;
              height = (imgHeight * width) / imgWidth;
            } else {
              height = pdfHeight;
              width = (imgWidth * height) / imgHeight;
            }
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            if (i > 0) pdf.addPage();
            pdf.addImage(img, "JPEG", x, y, width, height);
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load image"));
        });
      } catch (error) {
        console.error(`Error processing file ${files[i].name}:`, error);
      }
    }

    const blob = pdf.output("blob");
    setPdfBlob(blob);
    pdf.save("output.pdf");
    toast({
      title: "PDF Generated",
      description: "Your PDF has been created and downloaded.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setLoading(false);
  };

  const handleGenerateBase64 = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one image.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const pdf = new jsPDF();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imgData = await readFileAsDataURL(file);
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = imgData;
          img.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = img.width;
            const imgHeight = img.height;
            let width, height;
            if (imgWidth / imgHeight > pdfWidth / pdfHeight) {
              width = pdfWidth;
              height = (imgHeight * width) / imgWidth;
            } else {
              height = pdfHeight;
              width = (imgWidth * height) / imgHeight;
            }
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            if (i > 0) pdf.addPage();
            pdf.addImage(img, "JPEG", x, y, width, height);
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load image"));
        });
      }

      const pdfBase64 = pdf.output("datauristring");
      setBase64Strings([pdfBase64]);
      toast({
        title: "Base64 Generated",
        description: "Base64 string of the PDF is displayed below.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error generating Base64 PDF string:", error);
      toast({
        title: "Error",
        description: "Failed to generate Base64 for PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleClearAll = () => {
    setFiles([]);
    setBase64Strings([]);
    toast({
      title: "Cleared",
      description: "All files and outputs have been removed.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Strings.join("\n")).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Base64 strings copied successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedFiles = Array.from(files);
    const [movedFile] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedFile);
    setFiles(reorderedFiles);
  };

  return (
    <Box p={4} bg="transparent" minH="78vh">
      <Heading
        as="h1"
        size={{ base: "lg", md: "xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={6}
      >
        Images to PDF & Base64 Converter
      </Heading>

      <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 8, lg: 10 }} align="flex-start" justify="center" maxW="1350px" mx="auto">
        {/* Main Workspace */}
        <VStack spacing={6} align="stretch" flex="1" w="full" minW={0}>

          {/* ✅ FIX 1: Custom styled upload box — now a working dropzone */}
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            display="none"
            id="image-upload-input"
          />
          <Box
            as="label"
            htmlFor="image-upload-input"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={3}
            p={8}
            borderRadius="2xl"
            border="2px dashed"
            borderColor={isDragActive ? "brand.400" : borderColor}
            bg={isDragActive ? useColorModeValue("brand.50", "gray.700") : cardBg}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: "brand.400", shadow: "md" }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Flex
              w={14} h={14} borderRadius="2xl" bg="brand.500" color="white"
              align="center" justify="center" shadow="lg"
            >
              <FaUpload size={24} />
            </Flex>
            <VStack spacing={0} textAlign="center">
              <Text fontWeight="bold" fontSize="md" color={textColor}>
                {isDragActive ? "Drop images here" : "Click to select or drag & drop images"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Supports PNG, JPG, JPEG, WEBP, GIF
              </Text>
            </VStack>
          </Box>

          {files.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images">
                {(provided) => (
                  <Wrap
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    spacing={4}
                    justify="center"
                    bg={cardBg}
                    p={4}
                    borderRadius="2xl"
                    boxShadow="sm"
                  >
                    {files.map((file, index) => (
                      <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
                        {(provided) => (
                          <WrapItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Box
                              position="relative"
                              borderWidth="1px"
                              borderRadius="xl"
                              overflow="hidden"
                              boxShadow="sm"
                              bg={bgColor}
                              p={2}
                              w="140px"
                              h="160px"
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="spaceBetween"
                            >
                              <IconButton
                                aria-label="Remove image"
                                icon={<FaTrashAlt />}
                                size="xs"
                                colorScheme="red"
                                position="absolute"
                                top={1}
                                right={1}
                                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== index))}
                                zIndex={2}
                              />
                              <Box w="full" h="100px" overflow="hidden" borderRadius="lg">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                              <Text fontSize="2xs" fontWeight="bold" noOfLines={1} mt={1} textAlign="center">
                                {file.name}
                              </Text>
                            </Box>
                          </WrapItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Wrap>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Action buttons */}
          <Wrap spacing={4} justify="center">
            <WrapItem>
              <Button
                onClick={handleGeneratePDF}
                leftIcon={loading ? <Spinner size="sm" /> : <FaFilePdf />}
                colorScheme="brand"
                size="lg"
                variant="solid"
                boxShadow="lg"
                borderRadius="full"
                isDisabled={loading || files.length === 0}
                width={{ base: "100%", sm: "auto" }}
              >
                Convert to PDF & Download
              </Button>
            </WrapItem>

            <WrapItem>
              <Button
                onClick={handleGenerateBase64}
                leftIcon={<FaCode />}
                colorScheme="purple"
                size="lg"
                variant="solid"
                boxShadow="lg"
                borderRadius="full"
                isDisabled={loading || files.length === 0}
                width={{ base: "100%", sm: "auto" }}
              >
                Generate Base64
              </Button>
            </WrapItem>

            <WrapItem>
              <Button
                onClick={handleClearAll}
                leftIcon={<FaTrash />}
                colorScheme="red"
                size="lg"
                variant="solid"
                boxShadow="lg"
                borderRadius="full"
                width={{ base: "100%", sm: "auto" }}
              >
                Clear All
              </Button>
            </WrapItem>
          </Wrap>

          {/* Base64 output */}
          {base64Strings.length > 0 && (
            <>
              <Textarea
                value={base64Strings.join("\n")}
                readOnly
                placeholder="Base64 strings will appear here"
                size="sm"
                bg={cardBg}
                borderRadius="md"
                boxShadow="sm"
                rows={10}
              />
              <Button
                onClick={copyToClipboard}
                leftIcon={<FaClipboard />}
                colorScheme="teal"
                size="md"
                variant="solid"
                boxShadow="sm"
                borderRadius="full"
                width={{ base: "100%", sm: "auto" }}
                alignSelf="center"
              >
                Copy to Clipboard
              </Button>
            </>
          )}
        </VStack>

        {/* Right Sticky Sidebar */}
        {files.length > 0 && (
          <Box
            w={{ base: "full", lg: "320px", xl: "340px" }}
            position={{ base: "relative", lg: "sticky" }}
            top={{ lg: "100px" }}
            alignSelf="flex-start"
            flexShrink={0}
          >
            <ContinueToSection
              currentTool="image-to-pdf"
              variant="vertical"
              convertedFiles={[{
                blob: pdfBlob || undefined,
                file: pdfBlob ? new File([pdfBlob], "images-converted.pdf", { type: "application/pdf" }) : undefined,
                name: "images-converted.pdf",
                type: "application/pdf"
              }]}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default ImagesToPdf;
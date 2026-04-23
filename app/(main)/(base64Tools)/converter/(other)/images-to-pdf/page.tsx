"use client";

import { useState, ChangeEvent, useRef } from "react";
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

const ImagesToPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [base64Strings, setBase64Strings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const {
    themeStore: { themeConfig },
  } = stores;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
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
    <Box p={4} bg={bgColor} color={textColor} minH="78vh">
      <Heading
        as="h1"
        size={{ base: "lg", md: "xl" }}
        color={themeConfig.colors.brand[300]}
        textAlign="center"
        mb={6}
      >
        Images to PDF & Base64 Converter
      </Heading>

      <VStack spacing={6} align="stretch">

        {/* ✅ FIX 1: Custom styled upload box */}
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
          border="2px dashed"
          borderColor={files.length > 0 ? "teal.400" : borderColor}
          borderRadius="xl"
          bg={files.length > 0 ? useColorModeValue("teal.50", "teal.900") : cardBg}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: "teal.400",
            bg: useColorModeValue("teal.50", "teal.900"),
          }}
        >
          <Icon
            as={FaUpload}
            boxSize={8}
            color={files.length > 0 ? "teal.500" : "gray.400"}
          />
          <Text
            fontWeight={files.length > 0 ? "semibold" : "normal"}
            color={files.length > 0 ? "teal.600" : "gray.500"}
            fontSize="sm"
            textAlign="center"
          >
            {files.length > 0
              ? `✓ ${files.length} image${files.length > 1 ? "s" : ""} selected`
              : "Click to choose images or drag & drop"}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Supports: JPG, PNG, WEBP, GIF
          </Text>
        </Box>

        {/* Draggable file list */}
        {files.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <Flex
                  wrap="wrap"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  gap={2}
                >
                  {files.map((file, index) => (
                    <Draggable
                      key={`${file.name}-${index}`}
                      draggableId={`${file.name}-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          p={2}
                          bg={cardBg}
                          boxShadow="md"
                          borderRadius="md"
                          border="1px solid"
                          borderColor={borderColor}
                          minW="120px"
                          maxW="200px"
                        >
                          <Text isTruncated fontSize="xs" maxW="180px">
                            {file.name}
                          </Text>
                          <IconButton
                            aria-label="Remove"
                            icon={<FaTrashAlt />}
                            onClick={() =>
                              setFiles(files.filter((_, idx) => idx !== index))
                            }
                            size="xs"
                            mt={2}
                            colorScheme="red"
                            variant="ghost"
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* ✅ FIX 2: Wrap — buttons mobile pe stack honge */}
        <Wrap spacing={3} justify="center">
          <WrapItem flex={{ base: "1 1 100%", sm: "0 1 auto" }}>
            <Button
              onClick={handleGeneratePDF}
              leftIcon={loading ? <Spinner size="sm" /> : <FaFilePdf />}
              isDisabled={files.length === 0 || loading}
              colorScheme="blue"
              size="lg"
              variant="solid"
              boxShadow="lg"
              borderRadius="full"
              width={{ base: "100%", sm: "auto" }}
            >
              {loading ? "Generating..." : "Generate PDF"}
            </Button>
          </WrapItem>

          <WrapItem flex={{ base: "1 1 100%", sm: "0 1 auto" }}>
            <Button
              onClick={handleGenerateBase64}
              leftIcon={loading ? <Spinner size="sm" /> : <FaCode />}
              isDisabled={files.length === 0 || loading}
              colorScheme="green"
              size="lg"
              variant="solid"
              boxShadow="lg"
              borderRadius="full"
              width={{ base: "100%", sm: "auto" }}
            >
              {loading ? "Generating..." : "Generate Base64"}
            </Button>
          </WrapItem>

          <WrapItem flex={{ base: "1 1 100%", sm: "0 1 auto" }}>
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
    </Box>
  );
};

export default ImagesToPdf;
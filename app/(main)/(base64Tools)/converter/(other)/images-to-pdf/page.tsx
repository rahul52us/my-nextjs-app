"use client";

import { useState, ChangeEvent } from "react";
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
  HStack,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaFilePdf, FaTrashAlt, FaTrash, FaCode, FaClipboard } from "react-icons/fa";

const ImagesToPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [base64Strings, setBase64Strings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

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
        console.log(`Processing file: ${file.name}`);
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

      // Generate Base64 string for the entire PDF
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
    <Box p={4} bg={bgColor} color={textColor} minH={"78vh"}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Images to PDF & Base64 Converter
      </Heading>

      <VStack spacing={6} align="stretch">
        <Input type="file" multiple accept="image/*" onChange={handleFileChange} />
        {files.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <Flex wrap="wrap" ref={provided.innerRef} {...provided.droppableProps}>
                  {files.map((file, index) => (
                    <Draggable key={file.name} draggableId={file.name} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          p={2}
                          bg="white"
                          m={2}
                          boxShadow="md"
                          borderRadius="md"
                        >
                          <Text isTruncated maxW="200px">
                            {file.name}
                          </Text>
                          <IconButton
                            aria-label="Remove"
                            icon={<FaTrashAlt />}
                            onClick={() =>
                              setFiles(files.filter((_, idx) => idx !== index))
                            }
                            size="sm"
                            mt={2}
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

        <HStack spacing={6} justify="center">
          <Button
            onClick={handleGeneratePDF}
            leftIcon={loading ? <Spinner size="sm" /> : <FaFilePdf />}
            isDisabled={files.length === 0}
            colorScheme="blue"
            size="lg"
            variant="solid"
            boxShadow="lg"
            borderRadius="md"
          >
            {loading ? "Generating..." : "Generate PDF"}
          </Button>

          <Button
            onClick={handleGenerateBase64}
            leftIcon={loading ? <Spinner size="sm" /> : <FaCode />}
            isDisabled={files.length === 0}
            colorScheme="green"
            size="lg"
            variant="solid"
            boxShadow="lg"
            borderRadius="md"
          >
            {loading ? "Generating..." : "Generate Base64"}
          </Button>

          <Button
            onClick={handleClearAll}
            leftIcon={<FaTrash />}
            colorScheme="red"
            size="lg"
            variant="solid"
            boxShadow="lg"
            borderRadius="md"
          >
            Clear All
          </Button>
        </HStack>

        {base64Strings.length > 0 && (
          <>
            <Textarea
              value={base64Strings.join("\n")}
              readOnly
              placeholder="Base64 strings will appear here"
              size="sm"
              bg="white"
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
              borderRadius="md"
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

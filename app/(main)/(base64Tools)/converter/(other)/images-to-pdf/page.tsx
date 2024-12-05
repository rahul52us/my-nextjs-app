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
  Textarea,
  HStack,
  Button,
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  FaFilePdf,
  FaTrashAlt,
  FaClipboard,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

const ImagesToPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("output");
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
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
      const file = files[i];
      const imgData = await readFileAsDataURL(file);

      const img = document.createElement("img");
      img.src = imgData;

      await new Promise<void>((resolve) => {
        img.onload = () => {
          const width = pdf.internal.pageSize.getWidth();
          const height = (img.height * width) / img.width;
          if (i > 0) pdf.addPage();
          pdf.addImage(img, "JPEG", 0, 0, width, height);
          resolve();
        };
      });
    }

    const pdfDataUri = pdf.output("datauristring");
    setBase64Data(pdfDataUri);

    toast({
      title: "PDF Generated",
      description: "You can now download the PDF or Base64 data.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();

    files.forEach((file, index) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const width = pdf.internal.pageSize.getWidth();
        const height = (img.height * width) / img.width;
        if (index > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, width, height);
        if (index === files.length - 1) {
          pdf.save(`${fileName}.pdf`);
        }
      };
    });
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedFiles = Array.from(files);
    const [movedFile] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedFile);
    setFiles(reorderedFiles);
  };

  const handleCopyBase64 = () => {
    if (base64Data) {
      navigator.clipboard.writeText(base64Data);
      toast({
        title: "Copied",
        description: "Base64 data copied to clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadBase64 = () => {
    if (base64Data) {
      const blob = new Blob([base64Data], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.txt`;
      link.click();
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setBase64Data(null);
    toast({
      title: "Cleared",
      description: "All files have been removed.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH={'80vh'}>
      <Heading as="h1" size="xl" color="teal.500" textAlign="center" mb={6}>
        Images to PDF Converter
      </Heading>

      <VStack spacing={6} align="stretch">
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        {files.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <Flex
                  wrap="wrap"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {files.map((file, index) => (
                    <Draggable
                      key={file.name}
                      draggableId={file.name}
                      index={index}
                    >
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
            _hover={{ bg: "blue.600", transform: "scale(1.05)" }}
            _active={{ bg: "blue.700" }}
          >
            {loading ? "Generating..." : "Generate Base64"}
          </Button>

          <Button
            isDisabled={loading || files.length === 0}
            onClick={handleDownloadPDF}
            colorScheme="green"
            size="lg"
            variant="solid"
            boxShadow="lg"
            borderRadius="md"
            _hover={{ bg: "green.600", transform: "scale(1.05)" }}
            _active={{ bg: "green.700" }}
          >
            Download PDF
          </Button>

          <Button
            onClick={handleClearAll}
            leftIcon={<FaTrash />}
            colorScheme="red"
            size="lg"
            variant="solid"
            boxShadow="lg"
            borderRadius="md"
            _hover={{ bg: "red.600", transform: "scale(1.05)" }}
            _active={{ bg: "red.700" }}
          >
            Clear All
          </Button>
        </HStack>

        {base64Data && (
          <VStack spacing={4} align="stretch">
            <Textarea
              value={base64Data}
              isReadOnly
              h="200px"
              resize="vertical"
            />
            <HStack spacing={4}>
              <Button
                leftIcon={<FaClipboard />}
                onClick={handleCopyBase64}
                colorScheme="teal"
                variant="solid"
                size="lg"
                boxShadow="lg"
                borderRadius="full"
                _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
                _active={{ bg: "teal.700" }}
              >
                Copy Base64
              </Button>
              <Button
                leftIcon={<FaDownload />}
                onClick={handleDownloadBase64}
                colorScheme="orange"
                variant="solid"
                size="lg"
                boxShadow="lg"
                borderRadius="full"
                _hover={{ bg: "orange.600", transform: "scale(1.05)" }}
                _active={{ bg: "orange.700" }}
              >
                Download Base64 (.txt)
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ImagesToPdf;
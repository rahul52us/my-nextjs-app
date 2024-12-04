'use client'

import { useState, ChangeEvent } from "react";
import jsPDF from "jspdf";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Image as ChakraImage,
  Text,
  useToast,
  useColorModeValue,
  IconButton,
  Flex,
  Textarea,
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaFilePdf, FaUpload, FaTrashAlt, FaClipboard, FaDownload } from "react-icons/fa";

const ImagesTopdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [viewBase64, setViewBase64] = useState(false);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setBase64Data(null); // Reset Base64 data on clear
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

    if (viewBase64) {
      const pdfData = pdf.output("datauristring");
      setBase64Data(pdfData);
    } else {
      pdf.save("merged.pdf");
      toast({
        title: "PDF Generated",
        description: 'The PDF has been saved as "merged.pdf".',
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedFiles = Array.from(files);
    const [movedFile] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedFile);
    setFiles(reorderedFiles);
  };

  const handleCopyBase64 = () => {
    if (base64Data) {
      navigator.clipboard.writeText(base64Data).then(() => {
        toast({
          title: "Base64 Copied",
          description: "Base64 data has been copied to clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
    }
  };

  const handleDownloadBase64 = () => {
    if (base64Data) {
      const blob = new Blob([base64Data], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "base64data.txt";
      link.click();
      toast({
        title: "Base64 Downloaded",
        description: "The Base64 data has been downloaded as a .txt file.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH="100vh">
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        mb={6}
        textTransform="uppercase"
      >
        Images to PDF Conversion & Base64 Encoding{" "}
      </Heading>
      <VStack spacing={6} align="stretch" mb={6}>
        <FormControl>
          <FormLabel fontWeight="bold">Select Images</FormLabel>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </FormControl>

        {files.length > 0 && (
          <>
            <Text fontSize="lg" fontWeight="bold">
              {`Selected Images: ${files.length}`}
            </Text>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="files-droppable" direction="horizontal">
                {(provided) => (
                  <Flex
                    wrap="wrap"
                    gap={4}
                    justifyContent="center"
                    maxWidth="100%"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {files.map((file, index) => (
                      <Draggable
                        key={file.name + index}
                        draggableId={file.name + index}
                        index={index}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            position="relative"
                            borderRadius="md"
                            boxShadow="md"
                            overflow="hidden"
                            _hover={{ boxShadow: "xl" }}
                            bg={bgColor}
                            p={2}
                            width="120px"
                            height="120px"
                          >
                            <ChakraImage
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              boxSize="full"
                              objectFit="cover"
                              borderRadius="md"
                              transition="all 0.3s"
                              _hover={{ transform: "scale(1.05)" }}
                            />
                            <IconButton
                              aria-label="Remove Image"
                              icon={<FaTrashAlt />}
                              size="sm"
                              position="absolute"
                              top="0"
                              right="0"
                              colorScheme="red"
                              onClick={() => handleRemoveImage(index)}
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
          </>
        )}

        <Button
          colorScheme="blue"
          leftIcon={<FaFilePdf />}
          onClick={handleGeneratePDF}
          isDisabled={files.length === 0}
          size="lg"
          width="full"
        >
          {viewBase64 ? "View Base64" : "Generate PDF"}
        </Button>

        <Button
          colorScheme="green"
          leftIcon={<FaUpload />}
          variant="outline"
          onClick={() => setViewBase64(!viewBase64)} // Toggle view
          size="lg"
          width="full"
        >
          {viewBase64 ? "Switch to PDF Download" : "Switch to Base64 View"}
        </Button>

        {base64Data && viewBase64 && (
          <>
            <Textarea
              value={base64Data}
              readOnly
              resize="none"
              minHeight="150px"
              placeholder="Base64 output will appear here..."
            />
            <Flex columnGap={4}>
            <Button
              colorScheme="teal"
              leftIcon={<FaClipboard />}
              onClick={handleCopyBase64}
              size="lg"
              width="full"
            >
              Copy Base64 to Clipboard
            </Button>

            {/* Add the Download Base64 button */}
            <Button
              colorScheme="purple"
              leftIcon={<FaDownload />}
              onClick={handleDownloadBase64}
              size="lg"
              width="full"
            >
              Download Base64 as Text File
            </Button>
            </Flex>
          </>
        )}

        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleClearAll}
          size="lg"
          width="full"
        >
          Clear All
        </Button>
      </VStack>
    </Box>
  );
};

export default ImagesTopdf;

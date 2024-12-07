'use client'

import React, { useState } from "react";
import { Box, Button, Input, Textarea, useToast } from "@chakra-ui/react";
import { Document, Page, pdfjs } from "react-pdf";

const PDFToText: React.FC = () => {
  const [text, setText] = useState<string>("");
  const toast = useToast();

  const extractTextFromPDF = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      const numPages = pdf.numPages;
      let extractedText = "";
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item: any) => {
          extractedText += item.str + " ";
        });
      }
      setText(extractedText);
      toast({
        title: "Text Extracted",
        description: "Text has been successfully extracted from the PDF.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      extractTextFromPDF(file);
    }
  };

  return (
    <Box p={4} minH={"80vh"}>
      <Box textAlign="center" mb={6}>
        <Input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          mb={4}
          aria-label="Upload PDF"
        />
        <Button colorScheme="teal" onClick={() => setText("")} variant="outline">
          Clear Extracted Text
        </Button>
      </Box>

      {text && (
        <Box mt={6}>
          <Textarea
            value={text}
            readOnly
            height="400px"
            placeholder="Extracted text will appear here"
            resize="none"
          />
        </Box>
      )}
    </Box>
  );
};

export default PDFToText;

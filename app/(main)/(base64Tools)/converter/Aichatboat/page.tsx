"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Container,
  useToast,
  Spinner,
  IconButton,
  Flex,
  Avatar,
  Image,
  Badge,
} from "@chakra-ui/react";
import { Send, Upload, FileText, Table, Zap } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:5000/api/chat";

export default function UniversalChatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [filePreview, setFilePreview] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfLib, setPdfLib] = useState<any>(null);

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const applyRegexPipeline = (text: string, patterns: RegExp[]) => {
    let processed = text;
    patterns.forEach((pattern) => {
      processed = processed.replace(pattern, "");
    });
    return processed;
  };

  useEffect(() => {
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      setPdfLib(pdfjs);
    });
  }, []);

  const autoSummarize = async (content: string, type: string, isImg: boolean) => {
    setIsTyping(true);

    try {
      const response = await axios.post(API_URL, {
        fileData: content,
        fileType: type,
        userQuery:
          "Please provide a brief summary of this file and tell me what I can ask you about it.",
        isImage: isImg,
      });

      setMessages([
        {
          role: "bot",
          content: response.data.reply || "AI could not summarize this file.",
        },
      ]);
    } catch (err) {
      setMessages([
        { role: "bot", content: "Error: could not summarize file." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessages([]);

    let finalContent = "";
    let isImg = file.type.startsWith("image/");

    try {
      if (isImg) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setExtractedContent(base64);
          setFilePreview({
            name: file.name,
            type: file.type,
            url: reader.result,
          });
          autoSummarize(base64, file.type, true);
        };
        reader.readAsDataURL(file);
        return;
      }

      if (
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const jsonData = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
        finalContent = JSON.stringify(jsonData, null, 2);

        setFilePreview({
          name: file.name,
          type: file.type,
          excelPreview: JSON.stringify(jsonData.slice(0, 5), null, 2),
        });
      } else if (file.type === "application/pdf" && pdfLib) {
        const pdf = await pdfLib.getDocument({
          data: await file.arrayBuffer(),
        }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          finalContent +=
            (await page.getTextContent())
              .items.map((item: any) => item.str)
              .join(" ") + "\n";
        }
        setFilePreview({ name: file.name, type: file.type });
      }

      finalContent = applyRegexPipeline(finalContent, [
        /\s{2,}/g,
        /[\r\n]{2,}/g,
      ]);

      setExtractedContent(finalContent);

      autoSummarize(finalContent, file.type, false);

      toast({
        title: "Analyzed successfully!",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Error reading file",
        status: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !extractedContent) return;

    const userQuery = input;
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(API_URL, {
        fileData: extractedContent,
        fileType: filePreview?.type,
        userQuery,
        isImage: filePreview?.type?.startsWith("image/"),
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.data.reply || "AI could not answer this." },
      ]);
    } catch (error) {
      toast({ title: "Connection Lost", status: "error" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} h="100vh">
          {/* Header */}
          <Flex w="full" justify="space-between" align="center">
            <HStack spacing={3}>
              <Zap size={24} />
              <Text fontWeight="bold">Studio AI</Text>
              <Badge colorScheme="purple">Toolsahayta</Badge>
            </HStack>

            <Button
              leftIcon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
              isLoading={isProcessing}
            >
              Upload File
            </Button>

            <input
              hidden
              type="file"
              ref={fileInputRef}
              accept=".pdf,.xlsx,.xls,.csv,image/*"
              onChange={handleFileUpload}
            />
          </Flex>

          {/* File Preview + Chat */}
          <VStack flex={1} w="full" bg="white" borderRadius="xl" boxShadow="md" overflow="hidden">
            {/* Preview */}
            {filePreview && (
              <Box w="full" p={4} borderBottom="1px" borderColor="gray.200">
                <HStack justify="space-between">
                  <Text fontWeight="bold">{filePreview.name}</Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      setFilePreview(null);
                      setMessages([]);
                      setExtractedContent("");
                    }}
                  >
                    Remove File
                  </Button>
                </HStack>

                <Box mt={2}>
                  {filePreview.type.startsWith("image/") && (
                    <Image src={filePreview.url} alt="Preview" maxH="200px" objectFit="contain" borderRadius="md" />
                  )}

                  {filePreview.type === "application/pdf" && (
                    <Flex bg="gray.100" h="100px" align="center" justify="center" borderRadius="md">
                      <FileText size={48} color="#E53E3E" />
                      <Text ml={2}>PDF Preview</Text>
                    </Flex>
                  )}

                  {(filePreview.type.includes("excel") || filePreview.type.includes("csv")) &&
                    filePreview.excelPreview && (
                      <Box maxH="150px" overflowY="auto" p={2} bg="gray.50" borderRadius="md">
                        <pre style={{ fontSize: "10px" }}>{filePreview.excelPreview}</pre>
                      </Box>
                    )}
                </Box>
              </Box>
            )}

            {/* Chat Messages */}
            <Box flex={1} w="full" p={6} overflowY="auto" ref={scrollRef}>
              {messages.length === 0 && (
                <Flex align="center" justify="center" h="full">
                  <Text color="gray.400">Upload a file to start chatting with AI</Text>
                </Flex>
              )}

              {messages.map((msg, i) => (
                <Flex key={i} justify={msg.role === "user" ? "flex-end" : "flex-start"} mb={4}>
                  <HStack align="start">
                    {msg.role === "bot" && <Avatar size="xs" name="AI" bg="purple.500" />}
                    <Box
                      p={3}
                      bg={msg.role === "user" ? "purple.500" : "gray.100"}
                      color={msg.role === "user" ? "white" : "black"}
                      borderRadius="lg"
                      maxW="500px"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">{msg.content}</Text>
                    </Box>
                  </HStack>
                </Flex>
              ))}

              {isTyping && (
                <HStack>
                  <Spinner size="sm" />
                  <Text fontSize="xs">AI is thinking...</Text>
                </HStack>
              )}
            </Box>

            {/* Input */}
            <Box p={4} w="full">
              <HStack>
                <Input
                  placeholder="Ask about the file..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <IconButton
                  aria-label="send"
                  icon={<Send size={18} />}
                  onClick={sendMessage}
                  isDisabled={!extractedContent}
                />
              </HStack>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
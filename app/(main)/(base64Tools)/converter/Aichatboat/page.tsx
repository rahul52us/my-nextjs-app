"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import { Send, Upload, FileText, Zap } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";
import stores from "../../../../store/stores";

const API_URL = "http://localhost:5000/api/chat";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface FilePreview {
  name: string;
  type: string;
  url?: string | ArrayBuffer | null;
  excelPreview?: string;
}

export default function UniversalChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfLib, setPdfLib] = useState<any>(null);

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: All hooks at top level — no conditional calls
  const { themeStore: { themeConfig } } = stores;
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const botBubbleBg = useColorModeValue("gray.100", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputFooterBg = useColorModeValue("gray.50", "gray.800"); // ✅ FIX: was inline conditional hook
  const inputBg = useColorModeValue("white", "gray.700");         // ✅ FIX: was inline conditional hook

  // ✅ Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ✅ Load PDF.js once on mount
  useEffect(() => {
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      setPdfLib(pdfjs);
    });
  }, []);

  const applyRegexPipeline = (text: string, patterns: RegExp[]): string => {
    return patterns.reduce((processed, pattern) => processed.replace(pattern, " "), text).trim();
  };

  // ✅ Wrapped in useCallback for stability
  const autoSummarize = useCallback(async (content: string, type: string, isImg: boolean) => {
    setIsTyping(true);
    try {
      const response = await axios.post(API_URL, {
        fileData: content,
        fileType: type,
        userQuery: "Please provide a brief summary of this file and tell me what I can ask you about it.",
        isImage: isImg,
      });
      setMessages([
        {
          role: "bot",
          content: response.data.reply || "AI could not summarize this file.",
        },
      ]);
    } catch {
      setMessages([{ role: "bot", content: "Error: could not summarize file. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Reset input so same file can be re-uploaded
    e.target.value = "";

    setIsProcessing(true);
    setMessages([]);
    setExtractedContent("");
    setFilePreview(null);

    const isImg = file.type.startsWith("image/");

    try {
      if (isImg) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setExtractedContent(base64);
          setFilePreview({ name: file.name, type: file.type, url: reader.result });
          setIsProcessing(false);
          autoSummarize(base64, file.type, true);
        };
        reader.onerror = () => {
          toast({ title: "Could not read image file", status: "error" });
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
        return; // Exit early — onloadend handles the rest
      }

      let finalContent = "";

      // ✅ FIX: Reliable Excel/CSV detection via extension + MIME
      const isExcel =
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv") ||
        file.type.includes("spreadsheet") ||
        file.type === "text/csv";

      const isPDF = file.type === "application/pdf";

      if (isExcel) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        finalContent = JSON.stringify(jsonData, null, 2);

        setFilePreview({
          name: file.name,
          type: file.type,
          excelPreview: JSON.stringify(jsonData.slice(0, 5), null, 2),
        });

      } else if (isPDF) {
        // ✅ FIX: Wait for pdfLib to be ready
        if (!pdfLib) {
          toast({ title: "PDF library is still loading. Please try again.", status: "warning" });
          setIsProcessing(false);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          finalContent += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }

        setFilePreview({ name: file.name, type: file.type });

      } else {
        toast({ title: "Unsupported file type", status: "warning" });
        setIsProcessing(false);
        return;
      }

      // ✅ FIX: Collapse multiple spaces/newlines into single space
      finalContent = applyRegexPipeline(finalContent, [/\s{2,}/g, /[\r\n]{2,}/g]);

      if (!finalContent.trim()) {
        toast({ title: "File appears to be empty or unreadable", status: "warning" });
        setIsProcessing(false);
        return;
      }

      setExtractedContent(finalContent);
      autoSummarize(finalContent, file.type, false);

      toast({ title: "File analyzed successfully!", status: "success", duration: 2000 });

    } catch (err) {
      console.error("File upload error:", err);
      toast({ title: "Error reading file. Please try another file.", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !extractedContent) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmedInput }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(API_URL, {
        fileData: extractedContent,
        fileType: filePreview?.type,
        userQuery: trimmedInput,
        isImage: filePreview?.type?.startsWith("image/"),
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.data.reply || "AI could not answer this." },
      ]);
    } catch (error) {
      toast({ title: "Connection Lost. Please try again.", status: "error" });
      // ✅ Re-add user message on failure so it's not lost
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error: Could not reach the server. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setFilePreview(null);
    setMessages([]);
    setExtractedContent("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Detect Excel preview by extension (type can be empty string for some CSV)
  const isExcelOrCsv =
    filePreview?.name.endsWith(".xlsx") ||
    filePreview?.name.endsWith(".xls") ||
    filePreview?.name.endsWith(".csv");

  return (
    <Box bg={bgColor} color={textColor} minH="100vh">
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} h="100vh">

          {/* Header */}
          <Flex w="full" justify="space-between" align="center">
            <HStack spacing={3}>
              <Zap size={24} color={themeConfig.colors.brand[300]} />
              <Heading as="h1" size="md" color={themeConfig.colors.brand[300]}>
                Studio AI
              </Heading>
              <Badge colorScheme="purple">Toolsahayta</Badge>
            </HStack>

            <Button
              colorScheme="teal"
              leftIcon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
              isLoading={isProcessing}
              loadingText="Processing..."
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

          {/* Chat Container */}
          <VStack
            flex={1}
            w="full"
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            overflow="hidden"
            border="1px"
            borderColor={borderColor}
          >
            {/* File Preview Section */}
            {filePreview && (
              <Box w="full" p={4} borderBottom="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" noOfLines={1}>{filePreview.name}</Text>
                  <Button size="sm" colorScheme="red" variant="ghost" onClick={handleReset}>
                    Remove File
                  </Button>
                </HStack>

                <Box mt={2}>
                  {filePreview.type.startsWith("image/") && (
                    <Image
                      src={filePreview.url as string}
                      alt="Preview"
                      maxH="200px"
                      objectFit="contain"
                      borderRadius="md"
                    />
                  )}

                  {filePreview.type === "application/pdf" && (
                    <Flex bg={bgColor} h="80px" align="center" justify="center" borderRadius="md">
                      <FileText size={36} color="#E53E3E" />
                      <Text ml={2} fontSize="sm">PDF loaded and ready</Text>
                    </Flex>
                  )}

                  {isExcelOrCsv && filePreview.excelPreview && (
                    <Box maxH="150px" overflowY="auto" p={2} bg={bgColor} borderRadius="md">
                      <pre style={{ fontSize: "10px" }}>{filePreview.excelPreview}</pre>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Messages Area */}
            <Box flex={1} w="full" p={6} overflowY="auto" ref={scrollRef}>
              {messages.length === 0 && !isTyping && (
                <Flex align="center" justify="center" h="full">
                  <Text color="gray.500" textAlign="center">
                    {filePreview ? "AI is analyzing your file..." : "Upload a file to start chatting with AI"}
                  </Text>
                </Flex>
              )}

              {messages.map((msg, i) => (
                <Flex
                  key={i}
                  justify={msg.role === "user" ? "flex-end" : "flex-start"}
                  mb={4}
                >
                  <HStack align="start" maxW="80%">
                    {msg.role === "bot" && (
                      <Avatar size="xs" name="AI" bg="teal.500" flexShrink={0} />
                    )}
                    <Box
                      p={3}
                      bg={msg.role === "user" ? "teal.500" : botBubbleBg}
                      color={msg.role === "user" ? "white" : textColor}
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {msg.content}
                      </Text>
                    </Box>
                  </HStack>
                </Flex>
              ))}

              {isTyping && (
                <HStack mt={2}>
                  <Avatar size="xs" name="AI" bg="teal.500" />
                  <HStack bg={botBubbleBg} px={3} py={2} borderRadius="lg">
                    <Spinner size="xs" color="teal.500" />
                    <Text fontSize="xs" color={textColor}>AI is thinking...</Text>
                  </HStack>
                </HStack>
              )}
            </Box>

            {/* Input Footer */}
            {/* ✅ FIX: No inline useColorModeValue calls */}
            <Box p={4} w="full" bg={inputFooterBg} borderTop="1px" borderColor={borderColor}>
              <HStack>
                <Input
                  placeholder={
                    extractedContent
                      ? "Ask anything about the file..."
                      : "Upload a file first to ask questions"
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  bg={inputBg}
                  isDisabled={!extractedContent || isTyping}
                />
                <IconButton
                  colorScheme="teal"
                  aria-label="Send message"
                  icon={<Send size={18} />}
                  onClick={sendMessage}
                  isDisabled={!extractedContent || !input.trim() || isTyping}
                  isLoading={isTyping}
                />
              </HStack>
            </Box>

          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
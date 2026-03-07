"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, VStack, HStack, Input, Button, Text, Container, useToast, 
  Spinner, IconButton, Flex, Avatar, Image, CloseButton, Badge
} from '@chakra-ui/react';
import { Send, Upload, FileText, Image as ImageIcon, Table, Zap } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function UniversalChatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [filePreview, setFilePreview] = useState<{name: string, type: string, url?: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfLib, setPdfLib] = useState<any>(null);
  
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- RegEx Pipeline Function ---
  const applyRegexPipeline = (text: string, patterns: RegExp[]) => {
    let processed = text;
    patterns.forEach(pattern => {
      processed = processed.replace(pattern, '');
    });
    return processed;
  };

  useEffect(() => {
    import('pdfjs-dist').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      setPdfLib(pdfjs);
    });
  }, []);

  // --- Automatic summarization ---
  const autoSummarize = async (content: string, type: string, isImg: boolean) => {
    setIsTyping(true);
    try {
      const response = await axios.post("/api/chat", {
        fileData: content,
        fileType: type,
        userQuery: "Please provide a brief, beautiful summary of this file and tell me what I can ask you about it.",
        isImage: isImg
      });
      setMessages([{ role: 'bot', content: response.data.reply }]);
    } catch (err) {
      console.error("Summary failed");
    } finally { setIsTyping(false); }
  };

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessages([]); // Clear chat for new file
    let finalContent = "";
    let isImg = file.type.startsWith('image/');

    try {
      if (isImg) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setExtractedContent(base64);
          setFilePreview({ name: file.name, type: file.type, url: reader.result as string });
          autoSummarize(base64, file.type, true);
        };
        reader.readAsDataURL(file);
        return;
      }

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        finalContent = JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]), null, 2);
      } else if (file.type === 'application/pdf' && pdfLib) {
        const pdf = await pdfLib.getDocument({ data: await file.arrayBuffer() }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          finalContent += (await page.getTextContent()).items.map((item: any) => item.str).join(" ") + "\n";
        }
      }

      // --- Apply RegEx pipeline ---
      const regexPipeline = [
        /\s{2,}/g,      // Remove extra spaces
        /[\r\n]{2,}/g   // Normalize multiple line breaks
        // You can add more patterns here: emails, URLs, special chars, etc.
      ];
      finalContent = applyRegexPipeline(finalContent, regexPipeline);

      setExtractedContent(finalContent);
      setFilePreview({ name: file.name, type: file.type });
      autoSummarize(finalContent, file.type, false);
      toast({ title: "Analyzed successfully!", status: "success", isClosable: true });
    } catch (err) {
      toast({ title: "Error reading file", status: "error" });
    } finally { setIsProcessing(false); }
  };

  // --- Sending user query to AI ---
  const sendMessage = async () => {
    if (!input.trim() || !extractedContent) return;

    const userQuery = input;
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post("/api/chat", {
        fileData: extractedContent,
        fileType: filePreview?.type,
        userQuery,
        isImage: filePreview?.type.startsWith('image/')
      });
      setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      toast({ title: "Connection Lost", status: "error" });
    } finally { setIsTyping(false); }
  };

  return (
    <Box bgGradient="linear(to-br, #F9FAFB, #F3F4F6)" minH="100vh">
      <Container maxW="container.xl" h="100vh" py={6}>
        <VStack h="full" spacing={6}>

          {/* Header */}
          <Flex w="full" justify="space-between" align="center" px={8} py={4} bg="whiteAlpha.800" backdropFilter="blur(10px)" borderRadius="3xl" boxShadow="xl" border="1px" borderColor="whiteAlpha.400">
            <HStack spacing={4}>
              <Box bgGradient="linear(to-tr, purple.500, blue.500)" p={2} borderRadius="xl">
                <Zap color="white" size={24} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="800" fontSize="xl" bgGradient="linear(to-l, #7928CA, #FF0080)" bgClip="text">Studio AI</Text>
                <Badge colorScheme="purple" variant="subtle" borderRadius="full" fontSize="10px">Powered by Gemini 2.5</Badge>
              </VStack>
            </HStack>
            <Button leftIcon={<Upload size={18} />} colorScheme="purple" boxShadow="lg" _hover={{transform: 'translateY(-2px)'}} transition="all 0.2s" onClick={() => fileInputRef.current?.click()} isLoading={isProcessing} borderRadius="full" px={8}>
              Upload Any File
            </Button>
            <input type="file" ref={fileInputRef} hidden accept=".pdf,.xlsx,.xls,.csv,image/*" onChange={handleFileUpload} />
          </Flex>

          <Flex w="full" flex={1} gap={6} overflow="hidden">
            {/* Sidebar */}
            <Box w="320px" p={6} bg="white" borderRadius="3xl" boxShadow="2xl" border="1px" borderColor="gray.100" display={{ base: 'none', lg: 'block' }}>
              <Text fontWeight="700" color="gray.700" mb={4}>Document Insights</Text>
              {filePreview ? (
                <VStack align="stretch" spacing={4}>
                  <Box borderRadius="2xl" overflow="hidden" border="1px" borderColor="gray.100">
                    {filePreview.type.startsWith('image/') ? (
                      <Image src={filePreview.url} alt="Preview" />
                    ) : (
                      <Flex bg="purple.50" h="120px" align="center" justify="center">
                        {filePreview.name.endsWith('pdf') ? <FileText size={48} color="#E53E3E" /> : <Table size={48} color="#38A169" />}
                      </Flex>
                    )}
                  </Box>
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>{filePreview.name}</Text>
                  <Box p={3} bg="gray.50" borderRadius="xl">
                    <Text fontSize="xs" color="gray.500">The AI has analyzed the content and is ready to answer questions about tables, text, or images.</Text>
                  </Box>
                  <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<CloseButton size="xs" />} onClick={() => {setFilePreview(null); setMessages([]);}}>Remove File</Button>
                </VStack>
              ) : (
                <Flex direction="column" align="center" justify="center" h="200px" border="2px dashed" borderColor="gray.200" borderRadius="2xl" color="gray.400">
                  <Upload size={32} />
                  <Text fontSize="xs" mt={2} textAlign="center">Drag & drop files here <br/> (Max 20MB)</Text>
                </Flex>
              )}
            </Box>

            {/* Chat */}
            <VStack flex={1} bg="white" borderRadius="3xl" boxShadow="2xl" overflow="hidden" spacing={0} border="1px" borderColor="gray.100">
              <Box flex={1} w="full" overflowY="auto" p={6} ref={scrollRef}>
                {messages.length === 0 && (
                  <Flex h="full" direction="column" align="center" justify="center" opacity={0.5}>
                    <ImageIcon size={64} color="#CBD5E0" />
                    <Text fontWeight="600" mt={4} color="gray.500">I'm ready to learn from your file.</Text>
                  </Flex>
                )}
                {messages.map((msg, i) => (
                  <Flex key={i} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} mb={6}>
                    <HStack align="start" spacing={3} maxW="80%">
                      {msg.role === 'bot' && <Avatar size="xs" name="AI" bg="purple.500" />}
                      <Box p={4} borderRadius={msg.role === 'user' ? "2xl 2xl 4px 2xl" : "2xl 2xl 2xl 4px"} bg={msg.role === 'user' ? "purple.600" : "gray.50"} color={msg.role === 'user' ? "white" : "gray.800"} boxShadow="sm">
                        <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">{msg.content}</Text>
                      </Box>
                    </HStack>
                  </Flex>
                ))}
                {isTyping && (
                  <HStack spacing={2} ml={10}>
                    <Spinner size="xs" color="purple.500" />
                    <Text fontSize="xs"  color="gray.400">Studio AI is thinking...</Text>
                  </HStack>
                )}
              </Box>

              <Box p={4} w="full" bg="white" borderTop="1px" borderColor="gray.50">
                <HStack bg="gray.100" p={2} borderRadius="2xl" spacing={2}>
                  <Input variant="unstyled" placeholder={filePreview ? "Ask me anything..." : "Please upload a document first"} px={4} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                  <IconButton aria-label="send" icon={<Send size={18} />} colorScheme="purple" borderRadius="xl" onClick={sendMessage} isDisabled={!extractedContent || isTyping} />
                </HStack>
              </Box>
            </VStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
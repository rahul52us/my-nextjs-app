"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Textarea,
  Text,
  VStack,
  Grid,
  GridItem,
  Link,
  useToast,
  Icon
} from "@chakra-ui/react";
import { FaCopy, FaArrowRight } from "react-icons/fa";
import { sidebarData } from "../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";

export default function HomePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    document.title = "Base64 Encoder & Decoder | Developer Toolkit";
  }, []);

  const handleConvert = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const result = mode === "encode" ? btoa(input.trim()) : atob(input.trim());
        setOutput(result);
        setError("");
      } catch {
        setOutput("");
        setError(`⚠️ Invalid ${mode === "encode" ? "text input" : "Base64"} for ${mode}.`);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied to clipboard!", status: "success", duration: 2000, isClosable: true, position: "top-right" });
  };

  return (
    <>
      <Head>
        <meta name="description" content="Simple Base64 encoding and decoding tool for developers, learners and creators." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Base64 Encoder & Decoder Tool" />
        <meta property="og:description" content="Encode and decode Base64 strings instantly. Works with text, JSON, files, and more." />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Box maxW="5xl" mx="auto" px={4} py={10} animation="fadeIn 0.4s ease-in-out">
        <VStack spacing={6} textAlign="center">
          <Heading bgGradient="linear(to-r, blue.400, blue.600)" bgClip="text" fontSize="3xl">
            🧰 Base64 Encoder & Decoder
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Effortlessly convert between <b>Base64</b> and <b>plain text</b>. Fast, secure & reliable — built for developers, learners, and creators.
          </Text>
          <Flex gap={4} flexWrap="wrap" justify="center">
            <Button colorScheme="blue" leftIcon={<FaArrowRight />} onClick={() => document.querySelector('.text-area')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started
            </Button>
            <Link href="#tools">
              <Button variant="outline" colorScheme="blue">Explore More Tools</Button>
            </Link>
          </Flex>
        </VStack>

        <Flex justify="center" mt={8}>
          <Button
            borderRadius="md"
            isActive={mode === "encode"}
            colorScheme={mode === "encode" ? "blue" : "gray"}
            onClick={() => setMode("encode")}
            mr={2}
          >Encode</Button>
          <Button
            borderRadius="md"
            isActive={mode === "decode"}
            colorScheme={mode === "decode" ? "blue" : "gray"}
            onClick={() => setMode("decode")}
          >Decode</Button>
        </Flex>

        <Textarea
          className="text-area"
          value={input}
          placeholder={mode === "encode" ? "Type text to encode..." : "Paste Base64 to decode..."}
          onChange={(e) => setInput(e.target.value)}
          mt={4}
          minH="120px"
          borderColor="gray.300"
        />

        <Button
          mt={4}
          width="full"
          colorScheme="blue"
          onClick={handleConvert}
          isLoading={loading}
        >
          {mode === "encode" ? "🔒 Encode Now" : "🔓 Decode Now"}
        </Button>

        {error && <Text color="red.500" mt={3} textAlign="center">{error}</Text>}

        {output && (
          <Box mt={6} p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">✅ Result</Text>
              <Button size="sm" colorScheme="blue" onClick={copyOutput} leftIcon={<FaCopy />}>
                Copy
              </Button>
            </Flex>
            <Box mt={2} whiteSpace="pre-wrap" wordBreak="break-word" fontSize="sm" color="gray.800">
              {output}
            </Box>
          </Box>
        )}

        <Box mt={10}>
          <Heading as="h2" size="md" mb={2}>🧩 More Developer Utilities You’ll Love</Heading>
          <VStack align="start" spacing={2} pl={4} color="blue.600">
            <Link href="/converter/encoder/file">File ➜ Base64 <Icon as={FaArrowRight} ml={1} /></Link>
            <Link href="/converter/decoder/image">Base64 ➜ Image <Icon as={FaArrowRight} ml={1} /></Link>
            <Link href="/tools/json-formatter">JSON Formatter <Icon as={FaArrowRight} ml={1} /></Link>
          </VStack>
        </Box>

        <Box mt={10} bg="yellow.50" p={4} borderRadius="md">
          <Heading as="h2" size="sm" mb={2}>🧠 Understanding Base64 Encoding</Heading>
          <Text color="gray.700">
            Base64 encodes binary data into readable ASCII strings, commonly used in URLs, file uploads, or email systems.
            It’s a safe way to transfer data through systems that only support text.
          </Text>
        </Box>

        <Box mt={10}>
          <Heading as="h2" size="md" mb={2}>📌 Use Cases for Base64</Heading>
          <VStack align="start" pl={4} spacing={1} color="gray.800">
            <Text>🔐 Embedding files (images, fonts) into HTML or CSS</Text>
            <Text>📤 Sending binary data over APIs or email</Text>
            <Text>📦 Handling file uploads in Base64 format</Text>
            <Text>🧪 Quick debugging of encoded payloads</Text>
          </VStack>
        </Box>

        <Box mt={10} id="tools">
          <Heading as="h2" size="md" mb={4}>🧮 Developer Toolkit Categories</Heading>
          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
            {sidebarData.map((cat) => (
              <Link key={cat.id} href={cat.children?.[0]?.url || "#"} _hover={{ textDecoration: "none" }}>
                <GridItem
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  bg="white"
                  _hover={{ boxShadow: "md", bg: "gray.50" }}
                >
                  <Box fontSize="2xl" mb={2} color="blue.500">{cat.icon}</Box>
                  <Text fontWeight="semibold">{cat.name}</Text>
                  <Text fontSize="sm" color="gray.500">{cat.children?.length} Tools</Text>
                </GridItem>
              </Link>
            ))}
          </Grid>
        </Box>

        <Text textAlign="center" fontSize="sm" mt={16} color="gray.600">
          🚀 Looking for more? Try <Link color="blue.500" href="/tools/json-formatter">JSON Formatter</Link>, <Link color="blue.500" href="/converter/unit-converter">Unit Converter</Link>, or <Link color="blue.500" href="#tools">browse all tools</Link>.
        </Text>
      </Box>
    </>
  );
}

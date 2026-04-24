"use client";
import React, { useState } from 'react';
import { 
  Box, Button, Flex, Heading, Select, useToast, 
  HStack, Stack, Text, VStack, Container, Divider, Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import prettier from 'prettier/standalone';

// Full Plugin Suite
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
import cssPlugin from 'prettier/plugins/postcss';
import markdownPlugin from 'prettier/plugins/markdown';
import typescriptPlugin from 'prettier/plugins/typescript';
import yamlPlugin from 'prettier/plugins/yaml';
import graphqlPlugin from 'prettier/plugins/graphql';

import { Copy, Wand2, Trash2, Code2, Sparkles, Download } from 'lucide-react';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript', parser: 'babel' },
  { label: 'TypeScript', value: 'typescript', parser: 'typescript' },
  { label: 'JSON', value: 'json', parser: 'json' },
  { label: 'JSON5', value: 'json5', parser: 'json5' },
  { label: 'HTML', value: 'html', parser: 'html' },
  { label: 'CSS', value: 'css', parser: 'css' },
  { label: 'SCSS', value: 'scss', parser: 'scss' },
  { label: 'Less', value: 'less', parser: 'less' },
  { label: 'Markdown', value: 'markdown', parser: 'markdown' },
  { label: 'YAML', value: 'yaml', parser: 'yaml' },
  { label: 'GraphQL', value: 'graphql', parser: 'graphql' },
  { label: 'JSX / React', value: 'javascript', parser: 'babel' },
  { label: 'TSX / React', value: 'typescript', parser: 'typescript' },
  { label: 'Vue', value: 'vue', parser: 'vue' },
  { label: 'Angular', value: 'angular', parser: 'angular' },
  { label: 'MDX', value: 'mdx', parser: 'mdx' },
  { label: 'Handlebars', value: 'handlebars', parser: 'glimmer' },
  { label: 'Flow', value: 'flow', parser: 'flow' },
  { label: 'XML', value: 'xml', parser: 'html' },
  { label: 'PostCSS', value: 'postcss', parser: 'css' },
];

const StudioFormatter = () => {
  const [code, setCode] = useState('// Paste your code here...');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.950");
  const containerBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const footerBg = useColorModeValue("gray.50", "gray.800");
  const buttonBg = useColorModeValue("white", "gray.700");
  const selectBg = useColorModeValue("gray.50", "gray.700");
  const selectHoverBg = useColorModeValue("gray.100", "gray.600");
  const actionShadow = useColorModeValue("0 10px 15px -3px rgba(37, 99, 235, 0.4)", "0 10px 25px -5px rgba(37, 99, 235, 0.35)");
  const iconBg = useColorModeValue("blue.600", "blue.500");
  const iconColor = useColorModeValue("white", "white");
  const sparkleColor = useColorModeValue("#3182ce", "#90cdf4");
  const tableBg = useColorModeValue("gray.50", "gray.800");

  const handleFormat = async () => {
    try {
      const formatted = await prettier.format(code, {
        parser: selectedLang.parser,
        plugins: [
          babelPlugin, estreePlugin, htmlPlugin, 
          cssPlugin, markdownPlugin, typescriptPlugin,
          yamlPlugin, graphqlPlugin
        ],
        semi: true,
        // We set this to false for JSON compatibility, 
        // but Prettier is smart enough to use single quotes for JS if you prefer.
        singleQuote: selectedLang.value !== 'json', 
        tabWidth: 2,
        printWidth: 80,
      });
      setCode(formatted);
      toast({ title: "Magic applied!", status: "success", position: 'top', duration: 2000 });
    } catch (err: any) {
      toast({ 
        title: "Syntax Error", 
        description: `Check your ${selectedLang.label} syntax.`, 
        status: "error", 
        position: 'top' 
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", status: "info", duration: 1500 });
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-code.${selectedLang.value === 'javascript' ? 'js' : selectedLang.value}`;
    link.click();
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8} px={4}>
      <Container maxW="container.xl" bg={containerBg} borderRadius="3xl" p={0} boxShadow="0 25px 50px -12px rgba(0,0,0,0.1)" overflow="hidden">
        
        {/* Header Section */}
        <Flex bg={headerBg} p={6} borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack spacing={4} alignItems="flex-start" w={{ base: '100%', md: 'auto' }}>
            <Box bg={iconBg} p={2.5} borderRadius="2xl" boxShadow="0 4px 12px rgba(37, 99, 235, 0.18)">
              <Code2 color={iconColor} size={28} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={textColor} letterSpacing="-0.5px">StudioFormat Pro</Heading>
              <HStack spacing={2} flexWrap="wrap">
                <Sparkles size={12} color={sparkleColor} />
                <Text fontSize="xs" color={secondaryTextColor} fontWeight="bold">v2.1 • ALL PLUGINS LOADED</Text>
              </HStack>
            </VStack>
          </HStack>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={3} w={{ base: '100%', md: 'auto' }}>
            <Select 
              variant="filled" 
              size="md" 
              borderRadius="xl"
              w={{ base: '100%', md: '220px' }}
              value={selectedLang.label}
              onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.label === e.target.value) || LANGUAGES[0])}
              bg={selectBg}
              _hover={{ bg: selectHoverBg }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.label} value={l.label}>{l.label}</option>
              ))}
            </Select>
            <Tooltip label="Clear All">
              <Button colorScheme="red" variant="ghost" onClick={() => setCode('')} borderRadius="xl" w={{ base: '100%', md: 'auto' }}>
                <Trash2 size={20}/>
              </Button>
            </Tooltip>
          </Stack>
        </Flex>

        {/* Editor Wrapper */}
        <Box p={6}>
          <Box borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={borderColor} boxShadow="inner">
            <Editor
              height="55vh"
              theme={useColorModeValue("light", "vs-dark")}
              language={selectedLang.value}
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                padding: { top: 20 },
                smoothScrolling: true,
                cursorBlinking: "expand",
                lineHeight: 1.5,
                fontFamily: 'Fira Code, Menlo, monospace',
              }}
            />
          </Box>
        </Box>

        {/* Action Footer */}
        <Flex p={6} bg={footerBg} justify="center" gap={4} borderTop="1px solid" borderColor={borderColor} direction={{ base: 'column', md: 'row' }} align="center">
          <Button leftIcon={<Download size={18} />} onClick={downloadFile} variant="outline" colorScheme="gray" bg={buttonBg} px={8} borderRadius="full" w={{ base: '100%', md: 'auto' }}>
            Download
          </Button>
          <Button leftIcon={<Copy size={18} />} onClick={copyCode} variant="outline" colorScheme="blue" bg={buttonBg} px={8} borderRadius="full" w={{ base: '100%', md: 'auto' }}>
            Copy
          </Button>
          <Button 
            leftIcon={<Wand2 size={20} />} 
            colorScheme="blue" 
            onClick={handleFormat} 
            px={12} 
            size="lg"
            borderRadius="full"
            boxShadow={actionShadow}
            _hover={{ transform: 'translateY(-2px)', boxShadow: actionShadow }}
            _active={{ transform: 'translateY(0)' }}
            w={{ base: '100%', md: 'auto' }}
          >
            Format Code
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default StudioFormatter;
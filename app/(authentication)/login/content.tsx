"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Spinner,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

interface LoginContentProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
  redirectPath?: string;
}

const ToolsahayataLogo = () => {
  return (
    <Flex align="center" justify="center" mb={4}>
      {/* Styled logo mimicking the exact header logo from the screenshot */}
      <Box
        bg="#0066fe"
        px={5}
        py={2.5}
        borderRadius="xl"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="md"
      >
        <Text fontFamily="Inter, sans-serif" fontSize="22px" letterSpacing="-0.5px" color="white" userSelect="none">
          <Box as="span" fontWeight="800">Tool</Box>
          <Box as="span" fontWeight="300" opacity={0.9}>sahayata</Box>
        </Text>
      </Box>
    </Flex>
  );
};

const LoginContent = observer(({ isModal = false, onLoginSuccess, redirectPath }: LoginContentProps) => {
  const { auth: { login, openNotification } } = stores;
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMessage = searchParams.get("message");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || isLoading) return;
    setIsLoading(true);
    try {
      const response: any = await login(formData);
      openNotification({
        title: "Login Successful",
        message: `${response.message || "Logged in successfully."}`,
        type: "success",
        duration: 3000,
      });
      onLoginSuccess?.();
      router.push(redirectPath || "/tools/workflow");
    } catch (error: any) {
      openNotification({
        title: "Login Failed",
        message: error?.response?.data?.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Theme-aware color styles
  const cardBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("#1A202C", "white");
  const subtextColor = useColorModeValue("#718096", "gray.400");
  const inputBg = useColorModeValue("#f8f9fa", "gray.800");
  const inputTextColor = useColorModeValue("#1A202C", "white");
  const btnBg = "#0066fe";

  const formContent = (
    <>
      <VStack spacing={1} align="center" mb={6}>
        <ToolsahayataLogo />
        <Heading size="lg" fontWeight="bold" color={textColor} textAlign="center" w="100%" mt={2}>
          Login
        </Heading>
        <Text fontSize="sm" color={subtextColor} textAlign="center">
          Please enter your ID and Password
        </Text>
      </VStack>

      {loginMessage && (
        <Box mb={4} p={3} borderRadius="xl" bg="orange.50" border="1px solid" borderColor="orange.200">
          <Text fontSize="xs" color="orange.700">{loginMessage}</Text>
        </Box>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack spacing={4}>
          <FormControl id="username" isRequired>
            <Input
              type="text"
              name="username"
              placeholder="ID"
              value={formData.username}
              onChange={handleInputChange}
              focusBorderColor="blue.500"
              bg={inputBg}
              border="none"
              borderRadius="xl"
              h="52px"
              px={4}
              fontSize="sm"
              color={inputTextColor}
              _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={handleInputChange}
                focusBorderColor="blue.500"
                bg={inputBg}
                border="none"
                borderRadius="xl"
                h="52px"
                px={4}
                fontSize="sm"
                color={inputTextColor}
                _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
              />
              <InputRightElement h="full" pr={2}>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                  _hover={{ bg: 'transparent' }}
                  _active={{ bg: 'transparent' }}
                >
                  {showPassword ? <ViewOffIcon color="gray.500" /> : <ViewIcon color="gray.500" />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Single clean submit button with the text "Login" */}
          <Button
            type="submit"
            h="52px"
            bg={btnBg}
            color="white"
            borderRadius="xl"
            fontSize="sm"
            fontWeight="bold"
            _hover={{ bg: '#0052cc', opacity: 0.95 }}
            _active={{ bg: '#004099' }}
            mt={4}
            width="100%"
            isDisabled={!formData.username || !formData.password || isLoading}
          >
            {isLoading ? <Spinner size="sm" color="white" /> : "Login"}
          </Button>
        </Stack>
      </form>

      <VStack spacing={3} mt={6} w="100%" align="center">
        <Text fontSize="xs" color={subtextColor}>
          Can't access?{' '}
          <Link href="/forgot-password">
            <Text as="span" color="#0066fe" fontWeight="semibold" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              Click here
            </Text>
          </Link>
        </Text>

        <Box w="100%" h="1px" bg={useColorModeValue("gray.100", "gray.800")} my={1} />

        <Text fontSize="xs" color={subtextColor}>
          Don't have an account?{' '}
          <Link href="/register">
            <Text as="span" color="#0066fe" fontWeight="semibold" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              Sign up
            </Text>
          </Link>
        </Text>
      </VStack>
    </>
  );

  if (isModal) {
    return (
      <Box w="full" bg={cardBg} borderRadius="3xl" p={{ base: 6, md: 8 }} boxShadow="xl">
        {formContent}
      </Box>
    );
  }

  return (
    <Box minH="auto" px={2}>
      <Flex align="center" justify="center">
        <Box
          w="full"
          maxW="460px"
          bg={cardBg}
          borderRadius="3xl"
          boxShadow="2xl"
          p={{ base: 6, md: 10 }}
        >
          {formContent}
        </Box>
      </Flex>
    </Box>
  );
});

export default LoginContent;
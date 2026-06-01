"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
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
import CustomButton from "../../component/common/CustomButton/CustomButton";
import { useRouter, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

interface LoginContentProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
}

const LoginContent = observer(({ isModal = false, onLoginSuccess }: LoginContentProps) => {
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
      router.push("/tools/workflow");
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

  const cardBg = useColorModeValue("whiteAlpha.900", "rgba(15, 23, 42, 0.92)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("#0F172A", "whiteAlpha.900");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const accentBg = useColorModeValue("teal.50", "teal.900");
  const accentColor = useColorModeValue("teal.700", "teal.200");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  const formContent = (
    <>
      <VStack spacing={3} align="stretch" mb={6} textAlign="left">
        <Box
          display="inline-flex"
          px={3}
          py={1}
          bg={accentBg}
          color={accentColor}
          fontWeight="semibold"
          borderRadius="full"
          fontSize="sm"
          maxW="fit-content"
        >
          Welcome Back
        </Box>
        <Heading size="xl" lineHeight={1.1} color={headingColor}>
          Log in to your account
        </Heading>
        <Text color={textColor} maxW="lg">
          Welcome back! Please enter your details to continue and manage your workflows.
        </Text>
      </VStack>

      {loginMessage && (
        <Box mb={4} p={4} borderRadius="xl" bg="orange.50" border="1px solid" borderColor="orange.200">
          <Text fontSize="sm" color="orange.700">{loginMessage}</Text>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl id="username" isRequired>
            <FormLabel fontWeight="semibold" color={labelColor}>Email</FormLabel>
            <Input
              type="text"
              name="username"
              placeholder="Enter your email"
              value={formData.username}
              onChange={handleInputChange}
              focusBorderColor="teal.500"
              bg={inputBg}
              color={useColorModeValue('gray.800', 'white')}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel fontWeight="semibold" color={labelColor}>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                focusBorderColor="teal.500"
                bg={inputBg}
                color={useColorModeValue('gray.800', 'white')}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                  _hover={{ bg: 'transparent', opacity: 0.8 }}
                  _active={{ bg: 'transparent' }}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Flex
            align="center"
            justify="space-between"
            flexDirection={{ base: "column", md: "row" }}
            gap={2}
          >
            <Checkbox colorScheme="teal" color={useColorModeValue('gray.700', 'gray.200')}>
              Remember me
            </Checkbox>
            <Link href="/forgot-password">
              <Text fontWeight="semibold" color={accentColor} fontSize="sm">
                Forgot Password?
              </Text>
            </Link>
          </Flex>

          <CustomButton
            type="submit"
            width="100%"
            colorScheme="teal"
            isDisabled={!formData.username || !formData.password || isLoading}
          >
            {isLoading ? <Spinner size="sm" color="white" /> : "Sign in"}
          </CustomButton>
        </Stack>
      </form>

      <Text mt={8} textAlign="center" color={textColor}>
        Don't have an account?{' '}
        <Link href="/register">
          <Text as="span" color={accentColor} fontWeight="semibold">
            Sign up
          </Text>
        </Link>
      </Text>
    </>
  );

  // ── isModal true ho toh Flex wrapper nahi, seedha Box ──
  if (isModal) {
    return (
      <Box w="full" bg={cardBg} borderRadius="2xl" p={{ base: 5, md: 8 }}>
        {formContent}
      </Box>
    );
  }

  // ── Normal page view ──
  return (
    <Box minH="auto" px={4} py={{ base: 6, md: 4 }}>
      <Flex align="center" justify="center">
        <Box
          w="full"
          maxW="480px"
          bg={cardBg}
          borderRadius="3xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 6, md: 10 }}
        >
          {formContent}
        </Box>
      </Flex>
    </Box>
  );
});

export default LoginContent;
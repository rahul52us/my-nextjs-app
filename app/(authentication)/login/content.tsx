"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  Spinner,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import CustomButton from "../../component/common/CustomButton/CustomButton";
import { useRouter, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const LoginContent = observer(() => {
  const { auth: { login, openNotification } } = stores;
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
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
  const googleButtonBg = useColorModeValue("white", "gray.800");
  const googleColor = useColorModeValue("#344054", "gray.100");

  return (
    <Box minH="100vh" px={4} py={10}>
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
            <Box
              mb={4}
              p={4}
              borderRadius="xl"
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
            >
              <Text fontSize="sm" color="orange.700">
                {loginMessage}
              </Text>
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
                  color={useColorModeValue('gray.800','white')}
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  bg={inputBg}
                  color={useColorModeValue('gray.800','white')}
                />
              </FormControl>

              <Flex align="center" justify="space-between" flexDirection={{ base: "column", md: "row" }} gap={2}>
                <Checkbox colorScheme="teal" color={useColorModeValue('gray.700','gray.200')}>Remember me</Checkbox>
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

              <Button
                size="lg"
                width="100%"
                mt={2}
                leftIcon={<FcGoogle size={24} />}
                fontSize="16px"
                fontWeight="medium"
                bg={googleButtonBg}
                color={googleColor}
                border="1px solid"
                borderColor={useColorModeValue('#D0D5DD', 'rgba(255,255,255,0.14)')}
                borderRadius="xl"
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                boxShadow="sm"
              >
                Sign in with Google
              </Button>
            </Stack>
          </form>

          <Text mt={8} textAlign="center" color={textColor}>
            Don’t have an account?{' '}
            <Link href="/register">
              <Text as="span" color={accentColor} fontWeight="semibold">
                Sign up
              </Text>
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
});

export default LoginContent;

"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { AuthSplitLayout } from "../components/AuthCarousel";
import { useAuthFormStyles } from "../components/authFormStyles";

interface LoginContentProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
  redirectPath?: string;
}

const LoginContent = observer(
  ({ isModal = false, onLoginSuccess, redirectPath }: LoginContentProps) => {
    const { auth: { login, openNotification } } = stores;

    const [formData, setFormData] = useState({ username: "", password: "", rememberMe: false });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginMessage = searchParams.get("message");

    const {
      bgGradient,
      inputBorder,
      subtextColor,
      textColor,
      dividerColor,
      inputStyles,
      primaryButtonStyles,
      linkStyles,
    } = useAuthFormStyles();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
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
        router.push(redirectPath || "/");
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

    const loginForm = (
      <Box
        w="full"
        maxW="520px"
        bg="transparent"
        borderRadius="0"
        p={isModal ? 0 : { base: 4, md: 6 }}
        border="none"
        boxShadow="none"
        animation={isModal ? undefined : "slideIn 0.5s ease-out"}
      >
        <Text
          fontSize="xs"
          fontWeight="600"
          color="#025b97"
          textTransform="uppercase"
          letterSpacing="1px"
          mb={2}
        >
          Welcome Back
        </Text>

        <Text
          fontSize={{ base: "2xl", md: "2xl" }}
          fontWeight="700"
          color={textColor}
          mb={1}
          letterSpacing="-0.5px"
        >
          Login to Your Account
        </Text>

        <Text fontSize="sm" color={subtextColor} mb={6}>
          Access your dashboard and manage your tools
        </Text>

        {loginMessage && (
          <Box
            mb={4}
            p={3}
            borderRadius="12px"
            bg="rgba(217, 119, 6, 0.1)"
            border="1px solid"
            borderColor="rgba(217, 119, 6, 0.3)"
          >
            <Text fontSize="xs" color="rgb(180, 83, 9)">{loginMessage}</Text>
          </Box>
        )}

        {errorMsg && (
          <Box
            mb={4}
            p={3}
            borderRadius="12px"
            bg="rgba(220, 38, 38, 0.06)"
            border="1px solid"
            borderColor="rgba(220, 38, 38, 0.12)"
          >
            <Text fontSize="sm" color="rgb(153, 27, 27)">{errorMsg}</Text>
          </Box>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl id="username" isRequired>
              <Input
                type="text"
                name="username"
                placeholder="Email or Username"
                value={formData.username}
                onChange={handleInputChange}
                {...inputStyles}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  {...inputStyles}
                />
                <InputRightElement h="full" pr={2}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                    _hover={{ bg: "transparent", "& svg": { color: "#025b97" } }}
                    _active={{ bg: "transparent" }}
                    color={subtextColor}
                    transition="all 0.2s ease"
                  >
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <HStack w="full" justify="space-between" align="center" spacing={0}>
              <Checkbox
                name="rememberMe"
                isChecked={formData.rememberMe}
                onChange={handleInputChange}
                colorScheme="blue"
                size="sm"
                borderColor={inputBorder}
                // _checked={{
                //   bg: "#025b97 !important",
                //   borderColor: "#025b97 !important",
                // }}
              >
                <Text fontSize="xs" color={subtextColor} ml={1}>
                  Remember me
                </Text>
              </Checkbox>
              <Link href="/forgot-password" onClick={isModal ? onLoginSuccess : undefined}>
                <Text as="span" {...linkStyles}>
                  Forgot Password?
                </Text>
              </Link>
            </HStack>

            <Button
              type="submit"
              {...primaryButtonStyles}
              isDisabled={!formData.username || !formData.password || isLoading}
              isLoading={isLoading}
              loadingText="Signing in"
              spinnerPlacement="start"
              aria-label="Sign in"
              aria-busy={isLoading}
            >
              Sign In
            </Button>

            <HStack w="full" spacing={3}>
              <Box h="1px" flex={1} bg={dividerColor} />
              <Text fontSize="xs" color={subtextColor}>Or</Text>
              <Box h="1px" flex={1} bg={dividerColor} />
            </HStack>
          </VStack>
        </form>

        <HStack w="full" justify="center" mt={6} spacing={1}>
          <Text fontSize="xs" color={subtextColor}>
            Don&apos;t have an account?
          </Text>
          <Link href="/register" onClick={isModal ? onLoginSuccess : undefined}>
            <Text as="span" {...linkStyles} fontWeight="700">
              Sign up here
            </Text>
          </Link>
        </HStack>

        {!isModal && (
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        )}
      </Box>
    );

    if (isModal) {
      return loginForm;
    }

    const formPanel = (
      <Flex
        flex={{ base: 1, md: 0.5 }}
        direction="column"
        justify="center"
        align="center"
        px={{ base: 6, md: 8, lg: 10 }}
        py={{ base: 8, md: 12 }}
        minH={{ base: "auto", md: "100dvh" }}
        bg={bgGradient}
      >
        {loginForm}
      </Flex>
    );

    return <AuthSplitLayout>{formPanel}</AuthSplitLayout>;
  }
);

export default LoginContent;

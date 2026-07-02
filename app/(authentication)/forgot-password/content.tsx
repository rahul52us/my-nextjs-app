"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { AuthSplitLayout } from "../components/AuthCarousel";
import { useAuthFormStyles } from "../components/authFormStyles";

const ForgotPasswordContent = observer(() => {
  const { auth: { openNotification } } = stores;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    bgGradient,
    subtextColor,
    textColor,
    inputStyles,
    primaryButtonStyles,
    linkStyles,
  } = useAuthFormStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);

    try {
      // TODO: Call your forgot password API here
      // await forgotPassword({ email });

      openNotification({
        title: "Reset Link Sent",
        message: `A password reset link has been sent to ${email}. Please check your email.`,
        type: "success",
        duration: 3000,
      });

      setEmail("");
    } catch (error: any) {
      openNotification({
        title: "Request Failed",
        message: error?.response?.data?.message || "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formPanel = (
    <Flex
      flex={{ base: 1, md: 0.5 }}
      direction="column"
      justify="center"
      align="center"
      px={{ base: 4, md: 8, lg: 10 }}
      py={{ base: 4, md: 12 }}
      h={{ base: "100vh", md: "auto" }}
      minH={{ base: "100vh", md: "100dvh" }}
      bg={{ base: 'transparent', md: bgGradient }}
    >
      <Box
        w="full"
        maxW={{ base: "95vw", md: "520px" }}
        mx="auto"
        bg={{ base: "rgba(255,255,255,0.92)", md: "transparent" }}
        borderRadius={{ base: "28px", md: "0" }}
        p={{ base: 6, md: 6 }}
        border={{ base: "1px solid rgba(255,255,255,0.6)", md: "none" }}
        boxShadow={{ base: "0 24px 80px rgba(0,0,0,0.18)", md: "none" }}
        backdropFilter={{ base: "blur(20px)", md: "none" }}
        sx={{ WebkitBackdropFilter: { base: "blur(20px)", md: "none" } }}
        animation="slideIn 0.5s ease-out"
      >
        <Text
          fontSize="xs"
          fontWeight="600"
          color="#025b97"
          textTransform="uppercase"
          letterSpacing="1px"
          mb={2}
        >
          Recover Access
        </Text>

        <Text
          fontSize={{ base: "2xl", md: "2xl" }}
          fontWeight="700"
          color={textColor}
          mb={1}
          letterSpacing="-0.5px"
        >
          Forgot Password
        </Text>

        <Text fontSize="sm" color={subtextColor} mb={6}>
          Enter your email to receive a reset link
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...inputStyles}
              />
            </FormControl>

            <Button
              type="submit"
              {...primaryButtonStyles}
              isDisabled={!email || isLoading}
              isLoading={isLoading}
              loadingText="Sending..."
              aria-label="Send reset link"
            >
              Send Reset Link
            </Button>
          </VStack>
        </form>

        <HStack w="full" justify="center" mt={6} spacing={1}>
          <Text fontSize="xs" color={subtextColor}>
            Remembered your password?
          </Text>
          <Link href="/login">
            <Text as="span" {...linkStyles} fontWeight="700">
              Back to Login
            </Text>
          </Link>
        </HStack>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Box>
    </Flex>
  );

  return <AuthSplitLayout>{formPanel}</AuthSplitLayout>;
});

export default ForgotPasswordContent;

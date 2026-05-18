"use client";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Spinner,
  useColorModeValue,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import CustomButton from "../../component/common/CustomButton/CustomButton";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";

const ForgotPassword = observer(() => {
  const { auth: { openNotification } } = stores;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const cardBg = useColorModeValue("whiteAlpha.900", "rgba(15, 23, 42, 0.92)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("#0F172A", "whiteAlpha.900");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const accentBg = useColorModeValue("teal.50", "teal.900");
  const accentColor = useColorModeValue("teal.700", "teal.200");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              Security Center
            </Box>
            <Heading size="xl" lineHeight={1.1} color={headingColor}>
              Forgot Password
            </Heading>
            <Text color={textColor} maxW="lg">
              Enter your email address below and we'll send you a link to reset your password.
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  focusBorderColor="teal.500"
                  bg={inputBg}
                  color={useColorModeValue("gray.800", "white")}
                />
              </FormControl>

              <CustomButton
                type="submit"
                width="100%"
                colorScheme="teal"
                isDisabled={!email || isLoading}
              >
                {isLoading ? <Spinner size="sm" color="white" /> : "Send Reset Link"}
              </CustomButton>
            </Stack>
          </form>

          <Text mt={8} textAlign="center" color={textColor}>
            Remembered your password?{" "}
            <Link href="/login">
              <Text as="span" color={accentColor} fontWeight="semibold">
                Back to Login
              </Text>
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
});

export default ForgotPassword;
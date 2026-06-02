"use client";

import {
  Box,
  Flex,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  Spinner,
  useColorModeValue,
  VStack,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";

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
          <Box as="span" fontWeight="800">Tools</Box>
          <Box as="span" fontWeight="300" opacity={0.9}>sahayata</Box>
        </Text>
      </Box>
    </Flex>
  );
};

const ForgotPassword = observer(() => {
  const { auth: { openNotification } } = stores;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Theme support colors
  const cardBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("#1A202C", "white");
  const subtextColor = useColorModeValue("#718096", "gray.400");
  const inputBg = useColorModeValue("#f8f9fa", "gray.800");
  const inputTextColor = useColorModeValue("#1A202C", "white");

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
          <VStack spacing={1} align="center" mb={6}>
            <ToolsahayataLogo />
            <Heading size="lg" fontWeight="bold" color={textColor} textAlign="center" w="100%" mt={2}>
              Forgot Password
            </Heading>
            <Text fontSize="sm" color={subtextColor} textAlign="center">
              Enter your email to receive a reset link
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <Input
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <Button
                type="submit"
                bg="#0066fe"
                color="white"
                size="lg"
                w="full"
                h="52px"
                isLoading={isLoading}
                loadingText="Sending..."
                borderRadius="xl"
                fontSize="sm"
                fontWeight="bold"
                _hover={{ bg: '#0052cc', opacity: 0.95 }}
                _active={{ bg: '#004099' }}
                mt={2}
              >
                Send Reset Link
              </Button>
            </Stack>
          </form>

          <VStack mt={6} align="center">
            <Text fontSize="xs" color={subtextColor}>
              Remembered your password?{" "}
              <Link href="/login">
                <Text as="span" color="#0066fe" fontWeight="semibold" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                  Back to Login
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
});

export default ForgotPassword;
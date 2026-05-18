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
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import CustomButton from "../../component/common/CustomButton/CustomButton";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const ResetPassword = observer(() => {
  const { auth: { openNotification } } = stores;
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  const cardBg = useColorModeValue("whiteAlpha.900", "rgba(15, 23, 42, 0.92)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("#0F172A", "whiteAlpha.900");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const accentBg = useColorModeValue("teal.50", "teal.900");
  const accentColor = useColorModeValue("teal.700", "teal.200");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      openNotification({
        title: "Error",
        message: "Passwords do not match.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call your reset password API here
      // await resetPassword({ newPassword: formData.newPassword });

      openNotification({
        title: "Password Reset Successful",
        message: "You can now log in with your new password.",
        type: "success",
        duration: 3000,
      });

      setFormData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      openNotification({
        title: "Reset Failed",
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
              Account Security
            </Box>
            <Heading size="xl" lineHeight={1.1} color={headingColor}>
              Reset Password
            </Heading>
            <Text color={textColor} maxW="lg">
              Enter and confirm your new password below to securely update your account access.
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="newPassword" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>
                  New Password
                </FormLabel>
                <Input
                  type="password"
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  bg={inputBg}
                  color={useColorModeValue("gray.800", "white")}
                />
              </FormControl>

              <FormControl id="confirmPassword" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>
                  Confirm New Password
                </FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  bg={inputBg}
                  color={useColorModeValue("gray.800", "white")}
                />
              </FormControl>

              <CustomButton
                type="submit"
                width="100%"
                colorScheme="teal"
                isDisabled={!formData.newPassword || !formData.confirmPassword || isLoading}
              >
                {isLoading ? <Spinner size="sm" color="white" /> : "Reset Password"}
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

export default ResetPassword;
"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
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
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { AuthSplitLayout } from "../components/AuthCarousel";
import { useAuthFormStyles } from "../components/authFormStyles";

const ResetPasswordContent = observer(() => {
  const { auth: { openNotification } } = stores;
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const {
    bgGradient,
    subtextColor,
    textColor,
    inputStyles,
    primaryButtonStyles,
    linkStyles,
  } = useAuthFormStyles();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      <Box
        w="full"
        maxW="520px"
        bg="transparent"
        borderRadius="0"
        p={{ base: 4, md: 6 }}
        border="none"
        boxShadow="none"
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
          Secure Access
        </Text>

        <Text
          fontSize={{ base: "2xl", md: "2xl" }}
          fontWeight="700"
          color={textColor}
          mb={1}
          letterSpacing="-0.5px"
        >
          Reset Password
        </Text>

        <Text fontSize="sm" color={subtextColor} mb={6}>
          Enter your new secure password details
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl id="newPassword" isInvalid={!!errors.newPassword}>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
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
              {errors.newPassword && (
                <FormErrorMessage fontSize="xs" mt={1}>
                  {errors.newPassword}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  {...inputStyles}
                />
                <InputRightElement h="full" pr={2}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    size="sm"
                    _hover={{ bg: "transparent", "& svg": { color: "#025b97" } }}
                    _active={{ bg: "transparent" }}
                    color={subtextColor}
                    transition="all 0.2s ease"
                  >
                    {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {errors.confirmPassword && (
                <FormErrorMessage fontSize="xs" mt={1}>
                  {errors.confirmPassword}
                </FormErrorMessage>
              )}
            </FormControl>

            <Button
              type="submit"
              {...primaryButtonStyles}
              isLoading={isLoading}
              loadingText="Resetting..."
              isDisabled={
                !formData.newPassword ||
                !formData.confirmPassword ||
                isLoading
              }
            >
              Reset Password
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

export default ResetPasswordContent;

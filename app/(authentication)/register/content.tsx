'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import stores from '../../store/stores';

const validationSchema = Yup.object({
  name: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .optional(),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  termsAccepted: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const ToolsahayataLogo = () => {
  return (
    <Flex align="center" justify="center" mb={2}>
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

const RegisterContent = observer(() => {
  const {
    auth: { register, openNotification },
  } = stores;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const response: any = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      openNotification({
        title: 'Registration Successful',
        message: response?.message || 'Account created successfully.',
        type: 'success',
        duration: 3000,
      });
      resetForm();
      router.push('/tools/workflow');
    } catch (error: any) {
      openNotification({
        title: 'Registration Failed',
        message: error?.response?.data?.message || 'Unable to create account.',
        type: 'error',
      });
    }
  };

  // Theme support colors
  const cardBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("#1A202C", "white");
  const subtextColor = useColorModeValue("#718096", "gray.400");
  const inputBg = useColorModeValue("#f8f9fa", "gray.800");
  const inputTextColor = useColorModeValue("#1A202C", "white");

  return (
    <Box minHeight="auto" px={2}>
      <Flex align="center" justify="center">
        <Box
          width="100%"
          maxWidth="520px"
          bg={cardBg}
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          boxShadow="2xl"
        >
          <VStack spacing={1} textAlign="center" mb={6}>
            <ToolsahayataLogo />
            <Heading size="lg" fontWeight="bold" color={textColor} mt={2}>
              Create an account
            </Heading>
            <Text fontSize="sm" color={subtextColor}>
              Join us to optimize your automation platform
            </Text>
          </VStack>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Stack spacing={4}>
                  <FormControl id="name" isInvalid={!!(touched.name && errors.name)}>
                    <Field
                      as={Input}
                      type="text"
                      name="name"
                      placeholder="FULL NAME"
                      focusBorderColor="blue.500"
                      bg={inputBg}
                      border="none"
                      borderRadius="xl"
                      h="50px"
                      px={4}
                      fontSize="sm"
                      color={inputTextColor}
                      _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
                    />
                    <FormErrorMessage>
                      <ErrorMessage name="name" />
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="email" isInvalid={!!(touched.email && errors.email)}>
                    <Field
                      as={Input}
                      type="email"
                      name="email"
                      placeholder="EMAIL ADDRESS"
                      focusBorderColor="blue.500"
                      bg={inputBg}
                      border="none"
                      borderRadius="xl"
                      h="50px"
                      px={4}
                      fontSize="sm"
                      color={inputTextColor}
                      _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
                    />
                    <FormErrorMessage>
                      <ErrorMessage name="email" />
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="phone" isInvalid={!!(touched.phone && errors.phone)}>
                    <Field
                      as={Input}
                      type="tel"
                      name="phone"
                      placeholder="PHONE NUMBER"
                      focusBorderColor="blue.500"
                      bg={inputBg}
                      border="none"
                      borderRadius="xl"
                      h="50px"
                      px={4}
                      fontSize="sm"
                      color={inputTextColor}
                      _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
                    />
                    <FormErrorMessage>
                      <ErrorMessage name="phone" />
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="password" isInvalid={!!(touched.password && errors.password)}>
                    <Field name="password">
                      {({ field }: any) => (
                        <InputGroup>
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="PASSWORD"
                            focusBorderColor="blue.500"
                            bg={inputBg}
                            border="none"
                            borderRadius="xl"
                            h="50px"
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
                      )}
                    </Field>
                    <FormErrorMessage>
                      <ErrorMessage name="password" />
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="confirmPassword"
                    isInvalid={!!(touched.confirmPassword && errors.confirmPassword)}
                  >
                    <Field name="confirmPassword">
                      {({ field }: any) => (
                        <InputGroup>
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="CONFIRM PASSWORD"
                            focusBorderColor="blue.500"
                            bg={inputBg}
                            border="none"
                            borderRadius="xl"
                            h="50px"
                            px={4}
                            fontSize="sm"
                            color={inputTextColor}
                            _placeholder={{ color: '#A0AEC0', fontWeight: '500' }}
                          />
                          <InputRightElement h="full" pr={2}>
                            <Button
                              variant="ghost"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              size="sm"
                              _hover={{ bg: 'transparent' }}
                              _active={{ bg: 'transparent' }}
                            >
                              {showConfirmPassword ? <ViewOffIcon color="gray.500" /> : <ViewIcon color="gray.500" />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      )}
                    </Field>
                    <FormErrorMessage>
                      <ErrorMessage name="confirmPassword" />
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!(touched.termsAccepted && errors.termsAccepted)}
                    display="flex"
                    alignItems="center"
                    pt={1}
                  >
                    <Field name="termsAccepted">
                      {({ field }: any) => (
                        <Checkbox {...field} isChecked={field.value} colorScheme="blue" color={useColorModeValue("#4A5568", "gray.300")} fontSize="xs">
                          I accept the{' '}
                          <Link href="/terms" style={{ color: '#0066fe', textDecoration: 'underline' }}>
                            Terms and Conditions
                          </Link>
                        </Checkbox>
                      )}
                    </Field>
                    <FormErrorMessage ml={2}>
                      <ErrorMessage name="termsAccepted" />
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    bg="#0066fe"
                    color="white"
                    size="lg"
                    w="full"
                    h="52px"
                    isLoading={isSubmitting}
                    loadingText="Registering..."
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="bold"
                    _hover={{ bg: '#0052cc', opacity: 0.95 }}
                    _active={{ bg: '#004099' }}
                    mt={2}
                  >
                    Register
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <VStack mt={6} align="center">
            <Text fontSize="xs" color={subtextColor}>
              Already have an account?{' '}
              <Link href="/login">
                <Text as="span" color="#0066fe" fontWeight="semibold" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                  Login
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
});

export default RegisterContent;

'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
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

  const cardBg = useColorModeValue('whiteAlpha.900', 'rgba(15, 23, 42, 0.92)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('#0F172A', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const accentBg = useColorModeValue('teal.50', 'teal.900');
  const accentColor = useColorModeValue('teal.700', 'teal.200');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const checkboxColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box minHeight="auto" px={4} py={{ base: 6, md: 4 }}>
      <Flex align="center" justify="center">
        <Box
          width="100%"
          maxWidth="680px"
          bg={cardBg}
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={4} textAlign="center" mb={6}>
            <Box
              display="inline-flex"
              px={3}
              py={1}
              bg={accentBg}
              color={accentColor}
              borderRadius="full"
              fontWeight="semibold"
              fontSize="sm"
            >
              Join the community
            </Box>
            <Heading size="xl" color={headingColor}>
              Create an account
            </Heading>
            <Text maxW="lg" color={textColor}>
              Fill in the details below to register and start using your workflow tools immediately.
            </Text>
          </VStack>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Stack spacing={5}>
                  <FormControl id="name" isInvalid={!!(touched.name && errors.name)}>
                    <FormLabel color={labelColor}>Full Name <Text as="span" color="red.500">*</Text></FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      focusBorderColor="teal.500"
                      bg={inputBg}
                      color={useColorModeValue('gray.800','white')}
                    />
                    <FormErrorMessage>
                      <ErrorMessage name="name" />
                    </FormErrorMessage>
                  </FormControl>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <FormControl id="email" isInvalid={!!(touched.email && errors.email)}>
                      <FormLabel color={labelColor}>Email Address <Text as="span" color="red.500">*</Text></FormLabel>
                      <Field
                        as={Input}
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        focusBorderColor="teal.500"
                        bg={inputBg}
                        color={useColorModeValue('gray.800','white')}
                      />
                      <FormErrorMessage>
                        <ErrorMessage name="email" />
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl id="phone" isInvalid={!!(touched.phone && errors.phone)}>
                      <FormLabel color={labelColor}>Phone Number</FormLabel>
                      <Field
                        as={Input}
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        focusBorderColor="teal.500"
                        bg={inputBg}
                        color={useColorModeValue('gray.800','white')}
                      />
                      <FormErrorMessage>
                        <ErrorMessage name="phone" />
                      </FormErrorMessage>
                    </FormControl>
                  </Stack>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <FormControl id="password" isInvalid={!!(touched.password && errors.password)}>
                      <FormLabel color={labelColor}>Password <Text as="span" color="red.500">*</Text></FormLabel>
                      <Field name="password">
                        {({ field }: any) => (
                          <InputGroup>
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              focusBorderColor="teal.500"
                              bg={inputBg}
                              color={useColorModeValue('gray.800','white')}
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
                      <FormLabel color={labelColor}>Confirm Password <Text as="span" color="red.500">*</Text></FormLabel>
                      <Field name="confirmPassword">
                        {({ field }: any) => (
                          <InputGroup>
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm password"
                              focusBorderColor="teal.500"
                              bg={inputBg}
                              color={useColorModeValue('gray.800','white')}
                            />
                            <InputRightElement h="full">
                              <Button
                                variant="ghost"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                size="sm"
                                _hover={{ bg: 'transparent', opacity: 0.8 }}
                                _active={{ bg: 'transparent' }}
                              >
                                {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                        )}
                      </Field>
                      <FormErrorMessage>
                        <ErrorMessage name="confirmPassword" />
                      </FormErrorMessage>
                    </FormControl>
                  </Stack>

                  <FormControl
                    isInvalid={!!(touched.termsAccepted && errors.termsAccepted)}
                    display="flex"
                    alignItems="center"
                  >
                    <Field name="termsAccepted">
                      {({ field }: any) => (
                        <Checkbox {...field} isChecked={field.value} colorScheme="teal" color={checkboxColor}>
                          I accept the{' '}
                          <Link href="/terms" style={{ color: '#065F68', textDecoration: 'underline' }}>
                            Terms and Conditions
                          </Link>
                        </Checkbox>
                      )}
                    </Field>
                    <FormErrorMessage>
                      <ErrorMessage name="termsAccepted" />
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    w="full"
                    isLoading={isSubmitting}
                    loadingText="Registering..."
                    borderRadius="xl"
                  >
                    Register
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <Text mt={6} textAlign="center" color={textColor}>
            Already have an account?{' '}
            <Link href="/login">
              <Text as="span" color={accentColor} fontWeight="semibold">
                Login
              </Text>
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
});

export default RegisterContent;

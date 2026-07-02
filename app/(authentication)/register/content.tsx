'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import stores from '../../store/stores';
import { AuthSplitLayout } from '../components/AuthCarousel';
import { useAuthFormStyles } from '../components/authFormStyles';

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
  const { auth: { register, openNotification } } = stores;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    bgGradient,
    inputBorder,
    subtextColor,
    textColor,
    inputStyles,
    primaryButtonStyles,
    linkStyles,
  } = useAuthFormStyles();

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

  const formPanel = (
    <Flex
      flex={{ base: 1, md: 0.5 }}
      direction="column"
      justify="center"
      align="center"
      px={{ base: 4, md: 8, lg: 10 }}
      py={{ base: 4, md: 12 }}
      h={{ base: '100vh', md: 'auto' }}
      minH={{ base: '100vh', md: '100dvh' }}
      bg={{ base: 'transparent', md: bgGradient }}
    >
      <Box
        w="full"
        maxW={{ base: "95vw", md: "620px" }}
        mx="auto"
        mt={{ base: "24px", md: "0" }}
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
          Welcome Onboard
        </Text>

        <Text
          fontSize={{ base: '2xl', md: '2xl' }}
          fontWeight="700"
          color={textColor}
          mb={1}
          letterSpacing="-0.5px"
        >
          Create an account
        </Text>

        <Text fontSize="sm" color={subtextColor} mb={6}>
          Join us to optimize your automation platform
        </Text>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl id="name" isInvalid={!!(touched.name && errors.name)}>
                  <Field
                    as={Input}
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    {...inputStyles}
                  />
                  <FormErrorMessage fontSize="xs">
                    <ErrorMessage name="name" />
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="email" isInvalid={!!(touched.email && errors.email)}>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    {...inputStyles}
                  />
                  <FormErrorMessage fontSize="xs">
                    <ErrorMessage name="email" />
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="phone" isInvalid={!!(touched.phone && errors.phone)}>
                  <Field
                    as={Input}
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (optional)"
                    {...inputStyles}
                  />
                  <FormErrorMessage fontSize="xs">
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
                          placeholder="Password"
                          {...inputStyles}
                        />
                        <InputRightElement h="full" pr={2}>
                          <Button
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            size="sm"
                            _hover={{ bg: 'transparent', '& svg': { color: '#025b97' } }}
                            _active={{ bg: 'transparent' }}
                            color={subtextColor}
                            transition="all 0.2s ease"
                          >
                            {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    )}
                  </Field>
                  <FormErrorMessage fontSize="xs">
                    <ErrorMessage name="password" />
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="confirmPassword" isInvalid={!!(touched.confirmPassword && errors.confirmPassword)}>
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <InputGroup>
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          {...inputStyles}
                        />
                        <InputRightElement h="full" pr={2}>
                          <Button
                            variant="ghost"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            size="sm"
                            _hover={{ bg: 'transparent', '& svg': { color: '#025b97' } }}
                            _active={{ bg: 'transparent' }}
                            color={subtextColor}
                            transition="all 0.2s ease"
                          >
                            {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    )}
                  </Field>
                  <FormErrorMessage fontSize="xs">
                    <ErrorMessage name="confirmPassword" />
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!(touched.termsAccepted && errors.termsAccepted)}
                  display="flex"
                  alignItems="center"
                  w="full"
                >
                  <Field name="termsAccepted">
                    {({ field }: any) => (
                      <Checkbox
                        {...field}
                        isChecked={field.value}
                        colorScheme="blue"
                        size="sm"
                        borderColor={inputBorder}
                        // _checked={{
                        //   bg: '#025b97 !important',
                        //   borderColor: '#025b97 !important',
                        // }}
                      >
                        <Text fontSize="xs" color={subtextColor} ml={1}>
                          I accept the{' '}
                          <Link href="/terms">
                            <Text
                              as="span"
                              {...linkStyles}
                              fontWeight="600"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Terms and Conditions
                            </Text>
                          </Link>
                        </Text>
                      </Checkbox>
                    )}
                  </Field>
                  <FormErrorMessage ml={2} fontSize="xs">
                    <ErrorMessage name="termsAccepted" />
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  {...primaryButtonStyles}
                  isLoading={isSubmitting}
                  loadingText="Registering..."
                >
                  Register
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>

        <HStack w="full" justify="center" mt={6} spacing={1}>
          <Text fontSize="xs" color={subtextColor}>
            Already have an account?
          </Text>
          <Link href="/login">
            <Text as="span" {...linkStyles} fontWeight="700">
              Login here
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

export default RegisterContent;

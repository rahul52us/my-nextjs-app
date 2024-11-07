import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Text,
  useToast,
  Divider,
  Icon,
  useTheme,
  FormErrorMessage,
} from "@chakra-ui/react";
import { FaCreditCard, FaMobileAlt } from "react-icons/fa";
import axios from "axios"; // Import axios for making API calls
import { backendBaseUrl } from "../../constant/urls"; // Import your backend base URL

const PaymentForm = () => {
  const toast = useToast();
  const theme = useTheme();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const validationErrors: any = {};
    if (!paymentMethod) {
      validationErrors.paymentMethod = "Select a payment method";
    }

    if (paymentMethod === "card") {
      if (!cardNumber) {
        validationErrors.cardNumber = "Card number is required";
      } else if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        validationErrors.cardNumber = "Card number must be 16 digits and only digits";
      }

      if (!expiry) {
        validationErrors.expiry = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        validationErrors.expiry = "Format: MM/YY";
      }

      if (!cvv) {
        validationErrors.cvv = "CVV is required";
      } else if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        validationErrors.cvv = "CVV must be 3 digits and only digits";
      }
    }

    if (paymentMethod === "upi") {
      if (!upiId) {
        validationErrors.upiId = "UPI ID is required";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
        validationErrors.upiId = "Invalid UPI ID format";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      paymentMethod,
      cardNumber,
      expiry,
      cvv,
      upiId,
    };

    try {
      const response = await axios.post(`${backendBaseUrl}/your/payment/api/endpoint`, paymentData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(process.env.REACT_APP_AUTHORIZATION_TOKEN as string)}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast({
          title: "Payment Successful",
          description: response.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error : any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Reset form fields
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setUpiId("");
    setPaymentMethod("card");
    setErrors({});
  };

  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      maxWidth="500px"
      mx="auto"
      bg={theme.colors.white}
      borderColor="teal.300"
      transition="0.3s"
    >
      <Text fontSize="2xl" mb={6} textAlign="center" fontWeight="bold" color="teal.600">
        Payment Form
      </Text>
      <Divider mb={4} />
      <form onSubmit={handlePaymentSubmit}>
        <FormControl mb={4} isInvalid={!!errors.paymentMethod}>
          <FormLabel fontWeight="semibold" color="teal.600">Payment Method</FormLabel>
          <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
            <HStack spacing={10} justify="center">
              <Radio value="card" colorScheme="teal" size="lg">
                <HStack spacing={2}>
                  <Icon as={FaCreditCard} boxSize={5} />
                  <Text fontWeight="medium" fontSize="lg">Credit/Debit Card</Text>
                </HStack>
              </Radio>
              <Radio value="upi" colorScheme="teal" size="lg">
                <HStack spacing={2}>
                  <Icon as={FaMobileAlt} boxSize={5} />
                  <Text fontWeight="medium" fontSize="lg">UPI</Text>
                </HStack>
              </Radio>
            </HStack>
          </RadioGroup>
          <FormErrorMessage>{errors.paymentMethod}</FormErrorMessage>
        </FormControl>

        {paymentMethod === "card" && (
          <VStack spacing={4} mb={4} p={4} borderWidth={1} borderColor="teal.200" borderRadius="md" bg="teal.50">
            <FormControl isInvalid={!!errors.cardNumber}>
              <FormLabel color="teal.600">Card Number</FormLabel>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9123 4567"
                borderColor="teal.500"
                size="lg"
                _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.200" }}
              />
              <FormErrorMessage>{errors.cardNumber}</FormErrorMessage>
            </FormControl>
            <HStack spacing={4} width="full">
              <FormControl isInvalid={!!errors.expiry}>
                <FormLabel color="teal.600">Expiry Date (MM/YY)</FormLabel>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  borderColor="teal.500"
                  size="lg"
                  _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.200" }}
                />
                <FormErrorMessage>{errors.expiry}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.cvv}>
                <FormLabel color="teal.600">CVV</FormLabel>
                <Input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  borderColor="teal.500"
                  size="lg"
                  _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.200" }}
                />
                <FormErrorMessage>{errors.cvv}</FormErrorMessage>
              </FormControl>
            </HStack>
          </VStack>
        )}

        {paymentMethod === "upi" && (
          <FormControl isInvalid={!!errors.upiId}>
            <FormLabel color="teal.600">UPI ID</FormLabel>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              borderColor="teal.500"
              size="lg"
              _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.200" }}
            />
            <FormErrorMessage>{errors.upiId}</FormErrorMessage>
          </FormControl>
        )}

        <Button
          type="submit"
          colorScheme="teal"
          mt={4}
          width="full"
          size="lg"
          boxShadow="sm"
          _hover={{ bg: "teal.600", boxShadow: "md" }}
          transition="background-color 0.2s, box-shadow 0.2s"
        >
          Submit Payment
        </Button>
      </form>
    </Box>
  );
};

export default PaymentForm;

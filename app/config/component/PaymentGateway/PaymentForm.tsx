import {
  Box,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  HStack,
  Image,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FaRupeeSign, FaPaypal, FaRegCreditCard } from "react-icons/fa";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { RiBankLine } from "react-icons/ri";

const accordionStyles = {
  expanded: {
    bg: "blue.50",
  },
  button: {
    borderRadius: "2xl",
    borderWidth: 1,
    p: 3,
    mb: 4,
    transition: "all 0.2s ease",
  },
  icon: {
    boxSize: 6,
    mr: 2,
  },
};

const PaymentMethodSection = ({ icon, title, children }: any) => (
  <AccordionItem border="none">
    <AccordionButton
      _expanded={accordionStyles.expanded}
      borderRadius={accordionStyles.button.borderRadius}
      borderWidth={accordionStyles.button.borderWidth}
      p={accordionStyles.button.p}
      mb={accordionStyles.button.mb}
      transition={accordionStyles.button.transition}
    >
      <Icon as={icon} {...accordionStyles.icon} />
      <Box flex="1" textAlign="left">
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel pb={4} px={4}>
      {children}
    </AccordionPanel>
  </AccordionItem>
);

const PaymentMethods = () => (
  <Box borderWidth={1} borderRadius="xl" p={6} boxShadow="md" bg="white">
    <Accordion allowToggle defaultIndex={[0]}>
      <PaymentMethodSection icon={MdKeyboardDoubleArrowRight} title="UPI">
        <VStack spacing={4} align="stretch">
          <Text fontSize="md" color="gray.600">
            Scan the QR code or use the UPI ID to complete your payment.
          </Text>
          <Box
            borderWidth={1}
            borderRadius="md"
            p={4}
            bg="gray.50"
            textAlign="center"
          >
            <Image
              src="https://via.placeholder.com/150" // Replace with your QR code image URL
              alt="UPI QR Code"
              mx="auto"
              mb={4}
            />
            <Text fontSize="md" fontWeight="bold">
              UPI ID:
            </Text>
            <Text fontSize="md">example@upi</Text>
          </Box>
          <Button colorScheme="blue">Pay with UPI</Button>
        </VStack>
      </PaymentMethodSection>

      <PaymentMethodSection icon={FaRegCreditCard} title="Credit/Debit Card">
        <VStack spacing={4} align="stretch">
          <FormControl id="cardNumber">
            <FormLabel>Card Number</FormLabel>
            <Input type="text" placeholder="1234 5678 9012 3456" />
          </FormControl>
          <HStack spacing={4}>
            <FormControl id="expiryDate">
              <FormLabel>Expiry Date</FormLabel>
              <Input type="text" placeholder="MM/YY" />
            </FormControl>
            <FormControl id="cvv">
              <FormLabel>CVV</FormLabel>
              <Input type="text" placeholder="123" />
            </FormControl>
          </HStack>
          <Button colorScheme="blue">Pay Now</Button>
        </VStack>
      </PaymentMethodSection>

      <PaymentMethodSection icon={FaPaypal} title="PayPal">
        <VStack spacing={4} align="stretch">
          <Text fontSize="md" color="gray.600">
            You will be redirected to PayPal to complete your payment.
          </Text>
          <Button colorScheme="blue">Pay with PayPal</Button>
        </VStack>
      </PaymentMethodSection>

      <PaymentMethodSection icon={RiBankLine} title="Net Banking">
        <VStack spacing={4} align="stretch">
          <Text fontSize="md" color="gray.600">
            Select your bank and follow the instructions to complete the
            payment.
          </Text>
          <Button colorScheme="blue">Proceed with Net Banking</Button>
        </VStack>
      </PaymentMethodSection>

      <PaymentMethodSection icon={FaRupeeSign} title="Bank Transfer">
        <VStack spacing={4} align="stretch">
          <Text fontSize="md" color="gray.600">
            Transfer the amount to the following bank account:
          </Text>
          <Box borderWidth={1} borderRadius="md" p={3} bg="gray.50">
            <Text fontSize="md" fontWeight="bold">
              Bank Name:
            </Text>
            <Text fontSize="md">Your Bank</Text>
            <Text fontSize="md" fontWeight="bold">
              Account Number:
            </Text>
            <Text fontSize="md">1234567890</Text>
            <Text fontSize="md" fontWeight="bold">
              IFSC Code:
            </Text>
            <Text fontSize="md">YOURIFSC</Text>
          </Box>
          <Button colorScheme="blue">Submit Payment</Button>
        </VStack>
      </PaymentMethodSection>
    </Accordion>
  </Box>
);

export default observer(PaymentMethods);

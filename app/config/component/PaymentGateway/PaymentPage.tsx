import { Container, Grid, Box } from "@chakra-ui/react";
import {OrderSummary} from "./OrderSummary";
import PaymentMethods from "./PaymentForm";
// import PaymentMethods from "./PaymentMethods";

const course = {
  name: "React for Beginners",
  price: 499,
  description: "A comprehensive course on React.js for beginners."
};

const PaymentPage = () => (
  <Container maxW="container.xl" my={8}>
    <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap={6}>
      <Box>
        <PaymentMethods />
      </Box>
      <Box>
        <OrderSummary course={course} />
      </Box>
    </Grid>
  </Container>
);

export default PaymentPage;

import { Box } from "@chakra-ui/react";
import EcomHomePage from "./Ecom_Home/EcomHomePage";
import { observer } from "mobx-react-lite";
import PaymentForm from "../../../config/component/PaymentForm/PaymentForm";

const Ecommerce = () => {
  return (
    <Box>
      <Box>
        <EcomHomePage />
        <PaymentForm />
      </Box>
    </Box>
  );
};

export default observer(Ecommerce);

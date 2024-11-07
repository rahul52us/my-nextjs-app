import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@chakra-ui/react";
import store from "../../../store/store";
import { backendBaseUrl } from "../../constant/urls";

// Define TypeScript interfaces for the payment options and user info
interface UserInfo {
  name: string;
  email: string;
  contact: string;
  refrenceOrderId:string
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  method: {
    netbanking: boolean;
    upi: boolean;
    card: boolean;
    wallet: boolean;
    emi: boolean;
  };
}

const useRazorpay = () => {
  const {
    auth: { openNotification },
  } = store;
  const theme = useTheme();
  const tealColor = theme.colors.teal[500]; // This will give you the teal color code
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js"; // Razorpay SDK URL
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);

  const createOrderPayment = async (datas: any): Promise<any> => {
    try {
      const { data } = await axios.post(
        `${backendBaseUrl}/order/create/payment`,
        { ...datas },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem(process.env.REACT_APP_AUTHORIZATION_TOKEN as string)
            }`,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  };

  const handlePayment = async (
    amount: number,
    userInfo: UserInfo
  ): Promise<void> => {
    if (!isScriptLoaded) {
      alert("Razorpay SDK is not loaded yet");
      return;
    }

    try {
      const order : any = await createOrderPayment({amount : amount, refrenceOrderId : userInfo.refrenceOrderId})
      const options: RazorpayOptions = {
        key: "rzp_test_0XDl7Od4MRUktB",
        amount: order.amount,
        currency: order.currency,
        name: userInfo.name,
        image: process.env.WEB_LOGO!,
        description: "Test Transaction",
        order_id: order?.data?.id,
        handler: async (response) => {
          try {
            const { data } = await axios.post(
              `${backendBaseUrl}/order/verify/payment`,
              { ...response },
              {
                headers: {
                  Authorization: `Bearer ${
                    localStorage.getItem(process.env.REACT_APP_AUTHORIZATION_TOKEN as string)
                  }`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (data.status === "success") {
              openNotification({
                title: "Payment Success",
                message: data?.message,
                type: "success",
              });
            } else {
              openNotification({
                title: "Payment Failed",
                message: data?.message,
                type: "success",
              });
            }
          } catch (error) {
            throw new Error("Failed to create order");
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.contact,
        },
        theme: {
          color: tealColor,
        },
        method: {
          netbanking: true,
          upi: true,
          card: true,
          wallet: true,
          emi: true,
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Payment initiation failed");
    }
  };

  return { handlePayment };
};

export default useRazorpay;
import React from "react";
import { Box, Text, Flex, Tag } from "@chakra-ui/react";

interface PriceProps {
  price: number;
  currency?: string;
  discount?: number; // Discount in percentage
}

const PriceDisplay: React.FC<PriceProps> = ({
  price,
  currency = "$",
  discount,
}) => {
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      w="fit-content"
      // maxW="500px"
      gap={4}
      // mx="auto"
      fontFamily="Arial, sans-serif"
    >
      <Flex alignItems="center">
        {discount && (
          <Tag size={"sm"} colorScheme="green" mr={4}>
            {discount}% OFF
          </Tag>
        )}
        <Box>
          <Text
            fontWeight="500"
            color="gray"
            fontSize={"xl"}
            textDecoration={discount ? "line-through" : "none"}
          >
            {currency}
            {price.toFixed(2)}
          </Text>
        </Box>
      </Flex>

      {discount && (
        <Text fontSize="2xl" fontWeight="bold">
          {currency}
          {discountedPrice.toFixed(2)}
        </Text>
      )}
    </Flex>
  );
};

export default PriceDisplay;

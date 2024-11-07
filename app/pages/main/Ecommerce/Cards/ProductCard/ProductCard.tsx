import {
  Badge,
  Box,
  Flex,
  HStack,
  Image,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { web } from "../../../../../config/constant/routes";

const ProductCard = ({ product }: any) => {
  const navigate = useNavigate();

  return (
    <Box
      cursor={"pointer"}
      overflow="hidden"
      rounded={8}
      position="relative"
      borderWidth={1}
      bg={useColorModeValue("whiteAlpha.800", "blackAlpha.500")}
      boxShadow="base"
      // backdropFilter="blur(10px)"
      pb={2}
      onClick={() => {
        navigate(`${web.ecommerce.products}/${product?.product_id}`);
      }}
    >
      <Box h="300px" overflow="hidden" position="relative" p={1}>
        <Image
          src={product?.product_photos[0]}
          alt={product?.product_title}
          objectFit="contain"
          height="100%"
          width="100%"
          transition="transform 0.3s"
          _hover={{ transform: "scale(1.1)" }}
        />
        {product.isNew && (
          <Badge
            position="absolute"
            top="10px"
            variant={"outline"}
            left="10px"
            borderRadius="full"
            size={"sm"}
            px="3"
            py="1"
            colorScheme="pink"
          >
            New
          </Badge>
        )}
      </Box>

      <Box p="2" px={4}>
        <VStack align="start" mt="2">
          <Flex justify={"space-between"} w={"100%"} gap={1}>
            <Box>
              <Text as="h3" fontWeight="500" noOfLines={2} w={"100%"}>
                {product?.product_title}
              </Text>
              <Text color={"gray"} fontSize={"sm"}>
                {product?.offer?.store_name}
              </Text>
            </Box>
            <Text fontSize="lg" fontWeight="500" color={"blue.700"}>
              {product?.offer?.price}
            </Text>
          </Flex>
          <HStack align="center">
            <Box as="span" color="blue.500">
              ★ {product?.product_rating}
            </Box>
            <Text fontSize="sm" color="gray.500">
              ({product?.product_num_reviews} reviews)
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default ProductCard;

import { Box, Text, VStack, Image, HStack, Heading } from "@chakra-ui/react";

const ColorOptions = ({ colors }: { colors: any[] }) => {
  return (
    <Box>
      <Heading mb={4} size={'sm'}>Available Colors</Heading>
      <HStack spacing={4}>
        {colors.map((color, index) => (
          <VStack key={index} align="center">
            <Box
              boxSize="80px"
              rounded="base"
              borderWidth="2px"
              borderColor="gray.300"
              overflow="hidden"
              boxShadow="md"
              cursor={"pointer"}
              _hover={{ transform: "scale(1.05)" }}
              transition="0.3s ease"
            >
              <Image
                src={color.image_url}
                alt={color.color}
                objectFit="cover"
                boxSize="full"
              />
            </Box>
            <Text fontSize="md" color="gray.600" fontWeight="medium">
              {color.color}
            </Text>
          </VStack>
        ))}
      </HStack>
    </Box>
  );
};

// Example usage with dummy data
// const productColors = [
//   {
//     color_name: "Phantom Black",
//     image_url: "https://example.com/images/phantom-black.jpg"
//   },
//   {
//     color_name: "Phantom Silver",
//     image_url: "https://example.com/images/phantom-silver.jpg"
//   },
//   {
//     color_name: "Phantom Violet",
//     image_url: "https://example.com/images/phantom-violet.jpg"
//   },
//   {
//     color_name: "Phantom Pink",
//     image_url: "https://example.com/images/phantom-pink.jpg"
//   }
// ];

// const ProductPage = () => (
//   <Box p={6}>
//     <ColorOptions colors={productColors} />
//   </Box>
// );

export default ColorOptions;

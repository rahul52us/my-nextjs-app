import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  Badge,
  HStack,
} from "@chakra-ui/react";

export const OrderSummary = ({ course }: any) => (
  <Box borderWidth={1} borderRadius="xl" p={6} boxShadow="lg" bg="gray.100">
    <VStack spacing={4} align="start">
      <Heading size="lg">{course.name}</Heading>
      <Text fontSize="2xl" fontWeight="bold">
        Price: ₹{course.price}
      </Text>
      <Divider />
      <Text fontSize="md" color="gray.600">
        Description: {course.description}
      </Text>
      <Badge colorScheme="green" fontSize="md">
        Available
      </Badge>
      <HStack spacing={4} mt={4}>
        <Text fontSize="lg" fontWeight="semibold">
          Total:
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          ₹{course.price}
        </Text>
      </HStack>
    </VStack>
  </Box>
);

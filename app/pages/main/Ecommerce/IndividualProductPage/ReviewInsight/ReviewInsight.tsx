import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from "@chakra-ui/react";

const ReviewInsights = ({ reviewsInsights }:any) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const positiveColor = useColorModeValue("green.400", "green.300");
  const negativeColor = useColorModeValue("red.400", "red.300");

  return (
    <Box >
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Product Review Insights
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {reviewsInsights.map((insight:any, index:number) => {
          const totalFeedback = insight.positive_count + insight.negative_count;
          const positivePercentage = Math.round(
            (insight.positive_count / totalFeedback) * 100
          );

          return (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="md"
              bg={bgColor}
              _hover={{ bg: hoverBgColor }}
              transition="background-color 0.3s"
            >
              <VStack spacing={2} align="stretch">
                {/* Header: Attribute Name */}
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading as="h4" size="md" color="teal.500">
                    {insight.attribute}
                  </Heading>
                  <Tooltip label={`${totalFeedback} reviews`} fontSize="md">
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">
                      {totalFeedback} reviews
                    </Text>
                  </Tooltip>
                </Flex>

                <Divider />

                {/* Stats with Icons */}
                <HStack justifyContent="space-between">
                  <VStack>
                    <Icon as={CheckCircleIcon} color={positiveColor} boxSize={8} />
                    <Text fontSize="lg" color={positiveColor}>
                      {insight.positive_count}
                    </Text>
                    <Badge colorScheme="green">{insight.positive}</Badge>
                  </VStack>

                  <VStack>
                    <Icon as={WarningIcon} color={negativeColor} boxSize={8} />
                    <Text fontSize="lg" color={negativeColor}>
                      {insight.negative_count}
                    </Text>
                    <Badge colorScheme="red">{insight.negative}</Badge>
                  </VStack>
                </HStack>

                <Text fontSize="sm" textAlign="center" color="gray.500" mt={4}>
                  {positivePercentage}% Positive
                </Text>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default ReviewInsights;

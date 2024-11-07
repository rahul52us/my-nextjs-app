import { useState, useEffect } from "react";
import { Box, Text, Flex, Icon, Spinner } from "@chakra-ui/react";
import { FiUsers } from "react-icons/fi";

const WidgetCard = ({
  totalCount,
  title,
  handleClick,
  loading,
}: {
  totalCount: number;
  title: string;
  handleClick: any;
  loading: boolean; // Changed the type to boolean
}) => {
  const [count, setCount] = useState(0);
  const intervalDelay = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < totalCount) {
        setCount(count + 1);
      }
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [count, totalCount]);

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      bgGradient="linear(to-r, #4FACFE, #2B8FF7)"
      boxShadow="lg"
      cursor="pointer"
      transition="transform 0.2s, box-shadow 0.2s"
      color="white"
      onClick={() => handleClick()}
    >
      {loading ? (
        <Flex height="110px" justifyContent="center">
        <Flex justifyContent="center" flexDirection="column">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="white"
          size="xl"
          transform="translate(-50%, -50%)"
        />
        </Flex>
        </Flex>
      ) : (
        <>
          <Text fontSize="md" fontWeight="semibold" mb={3}>
            {title}
          </Text>

          <Flex justify="space-between" alignItems="center" mb={1}>
            <Icon as={FiUsers} boxSize={8} mr={2} />
            <Text fontSize="3xl" fontWeight="bold">
              {count < totalCount ? count : totalCount}
            </Text>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <Text>completed orders</Text>
            <Text fontSize="sm" fontWeight="bold">
              {count < totalCount ? count : totalCount}
            </Text>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default WidgetCard;

import { Box, Flex, Icon, Text, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const NewWidgetCard = ({
  totalCount,
  title,
  loading,
  icon,
  handleClick,
}: {
  totalCount: number;
  title: string;
  handleClick: () => void; // Specify type for handleClick
  loading: boolean;
  icon: any;
}) => {
  const [count, setCount] = useState(0);

  // Define background colors for light and dark mode
  const cardBg = useColorModeValue("white", "#2D3748"); // White for light, dark gray for dark
  const textColor = useColorModeValue("gray.800", "gray.200");
  const countColor = useColorModeValue("blue.600", "cyan.400");
  const descriptionColor = useColorModeValue("gray.600", "gray.300");

  const intervalDelay = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < totalCount) {
        setCount((prevCount) => prevCount + 1); // Use functional state update for better performance
      }
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [count, totalCount]);

  return (
    <Box
      position="relative"
      onClick={handleClick}
      p={4}
      rounded="xl"
      shadow="md"
      bg={cardBg}
      _hover={{ transform: "scale(1.02)", shadow: "lg", bg: useColorModeValue("gray.100", "#4A5568") }} // Lighter background on hover
      transition="all 0.3s ease"
      cursor="pointer"
      w="full"
      borderWidth={1} // Optional: adds a border for better visual separation
      borderColor={useColorModeValue("gray.200", "gray.600")} // Border color based on theme
    >
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(255, 255, 255, 0.5)" // Slightly transparent white
          zIndex={1}
          rounded="xl"
        >
          <Spinner thickness="4px" size="xl" color="blue.500" />
        </Box>
      )}

      <Flex align="center" columnGap={5} justifyContent="space-around">
        {/* Icon on the left */}
        <Box
          bg={useColorModeValue("blue.500", "blue.700")} // Softer colors for the icon container
          w={16}
          h={16}
          display="flex"
          alignItems="center"
          justifyContent="center"
          rounded="full"
          boxShadow="lg"
          mr={4} // Space between the icon and text
        >
          <Icon as={icon} w={8} h={8} color="white" />
        </Box>

        {/* Text on the right */}
        <Box>
          <Text color={textColor} fontWeight="bold" fontSize="lg">
            {title}
          </Text>
          <Text color={countColor} fontWeight="bold" fontSize="3xl">
            {count < totalCount ? count : totalCount}
          </Text>
          <Text color={descriptionColor} fontSize="sm">
            Total {title.toLowerCase()}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default NewWidgetCard;
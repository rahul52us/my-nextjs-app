import { Flex, Icon, Text, Button, VStack, useTheme, useColorMode } from "@chakra-ui/react";
import { FaExclamationTriangle, FaPlus } from "react-icons/fa";

const NotFoundData = ({ onClick, title, subTitle, btnText, showCreateButton = true }: any) => {
  const { colorMode } = useColorMode(); // Use the color mode hook
  const theme = useTheme();

  const isDarkMode = colorMode === "dark";

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={{ base: 6, md: 8 }}
      borderWidth={2}
      borderRadius="lg"
      borderColor={isDarkMode ? theme.colors.gray[600] : theme.colors.gray[300]} // Conditional border color
      bg={isDarkMode ? theme.colors.gray[800] : theme.colors.white} // Conditional background color
      shadow="md"
      mb={{ base: 6, md: 8 }}
      textAlign="center"
    >
      <Icon
        as={FaExclamationTriangle}
        boxSize={{ base: 10, md: 12 }}
        color={isDarkMode ? theme.colors.orange[300] : theme.colors.orange[400]} // Conditional icon color
        mb={4}
      />
      <VStack spacing={{ base: 3, md: 3 }}>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color={isDarkMode ? theme.colors.gray[200] : theme.colors.gray[800]} // Conditional text color for title
          fontWeight="bold"
        >
          {title}
        </Text>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={isDarkMode ? theme.colors.gray[400] : theme.colors.gray[600]} // Conditional text color for subtitle
        >
          {subTitle}
        </Text>
        {showCreateButton && <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          variant="solid"
          onClick={onClick}
          size="lg"
          px={{ base: 6, md: 8 }}
          borderRadius="full"
          shadow="lg"
          _hover={{ bg: isDarkMode ? theme.colors.teal[500] : theme.colors.teal[600] }} // Conditional hover color
          _active={{ bg: isDarkMode ? theme.colors.teal[600] : theme.colors.teal[700] }} // Conditional active color
        >
          {btnText}
        </Button>}
      </VStack>
    </Flex>
  );
};

export default NotFoundData;

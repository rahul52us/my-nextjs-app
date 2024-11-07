import {
  Box,
  Icon,
  Text,
  useBreakpointValue,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaCode } from "react-icons/fa";

const Skills1 = () => {
  const iconColor = useColorModeValue("#42d48b", "#4bffa5");
  const cardBgColor = useColorModeValue("white", "blackAlpha.600");
  const cardBorderColor = useColorModeValue("gray.200", "gray.700");
  const hoverEffect = useColorModeValue(
    "rgba(66, 212, 139, 0.6)",
    "rgba(75, 255, 165, 0.4)"
  );

  const [isHovered, setIsHovered] = useState(false);

  return (
      <Box
        cursor={"pointer"}
        p={6}
        borderWidth={1}
        borderColor={cardBorderColor}
        bg={cardBgColor}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        _hover={{
          boxShadow: "0 0 10px rgba(66, 212, 139, 0.4)",
          transition: "0.5s",
        }}
      >
        <VStack>
          <Icon
            color={iconColor}
            as={FaCode}
            w={10}
            h={10}
            filter={isHovered ? `drop-shadow(0 0 12px ${hoverEffect})` : "none"}
            transition="0.5s"
          />
          <Text
            my={1}
            fontWeight={700}
            fontSize={useBreakpointValue({ base: "lg", md: "xl" })}
          >
            Web Development
          </Text>
          <Text color={"gray.500"} textAlign={"center"}>
            Web development is the work involved in developing a website for the
            Internet or an intranet.
          </Text>
        </VStack>
      </Box>
  );
};

export default Skills1;

import {
  Box,
  Flex,
  HStack,
  Icon,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";

interface SummaryWidgetProps {
  label: string;
  value: number;
  icon: IconType;
  colorScheme: string;
  description: string;
  loading?: boolean;
  link?: string;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({
  label,
  value,
  icon,
  colorScheme,
  description,
  loading = false,
  link,
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "blackAlpha.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const itemShadow = useColorModeValue("md", "dark-lg");
  // const overlayBgColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.8)");

  return (
    <Box
      bg={bgColor}
      borderWidth={2}
      boxShadow={itemShadow}
      rounded={14}
      p={4}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
    >
      {loading && (
        <Flex
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          // bg={overlayBgColor}
          zIndex={1}
          // backdropFilter="blur(5px)"
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color={`${colorScheme}.500`}
            size="xl"
          />
        </Flex>
      )}
      <HStack spacing={6} opacity={loading ? 0.5 : 1}>
        <Flex
          alignItems="center"
          justifyContent="center"
          bgGradient={`linear(to-r, ${colorScheme}.500, ${colorScheme}.400)`}
          borderRadius="full"
          boxSize="14"
          p={3}
          transition="all 0.3s"
          _hover={{
            bgGradient: `linear(to-r, ${colorScheme}.600, ${colorScheme}.500)`,
          }}
        >
          <Icon as={icon} boxSize={7} color="white" />
        </Flex>
        <Box>
          <Stat>
            <StatLabel
              cursor="pointer"
              fontSize="lg"
              fontWeight={700}
              color={textColor}
              onClick={() => {
                if (link) {
                  navigate(link);
                }
              }}
            >
              {label}
            </StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={textColor}>
              {value}
            </StatNumber>
          </Stat>
          <Text fontSize={"xs"} color={"gray"} fontWeight={500} mt={1} display='none'>
            {description}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default SummaryWidget;

import {
  Box,
  Card,
  Image,
  Tag,
  Text,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Divider,
  Button,
  Grid,
  GridItem,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { useSectionColorContext } from "../../../School";

export default function ToppersCard({
  percentage,
  name,
  img,
  year,
  classs,
  bio,
  webColor
}: any) {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const bioLines = bio.split("\n");
  const shortBio = bioLines.slice(0, 2).join("\n");

  // Color themes
  const cardBg = useColorModeValue("white", "gray.800");
  const overlayGradient =
    "linear(to-b, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))";
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bioTextColor = useColorModeValue("gray.600", "gray.400");
  const tagColorScheme = useColorModeValue("purple", "cyan");

  return (
    <Card
      shadow="lg"
      maxW={{ base: "100%", md: "100%" }}
      rounded="lg"
      my={6}
      overflow="hidden"
      position="relative"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: "scale(1.05)", boxShadow: "2xl" }}
      bg={cardBg}
      onClick={onOpen}
      cursor="pointer"
    >
      <Box position="relative">
        <Image
          w="100%"
          h={{ base: "180px", md: "200px" }}
          objectFit="cover"
          src={img}
          alt={`${name}'s achievement`}
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgGradient={overlayGradient}
          opacity="0.8"
        />
      </Box>

      <Box p={5}>
        <HStack justify="space-between" mb={2}>
          <Tag
            colorScheme="orange"
            fontWeight="bold"
            borderRadius="full"
            px={3}
          >
            <FaStar style={{ marginRight: 4 }} /> {percentage}%
          </Tag>
          <Text fontWeight="medium" color={textColor} fontSize="sm">
            {year}
          </Text>
        </HStack>

        <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>
          {name}
        </Text>
        <Tag
          size="sm"
          colorScheme={tagColorScheme}
          variant="solid"
          borderRadius="full"
        >
          Class: {classs}
        </Tag>

        <Divider my={3} />

        <Text fontSize="sm" color={bioTextColor} noOfLines={2}>
          {shortBio}
        </Text>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent rounded="lg">
          <ModalHeader
            textAlign="center"
            bg={useColorModeValue(
              colors?.headerBg?.light,
              colors?.headerBg?.dark
            )}
            color={useColorModeValue(
              colors?.headerTextColor?.light,
              colors?.headerTextColor?.dark
            )}
            borderTopRadius="lg"
            pt={4}
            pb={2} // Reduced padding
          >
            <Text fontSize="xl" fontWeight="bold">
              {name}
            </Text>
          </ModalHeader>

          <Button
            onClick={onClose}
            position="absolute"
            top={3} // Adjusted positioning for closer alignment
            right={3}
            size="sm"
            rounded="full"
            variant="ghost"
            color={useColorModeValue(
              colors?.iconColor?.light,
              colors?.iconColor?.dark
            )}
            _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
            _focus={{ outline: "none" }}
          >
            ✖
          </Button>

          <ModalBody px={6} py={4} bg={cardBg}>
            {" "}
            {/* Reduced padding */}
            <Flex justifyContent="center" mb={4}>
              {" "}
              {/* Reduced margin */}
              <Image
                borderRadius="full"
                boxSize="70px" // Adjusted size for compactness
                src={img}
                alt={`${name}'s achievement`}
                border="2px solid" // Slightly thinner border
                borderColor={useColorModeValue("teal.500", "teal.300")}
              />
            </Flex>
            <VStack spacing={4} align="stretch">
              {" "}
              {/* Reduced spacing */}
              <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={3}>
                {" "}
                {/* Reduced gap */}
                <GridItem>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Class:
                  </Text>
                  <Text fontSize="md" color={bioTextColor}>
                    {classs}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Year:
                  </Text>
                  <Text fontSize="md" color={bioTextColor}>
                    {year}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Percentage:
                  </Text>
                  <Text fontSize="md" color={bioTextColor}>
                    {percentage}%
                  </Text>
                </GridItem>
              </Grid>
              <Divider />
              <Box
                mt={3}
                p={3}
                borderRadius="md"
                bg={useColorModeValue("gray.100", "gray.700")}
              >
                {" "}
                {/* Adjusted padding */}
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Bio:
                </Text>
                <Text fontSize="md" color={bioTextColor}>
                  {bio}
                </Text>
              </Box>
              <Flex mt={4} justify="center">
                <Button
                  width="full"
                  onClick={onClose}
                  variant="solid"
                  bg={useColorModeValue(
                    colors?.buttonColor?.light,
                    colors?.buttonColor?.dark
                  )}
                  color={useColorModeValue(
                    colors?.buttonTextColor?.light,
                    colors?.buttonTextColor?.dark
                  )}
                  _hover={{ bg: useColorModeValue(
                    colors?.buttonColor?.light,
                    colors?.buttonColor?.dark
                  )}}
                >
                  Close
                </Button>
              </Flex>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}

import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import { MdLocationOn, MdPhone, MdEmail } from "react-icons/md";
import { useSectionColorContext } from "../../../../School";

const Map1 = ({ webColor, content , isEditable, onOpen }: any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };
  const { colorMode } = useColorMode();

  return (
    <Box my={10} width="100%" p={5}>
      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        <Box>
          <Box
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
            bg="gray.100"
          >
            <iframe
              src={content.mapUrl} // Use the mapUrl from state
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="map-section"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box>
        </Box>

        <VStack
          align="start"
          spacing={6}
          p={8}
          borderWidth={1}
          borderColor="teal.300"
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
          transition="box-shadow 0.3s"
          _hover={{ boxShadow: "2xl" }}
          _dark={{ bg: "gray.800", borderColor: "teal.600" }}
        >
          <Text fontWeight="bold" fontSize="3xl" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light}>
            {content.name}
          </Text>

          <Divider orientation="horizontal" borderColor="gray.200" />

          <HStack spacing={3}>
            <Icon as={MdLocationOn} boxSize={8} color={colorMode === "dark" ? colors?.iconColor?.dark : colors?.iconColor?.light} aria-label="Location" />
            <Text fontSize="md" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light} _dark={{ color: "gray.300" }}>
              {content.address}
            </Text>
          </HStack>

          <HStack spacing={3}>
            <Icon as={MdPhone} boxSize={8} color={colorMode === "dark" ? colors?.iconColor?.dark : colors?.iconColor?.light} aria-label="Phone" />
            <Text fontSize="md" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light} _dark={{ color: "gray.300" }}>
              {content.phone}
            </Text>
          </HStack>

          <HStack spacing={3}>
            <Icon as={MdEmail} boxSize={8} color={colorMode === "dark" ? colors?.iconColor?.dark : colors?.iconColor?.light} aria-label="Email" />
            <Text fontSize="md" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light} _dark={{ color: "gray.300" }}>
              {content.email}
            </Text>
          </HStack>

          <Text fontSize="md" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light} _dark={{ color: "gray.300" }}>
            Website:{" "}
            <a
              href={content.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light, textDecoration: "underline" }}
            >
              {content.website}
            </a>
          </Text>

          {isEditable && <Button colorScheme="teal" onClick={onOpen}>
            Edit
          </Button>}
        </VStack>
      </Grid>

      {/* Modal for Editing */}

    </Box>
  );
};

export default Map1;

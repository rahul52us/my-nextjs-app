import {
    Box,
    Grid,
    Text,
    VStack,
    HStack,
    Icon,
    Button,
    useColorMode,
    Collapse,
    Stack,
    Flex,
} from "@chakra-ui/react";
import { MdLocationOn, MdPhone, MdEmail, MdEdit } from "react-icons/md";
import { useSectionColorContext } from "../../../../School";
import { useState } from "react";

const Map2 = ({ webColor, content, isEditable, onOpen }: any) => {
    const { colors } = useSectionColorContext() || { colors: webColor || {} };
    const [showDetails, setShowDetails] = useState(true);

    return (
        <Box my={10} width="100%" p={5}>
            <Grid
                templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                gap={6}
                alignItems="start"
            >
                {/* Map Section */}
                <Box borderRadius="lg" overflow="hidden" boxShadow="lg">
                    <iframe
                        src={content.mapUrl}
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="map-section"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Box>

                {/* Info Section */}
                <VStack
                    align="start"
                    spacing={4}
                    borderWidth={1}
                    borderColor="teal.300"
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="white"
                    transition="box-shadow 0.3s"
                    _hover={{ boxShadow: "2xl" }}
                    _dark={{ bg: "gray.800", borderColor: "teal.600" }}
                    p={6}
                >
                    <Flex width={"100%"} justifyContent="center">
                        <Box width={{base : "100%", md : "60%"}} textAlign="center"> {/* Box with 80% width and center alignment */}
                            <Text
                                fontWeight="bold"
                                fontSize="2xl"
                                color={colors?.headingColor?.light}
                            >
                                {content.name}
                            </Text>
                        </Box>
                    </Flex>
                    <Button
                        variant="link"
                        onClick={() => setShowDetails(!showDetails)}
                        colorScheme="teal"
                        rightIcon={showDetails ? <MdEdit /> : <MdEdit />}
                    >
                        {showDetails ? "Hide Details" : "Show Details"}
                    </Button>

                    <Collapse in={showDetails}>
                        <Stack spacing={4} width="100%">
                            <ContactCard icon={MdLocationOn} info={content.address} />
                            <ContactCard icon={MdPhone} info={content.phone} />
                            <ContactCard icon={MdEmail} info={content.email} />
                            <Text>
                                Website:{" "}
                                <a
                                    href={content.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: colors?.headingColor?.light, textDecoration: "underline" }}
                                >
                                    {content.website}
                                </a>
                            </Text>
                            {isEditable && (
                                <Button colorScheme="teal" onClick={onOpen} size="sm">
                                    Edit
                                </Button>
                            )}
                        </Stack>
                    </Collapse>
                </VStack>
            </Grid>
        </Box>
    );
};

// ContactCard component for better code organization
const ContactCard = ({ icon, info }: { icon: any; info: string }) => {
    const { colorMode } = useColorMode();
    const { colors } = useSectionColorContext() || {};
    return (
        <HStack spacing={3} p={4} borderWidth={1} borderRadius="md" borderColor="teal.300">
            <Icon
                as={icon}
                boxSize={6}
                color={colorMode === "dark" ? colors?.iconColor?.dark : colors?.iconColor?.light}
                aria-label="Info"
            />
            <Text fontSize="sm" color={colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light}>
                {info}
            </Text>
        </HStack>
    );
};

export default Map2;

// src/pages/main/School/component/AboutSection/component/About2/About2.tsx
import {
  Box,
  Heading,
  Text,
  VStack,
  Image,
  useColorModeValue,
  Stack,
  Container,
  Button,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSectionColorContext } from "../../../../School";

const MotionBox = motion(Box);

const About2 = ({ content, webColor, isEditable, onOpen }: any) => {
  const { colorMode } = useColorMode();
  const { colors } = useSectionColorContext() || { colors: webColor || {} };
  const bg = useColorModeValue("gray.50", "gray.900");
  const descriptionColor = useColorModeValue("gray.700", "gray.300");

  // State to manage the visibility of additional descriptions
  const [showMore, setShowMore] = useState(false);

  // Toggle function to show/hide additional descriptions
  const toggleShowMore = () => {
    setShowMore((prev) => !prev);
  };

  return (
    <MotionBox
      m={5}
      py={10}
      bg={bg}
      borderRadius="lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      boxShadow="lg"
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 12, md: 20 }}
          align="center"
          justify="center"
        >
          {/* Image Section */}
          <Box
            flex="1"
            minW="300px"
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
            transition="box-shadow 0.3s"
            _hover={{ boxShadow: "xl" }}
          >
            <Image
              src={content.imageUrl}
              alt={content.title}
              objectFit="cover"
              width="100%"
              height="100%"
              borderRadius="lg"
              transition="transform 0.3s"
              _hover={{ transform: "scale(1.05)" }}
            />
          </Box>

          {/* Text Content Section */}
          <VStack
            flex="2"
            align="start"
            spacing={6}
            textAlign={{ base: "center", md: "left" }}
          >
            <Heading
              as="h2"
              size="xl"
              color={
                colorMode === "light"
                  ? colors?.headingColor?.light
                  : colors?.headingColor?.dark
              }
              fontWeight="bold"
            >
              {content.title}
            </Heading>
            <Text
              fontSize="xl"
              fontWeight="semibold"
              color={
                colorMode === "light"
                  ? colors?.subHeadingColor?.light
                  : colors?.subHeadingColor?.dark
              }
            >
              {content.subtitle}
            </Text>
            <VStack align="start" spacing={4}>
              {content.description
                ?.slice(0, showMore ? content.description.length : 4)
                .map((desc: any, index: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={index}
                  >
                    <Text
                      color={descriptionColor}
                      fontSize={{ base: "md", md: "lg" }}
                      lineHeight="tall"
                    >
                      {desc}
                    </Text>
                  </motion.div>
                ))}
            </VStack>

            {content?.description?.length > 4 && (
              <Flex justifyContent="end" w="100%">
                <Button
                  onClick={toggleShowMore}
                  colorScheme="teal"
                  variant="outline"
                >
                  {showMore ? "Show Less" : "Show More"}
                </Button>
              </Flex>
            )}
          </VStack>
        </Stack>
        {isEditable && (
          <Button
            color={
              colorMode === "light"
                ? webColor?.buttonTextColor?.light
                : webColor?.buttonTextColor?.dark
            }
            backgroundColor={
              colorMode === "light"
                ? webColor?.buttonColor?.light
                : webColor?.buttonColor?.dark
            }
            _hover={{
              backgroundColor:
                colorMode === "light"
                  ? webColor?.buttonHoverColor?.light
                  : webColor?.buttonHoverColor?.dark,
              color:
                colorMode === "light"
                  ? webColor?.buttonTextHoverColor?.light
                  : webColor?.buttonTextHoverColor?.dark,
            }}
            onClick={onOpen}
          >
            Edit Content
          </Button>
        )}
      </Container>
    </MotionBox>
  );
};

export default About2;

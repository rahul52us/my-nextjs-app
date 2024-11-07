import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  VStack,
  useColorModeValue,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import { useSectionColorContext } from "../../../../School";
import { motion } from "framer-motion";

// Motion components
const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionImage = motion(Image);

// Define types for props
type ContentProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string[];
  onClose?: any;
};

type AboutProps = {
  content: any;
  setContent: (content: ContentProps) => void;
  webColor: any;
  isEditable?: boolean;
  onOpen?: any;
  onClose?: any;
  isOpen?: any;
};

export default function About1({
  content = {},
  webColor,
  isEditable = false,
  onOpen,
}: AboutProps) {
  const { colorMode } = useColorMode();
  const { colors } = useSectionColorContext() || { colors: webColor || {} };
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.300");

  return (
    <>
      <MotionBox
        m={{ base: 2, md: 5 }}
        py={8}
        bg={bg}
        borderRadius="lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={8}>
            <Box textAlign="center" flex="1">
              <Heading
                as="h2"
                size="xl"
                textAlign="center"
                fontWeight="bold"
                mb={3}
                color={
                  colorMode === "light"
                    ? colors?.headingColor?.light
                    : colors?.headingColor?.dark
                }
              >
                {content?.title}
              </Heading>
              <MotionText
                fontWeight="semibold"
                color={
                  colorMode === "light"
                    ? colors?.subHeadingColor?.light
                    : colors?.subHeadingColor?.dark
                }
                fontSize={{ base: "lg", md: "xl" }}
                mb={12}
                maxW={{ base: "100%", md: "100%" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {content?.subtitle}
              </MotionText>
            </Box>
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
          </Flex>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={10}
            align="center"
            justify="space-between"
          >
            <MotionBox
              flex="1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <MotionImage
                src={content?.imageUrl}
                alt="School campus"
                w="100%"
                maxW={{ base: "100%", md: "520px" }}
                rounded="xl"
                h={{ base: "100%", md: "380px" }}
                objectFit="cover"
                boxShadow="lg"
                transition="transform 0.3s"
                _hover={{ transform: "scale(1.05)" }}
              />
            </MotionBox>

            <MotionBox flex="1">
              <VStack
                color={textColor}
                fontSize={{ base: "md", md: "lg" }}
                spacing={6}
                textAlign="left"
              >
                {content?.description?.map((paragraph: any, index: number) => (
                  <MotionText
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    {paragraph}
                  </MotionText>
                ))}
              </VStack>
            </MotionBox>
          </Flex>
        </Container>
      </MotionBox>
    </>
  );
}
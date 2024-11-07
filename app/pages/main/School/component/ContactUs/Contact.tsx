import {
  Box,
  Container,
  Text,
  Grid,
  useColorModeValue,
  Heading,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { Controls, Player } from "@lottiefiles/react-lottie-player";
import styled from "styled-components";
import { MdLocationPin, MdMail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import LinkText from "../../../../../config/component/LinkText/LinkText";
import SocialMediaLink from "../../../../../config/component/SocialMediaLinkContainer/SocialMediaLink";
import ContactForm from "./component/ContactForm";
import { useSectionColorContext } from "../../School";

// Style for Lottie animation on tablet devices
const BoxStyleFirst = styled(Box)`
  @media only screen and (min-device-width: 800px) and (max-device-width: 1024px) {
    svg {
      width: 25rem !important;
      height: 25.6rem !important;
    }
  }
`;

const Contact = observer(({ webColor }: any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };
  const iconColor = useColorModeValue(
    colors?.iconColor?.light,
    colors?.iconColor?.dark
  );

  return (
    <Container
      maxW={{ base: "99%", md: "93%" }}
      my={{ base: 5, md: 5 }}
      py={12}
      borderRadius="lg"
      boxShadow="xl"
      p={{ base: 6, md: 5 }}
    >
      <VStack spacing={2} textAlign="center" mb={10}>
        <Heading
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="extrabold"
          color={useColorModeValue(
            colors?.headingColor?.light,
            colors?.headingColor?.dark
          )}
          lineHeight="1.2"
        >
          Get in Touch with Us
        </Heading>
        <Text
          fontSize={{ base: "md", md: "xl" }}
          color={useColorModeValue(
            colors?.subHeadingColor?.light,
            colors?.subHeadingColor?.dark
          )}
          maxW="lg"
          fontWeight="semibold"
        >
          We’re here to help you with all your questions. Reach out, and let’s
          make a connection!
        </Text>
      </VStack>

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={5}
        alignItems="center"
      >
        {/* Contact Form */}
        <Box p={{ base: 2, md: 6 }} borderRadius="lg" boxShadow="lg">
          <ContactForm webColor={webColor} />
        </Box>

        {/* Contact Information and Animation */}
        <VStack spacing={8} align="center">
          <BoxStyleFirst
            mx="auto"
            width={{
              base: "18rem",
              md: "28rem",
              lg: "32rem",
            }}
          >
            <Player autoplay loop src="/img/contactus.json">
              <Controls visible={false} />
            </Player>
          </BoxStyleFirst>

          <VStack spacing={5} mt={8} w="full">
            {/* Location */}
            <HStack
              _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s"
            >
              <Icon as={MdLocationPin} fontSize="2.2rem" color={iconColor} />
              <Text
                fontSize="lg"
                color={useColorModeValue(
                  colors?.headingColor?.light,
                  colors?.headingColor?.dark
                )}
                fontWeight="medium"
                cursor="pointer"
                textAlign="center"
              >
                We'd love to hear from you! Reach out with any questions or just
                say hello.
              </Text>
            </HStack>

            {/* Phone */}
            <HStack _hover={{ color: iconColor }} transition="color 0.2s">
              <Icon as={FaPhoneAlt} fontSize="xl" color={iconColor} />
              <LinkText
                clickEvent={() => alert("Call back")}
                text="+91 9696969696"
                color={iconColor}
              />
            </HStack>

            <HStack _hover={{ color: iconColor }} transition="color 0.2s">
              <Icon as={MdMail} fontSize="xl" color={iconColor} />
              <LinkText text="info@sequelstring.com" color={iconColor} />
            </HStack>

            {/* Social Media */}
            <Box pt={4}>
              <SocialMediaLink iconColor={iconColor} />
            </Box>
          </VStack>
        </VStack>
      </Grid>
    </Container>
  );
});

export default Contact;

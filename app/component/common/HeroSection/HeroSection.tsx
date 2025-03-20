'use client'
import {
  Box,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  useBreakpointValue
} from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import CustomButton from "../CustomButton/CustomButton";
import CustomSmallTitle from "../CustomSmallTitle/CustomSmallTitle";
import HeroCarousel from "./HeroCarousel";
import stores from "../../../store/stores";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

const HeroSection = observer(() => {
  const router = useRouter();
  const buttonSize = useBreakpointValue({ base: "lg", md: "xl" });
  const buttonWidth = useBreakpointValue({ base: "8rem", md: "180px" });
  const [content, setContent] = useState<any>({})
  const {companyStore : {getPageContent, companyDetails}} = stores

  useEffect(() => {
    setContent(getPageContent('home') || {})
  },[companyDetails, getPageContent])

  const handleClick = () => {
    router.push("/therapist");
  };

  return (
    <Box
      mx={"auto"}
      my={{ base: 2, md: 6, lg: 8 }}
      maxW={{ base: "95%", md: "90%" }}
    >
      <Grid templateColumns={{ lg: "1fr 1fr" }} gap={6}>
        <Box>
          <Flex align={"center"} h={"100%"}>
            <Box py={{ base: 2, md: 6 }} maxW={{ md: "95%" }}>
              <Text textTransform="uppercase" color="#DF837C" textAlign={{ base: "center", lg: "start" }}>
              </Text>
              <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }} display={{ base: "none", lg: "block" }} > SEEK HELP </CustomSmallTitle>
              <Heading
                as="h1"
                fontWeight={400}
                fontSize="clamp(2rem, 4vw, 5rem)"
                my={{ base: 1, lg: 3 }}
                lineHeight="1.15"
                textAlign={{ base: "center", lg: "start" }}
                position="relative"
                // fontFamily="Gilroy"
                letterSpacing="-3%"
              >
                For Better <br />
                <Text
                  as="span"
                  fontWeight={600}
                  position="relative"
                  // fontFamily="Gilroy"
                  letterSpacing="-3%"
                >
                  Mental Health
                  <Box
                    as="span"
                    position="absolute"
                    top="-0.5rem" // Adjust this for vertical positioning
                    right="-1.5rem" // Adjust this for horizontal positioning
                    w={{ base: "1.5rem", lg: "2rem" }}
                    h={{ base: "1.5rem", lg: "2rem" }}
                  >
                    <Image src="/images/herosectionIcon.svg" alt="Mental Health Doctor In Noida" w="100%" h="100%" />
                  </Box>
                </Text>
              </Heading>
              <Flex justify={"center"} display={{ base: "flex", md: "none" }}>
                <HeroCarousel />
              </Flex>
              <Text
                color="#434343"
                fontSize={{ base: "sm", md: "18px" }}
                mt={{ base: 2, md: 4 }}
                textAlign={{ base: 'center', lg: "start" }}
                lineHeight={{ base: "24px", md: "28px" }}
                px={{ base: 5, md: 0 }}
              >
                {content?.HeroPara}
              </Text>
              <Flex justify={{ base: "center", lg: "start" }} mt={{ base: 4, md: 6 }}>
                <CustomButton
                  width={buttonWidth}
                  size={buttonSize}
                  onClick={handleClick}
                >
                  Get Started
                </CustomButton>
              </Flex>
            </Box>
          </Flex>
        </Box>

        <Flex justify={"center"} display={{ base: "none", md: "flex" }}>
          <HeroCarousel />
        </Flex>
      </Grid>
    </Box>
  );
});

export default HeroSection;

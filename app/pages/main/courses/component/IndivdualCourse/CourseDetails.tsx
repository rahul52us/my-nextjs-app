import {
  Badge,
  Box,
  Button,
  // Center,
  Divider,
  Flex,
  // Image,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
//   import React, { useContext } from "react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
//   import InstructorProfile from "./element/InstructorProfile";
//   import { courseData, courseTag } from "./utils/constant";
//   import { AppContext } from "AppProvider/AppContext";
//   import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InstructorProfile from "./InstructorProfile";
import { courseDataHi, courseTagHi } from "./utils/constantHindi";
import { courseData, courseTag } from "./utils/constant";
import React from "react";
//   import { courseDataHi, courseTagHi } from "./utils/constantHindi";
//   import { courseDataMr, courseTagMr } from "./utils/constantMarathi";

const instructorData = {
  name: "Dan Abrahmov",
  avatarSrc: "https://cdn-icons-png.flaticon.com/128/4640/4640231.png",
  organization: "ONEST Academy",
  bio: "Web Developer",
  rating: 4,
  courses: 5,
  students: 26,
  socialLinks: [
    { name: "Instagram", icon: <FaInstagram /> },
    { name: "LinkedIn", icon: <FaLinkedinIn /> },
    { name: "Twitter", icon: <FaTwitter /> },
  ],
};

export default function CourseDetails({ course, handleOpenModal }: any) {
  console.log(course);

  const { i18n } = useTranslation();
  let dataToShow: any;
  if (i18n.language === "hi") {
    dataToShow = {
      courseData: courseDataHi,
      courseTag: courseTagHi,
    };
  } else {
    dataToShow = {
      courseData,
      courseTag,
    };
  }

  return (
    <>
      <Box
        mx={{ lg: "1.5rem" }}
        p={{ base: 4, lg: 6 }}
        rounded={12}
        bg={useColorModeValue("white", "gray.700")}
        position="sticky"
        mt={{ base: 4, md: 0, lg: "-360px" }}
        top={{ md: 20 }}
        bottom="auto"
        h="fit-content"
        shadow="rgb(0 0 0 / 20%) 0px 0px 12px"
        overflow={"hidden"}
      >
        <Box>
          {/* <Image
            src="https://img.freepik.com/free-photo/medium-shot-man-wearing-vr-glasses_23-2149126949.jpg?t=st=1715078256~exp=1715081856~hmac=a92cc1709dc1b17d0fc7513aa2b14240b81d878e4de649dd5c0ca0e487a9fb1b&w=1380"
            rounded={4}
          /> */}
          {/* <video src="https://youtu.be/AEbfiLaOdJA?si=ZdL_CnmlpUdnaR88" controls={true} autoPlay={true} /> */}
          <iframe
            width="420"
            height="240"
            src="https://www.youtube.com/embed/AEbfiLaOdJA?si=7opzPcvwrsFkEofQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

            // allowfullscreen
          ></iframe>
        </Box>
        <Stack spacing={4} mt={4}>
          <Text fontSize="2xl" fontWeight={700}>
            ₹500
          </Text>
          <Flex gap={4} direction="column">
            <Button
              bgGradient="linear(to-r, blue.300, blue.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.400, blue.500)",
              }}
              w={"100%"}
              size={"lg"}
              color="white"
              onClick={handleOpenModal}
            >
              Add to Cart
            </Button>
            <Button
              bgGradient="linear(to-r, blue.300, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.400, purple.600)",
              }}
              size={"lg"}
              w={"100%"}
              color="white"
              onClick={handleOpenModal}
            >
              Buy Now
            </Button>
          </Flex>
          <Box mt={4}>
            {dataToShow.courseData.map(
              ({ label, colorScheme, value }: any, index: number) => (
                <React.Fragment key={index}>
                  <Flex justify="space-between" align="center" py={3}>
                    <Text fontWeight={500} color="gray">
                      {label}
                    </Text>
                    <Badge colorScheme={colorScheme}>{value}</Badge>
                  </Flex>
                  <Divider borderColor="gray.300" />
                </React.Fragment>
              )
            )}
          </Box>
          <Box mt={2}>
            <Text fontWeight={700}>
              {i18n.language === "en" ? "Tags" : "टैग"}
            </Text>
            <Flex textAlign="center" gap={4} mt={2} flexWrap="wrap">
              {dataToShow.courseTag.map((skill: any, index: number) => (
                <Text
                  key={index}
                  p="4px 10px"
                  rounded="full"
                  bg="cyan.100"
                  fontSize="sm"
                >
                  {skill}
                </Text>
              ))}
            </Flex>
          </Box>

          <Box>
            <InstructorProfile {...instructorData} />
          </Box>
        </Stack>
      </Box>
    </>
  );
}

import { ArrowBackIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  // Center,
  Divider,
  // Button,
  Flex,
  Grid,
  Heading,
  Icon,
  // Image,
  List,
  ListIcon,
  ListItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
// import { FaRegStar } from "react-icons/fa";
import { MdDateRange, MdLanguage } from "react-icons/md";
// import { PiMedal } from "react-icons/pi";
import CollapsibleSection from "./CollapsibleSection";
import CourseModules from "../../CourseCardContainer/CourseModules";
import CourseDetails from "./CourseDetails";
import { benefitItemsHi, courseDescriptionHi } from "./utils/constantHindi";
import { benefitItems, courseDescription } from "./utils/constant";
import { FaChartSimple, FaUser } from "react-icons/fa6";
import { IoExtensionPuzzleSharp } from "react-icons/io5";
import { RiFolderVideoFill } from "react-icons/ri";
import InstructorDetails from "./InstructorDetails";

export default function IndividualCourse({
  course,
  setSelectedCourse,
  setActivePage,
}: any): JSX.Element {
  const { i18n } = useTranslation();
  let dataToShow;

  if (i18n.language === "hi") {
    dataToShow = {
      courseDescription: courseDescriptionHi,
      benefitItems: benefitItemsHi,
    };
  } else {
    dataToShow = {
      courseDescription,
      benefitItems,
    };
  }

  return (
    <>
      <Box mb={3}>
        <ArrowBackIcon
          fontSize="x-large"
          cursor="pointer"
          onClick={() => {
            setSelectedCourse(null);
            setActivePage(1);
          }}
        />
      </Box>
      <Grid
        templateColumns={{ lg: "2fr 1.15fr" }}
        // bg={
        //   "linear-gradient(0deg, rgba(163,183,247,1) 0%, rgba(255,192,254,1) 100%)"
        // }
        bgGradient={"linear(to-t, blue.200, purple.300)"}
        gap={2}
      >
        <Stack spacing={{ base: 4, md: 8 }} p={{ base: 6, lg: 14 }}>
          <Heading
            fontSize={{ base: "1.4rem", md: "2.2rem", lg: "3rem" }}
            mt={{ base: 2, md: 6 }}
          >
            {course.title}
          </Heading>
          <Text fontSize={{ base: "sm", md: "lg" }}>{course.description}</Text>
          {/* <Button
              leftIcon={<PiMedal fontSize={18} />}
              variant={"outline"}
              colorScheme="purple"
              rounded={"full"}
              >
              Best Seller
            </Button> */}

          <Flex align={"center"} gap={4}>
            <Avatar name="Dan Abrahmov" src={course.logo} />
            <Text>
              {" "}
              Created By <b>{course.provider}</b>
            </Text>
          </Flex>
          <Flex gap={6} align={"center"}>
            <Flex gap={2} align={"center"}>
              <Icon as={FaUser} />
              <Text>236 Students</Text>
            </Flex>
            <Flex gap={2} align={"center"}>
              <Icon as={FaChartSimple} />
              <Text>Beginner</Text>
            </Flex>
            <Flex gap={2} align={"center"}>
              <Icon as={RiFolderVideoFill} />
              <Text> 25 Lessons</Text>
            </Flex>
            <Flex gap={2} align={"center"}>
              <Icon as={IoExtensionPuzzleSharp} />
              <Text>12 Quizes</Text>
            </Flex>
          </Flex>
          {/* <Flex gap={6} align={"center"} flexWrap={"wrap"}>
            <Text p={2}>121 rating</Text>
            <Text>48 {i18n.language === "en" ? "Students" : "छात्र"}</Text>
          </Flex> */}

          <Flex gap={{ base: 4, md: 12 }} flexWrap={"wrap"}>
            <Flex align={"center"} gap={1}>
              <MdDateRange />
              <Text fontWeight={500}>
                {i18n.language === "en" ? "Last Updated" : "आखरी अपडेट"}: April
                23, 2024
              </Text>
            </Flex>
            <Flex align={"center"} gap={1}>
              <MdLanguage fontSize={18} />
              <Text fontWeight={500}>
                {i18n.language === "en" ? "English" : "अंग्रेज़ी"}
              </Text>
            </Flex>
          </Flex>
        </Stack>
      </Grid>
      <Grid
        templateColumns={{ md: "2fr 1.15fr" }}
        gap={4}
        m={{ md: "0.5rem", lg: "3rem" }}
      >
        <Stack spacing={8} order={{ base: 1, md: "unset" }}>
          {/* <Image
            src={course.image}
            rounded={8}
            display={{ base: "none", md: "block" }}
          /> */}

          <Tabs variant={"soft-rounded"} colorScheme="facebook">
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Course Content</Tab>
              <Tab>Instructor Details</Tab>
            </TabList>
            <Divider mt={1} />

            <TabPanels>
              <TabPanel>
                <Box
                  p={6}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  shadow={"rgb(0 0 0 / 20%) 0px 0px 4px"}
                  rounded={8}
                >
                  <CollapsibleSection
                    courseDescription={dataToShow.courseDescription}
                  />
                </Box>
                <Box
                  mt={4}
                  p={6}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  shadow={"rgb(0 0 0 / 20%) 0px 0px 4px"}
                  rounded={8}
                >
                  <Heading fontSize={"1.4rem"} mb={4}>
                    {i18n.language === "en" ? "Benefits" : "लाभ"}
                  </Heading>
                  <List>
                    <Grid templateColumns={{ lg: "1fr 1fr" }} gap={6}>
                      {dataToShow.benefitItems.map((item, index) => (
                        <ListItem
                          key={index}
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          <ListIcon
                            as={CheckCircleIcon}
                            color={"teal"}
                            boxSize={"18px"}
                          />
                          {item}
                        </ListItem>
                      ))}
                    </Grid>
                  </List>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <CourseModules />
                </Box>
              </TabPanel>
              <TabPanel>
                {/* <Center bg="gray.100" h="100vh" p={8}> */}
                <Box w="full">
                  <InstructorDetails
                    name="Jane Doe"
                    bio="Jane Doe is an experienced web developer and instructor with over a decade of teaching experience. She specializes in front-end technologies and has a passion for creating interactive and accessible web applications."
                    avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
                    expertise={[
                      "JavaScript",
                      "React",
                      "Node.js",
                      "CSS",
                      "Accessibility",
                    ]}
                    email="jane.doe@example.com"
                    contact="+1 (555) 123-4567"
                    website="https://janedoe.dev"
                    linkedin="https://www.linkedin.com/in/janedoe/"
                    twitter="https://twitter.com/janedoe"
                    github="https://github.com/janedoe"
                  />
                </Box>
                {/* </Center> */}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
        <Box order={{ base: 0, md: "unset" }}>
          <CourseDetails course={course} />
        </Box>
      </Grid>
    </>
  );
}

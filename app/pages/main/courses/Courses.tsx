import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  // Heading,
  Image,
} from "@chakra-ui/react";
// import { BiGrid } from "react-icons/bi";
// import { FaList } from "react-icons/fa";
import FilterContainer from "../../../config/component/FilterContainer/FilterContainer";
import CourseCardContainer from "./CourseCardContainer/CourseCardContainer";
import { observer } from "mobx-react-lite";
import store from "../../../store/store";
// import CoursesPage from "./component/CoursesPage/CoursesPage";
import BgImg from "./component/bg2.jpeg";
import CourseModules from "./CourseCardContainer/CourseModules";
import IndividualCourse from "./component/IndivdualCourse/IndividualCourse";

const Courses = observer(() => {
  const [activePage, setActivePage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setActivePage(2); // Assuming page 2 is the individual course page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    notesStore: { getCategories, categories },
    auth: { openNotification },
  } = store;

  useEffect(() => {
    if (!categories.hasFetch) {
      getCategories({ page: 1 })
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            message: err?.message,
            title: "Get Categories Failed",
          });
        });
    }
  }, [getCategories, categories.hasFetch, openNotification]);

  return (
    <>
      <Box m={5}>
        {activePage === 1 && (
          <>
            <Box display="none">
              <Image
                src={BgImg}
                h={"25rem"}
                objectFit="cover"
                w={"100%"}
                filter={"brightness(0.4)"}
              />
              <Flex
                direction="column"
                align="center"
                justify="center"
                position="absolute"
                top="0"
                right="0"
                bottom="14"
                left="0"
              >
                <Flex alignItems="end" gap={4}>
                  <Heading size="2xl" fontFamily={"heading"} color={"white"}>
                    All Courses
                  </Heading>
                  <Button
                    size={"sm"}
                    border="1px solid white"
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius={30}
                    pt={2}
                    pb={2}
                    _hover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    🎉 {categories?.data?.length} Courses
                  </Button>
                </Flex>

                {/* <Text mt={2} color={"white"}>
            Courses that help beginner designers become true unicorns.
          </Text> */}
              </Flex>
              {activePage === 1 && (
                <Box width="45%">
                  <Box mt={5}>
                    <FilterContainer />
                  </Box>
                </Box>
              )}
            </Box>

            <Box mt={10}>
              <CourseCardContainer
                activePage={activePage}
                setActivePage={setActivePage}
                handleCourseClick={handleCourseClick}
              />
            </Box>
            <CourseModules />
          </>
        )}
      </Box>
      {activePage === 2 && selectedCourse && (
        <IndividualCourse
          course={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          setActivePage={setActivePage}
        />
      )}
    </>
  );
});

export default Courses;

import {
  Box,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  Collapse,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { aboutCourse1Hi, aboutCourse2Hi } from "./utils/constantHindi";
import { aboutCourse1, aboutCourse2 } from "./utils/constant";
//   import { aboutCourse1Hi, aboutCourse2Hi } from "../utils/constantHindi";
//   import { aboutCourse1, aboutCourse2 } from "../utils/constant";
//   import { aboutCourse1Mr, aboutCourse2Mr } from "../utils/constantMarathi";

const CourseDescription = ({ courseDescription }: any) => {
  const { i18n } = useTranslation();
  let dataToShow;

  if (i18n.language === "hi") {
    dataToShow = {
      aboutCourse1: aboutCourse1Hi,
      aboutCourse2: aboutCourse2Hi,
    };
  } else {
    dataToShow = {
      aboutCourse1,
      aboutCourse2,
    };
  }

  return (
    <>
      <Box>
        <Heading fontSize={"1.4rem"} mb={4}>
          {i18n.language === "en"
            ? "About Course"
            : i18n.language === "mr"
            ? "कोर्सबद्दल"
            : "कोर्स के बारे में"}
        </Heading>
        <Text mb={4} fontSize={{ base: "sm", md: "md" }}>
          {dataToShow.aboutCourse1}
        </Text>
        <Text
          ml={{ base: "1rem", md: "2rem" }}
          fontSize={{ base: "sm", md: "md" }}
        >
          <UnorderedList spacing={3}>
            {courseDescription.map((detail: any, index: number) => (
              <ListItem key={index}>
                <Text fontWeight="bold">{detail.title}</Text>
                <Text>{detail.description}</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Text>
        <Text mt={4} fontSize={{ base: "sm", md: "md" }}>
          {dataToShow.aboutCourse2}
        </Text>
      </Box>
    </>
  );
};

const CollapsibleSection = ({ courseDescription }: any) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  const { i18n } = useTranslation();

  return (
    <>
      <Collapse in={showDetails} startingHeight={230}>
        <CourseDescription courseDescription={courseDescription} />
      </Collapse>
      <Flex justify={"end"}>
        <Button size="sm" onClick={toggleDetails} mt="1rem">
          {showDetails ? (
            <>{i18n.language === "en" ? "See Less" : "कम देखें"}</>
          ) : (
            <>{i18n.language === "en" ? "See More" : "अधिक देखें"}</>
          )}
        </Button>
      </Flex>
    </>
  );
};

export default CollapsibleSection;

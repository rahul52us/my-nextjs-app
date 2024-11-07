import {
  Avatar,
  Box,
  Center,
  Flex,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaRegStar } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";

const InstructorProfile = ({
  name,
  avatarSrc,
  organization,
  bio,
  rating,
  courses,
  students,
  socialLinks,
}: any) => {
  const iconButtonStyles = {
    boxSize: 10,
    isRound: true,
    border: useColorModeValue("2px solid white", "gray.700"),
    _hover: { bg: "black", color: "white" },
    color: useColorModeValue("black", "white"),
    bg: "transparent",
    fontSize: "2xl",
    cursor: "pointer",
  };

  const { i18n } = useTranslation();

  return (
    <Box mt={2}>
      <Text fontWeight={700}>
        {i18n.language === "en" ? "Your Instructor" : "आपका प्रशिक्षक"}
      </Text>
      <Flex gap={4} mt={2}>
        <Avatar name={name} src={avatarSrc} />
        <Box>
          <Text>
            By <b>{i18n.language === "en" ? organization : "ONEST अकादमी"}</b>
          </Text>
          <Text fontSize="sm" color="gray" fontFamily="monospace">
            {i18n.language === "en" ? bio : "वेब डेवलपर"}
          </Text>
          <Flex gap={2} mt={2}>
            {[...Array(rating)].map((_, index) => (
              <FaRegStar key={index} />
            ))}
          </Flex>
          <Flex gap={{ lg: 4 }} flexWrap={"wrap"}>
            <Flex mt={2} align="center" gap={1} color="gray">
              <IoDocumentTextOutline />
              <Text>
                {courses}
                {i18n.language === "en" ? "Courses" : "पाठ्यक्रम"}
              </Text>
            </Flex>
            <Flex mt={2} align="center" gap={1} color="gray">
              <IoDocumentTextOutline />
              <Text>
                {students} {i18n.language === "en" ? "Students" : "छात्र"}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
      <Center mt={4}>
        <HStack spacing={4} transition="step-start">
          {socialLinks.map((link: any, index: number) => (
            <IconButton
              key={index}
              {...iconButtonStyles}
              aria-label={link.name}
              icon={link.icon}
            />
          ))}
        </HStack>
      </Center>
    </Box>
  );
};

export default InstructorProfile;

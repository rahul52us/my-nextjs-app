import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { BiCalendar } from "react-icons/bi";
import { RiAttachmentLine } from "react-icons/ri";

export default function CourseCard({
  title,
  admin,
  price,
  rating,
  duration,
  imageUrl,
}: any): JSX.Element {
  return (
    <>
      <Box p={4}>
        <Image src={imageUrl} />
        <Box p={2}>
          <Box
            p={4}
            boxShadow={"md"}
            position={"relative"}
            mt={"-6"}
            bg={useColorModeValue("white", "#00072d")}
          >
            <Heading
              fontSize={"2xl"}
              cursor={"pointer"}
              _hover={{
                color: "telegram.500",
                textDecoration: "underline",
                transition: "ease-in 0.3s",
              }}
              color={useColorModeValue("black", "white")}
            >
              {title}
            </Heading>
            <Text py={2} color={"gray"}>
              {admin}
            </Text>
            <Flex alignItems={"center"} justifyContent={"space-between"} my={2}>
              <Text fontSize={"xl"} fontWeight={600} color={"green"}>
                ₹ {price}
              </Text>
              <Flex color={"gold"} gap={1}>
                {Array.from({ length: rating }, (_, index) => (
                  <RiAttachmentLine key={index} />
                ))}
              </Flex>
            </Flex>
            <Flex mt={6} alignItems={"center"} gap={2}>
              <BiCalendar color={"gray"} />
              <Text color={"gray"}>Duration: {duration} Weeks</Text>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
}

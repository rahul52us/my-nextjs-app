import {
  Card,
  CardBody,
  Flex,
  Heading,
  Image,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { PiCertificate } from "react-icons/pi";

export default function CourseCard({ course ,onClick}: any) {
  return (
    <Card
      shadow={"rgb(0 0 0 / 20%) 0px 0px 11px"}
      cursor={"pointer"}
      _hover={{ transform: "scale(1.025)", cursor: "pointer" }}
      transition="transform 0.3s ease-in-out"
      width="100%"
      onClick={onClick}
    >
      <CardBody p={2}>
        <Image
          src={course.image}
          alt="course"
          borderRadius="lg"
          objectFit={"cover"}
          h={"200px"}
          w="100%"
        />
        <Stack spacing={1} p={2}>
          <Flex my={1} justify={"space-between"} align={"center"}>
            <Flex align={"center"} gap={2}>
              <Image src={course.logo} w={"35px"} objectFit={"contain"} />
              <Text fontSize={"sm"} fontWeight={500} color={"gray"}>
                {course.provider}
              </Text>
            </Flex>
            <Tag size={"sm"} variant="outline" colorScheme="teal">
              <TagLeftIcon as={StarIcon} />
              <TagLabel>{course.rating}</TagLabel>
            </Tag>
          </Flex>
          <Heading fontSize={"lg"}>{course.title}</Heading>
          <Text fontSize={"sm"}>{course.description}</Text>
          <Flex mt={2} gap={2}>
            <PiCertificate fontSize={"1.6rem"} />
            <Text fontWeight={500}>Earn Your Certificate</Text>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
}

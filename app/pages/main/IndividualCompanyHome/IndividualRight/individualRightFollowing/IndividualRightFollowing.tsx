import {
  Avatar,
  Box,
  Flex,
  Icon,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FaArrowRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";

const IndividualRightFollowing = observer(() => {
  const followersColor = useColorModeValue("gray.500", "blue.300");

  const renderFollowingItem = (item: number, index: number) => (
    <Flex
      key={index}
      alignItems="center"
      justifyContent="space-between"
      mt={3}
      width="60%"
    >
      <Flex>
        <Avatar size="xs" />
        <Text
          _hover={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
          ml={3}
          fontSize="xs"
          color={followersColor}
        >
          Rahul Kushwah {item}
        </Text>
      </Flex>
      <Icon as={FiMoreVertical} w={6} h={3} color="gray.500" />
    </Flex>
  );

  return (
    <Box mt={5}>
      <Text fontWeight="bold">Following</Text>
      <Flex flexDirection="column" mt={3}>
        {[1, 2, 3, 4, 5, 6].map(renderFollowingItem)}
      </Flex>
      <Text
        mt={3}
        fontSize="sm"
        fontWeight="semibold"
        cursor="pointer"
        color="blue.500"
        _hover={{ textDecoration: "underline", color: "blue.600" }}
      >
        <Link fontSize="2xs">
          See All{" "}
          <Icon
            size="sm"
            as={FaArrowRight}
            ml={1}
            style={{ position: "relative", top: "2px" }}
          />
        </Link>
      </Text>
    </Box>
  );
});

export default IndividualRightFollowing;

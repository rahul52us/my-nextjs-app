import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useColorMode,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import IndividualRightFollowing from "./individualRightFollowing/IndividualRightFollowing";
import { MdMailOutline } from "react-icons/md";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { main } from "../../../../config/constant/routes";

const IndividualRight = observer(() => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const bgColor = colorMode === "light" ? "white" : "";
  const textColor = colorMode === "light" ? "gray.700" : "gray.300";
  const followersColor = colorMode === "light" ? "blue.500" : "blue.300";

  type MailPopoverProps = {
    title: string;
    children: ReactNode;
  };

  const MailPopover = ({ title, children }: MailPopoverProps) => {
    const { colorMode } = useColorMode();
    const textColor = colorMode === "light" ? "gray.800" : "gray.300";

    return (
      <Popover placement="bottom">
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent p={1} maxW="180px" textAlign="center">
          <PopoverArrow />
          <Text fontSize="xs" fontWeight="semibold" color={textColor}>
            {title}
          </Text>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Box p={6} bg={bgColor}>
      <Box textAlign="center">
        <Avatar size="2xl" name="Rahul Kushwah" mb={4} />
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Rahul Kushwah
        </Text>
        <Text mt={1} fontSize="md" color={followersColor}>
          Followers: 12
        </Text>
        <Text mt={4} fontSize="sm" color={textColor}>
          About Me: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </Box>
      <Flex justify="space-between" align="center" mt={6}>
        <Box>
          <Button
            colorScheme="blue"
            size="sm"
            fontWeight="semibold"
            borderRadius="full"
            _hover={{ bg: "blue.600" }}
          >
            Follow
          </Button>
          <MailPopover title="Subscribe to get an email whenever Rahul Kushwah publishes">
            <IconButton
              ml={3}
              color={followersColor}
              aria-label="Send Email"
              icon={<MdMailOutline size={18} />}
              isRound
              _hover={{ color: "blue.600" }}
            />
          </MailPopover>
        </Box>
        <Button
          colorScheme="blue"
          fontWeight="semibold"
          borderRadius="full"
          _hover={{ bg: "blue.600" }}
          onClick={() => {
            navigate(main.createBlog);
          }}
        >
          create blog
        </Button>
      </Flex>
      <IndividualRightFollowing />
    </Box>
  );
});

export default IndividualRight;

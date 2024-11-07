import { Box, Heading, Text, Flex, Image } from "@chakra-ui/react";

export default function Hero1() {
  return (
    <Box position="relative" h="80vh">
      <Image
        src="https://img.freepik.com/free-photo/education-day-arrangement-table-with-copy-space_23-2148721266.jpg?t=st=1728490788~exp=1728494388~hmac=fac3c19b540691d7cd5ddb2ab4c984a604b3b67c4f3b7c586ae181b0e481d194&w=1380"
        alt="School building"

        w={"100%"}
        h={"80vh"}
        objectFit="cover"
      />
      <Flex
        position="absolute"
        inset={0}
        bg="blackAlpha.500"
        align="center"
        justify="center"
        color="white"
      >
        <Box textAlign="center">
          <Heading as="h2" size="2xl" mb={4}>
            Welcome to Evergreen Academy
          </Heading>
          <Text fontSize="xl">Nurturing Minds, Shaping Futures</Text>
        </Box>
      </Flex>
    </Box>
  );
}

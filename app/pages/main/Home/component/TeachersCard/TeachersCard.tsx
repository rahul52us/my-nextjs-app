import { Box, Flex, Heading, IconButton, Image, Text } from "@chakra-ui/react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

interface Teacher {
  imageUrl: string;
  name: string;
  role: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
}

export default function TeachersCard({
  imageUrl,
  name,
  role,
  linkedin,
  instagram,
  twitter,
}: Teacher): JSX.Element {
  return (
    <Box>
      <Box>
        <Image
          alt="teacher"
          src={imageUrl}
          _hover={{ transform: "scale(1.02)" }}
          transition="transform 1s ease"
        />
      </Box>
      <Flex gap={4} justifyContent={"center"} mt={"-1.5rem"}>
        {linkedin && (
          <IconButton
            boxSize={14}
            isRound={true}
            colorScheme="linkedin"
            aria-label="LinkedIn"
            fontSize={"2xl"}
            icon={<FaLinkedinIn />}
            as="a"
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
        {instagram && (
          <IconButton
            boxSize={14}
            isRound={true}
            colorScheme="pink"
            aria-label="Instagram"
            fontSize={"3xl"}
            icon={<FaInstagram />}
            as="a"
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
        {twitter && (
          <IconButton
            boxSize={14}
            isRound={true}
            bg={"black"}
            color={"white"}
            aria-label="Twitter"
            fontSize={"2xl"}
            icon={<FaTwitter />}
            as="a"
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ bg: "black" }}
          />
        )}
      </Flex>
      <Heading
        fontSize={"2xl"}
        textAlign={"center"}
        mt={4}
        fontStyle={"oblique"}
      >
        {name}
      </Heading>
      <Text
        color={"gray"}
        fontSize={"lg"}
        fontStyle={"oblique"}
        textAlign={"center"}
        my={2}
      >
        {role}
      </Text>
    </Box>
  );
}

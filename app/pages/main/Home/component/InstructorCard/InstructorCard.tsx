import { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Stack,
  Text,
  Image,
  Center,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

interface Props {
  name: string;
  jobTitle: string;
  profileImageUrl: any;
  instagram?: any;
  linkedin?: any;
  twitter?: any;
  about: string;
}

const InstructorCard = ({
  name,
  jobTitle,
  profileImageUrl,
  instagram,
  linkedin,
  twitter,
  about,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const iconButtonStyles = {
    boxSize: 10,
    isRound: true,
    border: "2px solid white",
    _hover: { bg: "white", color: "black" },
    color: "white",
    bg: "transparent",
    fontSize: "2xl",
    cursor: "pointer",
  };

  return (
    <Box>
      <Card shadow={"md"}>
        <CardBody
          position="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box bg="black">
            <Image
              src={profileImageUrl}
              alt={name}
              opacity={isHovered ? 0.4 : 1}
              transition="ease-in 0.3s"
            />
          </Box>
          {isHovered && (
            <Center
              position="absolute"
              top="35%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex="1"
            >
              <Stack direction="row" spacing={4} transition="step-start">
                {instagram && (
                  <IconButton
                    {...iconButtonStyles}
                    aria-label="Instagram"
                    icon={<FaInstagram />}
                  />
                )}
                {linkedin && (
                  <IconButton
                    {...iconButtonStyles}
                    aria-label="LinkedIn"
                    icon={<FaLinkedinIn />}
                  />
                )}
                {twitter && (
                  <IconButton
                    {...iconButtonStyles}
                    aria-label="Twitter"
                    icon={<FaTwitter />}
                  />
                )}
              </Stack>
            </Center>
          )}
          <Stack mt="3">
            <Text
              fontSize="2xl"
              fontWeight={500}
              textAlign="center"
              fontFamily="sans-serif"
            >
              {name}
            </Text>
            <Text
              color={useColorModeValue("gray", "cyan")}
              textAlign="center"
              fontFamily="sans-serif"
            >
              {jobTitle}
            </Text>
            <Text textAlign="center">{about}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default InstructorCard;

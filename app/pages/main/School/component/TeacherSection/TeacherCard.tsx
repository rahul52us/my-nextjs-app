import { Box, Image, Tag, Text, useDisclosure, useColorModeValue, Divider } from "@chakra-ui/react";
import TeacherDetailModal from "./TeacherDetailModel";
import { useSectionColorContext } from "../../School";

const TeacherCard = ({ name, subject, imageUrl, bio, index, totalItems, webColor }: any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Define colors and styles based on the color mode
  const boxShadow = useColorModeValue("lg", "dark-lg");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const tagColorScheme = useColorModeValue("teal", "cyan");

  const trimmedBio = bio.length > 80 ? `${bio.substring(0, 80)}...` : bio;

  return (
    <>
      <Box
        maxW={{ base: "100%", sm: "xs", md: "md", lg: "lg" }}
        shadow={boxShadow}
        rounded="lg"
        overflow="hidden"
        onClick={onOpen}
        cursor="pointer"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{ transform: "scale(1.02)", boxShadow: "xl" }}
      >
        <Image
          src={imageUrl}
          alt={name}
          roundedTop="lg"
          objectFit="cover"
          height={{ base: "150px", md: "200px" }}
          w="100%"
          transition="filter 0.2s"
          _hover={{ filter: "brightness(0.85)" }}
        />
        <Box p={{ base: 4, md: 6 }} bg={bgColor}>
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={1}>
            {name}
          </Text>
          <Tag size="sm" colorScheme={tagColorScheme} variant="solid" mb={2} borderRadius="full">
            {subject}
          </Tag>
          <Divider orientation="horizontal" borderColor={useColorModeValue("gray.200", "gray.700")} my={2} />
          <Text
            fontSize="sm"
            color={textColor}
            noOfLines={2} // Limit to 2 lines
            overflow="hidden" // Ensure text doesn't overflow
            textOverflow="ellipsis" // Show ellipsis if text is too long
          >
            {trimmedBio}
          </Text>
        </Box>
      </Box>

      <TeacherDetailModal
        isOpen={isOpen}
        onClose={onClose}
        name={name}
        subject={subject}
        imageUrl={imageUrl}
        bio={bio}
        index={index}
        colors={colors}
        totalItems={totalItems} // Pass total number of items
      />
    </>
  );
};

export default TeacherCard;

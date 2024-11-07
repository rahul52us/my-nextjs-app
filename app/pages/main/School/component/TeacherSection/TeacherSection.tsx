import { Box, Grid, Heading, Text, Stack, useColorModeValue } from "@chakra-ui/react";
import TeacherCard from "./TeacherCard";
import { teachersData } from "../../Constant/constants";
import { useSectionColorContext } from "../../School";

const TeacherSection = ({webColor} : any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  const bg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box m={{ base: 2, md: 5 }} py={10} bg={bg}>
      <Stack spacing={4} textAlign="center" mb={10} px={{ base: 4, md: 0 }}>
        <Heading
          as="h2"
          size={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color={useColorModeValue(
            colors?.headingColor?.light,
            colors?.headingColor?.dark
          )}
        >
          Meet Our Dedicated Teachers
        </Heading>
        <Text
          fontSize={{ base: "md", md: "xl" }}
          color={useColorModeValue(
            colors?.subHeadingColor?.light,
            colors?.subHeadingColor?.dark
          )}
          maxW={{ base: "100%", md: "600px" }}
          mx="auto"
          fontWeight="semibold"
        >
          Our passionate and experienced team of educators is here to guide you
          on your learning journey. With expertise across a wide range of
          subjects, they are committed to your success.
        </Text>
      </Stack>

      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={8}
        maxW="85%"
        mx="auto"
      >
        {teachersData.map((teacher, index) => (
          <TeacherCard
            key={teacher.id}
            name={teacher.name}
            subject={teacher.subject}
            imageUrl={teacher.imageUrl}
            bio={teacher.bio}
            index={index}
            totalItems={teachersData.length}
            webColor={colors}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default TeacherSection;

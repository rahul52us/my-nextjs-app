import { Box, Grid, Heading, Image, SimpleGrid } from "@chakra-ui/react";
import ParallaxSection from "../../../../../config/component/Parallax/Parallax";
import { activityData } from "../../Constant/constants";
import CampCard from "../SchoolActivityCard/SchoolActivityCard";
import books from "../SchoolActivityCard/books.png";

const SchoolFeatureSection = () => {
  return (
    <ParallaxSection imageUrl="https://kidslifedev.wpengine.com/wp-content/uploads/2020/03/cloud-bg1.png">
      <Box maxW={"75%"} mx={"auto"} color={"white"} maxH={"90%"} my={"auto"}>
        <Heading mb={4} size={"lg"}>
          Our school has
        </Heading>
        <Grid templateColumns={"2fr 1fr"}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {activityData.map((camp, index) => (
              <CampCard
                key={index}
                title={camp.title}
                description={camp.description}
              />
            ))}
          </SimpleGrid>
          <Image src={books} />
        </Grid>
      </Box>
    </ParallaxSection>
  );
};

export default SchoolFeatureSection;

import { Box, Grid } from "@chakra-ui/react";
import Skills1 from "./component/Skills1";



const Skills = () => {
  return (
    <Box
      // m={{ base: 2, md: 5 }}
      mx={"auto"}
      py={10}
      //   bg={bg}
      maxW={{ base: "98%", md: "90%" }}
      p={{ base: 5, md: 10 }}
      borderRadius="lg"
    >
      <Grid templateColumns={"1fr 1fr 1fr"}>
        <Skills1 />
      </Grid>
    </Box>
  );
};

export default Skills;

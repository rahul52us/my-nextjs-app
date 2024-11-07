  import { useEffect } from "react";
  import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Heading,
    Text,
  } from "@chakra-ui/react";
  import { BiGrid } from "react-icons/bi";
  import { FaList } from "react-icons/fa";
  import FilterContainer from "../../../config/component/FilterContainer/FilterContainer";
  import VideosContainer from "./VideosContainer";
  import { observer } from "mobx-react-lite";
  import store from "../../../store/store";

  const YoutubeVideoIndex = observer(() => {
    const {
      VideoStore: { getCategories, categories },
      auth: { openNotification },
    } = store;

    useEffect(() => {
      if (!categories.hasFetch) {
        getCategories({ page: 1 })
          .then(() => {})
          .catch((err: any) => {
            openNotification({
              type: "error",
              message: err?.message,
              title: "Get Categories Failed",
            });
          });
      }
    }, [getCategories,categories.hasFetch, openNotification]);

    return (
      <Box>
        <Box
          display="flex"
          flexDirection="column-reverse"
          bgGradient="linear-gradient(135deg, #AEE3FF, #72C7FF)"
        >
          <Container maxW="7xl" style={{ marginTop: "60px" }}>
            <Box display={"flex"} alignItems={"center"}>
              <Heading fontSize={"5xl"}>All Videos</Heading>
              <Button
                border="1px solid white"
                bgColor="rgba(255, 255, 255, 0.05)"
                borderRadius={30}
                pt={6}
                pb={6}
                ml={10}
                mt={2}
                _hover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                🎉 {categories?.data?.length} Courses
              </Button>
            </Box>
            <Text mt={4} fontWeight={500}>
              Videos that help beginner designers become true unicorns.
            </Text>
            <Box mt={10}>
              <ButtonGroup
                borderRadius={20}
                border="1px solid rgba(255, 255, 255, 0.05)"
                bgColor="rgba(255, 255, 255, 0.05)"
                p={2}
              >
                <Button
                  borderRadius={20}
                  w={100}
                  leftIcon={<BiGrid />}
                  bgColor={"blue.500"}
                  color="white"
                >
                  Grid
                </Button>
                <Button borderRadius={20} w={100} leftIcon={<FaList />}>
                  List
                </Button>
              </ButtonGroup>
            </Box>
            <Box mt={5} mb={150}>
              <FilterContainer />
            </Box>
          </Container>
        </Box>
        <Container maxW={"8xl"}>
          <Box mt={"-70"} mb={10}>
            <VideosContainer />
          </Box>
        </Container>
      </Box>
    );
  });

export default YoutubeVideoIndex;
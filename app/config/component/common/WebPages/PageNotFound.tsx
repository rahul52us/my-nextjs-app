import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { BiRightArrowAlt } from "react-icons/bi";
import {useLocation, useNavigate } from "react-router-dom";
import { dashboard, main } from "../../../constant/routes";

const PageNotFound = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const isDashboard = location.pathname.startsWith("/dashboard");

  const handleNavigation = () => {
    if (isDashboard) {
      navigate(dashboard.home)
    } else {
      navigate(main.home)
    }
  };

  return (
    <Box height={{ base: undefined, md: "70vh" }}>
      <Flex justifyContent="center" alignItems="center" flexDirection="column" mt={20}>
        <Flex flexDirection="column" alignItems="center" w={{ base: "90%", md: "500px" }} m={5}>
          <Image src="/img/notFound.png" alt="Page not found" width="180px" height="180px" />
          <Heading size="xl" textAlign="center" mt={5} color="blue.700">
            404. Page not found
          </Heading>
          <Text textAlign="center" mt={5} color="gray.600">
            Sorry, we couldn’t find the page you were looking for.
            {isDashboard ? " You are trying to access a dashboard page." : " We suggest that you return to the homepage."}
          </Text>
          <Button
            colorScheme="blue"
            mt={5}
            fontWeight={500}
            p={3}
            fontSize="xl"
            size="lg"
            rightIcon={<BiRightArrowAlt />}
            aria-label="Back to homepage"
            onClick={handleNavigation}
          >
              Back To Homepage
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PageNotFound;

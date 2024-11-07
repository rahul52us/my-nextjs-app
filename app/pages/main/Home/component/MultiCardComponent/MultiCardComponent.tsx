import {
  Box,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MultiCardComponent = ({
  bgColor,
  buttonColor,
  // image,
  description,
  title,
  cards,
}: // button
any) => {
  const navigate = useNavigate();
  return (
    <>
      <Grid
        p={"2rem"}
        templateColumns={{
          base: "1fr",
          md: "1fr 1fr",
          lg: "1.5fr 1fr 1fr 1fr",
        }}
        gap={4}
        bg={bgColor}
        rounded={"1rem"}
      >
        <Box py={"1rem"}>
          <Heading
            fontSize={"2xl"}
            textDecoration={"underline"}
            my={2}
            color={useColorModeValue("white", "white")}
          >
            {title}
          </Heading>
          <Text fontSize={"lg"} color={useColorModeValue("white", "white")}>
            {description}
          </Text>
        </Box>

        {cards.map((value: any) => (
          <Box bg={"white"} p={2} rounded={"1rem"}>
            <Image
              w={"100%"}
              h={"12rem"}
              objectFit={"contain"}
              src={value.image}
            />
            <Flex justifyContent={"center"}>
              <Button
                px={"1rem"}
                color={buttonColor}
                borderColor={buttonColor}
                variant={"outline"}
                _hover={{
                  bg: buttonColor,
                  color: "white",
                }}
                borderWidth={"3px"}
                w={"60%"}
                onClick={() => {
                  if (value?.link) {
                    navigate(value.link);
                  }
                }}
              >
                {value.button}
              </Button>
            </Flex>
          </Box>
        ))}
      </Grid>
    </>
  );
};

export default MultiCardComponent;

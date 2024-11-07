import { CheckIcon, StarIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Image,
  List,
  ListIcon,
  ListItem,
  Tag,
  TagLabel,
  useColorModeValue,
  TagLeftIcon,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaRegHeart } from "react-icons/fa";

const CoursePage = () => {
  return (
    <>
      <Box p={10}>
        <Grid templateColumns={"1fr 1fr"} gap={4}>
          <Box p={8}>
            <Image
              rounded={12}
              objectFit={"fill"}
              src="https://res.cloudinary.com/dsckn1jjj/image/upload/v1711674121/taskManager/WhatsApp%20Image%202024-03-29%20at%2006.31.01_b00d028f.jpg"
              maxH={450}
              minW="100%"
            />
          </Box>
          <Box p={8}>
            <Flex justify={"space-between"}>
              <Heading as="h3" size="lg">
                UI/UX Course 2024 Adobe XD
              </Heading>
              <Tag variant="outline" p={2}>
                <TagLeftIcon boxSize="14px" as={StarIcon} />
                <TagLabel>4.5</TagLabel>
              </Tag>
            </Flex>
            <Flex my={6} gap={4}>
              <Wrap>
                <WrapItem>
                  <Avatar
                    borderRadius={10}
                    name="Dan Abrahmov"
                    objectFit="contain"
                    src="https://res.cloudinary.com/dsckn1jjj/image/upload/v1711674121/taskManager/WhatsApp%20Image%202024-03-29%20at%2006.31.01_b00d028f.jpg"
                  />
                </WrapItem>
              </Wrap>
              <Box>
                <Text fontWeight={"bold"} fontSize={"lg"}>
                  Dan Abrahmov
                </Text>
                <Text
                  fontSize={"sm"}
                  color={useColorModeValue("gray", "gray.400")}
                  fontFamily={"monospace"}
                >
                  UI Course Instructor
                </Text>
              </Box>
            </Flex>

            <Text mt={12}>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis,
              quia ipsam esse ad aperiam expedita, animi quas deleniti molestiae
              voluptate at consequuntur tenetur inventore exercitationem earum
              eligendi. Repellat, ut ad?
            </Text>

            <Grid templateColumns={"1fr 1fr 1fr"} gap={6} mt={8}>
              <Flex
                p={3}
                rounded={14}
                justify={"space-between"}
                border={"2px groove"}
                borderColor={"blue.600"}
                bg={useColorModeValue("blue.50", "unset")}
              >
                <Text color={useColorModeValue("gray.600", "gray.400")}>
                  Duration :
                </Text>
                <Text>16 Hours </Text>
              </Flex>
              <Flex
                p={3}
                rounded={14}
                justify={"space-between"}
                border={"2px groove"}
                borderColor={"blue.600"}
                bg={useColorModeValue("blue.50", "unset")}
              >
                <Text color={useColorModeValue("gray.600", "gray.400")}>
                  Status :
                </Text>
                <Text>Completed </Text>
              </Flex>
              <Flex
                p={3}
                rounded={14}
                justify={"space-between"}
                border={"2px groove"}
                borderColor={"blue.600"}
                bg={useColorModeValue("blue.50", "unset")}
              >
                <Text color={useColorModeValue("gray.600", "gray.400")}>
                  Students :
                </Text>
                <Text>2647 </Text>
              </Flex>
            </Grid>

            <Box bg={"blue.600"} p={4} mt={12} rounded={14}>
              <Grid templateColumns={"1fr 1fr"}>
                <Text fontSize={"2xl"} fontWeight={500} color={"white"}>
                  Rs. 500
                </Text>
                <Flex gap={4} justify={"end"}>
                  <Button color={"white"} bg={"crimson"} w={"50%"}>
                    Enroll Now
                  </Button>
                  <IconButton
                    color={"white"}
                    border={"2px"}
                    variant="outline"
                    aria-label="enroll now"
                    icon={<FaRegHeart fontSize={"1.2rem"} />}
                  />
                </Flex>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid p={8} templateColumns={"2fr 1fr"} gap={6}>
          <Box p={6} rounded={8} border={"3px groove"} borderColor={"blue.600"}>
            <Heading size={"md"} mb={4}>
              What you'll learn
            </Heading>
            <Grid templateColumns={"1fr 1fr"} gap={8}>
              <List spacing={5} fontSize={"sm"}>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Assumenda, quia temporibus eveniet a libero incidunt suscipit
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Quidem, ipsam illum quis sed voluptatum quae eum fugit
                </ListItem>
              </List>
              <List spacing={5} fontSize={"sm"}>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Assumenda, quia temporibus eveniet a libero suscipit
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} />
                  Quidem, ipsam illum quis sed voluptatum quae eum fugi
                </ListItem>
              </List>
            </Grid>
          </Box>
          <Box rounded={8} border={"3px groove"} borderColor={"blue.600"}>
            Some Content
          </Box>
          <Box mt={6}>
            <Accordion allowToggle rounded={12} gap={6}>
              <AccordionItem>
                <h2>
                  <AccordionButton
                    _expanded={{ bg: "blue.600", color: "white" }}
                  >
                    <Box as="span" flex="1" textAlign="left">
                      Module 1
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton
                    _expanded={{ bg: "blue.600", color: "white" }}
                  >
                    <Box as="span" flex="1" textAlign="left">
                      Module 2
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton
                    _expanded={{ bg: "blue.600", color: "white" }}
                  >
                    <Box as="span" flex="1" textAlign="left">
                      Module 3
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Grid>
      </Box>
    </>
  );
};

export default CoursePage;

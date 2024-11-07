import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaRegCirclePlay } from "react-icons/fa6";
import { MdOutlineAccessTime } from "react-icons/md";
import { modules } from "../utils/constant";

export default function CourseModules() {
  const [expandedModuleIndex, setExpandedModuleIndex] = useState<any>([]);

  const toggleModule = (index: number) => {
    const isIndexPresent = expandedModuleIndex.includes(index);
    const newIndexes = isIndexPresent
      ? expandedModuleIndex.filter((i: number) => i !== index)
      : [...expandedModuleIndex, index];

    setExpandedModuleIndex(newIndexes);
  };

  const moduleBg = useColorModeValue("gray.100", "gray.700");

  return (
    <>
      <Box>
        <Flex align={"center"} justify={"space-between"}>
          <Heading fontSize={"1.4rem"} mb={4}>
            Course Modules
          </Heading>
          <Text color={"gray"} fontSize={"sm"}>
            5 Sections / 17 Lectures / 5 hrs
          </Text>
        </Flex>
        {modules.map((module, index) => (
          <Accordion
            key={module.id}
            allowMultiple
            shadow="inset rgb(0 0 0 / 15%) 0px 0px 6px"
            rounded={12}
            bg={moduleBg}
            p={1}
            mb={4}
          >
            <AccordionItem border={"none"}>
              <AccordionButton onClick={() => toggleModule(index)}>
                <Box as="span" flex="1" textAlign="left">
                  {module.title}
                </Box>
                {expandedModuleIndex.includes(index) ? (
                  <MinusIcon fontSize="14px" />
                ) : (
                  <AddIcon fontSize="14px" />
                )}
              </AccordionButton>
              <AccordionPanel>
                {module.topics.map((topic, topicIndex) => (
                  <Flex key={topicIndex} justify={"space-between"} mb={3}>
                    <Flex gap={2} align={"center"}>
                      <FaRegCirclePlay fontSize={"20px"} />
                      <Text
                        _hover={{
                          textDecoration: "underline",
                          color: "telegram.700",
                          cursor: "pointer",
                        }}
                      >
                        {topic.title}
                      </Text>
                    </Flex>
                    <Tag variant="subtle">
                      <TagLeftIcon boxSize="16px" as={MdOutlineAccessTime} />
                      <TagLabel mb={"0.5"}>{topic.duration}</TagLabel>
                    </Tag>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ))}
      </Box>
    </>
  );
}

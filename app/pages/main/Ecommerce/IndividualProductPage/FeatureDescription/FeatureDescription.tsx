import {
  Box,
  Collapse,
  Flex,
  Heading,
  Icon,
  ListItem,
  UnorderedList,
  useDisclosure
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ProductFeatures = ({aboutItem}:any) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box
      border="1px solid #E2E8F0"
      borderRadius="sm"
      p={3}
      cursor="pointer"
      onClick={onToggle}
      w={"100%"}
    >
      <Heading size="sm">Product Features</Heading>
      <Collapse in={isOpen} animateOpacity startingHeight={210}>
        <Box mt={3}>
          {aboutItem.map((feature:any, index:number) => (
            <UnorderedList key={index}>
              <ListItem fontSize={"sm"} color={"gray.700"} py={1}>
                {feature.description}
              </ListItem>
            </UnorderedList>
          ))}
        </Box>
      </Collapse>
      <Flex justify="end" mt={2}>
        <Icon as={isOpen ? FaChevronUp : FaChevronDown} />
      </Flex>
    </Box>
  );
};

export default ProductFeatures;

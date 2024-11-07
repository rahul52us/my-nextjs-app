import {  
  Box,  
  Flex,  
  Heading,  
  HStack,  
  Image,  
  Text,  
  Avatar,  
  Button,  
  Icon,
  VStack,  
} from "@chakra-ui/react";  
import { FaStar, FaThumbsUp, FaThumbsDown } from "react-icons/fa";  

const ProductReviewCard = ({ review }:any) => {  
  const { reviewer, reviewText, rating, photos, likes, dislikes } =  
    review;  

  return (  
    <Box borderWidth={1} borderRadius="sm" overflow="hidden" p={3}>  
      <Flex direction={{ base: "column", md: "row" }} alignItems="center" justify={'space-between'}>  
        <Flex alignItems="center" mr={4} justify={'space-between'}>  
          <Avatar name={reviewer.name} src={reviewer.avatar} mr={4} />  
          <VStack align="start" spacing={1}>  
            <Heading size="sm" fontWeight="bold">  
              {reviewer.name}  
            </Heading>  
            <HStack spacing={1}>  
              {Array(5)  
                .fill("")  
                .map((_, i) => (  
                  <Icon  
                    as={FaStar}  
                    color={i < rating ? "blue.300" : "gray.300"}  
                    key={i}  
                  />  
                ))}  
            </HStack>  
            <Text fontSize="sm" color="gray.600">  
              {new Date(review.timestamp).toLocaleDateString()}  
            </Text>  
          </VStack>  

        </Flex>  

          <Flex alignItems="center" mt={2}>  
          <HStack spacing={2}>  
            <Button variant="ghost" colorScheme="blue" size={'sm'}>  
              <Icon as={FaThumbsUp} />  
              <Text ml={1}>{likes}</Text>  
            </Button>  
            <Button variant="ghost" colorScheme="blue" size={'sm'}>  
              <Icon as={FaThumbsDown} />  
              <Text ml={1}>{dislikes}</Text>  
            </Button>  
          </HStack>  
        </Flex>  
      </Flex>  
      <Box mt={1}>  
        <Text fontSize="sm">{reviewText}</Text>  
        <Flex gap={4} mt={2}>  
          {photos.map((photo:any, index:any) => (  
            <Image  
              key={index}  
              src={photo}  
              boxSize="4.5rem"  
              alt={`Review Image ${index + 1}`}  
              borderRadius="md"  
              objectFit="cover"  
            />  
          ))}  
        </Flex>  
      
      </Box>  
    </Box>  
  );  
};  

export default ProductReviewCard;
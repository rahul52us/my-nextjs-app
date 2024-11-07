// CampCard.tsx  
import React from 'react';  
import { Box, Flex, Icon, Text } from '@chakra-ui/react';  
import { FaPencilAlt } from 'react-icons/fa';  

interface CampCardProps {  
  title: string;  
  description: string;  
}  

const CampCard: React.FC<CampCardProps> = ({ title, description }) => {  
  return (  
    <Box p={2} maxW={"xs"}>  
      <Flex align={"center"} gap={4}>  
        <Icon  
          as={FaPencilAlt}  
          p={2}  
          boxSize={"12"}  
          color={"black"}  
          bg={"white"}  
          rounded={"30%"}  
        />  
        <Text fontSize={"xl"} fontWeight={700} mb={2}>  
          {title}  
        </Text>  
      </Flex>  
      <Text fontSize={"sm"} fontWeight={500} mt={2}>  
        {description}  
      </Text>  
    </Box>  
  );  
};  

export default CampCard;
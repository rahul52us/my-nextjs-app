import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { getCustomTextDate } from "../../../../../../config/constant/dateUtils";

const BlogViewDetail = ({item} : any) => {
  return (
    <Flex gap={3} mb={6}>
      <Box>
        <Avatar
          src={item?.createdBy?.pic?.url || undefined}
          aria-label={item?.createdBy?.name}
          name={item?.createdBy?.name}
          // alt={item?.createdBy?.name}
          style={{ width: "40px", height: "40px" }}
          borderRadius={5}
        />
      </Box>
      <Box>
        <Box display="flex" fontSize="sm" gap={1}>
          <Text color="gray.600" fontWeight={600}>
            {item?.createdBy?.name}
          </Text>
        </Box>
        <Text fontSize="xs" color="gray.600" fontWeight={600}>
          {getCustomTextDate('Posted on',item?.createdAt)}
        </Text>
      </Box>
    </Flex>
  );
};
export default BlogViewDetail;
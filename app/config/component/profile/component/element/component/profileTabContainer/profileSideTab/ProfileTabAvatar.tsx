import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";

const ProfileTabAvatar = ({ profileData }: any) => {
  const [loadProfileImage, setLoadProfileImage] = useState(false)
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      maxH="max-content"
    >
      <Box bgColor="#ff6575" p={6} borderRadius="lg 0 0 0">
        <Flex justifyContent="center" mb={4}>
          {
            loadProfileImage ?
            <Avatar size="2xl" borderColor="white" borderWidth={4} /> :
            <Avatar onError={() => {setLoadProfileImage(true)}} size="2xl" src={profileData?.pic || 'https://scontent.fbho4-4.fna.fbcdn.net/v/t39.30808-6/344463938_1296266511234177_6930527913844228528_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=C4zrX-yM-YkAX9RiP7m&_nc_oc=AQkaQG_OKdqtmcc5a-xZ9Y27zWEdNykcIYe_TOO0bLH2iZ4mxnmGL0iW1VyM1XZCJxKKqHimdZFgHKOS3JPGLCp_&_nc_ht=scontent.fbho4-4.fna&oh=00_AfAZnsb61lb-O7B3kbFfsnLvM9LmVx3LbSeRVWvn_pjL2g&oe=6582EE14'} borderColor="white" borderWidth={4} />
          }
        </Flex>
        <Text fontWeight="bold" fontSize="xl" color="white" textAlign="center">
          {`${profileData?.firstName} ${profileData?.lastName}`}
        </Text>
        <Text mt={2} color="white" fontSize="sm" textAlign="center">
          Student
        </Text>
      </Box>
      <Box p={4} bgColor="white" borderRadius="0 0 lg lg">
        <Button
          width="100%"
          bgColor="#ff6575"
          _hover={{ backgroundColor: "#ff6575" }}
          color="white"
          borderRadius="md"
          fontSize="sm"
          fontWeight="bold"
        >
          Add New Course
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileTabAvatar;

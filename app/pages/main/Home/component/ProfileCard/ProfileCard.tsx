import {
  Badge,
  Box,
  Grid,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import { formatDate } from "../../../../Dashboard/Users/PersonalDetails/component/utils/constant";

type ProfileCardI = {
  user?: any;
};

function ProfileCard({ user }: ProfileCardI) {
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const boxShadow = useColorModeValue(
    "0px 0px 11px rgba(0, 0, 0, 0.2)",
    "0px 0px 11px rgba(255, 255, 255, 0.1)"
  );
  // console.log("user-----------", user);
  return (
    <Box>
      <Grid p={4} rounded={12} bg={bgColor} boxShadow={boxShadow}>
        <Grid templateColumns={{ base: "1fr", md: "2fr 3fr" }} gap={2}>
          <Grid
            templateRows={"6fr 1fr"}
            alignItems="center"
            justifyContent={"center"}
          >
            <Image
              rounded={12}
              boxSize={{ base: "295px", md: "200px" }}
              objectFit={"cover"}
              src={user?.pic?.url || "https://via.placeholder.com/300x400?text=No+thumbnail+found"}
              alt={user?.name}
            />
            <Text
              textAlign={"center"}
              fontSize={"2xl"}
              fontWeight={700}
              textTransform={"capitalize"}
            >
              {user?.name}
            </Text>
          </Grid>

          <Grid
            templateColumns={{ base: "1fr 1fr", md: "1fr 1.25fr" }}
            columnGap={2}
          >
            <Text fontWeight={500}>Code:</Text>
            <Badge
              w={"fit-content"}
              size={"lg"}
              h={"fit-content"}
              colorScheme={"telegram"}
            >
              {user?.code}
            </Badge>

            <Text fontWeight={500}>DOJ:</Text>
            <Text>23 june</Text>

            <Text fontWeight={500}>Department:</Text>
            <Text>{user?.department[0]?.title}</Text>

            <Text fontWeight={500}>Designation:</Text>
            <Text textTransform={"capitalize"}>
              {user?.designation[0]?.title}
            </Text>

            <Text fontWeight={500}>City:</Text>
            <Text>{user?.profiledetails[0]?.addressInfo[0]?.city}</Text>

            {/* <Text fontWeight={500}>Blood Group:</Text>
            <Text>23 june</Text> */}

            <Text fontWeight={500}>DOB:</Text>
            <Text>{formatDate(user?.profiledetails[0]?.dob)}</Text>

            <Text fontWeight={500}>Personal Email:</Text>
            <Text>{user?.profiledetails[0]?.personalEmail}</Text>

            <Text fontWeight={500}>Mobile:</Text>
            <Text>{user?.profiledetails[0]?.mobileNo}</Text>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfileCard;

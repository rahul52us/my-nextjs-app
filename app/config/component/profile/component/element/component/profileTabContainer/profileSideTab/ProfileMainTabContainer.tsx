import { observer } from "mobx-react-lite";
import ProfileTabAvatar from "./ProfileTabAvatar";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import ProfileTabContainer from "./ProfileTabContainer";

const ProfileMainTabContainer = observer(
  ({ profileData, type, sideTab, editTabLink }: any) => {
    return (
      <Flex direction="column" columnGap={4}>
        <Box boxShadow="md" borderRadius="md" mb={3} borderColor={useColorModeValue("gray.200", "gray.600")}>
          <ProfileTabAvatar profileData={profileData} type={type} />
        </Box>
        <Box p={2} boxShadow="md" borderRadius="md" height="100%" borderColor={useColorModeValue("gray.200", "gray.600")} borderWidth="1px">
          <ProfileTabContainer
            type={type}
            sideTab={sideTab}
            editTabLink={editTabLink}
          />
        </Box>
      </Flex>
    );
  }
);

export default ProfileMainTabContainer;

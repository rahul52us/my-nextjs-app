import { Box, Grid, useBreakpointValue } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import ProfileBanner from "./component/ProfileBanner";
import { observer } from "mobx-react-lite";
import ProfileChangePassword from "./component/TabsComponent/ProfileChangePassword";
import ProfileEdit from "./component/element/component/ProfileFormContainer/element/ProfileEdit/ProfileEdit";
import ProfileView from "./component/element/component/ProfileFormContainer/element/ProfileView/ProfileView";
import ProfileMainTabContainer from "./component/element/component/profileTabContainer/profileSideTab/ProfileMainTabContainer";
import ProfileHeaderTab from "./component/element/component/profileTabContainer/profileHeaderTab/ProfileHeaderTab";

const ProfileContainer = observer(
  ({
    profileData,
    editTabLink,
    type,
    sideTab,
    changePassword,
    handleSubmitProfile,
    initialValues,
    validations,
  }: any) => {
    const LargerThanMd = useBreakpointValue({ xl: true });
    const location = useLocation();

    const tab: any = new URLSearchParams(location.search).get("profileTab");

    const getEditActiveComponent = ({
      profileData,
      type,
      changePassword,
      handleSubmitProfile,
    }: any) => {
      switch (tab) {
        case "edit":
          return (
            <ProfileEdit
              type={type}
              profileData={profileData}
              handleSubmitProfile={handleSubmitProfile}
              initialValues={initialValues}
              validations={validations}
            />
          );
        case "change-password":
          return <ProfileChangePassword changePassword={changePassword} />;
        default:
          return <ProfileView type={type} profileData={profileData} />;
      }
    };

    const getCreateActiveComponent = () => {
      switch (type) {
        case "create":
          return (
            <ProfileEdit
              type={type}
              profileData={profileData}
              handleSubmitProfile={handleSubmitProfile}
              initialValues={initialValues}
              validations={validations}
            />
          );
        default:
          return (
            <ProfileEdit
              type={type}
              profileData={profileData}
              handleSubmitProfile={handleSubmitProfile}
              initialValues={initialValues}
              validations={validations}
            />
          );
      }
    };

    return (
      <Box
        mt={5}
        style={{
          marginLeft: LargerThanMd ? "80px" : "0",
          marginRight: LargerThanMd ? "80px" : "2px",
        }}
      >
        <ProfileBanner />
        <Box position="sticky" top={0} zIndex="sticky" display="none">
          <ProfileHeaderTab
            editTabLink={editTabLink}
            profileData={profileData}
            type={type}
            sideTab={sideTab}
          />
        </Box>
        <Grid gridTemplateColumns={{ lg: "0.35fr 1fr" }} gap={5} mt={3} mb={10}>
            <ProfileMainTabContainer
              profileData={profileData}
              type={type}
              sideTab={sideTab}
              editTabLink={editTabLink}
            />
          <Box border="1px solid #e9ecef" borderRadius={5}>
            {type === "edit"
              ? getEditActiveComponent({
                  profileData,
                  type,
                  changePassword,
                  handleSubmitProfile,
                })
              : getCreateActiveComponent()}
          </Box>
        </Grid>
      </Box>
    );
  }
);

export default ProfileContainer;

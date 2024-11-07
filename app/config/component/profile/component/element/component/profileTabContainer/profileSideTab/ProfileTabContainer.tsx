import { Box, Heading, useColorMode } from "@chakra-ui/react";
import TabElement from "./element/TabElement";
import { observer } from "mobx-react-lite";

const ProfileTabContainer = observer(({ type, sideTab, editTabLink }: any) => {
  const {colorMode} = useColorMode()
  return (
    <Box p={4} borderRadius="lg">
      {sideTab &&
        sideTab.map((item: any, index: number) => {
          return (
            <Box
              key={index}
              mb={3}
            >
              {item.heading && (
                <Heading fontSize="lg" color={colorMode === "light" ? "white.500" : "white.500"} mb={4} mt={3}>
                  {item.heading}
                </Heading>
              )}
              <TabElement
                Icon={item.icon}
                title={item.title}
                path={item.path}
                type={type}
                editTabLink={editTabLink}
              />
            </Box>
          );
        })}
    </Box>
  );
});

export default ProfileTabContainer;

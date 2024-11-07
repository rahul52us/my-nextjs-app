import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FiMoreVertical } from "react-icons/fi";
import { useParams } from "react-router-dom";
import MainBlogContainer from "../../Blog/component/mainBlogCotainer/MainBlogContainer";

const tabContents = [
  "Home Content",
  "About Content",
  "Video Content",
  "Blog Content",
];

const backgroundImageUrl =
  "https://miro.medium.com/v2/resize:fit:5880/1*ZHmzChivsHJ71QxTFnvp-g.jpeg";

const IndividualMain = observer(() => {
  const { colorMode } = useColorMode();
  const { individualCompany } = useParams();
  const tabNames = [
    { name: `${individualCompany}`, title: "Home" },
    { name: `${individualCompany}/About`, title: "About" },
    { name: `${individualCompany}/Videos`, title: "Videos" },
    { name: `${individualCompany}/Blogs`, title: "Blogs" },
  ];
  const [selectedTab, setSelectedTab] = useState(0); // Use an index

  const handleTabChange = (index: number) => setSelectedTab(index);

  // Select the Tab for the specific page
  const RenderSelectedTab = () => {
    switch (selectedTab) {
      case 0: // Home
        return <h1>This is Home Page</h1>;
      case 1: // About
        return <h1>This is About Page</h1>;
      case 2: // Videos
        return <h1>This is Video Page</h1>;
      case 3: // Blogs
        return <MainBlogContainer />;
      default:
        return null;
    }
  };

  return (
    <Box
      width="100%"
      paddingX={{ base: "0rem", md: "2rem", lg: "4rem", xl: "5rem" }}
      transition="background 0.3s ease"
    >
      <Box
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "150px",
        }}
      />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        mt={{ base: 3, md: 5 }}
        mb={{ base: 3, md: 5 }}
        transition="color 0.3s ease"
      >
        <Text
          fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          fontWeight="bold"
          mb={{ base: 3, md: 0 }}
        >
          {individualCompany?.split("-").join(" ")}
        </Text>
        <Icon as={FiMoreVertical} w={6} h={6} color="gray.500" />
      </Flex>
      <Tabs
        isFitted
        variant="enclosed"
        size="sm"
        colorScheme={colorMode === "light" ? "teal" : "teal"}
        index={selectedTab} // Use the index here
        onChange={handleTabChange}
        transition="background 0.3s ease"
      >
        <TabList>
          {tabNames.map((name, index) => (
            <Tab
              key={index}
              fontSize="md" // Use a valid font size
              transition="background 0.3s ease"
            >
              {name.title}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabContents.map((_, index) => (
            <TabPanel key={index}>{RenderSelectedTab()}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
});

export default IndividualMain;

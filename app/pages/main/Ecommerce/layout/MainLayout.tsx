import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Box, useColorModeValue, useMediaQuery, useTheme } from "@chakra-ui/react";
import styled from "styled-components";
import Header from "./component/Header";
import Loader from "../../../../config/component/Loader/Loader";
import FooterLayout from "../../../../config/layout/MainLayout/FooterLayout/FooterLayout";
import { largeHeaderHeight, smallHeaderHeight } from "../common/constant";

const EcommerceLayout = observer(() => {
  const theme = useTheme();
  const location = useLocation();
  const [sizeStatus] = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);

  // Scroll to top when the location changes (new page is opened)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      style={{
        backgroundColor: useColorModeValue("#ffffff", "#1A202C"),
      }}
    >
      <Box>
      <Header />
      </Box>
      <ContentContainer sizeStatus={sizeStatus}>
        <Suspense fallback={<Loader height="90vh" />}>
          <Outlet />
        </Suspense>
        <FooterLayout />
      </ContentContainer>
    </div>
  );
});

const ContentContainer = styled.div<{ sizeStatus: Boolean }>`
  margin-top: ${({ sizeStatus }) =>
    sizeStatus ? smallHeaderHeight : largeHeaderHeight};
  overflow-x: hidden;
  transition: all 0.3s ease-in-out;
  &.fullscreen {
    width: 100vw;
    transition: width 0.3s ease-in-out;
  }
`;

export default EcommerceLayout;
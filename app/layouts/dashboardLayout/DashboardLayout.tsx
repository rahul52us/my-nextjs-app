'use client';

import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Spinner,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useMediaQuery,
  useTheme,
} from '@chakra-ui/react';
import styled from 'styled-components';
import stores from '../../store/stores';
import SidebarLayout from './SidebarLayout/SidebarLayout';
import HeaderLayout from './HeaderLayout/HeaderLayout';
import {
  contentLargeBodyPadding,
  contentSmallBodyPadding,
  headerHeight,
  mediumSidebarWidth,
} from '../../component/config/utils/variable';
import ThemeChangeContainer from '../../component/common/ThemeChangeContainer/ThemeChangeContainer';
import PageLoader from '../../component/common/Loader/PageLoader';
import React from 'react';

const DashboardLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    auth: { user },
    layout: {
      fullScreenMode,
      mediumScreenMode,
      isCallapse,
      openDashSidebarFun,
      openMobileSideDrawer,
      setOpenMobileSideDrawer,
    },
    themeStore: { themeConfig },
  } = stores;

  const [isReady, setIsReady] = useState(false); // 👈 Delay flag
  const theme = useTheme();
  const [sizeStatus] = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const closeDrawerModel = () => {
    setOpenMobileSideDrawer(false);
  };

  const handleSidebarItemClick = (item: any) => {
    if (!item.children || item.url) {
      localStorage.setItem('activeComponentName', item.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        openDashSidebarFun(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCallapse, openDashSidebarFun]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (!isReady || !user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw"
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.65s"
          color="blue.500"
          mb={4}
        />
        <Text
          fontSize="lg"
          color={useColorModeValue('gray.700', 'gray.300')}
          fontWeight="medium"
        >
          Loading Dev Tools...
        </Text>
      </Box>
    );
  }


  return (
    <Box>
      <MainContainer $isMobile={isMobile}>
        <Box ref={sidebarRef}>
          <SidebarLayout
            onItemClick={handleSidebarItemClick}
            isCollapsed={isCallapse}
            onLeafItemClick={handleSidebarItemClick}
            openMobileSideDrawer={openMobileSideDrawer}
            setOpenMobileSideDrawer={closeDrawerModel}
          />
        </Box>
        <Container $fullScreenMode={fullScreenMode}>
          <HeaderContainer
            $isMobile={isMobile}
            $sizeStatus={sizeStatus}
            $mediumScreenMode={mediumScreenMode}
            $fullScreenMode={fullScreenMode}
            $backgroundColor={useColorModeValue(
              themeConfig.colors.custom.light.primary,
              themeConfig.colors.custom.dark.primary
            )}
          >
            <HeaderLayout />
          </HeaderContainer>
          <ContentContainer
            $isMobile={isMobile}
            $mediumScreenMode={mediumScreenMode}
            $fullScreenMode={fullScreenMode}
            $sizeStatus={sizeStatus}
          >
            {children}
          </ContentContainer>
        </Container>
      </MainContainer>
      <ThemeChangeContainer />
    </Box>
  );
});

export default DashboardLayout;

// ✅ Styled Components
const MainContainer = styled.div<{ $isMobile: boolean }>`
  display: flex;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  margin-left: ${(props) => (props.$isMobile ? '0px' : mediumSidebarWidth)};
  box-sizing: border-box;
`;

const Container = styled.div<{ $fullScreenMode: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
`;

const HeaderContainer = styled.div<{
  $fullScreenMode: boolean;
  $sizeStatus: boolean;
  $mediumScreenMode: boolean;
  $backgroundColor: string;
  $isMobile: boolean;
}>`
  z-index: 99;
  height: ${headerHeight};
  position: fixed;
  top: 0;
  right: 0;
  left: ${(props) => (props.$isMobile ? '0px' : mediumSidebarWidth)};
  background-color: ${(props) => props.$backgroundColor};
  transition: all 0.3s ease-in-out;
`;

const ContentContainer = styled.div<{
  $sizeStatus: boolean;
  $fullScreenMode: boolean;
  $mediumScreenMode: boolean;
  $isMobile: boolean;
}>`
  padding: ${({ $isMobile }) =>
    $isMobile ? contentSmallBodyPadding : contentLargeBodyPadding};
  width: 100%;
  overflow-x: hidden;
  height: calc(100vh - ${headerHeight});
  transition: all 0.3s ease-in-out;
  margin-top: ${headerHeight};
  box-sizing: border-box;
`;

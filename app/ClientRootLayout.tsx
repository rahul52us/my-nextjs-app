'use client';

import { observer } from 'mobx-react-lite';
import { ChakraProvider, CSSReset, extendTheme } from '@chakra-ui/react';
import { fonts, breakpoints, components, styles } from './theme/theme';
import MainLayout from './layouts/mainLayout/MainLayout';
import AuthenticationLayout from './layouts/authenticationLayout/AuthenticationLayout';
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import stores from './store/stores';
import Notification from './component/common/Notification/Notification';
import React from 'react';

const ClientRootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    companyStore: { getCompanyDetails },
  } = stores;
  const pathname = usePathname();

  useEffect(() => {
    getCompanyDetails();
  }, [getCompanyDetails]);

  const theme = extendTheme({
    ...stores.themeStore.themeConfig,
    fonts,
    breakpoints,
    components,
    styles,
  });

  const getLayout = () => {
    if (['/login', '/register', '/forgot-password'].includes(pathname)) {
      return AuthenticationLayout;
    } else if (pathname.startsWith('/')) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Notification />
      <LayoutComponent>{children}</LayoutComponent>
    </ChakraProvider>
  );
});

export default ClientRootLayout;

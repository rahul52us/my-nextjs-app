'use client';

import { observer } from 'mobx-react-lite';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { theme } from './theme/theme';
import MainLayout from './layouts/mainLayout/MainLayout';
import AuthenticationLayout from './layouts/authenticationLayout/AuthenticationLayout';
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import stores from './store/stores';
import Notification from './component/common/Notification/Notification';
import SeoHead from './component/config/component/SeoHead/SeoHead';
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from './config/utils/variables';
import React from 'react';

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    companyStore: { getCompanyDetails },
  } = stores;
  const pathname = usePathname();

  useEffect(() => {
    getCompanyDetails();
  }, [getCompanyDetails]);

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
    <html lang="en">
      <SeoHead title={WEBSITE_TITLE} description={WEBSITE_DESCRIPTION} />
      <body>
        <ChakraProvider theme={theme}>
          <CSSReset />
          <Notification />
          <LayoutComponent>{children}</LayoutComponent>
        </ChakraProvider>
      </body>
    </html>
  );
});

export default RootLayout;

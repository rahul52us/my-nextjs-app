"use client";

import { observer } from "mobx-react-lite";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/theme";
import { lato } from "./theme/theme";
import MainLayout from "./layouts/mainLayout/MainLayout";
import AuthenticationLayout from "./layouts/authenticationLayout/AuthenticationLayout";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import stores from "./store/stores";
import Notification from "./component/common/Notification/Notification";
import { Montserrat } from "next/font/google";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import SeoHead from "./component/config/component/SeoHead/SeoHead";
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "./config/utils/variables";
import React from "react";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const { companyStore: { getCompanyDetails } } = stores;
  const pathname = usePathname();

  useEffect(() => {
    getCompanyDetails();
  }, [getCompanyDetails]);

  const getLayout = () => {
    if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
      return AuthenticationLayout;
    } else if (pathname.startsWith("/")) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();

  return (
    <html lang="en">
        {/* ✅ SEO */}
        <SeoHead
          title={WEBSITE_TITLE}
          description={WEBSITE_DESCRIPTION}
        />

      <body className={`${lato.className} ${montserrat.className}`}>
        {/* ✅ Google Tag Manager (noscript fallback) */}
        <ChakraProvider theme={theme}>
          <Notification />
          <LayoutComponent>{children}</LayoutComponent>
        </ChakraProvider>
      </body>
    </html>
  );
});

export default RootLayout;
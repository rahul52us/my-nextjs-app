import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { ParallaxBanner, ParallaxProvider } from "react-scroll-parallax";

interface ParallaxSectionProps extends BoxProps {
  imageUrl: string;
  children: React.ReactNode;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  imageUrl,
  children,
  ...rest
}) => {
  return (
    <ParallaxProvider>
      <ParallaxBanner
        layers={[
          { image: imageUrl, speed: -20 }, // Background image layer
          {
            children: (
              <Box h="100%" width="100%" pt={28} pb={6}>
                {children}
              </Box>
            ),
            speed: 8, // Speed for the moving content
          },
        ]}
        style={{
          height: "80vh",
          backgroundColor: "#008c99",
        }} // Customize this height
      >
        <Box h="100%" width="100%" {...rest} />
      </ParallaxBanner>
    </ParallaxProvider>
  );
};

export default ParallaxSection;
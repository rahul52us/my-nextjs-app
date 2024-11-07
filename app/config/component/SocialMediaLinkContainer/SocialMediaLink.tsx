import { Flex } from "@chakra-ui/react";
import SocialMediaLinkLogo from "./element/SocialMediaLinkLogo";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const SocialMediaLink = ({iconColor} : any) => {

  return (
    <Flex alignItems={"center"} gap={5}>
      <SocialMediaLinkLogo
        title="Facebook"
        icon={<FaFacebook />}
        hoverColor={iconColor}
        color="white"
      />
      <SocialMediaLinkLogo
        title="Instagram"
        icon={<FaInstagram />}
        hoverColor={iconColor}
        color="white"
      />
      <SocialMediaLinkLogo
        title="LinkedIn"
        icon={<FaLinkedin />}
        hoverColor={iconColor}
        color="white"
      />
      <SocialMediaLinkLogo
        title="Twitter"
        icon={<FaTwitter />}
        hoverColor={iconColor}
        color="white"
      />
    </Flex>
  );
};

export default SocialMediaLink;

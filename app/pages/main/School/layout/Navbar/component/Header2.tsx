import {
    Button,
    Flex,
    IconButton,
    Image,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useDisclosure,
    Stack,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    useColorMode,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { useState, useMemo, useCallback } from "react";
  import { FaBars, FaSun, FaMoon } from "react-icons/fa";
import { largeHeaderHeight } from "../../common/constant";

  interface LinkConfig {
    id: string;
    name: string;
    isButton?: boolean;
  }

  interface HeaderProps {
    scrollToSection: (linkId: string) => void;
    linksConfig?: LinkConfig[];
    colors: any;
    metaData: any;
  }

  const Header2: React.FC<HeaderProps> = ({
    scrollToSection,
    linksConfig = [],
    colors,
    metaData,
  }) => {
    const [activeLink, setActiveLink] = useState<string>("home");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();

    const contactButtonColor = useColorModeValue(
      colors?.buttonColor?.light,
      colors?.buttonColor?.dark
    );
    const buttonTextColor = useColorModeValue(
      colors?.buttonTextColor?.light,
      colors?.buttonTextColor?.dark
    );
    const dropdownMenuColor = useColorModeValue("white", "gray.700");
    const menuHoverColor = useColorModeValue("black", "white");

    const handleLinkClick = useCallback((linkId: string) => {
      setActiveLink(linkId);
      scrollToSection(linkId);
    },[setActiveLink,scrollToSection]);

    const linkElements = useMemo(() => (
      linksConfig.map((link : any) => (
        <Link
          key={link.id}
          fontSize={{ base: "md", md: "lg" }}
          color={activeLink === link.id ? colors?.headingColor?.light : colorMode === "dark" ? colors?.headingColor?.dark : colors?.headingColor?.light}
          onClick={() => handleLinkClick(link.id)}
          _hover={{ color: menuHoverColor, textDecoration: "underline" }}
        >
          {link.label?.charAt(0).toUpperCase() + link?.label?.slice(1)}
        </Link>
      ))
    ), [activeLink, colorMode, colors, linksConfig, handleLinkClick, menuHoverColor]);

    return (
      <Flex
        as="header"
        align="center"
        p={4}
        justify="space-between"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="md"
        height={largeHeaderHeight}
      >
        {/* Logo */}
        <Image src={metaData?.faviconUrl} alt={metaData?.name} h="4rem" cursor="pointer" ml={4} />

        {/* Desktop Navigation */}
        <Flex display={{ base: "none", md: "flex" }} gap={8} align="center">
          {linkElements.slice(0, 5)}
          {linksConfig.length > 5 && (
            <Menu>
              <MenuButton as={Text} cursor="pointer" px={3} py={1} fontWeight="500">
                More
              </MenuButton>
              <MenuList bg={dropdownMenuColor}>
                {linksConfig.slice(5).map((link) => (
                  <MenuItem key={link.id} onClick={() => handleLinkClick(link.id)}>
                    {link.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </Flex>

        {/* Actions: Color Toggle, Contact Button, Mobile Menu */}
        <Flex align="center">
          <IconButton
            icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
            variant="outline"
            mr={2}
          />

          {linksConfig.find((link) => link.id === "contact") && (
            <Button
              display={{ base: "none", md: "inline-flex" }}
              bg={contactButtonColor}
              color={buttonTextColor}
              borderRadius="full"
              onClick={() => handleLinkClick("contact")}
              px={6}
              mr={4}
            >
              Contact
            </Button>
          )}

          <IconButton
            icon={<FaBars />}
            aria-label="Open menu"
            onClick={onOpen}
            display={{ base: "flex", md: "none" }}
            variant="outline"
          />
        </Flex>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <Stack spacing={4} mt={4}>
                {linksConfig.map((link) => (
                  <Button
                    key={link.id}
                    w="full"
                    onClick={() => {
                      handleLinkClick(link.id);
                      onClose();
                    }}
                    variant="ghost"
                  >
                    {link.name}
                  </Button>
                ))}
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    );
  };

  export default Header2;

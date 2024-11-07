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
import { useState, useMemo } from "react";
import { FaBars, FaSun, FaMoon } from "react-icons/fa";
import { largeHeaderHeight } from "../common/constant";

interface LinkConfig {
  id: string;
  name: string;
  isButton?: boolean; // Optional property if some links can be buttons
}

interface HeaderProps {
  scrollToSection: (linkId: string) => void; // Function to scroll to a section
  linksConfig?: LinkConfig[]; // Array of link configuration
  colors: any; // Assuming colors can be any object
  metaData: any; // Assuming metaData can be any object
}

const Header: React.FC<HeaderProps> = ({
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

  // Memoizing the link elements for performance
  const linkElements = useMemo(() => {
    return linksConfig.map((link) => (
      <Link
        key={link.id}
        fontSize={{ base: "md", md: "lg" }}
        position="relative"
        color={
          activeLink === link.id
            ? colors?.headingColor?.light
            : colorMode === "dark"
            ? colors?.headingColor?.dark
            : colors?.headingColor?.light
        }
        onClick={() => handleLinkClick(link.id)}
        _hover={{ color: menuHoverColor, textDecoration: "underline" }}
        _after={{
          content: '""',
          position: "absolute",
          width: activeLink === link.id ? "100%" : "0",
          height: "2px",
          bottom: "-4px",
          left: "0",
          bg: colors?.headingColor?.dark,
          transition: "width 0.3s ease",
        }}
        cursor="pointer"
      >
        {link.name.charAt(0).toUpperCase() + link.name.slice(1)}
      </Link>
    ));
  }, [activeLink, colorMode, colors, linksConfig]);

  const handleLinkClick = (linkId: string) => {
    setActiveLink(linkId);
    scrollToSection(linkId);
  };

  return (
    <Flex
      as="nav"
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
      transition="background-color 0.3s ease, box-shadow 0.3s ease"
    >
      <Flex align="center">
        <Image
          src={metaData?.faviconUrl}
          alt={metaData?.name}
          objectFit="contain"
          h="4rem"
          ml={4}
          cursor="pointer"
        />
      </Flex>
      <Flex
        gap={8}
        align="center"
        display={{ base: "none", md: "flex" }}
        fontWeight={500}
        color={colorMode === "dark" ? "white" : "gray.700"}
      >
        {linkElements.slice(0, 5)}
        <Menu>
          <MenuButton
            as={Text}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight={500}
            position="relative"
            color={
              colorMode === "dark"
                ? colors?.buttonColor?.dark
                : colors?.buttonColor?.light
            }
            _hover={{ color: menuHoverColor, borderRadius: "md" }}
            px={3}
            py={1}
            borderRadius="md"
            cursor="pointer"
            display={linksConfig.length > 5 ? undefined : "none"}
          >
            More
          </MenuButton>
          <MenuList
            bg={dropdownMenuColor}
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.600")}
            boxShadow="lg"
            rounded="md"
            minW="150px"
            mt={2}
            p={1}
            overflow="hidden"
          >
            {linksConfig.slice(5).map((link) => (
              <MenuItem
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                bg={dropdownMenuColor}
                _hover={{
                  bg: colors?.buttonColor?.light,
                  color: colors?.buttonTextColor?.dark,
                }}
                px={4}
                py={2}
                borderRadius="md"
                fontWeight="500"
              >
                {link.name.charAt(0).toUpperCase() + link.name.slice(1)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      <Flex align="center">
        <IconButton
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
          variant="outline"
          color={
            colorMode === "light"
              ? colors?.iconColor?.light
              : colors?.iconColor?.dark
          }
          mr={{ base: 2, md: 5 }}
        />

        <IconButton
          icon={<FaBars style={{ marginLeft: "10px" }} />}
          aria-label="Open menu"
          variant="outline"
          colorScheme="teal"
          onClick={onOpen}
          display={{ md: "none" }}
        />

        {linksConfig.find((link) => link.id === "contact") && (
          <Button
            display={{ base: "none", md: "inline-flex" }}
            bgColor={contactButtonColor}
            color={buttonTextColor}
            borderRadius="full"
            boxShadow="md"
            _hover={{
              bg: contactButtonColor,
              transform: "scale(1.05)",
              transition: "transform 0.3s ease",
            }}
            onClick={() => {
              const contactLink: any = linksConfig.find(
                (link: any) => link.id === "contact"
              );
              handleLinkClick(contactLink?.id);
            }}
            px={6}
          >
            {linksConfig &&
              (() => {
                const contactLink = linksConfig.find(
                  (link: any) => link.id === "contact"
                );
                return contactLink ? contactLink.name : null;
              })()}
          </Button>
        )}
      </Flex>

      {/* Drawer Menu */}
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
                  colorScheme="teal"
                >
                  {link.name}
                </Button>
              ))}
              <Menu>
                <MenuButton
                  as={Button}
                  w="full"
                  variant="ghost"
                  colorScheme="teal"
                >
                  Academics
                </MenuButton>
                <MenuList>
                  {linksConfig.slice(5).map(
                    (link) =>
                      !link.isButton && (
                        <MenuItem
                          key={link.id}
                          onClick={() => handleLinkClick(link.id)}
                        >
                          {link.name}
                        </MenuItem>
                      )
                  )}
                </MenuList>
              </Menu>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Header;

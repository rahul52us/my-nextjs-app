import {
  Box,
  Flex,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link as ChakraLink,
  Spacer,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaShoppingCart, FaUser, FaSun, FaMoon } from "react-icons/fa";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom"; // Import Link from React Router
import { largeHeaderHeight, smallHeaderHeight } from "../../common/constant";

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.100", "gray.900");

  return (
    <Box
      bg={bg}
      px={4}
      shadow="md"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="999"
    >
      <Flex
        height={{ base: smallHeaderHeight, md: largeHeaderHeight }}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Branding/Logo */}
        <Box fontWeight="bold" fontSize="xl">
          <ChakraLink as={Link} to="/">
            MyShop
          </ChakraLink>
        </Box>

        <Flex alignItems="center">
          {/* Menu for smaller screens */}
          <IconButton
            aria-label="Menu"
            icon={<HamburgerIcon />}
            display={{ base: "block", md: "none" }}
            mr={4}
          />

          {/* Navigation Links */}
          <Flex
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            mr={4}
          >
            <ChakraLink as={Link} to="/" mr={4}>
              Home
            </ChakraLink>
            <ChakraLink as={Link} to="/products" mr={4}>
              Products
            </ChakraLink>
            <ChakraLink as={Link} to="/contact" mr={4}>
              Contact
            </ChakraLink>
          </Flex>

          <Spacer />

          {/* User Menu */}
          <Menu>
            <MenuButton as={Button} rightIcon={<FaUser />}>
              Account
            </MenuButton>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Orders</MenuItem>
              <MenuItem>Sign Out</MenuItem>
            </MenuList>
          </Menu>

          {/* Cart Icon */}
          <IconButton
            aria-label="Shopping Cart"
            icon={<FaShoppingCart />}
            ml={4}
          />

          {/* Theme Toggle */}
          <IconButton
            aria-label="Toggle Theme"
            icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
            ml={4}
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;

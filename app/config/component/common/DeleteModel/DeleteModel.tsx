import {
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useColorMode,
} from "@chakra-ui/react";

interface DeleteModelPara {
  id: string;
  open: boolean;
  close: () => void;
  title: string;
  closeLabel?: string;
  deleteLabel?: string;
  submit?: (id: string) => void;
  loading?: boolean;
  children: React.ReactNode;
}

const DeleteModel = ({
  id,
  open,
  close,
  title,
  closeLabel,
  deleteLabel,
  submit,
  children,
  loading,
}: DeleteModelPara) => {
  const { colorMode } = useColorMode();

  const headerBgColor = colorMode === "dark" ? "blue.900" : "blue.500";
  const headerTextColor = colorMode === "dark" ? "white" : "white";

  return (
    <Modal isOpen={open} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        {title && (
          <Flex
            justify="space-between"
            align="center"
            p={4}
            bg={headerBgColor}
            color={headerTextColor}
            borderBottom="1px solid"
            borderBottomColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Text fontSize="xl">{title}</Text>
            <ModalCloseButton
              color={headerTextColor}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              size="lg"
              mt={1}
            />
          </Flex>
        )}
        <ModalBody p={0}>{children}</ModalBody>
        <Divider />
        <ModalFooter justifyContent="flex-end">
          <Button
            colorScheme="red"
            fontWeight="bold"
            onClick={submit?.bind(null, id)}
            isLoading={loading}
            mr={4}
          >
            {deleteLabel ? deleteLabel : "Delete"}
          </Button>
          <Button colorScheme="blue" onClick={close}>
            {closeLabel ? closeLabel : "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteModel;

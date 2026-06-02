import React from "react";
import { IconButton, useDisclosure } from "@chakra-ui/react";
import { FiMessageSquare } from "react-icons/fi";
import FeedbackModal from "./FeedbackModal";
import { authStore } from "../../store/authStore/authStore";
const FeedbackButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = authStore.user || {};
  return (
    <>
      <IconButton
        aria-label="Feedback"
        icon={<FiMessageSquare size={24} />}
        position="fixed"
        bottom="2rem"
        right="2rem"
        zIndex={1000}
        borderRadius="full"
        size="lg"
        bgGradient="linear(to-r, blue.500, purple.500)"
        color="white"
        boxShadow="0 10px 25px rgba(0,0,0,0.25)"
        _hover={{
          transform: "translateY(-4px) scale(1.05)",
          boxShadow: "0 15px 30px rgba(0,0,0,0.35)",
        }}
        transition="all 0.3s ease"
        onClick={onOpen}
      />
      <FeedbackModal
        isOpen={isOpen}
        onClose={onClose}
        defaultName={user?.name || ""}
        defaultEmail={user?.email || ""}
      />
    </>
  );
};
export default FeedbackButton;
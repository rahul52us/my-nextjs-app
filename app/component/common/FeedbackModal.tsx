import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultName = "",
  defaultEmail = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const modalBg = useColorModeValue(
    "rgba(255,255,255,0.95)",
    "rgba(26,32,44,0.95)"
  );

  const inputBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setEmail(defaultEmail);
    }
  }, [isOpen, defaultName, defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            message,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      await res.json();

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve!",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setName("");
      setEmail("");
      setMessage("");

      onClose();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay
        bg="blackAlpha.400"
        backdropFilter="blur(8px)"
      />

      <ModalContent
        bg={modalBg}
        backdropFilter="blur(20px)"
        borderRadius="24px"
        border="1px solid"
        borderColor="whiteAlpha.300"
        overflow="hidden"
        boxShadow="2xl"
      >
        <ModalHeader
          bgGradient="linear(to-r, blue.500, purple.500)"
          color="white"
          py={5}
          fontSize="xl"
          fontWeight="bold"
        >
          Share Your Feedback
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <Text
            mb={5}
            color={useColorModeValue("gray.600", "gray.300")}
            fontSize="sm"
          >
            Your feedback helps us improve the platform and create a better
            experience for everyone.
          </Text>

          <form id="feedback-form" onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>

              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg={inputBg}
                borderRadius="12px"
                size="lg"
                focusBorderColor="brand.400"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>

              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg={inputBg}
                borderRadius="12px"
                size="lg"
                focusBorderColor="purple.400"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Message</FormLabel>

              <Textarea
                placeholder="Tell us what you think..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                resize="none"
                bg={inputBg}
                borderRadius="12px"
                focusBorderColor="purple.400"
              />
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="ghost"
            borderRadius="12px"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            bgGradient="linear(to-r, blue.500, purple.500)"
            color="white"
            borderRadius="12px"
            px={8}
            type="submit"
            form="feedback-form"
            isLoading={loading}
            loadingText="Submitting..."
            _hover={{
              bgGradient: "linear(to-r, blue.600, purple.600)",
            }}
          >
            Send Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
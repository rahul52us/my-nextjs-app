'use client'

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { FaDownload, FaShareAlt } from "react-icons/fa";

const FileToAudio = () => {
  const [base64Input, setBase64Input] = useState<string>(""); // For the Base64 input string
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // For storing the decoded audio URL
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleBase64Input = () => {
    // Check if the input string is a valid Base64 string
    if (base64Input.startsWith("data:") && base64Input.includes("base64")) {
      setAudioUrl(base64Input); // Set the audio URL to the input Base64 string
      toast({
        title: "Audio Ready",
        description: "Audio file is ready to be played.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Invalid Base64",
        description: "The provided string is not a valid Base64 audio.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      // Create a Blob from the Base64 string
      const audioBlob = new Blob([new Uint8Array(atob(audioUrl.split(',')[1]).split("").map(char => char.charCodeAt(0)))], {
        type: "audio/mpeg"
      });

      // Use the file-saver library to download the file
      saveAs(audioBlob, "audio.mp3");
      toast({
        title: "Download Started",
        description: "The audio file is downloading.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "No Audio",
        description: "Please load a valid Base64 string first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = () => {
    if (audioUrl) {
      const audioBlob = new Blob([new Uint8Array(atob(audioUrl.split(',')[1]).split("").map(char => char.charCodeAt(0)))], {
        type: "audio/mpeg"
      });
      const file = new File([audioBlob], "audio.mp3", { type: "audio/mpeg" });

      // Check if the Share API is available
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Shared Audio File',
          text: 'Here is an audio file shared with you.',
        })
        .then(() => {
          toast({
            title: "Shared Successfully",
            description: "The audio file has been shared.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((error) => {
          console.error("Error sharing the file:", error);
          toast({
            title: "Share Failed",
            description: "Unable to share the file. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      } else {
        toast({
          title: "Share Not Supported",
          description: "Sharing is not supported on your device.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "No Audio",
        description: "Please load a valid Base64 string first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} bg={bgColor} color={textColor} minH='78vh'>
      <Heading
        as="h1"
        size="xl"
        color="teal.500"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="wider"
        mb={6}
        textTransform="uppercase"
      >
        Base64 to Audio
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="semibold">
            Paste Base64 Audio String
          </FormLabel>
          <Textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste Base64 string here"
            rows={6}
            bg={useColorModeValue("white", "gray.700")}
            rounded="md"
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleBase64Input}
          isDisabled={!base64Input}
        >
          Load Audio from Base64
        </Button>

        {audioUrl && (
          <Box mt={4}>
            <audio controls>
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <HStack>
            <Button
              colorScheme="green"
              mt={4}
              onClick={handleDownload}
              leftIcon={<FaDownload />}
            >
              Download Audio
            </Button>

            <Button
              colorScheme="purple"
              mt={4}
              onClick={handleShare}
              leftIcon={<FaShareAlt />}
            >
              Share Audio
            </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FileToAudio;

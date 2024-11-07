import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    VStack,
    WrapItem,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import {
    FaFileExcel,
    FaFileImage,
    FaFilePdf,
    FaFileWord,
  } from "react-icons/fa";
  import { FiMoreHorizontal, FiPaperclip } from "react-icons/fi";
  import { PiFilePptBold } from "react-icons/pi";
  import { HiDocumentRemove } from "react-icons/hi"; // For no documents icon
  import { ViewIcon } from "@chakra-ui/icons";
import ShowFileUploadFile from "../ShowFileUploadFile/ShowFileUploadFile";

  const FileIcon = ({ mimeType }: { mimeType: string }) => {
    const color = useColorModeValue("gray.600", "gray.300");

    // Extract the file type from the MIME type
    const type = mimeType?.split("/")[0];

    switch (type) {
      case "application":
        switch (mimeType) {
          case "application/pdf":
            return <Icon as={FaFilePdf} color="red.500" />;
          case "application/vnd.ms-word":
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <Icon as={FaFileWord} color="blue.500" />;
          case "application/vnd.ms-excel":
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return <Icon as={FaFileExcel} color="green.500" />;
          case "application/vnd.ms-powerpoint":
          case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return <Icon as={PiFilePptBold} color="orange.500" />;
          default:
            return <Icon as={FaFilePdf} color={color} />;
        }
      case "image":
        return <Icon as={FaFileImage} color="purple.500" />;
      default:
        return <Icon as={FaFilePdf} color={color} />;
    }
  };

  const AttachmentItem = ({ file }: any) => {
    return (
      <WrapItem>
        <Flex
          alignItems="center"
          borderWidth="1px"
          shadow="md"
          borderRadius="md"
          p={3}
          w="full"
          justifyContent="space-between"
          bg={useColorModeValue("white", "gray.700")}
        >
          <HStack spacing={3}>
            <FileIcon mimeType={file?.file ? file?.file[0]?.type : "unknown file"} />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold" isTruncated wordBreak={'break-word'} >
                {file?.file ? file?.file[0] ? file?.file[0]?.name?.slice(0,30) : "file not exists" : "file not exists"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {file?.file ? file?.file[0]?.type : "Unknown Size"}
              </Text>
            </VStack>
          </HStack>
          <ShowFileUploadFile
            edit={true}
            files={file?.file ? file.file[0] : []}
            showViewIcon={true}
          />
        </Flex>
      </WrapItem>
    );
  };

  const ShowAttachments = ({ attach_files = [] }: any) => {
    console.log('the attach files are', attach_files)
    const [showAll, setShowAll] = useState(false);

    const filesToShow = showAll ? attach_files : attach_files.slice(0, 4);

    return (
      <Box
        p={5}
        w="100%"
        bg={useColorModeValue("gray.50", "gray.800")}
        borderRadius="md"
        shadow="md"
      >
        <VStack spacing={4} align="stretch">
          <Flex
            justifyContent="space-between"
            alignItems="center"
            color={useColorModeValue("gray.600", "gray.300")}
          >
            <HStack>
              <Icon as={FiPaperclip} />
              <Text fontWeight="bold" fontSize="lg">
                Attachments ({attach_files.length})
              </Text>
            </HStack>

            <Flex align="end" gap={2}>
              <Button
                leftIcon={<ViewIcon />}
                colorScheme="blue"
                size="sm"
                variant="outline"
                display="none"
              >
                Upload
              </Button>
            </Flex>
          </Flex>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
            gap={4}
          >
            {filesToShow.length > 0
              ? filesToShow.map((file: any, index: number) => (
                  <AttachmentItem key={index} file={file} />
                ))
              : null}
          </Grid>
          {filesToShow.length === 0 && (
            <Center w="100%" h="150px" flexDirection="column">
              <Icon as={HiDocumentRemove} boxSize={12} color="gray.400" mb={2} />
              <Text fontSize="lg" color="gray.500">
                No Attachments Found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Upload files to attach them to this project.
              </Text>
            </Center>
          )}
          {!showAll && attach_files.length > 4 && (
            <Button
              leftIcon={<FiMoreHorizontal />}
              colorScheme="telegram"
              onClick={() => setShowAll(true)}
              variant="outline"
              size="sm"
            >
              Show More
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  export default ShowAttachments;

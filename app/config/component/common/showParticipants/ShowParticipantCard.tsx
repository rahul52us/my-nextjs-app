import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Text,
  Tooltip,
  useClipboard,
  VStack,
} from "@chakra-ui/react";
import { MdContentCopy } from "react-icons/md";

const ParticipantCard: React.FC<{
  participant: any;
  textColor: string;
  boxHoverBg: string;
}> = ({ participant, textColor, boxHoverBg }) => {
  const { hasCopied, onCopy } = useClipboard(participant?.user?.username);

  const statusColor = participant?.isActive ? "green" : "red";
  const statusLabel = participant?.isActive ? "Active" : "Inactive";

  return (
    <HStack
      spacing={4}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg={boxHoverBg}
      boxShadow="base"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      align="center"
    >
      <Avatar
        size="md"
        src={participant?.user?.pic?.url || undefined}
        name={participant?.user?.username}
      />
      <VStack align="start" spacing={1} w="full">
        <HStack justify="space-between" w="full">
          <Box>
            <Text fontWeight="bold" color={textColor} fontSize="md">
              {participant?.user?.name || participant?.user?.username}{" "}
              <Text as="span" color="gray.500">
                ({participant?.user?.code})
              </Text>
            </Text>
            <Badge colorScheme={statusColor} mt={1}>
              {statusLabel}
            </Badge>
          </Box>
          <Tooltip
            label={
              hasCopied ? `Username copied!` : `${participant?.user?.username}`
            }
            placement="top"
          >
            <Button
              size="xs"
              onClick={onCopy}
              variant="outline"
              colorScheme={hasCopied ? "green" : "blue"}
              leftIcon={<Icon as={MdContentCopy} />}
            >
              {hasCopied ? "Copied!" : "Copy"}
            </Button>
          </Tooltip>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default ParticipantCard;

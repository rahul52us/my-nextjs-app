"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, HStack, Image, Text, VStack, useToast } from "@chakra-ui/react";
import { BACKEND_URL } from "../../config/utils/variables";

interface Attachment {
  _id: string;
  fileName: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
}

interface Props {
  taskId: string;
}

export default function AttachmentsList({ taskId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const toast = useToast();

  const fetchAttachments = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/${taskId}/attachments`);
      setAttachments(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to load attachments", status: "error" });
    }
  };

  useEffect(() => {
    if (taskId) fetchAttachments();
  }, [taskId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${taskId}/attachments/${id}`);
      setAttachments((prev) => prev.filter((a) => a._id !== id));
      toast({ title: "Attachment deleted", status: "info" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to delete attachment", status: "error" });
    }
  };

  return (
    <VStack align="stretch" spacing={3}>
      {attachments.map((a) => (
        <HStack key={a._id} p={2} border="1px solid" borderColor="gray.100" borderRadius="md" justify="space-between">
          <HStack align="center">
            {a.fileType?.startsWith("image/") ? (
              <Image boxSize="48px" src={a.cloudinaryUrl} alt={a.fileName} borderRadius="md" />
            ) : (
              <Box w="48px" h="48px" display="flex" alignItems="center" justifyContent="center" bg="gray.50" borderRadius="md">
                <Text fontSize="sm">{a.fileName.split('.').pop()}</Text>
              </Box>
            )}
            <Box>
              <Text fontSize="sm" fontWeight="medium">{a.fileName}</Text>
              <Text fontSize="xs" color="gray.500">{a.fileSize ? `${Math.round(a.fileSize / 1024)} KB` : ""} • {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ""}</Text>
            </Box>
          </HStack>

          <HStack>
            <Button as="a" href={a.cloudinaryUrl} target="_blank" rel="noopener noreferrer" size="sm">Download</Button>
            <Button colorScheme="red" size="sm" onClick={() => handleDelete(a._id)}>Delete</Button>
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
}

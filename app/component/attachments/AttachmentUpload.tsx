"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Progress,
  Text,
  VStack,
  Image,
  useToast,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { BACKEND_URL, AUTH_TOKEN } from "../../config/utils/variables";

export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string | null;
  result?: any;
}

interface Props {
  taskId?: string | null;
}

export interface AttachmentUploadHandle {
  uploadAll: (taskId: string) => Promise<void>;
  hasPending: () => boolean;
}

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "application/zip",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AttachmentUpload = forwardRef<AttachmentUploadHandle, Props>(({ taskId }, ref) => {
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const toast = useToast();

  useImperativeHandle(ref, () => ({
    uploadAll: async (tId: string) => {
      for (const f of files) {
        if (f.status === "pending" || f.status === "error") {
          // eslint-disable-next-line no-await-in-loop
          await uploadFile(f, tId);
        }
      }
    },
    hasPending: () => files.some((f) => f.status === "pending" || f.status === "uploading"),
  }));

  const onFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const arr = Array.from(selectedFiles);
    const newStates: UploadFileState[] = [];
    for (const file of arr) {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: `${file.name} not allowed`, status: "warning", duration: 3000 });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: `${file.name} exceeds 10MB`, status: "warning", duration: 3000 });
        continue;
      }
      newStates.push({ id: `${Date.now()}-${file.name}`, file, progress: 0, status: "pending" });
    }
    if (newStates.length) setFiles((prev) => [...prev, ...newStates]);
  };

  const uploadFile = async (fileState: UploadFileState, tId: string) => {
    try {
      setFiles((prev) => prev.map((p) => (p.id === fileState.id ? { ...p, status: "uploading", progress: 0 } : p)));

      // get signature
      const sigRes = await axios.get(`${BACKEND_URL}/api/tasks/${tId}/attachments/signature`);
      const { signature, timestamp, api_key, cloud_name, folder } = sigRes.data;

      const form = new FormData();
      form.append("file", fileState.file);
      form.append("api_key", api_key);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;

      // Upload directly to Cloudinary using XMLHttpRequest to avoid sending Authorization header (avoid CORS preflight issues)
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(res);
            else reject(res);
          } catch (err) {
            reject(err);
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.upload.onprogress = (event) => {
          const percentCompleted = Math.round((event.loaded * 100) / (event.total || 1));
          setFiles((prev) => prev.map((p) => (p.id === fileState.id ? { ...p, progress: percentCompleted } : p)));
        };
        xhr.send(form);
      });

      // Save metadata to backend
      await axios.post(
        `${BACKEND_URL}/api/tasks/${tId}/attachments`,
        {
          file_name: fileState.file.name,
          cloudinary_public_id: data.public_id,
          cloudinary_resource_type: data.resource_type, // "image", "video", or "raw"
          cloudinary_url: data.secure_url,
          file_type: data.resource_type + "/" + data.format,
          file_size: data.bytes,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN || "auth_token") || ""}` } }
      );

      setFiles((prev) => prev.map((p) => (p.id === fileState.id ? { ...p, status: "done", result: data, progress: 100 } : p)));
    } catch (error: any) {
      console.error("Upload failed", error);
      setFiles((prev) => prev.map((p) => (p.id === fileState.id ? { ...p, status: "error", error: String(error?.message || error) } : p)));
      toast({ title: `Upload failed: ${fileState.file.name}`, status: "error", duration: 3000 });
    }
  };

  const removeLocal = (id: string) => {
    setFiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <VStack align="stretch" spacing={3}>
      <Box borderRadius="lg" p={3} border="1px solid" borderColor="gray.200">
        <HStack spacing={3}>
          <input
            id="file-input-attachments"
            type="file"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
            style={{ display: "none" }}
          />
          <label htmlFor="file-input-attachments">
            <Button as="span">Choose files</Button>
          </label>
          <Text fontSize="sm" color="gray.500">
            Drag & drop or select files. Max 10MB. Supported: images, pdf, docx, xlsx, csv, txt, zip.
          </Text>
        </HStack>
      </Box>

      <VStack align="stretch" spacing={2}>
        {files.map((f) => (
          <HStack key={f.id} spacing={3} align="center" p={2} borderRadius="md" border="1px solid" borderColor="gray.100">
            {f.file.type.startsWith("image/") ? (
              <Image boxSize="48px" objectFit="cover" src={URL.createObjectURL(f.file)} alt={f.file.name} borderRadius="md" />
            ) : (
              <Box w="48px" h="48px" display="flex" alignItems="center" justifyContent="center" bg="gray.50" borderRadius="md">
                <Text fontSize="sm">{f.file.name.split('.').pop()}</Text>
              </Box>
            )}
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium">{f.file.name}</Text>
              <Text fontSize="xs" color="gray.500">{Math.round(f.file.size / 1024)} KB</Text>
              <Progress value={f.progress} size="sm" mt={2} />
            </Box>
            <VStack>
              {f.status === "error" && (
                <Button size="sm" onClick={() => uploadFile(f, taskId || "")}>Retry</Button>
              )}
              <IconButton aria-label="remove" icon={<CloseIcon />} size="sm" onClick={() => removeLocal(f.id)} />
            </VStack>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
});

export default AttachmentUpload;

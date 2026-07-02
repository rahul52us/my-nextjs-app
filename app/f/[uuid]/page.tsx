"use client";

import React, { useEffect } from "react";
import { Box, Text, VStack, Spinner, Link } from "@chakra-ui/react";

export default function DownloadPage({ params }: { params: { uuid: string } }) {
  const { uuid } = params;
  const routeUuid = uuid || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : undefined);

  const getBackendUrl = () => {
    if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes(':3000')) return origin.replace(/:3000$/, ':5000');
      if (origin.includes('localhost')) return `${window.location.protocol}//${window.location.hostname}:5000`;
      return origin;
    }
    return '';
  };

  useEffect(() => {
    const backend = getBackendUrl();
    const currentUuid = routeUuid;
    if (!currentUuid) {
      return;
    }
    const downloadAllUrl = `${backend}/f/${currentUuid}/download`;
    if (typeof window !== 'undefined') {
      window.location.replace(downloadAllUrl);
    }
  }, [routeUuid]);

  const backend = getBackendUrl();
  const currentUuid = routeUuid;
  const downloadAllUrl = currentUuid ? `${backend}/f/${currentUuid}/download` : '#';

  return (
    <Box p={8} maxW="800px" mx="auto" textAlign="center">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">Preparing your download...</Text>
        <Text>If the download does not start automatically, click below:</Text>
        <Link href={downloadAllUrl} color="blue.500" fontWeight="bold">Download file</Link>
        <Spinner size="xl" />
      </VStack>
    </Box>
  );
}

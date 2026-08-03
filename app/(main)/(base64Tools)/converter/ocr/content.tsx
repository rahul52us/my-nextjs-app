"use client";

import { useEffect, useState } from "react";
import OcrUploader from "../../../../component/OcrUploader";
import { useFileTransfer } from "../../../../context/FileTransferContext";
import ContinueToSection from "../../../../component/common/ContinueToSection";
import { useToast } from "@chakra-ui/react";

export default function OcrPage() {
  const { consumeTransferForTool, clearTransferState } = useFileTransfer();
  const [transferredFile, setTransferredFile] = useState<File | null>(null);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    const checkTransfer = async () => {
      const state = await consumeTransferForTool("ocr");
      if (isMounted && state && state.items.length > 0) {
        const item = state.items[0];
        const fileObj = item.file instanceof File ? item.file : new File([item.file], item.fileName, { type: item.fileType });
        setTransferredFile(fileObj);
        toast({
          title: "✨ File Auto-Loaded",
          description: `Loaded ${fileObj.name} from ${state.sourceToolName}`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        await clearTransferState();
      }
    };
    void checkTransfer();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <OcrUploader />
      <ContinueToSection currentTool="ocr" />
    </>
  );
}

"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  setTransferFiles,
  getTransferFiles,
  clearTransfer,
  checkTransferCompatibility,
  TransferState,
  TransferPayload,
} from "../config/fileTransferStore";

interface FileTransferContextType {
  pendingTransfer: TransferState | null;
  setTransfer: (payload: TransferPayload) => Promise<void>;
  consumeTransferForTool: (destinationToolId: string) => Promise<TransferState | null>;
  clearTransferState: () => Promise<void>;
  refreshTransfer: () => Promise<void>;
}

const FileTransferContext = createContext<FileTransferContextType>({
  pendingTransfer: null,
  setTransfer: async () => {},
  consumeTransferForTool: async () => null,
  clearTransferState: async () => {},
  refreshTransfer: async () => {},
});

export const FileTransferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingTransfer, setPendingTransfer] = useState<TransferState | null>(null);

  const refreshTransfer = async () => {
    const state = await getTransferFiles();
    setPendingTransfer(state);
  };

  useEffect(() => {
    void refreshTransfer();
  }, []);

  const setTransfer = async (payload: TransferPayload) => {
    await setTransferFiles(payload);
    await refreshTransfer();
  };

  const consumeTransferForTool = async (destinationToolId: string): Promise<TransferState | null> => {
    const state = await getTransferFiles();
    if (!state) return null;

    const isCompatible = checkTransferCompatibility(state, destinationToolId);
    if (!isCompatible) {
      return null;
    }

    // Return the state so the tool can consume it
    return state;
  };

  const clearTransferState = async () => {
    await clearTransfer();
    setPendingTransfer(null);
  };

  return (
    <FileTransferContext.Provider
      value={{
        pendingTransfer,
        setTransfer,
        consumeTransferForTool,
        clearTransferState,
        refreshTransfer,
      }}
    >
      {children}
    </FileTransferContext.Provider>
  );
};

export const useFileTransfer = () => useContext(FileTransferContext);

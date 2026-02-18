export const extractMimeAndData = (input: string) => {
  const regex = /^data:(.*?);base64,(.*)$/;
  const matches = input.match(regex);
  if (matches) {
    return {
      mimeType: matches[1],
      base64Data: matches[2],
    };
  }
  return { mimeType: "application/octet-stream", base64Data: input };
};

export const generateFileName = (mimeType: string) => {
  const extension = mimeType.split("/")[1] || "bin";
  const timestamp = new Date()
    .toISOString()
    .replace(/[^\d]/g, "")
    .slice(0, 14);
  return `file_${timestamp}.${extension}`;
};
export const handleShare = (base64: string) => {
  if (!base64.trim()) {
    alert("Please enter a valid Base64 string.");
    return;
  }
  const { mimeType, base64Data } = extractMimeAndData(base64);
  try {
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(
      Array.from(byteCharacters, (char) => char.charCodeAt(0))
    );
    const blob = new Blob([byteArray], { type: mimeType });

    // Convert the Blob to a File object
    const file = new File([blob], generateFileName(mimeType), {
      type: mimeType,
    });

    // Try to use the native share API iaf available
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator
        .share({
          files: [file],
          title: "Shared File",
          text: "Here is the file you requested.",
        })
        .then(() => {
          console.log("File shared successfully!");
        })
        .catch((error) => {
          console.error("Error sharing the file:", error);
          alert("Sharing failed or not supported on your device.");
        });
    } else {
      alert("Sharing is not supported on your device.");
    }
  } catch (error) {
    console.log(error);
    alert("Invalid Base64 data. Please check the input format.");
  }
};

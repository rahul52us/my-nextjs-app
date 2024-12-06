import { FaBarcode, FaCode, FaConfluence, FaFileAlt, FaLock, FaLockOpen, FaMusic, FaQrcode } from "react-icons/fa";

export const features: any = {
    decoders: [
      { name: "Base64 to ASCII", icon: FaCode, path: "/converter/decoder/ascii" },
      { name: "Base64 to Audio", icon: FaMusic, path: "/converter/decoder/audio" },
      { name: "Base64 to File", icon: FaFileAlt, path: "/converter/decoder/file" },
      { name: "Base64 to Image", icon: FaFileAlt, path: "/converter/decoder/image" },
      { name: "Base64 to Pdf", icon: FaFileAlt, path: "/converter/decoder/pdf" },
      { name: "Base64 to Hex", icon: FaCode, path: "/converter/decoder/hex" },
      { name: "Base64 to Text", icon: FaCode, path: "/converter/decoder/text" },
    ],
    encoders: [
      { name: "Audio to Base64", icon: FaMusic, path: "/converter/encoder/audio" },
      { name: "File to Base64", icon: FaFileAlt, path: "/converter/encoder/file" },
      { name: "Url to Base64", icon: FaCode, path: "/converter/encoder/url" },
    ],
    tools: [
      { name: "JSON Formatter", icon: FaConfluence, path: "/tools/json-formatter" },
      { name: "Text Formatter", icon: FaConfluence, path: "/tools/text-formatter" },
      { name: "Javascript Formatter", icon: FaConfluence, path: "/tools/javascript-formatter" },
      { name: "Code Minifier", icon: FaConfluence, path: "/tools/code-minifier" },
    ],
    converters: [
      { name: "Images to Pdf & Base64", icon: FaCode, path: "/converter/images-to-pdf" },
      { name: "QR Code Generator", icon: FaQrcode, path: "/converter/qr-code-generator" },
      { name: "QR Code Reader", icon: FaQrcode, path: "/converter/qr-code-reader" },
      { name: "Bar Code Generator", icon: FaBarcode, path: "/converter/bar-code-generator" },
      { name: "Bar Code Reader", icon: FaBarcode, path: "/converter/bar-code-reader" },
      { name: "Files to Zip Compress", icon: FaBarcode, path: "/converter/files-to-zip" },
      { name: "Zip to Files DeCompress", icon: FaBarcode, path: "/converter/decompress-zip" },
      { name: "Encrypt File", icon: FaLock, path: "/converter/encrypt-file" },
      { name: "Decrypt File", icon: FaLockOpen, path: "/converter/decrypt-file" },
    ],
  };
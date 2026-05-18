import { FaCode, FaMusic, FaFileAlt, FaImage, FaTextHeight, FaQrcode, FaBarcode, FaCompress, FaLock, FaLockOpen, FaExchangeAlt, FaClock, FaConfluence, FaPencilAlt, FaCut, FaFileArchive, FaKey, FaRuler, FaGlobe, FaTable, FaDollarSign, FaThermometerHalf, FaDatabase, FaPalette, FaFilePdf, FaEdit, FaTools } from "react-icons/fa";
export const headerHeight = "70px";
export const childrenHeight = "860px";
export const footerHeight = "60px";

export const features: any = {
  "Encoders & Decoders": [
    { name: "Base64 to ASCII", icon: FaCode, path: "/converter/decoder/ascii" },
    { name: "Base64 to Audio", icon: FaMusic, path: "/converter/decoder/audio" },
    { name: "Base64 to File", icon: FaFileAlt, path: "/converter/decoder/file" },
    { name: "Base64 to Image", icon: FaImage, path: "/converter/decoder/image" },
    { name: "Base64 to PDF", icon: FaFileAlt, path: "/converter/decoder/pdf" },
    { name: "Base64 to Hex", icon: FaCode, path: "/converter/decoder/hex" },
    { name: "Base64 to Text", icon: FaTextHeight, path: "/converter/decoder/text" },
    { name: "ASCII to Base64", icon: FaCode, path: "/converter/encoder/ascii" },
    { name: "Audio to Base64", icon: FaMusic, path: "/converter/encoder/audio" },
    { name: "Hex to Base64", icon: FaCode, path: "/converter/encoder/hex" },
    { name: "File to Base64", icon: FaFileAlt, path: "/converter/encoder/file" },
    { name: "URL to Base64", icon: FaCode, path: "/converter/encoder/url" },
    // New Additions
    { name: "JSON to Base64", icon: FaCode, path: "/converter/encoder/json" },
    { name: "Base64 to JSON", icon: FaCode, path: "/converter/decoder/json" },
    { name: "JWT Decoder", icon: FaLock, path: "/converter/decoder/jwt" },
    { name: "Text to Binary", icon: FaCode, path: "/converter/binary/text-to-binary" },
    { name: "ASCII to Binary", icon: FaCode, path: "/converter/binary/ascii-to-binary" },
    { name: "Hex to Binary", icon: FaCode, path: "/converter/binary/hex-to-binary" },
    { name: "Decimal to Binary", icon: FaCode, path: "/converter/binary/decimal-to-binary" },
    { name: "Base64 to Binary", icon: FaCode, path: "/converter/binary/base64-to-binary" },
    { name: "File to Binary", icon: FaFileAlt, path: "/converter/binary/file-to-binary" },
    { name: "Binary to Text", icon: FaTextHeight, path: "/converter/binary/binary-to-text" },
    { name: "Binary to ASCII", icon: FaTextHeight, path: "/converter/binary/binary-to-ascii" },
    { name: "Binary to Hex", icon: FaCode, path: "/converter/binary/binary-to-hex" },
    { name: "Binary to Decimal", icon: FaCode, path: "/converter/binary/binary-to-decimal" },
    { name: "Binary to Base64", icon: FaCode, path: "/converter/binary/binary-to-base64" },
    { name: "Binary to File", icon: FaFileAlt, path: "/converter/binary/binary-to-file" },
  ],
  "Formatters": [
    { name: "JSON Formatter", icon: FaConfluence, path: "/tools/json-formatter" },
    { name: "Text Formatter", icon: FaPencilAlt, path: "/tools/text-formatter" },
    { name: "JavaScript Formatter", icon: FaCode, path: "/tools/javascript-formatter" },
    // New Additions
    { name: "HTML Formatter", icon: FaCode, path: "/tools/html-formatter" },
    { name: "CSS Formatter", icon: FaCode, path: "/tools/css-formatter" },
    { name: "XML Formatter", icon: FaCode, path: "/tools/xml-formatter" },
    { name: "SQL Formatter", icon: FaTable, path: "/tools/sql-formatter" },
  ],
  "File Converters": [
    { name: "Images to PDF & Base64", icon: FaFileArchive, path: "/converter/images-to-pdf" },
    { name: "Files to ZIP Compress", icon: FaCompress, path: "/converter/files-to-zip" },
    { name: "ZIP to Files Decompress", icon: FaFileArchive, path: "/converter/decompress-zip" },
    { name: "Encrypt File", icon: FaLock, path: "/converter/encrypt-file" },
    { name: "Decrypt File", icon: FaLockOpen, path: "/converter/decrypt-file" },
    // New Additions
    { name: "Word to PDF", icon: FaFileAlt, path: "/converter/PDFtools/Wordtopdf" },
    { name: "Excel to CSV", icon: FaTable, path: "/converter/excel-to-csv" },
    { name: "CSV to JSON", icon: FaCode, path: "/converter/csv-to-json" },
  ],
  "Code Utilities": [
    { name: "Code Minifier", icon: FaCut, path: "/tools/code-minifier" },
    { name: "Regex Tester", icon: FaExchangeAlt, path: "/tools/regex-tester" },
    { name: "Text Difference Checker", icon: FaExchangeAlt, path: "/tools/text-difference-checker" },
    // New Additions
    { name: "JSON Validator", icon: FaConfluence, path: "/tools/json-validator" },
    { name: "Hash Generator (MD5/SHA)", icon: FaKey, path: "/tools/hash-generator" },
    { name: "UUID Generator", icon: FaKey, path: "/tools/uuid-generator" },
    { name: "Code Beautifier", icon: FaCode, path: "/tools/code-beautifier" },
  ],
  "Generators": [
    { name: "QR Code Generator", icon: FaQrcode, path: "/converter/qr-code-generator" },
    { name: "QR Code Reader", icon: FaQrcode, path: "/converter/qr-code-reader" },
    { name: "Barcode Generator", icon: FaBarcode, path: "/converter/bar-code-generator" },
    // New Additions
    { name: "Password Generator", icon: FaLock, path: "/generator/password" },
    { name: "Lorem Ipsum Generator", icon: FaTextHeight, path: "/generator/lorem-ipsum" },
    { name: "Color Code Generator", icon: FaPalette, path: "/generator/color-code" },
    { name: "API Key Generator", icon: FaKey, path: "/generator/api-key" },
  ],
  "Miscellaneous": [
    { name: "Unit Converter", icon: FaRuler, path: "/converter/unit-converter" },
    { name: "Base Converter", icon: FaExchangeAlt, path: "/converter/base-converter" },
    { name: "Speed Converter", icon: FaClock, path: "/converter/speed-converter" },
    { name: "Time Converter", icon: FaClock, path: "/converter/time-converter" },
    // New Additions
    { name: "Currency Converter", icon: FaDollarSign, path: "/converter/currency-converter" },
    { name: "Temperature Converter", icon: FaThermometerHalf, path: "/converter/temperature-converter" },
    { name: "Data Size Converter", icon: FaDatabase, path: "/converter/data-size-converter" },
    { name: "Workflow Builder", icon: FaTools, path: "/tools/workflow" },
    { name: "IP Address Lookup", icon: FaGlobe, path: "/tools/ip-lookup" },
  ],
  "Converter Utilities": [
    { name: "Unix Timestamp Converter", icon: FaClock, path: "/converter/unix-timestamp" },
    { name: "Color Converter", icon: FaPalette, path: "/converter/color-converter" },
    { name: "Text Case Converter", icon: FaTextHeight, path: "/converter/text-case-converter" },
  ],
  "PDF Tools": [
    { name: "PDF to Word", icon: FaFileAlt, path: "/converter/PDFtools/PDFtoWord" },
    { name: "PDF Edit", icon: FaFileAlt, path: "/converter/PDFtools/Pdfedit" },
    {name: "Excel To PDF", icon: FaFileAlt, path: "/converter/PDFtools/Excletopdf" },  
    {name: "PDF to JPG", icon: FaImage, path: "/converter/PDFtools/PdftoJpg" },  
    {name: "PDF Merge", icon: FaFilePdf, path: "/converter/PDFtools/PDFmerge" },
    {name: "PDF Split", icon: FaFilePdf, path: "/converter/PDFtools/Pdfsplit" },
    {name: "PDF Rotate", icon: FaFilePdf, path: "/converter/PDFtools/Pdfrotate" },
    {name: "PDF Sign", icon: FaFilePdf, path: "/converter/PDFtools/Pdfsign" },
  ],
  "Image Tools": [
    { name: "Image Compressor", icon: FaCompress, path: "/converter/Imagetools/Imagecom" },
    { name: "Image edit", icon: FaEdit, path: "/converter/Imagetools/Imageedit" },
  ],
};

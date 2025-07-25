import React from "react";
import {
  FaFileAlt,
  FaCode,
  FaMusic,
  FaImage,
  FaTextHeight,
  FaPencilAlt,
  FaConfluence,
  FaTable,
  FaFileArchive,
  FaCompress,
  FaLock,
  FaQrcode,
  FaBarcode,
  FaRuler,
  FaGlobe,
  FaExchangeAlt,
  FaClock,
  FaDollarSign,
  FaDatabase,
  FaThermometerHalf,
} from "react-icons/fa";

interface SidebarItem {
  id: number;
  name: string;
  icon: any;
  url: string;
  role?: string[];
  children?: SidebarItem[];
}

const sidebarData: SidebarItem[] = [
  {
    id: 1,
    name: "Encoders",
    icon: <FaCode />,
    url: "#",
    children: [
      { id: 101, name: "ASCII to Base64", icon: <FaCode />, url: "/converter/encoder/ascii" },
      { id: 102, name: "Audio to Base64", icon: <FaMusic />, url: "/converter/encoder/audio" },
      { id: 103, name: "Hex to Base64", icon: <FaCode />, url: "/converter/encoder/hex" },
      { id: 104, name: "File to Base64", icon: <FaFileAlt />, url: "/converter/encoder/file" },
      { id: 105, name: "URL to Base64", icon: <FaCode />, url: "/converter/encoder/url" },
      { id: 106, name: "JSON to Base64", icon: <FaCode />, url: "/converter/encoder/json" },
      { id: 107, name: "Text to Binary", icon: <FaCode />, url: "/converter/encoder/binary" },
    ],
  },
  {
    id: 2,
    name: "Decoders",
    icon: <FaCode />,
    url: "#",
    children: [
      { id: 201, name: "Base64 to ASCII", icon: <FaCode />, url: "/converter/decoder/ascii" },
      { id: 202, name: "Base64 to Audio", icon: <FaMusic />, url: "/converter/decoder/audio" },
      { id: 203, name: "Base64 to File", icon: <FaFileAlt />, url: "/converter/decoder/file" },
      { id: 204, name: "Base64 to Image", icon: <FaImage />, url: "/converter/decoder/image" },
      { id: 205, name: "Base64 to PDF", icon: <FaFileAlt />, url: "/converter/decoder/pdf" },
      { id: 206, name: "Base64 to Hex", icon: <FaCode />, url: "/converter/decoder/hex" },
      { id: 207, name: "Base64 to JSON", icon: <FaCode />, url: "/converter/decoder/json" },
      { id: 208, name: "Binary to Text", icon: <FaTextHeight />, url: "/converter/decoder/binary" },
    ],
  },
  {
    id: 3,
    name: "Formatters",
    icon: <FaPencilAlt />,
    url: "#",
    children: [
      { id: 301, name: "JSON Formatter", icon: <FaConfluence />, url: "/tools/json-formatter" },
      { id: 302, name: "Text Formatter", icon: <FaPencilAlt />, url: "/tools/text-formatter" },
      { id: 303, name: "JavaScript Formatter", icon: <FaCode />, url: "/tools/javascript-formatter" },
      { id: 304, name: "SQL Formatter", icon: <FaTable />, url: "/tools/sql-formatter" },
      { id: 305, name: "Excel To Json Formatter", icon: <FaTable />, url: "/tools/excel-to-json" },

    ],
  },
  {
    id: 4,
    name: "File Converters",
    icon: <FaFileArchive />,
    url: "#",
    children: [
      { id: 401, name: "Images to PDF & Base64", icon: <FaFileArchive />, url: "/converter/images-to-pdf" },
      { id: 402, name: "Files to ZIP Compress", icon: <FaCompress />, url: "/converter/files-to-zip" },
      { id: 403, name: "ZIP to Files Decompress", icon: <FaFileArchive />, url: "/converter/decompress-zip" },
      { id: 404, name: "Encrypt File", icon: <FaLock />, url: "/converter/encrypt-file" },
    ],
  },
  {
    id: 5,
    name: "Generators",
    icon: <FaQrcode />,
    url: "#",
    children: [
      { id: 501, name: "QR Code Generator", icon: <FaQrcode />, url: "/converter/qr-code-generator" },
      { id: 502, name: "QR Code Reader", icon: <FaQrcode />, url: "/converter/qr-code-reader" },
      { id: 503, name: "Barcode Generator", icon: <FaBarcode />, url: "/converter/bar-code-generator" },
      { id: 504, name: "Password Generator", icon: <FaLock />, url: "/generator/password" },
    ],
  },
  {
    id: 6,
    name: "Miscellaneous",
    icon: <FaGlobe />,
    url: "#",
    children: [
      { id: 601, name: "Unit Converter", icon: <FaRuler />, url: "/converter/unit-converter" },
      { id: 602, name: "Base Converter", icon: <FaExchangeAlt />, url: "/converter/base-converter" },
      { id: 603, name: "Speed Converter", icon: <FaClock />, url: "/converter/speed-converter" },
      { id: 604, name: "Currency Converter", icon: <FaDollarSign />, url: "/converter/currency-converter" },
      { id: 605, name: "Time Converter", icon: <FaClock />, url: "/converter/time-converter" },
      { id: 606, name: "Temperature Converter", icon: <FaThermometerHalf />, url: "/converter/temperature-converter" },
      { id: 607, name: "Data Size Converter", icon: <FaDatabase />, url: "/converter/data-size-converter" },
      { id: 608, name: "IP Address Lookup", icon: <FaGlobe />, url: "/tools/ip-lookup" },
    ],
  },
];

const filterSearchData: SidebarItem[] = [
  { id: 1, name: "Encoders", icon: <FaCode />, url: "#" },
  { id: 101, name: "ASCII to Base64", icon: <FaCode />, url: "/converter/encoder/ascii" },
  { id: 102, name: "Audio to Base64", icon: <FaMusic />, url: "/converter/encoder/audio" },
  { id: 103, name: "File to Base64", icon: <FaFileAlt />, url: "/converter/encoder/file" },
  { id: 104, name: "Image to Base64", icon: <FaImage />, url: "/converter/encoder/image" },
  { id: 105, name: "PDF to Base64", icon: <FaFileAlt />, url: "/converter/encoder/pdf" },
  { id: 106, name: "Hex to Base64", icon: <FaCode />, url: "/converter/encoder/hex" },
  { id: 107, name: "JSON to Base64", icon: <FaCode />, url: "/converter/encoder/json" },
  { id: 108, name: "Text to Binary", icon: <FaTextHeight />, url: "/converter/encoder/binary" },

  { id: 2, name: "Decoders", icon: <FaCode />, url: "#" },
  { id: 201, name: "Base64 to ASCII", icon: <FaCode />, url: "/converter/decoder/ascii" },
  { id: 202, name: "Base64 to Audio", icon: <FaMusic />, url: "/converter/decoder/audio" },
  { id: 203, name: "Base64 to File", icon: <FaFileAlt />, url: "/converter/decoder/file" },
  { id: 204, name: "Base64 to Image", icon: <FaImage />, url: "/converter/decoder/image" },
  { id: 205, name: "Base64 to PDF", icon: <FaFileAlt />, url: "/converter/decoder/pdf" },
  { id: 206, name: "Base64 to Hex", icon: <FaCode />, url: "/converter/decoder/hex" },
  { id: 207, name: "Base64 to JSON", icon: <FaCode />, url: "/converter/decoder/json" },
  { id: 208, name: "Binary to Text", icon: <FaTextHeight />, url: "/converter/decoder/binary" },

  { id: 3, name: "Formatters", icon: <FaPencilAlt />, url: "#" },
  { id: 301, name: "JSON Formatter", icon: <FaConfluence />, url: "/tools/json-formatter" },
  { id: 302, name: "Text Formatter", icon: <FaPencilAlt />, url: "/tools/text-formatter" },
  { id: 303, name: "JavaScript Formatter", icon: <FaCode />, url: "/tools/javascript-formatter" },
  { id: 304, name: "SQL Formatter", icon: <FaTable />, url: "/tools/sql-formatter" },
  { id: 305, name: "Excel to Json Formatters", icon: <FaTable />, url: "/tools/excel-to-json" },


  { id: 4, name: "File Converters", icon: <FaFileArchive />, url: "#" },
  { id: 401, name: "Images to PDF & Base64", icon: <FaFileArchive />, url: "/converter/images-to-pdf" },
  { id: 402, name: "Files to ZIP Compress", icon: <FaCompress />, url: "/converter/files-to-zip" },
  { id: 403, name: "ZIP to Files Decompress", icon: <FaFileArchive />, url: "/converter/decompress-zip" },
  { id: 404, name: "Encrypt File", icon: <FaLock />, url: "/converter/encrypt-file" },

  { id: 5, name: "Generators", icon: <FaQrcode />, url: "#" },
  { id: 501, name: "QR Code Generator", icon: <FaQrcode />, url: "/converter/qr-code-generator" },
  { id: 502, name: "QR Code Reader", icon: <FaQrcode />, url: "/converter/qr-code-reader" },
  { id: 503, name: "Barcode Generator", icon: <FaBarcode />, url: "/converter/bar-code-generator" },
  { id: 504, name: "Password Generator", icon: <FaLock />, url: "/generator/password" },

  { id: 6, name: "Miscellaneous", icon: <FaGlobe />, url: "#" },
  { id: 601, name: "Unit Converter", icon: <FaRuler />, url: "/converter/unit-converter" },
  { id: 602, name: "Base Converter", icon: <FaExchangeAlt />, url: "/converter/base-converter" },
  { id: 603, name: "Speed Converter", icon: <FaClock />, url: "/converter/speed-converter" },
  { id: 604, name: "Currency Converter", icon: <FaDollarSign />, url: "/converter/currency-converter" },
  { id: 605, name: "Time Converter", icon: <FaClock />, url: "/converter/time-converter" },
  { id: 606, name: "Temperature Converter", icon: <FaThermometerHalf />, url: "/converter/temperature-converter" },
  { id: 607, name: "Data Size Converter", icon: <FaDatabase />, url: "/converter/data-size-converter" },
  { id: 608, name: "IP Address Lookup", icon: <FaGlobe />, url: "/tools/ip-lookup" },
];


export const sidebarFooterData: SidebarItem[] = [
  { id: 101, name: "ASCII to Base64", icon: <FaCode />, url: "/converter/encoder/ascii" },
];

const getSidebarDataByRole = (role: string[] = ["user"]): SidebarItem[] => {
  const filterByRole = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter((item) => !item.role || item.role.some((r) => role.includes(r)))
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };
  return filterByRole(sidebarData);
};


export { sidebarData, filterSearchData, getSidebarDataByRole };

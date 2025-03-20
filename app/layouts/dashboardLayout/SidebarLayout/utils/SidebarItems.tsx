import React from "react";
import {
  FaCog,
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
    name: "Encoders & Decoders",
    icon: <FaCode />,
    url: "#",
    children: [
      { id: 101, name: "Base64 to ASCII", icon: <FaCode />, url: "/converter/decoder/ascii" },
      { id: 102, name: "Base64 to Audio", icon: <FaMusic />, url: "/converter/decoder/audio" },
      { id: 103, name: "Base64 to File", icon: <FaFileAlt />, url: "/converter/decoder/file" },
      { id: 104, name: "Base64 to Image", icon: <FaImage />, url: "/converter/decoder/image" },
      { id: 105, name: "Base64 to PDF", icon: <FaFileAlt />, url: "/converter/decoder/pdf" },
      { id: 106, name: "Base64 to Hex", icon: <FaCode />, url: "/converter/decoder/hex" },
      { id: 107, name: "Base64 to JSON", icon: <FaCode />, url: "/converter/decoder/json" },
      { id: 108, name: "Binary to Text", icon: <FaTextHeight />, url: "/converter/decoder/binary" },
    ],
  },
  {
    id: 2,
    name: "Formatters",
    icon: <FaPencilAlt />,
    url: "#",
    children: [
      { id: 201, name: "JSON Formatter", icon: <FaConfluence />, url: "/tools/json-formatter" },
      { id: 202, name: "Text Formatter", icon: <FaPencilAlt />, url: "/tools/text-formatter" },
      { id: 203, name: "JavaScript Formatter", icon: <FaCode />, url: "/tools/javascript-formatter" },
      { id: 204, name: "SQL Formatter", icon: <FaTable />, url: "/tools/sql-formatter" },
    ],
  },
  {
    id: 3,
    name: "File Converters",
    icon: <FaFileArchive />,
    url: "#",
    children: [
      { id: 301, name: "Images to PDF & Base64", icon: <FaFileArchive />, url: "/converter/images-to-pdf" },
      { id: 302, name: "Files to ZIP Compress", icon: <FaCompress />, url: "/converter/files-to-zip" },
      { id: 303, name: "ZIP to Files Decompress", icon: <FaFileArchive />, url: "/converter/decompress-zip" },
      { id: 304, name: "Encrypt File", icon: <FaLock />, url: "/converter/encrypt-file" },
    ],
  },
  {
    id: 4,
    name: "Generators",
    icon: <FaQrcode />,
    url: "#",
    children: [
      { id: 401, name: "QR Code Generator", icon: <FaQrcode />, url: "/converter/qr-code-generator" },
      { id: 402, name: "QR Code Reader", icon: <FaQrcode />, url: "/converter/qr-code-reader" },
      { id: 403, name: "Barcode Generator", icon: <FaBarcode />, url: "/converter/bar-code-generator" },
      { id: 404, name: "Password Generator", icon: <FaLock />, url: "/generator/password" },
    ],
  },
  {
    id: 5,
    name: "Miscellaneous",
    icon: <FaGlobe />,
    url: "#",
    children: [
      { id: 501, name: "Unit Converter", icon: <FaRuler />, url: "/converter/unit-converter" },
      { id: 502, name: "Base Converter", icon: <FaExchangeAlt />, url: "/converter/base-converter" },
      { id: 503, name: "Speed Converter", icon: <FaClock />, url: "/converter/speed-converter" },
      { id: 504, name: "Currency Converter", icon: <FaDollarSign />, url: "/converter/currency-converter" },
    ],
  }
];

const filterSearchData: SidebarItem[] = [
  { id: 1, name: "Encoders & Decoders", icon: <FaCode />, url: "#" },
  { id: 101, name: "Base64 to ASCII", icon: <FaCode />, url: "/converter/decoder/ascii" },
  { id: 102, name: "Base64 to Audio", icon: <FaMusic />, url: "/converter/decoder/audio" },
  { id: 103, name: "Base64 to File", icon: <FaFileAlt />, url: "/converter/decoder/file" },
  { id: 104, name: "Base64 to Image", icon: <FaImage />, url: "/converter/decoder/image" },
  { id: 105, name: "Base64 to PDF", icon: <FaFileAlt />, url: "/converter/decoder/pdf" },
  { id: 106, name: "Base64 to Hex", icon: <FaCode />, url: "/converter/decoder/hex" },
  { id: 107, name: "Base64 to JSON", icon: <FaCode />, url: "/converter/decoder/json" },
  { id: 108, name: "Binary to Text", icon: <FaTextHeight />, url: "/converter/decoder/binary" },

  { id: 2, name: "Formatters", icon: <FaPencilAlt />, url: "#" },
  { id: 201, name: "JSON Formatter", icon: <FaConfluence />, url: "/tools/json-formatter" },
  { id: 202, name: "Text Formatter", icon: <FaPencilAlt />, url: "/tools/text-formatter" },
  { id: 203, name: "JavaScript Formatter", icon: <FaCode />, url: "/tools/javascript-formatter" },
  { id: 204, name: "SQL Formatter", icon: <FaTable />, url: "/tools/sql-formatter" },

  { id: 3, name: "File Converters", icon: <FaFileArchive />, url: "#" },
  { id: 301, name: "Images to PDF & Base64", icon: <FaFileArchive />, url: "/converter/images-to-pdf" },
  { id: 302, name: "Files to ZIP Compress", icon: <FaCompress />, url: "/converter/files-to-zip" },
  { id: 303, name: "ZIP to Files Decompress", icon: <FaFileArchive />, url: "/converter/decompress-zip" },
  { id: 304, name: "Encrypt File", icon: <FaLock />, url: "/converter/encrypt-file" },

  { id: 4, name: "Generators", icon: <FaQrcode />, url: "#" },
  { id: 401, name: "QR Code Generator", icon: <FaQrcode />, url: "/converter/qr-code-generator" },
  { id: 402, name: "QR Code Reader", icon: <FaQrcode />, url: "/converter/qr-code-reader" },
  { id: 403, name: "Barcode Generator", icon: <FaBarcode />, url: "/converter/bar-code-generator" },
  { id: 404, name: "Password Generator", icon: <FaLock />, url: "/generator/password" },

  { id: 5, name: "Miscellaneous", icon: <FaGlobe />, url: "#" },
  { id: 501, name: "Unit Converter", icon: <FaRuler />, url: "/converter/unit-converter" },
  { id: 502, name: "Base Converter", icon: <FaExchangeAlt />, url: "/converter/base-converter" },
  { id: 503, name: "Speed Converter", icon: <FaClock />, url: "/converter/speed-converter" },
  { id: 504, name: "Currency Converter", icon: <FaDollarSign />, url: "/converter/currency-converter" },
];

export const sidebarFooterData: SidebarItem[] = [
  {
    id: 34,
    name: "Settings",
    icon: <FaCog />,
    url: "/profile",
    role: ["user", "admin", "superadmin", "manager"],
  },
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

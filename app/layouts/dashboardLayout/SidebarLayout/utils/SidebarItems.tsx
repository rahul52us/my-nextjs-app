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
  FaPalette,
  FaFileWord,
  FaFilePdf,
  FaFileExcel,
  FaEdit,
  FaChartBar,
  FaRobot,
} from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";

export interface SidebarItem {
  id: number;
  name: string;
  icon: any;
  url: string;
  role?: string[];
  iconColor?: string;
  columns?: number;
  children?: SidebarItem[];
}

const sidebarData: SidebarItem[] = [

  // ── 1. PDF Tools ─────────────────────────────────────────────
  {
    id: 91,
    name: "PDF Tools",
    icon: <FaFilePdf />,
    iconColor: "#e74c3c",
    url: "#",
    columns: 2,
    children: [
      { id: 609, name: "PDF to Word",          icon: <FaFileWord />,  iconColor: "#2980b9", url: "/converter/PDFtools/PDFtoWord"        },
      { id: 611, name: "PDF to JPG",            icon: <FaImage />,     iconColor: "#27ae60", url: "/converter/PDFtools/PdftoJpg"         },
      { id: 613, name: "Excel to PDF",          icon: <FaFileExcel />, iconColor: "#1e8449", url: "/converter/PDFtools/Excletopdf"       },
      { id: 621, name: "Word to PDF",           icon: <FaFileWord />,  iconColor: "#154360", url: "/converter/PDFtools/Wordtopdf"        },
      { id: 610, name: "PDF Edit",              icon: <FaEdit />,      iconColor: "#8e44ad", url: "/converter/PDFtools/Pdfedit"          },
      { id: 620, name: "PDF Watermark",         icon: <FaFilePdf />,   iconColor: "#e74c3c", url: "/converter/PDFtools/Pdfwatermark"     },
      { id: 617, name: "PDF Page Numbering",    icon: <FaFilePdf />,   iconColor: "#e67e22", url: "/converter/PDFtools/Pdfpageno"        },
      { id: 612, name: "PDF Merge",             icon: <FaFilePdf />,   iconColor: "#16a085", url: "/converter/PDFtools/Pdfmerge"         },
      { id: 614, name: "PDF Split",             icon: <FaFilePdf />,   iconColor: "#d35400", url: "/converter/PDFtools/Pdfsplit"         },
      { id: 618, name: "PDF Page Rearrange",    icon: <FaFilePdf />,   iconColor: "#2c3e50", url: "/converter/PDFtools/Pdfpagerearange"  },
      { id: 615, name: "PDF Rotate",            icon: <FaFilePdf />,   iconColor: "#c0392b", url: "/converter/PDFtools/Pdfrotate"        },
      { id: 616, name: "PDF Sign",              icon: <FaLock />,      iconColor: "#1abc9c", url: "/converter/PDFtools/Pdfsign"          },
      { id: 619, name: "PDF Difference",        icon: <FaFilePdf />,   iconColor: "#7f8c8d", url: "/converter/PDFtools/Pdfdeffrence"     },
    ],
  },

  // ── 2. Image Tools ────────────────────────────────────────────
  {
    id: 92,
    name: "Image Tools",
    icon: <FaImage />,
    iconColor: "#27ae60",
    url: "#",
    children: [
      { id: 7011, name: "Image Compressor",     icon: <FaCompress />, iconColor: "#e74c3c", url: "/converter/Imagetools/Imagecom"        },
      { id: 7021, name: "Image Edit",           icon: <FaEdit />,     iconColor: "#8e44ad", url: "/converter/Imagetools/Imageedit"       },
      { id: 7031, name: "Image Type Converter", icon: <FaImage />,    iconColor: "#27ae60", url: "/converter/Imagetools/Imagetypeconvert"},
      // { id: 7041, name: "BG Remover",           icon: <FaImage />,    iconColor: "#2980b9", url: "/converter/Imagetools/Bgremove"        },
      { id: 94,   name: "Image Extractor",      icon: <FaImage />,    iconColor: "#e67e22", url: "/converter/Imageextract"              },
    ],
  },

  // ── 3. Base64 & Binary ────────────────────────────────────────
  {
    id: 1000,
    name: "Base64 & Binary",
    icon: <FaExchangeAlt />,
    iconColor: "#8e44ad",
    url: "#",
    children: [
      {
        id: 1,
        name: "Encoders",
        icon: <FaCode />,
        iconColor: "#e67e22",
        url: "#",
        children: [
          { id: 101, name: "ASCII to Base64", icon: <FaCode />,    iconColor: "#e67e22", url: "/converter/encoder/ascii" },
          { id: 102, name: "Audio to Base64", icon: <FaMusic />,   iconColor: "#9b59b6", url: "/converter/encoder/audio" },
          { id: 103, name: "Hex to Base64",   icon: <FaCode />,    iconColor: "#1abc9c", url: "/converter/encoder/hex"   },
          { id: 104, name: "File to Base64",  icon: <FaFileAlt />, iconColor: "#3498db", url: "/converter/encoder/file"  },
          { id: 105, name: "URL to Base64",   icon: <FaCode />,    iconColor: "#e74c3c", url: "/converter/encoder/url"   },
        ],
      },
      {
        id: 2,
        name: "Decoders",
        icon: <FaCode />,
        iconColor: "#16a085",
        url: "#",
        children: [
          { id: 201, name: "Base64 to ASCII", icon: <FaCode />,    iconColor: "#e67e22", url: "/converter/decoder/ascii" },
          { id: 202, name: "Base64 to Audio", icon: <FaMusic />,   iconColor: "#9b59b6", url: "/converter/decoder/audio" },
          { id: 203, name: "Base64 to File",  icon: <FaFileAlt />, iconColor: "#3498db", url: "/converter/decoder/file"  },
          { id: 204, name: "Base64 to Image", icon: <FaImage />,   iconColor: "#27ae60", url: "/converter/decoder/image" },
          { id: 205, name: "Base64 to PDF",   icon: <FaFileAlt />, iconColor: "#e74c3c", url: "/converter/decoder/pdf"   },
          { id: 206, name: "Base64 to Hex",   icon: <FaCode />,    iconColor: "#1abc9c", url: "/converter/decoder/hex"   },
          { id: 209, name: "JWT Decoder",     icon: <FaLock />,    iconColor: "#c0392b", url: "/converter/decoder/jwt"   },
        ],
      },
    ],
  },

  // ── 4. Formatters ─────────────────────────────────────────────
  {
    id: 3,
    name: "Formatters",
    icon: <FaPencilAlt />,
    iconColor: "#e67e22",
    url: "#",
    children: [
      { id: 301, name: "JSON Formatter",         icon: <FaConfluence />, iconColor: "#0052cc", url: "/tools/json-formatter" },
      { id: 302, name: "Text Formatter",          icon: <FaPencilAlt />, iconColor: "#e67e22", url: "/tools/text-formatter" },
      { id: 305, name: "Excel To Json Formatter", icon: <FaTable />,     iconColor: "#27ae60", url: "/tools/excel-to-json"  },
      { id: 306, name: "JSON To Excel",           icon: <FaTable />,     iconColor: "#1e8449", url: "/tools/json-to-excel"  },
    ],
  },

  // ── 5. File Converters ────────────────────────────────────────
  {
    id: 4,
    name: "File Converters",
    icon: <FaFileArchive />,
    iconColor: "#d35400",
    url: "#",
    children: [
      { id: 401, name: "Images to PDF & Base64",  icon: <FaFileArchive />, iconColor: "#e74c3c", url: "/converter/images-to-pdf"  },
      { id: 402, name: "Files to ZIP Compress",   icon: <FaCompress />,    iconColor: "#f39c12", url: "/converter/files-to-zip"   },
      { id: 403, name: "ZIP to Files Decompress", icon: <FaFileArchive />, iconColor: "#d35400", url: "/converter/decompress-zip" },
      { id: 404, name: "Encrypt File",            icon: <FaLock />,        iconColor: "#c0392b", url: "/converter/encrypt-file"   },
      { id: 405, name: "Excel to CSV",            icon: <FaFileExcel />,   iconColor: "#27ae60", url: "/converter/Exceltocsv"     },
    ],
  },

  // ── 6. More ───────────────────────────────────────────────────
  {
    id: 9,
    name: "More",
    icon: <FaGlobe />,
    iconColor: "#2980b9",
    url: "#",
    children: [
      {
        id: 50,
        name: "Generators",
        icon: <FaQrcode />,
        iconColor: "#2c3e50",
        url: "#",
        children: [
          { id: 501, name: "QR Code Generator", icon: <FaQrcode />,  iconColor: "#2c3e50", url: "/converter/qr-code-generator"  },
          { id: 502, name: "QR Code Reader",    icon: <FaQrcode />,  iconColor: "#34495e", url: "/converter/qr-code-reader"     },
          { id: 503, name: "Barcode Generator", icon: <FaBarcode />, iconColor: "#1a252f", url: "/converter/bar-code-generator" },
        ],
      },
      {
        id: 60,
        name: "Miscellaneous",
        icon: <FaGlobe />,
        iconColor: "#2980b9",
        url: "#",
        children: [
          { id: 601, name: "Unit Converter",     icon: <FaRuler />,          iconColor: "#8e44ad", url: "/converter/unit-converter"      },
          { id: 602, name: "Base Converter",     icon: <FaExchangeAlt />,    iconColor: "#2980b9", url: "/converter/base-converter"      },
          { id: 603, name: "Speed Converter",    icon: <FaClock />,          iconColor: "#e67e22", url: "/converter/speed-converter"     },
          { id: 604, name: "Currency Converter", icon: <FaDollarSign />,     iconColor: "#27ae60", url: "/converter/currency-converter"  },
          { id: 605, name: "Time Converter",     icon: <FaClock />,          iconColor: "#16a085", url: "/converter/time-converter"      },
          { id: 607, name: "Data Size Converter",icon: <FaDatabase />,       iconColor: "#c0392b", url: "/converter/data-size-converter" },
        ],
      },
      {
        id: 70,
        name: "Converter Tools",
        icon: <FaPalette />,
        iconColor: "#9b59b6",
        url: "#",
        children: [
          { id: 7010, name: "Unix Timestamp Converter", icon: <FaClock />,      iconColor: "#e74c3c", url: "/converter/unix-timestamp"      },
          { id: 7020, name: "Color Converter",          icon: <FaPalette />,    iconColor: "#9b59b6", url: "/converter/color-converter"     },
          { id: 7030, name: "Text Case Converter",      icon: <FaTextHeight />, iconColor: "#2980b9", url: "/converter/text-case-converter" },
        ],
      },
      {
        id: 80,
        name: "Utilities",
        icon: <FaChartBar />,
        iconColor: "#1abc9c",
        url: "#",
        children: [
          { id: 93, name: "CV Builder",      icon: <FaFileAlt />,  iconColor: "#2980b9", url: "/converter/Cvbuilder"     },
          { id: 95, name: "Regex Tester",    icon: <FaRepeat />,   iconColor: "#e74c3c", url: "/converter/Regextool"     },
          { id: 96, name: "Code Formatter",  icon: <FaCode />,     iconColor: "#e67e22", url: "/converter/Codeformatter" },
          { id: 97, name: "Data Visualizer", icon: <FaChartBar />, iconColor: "#1abc9c", url: "/converter/Datavisual"    },
          { id: 98, name: "AI Chatbot",      icon: <FaRobot />,    iconColor: "#8e44ad", url: "/converter/Aichatboat"    },
        ],
      },
    ],
  },
];

const filterSearchData: SidebarItem[] = [
  { id: 1000, name: "Base64 & Binary",         icon: <FaExchangeAlt />,     iconColor: "#8e44ad", url: "#" },
  { id: 101,  name: "ASCII to Base64",         icon: <FaCode />,            iconColor: "#e67e22", url: "/converter/encoder/ascii"        },
  { id: 102,  name: "Audio to Base64",         icon: <FaMusic />,           iconColor: "#9b59b6", url: "/converter/encoder/audio"        },
  { id: 103,  name: "File to Base64",          icon: <FaFileAlt />,         iconColor: "#3498db", url: "/converter/encoder/file"         },
  { id: 106,  name: "Hex to Base64",           icon: <FaCode />,            iconColor: "#1abc9c", url: "/converter/encoder/hex"          },
  { id: 108,  name: "Text to Binary",          icon: <FaTextHeight />,      iconColor: "#e74c3c", url: "/converter/encoder/binary"       },
  { id: 201,  name: "Base64 to ASCII",         icon: <FaCode />,            iconColor: "#e67e22", url: "/converter/decoder/ascii"        },
  { id: 202,  name: "Base64 to Audio",         icon: <FaMusic />,           iconColor: "#9b59b6", url: "/converter/decoder/audio"        },
  { id: 203,  name: "Base64 to File",          icon: <FaFileAlt />,         iconColor: "#3498db", url: "/converter/decoder/file"         },
  { id: 204,  name: "Base64 to Image",         icon: <FaImage />,           iconColor: "#27ae60", url: "/converter/decoder/image"        },
  { id: 205,  name: "Base64 to PDF",           icon: <FaFileAlt />,         iconColor: "#e74c3c", url: "/converter/decoder/pdf"          },
  { id: 206,  name: "Base64 to Hex",           icon: <FaCode />,            iconColor: "#1abc9c", url: "/converter/decoder/hex"          },
  { id: 207,  name: "Base64 to JSON",          icon: <FaCode />,            iconColor: "#0052cc", url: "/converter/decoder/json"         },
  { id: 209,  name: "JWT Decoder",             icon: <FaLock />,            iconColor: "#c0392b", url: "/converter/decoder/jwt"          },
  { id: 208,  name: "Binary to Text",          icon: <FaTextHeight />,      iconColor: "#2980b9", url: "/converter/decoder/binary"       },
  { id: 301,  name: "JSON Formatter",          icon: <FaConfluence />,      iconColor: "#0052cc", url: "/tools/json-formatter"           },
  { id: 302,  name: "Text Formatter",          icon: <FaPencilAlt />,       iconColor: "#e67e22", url: "/tools/text-formatter"           },
  { id: 303,  name: "JavaScript Formatter",    icon: <FaCode />,            iconColor: "#f0db4f", url: "/tools/javascript-formatter"     },
  { id: 304,  name: "SQL Formatter",           icon: <FaTable />,           iconColor: "#336791", url: "/tools/sql-formatter"            },
  { id: 305,  name: "Excel to Json Formatter", icon: <FaTable />,           iconColor: "#27ae60", url: "/tools/excel-to-json"            },
  { id: 306,  name: "JSON to Excel",           icon: <FaTable />,           iconColor: "#1e8449", url: "/tools/json-to-excel"            },
  { id: 401,  name: "Images to PDF & Base64",  icon: <FaFileArchive />,     iconColor: "#e74c3c", url: "/converter/images-to-pdf"        },
  { id: 402,  name: "Files to ZIP Compress",   icon: <FaCompress />,        iconColor: "#f39c12", url: "/converter/files-to-zip"         },
  { id: 403,  name: "ZIP to Files Decompress", icon: <FaFileArchive />,     iconColor: "#d35400", url: "/converter/decompress-zip"       },
  { id: 404,  name: "Encrypt File",            icon: <FaLock />,            iconColor: "#c0392b", url: "/converter/encrypt-file"         },
  { id: 501,  name: "QR Code Generator",       icon: <FaQrcode />,          iconColor: "#2c3e50", url: "/converter/qr-code-generator"   },
  { id: 502,  name: "QR Code Reader",          icon: <FaQrcode />,          iconColor: "#34495e", url: "/converter/qr-code-reader"      },
  { id: 503,  name: "Barcode Generator",       icon: <FaBarcode />,         iconColor: "#1a252f", url: "/converter/bar-code-generator"  },
  { id: 504,  name: "Password Generator",      icon: <FaLock />,            iconColor: "#8e44ad", url: "/generator/password"            },
  { id: 601,  name: "Unit Converter",          icon: <FaRuler />,           iconColor: "#8e44ad", url: "/converter/unit-converter"      },
  { id: 602,  name: "Base Converter",          icon: <FaExchangeAlt />,     iconColor: "#2980b9", url: "/converter/base-converter"      },
  { id: 603,  name: "Speed Converter",         icon: <FaClock />,           iconColor: "#e67e22", url: "/converter/speed-converter"     },
  { id: 604,  name: "Currency Converter",      icon: <FaDollarSign />,      iconColor: "#27ae60", url: "/converter/currency-converter"  },
  { id: 605,  name: "Time Converter",          icon: <FaClock />,           iconColor: "#16a085", url: "/converter/time-converter"      },
  { id: 606,  name: "Temperature Converter",   icon: <FaThermometerHalf />, iconColor: "#e74c3c", url: "/converter/temperature-converter"},
  { id: 607,  name: "Data Size Converter",     icon: <FaDatabase />,        iconColor: "#c0392b", url: "/converter/data-size-converter" },
  { id: 608,  name: "IP Address Lookup",       icon: <FaGlobe />,           iconColor: "#2980b9", url: "/tools/ip-lookup"               },
  { id: 7010, name: "Unix Timestamp Converter",icon: <FaClock />,           iconColor: "#e74c3c", url: "/converter/unix-timestamp"      },
  { id: 7020, name: "Color Converter",         icon: <FaPalette />,         iconColor: "#9b59b6", url: "/converter/color-converter"     },
  { id: 7030, name: "Text Case Converter",     icon: <FaTextHeight />,      iconColor: "#2980b9", url: "/converter/text-case-converter" },
  { id: 609,  name: "PDF to Word",             icon: <FaFileWord />,        iconColor: "#2980b9", url: "/converter/PDFtools/PDFtoWord"       },
  { id: 611,  name: "PDF to JPG",              icon: <FaImage />,           iconColor: "#27ae60", url: "/converter/PDFtools/PdftoJpg"        },
  { id: 613,  name: "Excel to PDF",            icon: <FaFileExcel />,       iconColor: "#1e8449", url: "/converter/PDFtools/Excletopdf"      },
  { id: 621,  name: "Word to PDF",             icon: <FaFileWord />,        iconColor: "#154360", url: "/converter/PDFtools/Wordtopdf"       },
  { id: 610,  name: "PDF Edit",                icon: <FaEdit />,            iconColor: "#8e44ad", url: "/converter/PDFtools/Pdfedit"         },
  { id: 620,  name: "PDF Watermark",           icon: <FaFilePdf />,         iconColor: "#e74c3c", url: "/converter/PDFtools/Pdfwatermark"    },
  { id: 617,  name: "PDF Page Numbering",      icon: <FaFilePdf />,         iconColor: "#e67e22", url: "/converter/PDFtools/Pdfpageno"       },
  { id: 612,  name: "PDF Merge",               icon: <FaFilePdf />,         iconColor: "#16a085", url: "/converter/PDFtools/Pdfmerge"        },
  { id: 614,  name: "PDF Split",               icon: <FaFilePdf />,         iconColor: "#d35400", url: "/converter/PDFtools/Pdfsplit"        },
  { id: 618,  name: "PDF Page Rearrange",      icon: <FaFilePdf />,         iconColor: "#2c3e50", url: "/converter/PDFtools/Pdfpagerearange" },
  { id: 615,  name: "PDF Rotate",              icon: <FaFilePdf />,         iconColor: "#c0392b", url: "/converter/PDFtools/Pdfrotate"       },
  { id: 616,  name: "PDF Sign",                icon: <FaLock />,            iconColor: "#1abc9c", url: "/converter/PDFtools/Pdfsign"         },
  { id: 619,  name: "PDF Difference",          icon: <FaFilePdf />,         iconColor: "#7f8c8d", url: "/converter/PDFtools/Pdfdeffrence"    },
  { id: 7011, name: "Image Compressor",        icon: <FaCompress />,        iconColor: "#e74c3c", url: "/converter/Imagetools/Imagecom"        },
  { id: 7021, name: "Image Edit",              icon: <FaEdit />,            iconColor: "#8e44ad", url: "/converter/Imagetools/Imageedit"       },
  { id: 7031, name: "Image Type Converter",    icon: <FaImage />,           iconColor: "#27ae60", url: "/converter/Imagetools/Imagetypeconvert"},
  { id: 94,   name: "Image Extractor",         icon: <FaImage />,           iconColor: "#2980b9", url: "/converter/Imageextract"               },
  { id: 93,   name: "CV Builder",              icon: <FaFileAlt />,         iconColor: "#2980b9", url: "/converter/Cvbuilder"     },
  { id: 95,   name: "Regex Tester",            icon: <FaRepeat />,          iconColor: "#e74c3c", url: "/converter/Regextool"     },
  { id: 96,   name: "Code Formatter",          icon: <FaCode />,            iconColor: "#e67e22", url: "/converter/Codeformatter" },
  { id: 97,   name: "Data Visualizer",         icon: <FaChartBar />,        iconColor: "#1abc9c", url: "/converter/Datavisual"    },
  { id: 98,   name: "AI Chatbot",              icon: <FaRobot />,           iconColor: "#8e44ad", url: "/converter/Aichatboat"    },
];

export const sidebarFooterData: SidebarItem[] = [
  { id: 101, name: "ASCII to Base64", icon: <FaCode />, iconColor: "#e67e22", url: "/converter/encoder/ascii" },
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
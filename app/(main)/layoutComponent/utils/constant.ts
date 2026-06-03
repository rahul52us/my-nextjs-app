import {
  FaCode, FaMusic, FaFileAlt, FaImage, FaTextHeight, FaQrcode, FaBarcode,
  FaCompress, FaLock, FaExchangeAlt, FaClock, FaConfluence, FaPencilAlt,
  FaFileArchive, FaRuler, FaGlobe, FaTable, FaDollarSign, FaDatabase,
  FaPalette, FaFilePdf, FaEdit, FaFileExcel, FaFileWord, FaFileSignature,
  FaWater, FaListOl, FaObjectGroup, FaCut, FaBalanceScale, FaUndo,
  FaSignature, FaCropAlt, FaMagic, FaFileImage, FaKeyboard, FaHashtag,
  FaFileCode, FaCalculator, FaExpandArrowsAlt, FaFileExport, FaChartBar,
  FaRobot, FaTools,
} from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";

export const headerHeight = "70px";
export const childrenHeight = "860px";
export const footerHeight = "60px";

export const features: any = {

  // ── 1. PDF Tools ──────────────────────────────────────────────
  "PDF Tools": [
    { name: "PDF to Word",         icon: FaFileWord,      path: "/converter/PDFtools/PDFtoWord"        },
    { name: "PDF to JPG",          icon: FaImage,         path: "/converter/PDFtools/PdftoJpg"         },
    { name: "Excel to PDF",        icon: FaFileExcel,     path: "/converter/PDFtools/Excletopdf"       },
    { name: "Word to PDF",         icon: FaFileSignature, path: "/converter/PDFtools/Wordtopdf"        },
    { name: "PDF Edit",            icon: FaEdit,          path: "/converter/PDFtools/Pdfedit"          },
    { name: "PDF Watermark",       icon: FaWater,         path: "/converter/PDFtools/Pdfwatermark"     },
    { name: "PDF Page Numbering",  icon: FaListOl,        path: "/converter/PDFtools/Pdfpageno"        },
    { name: "PDF Merge",           icon: FaObjectGroup,   path: "/converter/PDFtools/Pdfmerge"         },
    { name: "PDF Split",           icon: FaCut,           path: "/converter/PDFtools/Pdfsplit"         },
    { name: "PDF Page Rearrange",  icon: FaExchangeAlt,   path: "/converter/PDFtools/Pdfpagerearange"  },
    { name: "PDF Rotate",          icon: FaUndo,          path: "/converter/PDFtools/Pdfrotate"        },
    { name: "PDF Sign",            icon: FaSignature,     path: "/converter/PDFtools/Pdfsign"          },
    { name: "PDF Difference",      icon: FaBalanceScale,  path: "/converter/PDFtools/Pdfdeffrence"     },
  ],

  // ── 2. Image Tools ────────────────────────────────────────────
  "Image Tools": [
    { name: "Image Compressor",     icon: FaCompress,  path: "/converter/Imagetools/Imagecom"         },
    { name: "Image Edit",           icon: FaEdit,      path: "/converter/Imagetools/Imageedit"        },
    { name: "Image Type Converter", icon: FaCropAlt,   path: "/converter/Imagetools/Imagetypeconvert" },
    { name: "BG Remover",           icon: FaMagic,     path: "/converter/Imagetools/Bgremove"         },
    { name: "Image Extractor",      icon: FaFileImage, path: "/converter/Imageextract"                },
  ],

  // ── 3. Base64 Encoders ────────────────────────────────────────
  "Base64 Encoders": [
    { name: "ASCII to Base64", icon: FaKeyboard, path: "/converter/encoder/ascii" },
    { name: "Audio to Base64", icon: FaMusic,    path: "/converter/encoder/audio" },
    { name: "Hex to Base64",   icon: FaHashtag,  path: "/converter/encoder/hex"   },
    { name: "File to Base64",  icon: FaFileAlt,  path: "/converter/encoder/file"  },
    { name: "URL to Base64",   icon: FaFileCode, path: "/converter/encoder/url"   },
  ],

  // ── 4. Base64 Decoders ────────────────────────────────────────
  "Base64 Decoders": [
    { name: "Base64 to ASCII", icon: FaKeyboard, path: "/converter/decoder/ascii" },
    { name: "Base64 to Audio", icon: FaMusic,    path: "/converter/decoder/audio" },
    { name: "Base64 to File",  icon: FaFileAlt,  path: "/converter/decoder/file"  },
    { name: "Base64 to Image", icon: FaImage,    path: "/converter/decoder/image" },
    { name: "Base64 to PDF",   icon: FaFilePdf,  path: "/converter/decoder/pdf"   },
    { name: "Base64 to Hex",   icon: FaHashtag,  path: "/converter/decoder/hex"   },
    { name: "JWT Decoder",     icon: FaLock,     path: "/converter/decoder/jwt"   },
  ],

  // ── 5. Binary Encoders ────────────────────────────────────────
  "Binary Encoders": [
    { name: "Text to Binary",    icon: FaTextHeight,  path: "/converter/binary/text-to-binary"    },
    { name: "ASCII to Binary",   icon: FaKeyboard,    path: "/converter/binary/ascii-to-binary"   },
    { name: "Hex to Binary",     icon: FaHashtag,     path: "/converter/binary/hex-to-binary"     },
    { name: "Base64 to Binary",  icon: FaCode,        path: "/converter/binary/base64-to-binary"  },
    { name: "File to Binary",    icon: FaFileAlt,     path: "/converter/binary/file-to-binary"    },
    { name: "Decimal to Binary", icon: FaCalculator,  path: "/converter/binary/decimal-to-binary" },
  ],

  // ── 6. Binary Decoders ────────────────────────────────────────
  "Binary Decoders": [
    { name: "Binary to Text",    icon: FaTextHeight, path: "/converter/binary/binary-to-text"    },
    { name: "Binary to ASCII",   icon: FaKeyboard,   path: "/converter/binary/binary-to-ascii"   },
    { name: "Binary to Hex",     icon: FaHashtag,    path: "/converter/binary/binary-to-hex"     },
    { name: "Binary to Base64",  icon: FaCode,       path: "/converter/binary/binary-to-base64"  },
    { name: "Binary to File",    icon: FaFileAlt,    path: "/converter/binary/binary-to-file"    },
    { name: "Binary to Decimal", icon: FaCalculator, path: "/converter/binary/binary-to-decimal" },
  ],

  // ── 7. Formatters ─────────────────────────────────────────────
  "Formatters": [
    { name: "JSON Formatter",      icon: FaConfluence, path: "/tools/json-formatter"  },
    { name: "Text Formatter",      icon: FaPencilAlt,  path: "/tools/text-formatter"  },
    { name: "Excel to JSON",       icon: FaFileCode,   path: "/tools/excel-to-json"   },
    { name: "JSON to Excel",       icon: FaFileExcel,  path: "/tools/json-to-excel"   },
  ],

  // ── 8. File Converters ────────────────────────────────────────
  "File Converters": [
    { name: "Images to PDF & Base64",  icon: FaFileImage,        path: "/converter/images-to-pdf"    },
    { name: "Files to ZIP Compress",   icon: FaCompress,         path: "/converter/files-to-zip"     },
    { name: "ZIP to Files Decompress", icon: FaExpandArrowsAlt,  path: "/converter/decompress-zip"   },
    { name: "Encrypt File",            icon: FaLock,             path: "/converter/encrypt-file"     },
    { name: "Excel to CSV",            icon: FaFileExport,       path: "/converter/Exceltocsv"       },
    { name: "CSV to Excel",            icon: FaFileExcel,        path: "/converter/Csvtoexcel"       },
  ],

  // ── 9. Generators ─────────────────────────────────────────────
  "Generators": [
    { name: "QR Code Generator", icon: FaQrcode,  path: "/converter/qr-code-generator"  },
    { name: "QR Code Reader",    icon: FaQrcode,  path: "/converter/qr-code-reader"     },
    { name: "Barcode Generator", icon: FaBarcode, path: "/converter/bar-code-generator" },
  ],

  // ── 10. Miscellaneous ─────────────────────────────────────────
  "Miscellaneous": [
    { name: "Unit Converter",      icon: FaRuler,       path: "/converter/unit-converter"      },
    { name: "Base Converter",      icon: FaExchangeAlt, path: "/converter/base-converter"      },
    { name: "Speed Converter",     icon: FaClock,       path: "/converter/speed-converter"     },
    // { name: "Currency Converter",  icon: FaDollarSign,  path: "/converter/currency-converter"  },
    { name: "Time Converter",      icon: FaClock,       path: "/converter/time-converter"      },
    { name: "Data Size Converter", icon: FaDatabase,    path: "/converter/data-size-converter" },
  ],

  // ── 11. Converter Utilities ───────────────────────────────────
  "Converter Utilities": [
    { name: "Unix Timestamp Converter", icon: FaClock,      path: "/converter/unix-timestamp"      },
    // { name: "Color Converter",          icon: FaPalette,    path: "/converter/color-converter"     },
    { name: "Text Case Converter",      icon: FaTextHeight, path: "/converter/text-case-converter" },
  ],

  // ── 12. Utilities ─────────────────────────────────────────────
  "Utilities": [
    // { name: "CV Builder",      icon: FaFileAlt,  path: "/converter/Cvbuilder"     },
    { name: "Regex Tester",    icon: FaRepeat,   path: "/converter/Regextool"     },
    { name: "Code Formatter",  icon: FaCode,     path: "/converter/Codeformatter" },
    { name: "Data Visualizer", icon: FaChartBar, path: "/converter/Datavisual"    },
    // { name: "AI Chatbot",      icon: FaRobot,    path: "/converter/Aichatboat"    },
  ],
};
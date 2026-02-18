"use client";
import { useState, useCallback, ChangeEvent, useMemo, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
    Box,
    Button,
    Heading,
    Textarea,
    VStack,
    FormControl,
    FormLabel,
    Text,
    useColorModeValue,
    Image,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    useDisclosure,
    HStack,
    Input,
    Link,
    Select,
    Spinner,
    useToast,
    Tooltip,
    Skeleton,
    Checkbox,
    Progress,
    NumberInput,
    NumberInputField,
    FormHelperText,
    Icon,
    Flex,
    Divider,
    Card,
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon, ViewIcon, ViewOffIcon, RepeatIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { AgGridReact } from "ag-grid-react";
import { ColDef, IHeaderParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import * as XLSX from "xlsx";
import ReactSelect, { MultiValue } from "react-select";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// import "./excelViewer.css"; // Ensure this CSS file exists or style directly

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Interfaces for type safety
interface SheetData {
    sheetName: string;
    data: any[][];
    rowData: Record<string, any>[];
}

interface SelectOption {
    value: string;
    label: string;
}

// Custom Header Component for AG Grid
const CustomHeader = ({ displayName }: IHeaderParams) => {
    return (
        <Text fontWeight="bold" fontSize="sm" color={useColorModeValue("gray.800", "white")}>
            {displayName}
        </Text>
    );
};

// MIME type detection and utility functions
const detectMimeTypeFromBase64 = (base64: string): string | null => {
    try {
        if (base64.length < 30) return null;
        const binary = atob(base64.slice(0, 30));
        const bytes = Array.from(binary)
            .slice(0, 4)
            .map((c) => c.charCodeAt(0));
        if (
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47
        )
            return "image/png";
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
            return "image/jpeg";
        if (
            bytes[0] === 0x25 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x44 &&
            bytes[3] === 0x46
        )
            return "application/pdf";
        if (
            bytes[0] === 0x47 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x38
        )
            return "image/gif";
        if (
            bytes[0] === 0x50 &&
            bytes[1] === 0x4b &&
            (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
            (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
        )
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (
            bytes[0] === 0xd0 &&
            bytes[1] === 0xcf &&
            bytes[2] === 0x11 &&
            bytes[3] === 0xe0
        )
            return "application/vnd.ms-excel";
        return null;
    } catch (error) {
        console.error("Error in detectMimeTypeFromBase64:", error);
        return null;
    }
};

const extensionToMime: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
};

const mimeToExtension: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
};

const detectMimeTypeFromSuffix = (input: string): string | null => {
    const match = input.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
        const ext = match[1].toLowerCase();
        return extensionToMime[ext] || null;
    }
    return null;
};

const ensureBase64HasPrefix = (base64: string): string => {
    if (base64.startsWith("data:")) return base64;
    let mimeType = detectMimeTypeFromBase64(base64);
    if (!mimeType) mimeType = detectMimeTypeFromSuffix(base64);
    if (!mimeType) {
        throw new Error(
            "Unknown file type. Please ensure the Base64 string is valid and includes a correct data URI prefix or a supported file extension."
        );
    }
    const cleanBase64 = base64
        .replace(/\.([a-zA-Z0-9]+)$/, "")
        .replace(/\s/g, "");
    return `data:${mimeType};base64,${cleanBase64}`;
};

const extractMimeAndData = (input: string) => {
    const normalized = ensureBase64HasPrefix(input);
    const regex = /^data:(.*?);base64,(.*)$/;
    const matches = normalized.match(regex);
    if (matches) {
        return {
            mimeType: matches[1],
            base64Data: matches[2],
        };
    }
    throw new Error("Invalid base64 string");
};

const generateFileName = (mimeType: string, suffix: string = "") => {
    const extension = mimeToExtension[mimeType] || "bin";
    const timestamp = new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14);
    return `file_${timestamp}${suffix}.${extension}`;
};

export default function ExcelToJsonContent() {
    const [base64, setBase64] = useState<string>("");
    const [previewContent, setPreviewContent] = useState<SheetData[] | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [selectedColumns, setSelectedColumns] = useState<Record<string, string[]>>({});
    const [selectAllColumns, setSelectAllColumns] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startRow, setStartRow] = useState<string>("1");
    const [endRow, setEndRow] = useState<string>("");
    const toast = useToast();
    const gridApiRef = useRef<any | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const accentColor = "teal.500";

    // Load saved column selections from localStorage
    useEffect(() => {
        const savedSelections = localStorage.getItem("selectedColumns");
        if (savedSelections) {
            try {
                setSelectedColumns(JSON.parse(savedSelections));
            } catch (err) {
                console.error("Error loading saved column selections:", err);
            }
        }
    }, []);

    // Save column selections to localStorage
    useEffect(() => {
        if (Object.keys(selectedColumns).length > 0) {
            localStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
        }
    }, [selectedColumns]);

    // Handle search input with debouncing
    /* const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
       const value = e.target.value;
       setSearchQuery(value);
       if (searchTimeoutRef.current) {
         clearTimeout(searchTimeoutRef.current);
       }
       searchTimeoutRef.current = setTimeout(() => {
         if (gridApiRef.current) {
           gridApiRef.current.setQuickFilter(value);
         }
       }, 300);
     };
  
     // Clear search input
     const clearSearch = () => {
       setSearchQuery("");
       if (gridApiRef.current) {
         gridApiRef.current.setQuickFilter("");
       }
     }; */ // Unused search functions for now, can be re-enabled if UI is added

    const decodeBase64ToBlob = (
        input: string
    ): { blob: Blob; mimeType: string } | null => {
        try {
            const { mimeType, base64Data } = extractMimeAndData(input);
            const cleanedBase64 = base64Data.replace(/\s/g, "");
            const byteCharacters = atob(cleanedBase64);
            const byteArray = new Uint8Array(
                Array.from(byteCharacters, (char) => char.charCodeAt(0))
            );
            if (byteArray.length === 0) {
                setError("Decoded byte array is empty. Please check the Base64 string.");
                return null;
            }
            if (byteArray.length > 100 * 1024 * 1024) {
                setError("File size exceeds 100MB. Please upload a smaller file.");
                return null;
            }
            const blob = new Blob([byteArray], { type: mimeType });
            return { blob, mimeType };
        } catch (error) {
            console.error("Error decoding base64 to blob:", error);
            setError("Invalid Base64 data. Ensure the string is correctly encoded.");
            return null;
        }
    };

    const parseExcelFile = (data: ArrayBuffer) => {
        try {
            setLoadingProgress(0);
            const workbook = XLSX.read(data, {
                type: "array",
                cellDates: true,
            });
            const sheetsData = workbook.SheetNames.map((sheetName) => {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    blankrows: false,
                    defval: "",
                }) as any[][];
                if (!jsonData.length) {
                    return { sheetName, data: [], rowData: [] };
                }
                const headerCounts: Record<string, number> = {};
                const headers =
                    Array.isArray(jsonData[0]) && jsonData[0].length
                        ? jsonData[0].map((cell, index) => {
                            const baseHeader = cell != null && cell !== "" ? String(cell) : `Column ${index + 1}`;
                            headerCounts[baseHeader] = (headerCounts[baseHeader] || 0) + 1;
                            return headerCounts[baseHeader] > 1 ? `${baseHeader}_${headerCounts[baseHeader] - 1}` : baseHeader;
                        })
                        : Array.from(
                            {
                                length: Math.max(
                                    ...jsonData.slice(1).map((row) => (Array.isArray(row) ? row.length : 0))
                                ) || 1,
                            },
                            (_, i) => `Column ${i + 1}`
                        );
                console.log(`Headers for sheet ${sheetName}:`, headers);
                const rowData = jsonData
                    .slice(1)
                    .map((row) => {
                        if (!Array.isArray(row)) return {};
                        return row.reduce(
                            (acc, cell, index) => {
                                const key = headers[index] || `Col${index}`;
                                acc[key] =
                                    typeof cell === "object" && cell !== null
                                        ? JSON.stringify(cell, null, 2)
                                        : cell ?? "";
                                return acc;
                            },
                            {} as Record<string, any>
                        );
                    })
                    .filter((row) => Object.keys(row).length > 0);
                return { sheetName, data: [headers, ...jsonData.slice(1)], rowData };
            }).filter((sheet) => sheet.data.length > 0 || sheet.rowData.length > 0);
            if (!sheetsData.length) {
                throw new Error("No valid sheets found in the Excel file.");
            }
            setPreviewContent(sheetsData);
            setSelectedSheet(sheetsData[0].sheetName);
            setSelectedColumns(
                sheetsData.reduce(
                    (acc, sheet) => {
                        acc[sheet.sheetName] = acc[sheet.sheetName] || [];
                        return acc;
                    },
                    {} as Record<string, string[]>
                )
            );
            setFileType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            setIsLoading(false);
            setLoadingProgress(100);
            setEndRow(String(sheetsData[0].rowData.length));
            toast({
                title: "File loaded successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error("Error parsing Excel file:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to parse the Excel file. Ensure it is a valid Excel file."
            );
            setIsLoading(false);
            setLoadingProgress(0);
        }
    };

    const previewBase64 = useCallback((input: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { mimeType, base64Data } = extractMimeAndData(input);
            setFileType(mimeType);

            if (mimeType.startsWith("image") || mimeType === "application/pdf") {
                const previewUri = `data:${mimeType};base64,${base64Data}`;
                try {
                    atob(base64Data.slice(0, 100));
                } catch (e) {
                    throw new Error("Invalid Base64 encoding for image/PDF.");
                }
                setPreviewContent([
                    { sheetName: "Preview", data: [[previewUri]], rowData: [] },
                ]);
                setSelectedSheet("Preview");
                setIsLoading(false);
                setLoadingProgress(100);
            } else if (
                mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                mimeType === "application/vnd.ms-excel"
            ) {
                const byteCharacters = atob(base64Data);
                const byteArray: any = new Uint8Array(
                    Array.from(byteCharacters, (char) => char.charCodeAt(0))
                );
                parseExcelFile(byteArray);
            } else {
                setError("Unsupported file type for preview.");
                setIsLoading(false);
                setLoadingProgress(0);
            }
        } catch (error) {
            console.error("Error in previewBase64:", error);
            setPreviewContent(null);
            setFileType(null);
            setSelectedSheet("");
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to preview the file. Ensure the Base64 string is valid."
            );
            setIsLoading(false);
            setLoadingProgress(0);
        }
    }, []);

    const handleBase64Change = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.trim().replace(/\s/g, "");
        setBase64(value);
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setError("No file selected.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);

        if (file.size > 100 * 1024 * 1024) {
            setError("File size exceeds 100MB. Please upload a smaller file.");
            setIsLoading(false);
            return;
        }

        if (file.name.endsWith(".txt")) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = (ev.target?.result as string)?.trim().replace(/\s/g, "");
                if (!content) {
                    setError("Uploaded file is empty or invalid.");
                    setIsLoading(false);
                    setLoadingProgress(0);
                    return;
                }
                setBase64(content);
            };
            reader.onerror = () => {
                setError("Error reading the text file.");
                setIsLoading(false);
                setLoadingProgress(0);
            };
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    setLoadingProgress((e.loaded / e.total) * 100);
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const arrayBuffer = ev.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    setError("Error reading the Excel file.");
                    setIsLoading(false);
                    setLoadingProgress(0);
                    return;
                }
                parseExcelFile(arrayBuffer);
            };
            reader.onerror = () => {
                setError("Error reading the Excel file.");
                setIsLoading(false);
                setLoadingProgress(0);
            };
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    setLoadingProgress((e.loaded / e.total) * 100);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            setError("Please upload a .txt, .xlsx, or .xls file.");
            setIsLoading(false);
            setLoadingProgress(0);
        }
    };

    useEffect(() => {
        if (base64) {
            previewBase64(base64);
        } else {
            setPreviewContent(null);
            setFileType(null);
            setSelectedSheet("");
            setError(null);
            setIsLoading(false);
            setLoadingProgress(0);
            setSelectedColumns({});
            setSelectAllColumns(false);
            setSearchQuery("");
            setStartRow("1");
            setEndRow("");
            localStorage.removeItem("selectedColumns");
            if (gridApiRef.current) {
                gridApiRef.current?.setQuickFilter("");
            }
        }
    }, [base64, previewBase64]);

    const handleDownload = () => {
        if (!base64.trim()) {
            setError("Please enter a valid Base64 string.");
            return;
        }
        const decoded = decodeBase64ToBlob(base64);
        if (!decoded) return;
        try {
            saveAs(decoded.blob, generateFileName(decoded.mimeType));
            setError(null);
            toast({
                title: "File downloaded successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error("Error during file download:", error);
            setError("Failed to download the file.");
        }
    };

    const handleShare = async () => {
        if (!base64.trim()) {
            setError("Please enter a valid Base64 string.");
            return;
        }
        const decoded = decodeBase64ToBlob(base64);
        if (!decoded) return;
        const file = new File([decoded.blob], generateFileName(decoded.mimeType), {
            type: decoded.mimeType,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: "Shared File",
                    text: "Here is the file you requested.",
                });
                setError(null);
                toast({
                    title: "File shared successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right",
                });
            } catch (err) {
                console.error("Share failed:", err);
                setError("Sharing failed or not supported.");
            }
        } else {
            setError("Sharing is not supported on this device.");
        }
    };

    const handleTogglePreview = () => {
        if (!base64.trim() && !previewContent) {
            setError("Please provide a valid Base64 string or upload a file.");
            return;
        }
        if (!previewContent) {
            setError("No preview available. Please provide a valid input.");
            return;
        }
        setShowPreview((prev) => {
            const newState = !prev;
            if (newState) {
                onOpen();
            } else {
                onClose();
            }
            return newState;
        });
    };

    const validateRowRange = (sheetData: SheetData) => {
        const rowCount = sheetData.rowData.length;
        const start = parseInt(startRow, 10);
        const end = endRow ? parseInt(endRow, 10) : rowCount;

        if (isNaN(start) || start < 1) {
            setError("Start row must be a positive number.");
            return null;
        }
        if (endRow && (isNaN(end) || end < start)) {
            setError("End row must be a number greater than or equal to start row.");
            return null;
        }
        if (start > rowCount) {
            setError(`Start row exceeds total rows (${rowCount}).`);
            return null;
        }
        if (end > rowCount) {
            setError(`End row exceeds total rows (${rowCount}).`);
            return null;
        }
        return { start: start - 1, end: end - 1 };
    };

    const handleDownloadJson = (sheetName: string) => {
        if (!previewContent || !selectedColumns[sheetName]?.length) {
            setError("Please select at least one column for the sheet.");
            toast({
                title: "No columns selected",
                description: `Please select columns for ${sheetName} to download as JSON.`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        const selectedSheetData = previewContent.find(
            (sheet) => sheet.sheetName === sheetName
        );
        if (!selectedSheetData || !selectedSheetData.rowData) {
            setError("No data available for the selected sheet.");
            return;
        }

        const range = validateRowRange(selectedSheetData);
        if (!range) return;

        const filteredData = selectedSheetData.rowData
            .slice(range.start, range.end + 1)
            .map((row) => {
                const filteredRow: Record<string, any> = {};
                selectedColumns[sheetName].forEach((col) => {
                    if (row.hasOwnProperty(col)) {
                        filteredRow[col] = row[col];
                    }
                });
                return Object.keys(filteredRow).length > 0 ? filteredRow : null;
            })
            .filter((row): row is Record<string, any> => row !== null);

        if (filteredData.length === 0) {
            setError("No data available for the selected columns and row range.");
            toast({
                title: "No data to download",
                description: `No valid data for the selected columns and rows in ${sheetName}.`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        const jsonString = JSON.stringify(filteredData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        saveAs(blob, `${sheetName}_rows_${range.start + 1}-${range.end + 1}_selected_columns.json`);
        setError(null);
        toast({
            title: "JSON downloaded",
            description: `Successfully downloaded JSON for ${sheetName} (rows ${range.start + 1}-${range.end + 1}).`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
        });
    };

    const handleDownloadExcel = (sheetName: string) => {
        if (!previewContent || !selectedColumns[sheetName]?.length) {
            setError("Please select at least one column for the sheet.");
            toast({
                title: "No columns selected",
                description: `Please select columns for ${sheetName} to download as Excel.`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",

            });
            return;
        }

        const selectedSheetData = previewContent.find(
            (sheet) => sheet.sheetName === sheetName
        );
        if (!selectedSheetData || !selectedSheetData.rowData) {
            setError("No data available for the selected sheet.");
            return;
        }

        const range = validateRowRange(selectedSheetData);
        if (!range) return;

        const filteredData = selectedSheetData.rowData
            .slice(range.start, range.end + 1)
            .map((row) => {
                const filteredRow: Record<string, any> = {};
                selectedColumns[sheetName].forEach((col) => {
                    if (row.hasOwnProperty(col)) {
                        filteredRow[col] = row[col];
                    }
                });
                return Object.keys(filteredRow).length > 0 ? filteredRow : null;
            })
            .filter((row): row is Record<string, any> => row !== null);

        if (filteredData.length === 0) {
            setError("No data available for the selected columns and row range.");
            toast({
                title: "No data to download",
                description: `No valid data for the selected columns and rows in ${sheetName}.`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${sheetName}_rows_${range.start + 1}-${range.end + 1}_selected_columns.xlsx`);
        setError(null);
        toast({
            title: "Excel downloaded",
            description: `Successfully downloaded Excel for ${sheetName} (rows ${range.start + 1}-${range.end + 1}).`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
        });
    };

    const handleDownloadAllJsons = async () => {
        if (!previewContent) {
            setError("No sheets available to download.");
            return;
        }

        const zip = new JSZip();
        let hasData = false;

        for (const sheet of previewContent) {
            if (!selectedColumns[sheet.sheetName]?.length) continue;
            const range = validateRowRange(sheet);
            if (!range) continue;

            const filteredData = sheet.rowData
                .slice(range.start, range.end + 1)
                .map((row) => {
                    const filteredRow: Record<string, any> = {};
                    selectedColumns[sheet.sheetName].forEach((col) => {
                        if (row.hasOwnProperty(col)) {
                            filteredRow[col] = row[col];
                        }
                    });
                    return Object.keys(filteredRow).length > 0 ? filteredRow : null;
                })
                .filter((row): row is Record<string, any> => row !== null);

            if (filteredData.length > 0) {
                hasData = true;
                zip.file(
                    `${sheet.sheetName}_rows_${range.start + 1}-${range.end + 1}_selected_columns.json`,
                    JSON.stringify(filteredData, null, 2)
                );
            }
        }

        if (!hasData) {
            setError("No sheets with selected columns and valid data in the specified row range.");
            toast({
                title: "No data to download",
                description: "Please select columns and valid row ranges for at least one sheet.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `all_sheets_rows_${startRow}-${endRow || 'end'}_${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}.zip`);
            setError(null);
            toast({
                title: "Zip downloaded",
                description: `Successfully downloaded zip containing JSONs for all sheets (rows ${startRow}-${endRow || 'end'}).`,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error("Error generating zip:", error);
            setError("Failed to generate zip file.");
        }
    };

    const handleResetColumns = () => {
        setSelectedColumns((prev) => ({
            ...prev,
            [selectedSheet]: [],
        }));
        setSelectAllColumns(false);
        toast({
            title: "Columns reset",
            description: `Column selections for ${selectedSheet} have been reset.`,
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top-right",
        });
    };

    const columnDefs = useMemo<ColDef[]>(() => {
        const selectedSheetData = previewContent?.find(
            (sheet) => sheet.sheetName === selectedSheet
        );
        if (
            !selectedSheetData ||
            !selectedSheetData.data ||
            !Array.isArray(selectedSheetData.data) ||
            selectedSheetData.data.length === 0
        ) {
            return [
                {
                    headerName: "Column 1",
                    field: "Col0",
                    sortable: true,
                    filter: true,
                    resizable: true,
                    editable: false,
                    minWidth: 150,
                    maxWidth: 400,
                    cellStyle: {
                        textAlign: "left",
                        padding: "8px",
                        fontSize: "14px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: "1.4",
                    },
                    headerComponent: CustomHeader,
                },
            ];
        }
        const firstRow = selectedSheetData.data[0];
        return firstRow.map((header, index) => ({
            headerName: header,
            field: header || `Col${index}`,
            sortable: true,
            filter: true,
            resizable: true,
            editable: false,
            minWidth: 150,
            maxWidth: 400,
            cellStyle: {
                textAlign: "left",
                padding: "8px",
                fontSize: "14px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.4",
            },
            headerComponent: CustomHeader,
        }));
    }, [previewContent, selectedSheet]);

    const columnOptions = useMemo<SelectOption[]>(() => {
        const selectedSheetData = previewContent?.find(
            (sheet) => sheet.sheetName === selectedSheet
        );
        if (!selectedSheetData || !selectedSheetData.data?.[0]) return [];
        const headerCounts: Record<string, number> = {};
        const options = selectedSheetData.data[0].map((header, index) => {
            const baseLabel = header || `Column ${index + 1}`;
            headerCounts[baseLabel] = (headerCounts[baseLabel] || 0) + 1;
            const value = headerCounts[baseLabel] > 1 ? `${baseLabel}_${headerCounts[baseLabel] - 1}` : baseLabel;
            return {
                value,
                label: baseLabel,
            };
        });
        console.log(`Column options for sheet ${selectedSheet}:`, options);
        return options;
    }, [previewContent, selectedSheet]);

    // Handle select all columns checkbox
    useEffect(() => {
        if (selectAllColumns && columnOptions.length > 0) {
            setSelectedColumns((prev) => ({
                ...prev,
                [selectedSheet]: columnOptions.map((opt) => opt.value),
            }));
        } else if (!selectAllColumns) {
            setSelectedColumns((prev) => ({
                ...prev,
                [selectedSheet]: [],
            }));
        }
    }, [selectAllColumns, columnOptions, selectedSheet]);

    // Update endRow when sheet changes
    useEffect(() => {
        const selectedSheetData = previewContent?.find(
            (sheet) => sheet.sheetName === selectedSheet
        );
        if (selectedSheetData?.rowData.length) {
            setEndRow(String(selectedSheetData.rowData.length));
        }
    }, [selectedSheet, previewContent]);

    return (
        <Box p={{ base: 4, md: 8 }} bg={bgColor} color={textColor} minH="100vh">
            <Card p={6} borderRadius="lg" boxShadow="lg" bg={cardBg}>
                <Heading
                    as="h1"
                    size="xl"
                    color={accentColor}
                    textAlign="center"
                    fontWeight="extrabold"
                    mb={6}
                    textTransform="uppercase"
                    letterSpacing="wide"
                >
                    Excel File Processor
                </Heading>

                {error && (
                    <Text
                        color="red.500"
                        bg="red.50"
                        p={4}
                        borderRadius="md"
                        mb={6}
                        textAlign="center"
                        fontWeight="medium"
                        role="alert"
                    >
                        <Icon as={InfoOutlineIcon} mr={2} />
                        {error}
                    </Text>
                )}

                {isLoading && (
                    <Box
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="blackAlpha.800"
                        zIndex={9999}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                    >
                        <Spinner size="xl" color={accentColor} thickness="4px" />
                        <Progress
                            value={loadingProgress}
                            size="sm"
                            colorScheme="teal"
                            width="300px"
                            mt={4}
                            borderRadius="md"
                        />
                        <Text mt={4} color="white" fontSize="lg" fontWeight="medium">
                            Processing file... {Math.round(loadingProgress)}%
                        </Text>
                    </Box>
                )}

                <VStack spacing={6} align="stretch">
                    <FormControl>
                        <FormLabel fontWeight="semibold" color={textColor} fontSize="md">
                            Paste Base64 String
                        </FormLabel>
                        <Skeleton isLoaded={!isLoading}>
                            <Textarea
                                value={base64}
                                onChange={handleBase64Change}
                                placeholder="Enter your Base64 string here"
                                rows={6}
                                bg={cardBg}
                                borderColor={borderColor}
                                borderRadius="md"
                                fontFamily="'Courier New', monospace"
                                fontSize="sm"
                                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                                _hover={{ borderColor: "teal.400" }}
                                transition="all 0.2s"
                                aria-label="Base64 input"
                            />
                        </Skeleton>
                        <FormHelperText color={textColor}>
                            Paste a Base64-encoded string of your file.
                        </FormHelperText>
                    </FormControl>

                    <FormControl>
                        <FormLabel fontWeight="semibold" color={textColor} fontSize="md">
                            Upload File
                        </FormLabel>
                        <Skeleton isLoaded={!isLoading}>
                            <Input
                                type="file"
                                accept=".txt,.xlsx,.xls"
                                onChange={handleFileUpload}
                                bg={cardBg}
                                borderColor={borderColor}
                                borderRadius="md"
                                p={2}
                                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                                _hover={{ borderColor: "teal.400" }}
                                transition="all 0.2s"
                                aria-label="File upload"
                            />
                        </Skeleton>
                        <FormHelperText color={textColor}>
                            Supported formats: .txt, .xlsx, .xls (Max 100MB)
                        </FormHelperText>
                    </FormControl>

                    <Flex justify="space-between" flexWrap="wrap" gap={4}>
                        <Button
                            colorScheme="teal"
                            onClick={handleDownload}
                            flex={1}
                            minW="150px"
                            isDisabled={!base64}
                            leftIcon={<DownloadIcon />}
                            bgGradient="linear(to-r, teal.500, teal.600)"
                            _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                            transform="scale(1)"
                            transition="transform 0.2s, background 0.3s"
                            _active={{ transform: "scale(0.98)" }}
                            borderRadius="full"
                            fontWeight="medium"
                            aria-label="Download file"
                        >
                            Download Original
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleShare}
                            flex={1}
                            minW="150px"
                            isDisabled={!base64}
                            leftIcon={<ExternalLinkIcon />}
                            bgGradient="linear(to-r, teal.500, teal.600)"
                            _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                            transform="scale(1)"
                            transition="transform 0.2s, background 0.3s"
                            _active={{ transform: "scale(0.98)" }}
                            borderRadius="full"
                            fontWeight="medium"
                            aria-label="Share file"
                        >
                            Share File
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleTogglePreview}
                            flex={1}
                            minW="150px"
                            leftIcon={showPreview ? <ViewOffIcon /> : <ViewIcon />}
                            bgGradient="linear(to-r, teal.500, teal.600)"
                            _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                            transform="scale(1)"
                            transition="transform 0.2s, background 0.3s"
                            _active={{ transform: "scale(0.98)" }}
                            borderRadius="full"
                            fontWeight="medium"
                            aria-label={showPreview ? "Hide preview" : "Show preview"}
                        >
                            {showPreview ? "Hide Preview" : "Show Preview"}
                        </Button>
                    </Flex>

                    <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
                        Upload an Excel file (.xlsx, .xls) or a .txt file with a Base64 string, or paste Base64 directly to process and preview.
                    </Text>
                </VStack>
            </Card>

            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={() => {
                    onClose();
                    setShowPreview(false);
                    setSelectedColumns({});
                    setSelectAllColumns(false);
                    setSearchQuery("");
                    setStartRow("1");
                    setEndRow("");
                    if (gridApiRef.current) {
                        gridApiRef.current.setQuickFilter("");
                    }
                    localStorage.removeItem("selectedColumns");
                }}
                size={{ base: "full", md: "lg" }}
            >
                <DrawerOverlay />
                <DrawerContent bg={cardBg}
                    css={{
                        minWidth:
                            fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                                fileType === "application/vnd.ms-excel"
                                ? "93vw"
                                : "60vw",
                    }}
                    borderLeft="1px" borderColor={borderColor}>
                    <DrawerHeader
                        bgGradient="linear(to-r, teal.500, teal.600)"
                        color="white"
                        py={4}
                        px={6}
                        borderBottomWidth="1px"
                        borderColor={borderColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Text fontSize="lg" fontWeight="bold">
                            File Preview ({previewContent?.length || 0} sheets)
                        </Text>
                        {selectedColumns[selectedSheet]?.length > 0 && (
                            <Text fontSize="sm" opacity={0.8}>
                                {selectedColumns[selectedSheet].length} column{selectedColumns[selectedSheet].length > 1 ? "s" : ""} selected
                            </Text>
                        )}
                    </DrawerHeader>
                    <DrawerBody p={6} overflowY="auto">
                        {isLoading ? (
                            <VStack spacing={4} py={10} align="center">
                                <Spinner size="xl" color={accentColor} thickness="4px" />
                                <Progress
                                    value={loadingProgress}
                                    size="sm"
                                    colorScheme="teal"
                                    width="300px"
                                    borderRadius="md"
                                />
                                <Text color={textColor}>Loading file... {Math.round(loadingProgress)}%</Text>
                            </VStack>
                        ) : previewContent ? (
                            fileType?.startsWith("image") ? (
                                <Image
                                    src={previewContent[0].data[0][0]}
                                    alt="Preview"
                                    maxH="80vh"
                                    mx="auto"
                                    objectFit="contain"
                                    borderRadius="lg"
                                    boxShadow="lg"
                                    onError={() =>
                                        setError(
                                            "Failed to load image preview. Ensure the Base64 string is valid."
                                        )
                                    }
                                />
                            ) : fileType === "application/pdf" ? (
                                <iframe
                                    src={previewContent[0].data[0][0]}
                                    title="PDF Preview"
                                    width="100%"
                                    height="80vh"
                                    style={{ border: "none", borderRadius: "lg", boxShadow: "lg" }}
                                    onError={() =>
                                        setError(
                                            "Failed to load PDF preview. Ensure the Base64 string is valid."
                                        )
                                    }
                                />
                            ) : fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                                fileType === "application/vnd.ms-excel" ? (
                                <VStack spacing={6} align="stretch">
                                    <Card p={4} borderRadius="lg" boxShadow="md" bg={cardBg}>
                                        <FormControl mb={4}>
                                            <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                                                Select Sheet
                                            </FormLabel>
                                            <Select
                                                value={selectedSheet}
                                                onChange={(e) => {
                                                    setSelectedSheet(e.target.value);
                                                    setSearchQuery("");
                                                    if (gridApiRef.current) {
                                                        gridApiRef.current.setQuickFilter("");
                                                    }
                                                }}
                                                bg={cardBg}
                                                borderColor={borderColor}
                                                borderRadius="md"
                                                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                                                _hover={{ borderColor: "teal.400" }}
                                                transition="all 0.2s"
                                                aria-label="Select sheet"
                                            >
                                                {previewContent.map((sheet) => (
                                                    <option key={sheet.sheetName} value={sheet.sheetName}>
                                                        {sheet.sheetName} ({sheet.rowData.length} rows)
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                                                Select Columns to Export
                                            </FormLabel>
                                            <ReactSelect
                                                isMulti
                                                isSearchable
                                                options={columnOptions}
                                                value={columnOptions.filter((opt) =>
                                                    selectedColumns[selectedSheet]?.includes(opt.value)
                                                )}
                                                onChange={(selected: MultiValue<SelectOption>) => {
                                                    const uniqueValues = [...new Set(selected.map((opt) => opt.value))];
                                                    setSelectedColumns((prev) => ({
                                                        ...prev,
                                                        [selectedSheet]: uniqueValues,
                                                    }));
                                                    setSelectAllColumns(
                                                        uniqueValues.length === columnOptions.length
                                                    );
                                                }}
                                                placeholder="Search and select columns..."
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: cardBg,
                                                        borderColor: borderColor,
                                                        borderRadius: "8px",
                                                        padding: "4px",
                                                        boxShadow: useColorModeValue(
                                                            "0 1px 3px rgba(0,0,0,0.1)",
                                                            "none"
                                                        ),
                                                        transition: "all 0.2s",
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: cardBg,
                                                        borderRadius: "8px",
                                                        border: `1px solid ${borderColor}`,
                                                        zIndex: 10000,
                                                    }),
                                                    menuPortal: (provided) => ({
                                                        ...provided,
                                                        zIndex: 10000,
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isSelected
                                                            ? accentColor
                                                            : state.isFocused
                                                                ? useColorModeValue("#E6FFFA", "#2D3748")
                                                                : undefined,
                                                        color: state.isSelected
                                                            ? "white"
                                                            : useColorModeValue("gray.800", "white"),
                                                        padding: "8px 12px",
                                                        transition: "all 0.2s",
                                                    }),
                                                    input: (provided) => ({
                                                        ...provided,
                                                        color: textColor,
                                                    }),
                                                }}
                                                aria-label="Select columns to export"
                                            />
                                        </FormControl>
                                        <HStack spacing={4} mt={4}>
                                            <FormControl maxW="150px">
                                                <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                                                    Start Row
                                                </FormLabel>
                                                <NumberInput
                                                    value={startRow}
                                                    min={1}
                                                    onChange={(value) => setStartRow(value)}
                                                    bg={cardBg}
                                                    borderColor={borderColor}
                                                    borderRadius="md"
                                                    _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                                                    _hover={{ borderColor: "teal.400" }}
                                                    transition="all 0.2s"
                                                >
                                                    <NumberInputField
                                                        _focus={{ borderColor: accentColor }}
                                                        _hover={{ borderColor: "teal.400" }}
                                                        aria-label="Start row"
                                                    />
                                                </NumberInput>
                                                <FormHelperText color={textColor} fontSize="xs">
                                                    Row number ≥ 1
                                                </FormHelperText>
                                            </FormControl>
                                            <FormControl maxW="150px">
                                                <FormLabel fontWeight="semibold" color={textColor} fontSize="sm">
                                                    End Row
                                                </FormLabel>
                                                <NumberInput
                                                    value={endRow}
                                                    min={parseInt(startRow, 10) || 1}
                                                    onChange={(value) => setEndRow(value)}
                                                    bg={cardBg}
                                                    borderColor={borderColor}
                                                    borderRadius="md"
                                                    _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` }}
                                                    _hover={{ borderColor: "teal.400" }}
                                                    transition="all 0.2s"
                                                >
                                                    <NumberInputField
                                                        _focus={{ borderColor: accentColor }}
                                                        _hover={{ borderColor: "teal.400" }}
                                                        aria-label="End row"
                                                    />
                                                </NumberInput>
                                                <FormHelperText color={textColor} fontSize="xs">
                                                    Blank for last row
                                                </FormHelperText>
                                            </FormControl>
                                        </HStack>
                                    </Card>

                                    <Divider my={4} />

                                    <HStack spacing={4} align="center">
                                        <Checkbox
                                            isChecked={selectAllColumns}
                                            onChange={(e) => setSelectAllColumns(e.target.checked)}
                                            colorScheme="teal"
                                            size="md"
                                            aria-label="Select all columns"
                                        >
                                            Select All Columns
                                        </Checkbox>
                                        <Tooltip label="Reset column selections" hasArrow>
                                            <Button
                                                size="sm"
                                                colorScheme="orange"
                                                leftIcon={<RepeatIcon />}
                                                onClick={handleResetColumns}
                                                isDisabled={!selectedColumns[selectedSheet]?.length}
                                                bgGradient="linear(to-r, orange.400, orange.600)"
                                                _hover={{ bgGradient: "linear(to-r, orange.500, orange.700)" }}
                                                borderRadius="full"
                                                transition="all 0.2s"
                                                aria-label="Reset column selections"
                                            >
                                                Reset Columns
                                            </Button>
                                        </Tooltip>
                                    </HStack>

                                    <Card p={4} borderRadius="lg" boxShadow="md" bg={cardBg}>
                                        <HStack spacing={4} flexWrap="wrap" justify="space-between">
                                            <HStack spacing={2}>
                                                <Tooltip label={`Download JSON for ${selectedSheet}`} hasArrow>
                                                    <Button
                                                        colorScheme="teal"
                                                        onClick={() => handleDownloadJson(selectedSheet)}
                                                        isDisabled={!selectedColumns[selectedSheet]?.length}
                                                        bgGradient="linear(to-r, teal.500, teal.600)"
                                                        _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                                                        size="sm"
                                                        borderRadius="full"
                                                        transition="all 0.2s"
                                                        aria-label={`Download JSON for ${selectedSheet}`}
                                                    >
                                                        JSON
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label={`Download Excel for ${selectedSheet}`} hasArrow>
                                                    <Button
                                                        colorScheme="teal"
                                                        onClick={() => handleDownloadExcel(selectedSheet)}
                                                        isDisabled={!selectedColumns[selectedSheet]?.length}
                                                        bgGradient="linear(to-r, teal.500, teal.600)"
                                                        _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                                                        size="sm"
                                                        borderRadius="full"
                                                        transition="all 0.2s"
                                                        aria-label={`Download Excel for ${selectedSheet}`}
                                                    >
                                                        Excel
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label="Download all sheets as zip" hasArrow>
                                                    <Button
                                                        colorScheme="teal"
                                                        variant="outline"
                                                        onClick={handleDownloadAllJsons}
                                                        isDisabled={
                                                            !previewContent ||
                                                            !Object.values(selectedColumns).some((cols) => cols.length > 0)
                                                        }
                                                        size="sm"
                                                        borderColor={accentColor}
                                                        _hover={{ bg: "teal.50" }}
                                                        borderRadius="full"
                                                        transition="all 0.2s"
                                                        aria-label="Download all sheets as zip"
                                                    >
                                                        All as Zip
                                                    </Button>
                                                </Tooltip>
                                            </HStack>
                                            {base64 && (
                                                <Tooltip label="Download the original file" hasArrow>
                                                    <Link
                                                        href={`data:${fileType};base64,${base64.includes(",") ? base64.split(",")[1] : base64}`}
                                                        download={generateFileName(fileType ?? "application/octet-stream")}
                                                        color={accentColor}
                                                        fontWeight="semibold"
                                                        textDecoration="underline"
                                                        _hover={{ color: "teal.600" }}
                                                        isExternal
                                                        aria-label={`Download ${generateFileName(fileType ?? "application/octet-stream")}`}
                                                    >
                                                        Original File
                                                    </Link>
                                                </Tooltip>
                                            )}
                                        </HStack>
                                    </Card>

                                    {previewContent.find(
                                        (sheet) => sheet.sheetName === selectedSheet
                                    )?.rowData.length > 0 ? (
                                        <Card
                                            className="excel-grid-container"
                                            overflow="auto"
                                            borderRadius="lg"
                                            border="1px"
                                            borderColor={borderColor}
                                            boxShadow="md"
                                            bg={cardBg}
                                        >
                                            <Box
                                                className={`ag-theme-alpine${useColorModeValue("", "-dark")}`}
                                                h="60vh"
                                                w="100%"
                                            >
                                                <AgGridReact
                                                    rowData={
                                                        previewContent.find(
                                                            (sheet) => sheet.sheetName === selectedSheet
                                                        )?.rowData || []
                                                    }
                                                    columnDefs={columnDefs}
                                                    domLayout="normal"
                                                    enableCellTextSelection={true}
                                                    suppressRowClickSelection={true}
                                                    pagination={true}
                                                    paginationPageSize={20}
                                                    noRowsOverlayComponent={() => (
                                                        <Text color={textColor}>No data available for this sheet.</Text>
                                                    )}
                                                    headerHeight={40}
                                                    rowHeight={48}
                                                    onGridReady={(params) => {
                                                        gridApiRef.current = params.api;
                                                        console.log("AG Grid rendered with drawer width");
                                                    }}
                                                />
                                            </Box>
                                        </Card>
                                    ) : (
                                        <Text color={textColor} p={4}>
                                            No data available for this sheet.
                                        </Text>
                                    )}
                                </VStack>
                            ) : (
                                <Text color={textColor}>No preview available for this file type.</Text>
                            )
                        ) : (
                            <Text color={textColor}>No preview content available.</Text>
                        )}
                    </DrawerBody>
                    <DrawerFooter borderTop="1px" borderColor={borderColor} p={4}>
                        <Button
                            colorScheme="red"
                            onClick={() => {
                                onClose();
                                setShowPreview(false);
                                setSelectedColumns({});
                                setSelectAllColumns(false);
                                setSearchQuery("");
                                setStartRow("1");
                                setEndRow("");
                                if (gridApiRef.current) {
                                    gridApiRef.current.setQuickFilter("");
                                }
                                localStorage.removeItem("selectedColumns");
                            }}
                            bgGradient="linear(to-r, red.400, red.600)"
                            _hover={{ bgGradient: "linear(to-r, red.500, red.700)" }}
                            borderRadius="full"
                            transition="all 0.2s"
                            aria-label="Close preview"
                        >
                            Close
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

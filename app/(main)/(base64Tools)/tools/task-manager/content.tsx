"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Badge,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerBody,
  DrawerCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import AttachmentUpload from "../../../../component/attachments/AttachmentUpload";
import AttachmentsList from "../../../../component/attachments/AttachmentsList";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaSearch,
  FaCalendarAlt,
  FaLock,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaFilter,
  FaPlay,
  FaArrowLeft,
  FaCheck,
  FaUndo,
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaFolder,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import axios from "axios";
import { AUTH_TOKEN, BACKEND_URL } from "../../../../config/utils/variables";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Task {
  id: string;
  bucketId?: string | null;
  title: string;
  description: string;
  status: "future" | "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: any[];
}

interface Bucket {
  id: string;
  name: string;
  isDefault: boolean;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getOffsetDateInput = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
};

const getPlainTextFromHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeRichTextHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, "");

interface RichTextDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  borderColor: string;
  textMuted: string;
}

const RichTextDescriptionEditor = ({
  value,
  onChange,
  isDisabled,
  borderColor,
  textMuted,
}: RichTextDescriptionEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !isDisabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "task-description-editor",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!isDisabled);
  }, [editor, isDisabled]);

  const toolbarButtonBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const toolbarActiveBg = useColorModeValue("brand.100", "brand.700");
  const toolbarBg = useColorModeValue("gray.50", "rgba(255, 255, 255, 0.04)");

  if (!editor) return null;

  return (
    <Box
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      opacity={isDisabled ? 0.65 : 1}
    >
      <HStack
        spacing={1}
        p={2}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={toolbarBg}
      >
        <IconButton
          aria-label="Bold"
          icon={<FaBold />}
          size="sm"
          variant="ghost"
          bg={editor.isActive("bold") ? toolbarActiveBg : "transparent"}
          isDisabled={isDisabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          _hover={{ bg: toolbarButtonBg }}
        />
        <IconButton
          aria-label="Italic"
          icon={<FaItalic />}
          size="sm"
          variant="ghost"
          bg={editor.isActive("italic") ? toolbarActiveBg : "transparent"}
          isDisabled={isDisabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          _hover={{ bg: toolbarButtonBg }}
        />
        <IconButton
          aria-label="Bullet list"
          icon={<FaListUl />}
          size="sm"
          variant="ghost"
          bg={editor.isActive("bulletList") ? toolbarActiveBg : "transparent"}
          isDisabled={isDisabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          _hover={{ bg: toolbarButtonBg }}
        />
        <IconButton
          aria-label="Numbered list"
          icon={<FaListOl />}
          size="sm"
          variant="ghost"
          bg={editor.isActive("orderedList") ? toolbarActiveBg : "transparent"}
          isDisabled={isDisabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          _hover={{ bg: toolbarButtonBg }}
        />
        <Text fontSize="xs" color={textMuted} pl={2}>
          Rich description
        </Text>
      </HStack>
      <Box
        sx={{
          ".task-description-editor": {
            minHeight: "110px",
            padding: "12px",
            outline: "none",
          },
          ".task-description-editor p": {
            margin: "0 0 8px",
          },
          ".task-description-editor ul": {
            listStyleType: "disc",
            listStylePosition: "outside",
            paddingInlineStart: "22px",
            margin: "0 0 8px",
          },
          ".task-description-editor ol": {
            listStyleType: "decimal",
            listStylePosition: "outside",
            paddingInlineStart: "22px",
            margin: "0 0 8px",
          },
          ".task-description-editor li": {
            marginBottom: "4px",
          },
          ".task-description-editor li p": {
            margin: 0,
          },
          ".task-description-editor li::marker": {
            color: "currentColor",
          },
          ".task-description-editor strong": {
            fontWeight: 700,
          },
          ".task-description-editor em": {
            fontStyle: "italic",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

interface TaskDescriptionPreviewProps {
  value: string;
  textMuted: string;
  strongColor: string;
}

const TaskDescriptionPreview = ({
  value,
  textMuted,
  strongColor,
}: TaskDescriptionPreviewProps) => {
  if (!getPlainTextFromHtml(value)) return null;

  return (
    <Box
      fontSize="xs"
      color={textMuted}
      mb={3}
      wordBreak="break-word"
      lineHeight="1.45"
      overflow="hidden"
      sx={{
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: "2",
        "& p": {
          display: "inline",
          margin: 0,
        },
        "& p:not(:last-child)::after": {
          content: '" "',
        },
        "& ul": {
          listStyleType: "disc",
          listStylePosition: "outside",
          paddingInlineStart: "20px",
          margin: "0 0 6px",
        },
        "& ol": {
          listStyleType: "decimal",
          listStylePosition: "outside",
          paddingInlineStart: "20px",
          margin: "0 0 6px",
        },
        "& li": {
          marginBottom: "3px",
        },
        "& li p": {
          margin: 0,
        },
        "& li::marker": {
          color: "currentColor",
        },
        "& strong": {
          color: strongColor,
          fontWeight: 700,
        },
        "& em": {
          fontStyle: "italic",
        },
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(value) }}
    />
  );
};

export default function TaskManagerContent() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(() => getOffsetDateInput(-7));
  const [dateTo, setDateTo] = useState(() => getOffsetDateInput(30));
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Table View & sorting/pagination states
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [tableFilter, setTableFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  // Add/Edit Task Drawer States
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState<"future" | "todo" | "in_progress" | "completed">("todo");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const attachmentsRef = useRef<any>(null);

  // Buckets States
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [activeBucketId, setActiveBucketId] = useState<string>("");
  const [loadingBuckets, setLoadingBuckets] = useState(true);
  const [showBuckets, setShowBuckets] = useState(false);

  // Bucket CRUD Modal/Alert States
  const { isOpen: isBucketModalOpen, onOpen: onBucketModalOpen, onClose: onBucketModalClose } = useDisclosure();
  const { isOpen: isBucketDeleteOpen, onOpen: onBucketDeleteOpen, onClose: onBucketDeleteClose } = useDisclosure();
  const bucketDeleteCancelRef = useRef<HTMLButtonElement>(null);

  const [bucketModalMode, setBucketModalMode] = useState<"create" | "rename">("create");
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [pendingDeleteBucket, setPendingDeleteBucket] = useState<Bucket | null>(null);
  const [bucketNameInput, setBucketNameInput] = useState("");
  const [isBucketSubmitting, setIsBucketSubmitting] = useState(false);
  const [isBucketDeleting, setIsBucketDeleting] = useState(false);

  // Task Drawer Bucket selection
  const [taskBucketId, setTaskBucketId] = useState("");

  const toast = useToast();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  // Premium colors
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const boardBg = useColorModeValue("rgba(255, 255, 255, 0.45)", "rgba(10, 25, 47, 0.4)");
  const cardBg = useColorModeValue("white", "rgba(23, 42, 69, 0.85)");
  const cardHoverBg = useColorModeValue("gray.50", "rgba(30, 57, 95, 0.95)");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");
  const taskTitleColor = useColorModeValue("gray.800", "white");

  // Get Auth Token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      const tokenKey = AUTH_TOKEN || "auth_token";
      return localStorage.getItem(tokenKey);
    }
    return null;
  };

  const getApiUrl = (path: string) => `${BACKEND_URL || ""}${path}`;

  const formatDisplayDate = (value: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fetch buckets from API
  const fetchBuckets = useCallback(async (selectDefault = false) => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setLoadingBuckets(false);
      return;
    }

    try {
      setLoadingBuckets(true);
      const url = getApiUrl("/buckets");
      const response = await axios.get(url, {
        params: {
          dateField: "dueDate",
          dateFrom,
          dateTo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      setBuckets(data);

      if (data.length > 0) {
        setActiveBucketId((prev) => {
          if (prev && !selectDefault && data.some((b: Bucket) => b.id === prev)) {
            return prev;
          }
          const defaultBucket = data.find((b: Bucket) => b.isDefault);
          return defaultBucket ? defaultBucket.id : data[0].id;
        });
      }
    } catch (error: any) {
      console.error("Error fetching buckets:", error);
      toast({
        title: "Error fetching buckets",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingBuckets(false);
    }
  }, [dateFrom, dateTo, toast]);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateField: "dueDate",
        dateFrom,
        dateTo,
      });
      if (viewMode === "board" && activeBucketId) {
        params.append("bucketId", activeBucketId);
      }
      const url = getApiUrl(`/tasks?${params.toString()}`);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
      } else {
        toast({
          title: "Error fetching tasks",
          description: error.response?.data?.message || "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, activeBucketId, viewMode, toast]);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  useEffect(() => {
    if (viewMode === "board") {
      if (activeBucketId) {
        fetchTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    } else {
      fetchTasks();
    }
  }, [activeBucketId, viewMode, fetchTasks]);

  // Create Task
  const handleCreateTask = async () => {
    const token = getAuthToken();
    if (!token) return;

    if (!taskTitle.trim()) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!getPlainTextFromHtml(taskDesc)) {
      toast({
        title: "Description is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!taskDueDate) {
      toast({
        title: "Due date is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Prevent selecting past dates
    const _today = new Date();
    _today.setHours(0, 0, 0, 0);
    const _selected = new Date(taskDueDate);
    if (_selected.getTime() < _today.getTime()) {
      toast({
        title: "Due date cannot be in the past",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsTaskSubmitting(true);
      const url = getApiUrl("/tasks");
      // Determine status based on due date: if due date is strictly after today (UTC), mark as 'future'
      const todayUtc = new Date();
      todayUtc.setUTCHours(0, 0, 0, 0);
      const selectedDate = new Date(taskDueDate);
      selectedDate.setUTCHours(0, 0, 0, 0);
      const statusToSave = selectedDate.getTime() > todayUtc.getTime() ? "future" : (taskStatus === "future" ? "todo" : taskStatus);

      const response = await axios.post(
        url,
        {
          title: taskTitle,
          description: taskDesc,
          status: statusToSave,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          bucketId: taskBucketId || activeBucketId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdTask = response.data.data;

      // If there are attachments pending, upload them now
      if (attachmentsRef.current && createdTask && createdTask.id) {
        // uploadAll will handle its own errors
        // eslint-disable-next-line no-await-in-loop
        await attachmentsRef.current.uploadAll(createdTask.id);
      }

      await fetchTasks();
      await fetchBuckets();
      toast({
        title: "Task created successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  // Update Task (Edit or drag drop)
  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const url = getApiUrl(`/tasks/${taskId}`);
      const response = await axios.put(url, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data.data : task))
      );
      fetchBuckets();
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  // Submit Edit Drawer
  const handleSubmitEdit = async () => {
    if (!editingTask) return;
    if (!taskTitle.trim()) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!getPlainTextFromHtml(taskDesc)) {
      toast({
        title: "Description is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!taskDueDate) {
      toast({
        title: "Due date is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsTaskSubmitting(true);
      // Determine status based on due date for edits too
      const todayUtcEdit = new Date();
      todayUtcEdit.setUTCHours(0, 0, 0, 0);
      const selectedEdit = new Date(taskDueDate);
      selectedEdit.setUTCHours(0, 0, 0, 0);
      const statusToSaveEdit = selectedEdit.getTime() > todayUtcEdit.getTime() ? "future" : (taskStatus === "future" ? "todo" : taskStatus);

      const isUpdated = await handleUpdateTask(editingTask.id, {
        title: taskTitle,
        description: taskDesc,
        status: statusToSaveEdit,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        bucketId: taskBucketId || activeBucketId || null,
      });

      if (!isUpdated) return;

      // If attachments pending, upload them for this task
      if (attachmentsRef.current) {
        // eslint-disable-next-line no-await-in-loop
        await attachmentsRef.current.uploadAll(editingTask.id);
      }

      toast({
        title: "Task updated successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      await fetchTasks();
      await fetchBuckets();
      resetForm();
      onClose();
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      setDeletingTaskId(taskId);
      const url = getApiUrl(`/tasks/${taskId}`);
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      fetchBuckets();
      toast({
        title: "Task deleted successfully",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setDeletingTaskId(null);
    }
  };

  const openDeleteConfirm = (task: Task) => {
    setPendingDeleteTask(task);
    onDeleteOpen();
  };

  const closeDeleteConfirm = () => {
    if (deletingTaskId) return;
    setPendingDeleteTask(null);
    onDeleteClose();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteTask) return;

    const isDeleted = await handleDeleteTask(pendingDeleteTask.id);
    if (isDeleted) {
      setPendingDeleteTask(null);
      onDeleteClose();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (hoveredColumn !== columnId) {
      setHoveredColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: "future" | "todo" | "in_progress" | "completed") => {
    e.preventDefault();
    setHoveredColumn(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;

    if (!taskId) return;

    // Find the task and verify if it actually changed status
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== status) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      // Call API
      await handleUpdateTask(taskId, { status });
    }

    setDraggedTaskId(null);
  };

  // Bucket CRUD Handlers
  const handleBucketSubmit = async () => {
    const token = getAuthToken();
    if (!token) return;

    if (!bucketNameInput.trim()) {
      toast({
        title: "Bucket name is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsBucketSubmitting(true);
      if (bucketModalMode === "create") {
        const url = getApiUrl("/buckets");
        const response = await axios.post(
          url,
          { name: bucketNameInput.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast({
          title: "Bucket created successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        const newBucket = response.data.data;
        await fetchBuckets();
        setActiveBucketId(newBucket.id);
      } else {
        if (!editingBucket) return;
        const url = getApiUrl(`/buckets/${editingBucket.id}`);
        await axios.put(
          url,
          { name: bucketNameInput.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast({
          title: "Bucket renamed successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        await fetchBuckets();
      }
      onBucketModalClose();
      setBucketNameInput("");
      setEditingBucket(null);
    } catch (error: any) {
      toast({
        title: `Failed to ${bucketModalMode} bucket`,
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsBucketSubmitting(false);
    }
  };

  const handleConfirmDeleteBucket = async () => {
    if (!pendingDeleteBucket) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      setIsBucketDeleting(true);
      const url = getApiUrl(`/buckets/${pendingDeleteBucket.id}`);
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Bucket deleted successfully",
        description: "All tasks inside have been removed.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      if (activeBucketId === pendingDeleteBucket.id) {
        const defaultBucket = buckets.find((b) => b.isDefault);
        setActiveBucketId(defaultBucket ? defaultBucket.id : "");
      }

      await fetchBuckets(true);
      onBucketDeleteClose();
      setPendingDeleteBucket(null);
    } catch (error: any) {
      toast({
        title: "Failed to delete bucket",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsBucketDeleting(false);
    }
  };

  const openCreateBucketModal = () => {
    setBucketModalMode("create");
    setBucketNameInput("");
    setEditingBucket(null);
    onBucketModalOpen();
  };

  const openRenameBucketModal = (bucket: Bucket) => {
    setBucketModalMode("rename");
    setBucketNameInput(bucket.name);
    setEditingBucket(bucket);
    onBucketModalOpen();
  };

  const openDeleteBucketAlert = (bucket: Bucket) => {
    setPendingDeleteBucket(bucket);
    onBucketDeleteOpen();
  };

  // Open Edit Drawer
  const openEditDrawer = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setTaskBucketId(task.bucketId || "");
    onOpen();
  };

  const openViewDrawer = (task: Task) => {
    setViewingTask(task);
    onViewOpen();
  };

  // Reset form inputs
  const resetForm = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setTaskStatus("todo");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskBucketId(activeBucketId || "");
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const descriptionText = getPlainTextFromHtml(task.description);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        descriptionText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Filter and sort tasks for Table View
  const filteredAndSortedTableTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const descriptionText = getPlainTextFromHtml(task.description);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        descriptionText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });

    if (tableFilter !== "all") {
      if (tableFilter.startsWith("status:")) {
        const statusValue = tableFilter.substring(7);
        result = result.filter((task) => task.status === statusValue);
      } else if (tableFilter.startsWith("bucket:")) {
        const bucketIdValue = tableFilter.substring(7);
        result = result.filter((task) => task.bucketId === bucketIdValue);
      }
    }

    result.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortField === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortField === "priority") {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        valA = priorityWeight[a.priority] || 0;
        valB = priorityWeight[b.priority] || 0;
      } else if (sortField === "status") {
        const statusWeight = { future: 1, todo: 2, in_progress: 3, completed: 4 };
        valA = statusWeight[a.status] || 0;
        valB = statusWeight[b.status] || 0;
      } else if (sortField === "bucketId") {
        const bucketA = buckets.find((bk) => bk.id === a.bucketId)?.name || "";
        const bucketB = buckets.find((bk) => bk.id === b.bucketId)?.name || "";
        valA = bucketA.toLowerCase();
        valB = bucketB.toLowerCase();
      } else if (sortField === "dueDate") {
        valA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      } else if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, searchQuery, priorityFilter, tableFilter, sortField, sortOrder, buckets]);

  // Pagination for Table View
  const tasksPerPage = 10;
  const totalTasks = filteredAndSortedTableTasks.length;
  const totalPages = Math.ceil(totalTasks / tasksPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredAndSortedTableTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredAndSortedTableTasks, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Grouped Tasks for columns
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === "todo"), [filteredTasks]);
  const futureTasks = useMemo(() => filteredTasks.filter((t) => t.status === "future"), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === "in_progress"), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t) => t.status === "completed"), [filteredTasks]);

  // Columns Configuration
  const columns = [
    {
      id: "future" as const,
      title: "Future Tasks",
      icon: FaFolder,
      colorScheme: "indigo",
      tasksList: futureTasks,
      headerBg: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      glowColor: "rgba(59, 130, 246, 0.35)",
    },
    {
      id: "todo" as const,
      title: "To Do",
      icon: FaClipboardList,
      colorScheme: "purple",
      tasksList: todoTasks,
      headerBg: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
      glowColor: "rgba(127, 0, 255, 0.4)",
    },
    {
      id: "in_progress" as const,
      title: "Running",
      icon: FaClock,
      colorScheme: "orange",
      tasksList: inProgressTasks,
      headerBg: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
      glowColor: "rgba(255, 75, 43, 0.4)",
    },
    {
      id: "completed" as const,
      title: "Finished",
      icon: FaCheckCircle,
      colorScheme: "teal",
      tasksList: completedTasks,
      headerBg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      glowColor: "rgba(56, 239, 125, 0.4)",
    },
  ];

  if (!isAuthenticated) {
    return (
      <Flex minH="80vh" align="center" justify="center" p={4} bg={pageBg}>
        <Box
          p={8}
          maxW="md"
          w="full"
          borderRadius="2xl"
          bg={useColorModeValue("white", "rgba(23, 42, 69, 0.8)")}
          boxShadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          textAlign="center"
          backdropFilter="blur(15px)"
        >
          <Box
            display="inline-flex"
            p={4}
            borderRadius="full"
            bg="brand.500"
            color="white"
            mb={4}
            boxShadow="0 0 20px var(--chakra-colors-brand-500)"
          >
            <FaLock size="32px" />
          </Box>
          <Heading size="lg" mb={3} color={useColorModeValue("gray.800", "white")}>
            Access Denied
          </Heading>
          <Text color={textMuted} mb={6}>
            Please log in or register to manage and save your personal tasks on the Task board.
          </Text>
          <VStack spacing={3}>
            <Link href="/login" style={{ width: "100%" }}>
              <Button
                colorScheme="brand"
                bg="brand.500"
                w="full"
                size="lg"
                _hover={{
                  bg: "brand.600",
                  boxShadow: "0 0 15px var(--chakra-colors-brand-500)",
                }}
              >
                Log In
              </Button>
            </Link>
            <Link href="/register" style={{ width: "100%" }}>
              <Button w="full" variant="outline" size="lg" colorScheme="brand">
                Create Account
              </Button>
            </Link>
          </VStack>
        </Box>
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} minH="85vh" bg={pageBg}>
      {/* Upper Info / Header Area */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        gap={4}
        mb={8}
      >
        <Box>
          <HStack spacing={4} mb={1} align="center" flexWrap="wrap">
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              letterSpacing="tight"
            >
              Task Board
            </Heading>
            <HStack
              bg={useColorModeValue("gray.100", "gray.800")}
              p={1}
              borderRadius="full"
              spacing={0}
              border="1px solid"
              borderColor={borderColor}
            >
              <Button
                size="xs"
                borderRadius="full"
                variant={viewMode === "board" ? "solid" : "ghost"}
                colorScheme={viewMode === "board" ? "brand" : "gray"}
                onClick={() => {
                  setViewMode("board");
                  setCurrentPage(1);
                }}
              >
                Board View
              </Button>
              <Button
                size="xs"
                borderRadius="full"
                variant={viewMode === "table" ? "solid" : "ghost"}
                colorScheme={viewMode === "table" ? "brand" : "gray"}
                onClick={() => {
                  setViewMode("table");
                  setCurrentPage(1);
                }}
              >
                Table View
              </Button>
            </HStack>
          </HStack>
          <Text color={textMuted} fontSize="sm">
            Drag and drop tasks, prioritize them, and keep your workspace clean.
          </Text>
        </Box>

        {/* Filters and Actions */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={3}
          align={{ base: "stretch", sm: "center" }}
        >
          {/* Search */}
          <Box position="relative">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              bg={useColorModeValue("white", "rgba(255, 255, 255, 0.05)")}
              border="1px solid"
              borderColor={borderColor}
              pl={10}
              borderRadius="full"
              _focus={{
                borderColor: "brand.400",
                boxShadow: "0 0 8px var(--chakra-colors-brand-400)",
              }}
            />
            <Box
              position="absolute"
              left="4"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            >
              <FaSearch />
            </Box>
          </Box>

          {/* Priority filter */}
          <HStack spacing={2} minW="150px">
            <Box color="gray.400">
              <FaFilter />
            </Box>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              bg={useColorModeValue("white", "rgba(255, 255, 255, 0.05)")}
              borderColor={borderColor}
              borderRadius="full"
              fontSize="sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </Select>
          </HStack>

          {/* Status/Bucket filter (Table View only) */}
          {viewMode === "table" && (
            <HStack spacing={2} minW="180px">
              <Box color="gray.400">
                <FaFilter />
              </Box>
              <Select
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setCurrentPage(1);
                }}
                bg={useColorModeValue("white", "rgba(255, 255, 255, 0.05)")}
                borderColor={borderColor}
                borderRadius="full"
                fontSize="sm"
              >
                <option value="all">All Statuses & Buckets</option>
                <optgroup label="Statuses">
                  <option value="status:future">Future Tasks</option>
                  <option value="status:todo">To Do</option>
                  <option value="status:in_progress">Running</option>
                  <option value="status:completed">Finished</option>
                </optgroup>
                <optgroup label="Buckets">
                  {buckets.map((b) => (
                    <option key={b.id} value={`bucket:${b.id}`}>
                      {b.name}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </HStack>
          )}

          {/* Date filter */}
          <HStack spacing={2}>
            <Box color="gray.400">
              <FaCalendarAlt />
            </Box>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              bg={useColorModeValue("white", "rgba(255, 255, 255, 0.05)")}
              borderColor={borderColor}
              borderRadius="full"
              fontSize="sm"
              maxW={{ base: "full", sm: "150px" }}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              bg={useColorModeValue("white", "rgba(255, 255, 255, 0.05)")}
              borderColor={borderColor}
              borderRadius="full"
              fontSize="sm"
              maxW={{ base: "full", sm: "150px" }}
            />
          </HStack>

          {/* Add Task Button */}
          <Button
            leftIcon={<FaPlus />}
            colorScheme="brand"
            bg="brand.500"
            color="white"
            borderRadius="full"
            px={6}
            _hover={{
              bg: "brand.600",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 15px var(--chakra-colors-brand-500)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            onClick={() => {
              resetForm();
              setTaskStatus("todo");
              onOpen();
            }}
          >
            New Task
          </Button>
        </Flex>
      </Flex>

      {/* Task board layout */}
      {viewMode === "board" ? (
        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
          {/* Buckets Sidebar */}
          {showBuckets && (
            <Box
              w={{ base: "full", lg: "260px" }}
              flexShrink={0}
              bg={boardBg}
              borderRadius="2xl"
              p={4}
              border="1px solid"
              borderColor={borderColor}
              backdropFilter="blur(10px)"
              alignSelf="flex-start"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color={textMuted}>
                  Buckets
                </Heading>
                <IconButton
                  size="xs"
                  colorScheme="brand"
                  bg="brand.500"
                  color="white"
                  icon={<FaPlus />}
                  aria-label="Add Bucket"
                  _hover={{ bg: "brand.600" }}
                  onClick={openCreateBucketModal}
                />
              </Flex>

              <VStack spacing={2} align="stretch">
                {loadingBuckets ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" color="brand.400" />
                  </Flex>
                ) : buckets.length === 0 ? (
                  <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
                    No buckets found.
                  </Text>
                ) : (
                  buckets.map((bucket) => {
                    const isActive = bucket.id === activeBucketId;
                    return (
                      <Flex
                        key={bucket.id}
                        align="center"
                        justify="space-between"
                        p={3}
                        borderRadius="xl"
                        bg={isActive ? "brand.500" : "transparent"}
                        color={isActive ? "white" : taskTitleColor}
                        cursor="pointer"
                        onClick={() => setActiveBucketId(bucket.id)}
                        transition="all 0.2s"
                        _hover={{
                          bg: isActive ? "brand.600" : cardHoverBg,
                        }}
                        role="group"
                      >
                        <HStack spacing={2.5} flex={1} minW={0}>
                          {bucket.isDefault ? <FaLock size="12px" /> : <FaFolder size="14px" />}
                          <Text fontSize="sm" fontWeight={isActive ? "bold" : "medium"} isTruncated flex={1}>
                            {bucket.name}
                          </Text>
                          <Badge
                            colorScheme={isActive ? "blackAlpha" : "brand"}
                            variant={isActive ? "solid" : "subtle"}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                          >
                            {bucket.taskCount || 0}
                          </Badge>
                        </HStack>

                        {!bucket.isDefault && (
                          <HStack spacing={1} display="none" _groupHover={{ display: "flex" }} ml={2}>
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color={isActive ? "white" : "brand.400"}
                              icon={<FaEdit size="10px" />}
                              aria-label="Rename bucket"
                              _hover={{ bg: isActive ? "brand.700" : "whiteAlpha.200" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameBucketModal(bucket);
                              }}
                            />
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color={isActive ? "white" : "red.400"}
                              icon={<FaTrash size="10px" />}
                              aria-label="Delete bucket"
                              _hover={{ bg: isActive ? "brand.700" : "whiteAlpha.200" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteBucketAlert(bucket);
                              }}
                            />
                          </HStack>
                        )}
                      </Flex>
                    );
                  })
                )}
              </VStack>
            </Box>
          )}

          {/* Task Board Area */}
          <Box flex={1} minW={0}>
            {loading ? (
              <Flex minH="400px" justify="center" align="center">
                <VStack spacing={4}>
                  <Spinner size="xl" color="brand.400" thickness="4px" />
                  <Text color={textMuted} fontSize="sm">
                    Loading tasks...
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                gap={6}
                alignItems="start"
              >
                {columns.map((col) => {
                  const isHovered = hoveredColumn === col.id;
                  return (
                    <Box
                      key={col.id}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      p={4}
                      bg={boardBg}
                      borderRadius="2xl"
                      border="2px dashed"
                      borderColor={isHovered ? `${col.colorScheme}.400` : "transparent"}
                      boxShadow={isHovered ? `0 0 20px ${col.glowColor}` : "none"}
                      transition="all 0.25s ease"
                      minH="600px"
                      backdropFilter="blur(10px)"
                    >
                      {/* Column Header */}
                      <Flex
                        p={3}
                        borderRadius="xl"
                        bgGradient={col.headerBg}
                        color="white"
                        align="center"
                        justify="space-between"
                        boxShadow={`0 4px 14px ${col.glowColor}`}
                        mb={5}
                      >
                        <HStack spacing={2}>
                          <Box as={col.icon} />
                          <Text fontWeight="bold" fontSize="md">
                            {col.title}
                          </Text>
                        </HStack>
                        <Badge colorScheme="blackAlpha" variant="solid" borderRadius="full" px={2.5}>
                          {col.tasksList.length}
                        </Badge>
                      </Flex>

                      {/* Task Cards Stack */}
                      <VStack spacing={4} align="stretch" w="full">
                        {col.tasksList.length === 0 ? (
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            py={10}
                            px={4}
                            borderRadius="xl"
                            bg="whiteAlpha.50"
                            border="1px dashed"
                            borderColor={borderColor}
                          >
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                              No tasks. Drag tasks here.
                            </Text>
                          </Flex>
                        ) : (
                          col.tasksList.map((task) => {
                            const priorityColor =
                              task.priority === "high"
                                ? "red"
                                : task.priority === "medium"
                                  ? "orange"
                                  : "brand";

                            const isDueDatePassed =
                              task.dueDate &&
                              new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
                            const isDeletingTask = deletingTaskId === task.id;
                            return (
                              <Box
                                key={task.id}
                                draggable={!isDeletingTask}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                p={4}
                                borderRadius="xl"
                                bg={cardBg}
                                border="1px solid"
                                borderColor={borderColor}
                                boxShadow="0 4px 10px rgba(0, 0, 0, 0.15)"
                                cursor="grab"
                                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                _hover={{
                                  transform: "translateY(-4px)",
                                  boxShadow: `0 8px 20px ${col.glowColor}`,
                                  bg: cardHoverBg,
                                  borderColor: `${col.colorScheme}.400`,
                                }}
                                _active={{
                                  cursor: "grabbing",
                                }}
                                position="relative"
                              >
                                <Flex justify="space-between" align="start" mb={2}>
                                  <Badge colorScheme={priorityColor} variant="subtle" borderRadius="md" px={2}>
                                    {task.priority}
                                  </Badge>
                                  <HStack spacing={1}>
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      color="brand.400"
                                      aria-label="View task"
                                      icon={<FaEye />}
                                      onClick={() => openViewDrawer(task)}
                                      isDisabled={isDeletingTask || isTaskSubmitting}
                                      _hover={{ bg: "whiteAlpha.200" }}
                                    />
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      color="brand.400"
                                      aria-label="Edit task"
                                      icon={<FaEdit />}
                                      onClick={() => openEditDrawer(task)}
                                      isDisabled={isDeletingTask || isTaskSubmitting}
                                      _hover={{ bg: "whiteAlpha.200" }}
                                    />
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      color="red.400"
                                      aria-label="Delete task"
                                      icon={<FaTrash />}
                                      onClick={() => openDeleteConfirm(task)}
                                      isLoading={isDeletingTask}
                                      isDisabled={Boolean(deletingTaskId) || isTaskSubmitting}
                                      _hover={{ bg: "whiteAlpha.200" }}
                                    />
                                  </HStack>
                                </Flex>

                                <Heading size="sm" mb={2} color={taskTitleColor}>
                                  {task.title}
                                </Heading>

                                <TaskDescriptionPreview
                                  value={task.description}
                                  textMuted={textMuted}
                                  strongColor={taskTitleColor}
                                />

                                {task.dueDate && (
                                  <HStack spacing={1.5} fontSize="2xs" color={isDueDatePassed ? "red.400" : "brand.300"}>
                                    <FaCalendarAlt />
                                    <Text fontWeight={isDueDatePassed ? "bold" : "normal"}>
                                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                      {isDueDatePassed && " (Overdue)"}
                                    </Text>
                                  </HStack>
                                )}

                                <HStack spacing={1.5} fontSize="2xs" color={textMuted} mt={task.dueDate ? 1 : 0}>
                                  <FaCalendarAlt />
                                  <Text>Created {formatDisplayDate(task.createdAt)}</Text>
                                </HStack>

                                {/* Mobile Transition Actions: Fixes Drag & Drop limitations on mobile/responsive devices */}
                                <Flex
                                  display={{ base: "flex", md: "none" }}
                                  mt={3}
                                  pt={3}
                                  borderTop="1px solid"
                                  borderColor={borderColor}
                                  justify="space-between"
                                  gap={2}
                                >
                                  {task.status === "todo" && (
                                    <Button
                                      size="xs"
                                      leftIcon={<FaPlay />}
                                      colorScheme="orange"
                                      variant="solid"
                                      onClick={() => handleUpdateTask(task.id, { status: "in_progress" })}
                                      w="full"
                                      borderRadius="lg"
                                    >
                                      Start
                                    </Button>
                                  )}

                                  {task.status === "in_progress" && (
                                    <>
                                      <Button
                                        size="xs"
                                        leftIcon={<FaArrowLeft />}
                                        colorScheme="purple"
                                        variant="outline"
                                        onClick={() => handleUpdateTask(task.id, { status: "todo" })}
                                        w="full"
                                        borderRadius="lg"
                                      >
                                        Back
                                      </Button>
                                      <Button
                                        size="xs"
                                        leftIcon={<FaCheck />}
                                        colorScheme="teal"
                                        variant="solid"
                                        onClick={() => handleUpdateTask(task.id, { status: "completed" })}
                                        w="full"
                                        borderRadius="lg"
                                      >
                                        Finish
                                      </Button>
                                    </>
                                  )}

                                  {task.status === "completed" && (
                                    <Button
                                      size="xs"
                                      leftIcon={<FaUndo />}
                                      colorScheme="orange"
                                      variant="outline"
                                      onClick={() => handleUpdateTask(task.id, { status: "in_progress" })}
                                      w="full"
                                      borderRadius="lg"
                                    >
                                      Reopen
                                    </Button>
                                  )}
                                </Flex>
                              </Box>
                            );
                          })
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Flex>
      ) : (
        /* Table View Layout */
        <Box
          w="full"
          bg={boardBg}
          borderRadius="2xl"
          p={{ base: 4, md: 6 }}
          border="1px solid"
          borderColor={borderColor}
          backdropFilter="blur(10px)"
          boxShadow="xl"
        >
          {loading ? (
            <Flex minH="400px" justify="center" align="center">
              <VStack spacing={4}>
                <Spinner size="xl" color="brand.400" thickness="4px" />
                <Text color={textMuted} fontSize="sm">
                  Loading tasks...
                </Text>
              </VStack>
            </Flex>
          ) : paginatedTasks.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={20}
              px={4}
              borderRadius="xl"
              bg="whiteAlpha.50"
              border="1px dashed"
              borderColor={borderColor}
            >
              <Text fontSize="md" color="gray.500" fontWeight="medium" textAlign="center">
                No tasks found. Try adjusting your filters.
              </Text>
            </Flex>
          ) : (
            <>
              <TableContainer overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("title")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Task Name {sortField === "title" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                        w="30%"
                      >
                        Description
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("priority")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Priority {sortField === "priority" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("status")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Status {sortField === "status" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("bucketId")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Bucket {sortField === "bucketId" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("dueDate")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Due Date {sortField === "dueDate" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort("createdAt")}
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                      >
                        Created Date {sortField === "createdAt" && (sortOrder === "asc" ? <FaChevronUp style={{ display: "inline", marginLeft: "4px" }} /> : <FaChevronDown style={{ display: "inline", marginLeft: "4px" }} />)}
                      </Th>
                      <Th
                        color={taskTitleColor}
                        textTransform="none"
                        fontSize="sm"
                        fontWeight="bold"
                        py={4}
                        textAlign="right"
                      >
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedTasks.map((task) => {
                      const priorityColor =
                        task.priority === "high"
                          ? "red"
                          : task.priority === "medium"
                            ? "orange"
                            : "brand";

                      const statusConfig = {
                        future: {
                          title: "Future Tasks",
                          bg: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                          glowColor: "rgba(59, 130, 246, 0.35)",
                        },
                        todo: {
                          title: "To Do",
                          bg: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
                          glowColor: "rgba(127, 0, 255, 0.4)",
                        },
                        in_progress: {
                          title: "Running",
                          bg: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                          glowColor: "rgba(255, 75, 43, 0.4)",
                        },
                        completed: {
                          title: "Finished",
                          bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                          glowColor: "rgba(56, 239, 125, 0.4)",
                        },
                      };

                      const statusInfo = statusConfig[task.status] || {
                        title: task.status,
                        bg: "gray.500",
                        glowColor: "transparent",
                      };

                      const isDueDatePassed =
                        task.dueDate &&
                        new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                      const bucketName = buckets.find((b) => b.id === task.bucketId)?.name || "No bucket";
                      const isDeletingTask = deletingTaskId === task.id;

                      return (
                        <Tr
                          key={task.id}
                          transition="all 0.2s"
                          _hover={{ bg: cardHoverBg }}
                        >
                          <Td py={4} fontWeight="semibold" color={taskTitleColor}>
                            {task.title}
                          </Td>
                          <Td py={4} maxW="300px">
                            <TaskDescriptionPreview
                              value={task.description}
                              textMuted={textMuted}
                              strongColor={taskTitleColor}
                            />
                          </Td>
                          <Td py={4}>
                            <Badge colorScheme={priorityColor} variant="subtle" borderRadius="md" px={2} py={0.5}>
                              {task.priority}
                            </Badge>
                          </Td>
                          <Td py={4}>
                            <Menu isLazy>
                              <MenuButton
                                as="div"
                                cursor="pointer"
                                role="button"
                                display="inline-block"
                                transition="all 0.15s ease-in-out"
                                _hover={{ opacity: 0.85, transform: "scale(1.02)" }}
                              >
                                <Badge
                                  bgImage={statusInfo.bg}
                                  color="white"
                                  borderRadius="full"
                                  px={3}
                                  py={0.5}
                                  fontSize="xs"
                                  boxShadow={`0 2px 6px ${statusInfo.glowColor}`}
                                >
                                  {statusInfo.title}
                                </Badge>
                              </MenuButton>
                              <MenuList zIndex={10}>
                                {Object.entries(statusConfig).map(([statusKey, info]) => (
                                  <MenuItem
                                    key={statusKey}
                                    onClick={() => handleUpdateTask(task.id, { status: statusKey as Task["status"] })}
                                  >
                                    <Badge
                                      bgImage={info.bg}
                                      color="white"
                                      borderRadius="full"
                                      px={3}
                                      py={0.5}
                                      fontSize="xs"
                                      boxShadow={`0 2px 6px ${info.glowColor}`}
                                    >
                                      {info.title}
                                    </Badge>
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </Td>
                          <Td py={4} color={taskTitleColor} fontSize="sm">
                            <HStack spacing={1}>
                              <FaFolder size="12px" color="gray.450" />
                              <Text>{bucketName}</Text>
                            </HStack>
                          </Td>
                          <Td py={4}>
                            {task.dueDate ? (
                              <Text
                                fontSize="xs"
                                fontWeight={isDueDatePassed ? "bold" : "normal"}
                                color={isDueDatePassed ? "red.400" : "brand.300"}
                              >
                                {formatDisplayDate(task.dueDate)}
                                {isDueDatePassed && " (Overdue)"}
                              </Text>
                            ) : (
                              <Text fontSize="xs" color="gray.500">
                                -
                              </Text>
                            )}
                          </Td>
                          <Td py={4} color={textMuted} fontSize="xs">
                            {formatDisplayDate(task.createdAt)}
                          </Td>
                          <Td py={4} textAlign="right">
                            <HStack spacing={1} justify="flex-end">
                              <IconButton
                                size="sm"
                                variant="ghost"
                                color="brand.400"
                                aria-label="View task"
                                icon={<FaEye />}
                                onClick={() => openViewDrawer(task)}
                                isDisabled={isDeletingTask || isTaskSubmitting}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                              <IconButton
                                size="sm"
                                variant="ghost"
                                color="brand.400"
                                aria-label="Edit task"
                                icon={<FaEdit />}
                                onClick={() => openEditDrawer(task)}
                                isDisabled={isDeletingTask || isTaskSubmitting}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                              <IconButton
                                size="sm"
                                variant="ghost"
                                color="red.400"
                                aria-label="Delete task"
                                icon={<FaTrash />}
                                onClick={() => openDeleteConfirm(task)}
                                isLoading={isDeletingTask}
                                isDisabled={Boolean(deletingTaskId) || isTaskSubmitting}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Flex
                justify="space-between"
                align="center"
                mt={6}
                flexDirection={{ base: "column", sm: "row" }}
                gap={4}
              >
                <Text fontSize="sm" color={textMuted}>
                  Showing {totalTasks === 0 ? 0 : (currentPage - 1) * tasksPerPage + 1} to{" "}
                  {Math.min(currentPage * tasksPerPage, totalTasks)} of {totalTasks} tasks
                </Text>
                <HStack spacing={2} overflowX="auto" maxW="full" py={1}>
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "solid" : "outline"}
                      colorScheme={currentPage === page ? "brand" : "gray"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      )}

      {/* View Task Drawer */}
      <Drawer
        isOpen={isViewOpen}
        onClose={onViewClose}
        placement="right"
        size={{ base: "full", md: "lg" }}
      >
        <DrawerOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <DrawerContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.95)")}
          color={useColorModeValue("gray.800", "white")}
          borderLeftRadius={{ base: "none", md: "xl" }}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 24px 80px rgba(0, 0, 0, 0.35)"
          overflow="hidden"
        >
          <DrawerHeader
            px={{ base: 5, md: 6 }}
            py={5}
            bg={useColorModeValue("gray.50", "rgba(255, 255, 255, 0.04)")}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} align="start" pr={8}>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="42px"
                borderRadius="lg"
                bg="brand.500"
                color="white"
                boxShadow="0 10px 24px rgba(49, 130, 206, 0.35)"
                flexShrink={0}
              >
                <FaEye size="18px" />
              </Box>
              <Box minW={0}>
                <Text fontSize="lg" fontWeight="bold" lineHeight="1.2" noOfLines={2}>
                  {viewingTask?.title || "View Task"}
                </Text>
                <Text mt={1} fontSize="sm" fontWeight="normal" color={textMuted}>
                  Complete task details
                </Text>
              </Box>
            </HStack>
          </DrawerHeader>
          <DrawerCloseButton />

          <DrawerBody px={{ base: 5, md: 6 }} py={6} overflowY="auto">
            {viewingTask && (
              <VStack spacing={5} align="stretch">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                    Title
                  </Text>
                  <Heading size="md" color={taskTitleColor}>
                    {viewingTask.title}
                  </Heading>
                </Box>

                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Priority
                    </Text>
                    <Badge
                      colorScheme={
                        viewingTask.priority === "high"
                          ? "red"
                          : viewingTask.priority === "medium"
                            ? "orange"
                            : "brand"
                      }
                      borderRadius="md"
                      px={2}
                    >
                      {viewingTask.priority}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Status
                    </Text>
                    <Badge colorScheme="brand" borderRadius="md" px={2}>
                      {columns.find((column) => column.id === viewingTask.status)?.title || viewingTask.status}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Bucket
                    </Text>
                    <Text fontSize="sm">
                      {buckets.find((bucket) => bucket.id === viewingTask.bucketId)?.name || "No bucket"}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Due Date
                    </Text>
                    <Text fontSize="sm">
                      {viewingTask.dueDate ? formatDisplayDate(viewingTask.dueDate) : "No due date"}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Created
                    </Text>
                    <Text fontSize="sm">{formatDisplayDate(viewingTask.createdAt)}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                      Updated
                    </Text>
                    <Text fontSize="sm">{formatDisplayDate(viewingTask.updatedAt)}</Text>
                  </Box>
                </Grid>

                <Box>
                  <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                    Attachments
                  </Text>
                  <AttachmentsList taskId={viewingTask.id} />
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" mb={2}>
                    Description
                  </Text>
                  {getPlainTextFromHtml(viewingTask.description) ? (
                    <Box
                      fontSize="sm"
                      color={textMuted}
                      lineHeight="1.7"
                      wordBreak="break-word"
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={borderColor}
                      bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                      sx={{
                        "& p": {
                          margin: "0 0 10px",
                        },
                        "& p:last-child": {
                          marginBottom: 0,
                        },
                        "& ul": {
                          listStyleType: "disc",
                          listStylePosition: "outside",
                          paddingInlineStart: "22px",
                          margin: "0 0 10px",
                        },
                        "& ol": {
                          listStyleType: "decimal",
                          listStylePosition: "outside",
                          paddingInlineStart: "22px",
                          margin: "0 0 10px",
                        },
                        "& li": {
                          marginBottom: "4px",
                        },
                        "& li p": {
                          margin: 0,
                        },
                        "& strong": {
                          color: taskTitleColor,
                          fontWeight: 700,
                        },
                        "& em": {
                          fontStyle: "italic",
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(viewingTask.description) }}
                    />
                  ) : (
                    <Text fontSize="sm" color={textMuted}>
                      No description.
                    </Text>
                  )}
                </Box>
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter
            px={{ base: 5, md: 6 }}
            py={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={useColorModeValue("gray.50", "rgba(255, 255, 255, 0.03)")}
            gap={3}
          >
            <Button variant="ghost" onClick={onViewClose}>
              Close
            </Button>
            {viewingTask && (
              <Button
                leftIcon={<FaEdit />}
                colorScheme="brand"
                bg="brand.500"
                color="white"
                onClick={() => {
                  onViewClose();
                  openEditDrawer(viewingTask);
                }}
              >
                Edit Task
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Task Drawer (Add/Edit) */}
      <Drawer
        isOpen={isOpen}
        onClose={isTaskSubmitting ? () => undefined : onClose}
        placement="right"
        size={{ base: "full", md: "lg" }}
        closeOnOverlayClick={!isTaskSubmitting}
      >
        <DrawerOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <DrawerContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.95)")}
          color={useColorModeValue("gray.800", "white")}
          borderLeftRadius={{ base: "none", md: "xl" }}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 24px 80px rgba(0, 0, 0, 0.35)"
          overflow="hidden"
        >
          <DrawerHeader
            px={{ base: 5, md: 6 }}
            py={5}
            bg={useColorModeValue("gray.50", "rgba(255, 255, 255, 0.04)")}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} align="start" pr={8}>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="42px"
                borderRadius="lg"
                bg="brand.500"
                color="white"
                boxShadow="0 10px 24px rgba(49, 130, 206, 0.35)"
                flexShrink={0}
              >
                <FaClipboardList size="18px" />
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold" lineHeight="1.2">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </Text>
                <Text mt={1} fontSize="sm" fontWeight="normal" color={textMuted}>
                  {editingTask ? "Update task details and board status." : "Create a task with priority, status, and due date."}
                </Text>
              </Box>
            </HStack>
          </DrawerHeader>
          <DrawerCloseButton isDisabled={isTaskSubmitting} />

          <DrawerBody px={{ base: 5, md: 6 }} py={6} overflowY="auto">
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                  Title
                </FormLabel>
                <Input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  isDisabled={isTaskSubmitting}
                  size="lg"
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.400", boxShadow: "0 0 8px var(--chakra-colors-brand-400)" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                  Bucket
                </FormLabel>
                <Select
                  value={taskBucketId}
                  onChange={(e) => setTaskBucketId(e.target.value)}
                  isDisabled={isTaskSubmitting}
                  size="lg"
                  borderRadius="lg"
                  borderColor={borderColor}
                >
                  {buckets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                  Description
                </FormLabel>
                <RichTextDescriptionEditor
                  value={taskDesc}
                  onChange={setTaskDesc}
                  isDisabled={isTaskSubmitting}
                  borderColor={borderColor}
                  textMuted={textMuted}
                />
              </FormControl>

              {/* Attachments */}
              <Box w="full">
                <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                  Attachments
                </FormLabel>
                <AttachmentUpload ref={attachmentsRef} taskId={editingTask ? editingTask.id : undefined} />
              </Box>

              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                    Priority
                  </FormLabel>
                  <Select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    isDisabled={isTaskSubmitting}
                    borderRadius="lg"
                    borderColor={borderColor}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                    Column Status
                  </FormLabel>
                  <Select
                    value={taskStatus}
                    onChange={(e: any) => setTaskStatus(e.target.value)}
                    isDisabled={isTaskSubmitting}
                    borderRadius="lg"
                    borderColor={borderColor}
                  >
                    <option value="future">Future Tasks</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">Running</option>
                    <option value="completed">Finished</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                  Due Date
                </FormLabel>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  isDisabled={isTaskSubmitting}
                  borderRadius="lg"
                  borderColor={borderColor}
                  min={formatDateInput(new Date())}
                  _focus={{ borderColor: "brand.400" }}
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter
            px={{ base: 5, md: 6 }}
            py={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={useColorModeValue("gray.50", "rgba(255, 255, 255, 0.03)")}
            gap={3}
            flexDirection={{ base: "column-reverse", sm: "row" }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isTaskSubmitting}
              w={{ base: "full", sm: "auto" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                boxShadow: "0 0 15px var(--chakra-colors-brand-500)",
              }}
              onClick={editingTask ? handleSubmitEdit : handleCreateTask}
              isLoading={isTaskSubmitting}
              loadingText={editingTask ? "Saving..." : "Creating..."}
              w={{ base: "full", sm: "auto" }}
              minW="140px"
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Task Alert */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={closeDeleteConfirm}
        isCentered
        closeOnOverlayClick={!deletingTaskId}
      >
        <AlertDialogOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <AlertDialogContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.98)")}
          color={useColorModeValue("gray.800", "white")}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 24px 80px rgba(0, 0, 0, 0.35)"
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Task
          </AlertDialogHeader>

          <AlertDialogBody color={textMuted}>
            Are you sure you want to delete
            {pendingDeleteTask?.title ? ` "${pendingDeleteTask.title}"` : " this task"}? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button
              ref={deleteCancelRef}
              onClick={closeDeleteConfirm}
              isDisabled={Boolean(deletingTaskId)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDelete}
              isLoading={Boolean(deletingTaskId)}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Rename Bucket Modal */}
      <Modal isOpen={isBucketModalOpen} onClose={onBucketModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.98)")}
          color={useColorModeValue("gray.800", "white")}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 24px 80px rgba(0, 0, 0, 0.35)"
        >
          <ModalHeader fontSize="lg" fontWeight="bold">
            {bucketModalMode === "create" ? "Create New Bucket" : "Rename Bucket"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color={textMuted}>
                Bucket Name
              </FormLabel>
              <Input
                placeholder="e.g. Work, Personal, Shopping"
                value={bucketNameInput}
                onChange={(e) => setBucketNameInput(e.target.value)}
                isDisabled={isBucketSubmitting}
                borderRadius="lg"
                borderColor={borderColor}
                _focus={{ borderColor: "brand.400" }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              onClick={onBucketModalClose}
              isDisabled={isBucketSubmitting}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                boxShadow: "0 0 15px var(--chakra-colors-brand-500)",
              }}
              onClick={handleBucketSubmit}
              isLoading={isBucketSubmitting}
            >
              {bucketModalMode === "create" ? "Create" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Bucket Alert */}
      <AlertDialog
        isOpen={isBucketDeleteOpen}
        leastDestructiveRef={bucketDeleteCancelRef}
        onClose={onBucketDeleteClose}
        isCentered
        closeOnOverlayClick={!isBucketDeleting}
      >
        <AlertDialogOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <AlertDialogContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.98)")}
          color={useColorModeValue("gray.800", "white")}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 24px 80px rgba(0, 0, 0, 0.35)"
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Bucket
          </AlertDialogHeader>

          <AlertDialogBody color={textMuted}>
            Are you sure you want to delete the bucket
            {pendingDeleteBucket?.name ? ` "${pendingDeleteBucket.name}"` : ""}?
            <Text mt={2} color="red.400" fontWeight="bold">
              Warning: All tasks within this bucket will be deleted permanently. This action cannot be undone.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button
              ref={bucketDeleteCancelRef}
              onClick={onBucketDeleteClose}
              isDisabled={isBucketDeleting}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDeleteBucket}
              isLoading={isBucketDeleting}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Buckets Toggle Button */}
      {viewMode === "board" && (
        <Button
          position="fixed"
          bottom="8"
          left="50%"
          transform="translateX(-50%)"
          zIndex={200}
          leftIcon={<FaFolder />}
          colorScheme="brand"
          bg={showBuckets ? "brand.600" : "brand.500"}
          color="white"
          borderRadius="full"
          px={6}
          py={6}
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.2)"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={useColorModeValue("brand.400", "brand.300")}
          onClick={() => setShowBuckets((prev) => !prev)}
          _hover={{
            bg: showBuckets ? "brand.700" : "brand.600",
            transform: "translateX(-50%) scale(1.05)",
            boxShadow: "0 10px 30px var(--chakra-colors-brand-500)",
          }}
          _active={{
            transform: "translateX(-50%) scale(0.98)",
          }}
          transition="all 0.2s ease-in-out"
        >
          {showBuckets ? "Buckets" : "Buckets"}
        </Button>
      )}
    </Box>
  );
}

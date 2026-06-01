"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
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
} from "react-icons/fa";
import axios from "axios";
import { BACKEND_URL } from "../../../../config/utils/variables";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export default function TaskManagerContent() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  // Add/Edit Task Modal States
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState<"todo" | "in_progress" | "completed">("todo");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskDueDate, setTaskDueDate] = useState("");

  const toast = useToast();

  // Premium colors
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const boardBg = useColorModeValue("rgba(255, 255, 255, 0.45)", "rgba(10, 25, 47, 0.4)");
  const cardBg = useColorModeValue("white", "rgba(23, 42, 69, 0.85)");
  const cardHoverBg = useColorModeValue("gray.50", "rgba(30, 57, 95, 0.95)");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");

  // Get Auth Token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

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
      const url = `${BACKEND_URL || "http://localhost:5000"}/tasks`;
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
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

    try {
      const url = `${BACKEND_URL || "http://localhost:5000"}/tasks`;
      const response = await axios.post(
        url,
        {
          title: taskTitle,
          description: taskDesc,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) => [response.data.data, ...prev]);
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
    }
  };

  // Update Task (Edit or drag drop)
  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const url = `${BACKEND_URL || "http://localhost:5000"}/tasks/${taskId}`;
      const response = await axios.put(url, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data.data : task))
      );
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Submit Edit Modal
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

    await handleUpdateTask(editingTask.id, {
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
      dueDate: taskDueDate || null,
    });

    toast({
      title: "Task updated successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    resetForm();
    onClose();
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const url = `${BACKEND_URL || "http://localhost:5000"}/tasks/${taskId}`;
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted successfully",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

  const handleDrop = async (e: React.DragEvent, status: "todo" | "in_progress" | "completed") => {
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

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    onOpen();
  };

  // Reset form inputs
  const resetForm = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setTaskStatus("todo");
    setTaskPriority("medium");
    setTaskDueDate("");
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Grouped Tasks for columns
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === "todo"), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === "in_progress"), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t) => t.status === "completed"), [filteredTasks]);

  // Columns Configuration
  const columns = [
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
          <HStack spacing={3} mb={1}>
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              letterSpacing="tight"
            >
              Task Board
            </Heading>
            {/* <Badge colorScheme="brand" borderRadius="full" px={2} py={0.5} fontSize="xs">
              Trello Mode
            </Badge> */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(e) => setPriorityFilter(e.target.value)}
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
      {loading ? (
        <Flex minH="400px" justify="center" align="center">
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.400" thickness="4px" />
            <Text color={textMuted} fontSize="sm">
              Loading board data...
            </Text>
          </VStack>
        </Flex>
      ) : (
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
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
                          : "blue";

                      const isDueDatePassed =
                        task.dueDate &&
                        new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                      return (
                        <Box
                          key={task.id}
                          draggable
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
                                aria-label="Edit task"
                                icon={<FaEdit />}
                                onClick={() => openEditModal(task)}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                              <IconButton
                                size="xs"
                                variant="ghost"
                                color="red.400"
                                aria-label="Delete task"
                                icon={<FaTrash />}
                                onClick={() => handleDeleteTask(task.id)}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                            </HStack>
                          </Flex>

                          <Heading size="sm" mb={2} color={useColorModeValue("gray.800", "white")}>
                            {task.title}
                          </Heading>

                          {task.description && (
                            <Text fontSize="xs" color={textMuted} noOfLines={3} mb={3}>
                              {task.description}
                            </Text>
                          )}

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

      {/* Task Modal (Add/Edit) */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent
          bg={useColorModeValue("white", "rgba(10, 25, 47, 0.95)")}
          color={useColorModeValue("gray.800", "white")}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="2xl"
        >
          <ModalHeader>
            <HStack>
              <Box color="brand.300">
                <FaClipboardList />
              </Box>
              <Text>{editingTask ? "Edit Task" : "Add New Task"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Title</FormLabel>
                <Input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.400", boxShadow: "0 0 8px var(--chakra-colors-brand-400)" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">Description</FormLabel>
                <Textarea
                  placeholder="Enter task details..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.400", boxShadow: "0 0 8px var(--chakra-colors-brand-400)" }}
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Priority</FormLabel>
                  <Select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    borderColor={borderColor}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Column Status</FormLabel>
                  <Select
                    value={taskStatus}
                    onChange={(e: any) => setTaskStatus(e.target.value)}
                    borderColor={borderColor}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">Running</option>
                    <option value="completed">Finished</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">Due Date</FormLabel>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.400" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onClose}>
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
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

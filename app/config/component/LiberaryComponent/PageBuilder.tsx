import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import {
  Box,
  Button,
  Textarea,
  VStack,
  Heading,
  Text,
  Image,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import JSON5 from "json5";

// Component Library
const ComponentLibrary = {
  text: ({ content, styles }: any) => <Text {...styles}>{content}</Text>,
  heading: ({ content, styles }: any) => <Heading {...styles}>{content}</Heading>,
  button: ({ content, styles }: any) => <Button {...styles}>{content}</Button>,
  image: ({ content, styles }: any) => (
    <Image
      src={content}
      {...styles}
      objectFit="cover"
      borderRadius="md"
      maxWidth={{ base: "100%", md: "80%" }}
      maxHeight={{ base: "200px", md: "400px" }}
      mx="auto"
    />
  ),
};

// Component Config Type
interface ComponentConfig {
  id: string;
  type: "text" | "heading" | "button" | "image";
  content: string;
  styles: any;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Main PageBuilder Component
const PageBuilderWithGridAndJsonEditor: React.FC = () => {
  const [components, setComponents] = useState<ComponentConfig[]>([
    { id: "1", type: "text", content: "Hello World!", styles: { fontSize: "md" }, x: 0, y: 0, w: 2, h: 2 },
    { id: "2", type: "heading", content: "My Heading", styles: { fontSize: "lg" }, x: 2, y: 0, w: 2, h: 2 },
  ]);
  const [jsonInput, setJsonInput] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);

  const cols = useBreakpointValue({ base: 1, md: 12 });
  const rowHeight = useBreakpointValue({ base: 150, md: 30 });
  const gridWidth = useBreakpointValue({ base: 300, md: 1200 });

  const addComponent = (type: "text" | "heading" | "button" | "image") => {
    const newComponent: ComponentConfig = {
      id: `${Date.now()}`,
      type,
      content: type === "button" ? "Click Me" : type === "heading" ? "New Heading" : type === "image" ? "https://via.placeholder.com/150" : "Sample Text",
      styles: { fontSize: "md" },
      x: 0,
      y: Infinity,
      w: 2,
      h: 2,
    };
    setComponents([...components, newComponent]);
  };

  const onLayoutChange = (layout: any) => {
    setComponents((prev) =>
      prev.map((comp, idx) => ({
        ...comp,
        x: layout[idx].x,
        y: layout[idx].y,
        w: layout[idx].w,
        h: layout[idx].h,
      }))
    );
  };

  const handleJsonSubmit = () => {
    try {
      const newComponents = JSON5.parse(jsonInput);
      setComponents(
        newComponents.map((comp: any, index: number) => ({
          ...comp,
          id: `${Date.now() + index}`,
          x: index % 2,
          y: Math.floor(index / 2) * 2,
          w: comp.w || 2,
          h: comp.h || 2,
        }))
      );
    } catch (error) {
      console.error("Invalid JSON input", error);
    }
  };

  const handleComponentClick = (comp: ComponentConfig) => {
    setSelectedComponent(comp);
  };

  const updateComponent = (id: string, newContent: string, newStyles: any) => {
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, content: newContent, styles: { ...comp.styles, ...newStyles } } : comp
      )
    );
  };

  const togglePreview = () => setIsPreview(!isPreview);

  const [isPreview, setIsPreview] = useState(false);

  return (
    <Box>
      <ComponentLibraryPanel onAddComponent={addComponent} />
      <VStack spacing={4} p={4} bg="gray.100" borderRadius="md" mb={4}>
        <Textarea
          placeholder="Enter JSON configuration for components"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <Button onClick={handleJsonSubmit}>Load Components from JSON</Button>
      </VStack>
      <Button onClick={togglePreview} mb={4}>
        {isPreview ? "Exit Preview Mode" : "Preview"}
      </Button>
      <GridLayout
        className="layout"
        layout={components.map(({ id, x, y, w, h }) => ({ i: id, x, y, w, h }))}
        cols={cols || 12}
        rowHeight={rowHeight || 30}
        width={gridWidth || 1200}
        onLayoutChange={onLayoutChange}
      >
        {components.map((comp) => {
          const Component = ComponentLibrary[comp.type];
          return (
            <Box
              key={comp.id}
              data-grid={{ i: comp.id, x: comp.x, y: comp.y, w: comp.w, h: comp.h }}
              p={2}
              borderWidth="1px"
              borderRadius="lg"
              onClick={() => handleComponentClick(comp)}
            >
              <Component content={comp.content} styles={comp.styles} />
            </Box>
          );
        })}
      </GridLayout>

      {selectedComponent && (
        <ComponentEditor
          component={selectedComponent}
          onUpdate={updateComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </Box>
  );
};

// Component Library Panel
const ComponentLibraryPanel: React.FC<{ onAddComponent: (type: "text" | "heading" | "button" | "image") => void }> = ({ onAddComponent }) => (
  <VStack spacing={4} p={4} bg="gray.100" borderRadius="md" mb={4}>
    <Button onClick={() => onAddComponent("text")}>Add Text</Button>
    <Button onClick={() => onAddComponent("heading")}>Add Heading</Button>
    <Button onClick={() => onAddComponent("button")}>Add Button</Button>
    <Button onClick={() => onAddComponent("image")}>Add Image</Button>
  </VStack>
);

// Component Editor Panel
const ComponentEditor: React.FC<{ component: ComponentConfig, onUpdate: (id: string, newContent: string, newStyles: any) => void, onClose: () => void }> = ({ component, onUpdate, onClose }) => {
  const [newContent, setNewContent] = useState(component.content);
  const [newFontSize, setNewFontSize] = useState(component.styles.fontSize || "md");

  const handleSave = () => {
    onUpdate(component.id, newContent, { fontSize: newFontSize });
    onClose();
  };

  return (
    <Box p={4} bg="white" borderRadius="md" borderWidth="1px" mb={4}>
      <VStack spacing={4}>
        <Input
          placeholder="Edit Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <Input
          placeholder="Edit Font Size"
          value={newFontSize}
          onChange={(e) => setNewFontSize(e.target.value)}
        />
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={onClose}>Close</Button>
      </VStack>
    </Box>
  );
};

export default PageBuilderWithGridAndJsonEditor;

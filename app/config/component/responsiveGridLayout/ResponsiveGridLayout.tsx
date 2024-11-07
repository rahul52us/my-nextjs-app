// DraggableGridLayout.tsx
import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface SectionConfig {
  id: string;
  component: React.FC<any>;
  props: any;
}

interface DraggableGridLayoutProps {
  sections: SectionConfig[];
}

const DraggableGridLayout: React.FC<DraggableGridLayoutProps> = ({ sections }) => {
  // Layout configuration for full-width and full-height rows
  const layout = sections.map((section, index) => ({
    i: section.id,
    x: 0, // Start at the first column
    y: index * 1, // Ensure each section is placed below the previous one
    w: 12, // Full width for each section (12 columns)
    h: 1,  // Each section takes one grid unit
  }));

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }} // Only set layout for large screens; can add others if needed
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} // 12 columns for large screens
      rowHeight={100} // Set row height in pixels for full-height rows
      width={1200} // Width of the layout in pixels
    >
      {sections.map(({ id, component: Component, props }) => (
        <div key={id} data-grid={layout.find((item) => item.i === id)} style={{ height: "100%" }}>
          <Component {...props} style={{ height: "100%", width: "100%" }} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default DraggableGridLayout;

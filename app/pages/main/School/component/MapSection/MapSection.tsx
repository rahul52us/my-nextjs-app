import { useState, lazy, Suspense, useMemo } from "react";
import MapForm from "./component/MapForm";
import { Center } from "@chakra-ui/react";
import Loader from "../../../../../config/component/Loader/Loader";

const loadComponent = (key: string) => {
  switch (key) {
    case "map1":
      return lazy(() => import("./component/Map1/Map1"));
    case "map2":
      return lazy(() => import("./component/Map2/Map2"));
    default:
      return lazy(() => import("./component/Map1/Map1"));
  }
};

const MapSection = ({
  webColor,
  content,
  setContent,
  isEditable,
  selectedLayout,
}: any) => {
  const [openModal, setOpenModal] = useState(false);
  const Component = useMemo(
    () => loadComponent(selectedLayout?.key),
    [selectedLayout?.key]
  );

  return (
    <>
      <Suspense
        fallback={
          <Center>
            <Loader height="60vh" />
          </Center>
        }
      >
        <Component
          webColor={webColor}
          content={content}
          setContent={setContent}
          isEditable={isEditable}
          onOpen={() => setOpenModal(true)}
        />
      </Suspense>
      {isEditable && (
        <MapForm
          open={openModal}
          webColor={webColor}
          content={content}
          setContent={setContent}
          isEditable={isEditable}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
};

export default MapSection;

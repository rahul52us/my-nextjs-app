import { Suspense, lazy, useState, useMemo } from "react";
import AboutForm from "./component/AboutForm/AboutForm";
import { Center } from "@chakra-ui/react";
import Loader from "../../../../../config/component/Loader/Loader";

const loadComponent = (key : any) => {
  switch (key) {
    case "about1":
      return lazy(() => import("./component/About1/About1"));
    case "about2":
      return lazy(() => import("./component/About2/About2"));
    default:
      return lazy(() => import("./component/About1/About1"));
  }
};

const AboutSection = ({
  content,
  setContent,
  webColor,
  selectedLayout,
  isEditable = false,
} : any) => {
  const [openModal, setOpenModal] = useState(false);

  const Component = useMemo(() => loadComponent(selectedLayout?.key), [selectedLayout?.key]);

  return (
    <>
      <Suspense fallback={<Center><Loader height="60vh"/> </Center>}>
        <Component
          isOpen={openModal}
          onOpen={() => setOpenModal(true)}
          onClose={() => setOpenModal(false)}
          content={content}
          setContent={setContent}
          webColor={webColor}
          isEditable={isEditable}
        />
      </Suspense>
      {openModal && (
        <AboutForm
          content={content}
          setContent={setContent}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
};

export default AboutSection;

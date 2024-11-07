import Curriculum1 from "./component/Curriculum1";

const CurriculumSection = ({
  content = {},
  setContent,
  webColor,
  isEditable,
  titleColor,
  borderColor,
  textColor,
}: any) => {
  return (
    <Curriculum1
      content={content}
      setContent={setContent}
      webColor={webColor}
      isEditable={isEditable}
      titleColor={titleColor}
      borderColor={borderColor}
      textColor={textColor}
    />
  );
};

export default CurriculumSection;

import Testimonial1 from "./component/Testimonial1";

const TestimonialSection = ({
  content = {},
  setContent,
  isEditable,
  webColor,
}: any) => {
  return (
    <Testimonial1
      content={content}
      setContent={setContent}
      isEditable={isEditable}
      webColor={webColor}
    />
  );
};

export default TestimonialSection;

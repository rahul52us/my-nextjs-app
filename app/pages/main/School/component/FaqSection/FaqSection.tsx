import Faq1 from "./component/Faq1"

const FaqSection = ({ setContent, content, webColor, isEditable }: any) => {
  return (
    <Faq1 content={content} setContent={setContent} webColor={webColor} isEditable={isEditable}/>
  )
}

export default FaqSection
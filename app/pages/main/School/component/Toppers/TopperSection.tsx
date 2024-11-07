import { observer } from "mobx-react-lite";
import Topper1 from "./component/Toppers1";
import { useSectionColorContext } from "../../School";

const TopperSection = observer(({ webColor }: any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  return <Topper1 webColor={colors} />;
});

export default TopperSection;

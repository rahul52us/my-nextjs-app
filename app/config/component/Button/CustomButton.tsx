import { Button } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const CustomButton = observer(({ onClick, btnText, rest }: any) => {
  return (
    <Button
      rounded="full"
      width="120px"
      height="40px"
      bgColor="#007bff"
      color="#fff"
      px={6}
      colorScheme={"orange"}
      bg={"orange.400"}
      _hover={{ bg: "orange.500" }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      {...rest}
    >
      {btnText ? btnText : "Click Me"}
    </Button>
  );
});

export default CustomButton;

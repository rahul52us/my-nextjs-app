import { Box, Button, Divider, Flex } from "@chakra-ui/react";

interface CustomBtnI {
  loading: boolean;
  onClick?: any;
  buttonText?: string;
  cancelFunctionality?: any;
  rest?: any;
  type?: string;
}

const SubmitFormBtn = ({
  loading,
  onClick,
  buttonText,
  cancelFunctionality,
  type,
  rest,
}: CustomBtnI) => {
  return (
    <Box width="100%">
    <Divider />
    <Flex gap={4} justifyContent="end" mt={3}>
      {cancelFunctionality && cancelFunctionality.show && (
        <Button
          onClick={() => {
            if (cancelFunctionality.onClick) {
              cancelFunctionality.onClick();
            }
          }}
          {...cancelFunctionality.rest}
          colorScheme="red"
        >
          {cancelFunctionality.text ? cancelFunctionality.text : "Cancel"}
        </Button>
      )}
      <Button
        type={type ? type : "submit"}
        isLoading={loading}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
        colorScheme="blue"
        {...rest}
      >
        {buttonText ? buttonText : "Submit"}
      </Button>
    </Flex>
    </Box>
  );
};

export default SubmitFormBtn;

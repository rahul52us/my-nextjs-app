import { Box, Divider, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import * as Yup from "yup";
import CustomInput from "../../CustomInput/CustomInput";
import SubmitFormBtn from "../../Button/SubmitFormBtn";

const validationSchema = Yup.object().shape({
  user: Yup.mixed()
    .required("Please select a user from the list"),
  isActive: Yup.boolean(),
});

const AddNewUserForm = observer(
  ({ initialValues, showError, setShowError, close, handleSubmit, sendMailActive = true }: any) => {
    return (
      <Box p={4}>
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            handleSubmit({ values, setSubmitting, resetForm });
            setShowError(false);
          }}
        >
          {({ values, errors, isSubmitting, setFieldValue }: any) => {
            return (
              <Form>
                <Flex gap={2} flexDirection={"column"}>
                  <CustomInput
                    type="real-time-user-search"
                    name="user"
                    placeholder="Add New User"
                    label="Add New User"
                    required={true}
                    onChange={(e) => setFieldValue("user", e)}
                    value={values.user}
                    error={errors.user}
                    showError={showError}
                  />
                  {sendMailActive && <CustomInput
                    value={values.isActive}
                    type="checkbox"
                    name="isActive"
                    label="Send Invitation Mail"
                    onChange={(e) =>
                      setFieldValue("isActive", e.target.checked)
                    }
                  />}
                </Flex>
                <Divider />
                <SubmitFormBtn
                  onClick={() => setShowError(true)}
                  loading={isSubmitting}
                  cancelFunctionality={{
                    show: true,
                    text: "Cancel",
                    onClick: () => close(),
                  }}
                />
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  }
);

export default AddNewUserForm;

import { Button } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Grid, Heading } from "@chakra-ui/layout";
import { observer } from "mobx-react-lite";
import { Form, Formik } from "formik";
import { useState } from "react";
import store from "../../../../../../store/store";
import CustomInput from "../../../../../../config/component/CustomInput/CustomInput";
import { ContactValidation } from "../utils/validation";
import { useSectionColorContext } from "../../../School";

const ContactForm = observer(({webColor} : any) => {
  const { colors } = useSectionColorContext() || { colors: webColor || {} };

  const {
    auth: { handleContactMail, openNotification },
  } = store;
  const [showError, setShowError] = useState(false);

  return (
    <Box
      border="1px solid"
      borderColor="gray.300"
      rounded={10}
      p={{ base: 6, md: "8 10" }}
    >
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          description: "",
        }}
        validationSchema={ContactValidation}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          handleContactMail({ ...values })
            .then((data: any) => {
              openNotification({
                title: "mail has been sent",
                message: data.message,
                type: "success",
              });
              resetForm();
            })
            .catch((error: Error) => {
              openNotification({
                title: "Something went wrong",
                message: error.message,
                type: "error",
              });
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({
          handleSubmit,
          handleChange,
          errors,
          values,
          isSubmitting,
          setFieldValue,
        }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <Grid gap={3}>
                <Heading
                  fontSize="3xl"
                  color={useColorModeValue(
                    colors?.headingColor?.light,
                    colors?.headingColor?.dark
                  )}
                >
                  How Can We Assist You?
                </Heading>
                <Grid templateColumns={{ md: "1fr 1fr" }} gap={6}>
                  <CustomInput
                    placeholder="Enter First Name"
                    label="First Name"
                    name="firstName"
                    error={errors.firstName}
                    value={values.firstName}
                    onChange={handleChange}
                    required
                    showError={showError}
                  />
                  <CustomInput
                    placeholder="Enter Last Name"
                    label="Last Name"
                    name="lastName"
                    error={errors.lastName}
                    value={values.lastName}
                    onChange={handleChange}
                    required
                    showError={showError}
                  />
                </Grid>
                <CustomInput
                  placeholder="Enter User Name"
                  label="User Name"
                  name="email"
                  error={errors.email}
                  value={values.email}
                  onChange={handleChange}
                  required
                  showError={showError}
                />
                <CustomInput
                  type="phone"
                  label="Phone Number"
                  name="phone"
                  error={errors.phone}
                  value={values.phone}
                  onChange={(e: any) => {
                    setFieldValue("phone", e);
                  }}
                  showError={showError}
                  required
                />
                <CustomInput
                  type="textarea"
                  label="Description"
                  placeholder="Description"
                  name="description"
                  error={errors.description}
                  value={values.description}
                  onChange={handleChange}
                  showError={showError}
                  required
                />
                <Button
                  type="submit"
                  h={{ base: "45px", md: "56px" }}
                  bg={useColorModeValue(colors?.buttonColor?.light,colors?.buttonColor?.dark)}
                  color={useColorModeValue(colors?.buttonTextColor?.light,colors?.buttonTextColor?.dark)}
                  fontSize={{ md: "2xl" }}
                  transition=".3s ease-in-out"
                  _hover={{
                    transform: "scale(.9)",
                  }}
                  isLoading={isSubmitting}
                  onClick={() => {
                    setShowError(true);
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
});

export default ContactForm;

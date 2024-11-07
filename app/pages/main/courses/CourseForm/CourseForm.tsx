import { observer } from "mobx-react-lite";
import {
  Form,
  Formik,
  FieldArray,
  FormikHelpers,
  FormikProps,
  Field,
  ErrorMessage,
} from "formik";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import * as yup from "yup";
import CustomInput from "../../../../config/component/CustomInput/CustomInput";
import React from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { courseTags, FormValues } from "./utils/constsnt";

// Define the shape of form values

// Define the props for the form component
interface CourseFormProps {
  initialValues: FormValues;
  showError: boolean;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => void;
}

// Validation schema for the form
const courseDetailsSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(26, "Title must be less than 26 characters"),
  short_desc: yup
    .string()
    .required("Short description is required")
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description must be less than 200 characters"),
  language: yup.string().required("Language is required"),
  category: yup.string().required("Category is required"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  prerequisites: yup
    .string()
    .required("Prerequisites are required")
    .min(5, "Prerequisites must be at least 5 characters")
    .max(300, "Prerequisites must be less than 200 characters"),
  tags: yup
    .array()
    .min(1, "At least one tag is required")
    .required("Tags are required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be at least 0"),
  level: yup.string().required("Level is required"),
  duration: yup.object().shape({
    hrs: yup.string().required("Required"),
    min: yup.string().required("Required"),
  }),
  benefits: yup
    .array()
    .of(
      yup
        .string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters")
        .max(200, "Description must be less than 200 characters")
    )
    .required("At least one description is required"),
});

// The CourseForm component
const CourseForm: React.FC<CourseFormProps> = observer(
  ({ initialValues, showError, setShowError, handleSubmit }) => {
    const inputBg = useColorModeValue("transparent", "gray.700");

    return (
      <Box>
        <Formik
          initialValues={initialValues}
          validationSchema={courseDetailsSchema}
          onSubmit={(values, formikHelpers) => {
            console.log("Form Values on Submit:", values);
            handleSubmit(values, formikHelpers);
          }}
        >
          {({
            handleChange,
            values,
            errors,
            isSubmitting,
            touched,
            setFieldValue,
          }: FormikProps<FormValues>) => (
            <Form>
              <Grid templateColumns={"1fr 1fr"} gap={6}>
                <CustomInput
                  name="title"
                  placeholder="Enter the Title"
                  label="Title"
                  required
                  onChange={handleChange}
                  value={values.title}
                  error={errors.title}
                  showError={showError}
                />
                <CustomInput
                  name="short_desc"
                  placeholder="Give a short description"
                  label="Short Description"
                  required
                  onChange={handleChange}
                  value={values.short_desc}
                  error={errors.short_desc}
                  showError={showError}
                />
                <FormControl>
                  <FormLabel fontSize={"sm"}>Language</FormLabel>
                  <Field
                    as={Select}
                    name="language"
                    placeholder="Select Language"
                    bg={inputBg}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="marathi">Marathi</option>
                  </Field>
                  <Text color={"red.300"} fontSize={"sm"}>
                    <ErrorMessage name="level" component="div" />
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Category</FormLabel>
                  <Field
                    as={Select}
                    name="category"
                    placeholder="Select category"
                    bg={inputBg}
                  >
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    {/* Add more categories as needed */}
                  </Field>
                  <Text color={"red.300"} fontSize={"sm"}>
                    <ErrorMessage name="category" component="div" />
                  </Text>
                </FormControl>
                <CustomInput
                  name="description"
                  placeholder="Description about the Course"
                  label="About Course"
                  type="textarea"
                  rows={4}
                  required
                  onChange={handleChange}
                  value={values.description}
                  error={errors.description}
                  showError={showError}
                />
                <CustomInput
                  name="prerequisites"
                  placeholder="Prerequisites for the course"
                  label="Prerequisites"
                  type="textarea"
                  rows={4}
                  required
                  onChange={handleChange}
                  value={values.prerequisites}
                  error={errors.prerequisites}
                  showError={showError}
                />

                <CustomInput
                  name="tags"
                  type="select"
                  placeholder="Tags related ot Course"
                  label="Tags"
                  value={values.tags}
                  error={errors.tags}
                  onChange={(e) => {
                    setFieldValue("tags", e);
                  }}
                  options={courseTags}
                  showError={showError}
                  required={true}
                  isMulti={true}
                />
                <CustomInput
                  name="price"
                  placeholder="Enter the Price"
                  label="Price"
                  required
                  onChange={handleChange}
                  value={values.price}
                  error={errors.price}
                  showError={showError}
                />
                <FormControl mt={"9px"} isRequired>
                  <FormLabel fontSize={"xs"}>Difficulty Level</FormLabel>
                  <Field
                    as={Select}
                    name="level"
                    placeholder="Select level"
                    bg={inputBg}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Field>
                  <Text color={"red.300"} fontSize={"sm"}>
                    <ErrorMessage name="level" component="div" />
                  </Text>
                </FormControl>
                <Flex gap={4}>
                  <CustomInput
                    name="duration.hrs"
                    placeholder="Course Duration"
                    label="Duration (Hrs)"
                    type="text"
                    required
                    onChange={handleChange}
                    value={values.duration.hrs}
                    error={errors.duration?.hrs}
                    showError={showError}
                  />
                  <CustomInput
                    name="duration.min"
                    placeholder="Course Duration"
                    label="Duration (Min)"
                    type="text"
                    required
                    onChange={handleChange}
                    value={values.duration.min}
                    error={errors.duration?.min}
                    showError={showError}
                  />
                </Flex>
              </Grid>
              <FieldArray name="benefits">
                {({ push, remove }) => (
                  <Box mt={4}>
                    {values.benefits.length > 0 &&
                      values.benefits.map((benefit, index) => (
                        <React.Fragment key={index}>
                          <Flex align="end" gap={4} mb={2}>
                            <CustomInput
                              name={`benefits[${index}]`}
                              placeholder="Benefit of this Course"
                              label={`Benefit ${index + 1}`}
                              required
                              onChange={handleChange}
                              value={benefit}
                              error={
                                errors.benefits && touched.benefits
                                  ? (errors.benefits as string[])[index]
                                  : undefined
                              }
                              showError={showError}
                            />
                            {index !== 0 && (
                              <IconButton
                                aria-label="remove"
                                icon={<DeleteIcon />}
                                onClick={() => remove(index)}
                                colorScheme="red"
                              />
                            )}
                          </Flex>
                        </React.Fragment>
                      ))}
                    <Flex justify={"end"}>
                      <IconButton
                        aria-label="add"
                        icon={<AddIcon />}
                        onClick={() => push("")}
                        colorScheme="green"
                      />
                    </Flex>
                  </Box>
                )}
              </FieldArray>

              <CustomInput
                name="additional"
                placeholder="Add some additional details regarding the course"
                label="Additional Information"
                type="textarea"
                rows={4}
                required
                onChange={handleChange}
                value={values.additional}
                error={errors.additional}
                showError={showError}
              />

              <Button
                colorScheme="green"
                isLoading={isSubmitting}
                type="submit"
                onClick={() => {
                  if (typeof setShowError === "function") {
                    setShowError(true);
                  } else {
                    console.error("setShowError is not a function");
                  }
                }}
                mt={4}
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    );
  }
);

export default CourseForm;

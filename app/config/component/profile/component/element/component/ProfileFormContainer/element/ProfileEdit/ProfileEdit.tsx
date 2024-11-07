import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import CustomInput from "../../../../../../../CustomInput/CustomInput";
import { FieldArray, Form, Formik } from "formik";

const ProfileEdit = ({
  type,
  handleSubmitProfile,
  initialValues,
  validations,
}: any) => {
  const { colorMode } = useColorMode();
  const [showError, setShowError] = useState(false);

  const getAddressError = (errors: any, type: string, index: number) => {
    const errorTypes = ["address", "country", "state", "city", "pinCode"];
    if (errors.addressInfo && errors.addressInfo[index]) {
      const errorTypeIndex = errorTypes.indexOf(type);
      if (errorTypeIndex !== -1) {
        return errors.addressInfo[index][errorTypes[errorTypeIndex]];
      }
    }
    return undefined;
  };

  return (
    <Formik
      validationSchema={validations}
      initialValues={initialValues}
      onSubmit={(values, { setSubmitting, resetForm, setErrors }) => {
        handleSubmitProfile(
          values,
          setSubmitting,
          resetForm,
          setErrors,
          setShowError
        );
      }}
    >
      {({
        values,
        errors,
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
      }) => {
        return (
          <Form onSubmit={handleSubmit}>
            <Box
              p={6}
              boxShadow="md"
              borderRadius="md"
              height="100%"
              borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
              borderWidth="1px"
            >
              <Grid>
                <Heading color="#002058" fontSize="xl" mb={4}>
                  Personal Information :-
                </Heading>
                <Divider />
                <Grid
                  gridTemplateColumns={{ md: "1fr 1fr 1fr" }}
                  columnGap={5}
                  rowGap={3}
                  mb={5}
                >
                  <CustomInput
                    name="firstName"
                    type="text"
                    placeholder="Enter the First Name"
                    label="First Name"
                    value={values.firstName}
                    error={errors.firstName}
                    showError={showError}
                    onChange={handleChange}
                    required
                  />
                  <CustomInput
                    name="lastName"
                    type="text"
                    placeholder="Enter the Last Name"
                    label="Last Name"
                    value={values.lastName}
                    error={errors.lastName}
                    onChange={handleChange}
                    showError={showError}
                    required
                  />
                  <CustomInput
                    name="username"
                    type="text"
                    placeholder="Username"
                    label="UserName"
                    value={values?.username}
                    error={errors.username}
                    onChange={handleChange}
                    showError={showError}
                    required
                    readOnly={type === "edit" ? true : false}
                  />
                  <CustomInput
                    type="phone"
                    label="Phone Number"
                    name="mobileNo"
                    placeholder="Mobile No"
                    value={values.mobileNo}
                    error={errors.mobileNo}
                    showError={showError}
                    onChange={(e: any) => {
                      setFieldValue("mobileNo", e);
                    }}
                    required
                  />
                  <CustomInput
                    type="phone"
                    label="Emergency Number"
                    name="emergencyNo"
                    value={values.emergencyNo}
                    error={errors.emergencyNo}
                    placeholder="Emergency No"
                    showError={showError}
                    onChange={(e: any) => {
                      setFieldValue("emergencyNo", e);
                    }}
                  />
                  <CustomInput
                    type="text"
                    label="Nick Name"
                    name="nickName"
                    placeholder="Enter the Nick name"
                    value={values.nickName}
                    error={errors.nickName}
                    showError={showError}
                    onChange={handleChange}
                  />
                  <CustomInput
                    type="text"
                    label="Father Name"
                    name="fatherName"
                    placeholder="Enter the father name"
                    value={values.fatherName}
                    error={errors.fatherName}
                    showError={showError}
                    onChange={handleChange}
                  />
                  <CustomInput
                    type="text"
                    label="Mother Name"
                    name="motherName"
                    placeholder="Enter the mother name"
                    value={values.motherName}
                    error={errors.motherName}
                    showError={showError}
                    onChange={handleChange}
                  />
                  <CustomInput
                    type="text"
                    label="Sibling"
                    name="sibling"
                    placeholder="Sibling"
                    value={values.sibling}
                    error={errors.sibling}
                    showError={showError}
                    onChange={handleChange}
                  />
                  <CustomInput
                    type="text"
                    label="Language"
                    name="language"
                    placeholder="Select Language"
                    value={values.language}
                    error={errors.language}
                    showError={showError}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid mb={4}>
                  <CustomInput
                    type="textarea"
                    label="Bio"
                    name="bio"
                    placeholder="Bio"
                    value={values.bio}
                    error={errors.bio}
                    showError={showError}
                    onChange={handleChange}
                  />
                </Grid>
                {type === "create" && (
                  <Grid>
                    <Heading color="#002058" fontSize="xl" mb={4}>
                      Add Credential :-
                    </Heading>
                    <Divider />
                    <Grid
                      gridTemplateColumns={{ md: "1fr 1fr" }}
                      columnGap={5}
                      rowGap={3}
                      mb={5}
                    >
                      <CustomInput
                        name="password"
                        type="password"
                        placeholder="Enter the Password"
                        label="Password"
                        value={values.password}
                        error={errors.password}
                        showError={showError}
                        onChange={handleChange}
                        required
                      />
                      <CustomInput
                        name="confirmPassword"
                        type="password"
                        placeholder="Enter the Password"
                        label="Confirm Password"
                        value={values.confirmPassword}
                        error={errors.confirmPassword}
                        showError={showError}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  </Grid>
                )}
                <Heading color="#002058" fontSize="xl" mb={4}>
                  Address Information :-
                </Heading>
                <Divider />
                <Grid columnGap={5} rowGap={3} mb={5}>
                  <FieldArray name="addressInfo">
                    {({ push, remove }) => (
                      <Box>
                        {values.addressInfo.map((add: any, index: number) => (
                          <div key={index}>
                            <Grid
                              gridTemplateColumns={{ md: "1fr 1fr 1fr" }}
                              gap={3}
                              key={index}
                              mb="20px"
                            >
                              <CustomInput
                                name={`addressInfo.${index}.address`}
                                type="text"
                                placeholder="Address"
                                label="Address"
                                value={add.address}
                                required
                                showError={showError}
                                error={getAddressError(
                                  errors,
                                  "address",
                                  index
                                )}
                                onChange={handleChange}
                              />
                              <CustomInput
                                name={`addressInfo.${index}.country`}
                                type="text"
                                placeholder="Country"
                                label="Country"
                                value={add.country}
                                required
                                showError={showError}
                                error={getAddressError(
                                  errors,
                                  "country",
                                  index
                                )}
                                onChange={handleChange}
                              />
                              <CustomInput
                                name={`addressInfo.${index}.state`}
                                type="text"
                                placeholder="State"
                                label="State"
                                value={add.state}
                                required
                                showError={showError}
                                error={getAddressError(errors, "state", index)}
                                onChange={handleChange}
                              />
                              <CustomInput
                                name={`addressInfo.${index}.city`}
                                type="text"
                                placeholder="City"
                                label="City"
                                value={add.city}
                                required
                                showError={showError}
                                error={getAddressError(errors, "city", index)}
                                onChange={handleChange}
                              />
                              <CustomInput
                                name={`addressInfo.${index}.pinCode`}
                                type="text"
                                placeholder="PinCode"
                                label="PinCode"
                                value={add.pinCode}
                                required
                                showError={showError}
                                error={getAddressError(
                                  errors,
                                  "pinCode",
                                  index
                                )}
                                onChange={handleChange}
                              />
                            </Grid>
                            {values.addressInfo.length > 1 && (
                              <Button
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                mt="10px"
                                onClick={() => remove(index)}
                              >
                                Remove Section
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          colorScheme="blue"
                          variant="outline"
                          display="block"
                          size="sm"
                          mb="10px"
                          mt={5}
                          onClick={() =>
                            push({
                              address: "",
                              country: "",
                              state: "",
                              city: "",
                              pinCode: "",
                            })
                          }
                        >
                          Add Section
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </Grid>
              </Grid>
              <Button
                type="submit"
                onClick={() => {
                  setShowError(true);
                }}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ProfileEdit;

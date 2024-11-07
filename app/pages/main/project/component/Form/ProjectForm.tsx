import { useEffect, useState } from "react";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import CustomInput from "../../../../../config/component/CustomInput/CustomInput";
import { Form, Formik } from "formik";
import { ProjectCreateValidation } from "../utils/validation";
import { observer } from "mobx-react-lite";
import store from "../../../../../store/store";
import SubmitFormBtn from "../../../../../config/component/Button/SubmitFormBtn";
import { debounce } from "lodash";
import { ProjectFormValuesI } from "../utils/dto";
import moment from "moment";
import { getIdFromObject } from "../../../../../config/constant/function";

const ProjectForm = observer(() => {
  const [searchProjectName, setSearchProjectName] = useState("");
  const [showError, setShowError] = useState(false)
  const {
    auth: { getCompanyUsers, companyUsers, openNotification },
    Project: { getProjects, createProject },
  } = store;

  useEffect(() => {
    getCompanyUsers({ page: 1 })
      .then(() => {})
      .catch((err) => {
        openNotification({
          message: err?.message,
          title: "Fetch Users Failed",
          type: "err",
        });
      });
  }, [getCompanyUsers, openNotification]);

  useEffect(() => {
    const searchDebounceProject = debounce((value) => {
      getProjects(value)
        .then(() => {})
        .catch((err : any) => {
          console.log(err);
        });
    }, 2000);

    searchDebounceProject(searchProjectName);

    return () => {
      searchDebounceProject.cancel();
    };
  }, [searchProjectName, getProjects]);

  return (
    <div>
      <Formik
        initialValues={{
          project_name: "",
          subtitle: "",
          description: "",
          start_date: "",
          end_date: "",
          due_date: "",
          priority: {
            value: "",
            label: "",
          },
          followers: [],
          team_members: [],
          customers: [],
          project_manager: [],
          status: "",
          attach_files: [],
        }}
        validationSchema={ProjectCreateValidation}
        onSubmit={(
          values: ProjectFormValuesI,
          { setSubmitting, resetForm }
        ) => {
          const sendDataObject = {
            priority: values.priority ? values.priority.value : values.priority,
            status: values.status ? values.status.value : values.status,
            followers: getIdFromObject(values.followers),
            project_manager: getIdFromObject(values.project_manager),
            team_members: getIdFromObject(values.team_members),
            customers: getIdFromObject(values.customers),
            start_date: values.start_date
              ? moment(values.start_date).format("YYYY-MM-DD")
              : "",
            end_date: values.end_date
              ? moment(values.end_date).format("YYYY-MM-DD")
              : "",
            due_date: values.due_date
              ? moment(values.due_date).format("YYYY-MM-DD")
              : "",
          };

          console.log(values);
          createProject({ ...values, ...sendDataObject })
            .then((data) => {
              openNotification({
                title: "Successfully Created",
                message: `${data.message}`,
                type: "success",
              });
              resetForm();
            })
            .catch((err) => {
              console.log(err);
              openNotification({
                title: "Create Failed",
                message: err?.message,
                type: "error",
              });
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ handleChange, values, errors, setFieldValue, isSubmitting }) => {
          return (
            <Form>
              <Flex
                flexDirection="column"
                justifyContent="space-between"
                m={-6}
              >
                <Box
                  mt={1}
                  p={5}
                  overflowY="auto"
                  overflowX={"hidden"}
                  flex="1"
                  minH="85vh"
                  maxH={"85vh"}
                >
                  <Grid
                    templateColumns={{
                      base: "1fr 1fr",
                      xl: "repeat(2,1fr)",
                    }}
                    gap={4}
                  >
                    <GridItem>
                      <CustomInput
                        value={values.project_name}
                        name="project_name"
                        label="Project Name"
                        placeholder="Enter The project name"
                        required
                        onChange={(e: any) => {
                          setSearchProjectName(e.target.value);
                          handleChange(e);
                        }}
                        error={errors.project_name}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        name="priority"
                        label="Priority"
                        value={values.priority}
                        required
                        placeholder="Select the Priority"
                        options={[
                          { value: "Low", label: "Low" },
                          { value: "Medium", label: "Medium" },
                          { value: "High", label: "High" },
                        ]}
                        type="select"
                        onChange={(e: any) => {
                          setFieldValue("priority", e);
                        }}
                        error={errors.priority}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        name="subtitle"
                        label="Sub Title"
                        placeholder="Write the subtitle"
                        value={values.subtitle}
                        error={errors.subtitle}
                        onChange={handleChange}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        type="select"
                        name="status"
                        label="Status"
                        placeholder="Select the status"
                        value={values.status}
                        error={errors.status}
                        onChange={(e: any) => {
                          setFieldValue("status", e);
                          console.log(e);
                        }}
                        options={[
                          { value: "BackLog", label: "BackLog" },
                          { value: "Todo", label: "Todo" },
                          { value: "In Progress", label: "In Progress" },
                          { value: "Done", label: "Done" },
                          { value: "Completed", label: "Completed" },
                        ]}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <CustomInput
                        name="description"
                        label="Description"
                        placeholder="Write the Description"
                        type="textarea"
                        onChange={handleChange}
                        value={values.description}
                        error={errors.description}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        value={values.start_date}
                        error={errors.start_date}
                        name="start_date"
                        label="Start Date"
                        onChange={(date: any) => {
                          setFieldValue("start_date", date ? date : "");
                        }}
                        placeholder="Select the Start Date"
                        type="date"
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        value={values.end_date}
                        name="end_date"
                        label="End Date"
                        onChange={(date: any) => {
                          setFieldValue("end_date", date ? date : "");
                        }}
                        placeholder="Select the End Date"
                        type="date"
                        error={errors.end_date}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <CustomInput
                        value={values.due_date}
                        name="due_date"
                        label="Due Date"
                        placeholder="Select the Due Date"
                        type="date"
                        onChange={(date: any) => {
                          setFieldValue("due_date", date ? date : "");
                        }}
                        error={errors.due_date}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        name="customers"
                        label="Customers"
                        value={values.customers}
                        getOptionLabel={(option: any) => option.username}
                        getOptionValue={(option: any) => option._id}
                        options={companyUsers}
                        placeholder="Select the Customers"
                        type="select"
                        onChange={(e: any) => {
                          setFieldValue("customers", e);
                        }}
                        isMulti
                        isSearchable
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem>
                      <CustomInput
                        name="project_manager"
                        label="project_manager"
                        value={values.project_manager}
                        getOptionLabel={(option: any) => option.username}
                        getOptionValue={(option: any) => option._id}
                        options={companyUsers}
                        placeholder="Select the Project manager"
                        type="select"
                        onChange={(e: any) => {
                          setFieldValue("project_manager", e);
                        }}
                        isMulti
                        isSearchable
                        error={errors.project_manager}
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <CustomInput
                        name="team_members"
                        label="Team"
                        value={values.team_members}
                        getOptionLabel={(option: any) => option.username}
                        getOptionValue={(option: any) => option._id}
                        options={companyUsers}
                        placeholder="Select the Team Members"
                        type="select"
                        onChange={(e: any) => {
                          setFieldValue("team_members", e);
                        }}
                        isMulti
                        isSearchable
                        showError={showError}
                      />
                    </GridItem>
                    <GridItem colSpan={2} mb={5}>
                      <CustomInput
                        name="followers"
                        label="Followers"
                        value={values.followers}
                        getOptionLabel={(option: any) => option.username}
                        getOptionValue={(option: any) => option._id}
                        options={companyUsers}
                        placeholder="Select the Team Followers"
                        type="select"
                        onChange={(e: any) => {
                          setFieldValue("followers", e);
                        }}
                        isMulti
                        isSearchable
                        error={errors.followers}
                        showError={showError}
                      />
                    </GridItem>
                  </Grid>
                </Box>
                <SubmitFormBtn loading={isSubmitting} onClick={() => setShowError(true)}/>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
});

export default ProjectForm;

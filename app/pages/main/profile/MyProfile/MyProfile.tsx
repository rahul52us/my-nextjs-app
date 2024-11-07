import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FaEnvelope, FaFileAlt, FaPhone } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { HiIdentification } from "react-icons/hi";
import ShowData from "../../../Dashboard/Users/component/UserDetails/component/ShowData";
import ShowTagData from "../../../Dashboard/Users/component/UserDetails/component/ShowTagData";
import BankDetailsCard from "../../../Dashboard/Users/component/UserDetails/component/common/BankDetailCard";
import WorkHistory from "../../../Dashboard/Users/component/UserDetails/Element/component/WorkHistory/WorkHistory";
import { observer } from "mobx-react-lite";

const employee = {
  skills: ["React", "JavaScript", "TypeScript", "Node.js"],
  education: "Bachelor's in Computer Science",
  linkedin: "https://www.linkedin.com/in/johndoe",
  experience: "5 Years",
  profession: "Full Stack Developer",
};
const MyProfile: React.FC<any> = observer(({ userDetails, user }) => {
  //   console.log("userDetails", userDetails);

  const {
    name,
    username,
    designation,
    profileDetails,
    companyDetail,
    bankDetails,
    documents,
    familyDetails,
    // workExperience,
  } = userDetails;

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBgColor = useColorModeValue("gray.50", "black");

  // const user = userDetails;

  const iconButtonProps = {
    isRound: true,
    bg: "telegram.100",
    color: "telegram.600",
    _hover: { bg: "telegram.200" },
    fontSize: "lg",
  };

  const textColor = "gray";

  // console.log('profileDetails',profileDetails[0].language[0] || "NA")

  return (
    <Box w={"90%"} mx={"auto"}>
      <Grid templateColumns={"1fr 3fr"} columnGap={2}>
        <Box
          mt={2}
          shadow="lg"
          rounded={12}
          borderWidth={1}
          p={5}
          maxW="xs"
          bg={cardBgColor}
        >
          <Center>
            <Image
              src={user?.pic?.url || "https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg?t=st=1721148140~exp=1721151740~hmac=91f40f580d0627e8d8ae8619d4065dbba6b61827bd559eca54fcdce3c18c8072&w=1060"}
              boxSize="200px"
              objectFit="cover"
              rounded="full"
            />
          </Center>
          <Text
            fontSize="xl"
            fontWeight={700}
            textTransform="capitalize"
            textAlign="center"
            my={2}
          >
            {userDetails?.title} {name}
          </Text>
          {designation?.map((value: string) => (
            <Text
              fontWeight="semibold"
              color={textColor}
              textTransform="capitalize"
              textAlign="center"
            >
              {value}
            </Text>
          ))}
          <VStack spacing={5} mt={8} align="start">
            <Flex gap={4} align="center">
              <IconButton
                aria-label="ID"
                icon={<HiIdentification />}
                {...iconButtonProps}
              />
              <Tag colorScheme="blue" textTransform="capitalize">
                {userDetails?.code}
              </Tag>
            </Flex>
            <Flex gap={4} align="center">
              <IconButton
                aria-label="Phone"
                icon={<FaPhone />}
                {...iconButtonProps}
              />
              <Text color={textColor}>{profileDetails[0]?.mobileNo}</Text>
            </Flex>
            <Flex gap={4} align="center">
              <IconButton
                aria-label="Location"
                icon={<FaLocationDot />}
                {...iconButtonProps}
              />
              <Text color={textColor}>
                {profileDetails[0]?.addressInfo[0]?.city},{" "}
                {profileDetails[0]?.addressInfo[0]?.state}
              </Text>
            </Flex>
            <Flex gap={4} align="center">
              <IconButton
                aria-label="Email"
                icon={<FaEnvelope />}
                {...iconButtonProps}
              />
              <Text color={textColor}>{username}</Text>
            </Flex>
          </VStack>
        </Box>

        <Box
          my={2}
          shadow={"lg"}
          rounded={12}
          borderWidth={2}
          p={6}
          bg={cardBgColor}

          // h={'100%'}
        >
          <Tabs variant={"soft-rounded"} colorScheme="telegram">
            <TabList gap={4}>
              <Tab>Details</Tab>
              <Tab>Family Details</Tab>
              <Tab>Bank & Documents</Tab>
              <Tab>Work History</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box>
                  <Grid templateColumns={"1fr 1.25fr"} gap={4}>
                    <ShowData label="Profile" value={employee?.profession} />
                    <ShowData label="Experience" value={employee?.experience} />
                    <ShowData label="Education" value={employee?.education} />
                    <ShowTagData title="Skills" data={employee?.skills || []} />
                    <ShowData label="LinkedIn" value={employee?.linkedin} />
                    <ShowTagData
                      title="Languages"
                      data={profileDetails[0]?.language || []}
                    />

                    <ShowData
                      label="Aadhaar No"
                      value={profileDetails?.aadharNo || "NA"}
                    />
                    <ShowData
                      label="Date of Birth"
                      value={profileDetails?.dob || "NA"}
                    />
                    <ShowData
                      label="Blood Group"
                      value={profileDetails?.bloodGroup || "NA"}
                    />

                    <ShowData
                      label="Personal Email"
                      value={profileDetails?.personalEmail || "NA"}
                    />

                    <ShowData
                      label="Pan No"
                      value={profileDetails?.panNo || "NA"}
                    />
                    <ShowData
                      label="Heal Card No"
                      value={profileDetails?.healthCardNo || "NA"}
                    />
                    <ShowData
                      label="Insurance Card No"
                      value={profileDetails?.insuranceCardNo || "NA"}
                    />
                    <ShowData
                      label="Referred By"
                      value={profileDetails?.refferedBy || "NA"}
                    />
                    <ShowData
                      label="Marital Status"
                      value={profileDetails?.maritalStatus || "NA"}
                    />
                    {profileDetails?.maritalStatus && (
                      <ShowData
                        label="Wedding Date"
                        value={profileDetails?.weddingDate || "NA"}
                      />
                    )}
                  </Grid>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  {familyDetails.map((family: any) => (
                    <Box key={family._id} mb={4}>
                      {family.relations.map((relation: any, index: number) => (
                        <Grid
                          templateColumns={"1fr 1.25fr"}
                          gap={4}
                          key={index}
                        >
                          <ShowData label="Name" value={relation.name} />
                          <ShowData
                            label="Relation"
                            value={relation.relation}
                          />
                          <ShowData
                            label="Date of Birth"
                            value={relation.dob}
                          />
                          <ShowData
                            label="Contact Number"
                            value={relation.contactNo}
                          />
                          <ShowData
                            label="Aadhar Number"
                            value={relation.aadharNo}
                          />
                          <ShowData
                            label="Occupation"
                            value={relation.occupation}
                          />
                          <ShowData label="Address" value={relation.address} />
                          <ShowData
                            label="Covered Mediclaim"
                            value={relation.coveredMediclaim}
                          />
                          <ShowData
                            label="Covered ESIC"
                            value={relation.coveredEsic}
                          />
                          <ShowData
                            label="ESIC Nomination"
                            value={relation.esic_nomination}
                          />
                          <ShowData
                            label="Gratuity Nomination"
                            value={relation.gratuity_nomination}
                          />
                          <ShowData
                            label="PF Nomination"
                            value={relation.pf_nomination}
                          />
                        </Grid>
                      ))}
                    </Box>
                  ))}
                </Box>
              </TabPanel>
              <TabPanel>
                <BankDetailsCard
                  bankDetails={bankDetails}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                />
                <Divider my={4} />
                <Box>
                  <Heading color={"blue.600"} size="md">
                    Documents
                  </Heading>
                  {documents?.length > 0 ? (
                    <Box>
                      {documents && documents?.map((doc: any) =>
                        Object.keys(doc?.documents || {}).map((key) => (
                          <HStack
                            key={key}
                            spacing={4}
                            alignItems="center"
                            borderBottom="1px"
                            borderColor={borderColor}
                            py={2}
                          >
                            <Icon as={FaFileAlt} boxSize={6} color="blue.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{key}</Text>
                              <Text>{doc?.documents[key]?.name}</Text>
                              <Text
                                as="a"
                                href={doc?.documents[key]?.url}
                                color="blue.500"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Document
                              </Text>
                            </VStack>
                          </HStack>
                        ))
                      )}
                    </Box>
                  ) : (
                    <Text>No documents found</Text>
                  )}
                </Box>
              </TabPanel>
              <TabPanel>
                {companyDetail && user && (
                  <WorkHistory workHistory={companyDetail[0]?.details} user={user._id}/>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Grid>
    </Box>
  );
});

export default MyProfile;

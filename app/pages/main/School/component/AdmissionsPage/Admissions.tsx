import { CalendarIcon, CheckCircleIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text
} from "@chakra-ui/react";
  
  const Admissions = () => {
    return (
      <Box maxW="7xl" mx="auto" py={10} px={6}>
        <Heading as="h1" mb={6} textAlign="center" color="blue.600">
          Admissions
        </Heading>
  
        {/* Overview Section */}
        <Box mb={10}>
          <Heading as="h2" fontSize="2xl" mb={4}>
            Overview
          </Heading>
          <Text fontSize="lg">
            Welcome to the Admissions section! Our school offers a rich academic
            environment where students can thrive. Below you'll find all the
            information you need to apply, including steps to follow, requirements,
            and important deadlines.
          </Text>
        </Box>
  
        {/* How to Apply Section */}
        <Box mb={10}>
          <Heading as="h2" fontSize="2xl" mb={4}>
            How to Apply
          </Heading>
          <List spacing={3} fontSize="lg">
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="blue.500" />
              Step 1: Fill out the online application form.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="blue.500" />
              Step 2: Submit the required documents (transcripts, ID proof).
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="blue.500" />
              Step 3: Pay the application fee.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="blue.500" />
              Step 4: Attend the entrance exam (if applicable).
            </ListItem>
          </List>
          <Button colorScheme="blue" mt={4} size="lg">
            Apply Now
          </Button>
        </Box>
  
        {/* Eligibility Requirements Section */}
        <Box mb={10}>
          <Heading as="h2" fontSize="2xl" mb={4}>
            Eligibility Requirements
          </Heading>
          <Text fontSize="lg" mb={2}>
            Please ensure you meet the following criteria before applying:
          </Text>
          <List spacing={3} fontSize="lg">
            <ListItem>
              <ListIcon as={InfoIcon} color="blue.500" />
              Must be at least 5 years old for primary school.
            </ListItem>
            <ListItem>
              <ListIcon as={InfoIcon} color="blue.500" />
              Must have a high school diploma for undergraduate programs.
            </ListItem>
            <ListItem>
              <ListIcon as={InfoIcon} color="blue.500" />
              Must submit relevant transcripts and identification.
            </ListItem>
          </List>
        </Box>
  
        {/* Important Dates Section */}
        <Box mb={10}>
          <Heading as="h2" fontSize="2xl" mb={4}>
            Important Dates
          </Heading>
          <List spacing={3} fontSize="lg">
            <ListItem>
              <ListIcon as={CalendarIcon} color="blue.500" />
              Application Deadline: January 15, 2024
            </ListItem>
            <ListItem>
              <ListIcon as={CalendarIcon} color="blue.500" />
              Entrance Exam Date: March 10, 2024
            </ListItem>
            <ListItem>
              <ListIcon as={CalendarIcon} color="blue.500" />
              Admission Results: April 20, 2024
            </ListItem>
          </List>
        </Box>
  
        {/* FAQs Section */}
        <Box mb={10}>
          <Heading as="h2" fontSize="2xl" mb={4}>
            Frequently Asked Questions
          </Heading>
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontSize="lg">
                  What documents do I need to apply?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                You will need to submit your previous academic transcripts, proof of
                identification (passport or ID card), and any required test scores.
              </AccordionPanel>
            </AccordionItem>
  
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontSize="lg">
                  Is there an application fee?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Yes, there is a non-refundable application fee of $50, which must be
                paid online at the time of submission.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Box>
    );
  };
  
  export default Admissions;
  
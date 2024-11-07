import { Box, Grid, Heading, Text, useColorModeValue } from "@chakra-ui/react";
// import FlipCard from "./component/FlipCard/Flipcard";
import Card2 from "./component/Card2/Card2";
import MultiCardComponent from "./component/MultiCardComponent/MultiCardComponent";
// import CircularProgressBar from "./component/CircularProgressBar/CircularProgressBar";
import CourseCard from "./component/CourseCard/CourseCard";
import WhyUs from "./component/WhyUs/WhyUs";
import TeachersCard from "./component/TeachersCard/TeachersCard";
import whyus from "./component/WhyUs/whyus.webp";
import icon from "./component/WhyUs/scholar.webp";
import ExpandCard from "./component/ExpandCard/ExpandCard";
import InstructorCard from "./component/InstructorCard/InstructorCard";
import HeroSection2 from "./component/HeroSection2/HeroSection2";
import SliderCard1 from "./component/Card1/SliderCard1";
import { main } from "../../../config/constant/routes";
import CourseForm from "../courses/CourseForm/CourseForm";
import { useState } from "react";
import PaymentPage from "../../../config/component/PaymentGateway/PaymentPage";
// import PageBuilder from "../../../config/component/LiberaryComponent/PageBuilder";
// import ProfileCard from "./component/ProfileCard/ProfileCard";

// const cardData = [
//   {
//     id: 1,
//     imageUrl:
//       "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
//     imageAlt: "Food and Beverage",
//     name: "Food and Beverage",
//     backDescription:
//       "Welcome to our hub for all things food and beverages, where indulgence meets convenience.",
//   },
//   {
//     id: 2,
//     imageUrl:
//       "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
//     imageAlt: "Fashion",
//     name: "Fashion and Footwear",
//     backDescription:
//       "Discover the ease of online fashion and footwear shopping with our seamless interface.",
//   },
//   {
//     id: 3,
//     imageUrl: "/images/ondc/electronics.webp",
//     imageAlt: "electronics",
//     name: "Electronic",
//     backDescription:
//       "Discover our platform, crafted to make your shopping experience for electronics seamless and hassle-free.",
//   },
//   {
//     id: 4,
//     imageUrl: "/images/ondc/home.webp",
//     imageAlt: "Home and Kitchen",
//     name: "Home and Kitchen",
//     backDescription:
//       "Upgrade your home and kitchen effortlessly with our streamlined online shopping experience.",
//   },
// ];

const data = [
  {
    id: "1",
    image: "https://cdn-icons-png.flaticon.com/128/6424/6424084.png",
    title: "Expertise in ONDC",
    about: "In-depth knowledge and experience in ONDC integrations.",
  },
  {
    id: "2",
    image: "https://cdn-icons-png.flaticon.com/128/6424/6424084.png",
    title: "Rapid Onboarding",
    about:
      "Quick and efficient partner integration to leverage ONDC benefits sooner.",
  },
  {
    id: "3",
    image: "https://cdn-icons-png.flaticon.com/128/6424/6424084.png",
    title: "Cloud-Based Solutions",
    about: "No server maintenance required with our cloud-based APIs.",
  },
  {
    id: "4",
    image: "https://cdn-icons-png.flaticon.com/128/6424/6424084.png",
    title: "Minimal Development Effort",
    about: "Easy integration with existing systems.",
  },
];

const cards = [
  {
    image:
      "https://img.freepik.com/free-vector/woman-thinking-isoalted-design-illustration_18591-83949.jpg?t=st=1712074549~exp=1712078149~hmac=8701df5ed01458315f895f4ec71052571f98651a538d5c911fdcdc4c75a7860b&w=740",
    button: "FAQ",
    link: main.faq,
  },
  {
    image:
      "https://img.freepik.com/free-vector/woman-thinking-isoalted-design-illustration_18591-83949.jpg?t=st=1712074549~exp=1712078149~hmac=8701df5ed01458315f895f4ec71052571f98651a538d5c911fdcdc4c75a7860b&w=740",
    button: "About",
    link: main.about,
  },
  {
    image:
      "https://img.freepik.com/free-vector/woman-thinking-isoalted-design-illustration_18591-83949.jpg?t=st=1712074549~exp=1712078149~hmac=8701df5ed01458315f895f4ec71052571f98651a538d5c911fdcdc4c75a7860b&w=740",
    button: "Contact Us",
    link: main.contact,
  },
];

const courses = [
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
  {
    id: 1,
    title: "React Course",
    admin: "admin",
    price: "500.00",
    rating: 4,
    duration: "12",
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/07/img-4-356x253.jpg",
  },
];

const cardData1 = [
  {
    icon: icon,
    heading: "Professional Trainer",
    text: "If you're considering whether to do a postgraduate degree, probably a lot of questions.",
  },
  {
    icon: icon,
    heading: "Another Heading",
    text: "If you're considering whether to do a postgraduate degree, probably a lot of questions.",
  },
  {
    icon: icon,
    heading: "Another Heading",
    text: "If you're considering whether to do a postgraduate degree, probably a lot of questions.",
  },
  {
    icon: icon,
    heading: "Another Heading",
    text: "If you're considering whether to do a postgraduate degree, probably a lot of questions.",
  },
];

const teachers = [
  {
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/08/teacher1-337x329.jpg",
    name: "Tarun Verma",
    role: "Cypress",
    linkedin: "https://www.linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    instagram: "https://www.instagram.com/janesmith",
  },
  {
    imageUrl:
      "https://studentwp.wptech.co/wp-content/uploads/2021/08/teacher1-337x329.jpg",
    name: "Jane Smith",
    role: "Mathematics Teacher",
    linkedin: "https://www.linkedin.com/in/janesmith",
    instagram: "https://www.instagram.com/janesmith",
    twitter: "https://twitter.com/johndoe",
  },
];

const eventCardData = [
  {
    image:
      "https://demo.edublink.co/wp-content/uploads/2023/03/course-43-590x430.jpg",
    title: "Learn English in Ease Basic to Advance",
    description:
      "Excepteur sint occaecat cupidatat non proident sunt in id est laborum. Sed ut perspiciatis unde omnis.",
    buttonText: "Learn More",
    dateTime: "16 Dec 2024 10:00 AM",
  },
  {
    image:
      "https://demo.edublink.co/wp-content/uploads/2023/03/course-43-590x430.jpg",
    title: "Learn English in Ease Basic to Advance",
    description:
      "Excepteur sint occaecat cupidatat non proident sunt in id est laborum. Sed ut perspiciatis unde omnis.",
    buttonText: "Learn More",
    dateTime: "16 Dec 2024 10:00 AM",
  },
  {
    image:
      "https://demo.edublink.co/wp-content/uploads/2023/03/course-43-590x430.jpg",
    title: "Learn English in Ease Basic to Advance",
    description:
      "Excepteur sint occaecat cupidatat non proident sunt in id est laborum. Sed ut perspiciatis unde omnis.",
    buttonText: "Learn More",
    dateTime: "16 Dec 2024 10:00 AM",
  },
  {
    image:
      "https://demo.edublink.co/wp-content/uploads/2023/03/course-43-590x430.jpg",
    title: "Learn English in Ease Basic to Advance",
    description:
      "Excepteur sint occaecat cupidatat non proident sunt in id est laborum. Sed ut perspiciatis unde omnis.",
    buttonText: "Learn More",
    dateTime: "16 Dec 2024 10:00 AM",
  },
  // Add more data objects here if you want to render more ExpandCard components
];

const instructorsData = [
  {
    name: "Edward Norton",
    jobTitle: "Web Developer",
    profileImageUrl:
      "https://demo.edublink.co/wp-content/uploads/2023/07/team-06.webp",
    instagram: "https://instagram.com/edwardnorton",
    linkedin: "https://linkedin.com/in/edwardnorton",
    twitter: "https://twitter.com/edwardnorton",
    about: "Consectetur adipisicing elit, sed do eius mod tempor incididunt",
  },
  {
    name: "Edward Norton",
    jobTitle: "Web Developer",
    profileImageUrl:
      "https://demo.edublink.co/wp-content/uploads/2023/07/team-06.webp",
    instagram: "https://instagram.com/edwardnorton",
    linkedin: "https://linkedin.com/in/edwardnorton",
    twitter: "https://twitter.com/edwardnorton",
    about: "Consectetur adipisicing elit, sed do eius mod tempor incididunt",
  },
  {
    name: "Edward Norton",
    jobTitle: "Web Developer",
    profileImageUrl:
      "https://demo.edublink.co/wp-content/uploads/2023/07/team-06.webp",
    instagram: "https://instagram.com/edwardnorton",
    linkedin: "https://linkedin.com/in/edwardnorton",
    twitter: "https://twitter.com/edwardnorton",
    about: "Consectetur adipisicing elit, sed do eius mod tempor incididunt",
  },
  {
    name: "Edward Norton",
    jobTitle: "Web Developer",
    profileImageUrl:
      "https://demo.edublink.co/wp-content/uploads/2023/07/team-06.webp",
    instagram: "https://instagram.com/edwardnorton",
    linkedin: "https://linkedin.com/in/edwardnorton",
    twitter: "https://twitter.com/edwardnorton",
    about: "Consectetur adipisicing elit, sed do eius mod tempor incididunt",
  },
];

const Home2 = () => {
  const [showError, setShowError] = useState(false);

  const initialValues = {
    title: "",
    benefits: [""],
    description: "",
    category: "",
    level: "",
    price: "",
    prerequisites: "",
    short_desc: "",
    language: "",
    tags: [""],
    duration: {
      hrs: "",
      min: "",
    },
    additional: "",
  };

  const handleSubmit = (values: any, { setSubmitting, resetForm }: any) => {
    console.log("---------", values);
    setSubmitting(false);
    resetForm();
    // setShowError(false)
  };

  const insetShadow = useColorModeValue(
    "rgb(0 0 0 / 15%) 0px 0px 12px", // No shadow in light mode
    "0 0 10px rgba(255, 255, 255, 0.2)" // White shadow in dark mode
  );
  return (
    <Box>
      <HeroSection2 />

      <Box m={2}>
        <Box
          maxW={"75%"}
          bg={useColorModeValue("gray.50", "blackAlpha.300")}
          mx={"auto"}
          p={8}
          rounded={10}
          shadow={insetShadow}
          display="none"
          // shadow="rgb(0 0 0 / 15%) 0px 0px 12px"
        >
                <PaymentPage/>
          <CourseForm
            initialValues={initialValues}
            showError={showError}
            setShowError={setShowError} // Ensure this is a function
            handleSubmit={handleSubmit}
          />
        </Box>

        {/* <ProfileCard /> */}
      </Box>
      {/* <PageBuilder /> */}
      <Box>
        <Text mt={"4rem"} textAlign={"center"} color={"gray"}>
          POPULAR COURSES
        </Text>
        <Heading textAlign={"center"}>Pick A Course To Get Started</Heading>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          }}
          gap={2}
          p={10}
          mx={{ base: "0.5rem", md: "4rem" }}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </Grid>
      </Box>


      <Box mx={{ base: "0.5rem", md: "6rem" }}>
        <Text mt={"4rem"} textAlign={"center"} color={"gray"}>
          EVENTS
        </Text>
        <Heading textAlign={"center"}>Popular Events</Heading>
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr 1fr" }}
          mt={"2rem"}
          gap={2}
          p={4}
        >
          {eventCardData.map((item, index) => (
            <ExpandCard
              key={index}
              image={item.image}
              title={item.title}
              description={item.description}
              buttonText={item.buttonText}
              dateTime={item.dateTime}
            />
          ))}
        </Grid>
      </Box>

      <Box mx={{ base: "0.5rem", md: "6rem" }}>
        <Text mt={"4rem"} textAlign={"center"} color={"gray"}>
          INSTRUCTORS
        </Text>
        <Heading textAlign={"center"}>Course Instructors</Heading>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          }}
          mt={"2rem"}
          gap={6}
        >
          {instructorsData.map((instructor, index) => (
            <InstructorCard
              key={index} // Make sure to provide a unique key
              name={instructor.name}
              jobTitle={instructor.jobTitle}
              profileImageUrl={instructor.profileImageUrl}
              instagram={instructor.instagram}
              linkedin={instructor.linkedin}
              twitter={instructor.twitter}
              about={instructor.about}
            />
          ))}
        </Grid>
      </Box>

      {/* <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={6}
        mx={{ base: "none", md: "2rem", lg: "10rem" }}
        placeItems={"center"}
      >
        {cardData.map((card) => (
          <FlipCard
            key={card.id}
            imageUrl={card.imageUrl}
            imageAlt={card.imageAlt}
            name={card.name}
            backDescription={card.backDescription}
          />
        ))}
      </Grid> */}

      <Box my={6}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
          {data.map((value) => (
            <Card2
              key={value.id}
              image={value.image}
              about={value.about}
              title={value.title}
              bgColor="telegram.500"
              cardBg={"white"}
            />
          ))}
        </Grid>
      </Box>
      <SliderCard1 />
      {/* <Box my={6}>
        <CircularProgressBar
          progressValue={100}
          description={"Million Views"}
        />
      </Box> */}

      <Box m={{ base: "1rem", lg: "6rem" }}>
        <MultiCardComponent
          bgColor={"telegram.500"}
          buttonColor={"telegram.500"}
          description={
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fuga amet vitae sed ipsum incidunt eius commodi atque nemo magnam, dolore quia  dolorem tempora."
          }
          title={"Got Question?"}
          cards={cards}
        />
      </Box>
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
        gap={2}
        p={10}
      >
        {" "}
        {teachers.map((teacher, index) => (
          <TeachersCard
            key={index}
            imageUrl={teacher.imageUrl}
            name={teacher.name}
            role={teacher.role}
            linkedin={teacher.linkedin}
            instagram={teacher.instagram}
            twitter={teacher.twitter}
          />
        ))}
      </Grid>
      {/* <WhyUs cards={cardData1} whyus={whyus} /> */}
    </Box>
  );
};

export default Home2;

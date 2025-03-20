import { Box, Grid, Heading } from "@chakra-ui/react";
import ContactCard from "./element/ContactCard";



const ContactDetails = () => {
  const contactInfo = [
    {
      bg: "#FFB8B2",
      icon: "/icons/email.svg",
      title: "Email",
      content: "support@metamindhealth.com",
      description: (
        <>
          <span style={{ fontSize: "0.8rem" }}>(We`&apos;ll get back to you within 24 hrs)</span>
        </>),
      onClick: () => window.open("mailto:support@metamindhealth.com"),
    },
    {
      bg: "#EAF475",
      icon: "/icons/phone.svg",
      title: "Phone",
      content: "+91 9090 404949",
      description: (
        <>
          <span style={{ fontSize: "0.8rem" }}>(We`&apos;ll get back to you within 24 hrs)</span>
        </>),
      onClick: () => window.open("tel:+91 9090 404949"),
    },
    {
      bg: "#86C6F4",
      icon: "/icons/location.svg",
      title: "Address",
      content: "2nd Floor, LC complex, Sector 49, Noida, UP, IN- 201301",
      onClick: () =>
        window.open(
          "https://tinyurl.com/wypdhhbm"
        ),
    },
    {
      bg: "#9DEAB2",
      icon: "/icons/clock.svg",
      title: "Operating Hours",
      content: (
        <>
          Mon-Fri: 10 AM - 6 PM <br />
          <span style={{ fontSize: "0.8rem", color: "black" }}>Available: in-person and online</span>
        </>),
      onClick: null,
    },
  ];

  return (
    <Box maxW={{ base: "90%", md: "85%", lg: "90%" }} mx={"auto"}>
      <Heading as={'h2'} textAlign={'center'} mb={{ base: 4, md: 8 }} fontSize={{ base: "34px", lg: "42px", xl: '44px' }}>Contact Details</Heading>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} gap={4}>
        {contactInfo.map((info, index) => (
          <ContactCard
            key={index}
            bg={info.bg}
            icon={info.icon}
            title={info.title}
            content={info.content}
            description={info.description}
            onClick={info.onClick}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default ContactDetails;

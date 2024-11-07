import React from "react";
import { jsPDF } from "jspdf";
import { Chart, registerables } from "chart.js";
import { Button } from "@chakra-ui/react";

Chart.register(...registerables);

interface AddressInfo {
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
}

interface User {
  name: string;
  username: string;
  personalEmail: string;
  mobileNo: string;
  dob: string; // Format: YYYY-MM-DD
  addressInfo: AddressInfo[];
  aadharNo: string;
  bloodGroup: string;
  emergencyNo: string;
  maritalStatus: string;
  insuranceCardNo: string;
  medicalCertificationDetails: string;
  weddingDate: string;
  pfUanNo: string;
  nickName: string;
  refferedBy: string;
}

interface UserProfilePDFProps {
  user: User;
}

const UserProfilePDF: React.FC<UserProfilePDFProps> = ({ user }) => {

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4"); // Portrait, mm units, A4 size
    const margin = 15;

    // Title
    doc.setFontSize(26);
    doc.setTextColor(0, 51, 102); // Dark blue color
    doc.text("User Profile", margin, 20);

    // User Information Section
    addUserInfoSection(doc, margin);
    doc.addPage(); // New page for address info
    addAddressSection(doc, margin);
    doc.addPage(); // New page for data overview
    addUserDataOverviewSection(doc, margin);

    // Footer (Optional)
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150); // Gray color
    doc.text(
      "Generated on: " + new Date().toLocaleString(),
      margin,
      doc.internal.pageSize.getHeight() - 10
    );

    // Finalizing the PDF
    doc.save("user_profile.pdf");
  };

  // Function to add User Information Section
  const addUserInfoSection = (doc: any, margin: any) => {
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Lighter blue color
    doc.text("User Information", margin, 35);
    doc.setFontSize(12);
    doc.setTextColor(0); // Reset to black for content

    const userInfo = [
      { label: "Name", value: user.name },
      { label: "Username", value: user.username },
      { label: "Email", value: user.personalEmail },
      { label: "Mobile No", value: user.mobileNo },
      {
        label: "Date of Birth",
        value: new Date(user.dob).toLocaleDateString(),
      },
      { label: "Emergency No", value: user.emergencyNo },
      { label: "Aadhar No", value: user.aadharNo },
      { label: "Blood Group", value: user.bloodGroup },
      { label: "Marital Status", value: user.maritalStatus },
      { label: "Insurance Card No", value: user.insuranceCardNo },
      {
        label: "Medical Certification",
        value: user.medicalCertificationDetails,
      },
      {
        label: "Wedding Date",
        value: new Date(user.weddingDate).toLocaleDateString(),
      },
      { label: "PF UAN No", value: user.pfUanNo },
      { label: "Nickname", value: user.nickName },
      { label: "Referred By", value: user.refferedBy },
    ];

    const userInfoStartY = 45;
    userInfo.forEach((item, index) => {
      const lineY = userInfoStartY + index * 10;
      doc.text(`${item.label}:`, margin, lineY);
      doc.text(item.value, margin + 50, lineY); // Indent the value
    });
  };

  // Function to add Address Information Section
  const addAddressSection = (doc: any, margin: any) => {
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("Address Information", margin, 15);

    user.addressInfo.forEach((address, index) => {
      const offset = 25 + index * 60; // Increment position for multiple addresses
      doc.setFontSize(14);
      doc.text(`Address ${index + 1}:`, margin, offset);
      doc.setFontSize(12);
      doc.text(`Address: ${address.address}`, margin + 10, offset + 8);
      doc.text(`City: ${address.city}`, margin + 10, offset + 16);
      doc.text(`State: ${address.state}`, margin + 10, offset + 24);
      doc.text(`Country: ${address.country}`, margin + 10, offset + 32);
      doc.text(`Pin Code: ${address.pinCode}`, margin + 10, offset + 40);
      doc.line(margin, offset + 42, 200 - margin, offset + 42); // Horizontal line
    });
  };

  // Function to add User Data Overview Section
  const addUserDataOverviewSection = (doc: any, margin: any) => {
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("User Data Overview", margin, 15);

  };

  return (
        <Button colorScheme="teal" onClick={generatePDF}>
          Download PDF
        </Button>
  );
};

export default UserProfilePDF;
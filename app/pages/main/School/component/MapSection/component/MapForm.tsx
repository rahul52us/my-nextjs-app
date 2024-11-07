import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
} from "@chakra-ui/react";
import FormModel from "../../../../../../config/component/common/FormModel/FormModel";
import { useState } from "react";

const MapForm = ({ content, open, onClose, setContent }: any) => {
  const [data, setData] = useState(content);

  // Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setContent(data);
    onClose();
  };

  return (
    <FormModel open={open} onClose={onClose}>
      <Box p={5}>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>School Name</FormLabel>
          <Input name="name" value={data.name} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Address</FormLabel>
          <Input name="address" value={data.address} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={data.phone} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input name="email" value={data.email} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Website</FormLabel>
          <Input name="website" value={data.website} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Map URL</FormLabel> {/* New field for map URL */}
          <Input name="mapUrl" value={data.mapUrl} onChange={handleChange} />
        </FormControl>
        <ModalFooter>
          <Button colorScheme="blue" type="submit">
            Save
          </Button>
          <Button ml={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </form>
      </Box>
    </FormModel>
  );
};

export default MapForm;

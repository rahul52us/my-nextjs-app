import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  IconButton,
  Input,
  ModalFooter,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import FormModel from "../../../../../../../config/component/common/FormModel/FormModel";

const AboutForm = ({ isOpen, onClose, content, setContent }: any) => {
  const [editContent, setEditContent] = useState({ ...content });

  const handleSave = () => {
    setContent(editContent);
    onClose(); // Ensure the modal closes after saving
  };

  const addDescription = () => {
    setEditContent((prev: any) => ({
      ...prev,
      description: [...prev.description, ""],
    }));
  };

  const deleteDescription = (index: number) => {
    const newDescription = editContent.description.filter(
      (_: any, idx: any) => idx !== index
    );
    setEditContent({ ...editContent, description: newDescription });
  };

  return (
    <FormModel isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <>
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Title</Tab>
            <Tab>Subtitle</Tab>
            <Tab>Descriptions</Tab>
            <Tab>Image URL</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Input
                placeholder="Title"
                value={editContent.title}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
              />
            </TabPanel>
            <TabPanel>
              <Input
                placeholder="Subtitle"
                value={editContent.subtitle}
                onChange={(e) =>
                  setEditContent({ ...editContent, subtitle: e.target.value })
                }
              />
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={3}>
                {editContent.description.map((desc: any, index: number) => (
                  <Flex key={index} align="center">
                    <Textarea
                      placeholder="Description"
                      value={desc}
                      onChange={(e) =>
                        setEditContent((prev: any) => {
                          const updatedDescriptions = [...prev.description];
                          updatedDescriptions[index] = e.target.value;
                          return { ...prev, description: updatedDescriptions };
                        })
                      }
                    />
                    <IconButton
                      aria-label="Delete description"
                      icon={<DeleteIcon />}
                      ml={2}
                      onClick={() => deleteDescription(index)}
                    />
                  </Flex>
                ))}
                <Button onClick={addDescription}>Add Description</Button>
              </VStack>
            </TabPanel>
            <TabPanel>
              <Input
                placeholder="Image URL"
                value={editContent.imageUrl}
                onChange={(e) =>
                  setEditContent({ ...editContent, imageUrl: e.target.value })
                }
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} width="full">
            Save Changes
          </Button>
        </ModalFooter>
      </>
    </FormModel>
  );
};

export default AboutForm;
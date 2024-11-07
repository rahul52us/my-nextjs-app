import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from "@chakra-ui/react";
import styled from "styled-components";
import { AiOutlineClose } from "react-icons/ai";
// import { AiOutlinePlayCircle } from "react-icons/ai";

const IframeContainer = styled(Box)`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;

`;

const IframeWrapper = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: transparent;
  display:none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const YoutubeVideoCard = ({ link, handleClose }: any) => {

  const closeVideoModal = () => {
    handleClose();
  };

  return (
    <>
      {link && (
        <Modal isOpen onClose={closeVideoModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalBody p={0}>
              <IframeContainer>
                <IframeWrapper>
                  <iframe
                    src={`https://www.youtube.com/embed/${link}`}
                    title="YouTube Video"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                  />
                </IframeWrapper>
              </IframeContainer>
            </ModalBody>
            <CloseButton onClick={closeVideoModal}>
              <AiOutlineClose size={20} />
            </CloseButton>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default YoutubeVideoCard;

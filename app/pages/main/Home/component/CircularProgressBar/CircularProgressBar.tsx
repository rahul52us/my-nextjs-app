import { useState, useEffect } from "react";
import {
  CircularProgress,
  Box,
  Text,
  CircularProgressLabel,
} from "@chakra-ui/react";

interface Props {
  progressValue: number;
  description: string;
}

const CircularProgressBar = ({ progressValue, description }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress === progressValue) {
          clearInterval(interval);
          return progressValue;
        } else {
          return prevProgress + 1; // Adjust the step size as needed
        }
      });
    }, 25); // Update interval to make animation smoother

    return () => clearInterval(interval);
  }, [progressValue]);

  return (
    <Box textAlign="center">
      <CircularProgress
        value={progress}
        color="telegram.500"
        size="12rem"
        thickness="8px"
        trackColor="gray.100"
        transition="all 0.3s ease-in-out"
        capIsRound
      >
        <CircularProgressLabel>
          <Text fontSize="3xl" fontWeight="bold">
            {`${progress}%`}
          </Text>
        </CircularProgressLabel>
      </CircularProgress>
      <Text fontSize={"md"}>{description}</Text>
    </Box>
  );
};

export default CircularProgressBar;

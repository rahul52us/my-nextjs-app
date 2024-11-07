import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Step as ChakraStep,
  StepDescription,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from "@chakra-ui/react";

interface Steps {
  title: string;
  description: string;
  Icon: React.ReactNode;
}

interface CustomStepperProps {
  steps: Steps[];
  activeStepIndex: number;
  orientation?: "horizontal" | "vertical";
  disabledIndexes?: number[];
  rest?:any;
  setActiveStepIndex?: any;
}

const Step: React.FC<any> = ({ isDisabled, ...props }) => {
  return (
    <ChakraStep {...props} opacity={isDisabled ? 0.5 : 1} cursor={isDisabled ? "not-allowed" : "pointer"} />
  );
};

const CustomStepper: React.FC<CustomStepperProps> = ({
  steps,
  activeStepIndex,
  orientation,
  disabledIndexes = [],
  setActiveStepIndex,
  rest
}) => {
  const { activeStep, setActiveStep } = useSteps({
    index: activeStepIndex,
    count: steps.length,
  });

  useEffect(() => {
    setActiveStep(activeStepIndex)
  },[activeStepIndex,setActiveStep])

  const handleClick = (index: number) => {
    setActiveStep(index);
    if (setActiveStepIndex) setActiveStepIndex(index);
  };

  return (
    <Box w="100%" cursor="pointer">
      {orientation === "horizontal" ? (
        <Stepper index={activeStep} orientation={orientation} {...rest}>
          {steps.map((step, index) => (
            <Step
              key={index}
              onClick={() => {
                if (!disabledIndexes.includes(index)) handleClick(index);
              }}
              isDisabled={disabledIndexes.includes(index)}
            >
              <Flex flexDirection="column" alignItems="center" flex={1}>
                <StepTitle>{step.title}</StepTitle>
                <StepIndicator>
                  <StepStatus
                    complete={step.Icon}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <StepDescription>{step.description}</StepDescription>
              </Flex>
              {index < steps.length - 1 && <StepSeparator />}
            </Step>
          ))}
        </Stepper>
      ) : (
        <Stepper
          index={activeStep}
          orientation={orientation}
          height="100%"
          gap="0"
          {...rest}
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              onClick={() => {
                if (!disabledIndexes.includes(index)) handleClick(index);
              }}
              isDisabled={disabledIndexes.includes(index)}
            >
              <StepIndicator>
                <StepStatus
                  complete={step.Icon}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      )}
    </Box>
  );
};

CustomStepper.defaultProps = {
  orientation: "horizontal",
};

export default CustomStepper;

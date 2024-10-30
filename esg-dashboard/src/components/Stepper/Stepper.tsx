import "./Stepper.css";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import Tick from "../../assets/Tick.svg?react"

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  const { colorMode } = useColorMode();
  const totalSteps = steps.length;

  const startIndex =
    currentStep < 3 ? 0 : currentStep > totalSteps - 3 ? totalSteps - 5 : currentStep - 2;
  const endIndex = startIndex + 5;
  const visibleSteps = steps.slice(startIndex, endIndex);

  return (
    <div className="stepper-container">
      {startIndex > 0 && (
        <div className="step-container">
          <Box className="ellipsis">...</Box>
        </div>
      )}

      {visibleSteps.map((step, index) => {
        const actualIndex = startIndex + index;
        return (
          <div className="step-container" key={actualIndex}>
            <div className="step">
              <Box
                className={`step-indicator 
                  ${currentStep >= actualIndex ? "step-active" : "step-inactive"}-${colorMode}`}
              >
                {currentStep >= actualIndex ? <Tick className="step-tick" /> : actualIndex + 1}
              </Box>
              <Text
                className="step-label"
                fontWeight={currentStep === actualIndex ? "bold" : "normal"}
              >
                {step.title}
              </Text>
            </div>
            {index < visibleSteps.length - 1 && (
              <div
                className={`step-divider 
                  ${currentStep > actualIndex ? "step-active" : "step-inactive"}-${colorMode}`}
              ></div>
            )}
          </div>
        );
      })}

      {endIndex < totalSteps && (
        <div className="step-container">
          <Box className="ellipsis">...</Box>
        </div>
      )}
    </div>
  );
};

export default Stepper;

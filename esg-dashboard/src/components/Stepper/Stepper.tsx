import "./Stepper.css";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import Tick from "../../assets/Tick.svg?react"
import { InitiationMethod } from "../../constants/types";

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  inputMethod: InitiationMethod
}

const Stepper = ({ steps, currentStep, inputMethod }: StepperProps) => {
  const { colorMode } = useColorMode();
  const totalSteps = steps.length;
  const modifiedSteps = steps.map((step, index) => {
    if (index == 1 && inputMethod == InitiationMethod.manual) {
      step.title = "Company Name";
      step.description = "Set Company Name"
    }
    return step;
  })

  const startIndex =
    currentStep < 3 ? 0 : currentStep > totalSteps - 3 ? totalSteps - 5 : currentStep - 2;
  const endIndex = startIndex + 5;
  const visibleSteps = modifiedSteps.slice(startIndex, endIndex);

  return (
    <div className="stepper-container">
      <div className="step-container">
        {startIndex > 0 && (    
          <Box className="ellipsis">...</Box>
        )}
      </div>

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
                id="divider"
                className={`step-divider 
                  ${currentStep > actualIndex ? "divider-active" : "divider-inactive"}-${colorMode}`}
              ></div>
            )}
          </div>
        );
      })}

      
      <div className="step-container">
        {endIndex < totalSteps && (
          <Box className="ellipsis">...</Box>
        )}
      </div>
    </div>
  );
};

export default Stepper;

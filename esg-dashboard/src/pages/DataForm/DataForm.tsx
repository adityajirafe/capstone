import React, { useState } from "react";
import {
  ButtonGroup,
  Button,
  Flex,
  Text,
  useToast,
  Box,
} from "@chakra-ui/react";
import "./dataform.css"; // Import the CSS file
import Form1 from "./Form1";
import Form2 from "./Form2";
import Form3 from "./Form3";
import Form4 from "./Form4";
import Form5 from "./Form5";

const steps = [
  "Company Info",
  "Select Years",
  "Air Quality",
  "Energy Management",
  "Water Management",
  "Waste Management",
  "Biodiversity Impacts",
  "Human Rights",
  "Community/Labor Relations",
  "Workforce Health and Safety",
  "Activity Metrics",
];

const DataInputForm = () => {
  const toast = useToast();
  const [step, setStep] = useState(0); // Step state (starts from 0)
  const [companyName, setCompanyName] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleYearsSelection = (years) => {
    setSelectedYears(years);
  };

  return (
    <>
      {/* Main container for the form with consistent width */}
      <Box className="form-container">
        {/* Custom Stepper */}
        <div className="stepper-container">
          {steps.map((label, index) => (
            <div key={index} className="step">
              {/* Step indicator */}
              <div
                className={`step-indicator ${
                  step >= index ? "step-active" : "step-inactive"
                }`}
              >
                {index + 1}
              </div>
              {/* Step label */}
              <Text
                className="step-label"
                fontWeight={step === index ? "bold" : "normal"}
              >
                {label}
              </Text>
              {/* Divider between steps */}
            </div>
          ))}
        </div>

        {/* Render forms based on the current step */}
        {step === 0 && (
          <Form1 companyName={companyName} setCompanyName={setCompanyName} />
        )}
        {step === 1 && (
          <Form2 onNext={handleNextStep} onYearSelect={handleYearsSelection} />
        )}
        {step === 2 && (
          <Form3 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 3 && (
          <Form4 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 4 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 5 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 6 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 7 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 8 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 9 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}
        {step === 10 && (
          <Form5 companyName={companyName} selectedYears={selectedYears} />
        )}

        {/* Navigation Buttons */}
        <ButtonGroup className="button-group">
          <Flex w="100%" justifyContent="space-between">
            <Flex>
              <Button
                className="button-back"
                onClick={handlePrevStep}
                isDisabled={step === 0}
                colorScheme="teal"
              >
                Back
              </Button>
              {step < steps.length - 1 && (
                <Button
                  className="button-next"
                  onClick={handleNextStep}
                  colorScheme="teal"
                >
                  Next
                </Button>
              )}
            </Flex>

            {/* Submit button for the final step */}
            {step === steps.length - 1 && (
              <Button
                className="button-submit"
                colorScheme="red"
                onClick={() =>
                  toast({
                    title: "Data Submitted!",
                    description: `Thank you for your submission, ${companyName}.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  })
                }
              >
                Submit
              </Button>
            )}
          </Flex>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default DataInputForm;

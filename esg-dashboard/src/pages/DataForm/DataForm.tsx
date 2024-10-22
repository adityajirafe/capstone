import React, { useState } from "react";
import { Progress, Box, ButtonGroup, Button, Flex } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import "./dataform.css";
import Form1 from "./Form1";
import Form2 from "./Form2";
import Form3 from "./Form3";

const DataInputForm = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33.33);
  const [companyName, setCompanyName] = useState(""); // Manage company name state
  const [selectedYears, setSelectedYears] = useState([]); // Store selected years

  const handleNextStep = () => {
    setStep(step + 1);
    setProgress(progress + 33.33);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setProgress(progress - 33.33);
  };

  const handleYearsSelection = (years) => {
    setSelectedYears(years);
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <Progress hasStripe value={progress} mb="5%" mx="5%" isAnimated />

        {step === 1 && (
          <Form1 companyName={companyName} setCompanyName={setCompanyName} />
        )}
        {step === 2 && (
          <Form2 onNext={handleNextStep} onYearSelect={handleYearsSelection} />
        )}
        {step === 3 && (
          <Form3 companyName={companyName} selectedYears={selectedYears} />
        )}

        <ButtonGroup mt="5%" w="100%">
          <Flex w="100%" justifyContent="space-between">
            <Flex>
              <Button
                onClick={handlePrevStep}
                isDisabled={step === 1}
                colorScheme="teal"
                w="7rem"
                mr="5%"
              >
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                isDisabled={step === 3}
                colorScheme="teal"
                w="7rem"
              >
                Next
              </Button>
            </Flex>
            {step === 3 && (
              <Button
                w="7rem"
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

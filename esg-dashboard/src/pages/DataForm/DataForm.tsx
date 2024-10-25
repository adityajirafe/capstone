import React, { useState } from "react";
import {
  ButtonGroup,
  Button,
  Flex,
  Text,
  useToast,
  Box,
} from "@chakra-ui/react";
import { saveAs } from "file-saver"; // For CSV download
import Papa from "papaparse"; // For CSV generation
import "./dataform.css";
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
  // "Waste Management",
  // "Biodiversity Impacts",
  // "Human Rights",
  // "Community/Labor Relations",
  // "Workforce Health and Safety",
  // "Activity Metrics",
];

const DataInputForm = () => {
  const toast = useToast();
  const [step, setStep] = useState(0); // Step state (starts from 0)
  const [companyName, setCompanyName] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [formData, setFormData] = useState([]); // Collect form data across all steps

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleYearsSelection = (years) => {
    setSelectedYears(years);
  };

  // Collect data only if new data is provided, avoiding duplicates
  const handleFormData = (newData) => {
    setFormData((prevData) => {
      const updatedData = [...prevData];
      newData.forEach((item) => {
        const exists = prevData.some(
          (data) =>
            data.indicator === item.indicator &&
            data.sub_category === item.sub_category &&
            data.year === item.year
        );
        if (!exists) updatedData.push(item);
      });
      return updatedData;
    });
  };

  // Generate CSV when the form is submitted
  const generateCSV = () => {
    // Filter out rows where the value is empty or null
    const filteredData = formData.filter((row) => row.value);

    const csvData = filteredData.map((row) => ({
      indicator: row.indicator,
      indicator_name: row.indicator_name,
      unit: row.unit,
      sub_category: row.sub_category,
      year: row.year,
      value: row.value,
      company: companyName,
    }));

    const csv = Papa.unparse(csvData); // Convert to CSV format
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${companyName}_ESG_data.csv`); // Download CSV file
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
          <Form3
            companyName={companyName}
            selectedYears={selectedYears}
            handleFormData={handleFormData}
          />
        )}
        {step === 3 && (
          <Form4
            companyName={companyName}
            selectedYears={selectedYears}
            handleFormData={handleFormData}
          />
        )}
        {step === 4 && (
          <Form5
            companyName={companyName}
            selectedYears={selectedYears}
            handleFormData={handleFormData}
          />
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
                onClick={() => {
                  generateCSV(); // Generate and download CSV
                  toast({
                    title: "Data Submitted!",
                    description: `Thank you for your submission, ${companyName}.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
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

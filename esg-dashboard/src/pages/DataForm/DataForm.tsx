import React, { useCallback, useState } from "react";
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
import Stepper from "../../components/Stepper";
import Form1 from "./Form1";
import Form2 from "./Form2";
import Form3 from "./Form3";
import Form4 from "./Form4";
import Form5 from "./Form5";
import Initiation from "../DataEntry/Initiation";
import DataEntryButtons from "../../components/DataEntryButtons";

// const steps = [
//   "Company Info",
//   "Select Years",
//   "Air Quality",
//   "Energy Management",
//   "Water Management",
//   // "Waste Management",
//   // "Biodiversity Impacts",
//   // "Human Rights",
//   // "Community/Labor Relations",
//   // "Workforce Health and Safety",
//   // "Activity Metrics",
// ];
const steps = [
  { title: "Company Info", description: "Enter your company details" },
  { title: "Select Years", description: "Pick applicable years" },
  { title: "Air Quality", description: "Provide air quality data" },
  { title: "Energy Management", description: "Enter energy details" },
  { title: "Water Management", description: "Water usage and sources" },
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

  const handleSubmit = () => {}

  const handleYearsSelection = (years) => {
    setSelectedYears(years);
  };

  // Collect data only if new data is provided, avoiding duplicates
  const handleFormData = useCallback((newData) => {
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
  }, []);

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
        <Stepper steps={steps} currentStep={step} />

        {/* Render forms based on the current step */}
        {step === 0 && (
          <Initiation />
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
        <DataEntryButtons handlePrevStep={handlePrevStep} handleNextStep={handleNextStep} handleSubmit={handleSubmit} step={step} numStages={steps.length - 1} nextDisabled={false} />
      </Box>
    </>
  );
};

export default DataInputForm;

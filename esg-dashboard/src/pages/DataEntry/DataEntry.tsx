import './DataEntry.css'
import { useState } from "react";
import { Button, Flex, Box, useToast, Text } from "@chakra-ui/react";
import Stepper from '../../components/Stepper';
// import { motion } from "framer-motion";
// import { saveAs } from "file-saver";
// import Papa from "papaparse";
// import Form1 from "./Form1";
// import Form2 from "./Form2";
// import Form3 from "./Form3";
// import Form4 from "./Form4";
// import Form5 from "./Form5";
import Initiation from './Initiation';
import DataEntryButtons from '../../components/DataEntryButtons';
import Scraper from './Scraper';
import { FileUploadStatus, InitiationMethod } from '../../constants/types';

const steps = [
    { title: "Start", description: "Choose Automatic or Manual Entry" },
    { title: "Upload", description: "Upload Sustainability Report" },
    { title: "Company Info", description: "Enter your company details" },
    { title: "Select Years", description: "Pick applicable years" },
    { title: "Air Quality", description: "Provide air quality data" },
    { title: "Energy Management", description: "Enter energy details" },
    { title: "Water Management", description: "Water usage and sources" },
    { title: "Company Info", description: "Enter your company details" },
    { title: "Select Years", description: "Pick applicable years" },
    { title: "Air Quality", description: "Provide air quality data" },
    { title: "Energy Management", description: "Enter energy details" },
    { title: "Water Management", description: "Water usage and sources" },
];

const DataEntry = () => {
  const toast = useToast();
  const [step, setStep] = useState(0);

  // initiation
  const [inputMethod, setInputMethod] = useState(0)

  // scraper
  const [companyName, setCompanyName] = useState("");
  const [scraperStatus, setScraperStatus] = useState<FileUploadStatus>("In Progress");

  const [formData, setFormData] = useState({});
  const [selectedYears, setSelectedYears] = useState([]);

  const incrementStep = () => setStep((prev) => prev + 1)
  const handleNextStep = () => {
    if (inputMethod == InitiationMethod.manual && step == 0) {
        incrementStep()
    }
    incrementStep()
  }

  const decrementStep = () => setStep((prev) => prev - 1)
  const handlePrevStep = () => {
    if (inputMethod == InitiationMethod.manual && step == 2) {
        decrementStep()
    }
    decrementStep()
  }

  const handleSubmit = () => {}

  const handleYearsSelection = (years) => {
    setSelectedYears(years);
  };

  const handleFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const generateCSV = () => {
    const csv = Papa.unparse(Object.values(formData));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${companyName}_ESG_data.csv`);
  };

  const nextButtonDisabled = () => {
    if (step == 0) {
        return !inputMethod;
    }
    if (step == 1) {
        return scraperStatus !== "Completed";
    }
    return false;
  }

  return (
    <div className='data-entry-main'>
        {step == 0 && (
            <Initiation inputMethod={inputMethod} setInputMethod={setInputMethod} />
        )}
        {step == 1 && (
            <Scraper scraperStatus={scraperStatus} setScraperStatus={setScraperStatus} />
        )}
        {step > 1 && (
            <Box className='data-form-section'>
                <Box className='data-form-container' bg="lightGrey">

                </Box>
                <Stepper steps={steps} currentStep={step} />
            </Box>
        )}
        <DataEntryButtons 
            handlePrevStep={handlePrevStep} 
            handleNextStep={handleNextStep} 
            handleSubmit={handleSubmit} 
            step={step} 
            numStages={steps.length - 1}
            nextDisabled={nextButtonDisabled()}
        />
    </div>
  );
};

export default DataEntry;

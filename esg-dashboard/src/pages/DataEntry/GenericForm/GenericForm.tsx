import React, { useEffect, useState } from 'react';
import "./GenericForm.css";
import "../DataEntry.css";
import {
  Box,
  FormControl,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useColorMode,
  Flex,
} from "@chakra-ui/react";
import CloudUpload from '../../../assets/CloudUpload.svg?react';
import Write from '../../../assets/Write.svg?react';
import { InitiationMethod, CustomFormData, Step } from "../../../constants/types";

interface GenericFormProps {
  selectedYears: string[];
  inputMethod: InitiationMethod;
  companyName: string;
  formData: CustomFormData;
  step: number;
  steps: Step[];
  handleFormData: (data: CustomFormData) => void;
}

const GenericForm = (props: GenericFormProps) => {
  const { selectedYears, inputMethod, companyName, formData, step, steps, handleFormData } = props;
  const { colorMode } = useColorMode();

  const currentCategory = steps[step].title;
  const firstYear = selectedYears[0]; // Get the first year to retrieve metrics
  const [tableMaxHeight, setTableMaxHeight] = useState<string | number>(''); // State for table height

  useEffect(() => {
    const computeTableMaxHeight = () => {
      const offset = 388; // Adjust this value as needed
      const height = window.innerHeight - offset; // Calculate height
      setTableMaxHeight(height); // Set the computed height
    };

    computeTableMaxHeight(); // Initial call
    window.addEventListener('resize', computeTableMaxHeight); // Update on window resize

    return () => {
      window.removeEventListener('resize', computeTableMaxHeight); // Cleanup on component unmount
    };
  }, []); // Empty dependency array to run once on mount

  const handleValueChange = (category: string, year: string, subcategory: string, value: string) => {
    const updatedFormData = { ...formData };
    if (updatedFormData[category] && updatedFormData[category][year]) {
      const targetMetric = updatedFormData[category][year].find(
        (item) => item.subcategory === subcategory
      );
      if (targetMetric) {
        targetMetric.value = value; // Update the value for the specific metric
        handleFormData(updatedFormData); // Call the provided handler to update the form data
      }
    }
  };

  return (
    <Box className="form-page">
      <div className="form-container">
        <div className="form-title-container">
          <Box className="form-logo-container" bg="monochrome">
            {inputMethod === InitiationMethod.auto ? (
              <CloudUpload className={`form-icon-${colorMode}`} />
            ) : (
              <Write className={`form-icon-${colorMode}`} />
            )}
          </Box>
          <div className="form-text-container">
            <Text fontSize={24} fontWeight={500}>{companyName}</Text>
            <Text fontSize={20} fontWeight={500} color="primary">Select the respective years for ESG Reporting</Text>
          </div>
        </div>
        <Box className="data-form-section" maxHeight={tableMaxHeight} px="20px">
          <Table variant="simple" width="100%" display="block" overflowY="auto">
            <Thead>
              <Tr>
                <Th width="25%" textAlign="left">Metric</Th> {/* Make first column wider */}
                <Th width="10%">Unit</Th> {/* Set widths for other columns */}
                {selectedYears.map((year) => (
                  <Th key={year} width="10%">{year}</Th> // Set widths for year columns
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {formData[currentCategory] && Object.entries(formData[currentCategory][firstYear] || {}).map(([_, metric]) => {
                // Map over metrics from the first year
                return (
                  <Tr key={metric.subcategory}>
                    <Td>
                      <Flex flexDirection="column">
                        <Text fontSize={14}>{metric.subcategory}</Text>
                        <Text color="primary" fontSize={11}>{metric.sasb_indicator}</Text>
                      </Flex>
                    </Td>
                    <Td fontSize={14}>{metric.unit}</Td>
                    {selectedYears.map((year) => {
                      // Retrieve the value corresponding to the current year and subcategory
                      const targetMetric = formData[currentCategory][year]?.find(
                        (item) => item.subcategory === metric.subcategory
                      );
                      return (
                        <Td key={year}>
                          <FormControl>
                            <Input
                              type="text"
                              fontSize={14}
                              value={targetMetric?.value || ""}
                              onChange={(e) => handleValueChange(currentCategory, year, metric.subcategory, e.target.value)}
                            />
                          </FormControl>
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </div>
    </Box>
  );
};

export default GenericForm;

import "./YearSelect.css";
import "../DataEntry.css";
import { Box, Checkbox, CheckboxGroup, Flex, FormControl, Text, useColorMode } from "@chakra-ui/react";
import CloudUpload from '../../../assets/CloudUpload.svg?react'
import Write from '../../../assets/Write.svg?react'
import { InitiationMethod } from "../../../constants/types";

interface InitiationProps {
  selectedYears: string[];
  setSelectedYears: (years: string[]) => void;
  inputMethod: InitiationMethod
  companyName: string
}

const YearSelect = (props: InitiationProps) => {
  const { selectedYears, setSelectedYears, inputMethod, companyName } = props;
  const { colorMode } = useColorMode();
  //console.log(selectedYears);
  return (
    <Box className="form-page">
      <div className='form-container'>
          <div className='form-title-container'>
              <Box className="form-logo-container" bg="monochrome">
                {inputMethod == InitiationMethod.auto ? (
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
          <Box className='data-form-section'>
            <Box className='data-form-container' bg="lightGrey">
              <FormControl height="100%">
                <CheckboxGroup onChange={setSelectedYears} value={selectedYears}>
                  <Flex wrap="wrap" gap={32} p={4} justifyContent="center" alignItems="center" height="100%">
                    {[2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
                      <Checkbox
                        key={year}
                        value={year.toString()}
                        mb={4}
                        size="lg"
                        colorScheme="teal"
                        sx={{ transform: 'scale(1.7)' }} // Custom scaling for larger size
                      >
                        <Text fontSize="16px" fontWeight="500">{year}</Text>
                      </Checkbox>
                    ))}
                  </Flex>
                </CheckboxGroup>
              </FormControl>
            </Box>
          </Box>
      </div>
    </Box>
);
};

export default YearSelect;

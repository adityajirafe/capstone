import React, { useState, useEffect } from "react";
import {
  Heading,
  CheckboxGroup,
  Checkbox,
  FormControl,
  Grid,
} from "@chakra-ui/react";

const Form2 = ({ onYearSelect }) => {
  const [selectedYears, setSelectedYears] = useState([]);

  const handleYearChange = (values) => {
    setSelectedYears(values);
    onYearSelect(values); // Pass the selected years to the parent component
  };

  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Select the respective years for ESG Reporting
      </Heading>
      <Grid templateColumns="1fr" gap={4}>
        <FormControl>
          <CheckboxGroup onChange={handleYearChange} value={selectedYears}>
            {[2017, 2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
              <Checkbox key={year} value={year.toString()} mb={2}>
                {year}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FormControl>
      </Grid>
    </>
  );
};

export default Form2;

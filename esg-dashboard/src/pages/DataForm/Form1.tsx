import React, { useState } from "react";
import { Heading, FormControl, FormLabel, Input } from "@chakra-ui/react";

const Form1 = ({ companyName, setCompanyName }) => {
  const handleInputChange = (e) => {
    setCompanyName(e.target.value); // Update parent state
  };

  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Company Information
      </Heading>
      <FormControl>
        <FormLabel htmlFor="companyName">Company Name</FormLabel>
        <Input
          id="companyName"
          type="text"
          placeholder="Enter your company name"
          value={companyName}
          onChange={handleInputChange} // Update the company name in the parent component
        />
      </FormControl>
    </>
  );
};

export default Form1;

import { Box, Heading } from "@chakra-ui/react";
import "./dataform.css";

const Form1 = () => {
  return (
    <Box className="container">
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        How would you like to enter your ESG data?
      </Heading>
      <Box className="options">
        <Box className="option">
          <Box className="icon" />
          <Box className="option-text">
            <Box className="option-title">Manual Entry</Box>
            <Box className="option-description">
              Fill up a pre-configured ESG reporting template
            </Box>
          </Box>
        </Box>
        <Box className="option">
          <Box className="icon" />
          <Box className="option-text">
            <Box className="option-title">Upload files</Box>
            <Box className="option-description">
              Select and upload files of your choice
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Form1;

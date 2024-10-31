import "./Initiation.css";
import "../DataEntry.css";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import { useSupabase } from "../../../hooks/useSupabase";
import CloudUpload from '../../../assets/CloudUpload.svg?react'
import Write from '../../../assets/Write.svg?react'

enum InitiationMethod {'none', 'auto', 'manual'}

interface InitiationProps {
  inputMethod: InitiationMethod;
  setInputMethod: (method: InitiationMethod) => void;
}

const Initiation = (props: InitiationProps) => {
  const { inputMethod, setInputMethod } = props;
  const { colorMode } = useColorMode();
  const { session } = useSupabase();

  const user = session?.user.user_metadata.name 

  const onSelectMethod = (method: InitiationMethod) => {
    console.log(method)
    setInputMethod(method);
  }

  return (
    <Box className="form-page">
      <div className="initiation-title-container">
        <Text className="initiation-title">Welcome Back, {user}!</Text>
        <Text className="initiation-title">How would you like to enter your ESG Data?</Text>
      </div>
      <div className="initiation-options-container">
        <Box 
          className={`initiation-option ${inputMethod == InitiationMethod.manual && "initiation-option-active"}`}
          _hover={{bg: "secondary"}}
          onClick={() => onSelectMethod(InitiationMethod.manual)}
        >
          <Box className="initiation-logo-container" bg="monochrome">
            <Write className={`initiation-write-${colorMode}`} />
          </Box>
          <div className="initiation-options-text-container">
            <Text fontSize={24} fontWeight={500}> Manual Entry</Text>
            <Text fontSize={20} fontWeight={500} color="primary">Fill up a pre-configured ESG reporting template</Text>
          </div>
        </Box>
        <Box 
          className={`initiation-option ${inputMethod == InitiationMethod.auto && "initiation-option-active"}`}
          _hover={{bg: "secondary"}} 
          onClick={() => onSelectMethod(InitiationMethod.auto)}
          >
          <Box className="initiation-logo-container" bg="monochrome">
            <CloudUpload className={`initiation-cloud-${colorMode}`} />
          </Box>
          <div className="initiation-options-text-container">
            <Text fontSize={24} fontWeight={500}>Upload File</Text>
            <Text fontSize={20} fontWeight={500} color="primary">Select and upload files of your choice</Text>
          </div>
        </Box>
      </div>
    </Box>
  );
};

export default Initiation;

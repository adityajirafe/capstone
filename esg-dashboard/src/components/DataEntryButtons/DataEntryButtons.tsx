import "./DataEntryButtons.css";
import { Box, Button, Text, useColorMode } from "@chakra-ui/react";
import DoubleArrowLeft from '../../assets/DoubleArrowLeft.svg?react'
import DoubleArrowRight from '../../assets/DoubleArrowRight.svg?react'

interface DataEntryButtonsProps {
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleSubmit: () => void;
  step: number;
  numStages: number;
  nextDisabled: boolean;
}

interface DataEntryButtonProps {
  onClick:  () => void;
  isDisabled?: boolean;
  rightFacing: boolean;
  buttonText: string;
}

const DataEntryButton = (props: DataEntryButtonProps) => {
  const { onClick, isDisabled, rightFacing, buttonText } = props;
  const { colorMode } = useColorMode();

  return (
    <Box 
      className={`data-entry-button-${rightFacing ? "right" : "left"} ${!rightFacing && "left-button"}`}
      bg="secondary"
    >
      <Button onClick={onClick} bg="primary" color="monochrome" p="20px" isDisabled={isDisabled}>
          {!rightFacing && <DoubleArrowLeft className={`data-entry-button-arrow-${colorMode}`} />}
          <Text>{buttonText}</Text>
          {rightFacing && <DoubleArrowRight className={`data-entry-button-arrow-${colorMode}`} />}
      </Button>
    </Box>
  )
}

const DataEntryButtons = (props: DataEntryButtonsProps) => {
  const { handlePrevStep, handleNextStep, handleSubmit, step, numStages, nextDisabled } = props;

  return (
    <Box className="data-entry-buttons-container">
      {step > 0 && (
        <DataEntryButton onClick={handlePrevStep} rightFacing={false} buttonText="Back" />
      )}
      {step < numStages ? (
        <DataEntryButton onClick={handleNextStep} isDisabled={nextDisabled} rightFacing buttonText="Next" />
      ) : (
        <DataEntryButton onClick={handleSubmit} rightFacing buttonText="Submit" />
      )}
    </Box>
  );
};

export default DataEntryButtons;

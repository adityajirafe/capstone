import { Box, FormLabel, Input, useColorMode } from "@chakra-ui/react";
import Moon from '../../assets/Moon.svg?react';
import Sun from '../../assets/Sun.svg?react';

const ToggleDarkMode: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <FormLabel
      htmlFor="theme-switcher"
      as="label"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      position="relative"
      w="48px"
      h="24px"
      cursor="pointer"
      margin="0px"
    >
      <Input
        id="theme-switcher"
        type="checkbox"
        checked={colorMode === 'light'}
        onChange={toggleColorMode}
        display="none"
      />
      <Box
        as="span"
        w="48px"
        h="24px"
        backgroundColor="accent"
        borderRadius="full"
        position="relative"
        transition="background-color 0.2s ease-in-out"
      />

      {/* Icon that moves */}
      <Box
        position="absolute"
        top="0px"
        left="0px"
        w="24px"
        h="24px"
        bg="white"
        borderRadius="full"
        transform={`translateX(${colorMode === 'light' ? '0' : '24px'})`}
        transition="transform 0.2s ease-in-out"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {colorMode === 'light' ? (
          <Sun width="18px" height="18px" />
        ) : (
          <Moon width="18px" height="18px" />
        )}
      </Box>
    </FormLabel>
  );
};

export default ToggleDarkMode;

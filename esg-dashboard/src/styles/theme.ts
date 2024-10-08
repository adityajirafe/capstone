import { extendTheme, StyleFunctionProps, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",  // You can set this to "dark" if you want dark mode by default
  useSystemColorMode: false,  // Enable this if you want the system's preference
};

const colors = {
  primary: {
    default: "#18526D",
    _dark: "#92CCE7",
  },
  secondary: {
    default: "#18526D",
    _dark: "#92CCE7",
  },
  accent: {
    default: "#18526D",
    _dark: "#92CCE7",
  },
  background: {
    default: "#FBFBFE",
    _dark: "#010104",
  },
  text: {
    default: "#16191D",
    _dark: "#E2E5E9",
  },
};

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: colors
  },
  colors: colors,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === "dark" ? "background._dark" : "background.default",
        color: props.colorMode === "dark" ? "text._dark" : "text.default",
      },
    }),
  },
});

export default theme;

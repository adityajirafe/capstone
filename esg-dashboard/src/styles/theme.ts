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
    default: "#B6EDED",
    _dark: "#124949",
  },
  accent: {
    default: "#1F605E",
    _dark: "#9FE0DE",
  },
  headerBackground: {
    default: "#E1E1E4",
    _dark: "#010104",
  },
  background: {
    default: "#FBFBFE",
    _dark: "#181818",
  },
  text: {
    default: "#16191D",
    _dark: "#E2E5E9",
  },
  monochrome: {
    default: "#FFFFFF",
    _dark: "#000000"
  },
  lightGrey: {
    default: "#EEF1F7",
    _dark: "#EEF1F7"
  },
  neutralGrey: {
    default: "#CBD0DC",
    _dark: "#CBD0DC"
  }
};

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: colors
  },
  colors: colors,
  styles: {
    global: (props: StyleFunctionProps) => ({
      header: {
        bg: props.colorMode === "dark" ? "headerBackground._dark" : "headerBackground.default",
      },
      body: {
        bg: props.colorMode === "dark" ? "background._dark" : "background.default",
        color: props.colorMode === "dark" ? "text._dark" : "text.default",
      },
      a: {
        color: props.colorMode === "dark" ? "text._dark" : "text.default",
        _hover: {
          textDecoration: 'underline',
          cursor: 'pointer',
        },
        "&.active": {
          color: props.colorMode === "dark" ? "accent._dark" : "accent.default",
        },
      },
    }),
  },
});

export default theme;

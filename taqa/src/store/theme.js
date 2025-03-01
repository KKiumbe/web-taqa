import { createTheme } from "@mui/material/styles";
import { useThemeStore } from "./authStore";

// Theme tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        primary: { 400: "#1E1E1E", 600: "#121212" },
        grey: { 100: "#ffffff", 300: "#b0b0b0", 500: "#8a8a8a" },
        greenAccent: { 500: "#4caf50", 700: "#388e3c" },
        blueAccent: { 500: "#1976d2", 700: "#1565c0" },
        redAccent: { 500: "#d32f2f", 700: "#c62828" },
      }
    : {
        primary: { 400: "#e0e0e0", 600: "#f5f5f5" }, // Softer bright color
        grey: { 100: "#222222", 300: "#666666", 500: "#999999" }, // Darker grey tones for contrast
        greenAccent: { 500: "#388e3c", 700: "#2e7d32" },
        blueAccent: { 500: "#1e88e5", 700: "#1976d2" },
        redAccent: { 500: "#e53935", 700: "#d32f2f" },
      }),
});

// Function to generate theme based on mode
export const getTheme = () => {
  const { darkMode } = useThemeStore.getState(); // Get dark mode state
  const mode = darkMode ? "dark" : "light";
  const colors = tokens(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary[400],
      },
      grey: {
        100: colors.grey[100],
        300: colors.grey[300],
        500: colors.grey[500],
      },
      greenAccent: {
        main: colors.greenAccent[500],
        dark: colors.greenAccent[700],
      },
      blueAccent: {
        main: colors.blueAccent[500],
        dark: colors.blueAccent[700],
      },
      redAccent: {
        main: colors.redAccent[500],
        dark: colors.redAccent[700],
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
    },
  });
};

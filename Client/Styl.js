import { StyleSheet } from "react-native";
export const primaryColor = "#77A0F2";
export const darkColor = "#000";
export const lightColor = "#fff";
export const lightTextColor = "#ddd";
export const darkTextColor = "#333";

const Styl = StyleSheet.create({
  darkSimpleStyle: {
    backgroundColor: darkColor,
    color: lightTextColor,
  },
  lightSimpleStyle: {
    backgroundColor: lightColor,
    color: darkTextColor,
  },
  darkText: {
    color: darkTextColor,
  },
  lightText: {
    color: lightTextColor,
  },
  darkSimpleStyle2: {
    backgroundColor: "#222",
    color: lightTextColor,
  },
  darkSimpleStyle3: {
    backgroundColor: "#111",
    color: lightTextColor,
  },
  darkBg: {
    backgroundColor: darkColor,
  },
  lightBg: {
    backgroundColor: lightColor,
  },
});

export default Styl;

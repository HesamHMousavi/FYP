import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl from "../../Styl";
import React, { useContext } from "react";

const AuthButton = ({ btnText, onPress, Primary = true }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isDarkMode ? { backgroundColor: "#ddd" } : { backgroundColor: "#111" },
        !Primary && styles.secondBtn,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.btnText,
          isDarkMode
            ? Primary
              ? [styles.btnPrimaryTextLight]
              : [Styl.btnPrimaryTextLight]
            : Primary
            ? [styles.btnPrimaryTextDrak]
            : [styles.btnSecondTextLight],
        ]}
      >
        {btnText}
      </Text>
    </TouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  secondBtn: {
    backgroundColor: "transparent",
    borderColor: "#999",
    borderWidth: 1,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
  },
  btnPrimaryTextLight: {
    backgroundColor: "#ddd",
    color: "#333",
  },
  btnPrimaryTextDrak: {
    backgroundColor: "#111",
    color: "#fff",
  },
  btnSecondTextLight: {
    backgroundColor: "transparent",
    color: "#333",
  },
});

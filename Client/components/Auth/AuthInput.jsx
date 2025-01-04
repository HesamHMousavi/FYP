import { StyleSheet, TextInput } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import React, { useContext } from "react";

const AuthInput = ({
  type,
  placeHolder,
  onChange,
  secureTextEntry = false,
  autoCorrect = false,
  value = "",
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <TextInput
      style={[
        styles.input,
        isDarkMode
          ? { backgroundColor: "#222", color: "#ddd" }
          : { backgroundColor: "#f0f0f0", color: "#333" },
      ]}
      placeholder={placeHolder}
      placeholderTextColor="#999"
      keyboardType={type}
      autoCapitalize="none"
      autoCorrect={autoCorrect}
      secureTextEntry={secureTextEntry}
      onChangeText={onChange}
      value={value}
    />
  );
};

export default AuthInput;

const styles = StyleSheet.create({
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
});

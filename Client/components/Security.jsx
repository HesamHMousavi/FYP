import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../context/Theme/ThemeContext";
import Styl from "../Styl";

const KeyStorageOptions = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedOption, setSelectedOption] = useState("device"); // Default selection

  const options = [
    {
      key: "device",
      title: "Store on Device",
      description: "The private key will be securely stored on your device.",
    },
    {
      key: "database",
      title: "Store in Database",
      description: "The private key will be securely stored in the database.",
    },
  ];

  const handleSelection = (key) => {
    setSelectedOption(key);
  };

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
      ]}
    >
      <Text
        style={[
          styles.title,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        Key Storage Options
      </Text>
      {options.map((option) => (
        <TouchableOpacity
          activeOpacity={1}
          key={option.key}
          style={[
            styles.optionContainer,
            isDarkMode ? { borderColor: "#444" } : { borderColor: "#ddd" },
            selectedOption === option.key && styles.selectedOption,
            isDarkMode ? Styl.darkSimpleStyle3 : "#f9f9f9",
          ]}
          onPress={() => handleSelection(option.key)}
        >
          <View style={styles.radioCircle}>
            {selectedOption === option.key && (
              <View style={styles.selectedCircle} />
            )}
          </View>
          <View
            style={[
              styles.optionTextContainer,
              isDarkMode ? Styl.darkSimpleStyle3 : "#f9f9f9",
            ]}
          >
            <Text
              style={[
                styles.optionTitle,
                isDarkMode ? Styl.darkSimpleStyle3 : "#f9f9f9",
              ]}
            >
              {[option.title]}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                isDarkMode ? Styl.darkSimpleStyle3 : "#f9f9f9",
              ]}
            >
              {option.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedOption: {
    borderColor: "#77A0F2",
    // backgroundColor: "#77A0F2",
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#77A0F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  selectedCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#77A0F2",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  optionDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});

export default KeyStorageOptions;

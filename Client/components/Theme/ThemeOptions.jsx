import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl from "../../Styl";

const ThemeSelectionPage = () => {
  const { isDarkMode, changeTheme } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState("system");
  const getTheme = async () => {
    const id = await SecureStore.getItemAsync("theme");
    let value = "";
    if (id === "1") value = "system";
    else if (id === "2") value = "light";
    else if (id === "3") value = "dark";
    setSelectedTheme(value);
  };

  useEffect(() => {
    getTheme();
  });

  const onChangeTheme = (theme) => {
    setSelectedTheme(theme.value);
    changeTheme(theme.id);
  };

  const themes = [
    {
      label: "Match System",
      value: "system",
      description: "The app will match your device appearance settings.",
      id: "1",
    },
    {
      label: "Always Light",
      value: "light",
      description: "The app will always use a light theme.",
      id: "2",
    },
    {
      label: "Always Dark",
      value: "dark",
      description: "The app will always use a dark theme.",
      id: "3",
    },
  ];

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
        App Appearance
      </Text>
      {themes.map((theme) => (
        <ThemeOption
          key={theme.value}
          label={theme.label}
          value={theme.value}
          description={theme.description}
          selectedValue={selectedTheme}
          onPress={() => onChangeTheme(theme)}
        />
      ))}
    </View>
  );
};

const ThemeOption = ({ label, value, description, selectedValue, onPress }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.optionContainer,
        isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
      ]}
      onPress={onPress}
    >
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.optionText,
            selectedValue === value && styles.selectedText,
            isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={styles.radioButton}>
        {selectedValue === value ? (
          <MaterialIcons
            name="radio-button-checked"
            size={24}
            color="#0a84ff"
          />
        ) : (
          <MaterialIcons name="radio-button-unchecked" size={24} color="gray" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 18,
    color: "#444",
  },
  selectedText: {
    color: "#0a84ff", // Highlight selected text in blue
  },
  optionDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  radioButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ThemeSelectionPage;

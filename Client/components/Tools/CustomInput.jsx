import Styl from "../../Styl";
import React, { useContext } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const CustomInput = ({ onChange, value, placeholder, style = [] }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <View
      style={[
        styles.searchBarContainer,
        isDarkMode ? Styl.darkSimpleStyle2 : { backgroundColor: "#eee" },
        ...style,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color="#aaa"
        style={[styles.searchIcon]}
      />
      <TextInput
        style={[
          styles.searchBar,
          isDarkMode ? Styl.darkSimpleStyle2 : { backgroundColor: "#eee" },
        ]}
        // autoCapitalize="words"
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  searchBarContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 5,
    height: 35,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  searchIcon: {
    marginLeft: 5,
  },
});

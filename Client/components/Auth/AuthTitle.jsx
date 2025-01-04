import { StyleSheet, Text, View } from "react-native";
import Styl from "../../Styl";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import React, { useContext } from "react";

const AuthTitle = ({ title }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <View style={[styles.titleContainer]}>
      <Text
        style={[
          styles.title,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

export default AuthTitle;

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    color: "#000",
  },
});

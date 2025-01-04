import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl, { darkColor, lightColor } from "../../Styl";

const LoadingSpinner = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <View style={styles.container}>
      <View style={[styles.overlay, isDarkMode ? Styl.darkBg : Styl.lightBg]}>
        <ActivityIndicator
          size='large'
          color={isDarkMode ? lightColor : darkColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
  },
});

export default LoadingSpinner;

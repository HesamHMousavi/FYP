import { StyleSheet, Text, Animated } from "react-native";
import { AlertContext } from "../context/Alert/AlertState";
import React, { useContext, useRef } from "react";

const Alert = () => {
  const { Alert, RemoveAlert } = useContext(AlertContext);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity value
  // Function to show error message
  if (Alert) {
    fadeAnim.setValue(1); // Set the opacity to 1 (fully visible)
    // Show the error message for 3 seconds, then start fade-out animation
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out to 0 (invisible)
        duration: 1000, // Duration of the fade-out animation
        useNativeDriver: true,
      }).start(() => {
        RemoveAlert(); // Clear the error message after fading out
      });
    }, 3000);
  }
  return (
    <>
      {Alert && (
        <Animated.View
          style={[
            Alert.type === "error"
              ? styles.bgColorErr
              : Alert.type === "success"
              ? styles.bgColorSuc
              : styles.bgColorWar,
            styles.errorContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Text
            style={[
              styles.errorText,
              Alert.type === "error"
                ? styles.errColor
                : Alert.type === "success"
                ? styles.sucColor
                : styles.warColor,
            ]}
          >
            {Alert.message}
          </Text>
        </Animated.View>
      )}
    </>
  );
};

export default Alert;

const styles = StyleSheet.create({
  errorContainer: {
    position: "absolute",
    left: 75,
    top: 110,
    width: 250,
    marginVertical: 0,
    marginHorizontal: "auto",
    padding: 10,
    borderRadius: 10,
    zIndex: 10001,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },

  bgColorErr: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
  },
  bgColorSuc: {
    backgroundColor: "rgba(0, 255, 0, 0.2)",
  },
  bgColorWar: {
    backgroundColor: "#fdb750",
    backgroundColor: "rgba(253, 183, 80, 0.9)",
  },
  errColor: {
    color: "red",
  },
  sucColor: {
    color: "green",
  },
  warColor: {
    color: "#010100",
  },
});

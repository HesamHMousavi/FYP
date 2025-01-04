import React, { useRef, useEffect, useContext } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Image,
  PanResponder,
} from "react-native";
import { BlurView } from "expo-blur";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { AlertContext } from "../../context/Alert/AlertState";

const AlertNotify = () => {
  const { Alert, RemoveAlert } = useContext(AlertContext);
  const { isDarkMode } = useContext(ThemeContext);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen
  const initialPosition = 55; // The original position of the notification

  // PanResponder to handle swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only activate if the swipe is vertical
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderGrant: () => {
        // When the swipe starts, stop the current animation
        slideAnim.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Move the notification based on the swipe gesture
        const newY = gestureState.dy + initialPosition;
        slideAnim.setValue(newY); // Adjust value as needed
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Check if the user swiped far enough to dismiss the notification
        if (gestureState.dy < -15) {
          // If swiped up sufficiently, slide it off-screen
          Animated.timing(slideAnim, {
            toValue: -100, // Slide off-screen
            duration: 350,
            useNativeDriver: true,
          }).start();
        } else {
          // Otherwise, reset to the original position
          Animated.timing(slideAnim, {
            toValue: initialPosition,
            duration: 350,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    // Slide down to the original position
    Animated.timing(slideAnim, {
      toValue: initialPosition, // Slide to the top of the screen
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Slide up after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100, // Slide back up off-screen
        duration: 350,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        RemoveAlert();
      }, 400);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [slideAnim, Alert]);
  return (
    Alert && (
      <Animated.View
        {...panResponder.panHandlers} // Attach pan handlers
        style={[
          styles.notification,
          !isDarkMode ? styles.lighblur : styles.darkblur,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <BlurView
          style={[
            styles.blurView,
            Alert?.type === "error"
              ? styles.bgColorErr
              : Alert?.type === "success"
              ? styles.bgColorSuc
              : styles.bgColorWar,
          ]}
          intensity={30}
        >
          <View style={[styles.row, styles.width100]}>
            <Text
              style={[
                styles.text,
                isDarkMode ? { color: "#aaa" } : { color: "#fff" },
              ]}
            >
              {Alert?.message}
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    )
  );
};

const styles = StyleSheet.create({
  bgColorErr: {
    backgroundColor: "rgba(255, 0, 0, 0.12)",
  },
  bgColorSuc: {
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    backgroundColor: "rgba(119, 160, 242, 0.15)",
  },
  bgColorWar: {
    backgroundColor: "rgba(119, 160, 242, 0.15)",
  },
  text: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 15,
  },
  row: {
    width: "100%",
    justifyContent: "center",
  },
  darkblur: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  lighblur: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  blurView: {
    paddingHorizontal: 10,
    height: 70,
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
    borderRadius: 10,
  },
  notification: {
    marginHorizontal: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 0,
    zIndex: 500,
    justifyContent: "center",
    alignContent: "center",
    height: 70,
    borderRadius: 10,
  },
});

export default AlertNotify;

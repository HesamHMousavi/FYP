import React, { useRef, useEffect, useContext, useState } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Image,
  PanResponder,
} from "react-native";
import { BlurView } from "expo-blur";
import { AlertContext } from "../../../context/Alert/AlertState";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import { RelationContext } from "../../../context/Relations/RelationState";

const Notification = () => {
  const { notificationMessage, sender } = useContext(AlertContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { getFriendImg } = useContext(RelationContext);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen
  const initialPosition = 55; // The original position of the notification
  const [Img, setImg] = useState("https://via.placeholder.com/100");

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
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [slideAnim]);

  useEffect(() => {
    getImage();
  }, []);

  const getImage = async () => {
    const Image = await getFriendImg(sender);
    setImg(
      Image.ImageData
        ? `data:${Image.ImageContentType};base64,${Image.ImageData}`
        : "https://via.placeholder.com/100"
    );
  };

  return (
    <Animated.View
      {...panResponder.panHandlers} // Attach pan handlers
      style={[
        styles.notification,
        !isDarkMode ? styles.lighblur : styles.darkblur,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView style={[styles.blurView]} intensity={55}>
        <View style={[styles.row, styles.width100]}>
          <View style={styles.left}>
            <Image source={{ uri: Img }} style={styles.profileImage} />
            <View style={{ marginBottom: 4 }}>
              <Text
                style={[
                  styles.titleLight,
                  isDarkMode ? { color: "#ddd" } : { color: "#fff" },
                ]}
              >
                {sender}
              </Text>
              <Text
                style={[
                  styles.textLight,
                  isDarkMode ? { color: "#ddd" } : { color: "#fff" },
                ]}
              >
                {notificationMessage}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.timestamp}>{"now"}</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 15, // Space between image and text
  },
  titleLight: {
    color: "#fff",
    fontSize: 20,
  },
  textLight: {
    color: "#fff",
    fontSize: 12,
  },
  timestamp: {
    color: "#fff",
  },
});

export default Notification;

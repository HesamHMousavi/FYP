import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";

const TypingBubble = ({ isVisible }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true); // Make sure the bubble is rendered
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500, // Fade-in duration
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500, // Fade-out duration
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false); // Hide the bubble after fading out
      });
    }
  }, [isVisible]);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      animateDots();
    }
  }, [isVisible]);

  const animateDots = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const dotStyle = (opacity) => ({
    opacity,
    ...styles.dot,
  });

  if (!isRendered) return null; // Don't render if not visible

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.bubble}>
        <Animated.View style={dotStyle(dot1)} />
        <Animated.View style={dotStyle(dot2)} />
        <Animated.View style={dotStyle(dot3)} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  bubble: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 2,
  },
});

export default TypingBubble;

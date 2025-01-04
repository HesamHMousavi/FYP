import React, { useState, useRef, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import { ThemeContext } from "../../../context/Theme/ThemeContext";

const RenderMessage = ({ item, user, onDeleteMessage }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedMessage, setSelectedMessage] = useState(null); // Tracks the selected message for delete
  const [deletePosition, setDeletePosition] = useState(null); // Position of delete button

  const handleLongPress = (event, message) => {
    const { pageX, pageY } = event.nativeEvent; // Get touch coordinates
    setDeletePosition({ x: pageX, y: pageY }); // Set position for delete button
    setSelectedMessage(message); // Set the message as selected
  };

  const handleDelete = () => {
    if (selectedMessage) {
      onDeleteMessage(selectedMessage); // Call delete function
      setSelectedMessage(null); // Reset selection
      setDeletePosition(null); // Reset position
    }
  };

  const dismissDeleteButton = () => {
    setSelectedMessage(null); // Dismiss delete button
    setDeletePosition(null);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissDeleteButton}>
      <FlatList
        data={item[1]}
        keyExtractor={(element, idx) => `${element.message}-${idx}`}
        onScroll={dismissDeleteButton} // Dismiss delete button on scroll
        renderItem={({ item: element }) => (
          <View>
            <TouchableOpacity
              onLongPress={(e) => handleLongPress(e, element)} // Trigger delete on long press
              delayLongPress={500} // Adjust long press delay
              style={[
                styles.messageBubble,
                element.from === user.Username
                  ? [
                      styles.outgoingBubble,
                      { backgroundColor: isDarkMode ? "#333" : "#777" },
                    ]
                  : [
                      styles.incomingBubble,
                      { backgroundColor: isDarkMode ? "#ccc" : "#fff" },
                    ],
              ]}
            >
              <Text
                style={
                  element.from === user.Username
                    ? [
                        styles.outgoingText,
                        { color: isDarkMode ? "#ddd" : "#fff" },
                      ]
                    : [
                        styles.incomingText,
                        { color: isDarkMode ? "#444" : "#000" },
                      ]
                }
              >
                {element.message}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  element.from === user.Username
                    ? { color: isDarkMode ? "#ddd" : "#fff" }
                    : { color: isDarkMode ? "#333" : "#aaa" },
                ]}
              >
                {`${String(new Date(element.timestamp).getHours()).padStart(
                  2,
                  "0"
                )}:${String(new Date(element.timestamp).getMinutes()).padStart(
                  2,
                  "0"
                )}`}
              </Text>
            </TouchableOpacity>

            {/* Render Delete Button */}
            {selectedMessage === element && deletePosition && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    top: deletePosition.y, // Position above the bubble
                    left: deletePosition.x, // Center horizontally
                  },
                ]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </TouchableWithoutFeedback>
  );
};

export default RenderMessage;

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: "75%",
    minWidth: 100,
    paddingBottom: 18,
    paddingTop: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  incomingBubble: {
    alignSelf: "flex-start",
  },
  outgoingBubble: {
    alignSelf: "flex-end",
  },
  incomingText: {
    fontSize: 13,
  },
  outgoingText: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 8,
    opacity: 0.7,
    position: "absolute",
    bottom: 4,
    right: 4,
  },
  deleteButton: {
    position: "absolute",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    zIndex: 100,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

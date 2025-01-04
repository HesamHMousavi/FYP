import { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import Styl from "../../../Styl";

const ReplyMessage = ({ message, onClose }) => {
  if (!message) return null;

  const { isDarkMode } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.replyContainer,
        isDarkMode ? Styl.darkSimpleStyle2 : Styl.lightSimpleStyle,
      ]}
    >
      <Text
        style={[
          styles.reply,
          isDarkMode ? { color: "#555" } : { color: "#aaa" },
        ]}
      >
        Text Replay
      </Text>
      <View style={styles.borderBottom}>
        <Text
          style={[
            styles.replyUserText,
            isDarkMode ? { color: "#555" } : { color: "#aaa" },
          ]}
        >
          {message.from}
        </Text>
      </View>
      <Text
        style={[
          styles.replyText,
          isDarkMode ? { color: "#ddd" } : { color: "#333" },
        ]}
        numberOfLines={4}
      >
        {message.message}
      </Text>
      <TouchableOpacity
        onPress={onClose}
        style={[
          styles.closeReply,
          isDarkMode ? { borderColor: "#777" } : { borderColor: "#ddd" },
        ]}
      >
        <Icon name="close" size={20} color={isDarkMode ? "#777" : "#aaa"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    borderLeftColor: "#77A0F2",
    borderWidth: 3,
    overflow: "hidden",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  replyText: {
    fontSize: 14,
    color: "#fff",
    paddingRight: 50,
    paddingBottom: 5,
  },
  replyUserText: {
    fontSize: 18,
    color: "#ddd",
  },
  borderBottom: {
    width: "90%",
    marginBottom: 7,
    marginTop: -5,
    borderBottomColor: "#666",
  },
  closeReply: {
    position: "absolute",
    top: "55%",
    right: 25,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: "50%",
  },
  closeText: {
    color: "#ff0000", // Close button color
  },
  reply: {
    color: "#555",
    position: "absolute",
    right: 10,
    top: 3,
  },
});

export default ReplyMessage;

import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl from "../../../Styl";
import React, { useContext } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

const ChatInput = ({ onChange, onPress, value }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <View
      style={[
        styles.inputContainer,
        isDarkMode ? Styl.darkSimpleStyle : "#eee",
      ]}
    >
      <TextInput
        keyboardAppearance={isDarkMode ? "dark" : "light"}
        value={value}
        multiline={true}
        maxHeight={100}
        numberOfLines={5}
        onChangeText={onChange}
        style={[styles.input, isDarkMode ? Styl.darkSimpleStyle2 : "#eee"]}
        placeholder="Type a message..."
        placeholderTextColor="#aaa"
        selectionColor={"#77A0F2"}
      />
      <TouchableOpacity style={styles.sendButton} onPress={onPress}>
        <Icon name="send" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    color: "black",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 13,
    marginBottom: 5,
  },
  sendButton: {
    backgroundColor: "#77A0F2",
    padding: 10,
    borderRadius: 25,
    marginBottom: 5,
  },
});

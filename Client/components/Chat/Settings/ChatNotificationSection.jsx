import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useContext } from "react";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl from "../../../Styl";

const ChatNotificationSection = ({
  Title = "title",
  oppArr = [
    { optTitle: "Title", onClick: () => {}, id: 1, isSelected: true },
    { optTitle: "Title", onClick: () => {}, id: 2, isSelected: false },
    { optTitle: "Title", onClick: () => {}, id: 3, isSelected: false },
  ],
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [state, setState] = useState(oppArr);
  const FLAG = isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle;
  const FLAG_OPTION = isDarkMode
    ? Styl.darkSimpleStyle2
    : Styl.lightSimpleStyle;

  const setOption = (id) => {
    const newArr = state.map((option) => ({
      ...option, // Create a new object
      isSelected: option.id === id, // Set isSelected based on the id
    }));
    setState(newArr);
  };
  return (
    <>
      <Text style={[styles.mainTitle, FLAG]}>{Title}</Text>
      <View style={[styles.section, FLAG_OPTION]}>
        {state.map((option, idx) => (
          <Option
            OptionClick={() => {
              option.onClick();
              setOption(option.id);
            }}
            option={option}
            key={idx}
          />
        ))}
      </View>
    </>
  );
};

const Option = ({ option, OptionClick }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const FLAG_BORDER = isDarkMode
    ? { borderBottomColor: "#333" }
    : { borderBottomColor: "#ddd" };
  const FLAG_TEXT = !isDarkMode ? Styl.darkText : Styl.lightText;
  return (
    <TouchableOpacity
      onPress={OptionClick}
      activeOpacity={0.6}
      style={[
        styles.header,
        FLAG_BORDER,
        isDarkMode ? { borderTopColor: "#555" } : { borderTopColor: "#ddd" },
      ]}
    >
      <Text style={[styles.sectionTitle, FLAG_TEXT]}>{option.optTitle}</Text>

      {option.isSelected && (
        <MaterialIcons
          name={"circle"}
          size={20}
          color={isDarkMode ? "#999" : "#ccc"}
        />
      )}
    </TouchableOpacity>
  );
};

export default ChatNotificationSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    paddingHorizontal: 10,
    elevation: 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#333",
  },
  mainTitle: {
    fontSize: 22,
    marginVertical: 10,
  },
});

import { StyleSheet, Text, View, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useContext } from "react";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl, { primaryColor } from "../../../Styl";

const NotificationSection = ({
  Title = "title",
  SwitchTitle = "title",
  optionTitle = "title",
  showOption = true,
}) => {
  const [messageNotifications, setMessageNotifications] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const FLAG = isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle;

  const FLAG_TEXT = !isDarkMode ? Styl.darkText : Styl.lightText;

  const FLAG_OPTION = isDarkMode
    ? Styl.darkSimpleStyle2
    : Styl.lightSimpleStyle;
  return (
    <>
      <Text style={[styles.mainTitle, FLAG]}>{Title}</Text>
      <View style={[styles.section, FLAG_OPTION]}>
        <View style={[styles.header, FLAG_OPTION]}>
          <Text style={[styles.sectionTitle, FLAG_TEXT]}>{SwitchTitle}</Text>
          <Switch
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            trackColor={{ false: "#d9d9d9", true: primaryColor }}
            thumbColor={
              messageNotifications
                ? isDarkMode
                  ? "#222"
                  : "#fff"
                : isDarkMode
                ? "#aaa"
                : "#fff"
            }
            value={messageNotifications}
            onValueChange={setMessageNotifications}
          />
        </View>
        {messageNotifications && showOption && (
          <>
            <View
              style={[
                styles.header,
                { borderTopWidth: 1 },
                isDarkMode
                  ? { borderTopColor: "#555" }
                  : { borderTopColor: "#ddd" },
              ]}
            >
              <Text style={[styles.sectionTitle, FLAG_TEXT]}>
                {optionTitle}
              </Text>
              <MaterialIcons
                name={"chevron-right"}
                size={30}
                color={isDarkMode ? "#999" : "#aaa"}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default NotificationSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 12,
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

import Styl, { primaryColor } from "../../Styl";
import React, { useContext } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";

const Option = ({
  onPress,
  title,
  icon,
  isFirst = false,
  isLast = false,
  isSwitch = false,
  onChangeSwitch,
  iconColor = null,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  return !isSwitch ? (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.title,
        isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
        isFirst && styles.firstTitle,
        isLast && styles.lastTitle,
        isDarkMode
          ? { borderBottomColor: "#333" }
          : { borderBottomColor: "#ccc" },
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={iconColor ? iconColor : isDarkMode ? "#aaa" : "#666"}
      />
      <Text
        style={[
          styles.titleText,
          isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View
        style={[
          styles.title,
          { justifyContent: "space-between" },
          isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
          isDarkMode
            ? { borderBottomColor: "#333" }
            : { borderBottomColor: "#ccc" },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialIcons
            name={isDarkMode ? "nightlight" : "wb-sunny"}
            size={24}
            color={iconColor ? iconColor : isDarkMode ? "#aaa" : "#666"}
          />
          <Text
            style={[
              styles.titleText,
              isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
            ]}
          >
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </Text>
        </View>
        <Switch
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          trackColor={{ false: "#d9d9d9", true: primaryColor }}
          thumbColor={isDarkMode ? "#222" : "#fff"}
          onValueChange={onChangeSwitch}
          value={isDarkMode}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Option;

const styles = StyleSheet.create({
  title: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  lastTitle: {
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

  firstTitle: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  titleText: {
    fontSize: 13,
    marginLeft: 15,
    color: "rgba(0, 0, 0, 0.7)",
  },
});

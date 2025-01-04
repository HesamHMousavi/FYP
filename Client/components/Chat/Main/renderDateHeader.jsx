import { Text, View } from "react-native";
import moment from "moment";
import React, { useContext } from "react";
import { ThemeContext } from "../../../context/Theme/ThemeContext";

const RenderDateHeader = ({ date }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const today = moment().startOf("day");
  const messageDate = moment(date).startOf("day");
  const daysDiff = today.diff(messageDate, "days");
  const currentYear = moment().year();
  const messageYear = moment(date).year();

  let displayDate;

  if (daysDiff === 0) {
    displayDate = "Today";
  } else if (daysDiff === 1) {
    displayDate = "Yesterday";
  } else if (daysDiff <= 7) {
    displayDate = moment(date).format("dddd"); // Day of the week for the last 7 days
  } else {
    displayDate = moment(date).format(
      messageYear === currentYear ? "MMMM Do" : "MMMM Do, YYYY"
    ); // Show year only if it's different
  }
  return (
    <View
      style={{
        padding: 5,
        marginVertical: 25,
        marginHorizontal: "25%",
        alignItems: "center",
        width: "50%",
        backgroundColor: isDarkMode ? "#ddd" : "#bbb",
        borderRadius: 5,
      }}
    >
      <Text style={{ color: isDarkMode ? "#333" : "#fff", fontSize: 11 }}>
        {displayDate}
      </Text>
    </View>
  );
};

export default RenderDateHeader;

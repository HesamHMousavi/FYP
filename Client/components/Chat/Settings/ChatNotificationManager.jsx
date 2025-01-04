import React, { useContext } from "react";
import ChatNotificationSection from "./ChatNotificationSection";
import { ScrollView } from "react-native";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl from "../../../Styl";

const ChatNotificationManager = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const FLAG = isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle;
  return (
    <ScrollView
      style={[{ flex: 1, padding: 20 }, FLAG]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <ChatNotificationSection
        Title="Direct Messages"
        SwitchTitle="Show Notifications"
        optionTitle="Muted Friends"
      />
    </ScrollView>
  );
};

export default ChatNotificationManager;

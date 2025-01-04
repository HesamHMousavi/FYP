import React, { useContext } from "react";
import NotificationSection from "./NotificationSection";
import { ScrollView } from "react-native";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl from "../../../Styl";

const NotificationManager = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const FLAG = isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle;
  return (
    <ScrollView
      style={[{ flex: 1, padding: 20 }, FLAG]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <NotificationSection
        Title="Direct Messages"
        SwitchTitle="Show Notifications"
        optionTitle="Muted Friends"
      />
      <NotificationSection
        Title="Scheduled Messages"
        SwitchTitle="Show Notifications"
        optionTitle="Muted Friends"
      />

      <NotificationSection
        Title="Story Notifications"
        SwitchTitle="Show Notifications"
        optionTitle="Muted Friends"
      />

      <NotificationSection
        Title="Friend Requests"
        SwitchTitle="Show Notifications"
        optionTitle="Muted Friends"
        showOption={false}
      />
    </ScrollView>
  );
};

export default NotificationManager;

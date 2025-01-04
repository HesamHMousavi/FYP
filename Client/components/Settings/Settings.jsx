import React, { useContext } from "react";
import Account from "./Account";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import ThemePage from "../Theme/ThemePage";
import ThemeOptions from "../Theme/ThemeOptions";
import Security from "../Security";
import NotificationManager from "./Notifications/NotificationManager";
import SettingsPage from "./SettingsPage";
import { lightTextColor, lightColor, darkTextColor } from "../../Styl";

const Settings = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingPage"
        component={SettingsPage}
        options={{
          title: "Settings",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <Stack.Screen
        name="Account"
        component={Account}
        options={{
          title: "Account",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <Stack.Screen
        name="securityPage"
        component={Security}
        options={{
          title: "Security",
          headerTintColor: "black",
          headerShown: true,
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <Stack.Screen
        name="ThemePage"
        component={ThemePage}
        options={{
          title: "Theme Prefrence",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <Stack.Screen
        name="ImagePreview"
        component={Account}
        options={{
          title: "Account",
          headerTintColor: "black",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ThemeOptions"
        component={ThemeOptions}
        options={{
          title: "Theme Options",
          headerTintColor: "black",
          headerShown: true,
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />

      <Stack.Screen
        name="NotificationManager"
        component={NotificationManager}
        options={{
          title: "Notification Options",
          headerTintColor: "black",
          headerShown: true,
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default Settings;

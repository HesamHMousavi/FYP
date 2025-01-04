import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/Auth/AuthState";
import { AlertContext } from "../context/Alert/AlertState";
import Loader from "./Tools/Loader";
import Chats from "./Chat/Chats";
import Settings from "./Settings/Settings";
import Stories from "./Stories/Stories";
import UserLogin from "./Auth/UserLogin";
import UserSignUp from "./Auth/UserSignUp";
import Search from "./Relations/Search";
import { ThemeContext } from "../context/Theme/ThemeContext";
import { StatusBar } from "react-native";
import { lightColor, lightTextColor } from "../Styl";
import Notification from "./Settings/Notifications/Notification";
import Map from "./Map";

const Tab = createBottomTabNavigator();


const Home = ({ route }) => {
  const { getUser } = useContext(AuthContext);
  let token;
  const getData = async () => {
    SetLoading(true);
    token = await SecureStore.getItemAsync("token");
    if (token) {
      SetLogIn();
      getUser();
    }
    SetLoading(false);
  };
  const { isDarkMode, setTheme } = useContext(ThemeContext);
  const { isLoading, SetLoading, isNotify } = useContext(AlertContext);
  const { isLoggedIn, SetLogIn } = useContext(AuthContext);
  const [isSingUp, setSignUp] = useState(false);
  useEffect(() => {
    getData();
    setTheme();
  }, [isLoggedIn]);

  return (
    <>
      {isNotify && <Notification />}
      {isLoading ? (
        <Loader />
      ) : (
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          {isLoggedIn ? (
            <Tab.Navigator
              initialRouteName="Chats"
              screenOptions={({ route }) => ({
                tabBarStyle: {
                  backgroundColor: isDarkMode ? "#111" : lightColor,
                  borderTopWidth: isDarkMode ? 0 : 0.4,
                },
                tabBarActiveTintColor: "#77A0F2",
                tabBarInactiveTintColor: isDarkMode ? lightTextColor : "#999",

                tabBarIcon: ({ color, size }) => {
                  let iconName;

                  if (route.name === "Chats") {
                    iconName = "chatbubbles-outline";
                  } else if (route.name === "Settings") {
                    iconName = "settings-outline";
                  } else if (route.name === "Stories") {
                    iconName = "camera-outline";
                  } else if (route.name === "search") {
                    iconName = "search";
                  } else if (route.name === "Map") {
                    iconName = "map";
                  }

                  // else if (route.name === "Calls") {
                  //   iconName = "call-outline";
                  // }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              })}
            >
              <Tab.Screen
                name="Stories"
                component={Stories}
                options={{
                  headerShown: false,
                }}
              />
              <Tab.Screen
                name="Chats"
                component={Chats}
                options={{
                  headerShown: false,
                }}
              />
              <Tab.Screen
                name="search"
                component={Search}
                options={{
                  headerShown: false,
                }}
              />
              <Tab.Screen
                name="Map"
                component={Map}
                options={{
                  headerShown: false,
                }}
              />
              <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                  headerShown: false,
                }}
              />
              {/* <Tab.Screen
                  name="Calls"
                  component={Calls}
                  options={{
                    headerShown: false,
                  }}
                /> */}
            </Tab.Navigator>
          ) : isSingUp ? (
            <UserSignUp onSignup={setSignUp} />
          ) : (
            <UserLogin onSignup={() => setSignUp(true)} />
          )}
        </NavigationContainer>
      )}
    </>
  );
};

export default Home;

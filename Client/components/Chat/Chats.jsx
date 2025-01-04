import { StyleSheet, RefreshControl, View, FlatList, Text } from "react-native";
import { useContext, useCallback } from "react";
import ContactTextItem from "./ContactTextItem";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import ChatsPage from "./Main/ChatPage";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl, { darkTextColor, lightColor, lightTextColor } from "../../Styl";
import { AuthContext } from "../../context/Auth/AuthState";
import Loader from "../Tools/Loader";
import { ChatContext } from "../../context/Chat/ChatState";
import UserProfile from "./Settings/UserProfile";
import ScheduleMessagePage from "./Other/ScheduleMessagePage";
import ChatNotificationManager from "./Settings/ChatNotificationManager";

const generateRandomId = () => {
  return (
    "id-" +
    Math.random().toString(36).slice(2, 9) +
    "-" +
    Date.now().toString(36)
  );
};

const ChatStack = createStackNavigator();

const ChatsHome = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user, isSettingsLoading, isRefreshLoading, getUser, SetUser } =
    useContext(AuthContext);
  const { SelectChat, selectedChat, setChatPage } = useContext(ChatContext);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        if (selectedChat) {
          const index = user.MessageQueue.findIndex(
            (item) => item.Username === selectedChat.username
          );
          if (user.MessageQueue[index]) user.MessageQueue[index].messages = [];
          SelectChat(null);
          SetUser(user);
        }
      }
    }, [user, selectedChat])
  );

  const onRefresh = async () => {
    await getUser(true);
  };
  const onClick = (item) => {
    SelectChat({
      username: item.Username,
      id: item._id,
      messages: item.messages,
      isConnected: item.isConnected,
      ImageData: item.ImageData,
      ImageContentType: item.ImageContentType,
      SymmetricKey: item.SymmetricKey,
    });
    setChatPage(true);
    navigation.navigate("ChatsPage");
  };

  return !isSettingsLoading ? (
    user && user.Friends.length > 0 ? (
      <FlatList
        style={isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle}
        data={user ? user.Friends : []}
        keyExtractor={(item) => generateRandomId()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshLoading}
            onRefresh={onRefresh}
            colors={["#6200EE", "#03DAC6"]} // Android: Primary and secondary colors
            tintColor={isDarkMode ? "#ddd" : "#222"} // iOS: Loader color
          />
        }
        renderItem={({ item }) => (
          <ContactTextItem
            username={item.Username}
            connected={item.isConnected || item.Connected}
            lastText={"last text"}
            image={
              item.ImageData
                ? `data:${item.ImageContentType};base64,${item.ImageData}`
                : "https://via.placeholder.com/100"
            }
            timestamp={"2:30 PM"}
            fun={() => onClick(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: isDarkMode ? "#444" : "#ddd" },
            ]}
          />
        )}
      />
    ) : (
      <View
        style={[
          styles.container,
          isDarkMode ? Styl.darkSimpleStyle : styles.lightSimpleStyle,
        ]}
      >
        <Text
          style={[
            styles.text,
            isDarkMode
              ? Styl.darkSimpleStyle
              : [Styl.lightSimpleStyle, { backgroundColor: "#eee" }],
          ]}
        >
          Add Friends
        </Text>
      </View>
    )
  ) : (
    <Loader />
  );
};

const Chats = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatsHome"
        component={ChatsHome}
        options={{
          title: "Chats",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <ChatStack.Screen
        name="ChatsPage"
        component={ChatsPage}
        options={{
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <ChatStack.Screen
        name="ProfilePage"
        component={UserProfile}
        options={{
          title: "Profile Page",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />

      <ChatStack.Screen
        name="ScheduleMessagePage"
        component={ScheduleMessagePage}
        options={{
          title: "Schedule Message",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <ChatStack.Screen
        name="ChatNotificationManager"
        component={ChatNotificationManager}
        options={{
          title: "Notification Options",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
    </ChatStack.Navigator>
  );
};

export default Chats;

const styles = StyleSheet.create({
  contactInfo: {
    flexDirection: "column",
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  phone: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    position: "absolute",
    right: 15,
    top: 10,
    fontSize: 12,
    color: "#888",
  },
  separator: {
    height: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 17,
    fontWeight: "light",
  },
});

import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import moment from "moment";
import Loader from "../../Tools/Loader";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Styl, { darkTextColor, lightTextColor } from "../../../Styl";
import { MaterialIcons } from "@expo/vector-icons";
import { ChatContext } from "../../../context/Chat/ChatState";
import { AuthContext } from "../../../context/Auth/AuthState";
import TypingBubble from "./TypingBubble";
import RenderDateHeader from "./renderDateHeader";
import RenderMessage from "./renderMessage";
import ReplyMessage from "./ReplyMessage";
import ChatInput from "./ChatInput";

const generateRandomId = () => {
  return (
    "id-" +
    Math.random().toString(36).slice(2, 9) +
    "-" +
    Date.now().toString(36)
  );
};

const ChatPage = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity onPress={() => navigation.navigate("ProfilePage")}>
          <Text
            style={{
              fontSize: 18,
              color: isDarkMode ? lightTextColor : darkTextColor,
            }}
          >
            {selectedChat ? selectedChat.username : "Chat"}
          </Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={30}
            color={isDarkMode ? "#fff" : "#000"}
          />
          <Text
            style={{
              marginLeft: 5,
              fontSize: 18,
              color: isDarkMode ? "#fff" : "#000",
            }}
          ></Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  const flatListRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const {
    sendPrivateMessage,
    selectedChat,
    OnType,
    isChatLoading,
    userTyping,
  } = useContext(ChatContext);
  const [isAnimated, setAnimated] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAnimated(true);
    }, 1000);
  }, [isAnimated]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    // Clean up the listener
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const [isTyping, setIsTyping] = useState(true);
  const [timer, setTimer] = useState(null);

  const handleTextChange = (newText) => {
    if (isTyping) {
      OnType(true);
      setIsTyping(false);
    }

    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      setIsTyping(true);
      OnType(false);
    }, 1000);
    setTimer(newTimer);
    setInputText(newText);
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      sendPrivateMessage(
        user.Username,
        inputText,
        selectedChat.id,
        selectedChat.username
      );
      setInputText("");
    }
  };

  const onReplay = (item) => {
    setReplyMessage(item);
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = {};

    messages?.forEach((message) => {
      const date = moment(message.timestamp).format("YYYY-MM-DD");
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    return Object.entries(groupedMessages);
  };

  const groupedMessages = groupMessagesByDate(
    selectedChat ? selectedChat.messages : []
  );

  return isChatLoading ? (
    <Loader />
  ) : (
    <KeyboardAvoidingView
      style={[
        { flex: 1 },
        isDarkMode ? Styl.darkSimpleStyle : { backgroundColor: "#eee" },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 102 : 20}
    >
      <View
        style={[
          { flex: 1 },
          isDarkMode ? Styl.darkSimpleStyle : { backgroundColor: "#eee" },
        ]}
      >
        {selectedChat?.messages?.length > 0 ? (
          <FlatList
            data={groupedMessages}
            renderItem={({ item }) => (
              <View>
                {<RenderDateHeader date={item[0]} />}
                {<RenderMessage item={item} user={user} onReplay={onReplay} />}
              </View>
            )}
            ref={flatListRef}
            keyExtractor={(item) => generateRandomId()}
            style={styles.messagesList}
            onContentSizeChange={() => {
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: isAnimated });
                }
              }); // Small delay to ensure content is rendered
            }}
            onLayout={() => {
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: isAnimated });
                }
              }); // Add a delay to ensure it scrolls after layout
            }}
          />
        ) : (
          <View style={[styles.titleCon]}>
            <Text
              style={[
                styles.titleText,
                isDarkMode
                  ? { backgroundColor: "#ccc" }
                  : { backgroundColor: "#ddd", color: "#555" },
              ]}
            >{`Text ${selectedChat?.username} to start a conversation`}</Text>
          </View>
        )}

        <TypingBubble
          isVisible={selectedChat?.username === userTyping?.username}
        />

        <ReplyMessage
          message={replyMessage}
          onClose={() => setReplyMessage(null)}
        />
        <ChatInput
          onChange={(text) => handleTextChange(text)}
          onPress={sendMessage}
          value={inputText}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesList: {
    paddingHorizontal: 10,
    flex: 1,
  },
  titleCon: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  titleText: {
    fontSize: 12,
    marginTop: 30,
    padding: 10,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    borderRadius: 15,
    color: "#333",
  },
});

export default ChatPage;

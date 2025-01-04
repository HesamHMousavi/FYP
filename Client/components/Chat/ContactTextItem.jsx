import { StyleSheet, Text, View, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Styl from "../../Styl";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { AuthContext } from "../../context/Auth/AuthState";
import { ChatContext } from "../../context/Chat/ChatState";

const ContextTextItem = ({ image, username, fun, connected }) => {
  const con = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [counter, setCounter] = useState(0);
  const [lastText, setLastText] = useState("");
  const [time, setTime] = useState("");
  const [isTyping, setTyping] = useState(false);
  const [isNew, setNew] = useState(true);
  const { userTyping } = useContext(ChatContext);
  useEffect(() => {
    if (user) {
      const index = user.MessageQueue.findIndex(
        (item) => item.Username === username
      );
      const index2 = user.Friends.findIndex(
        (item) => item.Username === username
      );
      if (user.MessageQueue[index]) {
        if (user.MessageQueue[index].messages)
          if (user.MessageQueue[index].messages.length > 0)
            setCounter(user.MessageQueue[index].messages.length);
      }
      if (user.Friends[index2]) {
        const Friend = user.Friends[index2];
        if (Friend.messages)
          if (Friend.messages.length > 0) {
            setNew(false);
            setLastText(Friend.messages[Friend.messages.length - 1].message);
            const timeStamp = new Date(
              Friend.messages[Friend.messages.length - 1].timestamp
            );
            if (timeStamp) {
              const hours = String(timeStamp.getHours()).padStart(2, "0");
              const minutes = String(timeStamp.getMinutes()).padStart(2, "0");
              setTime(`${hours}:${minutes}`);
            }
          } else {
            setLastText("Say Hi!");
          }
      }
    }
  }, [connected, user]);

  useEffect(() => {
    if (userTyping) {
      if (userTyping.username === username) setTyping(true);
    } else setTyping(false);
  }, []);
  return (
    <TouchableOpacity onPress={() => fun()} activeOpacity={0.7}>
      <View
        style={[
          styles.item,
          con.isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        {connected && (
          <View
            style={[
              styles.onlineBadge,
              { borderColor: con.isDarkMode ? "#000" : "#fff" },
            ]}
          ></View>
        )}
        <Image source={{ uri: image }} style={styles.profileImage} />
        <View
          style={[
            styles.contactInfo,
            con.isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
          ]}
        >
          <Text
            style={[
              styles.name,
              con.isDarkMode ? Styl.lightText : Styl.darkText,
            ]}
          >
            {username}
          </Text>
          {isTyping ? (
            <Text style={[styles.lastText, { color: "#77A0F2" }]}>
              {"typing..."}
            </Text>
          ) : (
            <Text
              style={[styles.lastText, isNew && { color: "#77A0F2" }]}
              numberOfLines={1}
            >
              {lastText}
            </Text>
          )}
        </View>
        {
          <Text
            style={[
              styles.timestamp,
              counter ? { color: "#77A0F2" } : { color: "#888" },
            ]}
          >
            {time}
          </Text>
        }
        {counter > 0 && (
          <View style={[{ backgroundColor: "#aaa" }, styles.notfi]}>
            <Text style={con.isDarkMode ? Styl.darkText : Styl.lightText}>
              {counter}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ContextTextItem;

const styles = StyleSheet.create({
  onlineBadge: {
    position: "absolute",
    bottom: 14,
    left: 50,
    backgroundColor: "#00FF00",
    backgroundColor: "#77A0F2",
    height: 15,
    width: 15,
    borderRadius: 7.5,
    zIndex: 5,
    borderWidth: 2,
    borderColor: "#000",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ensures space between profile info and timestamp
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderColor: "#eee",
    backgroundColor: "red",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 15, // Space between image and text
  },
  contactInfo: {
    flexDirection: "column",
    flex: 1, // Ensures contact info takes up available space
  },
  name: {
    fontSize: 16,
    fontWeight: "light",
  },
  lastText: {
    fontSize: 12,
    color: "#666",
  },
  timestamp: {
    position: "absolute",
    right: 21,
    top: 10,
    fontSize: 12,
    color: "#888",
  },
  notfi: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    height: 22,
    width: 22,
    marginRight: 10,
    marginTop: 15,
    borderRadius: "50%",
    backgroundColor: "#77A0F2",
  },
});

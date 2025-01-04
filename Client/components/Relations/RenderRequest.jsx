import React, { useState, useContext, useEffect } from "react";
import { Text, View, StyleSheet, Animated, Image } from "react-native";
import DateFormatter from "../../Utils/DateFormatter";
import { TouchableOpacity } from "react-native-gesture-handler";
import { RelationContext } from "../../context/Relations/RelationState";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import Styl from "../../Styl";

const RenderRequest = ({ item }) => {
  const animation = new Animated.ValueXY();
  const { getFriendImg, HandleRequest, CancelRequest, GetFriendRequests } =
    useContext(RelationContext);
  const { isDarkMode } = useContext(ThemeContext);
  const value = isDarkMode ? Styl.darkSimpleStyle2 : Styl.lightSimpleStyle;
  const [Img, setImg] = useState("https://via.placeholder.com/100");

  useEffect(() => {
    getImage();
  }, []);

  const handleAccept = () => {
    HandleRequest(item.Username, true);
    setTimeout(() => {
      GetFriendRequests();
    }, 1000);
  };

  const handleReject = () => {
    HandleRequest(item.Username, false);
    setTimeout(() => {
      GetFriendRequests();
    }, 1000);
  };

  const handleCancel = () => {
    CancelRequest(item.Username);
    setTimeout(() => {
      GetFriendRequests();
    }, 1000);
  };

  const getImage = async () => {
    const Image = await getFriendImg(item.Username);
    setImg(
      Image.ImageData
        ? `data:${Image.ImageContentType};base64,${Image.ImageData}`
        : "https://via.placeholder.com/100"
    );
  };

  return (
    <Animated.View
      style={[styles.card, { transform: [{ translateX: animation.x }] }, value]}
    >
      <Image source={{ uri: Img }} style={styles.avatar} />
      <Text style={[styles.name, value]}>{item.Username}</Text>
      <Text style={[styles.stamp, value]}>
        {DateFormatter(new Date(item.TimeStamp))}
      </Text>
      <View style={[styles.actions, value]}>
        {!item.DidYouSend ? (
          <>
            <TouchableOpacity
              onPress={handleReject}
              style={[
                styles.reject,
                isDarkMode
                  ? { backgroundColor: "#111" }
                  : { backgroundColor: "#ddd" },
              ]}
            >
              <MaterialIcons
                name="cancel"
                size={28}
                color={isDarkMode ? "#ddd" : "#555"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.accept,
                isDarkMode
                  ? { backgroundColor: "#eee" }
                  : { backgroundColor: "#222" },
              ]}
              onPress={handleAccept}
            >
              <MaterialIcons
                name="check-circle"
                size={28}
                color={isDarkMode ? "#222" : "#fff"}
              />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              styles.reject,
              isDarkMode
                ? { backgroundColor: "#111" }
                : { backgroundColor: "#ddd" },
            ]}
          >
            <MaterialIcons
              name="cancel"
              size={28}
              color={isDarkMode ? "#ddd" : "#555"}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  accept: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    borderColor: "#aaa",
    marginLeft: 10,
  },
  reject: {
    borderRadius: "50%",
    width: 50,
    height: 50,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
  },
  stamp: {
    color: "#aaa",
    position: "absolute",
    bottom: 22,
    left: 74,
    fontSize: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 7,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    marginBottom: 13,
  },
  actions: {
    flexDirection: "row",
  },
});

export default RenderRequest;

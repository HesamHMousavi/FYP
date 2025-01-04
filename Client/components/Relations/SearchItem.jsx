import { StyleSheet, Text, View, Image } from "react-native";
import { Fragment, useContext, useEffect, useState } from "react";
import Styl, { darkTextColor, lightTextColor } from "../../Styl";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import * as SecureStore from "expo-secure-store";
import { Button } from "react-native-paper";
import { RelationContext } from "../../context/Relations/RelationState";
import { AuthContext } from "../../context/Auth/AuthState";

const SearchItem = ({ username, image, id }) => {
  const { SendFriendRequest, CancelRequest, HandleRequest, DeleteRequest } =
    useContext(RelationContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { UsersFound } = useContext(AuthContext);
  const [isUser, setIsUser] = useState(false);
  const [isRequestSent, setRequestSent] = useState(false);
  const [isRequested, SetRequested] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  useEffect(() => {
    same();
    UsersFound.Requested_Friends.forEach((item) => {
      if (item.Username === username) {
        if (item.DidYouSend) setRequestSent(true);
        else {
          SetRequested(true);
        }
      }
    });
    UsersFound.Friends.forEach((item) => {
      if (item.Username === username) {
        setIsFriend(true);
      }
    });
  }, [isUser]);

  async function same() {
    setIsUser((await SecureStore.getItemAsync("userID")) !== id);
  }
  const onRequest = () => {
    SendFriendRequest(username);
    setRequestSent(true);
  };
  const onCancel = () => {
    CancelRequest(username);
    setRequestSent(false);
  };
  const onAccept = () => {
    //used to accept friend request
    HandleRequest(username, true);
    setIsFriend(false);
  };
  const onReject = () => {
    // used to reject friend request
    HandleRequest(username, false);
    SetRequested(false);
  };
  const onRemove = () => {
    DeleteRequest(username);
    SetRequested(false);
    // used to remove friend
  };
  return (
    <View
      style={[
        styles.item,
        isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
      ]}
    >
      <Image source={{ uri: image }} style={styles.profileImage} />
      <View
        style={[
          styles.contactInfo,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <Text
          style={[
            styles.name,
            isDarkMode ? { color: lightTextColor } : { color: darkTextColor },
          ]}
        >
          {username}
        </Text>
      </View>
      {isUser &&
        (isFriend ? (
          <Fragment>
            <Button
              mode='outlined'
              onPress={onRemove}
              style={[styles.button, styles.width120, styles.cancel]}
              labelStyle={{ color: "rgba(255, 0, 0, 0.8)" }}
            >
              Remove
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            {!isRequestSent ? (
              !isRequested ? (
                <Button
                  mode='outlined'
                  onPress={onRequest}
                  style={styles.button}
                  labelStyle={{ color: isDarkMode ? "#aaa" : "#333" }}
                >
                  Add
                </Button>
              ) : (
                <>
                  <Button
                    onPress={onAccept}
                    mode='outlined'
                    style={[styles.button, styles.width120]}
                    labelStyle={{ color: isDarkMode ? "#aaa" : "#333" }}
                  >
                    Accept
                  </Button>
                  <Button
                    onPress={onReject}
                    mode='outlined'
                    style={[styles.button, styles.width120, styles.cancel]}
                    labelStyle={{ color: "rgba(255, 0, 0, 0.8)" }}
                  >
                    Decline
                  </Button>
                </>
              )
            ) : (
              <Button
                mode='outlined'
                onPress={onCancel}
                style={[styles.button, styles.cancel]}
                labelStyle={{ color: "rgba(255, 0, 0, 0.8)" }}
              >
                Cancel
              </Button>
            )}
          </Fragment>
        ))}
    </View>
  );
};

export default SearchItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    width: "100%",
    paddingHorizontal: 15,
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
    fontSize: 15,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align items to the right
    width: 100, // Adjust based on your needs
  },
  addButton: {
    height: 25,
    width: 25,
    backgroundColor: "#007bff", // Button background color
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%", // Circular button
    marginLeft: 10, // Space between text and button
  },
  button: {
    backgroundColor: "transparent",
    borderColor: "#aaa",
    width: 97,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
  },
  cancel: {
    borderColor: "rgba(255, 0, 0, 0.8)",
  },
  width120: {
    width: 105,
    marginRight: 7,
  },
});

import { createContext, useEffect, useReducer, useContext } from "react";
// import { RemoteRoute } from "@env";
import Reducer from "./ChatReducer";
import { socket } from "./socket";
import { AuthContext } from "../Auth/AuthState";
import * as SecureStore from "expo-secure-store";
import forge from "node-forge";
import * as Location from "expo-location";
import {
  SET_SELECTED_CHAT,
  ON_NEW_TEXT,
  USER_TYPING,
  SET_CHAT_LOADING,
  SET_TASKS,
  SET_IS_CHAT_PAGE,
} from "../Types";
import { AlertContext } from "../Alert/AlertState";
import axios from "axios";
import CryptoES from "crypto-es";

const RemoteRoute = "http://192.168.1.110:5001"
axios.defaults.baseURL = RemoteRoute;
export const ChatContext = createContext();

export default ChatState = (props) => {
  initialState = {
    selectedChat: null,
    sender: null,
    userTyping: null,
    isChatLoading: false,
    Tasks: [],
    isChatPage: false,
  };
  const [state, dispatch] = useReducer(Reducer, initialState);
  const { user, SetUser } = useContext(AuthContext);
  const { setNotify, SetAlert, SetTasksLoading } = useContext(AlertContext);

  useEffect(() => {

    const run = async () =>{
      if (user) {
        const {lat, long} = await getLocation();
        socket.auth = { userID: user._id, Username: user.Username , lat, long };
        socket.connect();
        socket.on("private-message", async ({ sender, message, timestamp }) => {
          dispatch({ type: ON_NEW_TEXT, payload: sender });
          const index = user.Friends.findIndex(
            (item) => item.Username === sender
          );
          const res = await axios.post("/chat", {
            myUsername: user.Username,
            username: sender,
          });

          const myIndex = res.data.data.Users.findIndex(
            (item) => item.Username === user.Username
          );
          const aes = DecryptSymmetricKey(
            res.data.data.Users[myIndex].EncryptedSymmetricKey,
            await SecureStore.getItemAsync("DecryptedPrivateKey")
          );
          message = decryptMessage(message, aes);
          let notify = true;
          if (state.selectedChat) {
            if (sender === state.selectedChat.username && state.isChatPage) {
              notify = false;
            }
          }
          if (notify) setNotify(message, true, sender);
          user.Friends[index].messages.push({
            type: "incoming",
            message,
            sender,
            timestamp,
          });
          const index2 = user.MessageQueue.findIndex(
            (item) => item.Username === sender
          );
          let isAdd = true;
          if (state.selectedChat) {
            if (state.selectedChat.username === sender) isAdd = false;
          }
          if (isAdd) {
            if (!user.MessageQueue[index2]) {
              user.Friends.forEach((element) => {
                if (element.Username === sender) {
                  user.MessageQueue.push({
                    _id: element._id,
                    Username: element.Username,
                    messages: [],
                  });
                }
              });
            }
            const i = user.MessageQueue.findIndex(
              (item) => item.Username === sender
            );
            user.MessageQueue[i].messages.push({
              type: "incoming",
              from: sender,
              message,
              timestamp,
            });
            saveMessageQueue();
          }
          SetUser(user);
        });
        socket.on("user-connected", ({ username , latitude , longitude}) => {
          for (let i = 0; i < user.Friends?.length; i++) {
            if (user.Friends[i].Username === username) {
              user.Friends[i].isConnected = true;
              user.Friends[i].latitude = latitude
              user.Friends[i].longitude = longitude
              SetUser(user);
            }
          }
        });
        socket.on("user-disconnected", ({ username }) => {
          for (let i = 0; i < user.Friends?.length; i++) {
            if (user.Friends[i].Username === username) {
              user.Friends[i].isConnected = false;
              SetUser(user);
            }
          }
        });
        socket.on(
          "request-response",
          async ({ sender, username, userID, Accept }) => {
            const friendDetails = await axios.post("/user/get", {
              Username: sender,
            });
            const chat = await axios.post("/chat", {
              myUsername: username,
              username: sender,
            });
            friendDetails.data.data.messages = chat.data.data.Chat || [];
            user.Friends = [...user.Friends, friendDetails.data.data];
            SetUser(user);
            SetAlert(
              `${sender} ${Accept ? "Accepted" : "Rejected"} your friend request`,
              "success"
            );
          }
        );
        socket.on("typing", ({ username, userID, typing }) => {
          if (typing)
            dispatch({ type: USER_TYPING, payload: { username, userID } });
          else dispatch({ type: USER_TYPING, payload: null });
        });
        socket.on("request-notification", ({ Username }) => {
          SetAlert(`Friend request from ${Username}`);
        });
        socket.on(
          "scheduled-message-sent",
          ({ taskId, receiver, username, message }) => {
            const index = user.Friends.findIndex(
              (item) => item.Username === receiver
            );
            user.Friends[index].messages.push({
              from: username,
              message,
              sender: username,
              timestamp: new Date(),
            });
            SetUser(user);
            dispatch({
              type: SET_TASKS,
              payload: state.Tasks.filter((task) => task.taskId !== taskId),
            });
            SetAlert(`Scheduled Message Sent to ${receiver}`, "success");
          }
        );
      }
    }
    run()
    return () => {
      socket.disconnect();
      socket.off("private-message");
      socket.off("user-disconnected");
      socket.off("user-connected");
      socket.off("scheduled-message-sent");
      socket.off("request-response");
      socket.off("request-notification");
      socket.off("typing");
    };
  }, [user, state.selectedChat, state.isChatPage]);

  const SendFriendRequestNotification = (Username) => {
    socket.emit("request-notification", { Username });
  };

  const sendPrivateMessage = (username, message, userID, receiver) => {
    const index = user.Friends.findIndex((item) => item.Username === receiver);
    const encMessage = encryptMessage(
      message,
      user.Friends[index].SymmetricKey
    );
    user.Friends[index].messages.push({
      from: username,
      message,
      sender: username,
      timestamp: new Date(),
    });
    SetUser(user);
    socket.emit("private-message", {
      message: encMessage,
      username,
      userID,
      timestamp: new Date(),
      receiver,
    });
  };

  const OnType = (typing) => {
    socket.emit("typing", {
      username: user.Username,
      userID: state.selectedChat.id,
      typing,
    });
  };

  const OnRequestResponse = (username, userID, Accept) => {
    socket.emit("request-response", {
      sender: user.Username,
      username,
      userID,
      Accept,
    });
  };

  const SelectChat = (friend) => {
    dispatch({ type: SET_SELECTED_CHAT, payload: friend });
    if (friend) {
      const index = user.MessageQueue.findIndex(
        (item) => item.Username === friend.username
      );
      if (index > -1) {
        user.MessageQueue[index].messages = [];
        saveMessageQueue();
      }
    }
  };

  const getChat = async (username) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      setChatLoading(true);
      const res = await axios.post("/chat", {
        myUsername: user.Username,
        username,
      });
      return res.data.data.Chat;
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const saveMessageQueue = () => {
    if (user) {
      if (user.MessageQueue?.length > 0) {
        socket.emit("save-MessageQueue", {
          MessageQueue: user.MessageQueue,
        });
      }
    }
  };

  const ClearChat = async () => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      const res = await axios.put("/chat/clear-chat", {
        myUsername: user.Username,
        username: state.selectedChat.username,
      });
      const index = user.Friends.findIndex(
        (item) => item.Username === state.selectedChat.username
      );
      const friend = user.Friends[index];
      SelectChat({
        username: friend.Username,
        id: friend._id,
        messages: [],
        isConnected: friend.isConnected,
        ImageData: friend.ImageData,
        ImageContentType: friend.ImageContentType,
      });
      user.Friends[index].messages = [];
      SetUser(user);
      SetAlert(res.data.message, res.data.type);
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    }
  };

  const setChatLoading = (flag) =>
    dispatch({ type: SET_CHAT_LOADING, payload: flag });

  const onScheduleMessage = async ({
    username,
    message,
    userID,
    receiver,
    cornEx,
  }) => {
    const index = user.Friends.findIndex((item) => item.Username === receiver);
    const encMessage = encryptMessage(
      message,
      user.Friends[index].SymmetricKey
    );
    try {
      socket.emit("schedule-message", {
        username,
        message: encMessage,
        userID,
        receiver,
        cornEx,
      });
      setTimeout(() => {
        getTasks();
      }, 500);
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    }
  };

  const getTasks = async () => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      // SET LOADING HERE
      SetTasksLoading(true);
      const res = await axios.post("/chat/get-tasks", {
        sender: user.Username,
        receiver: state.selectedChat.username,
      });
      const chatRes = await axios.post("/chat", {
        myUsername: user.Username,
        username: state.selectedChat.username,
      });
      for (let i = 0; i < res.data.data.length; i++) {
        const myIndex = chatRes.data.data.Users.findIndex(
          (item) => item.Username === user.Username
        );
        const aes = DecryptSymmetricKey(
          chatRes.data.data.Users[myIndex].EncryptedSymmetricKey,
          await SecureStore.getItemAsync("DecryptedPrivateKey")
        );

        res.data.data[i].message = decryptMessage(
          res.data.data[i].message,
          aes
        );
      }
      SetTasksLoading(false);
      dispatch({ type: SET_TASKS, payload: res.data.data });
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    }
  };

  const onDeleteTask = (taskId) => {
    dispatch({
      type: SET_TASKS,
      payload: state.Tasks.filter((task) => task.taskId !== taskId),
    });
    socket.emit("cancel-task", { taskId });
    SetAlert("Scheduled Message Cancelled", "success");
  };

  const updateTask = ({ message, receiver, cornEx  ,taskId }) => {
    const index = user.Friends.findIndex((item) => item.Username === receiver);
    const encMessage = encryptMessage(
      message,
      user.Friends[index].SymmetricKey
    );
    socket.emit("update-message", {
      message:encMessage,
      taskId,
      cornEx,
    });
    setTimeout(() => {
      getTasks();
    }, 500);
    SetAlert("Scheduled message updated", "success");
  };

  const setChatPage = (flag) =>
    dispatch({ type: SET_IS_CHAT_PAGE, payload: flag });

  const encryptMessage = (message, symmetricKey) => {
    // console.log(symmetricKey);
    return CryptoES.AES.encrypt(message, symmetricKey).toString(); // Ciphertext
  };

  // // Step 6: Decrypt a Message with the Symmetric Key (AES)
  const decryptMessage = (ciphertext, symmetricKey) => {
    // console.log(symmetricKey);
    const Decrypted = CryptoES.AES.decrypt(ciphertext, symmetricKey);
    return Decrypted.toString(CryptoES.enc.Utf8);
  };

  const DecryptSymmetricKey = (encryptedSymmetricKey, privateKeyPem) => {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const decodedKey = forge.util.decode64(encryptedSymmetricKey); // Decode from Base64
      return privateKey.decrypt(decodedKey, "RSA-OAEP");
    } catch (error) {
      console.log(error);
    }
  };

  const getLocation = async () => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return null; // Return null if permission is denied
      }
  
      // Get the user's current location
      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;
  
      return { lat: latitude, long: longitude }; // Return the coordinates
    } catch (error) {
      console.error("Error while fetching location:", error);
      return null; // Return null if an error occurs
    }
  };


  return (
    <ChatContext.Provider
      value={{
        selectedChat: state.selectedChat,
        sender: state.sender,
        userTyping: state.userTyping,
        isChatLoading: state.isChatLoading,
        Tasks: state.Tasks,
        isChatPage: state.isChatPage,
        updateTask: updateTask,
        onDeleteTask: onDeleteTask,
        OnRequestResponse: OnRequestResponse,
        setChatLoading: setChatLoading,
        sendPrivateMessage: sendPrivateMessage,
        SelectChat: SelectChat,
        OnType: OnType,
        getChat: getChat,
        onScheduleMessage: onScheduleMessage,
        ClearChat: ClearChat,
        SendFriendRequestNotification: SendFriendRequestNotification,
        getTasks: getTasks,
        setChatPage: setChatPage,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

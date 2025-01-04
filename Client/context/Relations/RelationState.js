import { createContext, useContext, useReducer } from "react";
// import { RemoteRoute } from "@env";r
const RemoteRoute = "http://192.168.1.110:5001"
export const RelationContext = createContext();
import RelationReducer from "./RelationReducer";
import {
  LOADING,
  SET_REQ_COUNTER,
  SET_REQUESTS,
} from "../Types";
import axios from "axios";
import { AlertContext } from "../Alert/AlertState";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../Auth/AuthState";
import { ChatContext } from "../Chat/ChatState";
axios.defaults.baseURL = RemoteRoute;

export const RelationState = (props) => {
  const { SetAlert } = useContext(AlertContext);
  const { SetUser, user, UsersFound } = useContext(AuthContext);
  const { OnRequestResponse, SendFriendRequestNotification } =
    useContext(ChatContext);
  const initialState = {
    isFriendsLoading: false,
    Requests: null,
    ReqCounter: 0,
  };
  const [state, dispatch] = useReducer(RelationReducer, initialState);

  const SendFriendRequest = async (Username) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetLoading(true);
      const date = new Date();
      const res = await axios.post("/friend", {
        Username,
        TimeStamp: date,
      });
      UsersFound.Requested_Friends.push({
        Username: Username,
        DidYouSend: true,
        TimeStamp: date,
      });
      // SEND OTHER USER FRIEND REQUEST NOTIFICATION
      SendFriendRequestNotification(Username);
      SetAlert(res.data.msg, "success");
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const HandleRequest = async (Username, Accept = true) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetLoading(true);
      if (UsersFound && UsersFound.Requested_Friends) {
        UsersFound.Requested_Friends = UsersFound.Requested_Friends.filter(
          (item) => item.Username !== Username
        );
      }
      const res = await axios.put("/friend", { Username, Accept });
      if (Accept) {
        const friendDetails = await axios.post("/user/get", { Username });
        const chat = await axios.post("/chat", {
          myUsername: user.Username,
          username: Username,
        });
        // Ensure friendDetails and chat responses are defined
        const friendData = friendDetails?.data?.data;
        if (friendData) {
          friendData.messages = chat?.data?.data?.Chat || [];

          // Ensure UsersFound.Friends and user.Friends exist before updating
          UsersFound.Friends = [...(UsersFound.Friends || []), friendData];
          user.Friends = [...(user.Friends || []), friendData];

          OnRequestResponse(friendData.Username, friendData._id, Accept);
        } else {
          SetAlert("Friend details could not be retrieved.", "error");
        }
      }
      SetAlert(res.data.msg, "success");
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
      await GetFriendReqCount();
    }
  };

  const CancelRequest = async (Username) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetLoading(true);
      const res = await axios.put("/friend/cancel", { Username });
      if (UsersFound?.Requested_Friends)
        UsersFound.Requested_Friends = UsersFound.Requested_Friends.filter(
          (item) => item.Username !== Username
        );
      SetAlert(res.data.msg, "success");
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const DeleteRequest = async (Username) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetLoading(true);
      const res = await axios.put("/friend/delete", { Username });
      if (UsersFound)
        if (UsersFound.Friends)
          UsersFound.Friends = UsersFound.Friends.filter(
            (item) => item.Username !== Username
          );
      if (user)
        if (user.Friends)
          user.Friends = user.Friends.filter(
            (item) => item.Username !== Username
          );
      SetAlert(res.data.msg, "success");
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const GetFriendRequests = async () => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetLoading(true);
      const res = await axios.get("/friend/requests");
      UsersFound.Friends_Requests = res.data.Friends;
      dispatch({ type: SET_REQUESTS, payload: res.data.Friends });
      SetUser(user);
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const SetLoading = (flag) => {
    dispatch({ type: LOADING, payload: flag });
  };

  const GetFriendReqCount = async () => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      const res = await axios.get("/friend/get-friend-req-count");
      dispatch({ type: SET_REQ_COUNTER, payload: res.data.data });
      return res.data.data;
    } catch (error) {
      console.log(error);
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    }
  };

  const getFriendImg = async (Username) => {
    try {
      const res = await axios.post("/friend/get-image", { Username });
      return res.data.data;
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    }
  };

  return (
    <RelationContext.Provider
      value={{
        isFriendsLoading: state.isFriendsLoading,
        Requests: state.Requests,
        ReqCounter: state.ReqCounter,
        SendFriendRequest: SendFriendRequest,
        HandleRequest: HandleRequest,
        CancelRequest: CancelRequest,
        DeleteRequest: DeleteRequest,
        GetFriendRequests: GetFriendRequests,
        GetFriendReqCount: GetFriendReqCount,
        getFriendImg: getFriendImg,
      }}
    >
      {props.children}
    </RelationContext.Provider>
  );
};

import { createContext, useReducer, useContext } from "react";
import * as SecureStore from "expo-secure-store";
const RemoteRoute = "http://192.168.1.110:5001";
import AuthReducer from "./AuthReducer";
import {
  LOADING,
  LOG_IN,
  LOG_OUT,
  SET_USER,
  SEARCH_LOADING,
  SET_SEARCH_USERS,
  SET_REFRESH_LOADING,
} from "../Types";
import axios from "axios";
import CryptoJS from "crypto-js";
import { AlertContext } from "../Alert/AlertState";
import forge from "node-forge";
axios.defaults.headers.common["Content-Type"] = "application/json";
import * as ImageManipulator from "expo-image-manipulator";
import { ThemeContext } from "../Theme/ThemeContext";
import CryptoES from "crypto-es";
export const AuthContext = createContext();

export const AuthState = (props) => {
  axios.defaults.baseURL = RemoteRoute;
  const initialState = {
    isLoggedIn: false,
    isSignedUp: false,
    Token: null,
    user: null,
    isSettingsLoading: false,
    isSearchLoading: false,
    isRefreshLoading: false,
    UsersFound: [],
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);
  const { SetAlert, SetLoading } = useContext(AlertContext);
  const { setTheme } = useContext(ThemeContext);

  // Function used to login
  const Login = async ({ Email, Password }) => {
    try {
      // Check if both email and password are supplied => Error if NOT
      if (!Email || !Password) return SetAlert("Missing Information", "error");
      SetLoading(true);
      // Send login request to back-end
      const res = await axios.post("/login", {
        user: {
          Email,
          Password,
        },
      });
      // Check if requested data has returned
      if (res.data.Token) {
        // Save Token, userID in local storage
        await SecureStore.setItemAsync("token", res.data.Token);
        await SecureStore.setItemAsync("userID", res.data.userID);
        await SecureStore.setItemAsync("theme", "1");
        // Set default (light) Theme
        setTheme();
        // Get user details
        await getUser();

        // Decrypt private key and store in local storage
        const DecryptedPrivateKey = decryptPrivateKey(
          res.data.User.PrivateEncryptionKey,
          Password
        );
        await SecureStore.setItemAsync(
          "DecryptedPrivateKey",
          DecryptedPrivateKey
        );
      }
      // Update state  with new token
      dispatch({ type: LOG_IN, payload: res.data.Token });
    } catch (error) {
      // Alert if error
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const Signup = async (user) => {
    try {
      let flag = false;
      Object.values(user).forEach((value) => {
        if (value === "") flag = true;
      });
      if (flag) return SetAlert("Missing Information", "error");
      SetLoading(true);
      const res = await axios.post("user/signup/", { user });
      SetAlert(res.data.msg, res.data.type);
      if (res.data.msg === "user created") return "SignedUp";
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetLoading(false);
    }
  };

  const Logout = async () => {
    dispatch({ type: LOG_OUT });
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("userID");
    await SecureStore.deleteItemAsync("DecryptedPrivateKey");
  };

  const UpdateUser = async (newUser) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.ItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      if (!newUser) return SetAlert("Missing information", "error");
      SetSettingLoading(true);
      const res = await axios.put("/user/update", { newUser });
      SetAlert(res.data.msg, res.data.type);
      getUser();
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetSettingLoading(false);
    }
  };

  const UpdateUserPassword = async ({ CurrentPassword, NewPassword }) => {
    try {
      if (!CurrentPassword) SetAlert("Enter current password");
      if (!NewPassword) SetAlert("Enter new password");
      SetSettingLoading(true);
      const res = await axios.put("/user/change-password", {
        CurrentPassword,
        NewPassword,
      });
      SetAlert(res.data.msg, res.data.type);
      Logout();
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetSettingLoading(false);
    }
  };

  const getUser = async (isRefresh = false) => {
    try {
      // Set token and userID in request headers
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      if (isRefresh) SetRefreshLoading(true);
      else SetSettingLoading(true);
      // Request user information
      const res = await axios.get("/user/get");
      // Check if user friends array is not empty
      if (res?.data?.data?.Friends?.length > 0) {
        let counter = 0;
        for (const friend of res.data.data.Friends) {
          const res2 = await axios.post("/chat", {
            myUsername: res.data.data.Username,
            username: friend.Username,
          });
          const index = res.data.data.Friends.findIndex(
            (item) => friend.Username === item.Username
          );
          const chatIndex = res2.data.data.Users.findIndex(
            (user) => user.Username === res.data.data.Username
          );
          const EncryptedSymmetricKey =
            res2.data.data.Users[chatIndex].EncryptedSymmetricKey;
          const privateKeyPem = await SecureStore.getItemAsync(
            "DecryptedPrivateKey"
          );
          if (!privateKeyPem) return;
          const SymmetricKey = DecryptSymmetricKey(
            EncryptedSymmetricKey,
            privateKeyPem
          );
          res2.data.data.Users[chatIndex].EncryptedSymmetricKey = SymmetricKey;
          Object.assign(res.data.data.Friends[index], { SymmetricKey });
          res.data.data.Friends[index].messages = res2.data.data.Chat.map(
            (item) => {
              return {
                ...item, // Spread the existing attributes
                message: decryptMessage(item.message, SymmetricKey),
              };
            }
          );
          Object.assign(friend, { SymmetricKey });
          Object.assign(res.data.data.Friends[counter], friend);
          counter += 1;
        }
      }
      dispatch({ type: SET_USER, payload: res.data.data });
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetRefreshLoading(false);
      SetSettingLoading(false);
    }
  };

  const SetUser = (user) => dispatch({ type: SET_USER, payload: user });

  const SetLogIn = () => dispatch({ type: LOG_IN });

  const SetSettingLoading = (flag) => {
    dispatch({ type: LOADING, payload: flag });
  };

  const SetRefreshLoading = (flag) => {
    dispatch({ type: SET_REFRESH_LOADING, payload: flag });
  };

  const SetSearchLoading = (flag) => {
    dispatch({ type: SEARCH_LOADING, payload: flag });
  };

  const UploadProfileImage = async (image) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri, // Image URI
        [{ resize: { width: 800 } }], // Resize width (adjust as needed)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Compression settings
      );
      const formData = new FormData();
      formData.append("image", {
        uri: manipulatedImage.uri,
        name: "compressed_image.jpg",
        type: "image/jpeg",
      });
      SetSettingLoading(true);
      const res = await axios.post("/image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          userID: await SecureStore.getItemAsync("userID"),
        },
      });
    } catch (error) {
      SetAlert(
        error.response ? error.response.data.message : error.message,
        "error"
      );
    } finally {
      SetSettingLoading(false);
    }
  };

  const UserSearch = async (username) => {
    try {
      axios.defaults.headers.common["userID"] = await SecureStore.getItemAsync(
        "userID"
      );
      axios.defaults.headers.common["Token"] = await SecureStore.getItemAsync(
        "token"
      );
      SetSearchLoading(true);
      const res = await axios.post("/user/search", { username });
      const res2 = await axios.get("/user/get-friends");
      if (res2.data.data) {
        res.data.UsersFound.Friends = res2.data.data.Friends;
        res.data.UsersFound.Requested_Friends =
          res2.data.data.Requested_Friends;
      }
      dispatch({ type: SET_SEARCH_USERS, payload: res.data.UsersFound });
    } catch (error) {
      // SetAlert(
      //   error.response ? error.response.data.message : error.message,
      //   "error"
      // );
    } finally {
      setTimeout(() => {
        SetSearchLoading(false);
      }, 500);
    }
  };

  // Decrypt the private key
  const decryptPrivateKey = (encryptedData, password) => {
    try {
      const { encryptedPrivateKey, salt, iv } = encryptedData;

      // Decode the salt and IV from Base64
      const decodedSalt = CryptoJS.enc.Base64.parse(salt);
      const decodedIv = CryptoJS.enc.Base64.parse(iv);

      // Derive the key from password and salt
      const key = CryptoJS.PBKDF2(password, decodedSalt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      // Decrypt the private key using AES-CBC
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, key, {
        iv: decodedIv,
      });

      // Convert the decrypted text into a UTF-8 string and return it
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.log(error);
    }
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

  const decryptMessage = (ciphertext, symmetricKey) => {
    const Decrypted = CryptoES.AES.decrypt(ciphertext, symmetricKey);
    return Decrypted.toString(CryptoES.enc.Utf8);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: state.isLoggedIn,
        isSignedUp: state.isSignedUp,
        isSettingsLoading: state.isSettingsLoading,
        user: state.user,
        isSearchLoading: state.isSearchLoading,
        UsersFound: state.UsersFound,
        isRefreshLoading: state.isRefreshLoading,
        SetUser: SetUser,
        Login: Login,
        Logout: Logout,
        Signup: Signup,
        SetLogIn: SetLogIn,
        UpdateUser: UpdateUser,
        getUser: getUser,
        SetRefreshLoading: SetRefreshLoading,
        SetSettingLoading: SetSettingLoading,
        UploadProfileImage: UploadProfileImage,
        UpdateUserPassword: UpdateUserPassword,
        UserSearch: UserSearch,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

import React, { useState, useEffect, useContext } from "react";

import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { AuthContext } from "../../context/Auth/AuthState";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import AuthInput from "./AuthInput";
import Styl from "../../Styl";
import AuthButton from "./AuthButton";
import AuthTitle from "./AuthTitle";

const UserLogin = ({ onSignup }) => {
  const { Login } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const onLogin = () => {
    Keyboard.dismiss();
    Login({ Email, Password });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          {
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "center",
            paddingHorizontal: 20,
          },
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <AuthTitle title={"Login"} />

        <View
          style={[
            { width: "100%" },
            isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
          ]}
        >
          <AuthInput
            placeHolder="Email"
            type="email-address"
            onChange={(val) => setEmail(val)}
            value={Email}
          />
          <AuthInput
            secureTextEntry={true}
            placeHolder="Password"
            onChange={(val) => setPassword(val)}
            value={Password}
          />
          <AuthButton btnText={"Login"} onPress={onLogin} />
          <AuthButton btnText={"Sign Up"} onPress={onSignup} Primary={false} />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default UserLogin;

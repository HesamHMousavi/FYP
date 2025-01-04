import React, { useState, useEffect, useRef, useContext } from "react";

import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { AuthContext } from "../../context/Auth/AuthState";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl from "../../Styl";
import AuthTitle from "./AuthTitle";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

const UserSignUp = ({ onSignup }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { Signup } = useContext(AuthContext);
  const [user, setUser] = useState({
    Email: "",
    Username: "",
    Password: "",
    Phone: "",
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  const onValueChange = (value, name) => {
    setUser({ ...user, [name]: value });
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    const flag = await Signup(user);
    if (flag === "SignedUp") onSignup(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.container,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <AuthTitle title={"Sign Up"} />

        {errorMessage ? (
          <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.inputContainer}>
          <AuthInput
            placeHolder="Username"
            type={Platform.OS === "ios" ? "numeric" : "number-pad"}
            onChange={(text) => onValueChange(text, "Username")}
            value={user.Username}
          />
          <AuthInput
            placeHolder="Email"
            type="email-address"
            onChange={(text) => onValueChange(text, "Email")}
            value={user.Email}
          />
          <AuthInput
            placeHolder="Phone Number"
            type={Platform.OS === "ios" ? "numeric" : "number-pad"}
            onChange={(text) => onValueChange(text, "Phone")}
            value={user.Phone}
          />

          <AuthInput
            placeHolder="Password"
            secureTextEntry={true}
            type={"default"}
            onChange={(text) => onValueChange(text, "Password")}
            value={user.Password}
          />

          <AuthButton
            onPress={handleSignup}
            btnText={"Sign Up"}
            Primary={true}
          />

          <AuthButton
            onPress={() => onSignup(false)}
            btnText={"Login"}
            Primary={false}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorContainer: {
    position: "absolute",
    left: 75,
    top: 80,
    width: 250,
    marginVertical: 0,
    marginHorizontal: "auto",
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
});

export default UserSignUp;

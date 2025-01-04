import React, { useState, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Avatar,
} from "react-native-paper";
import Loader from "../Tools/Loader";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../context/Auth/AuthState";
import Styl, {
  darkColor,
  darkTextColor,
  lightColor,
  lightTextColor,
} from "../../Styl";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { AlertContext } from "../../context/Alert/AlertState";

const Account = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { SetAlert } = useContext(AlertContext);
  const {
    user,
    UpdateUser,
    getUser,
    isSettingsLoading,
    UploadProfileImage,
    UpdateUserPassword,
  } = useContext(AuthContext);

  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    setEmail(user ? user.Email : "");
    setUsername(user ? user.Username : "");
    setPhone(user ? user.Phone : "");
    const imageBase64Uri =
      user && user.ImageData && user.ImageContentType
        ? `data:${user.ImageContentType};base64,${user.ImageData}`
        : "";
    setProfileImage(imageBase64Uri);
  }, [user]);

  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [phone, setPhone] = useState();
  const [CurrentPassword, setCurrentPassword] = useState();
  const [NewPassword, setNewPassword] = useState();
  const [NewPassword2, setNewPassword2] = useState();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  // Function to handle image picking
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      UploadProfileImage(result.assets[0]);
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handlers for save and cancel
  const saveInfo = () => {
    setIsEditingInfo(false);
    const newUser = {
      Email: email,
      Username: username,
      Phone: phone,
    };
    UpdateUser(newUser);
  };

  const cancelEditInfo = () => {
    setIsEditingInfo(false);
    setUsername(user.Username);
    setPhone(user.Phone);
    setEmail(user.Email);
  };

  const savePassword = () => {
    setIsEditingPassword(false);
    if (!NewPassword || !NewPassword2 || !CurrentPassword)
      SetAlert("Fill all inputs");
    if (NewPassword === NewPassword2) {
      setCurrentPassword(null);
      setNewPassword(null);
      setNewPassword2(null);
      return UpdateUserPassword({ CurrentPassword, NewPassword });
    }

    SetAlert("New passwords don't match");
    // Add save logic here (API request)
  };

  const cancelEditPassword = () => {
    setIsEditingPassword(false);
  };
  return isSettingsLoading ? (
    <Loader />
  ) : (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.container,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <ScrollView
          style={[
            { flex: 1 },
            isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
          ]}
        >
          <View
            style={[
              styles.container,
              isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
            ]}
          >
            <Card
              style={[
                styles.card,
                styles.container,
                isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
              ]}
            >
              <Card.Content>
                <View
                  style={[
                    styles.imageContainer,
                    isDarkMode ? {} : styles.shadowLight,
                  ]}
                >
                  <TouchableOpacity onPress={pickImage}>
                    {profileImage ? (
                      <Image
                        source={{
                          uri: profileImage,
                        }}
                        style={[styles.profileImage]}
                      />
                    ) : (
                      <Avatar.Icon size={150} icon="account" />
                    )}
                  </TouchableOpacity>
                </View>
                <Paragraph
                  style={[
                    { color: isDarkMode ? "#aaa" : darkTextColor },
                    { marginBottom: 20 },
                  ]}
                >
                  Edit your account details.
                </Paragraph>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  disabled={!isEditingInfo}
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  textColor={
                    isDarkMode
                      ? isEditingInfo
                        ? lightTextColor
                        : "#666"
                      : isEditingInfo
                      ? darkTextColor
                      : "#999"
                  }
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="email@example.com"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#fff" : "#333",
                    },
                  }}
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  disabled={!isEditingInfo}
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  textColor={
                    isDarkMode
                      ? isEditingInfo
                        ? lightTextColor
                        : "#666"
                      : isEditingInfo
                      ? darkTextColor
                      : "#999"
                  }
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="user1234"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#fff" : "#333",
                    },
                  }}
                />

                <TextInput
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  disabled={!isEditingInfo}
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  textColor={
                    isDarkMode
                      ? isEditingInfo
                        ? lightTextColor
                        : "#666"
                      : isEditingInfo
                      ? darkTextColor
                      : "#999"
                  }
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#fff" : "#333",
                    },
                  }}
                />

                {isEditingInfo ? (
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={saveInfo}
                      style={[styles.button]}
                    >
                      Save
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={cancelEditInfo}
                      style={
                        isDarkMode
                          ? [styles.button, styles.buttonDark]
                          : [[styles.cancelButton]]
                      }
                      labelStyle={{ color: isDarkMode ? "#aaa" : "#333" }}
                    >
                      Cancel
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    style={[
                      styles.button,
                      styles.width100,
                      isDarkMode ? styles.buttonDark : Styl.darkSimpleStyle,
                    ]}
                    onPress={() => setIsEditingInfo(true)}
                    labelStyle={{ color: isDarkMode ? "#aaa" : "#fff" }}
                  >
                    Edit Info
                  </Button>
                )}
              </Card.Content>
            </Card>

            {/* Password Section */}
            <Card
              style={[
                styles.card,
                styles.container,
                isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
              ]}
            >
              <Card.Content>
                <Title
                  style={{
                    color: isDarkMode ? "#aaa" : darkTextColor,
                    marginBottom: 20,
                  }}
                >
                  Change Password
                </Title>
                <TextInput
                  label="Current Password"
                  value={CurrentPassword}
                  onChangeText={(e) => setCurrentPassword(e)}
                  disabled={!isEditingPassword}
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  secureTextEntry={true}
                  textColor={isDarkMode ? "#ddd" : "#333"}
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#ddd" : "#333",
                    },
                  }}
                />
                <Paragraph
                  style={{ color: isDarkMode ? lightTextColor : darkTextColor }}
                >
                  Enter new password
                </Paragraph>
                <TextInput
                  label="New Password"
                  value={NewPassword}
                  onChangeText={(e) => setNewPassword(e)}
                  disabled={!isEditingPassword}
                  secureTextEntry={true}
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  textColor={isDarkMode ? "#ddd" : "#333"}
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#ddd" : "#333",
                    },
                  }}
                />
                <TextInput
                  label="Re-enter Password"
                  value={NewPassword2}
                  onChangeText={(e) => setNewPassword2(e)}
                  disabled={!isEditingPassword}
                  secureTextEntry={true}
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? darkColor : lightColor },
                  ]}
                  textColor={isDarkMode ? "#ddd" : "#333"}
                  mode="outlined"
                  // autoCapitalize={false}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  theme={{
                    colors: {
                      primary: isDarkMode ? "#aaa" : "#222",
                      onSurfaceDisabled: "#aaa",
                      onSurfaceVariant: isDarkMode ? "#ddd" : "#333",
                    },
                  }}
                />

                {isEditingPassword ? (
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={savePassword}
                      style={styles.button}
                    >
                      Save
                    </Button>
                    <Button
                      // mode='outlined'
                      onPress={cancelEditPassword}
                      style={
                        isDarkMode
                          ? [styles.button, styles.buttonDark]
                          : [[styles.cancelButton]]
                      }
                      labelStyle={{ color: isDarkMode ? "#aaa" : "#333" }}
                    >
                      Cancel
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="contained-tonal"
                    style={[
                      styles.button,
                      styles.width100,
                      isDarkMode ? styles.buttonDark : Styl.darkSimpleStyle,
                    ]}
                    labelStyle={{ color: isDarkMode ? "#aaa" : "#fff" }}
                    onPress={() => setIsEditingPassword(true)}
                  >
                    Edit Password
                  </Button>
                )}
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    marginTop: 40,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  input: {
    // width: "100%",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#000",
    width: "48%",
    borderRadius: "10",
  },
  buttonDark: {
    backgroundColor: "transparent",
    borderColor: "#aaa",
    borderWidth: 1,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderColor: "#333",
    width: "48%",
    borderWidth: 1,
    borderRadius: 10,
  },
  width100: {
    width: "100%",
  },
  profileImage: {
    alignSelf: "center",
    justifySelf: "center",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#333",
    padding: 10,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 25,
  },
  editImageButton: {
    marginTop: 10,
    width: "60%",
    height: 40,
    backgroundColor: "#fff",
    borderColor: "#888",
    borderRadius: 10,
    // borderWidth: 1,
  },
  shadowLight: {
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default Account;

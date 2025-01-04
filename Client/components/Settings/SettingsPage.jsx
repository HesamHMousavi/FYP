import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Button,
} from "react-native";
import { Avatar } from "react-native-paper";
import { AuthContext } from "../../context/Auth/AuthState";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Loader from "../Tools/Loader";
import Option from "../Tools/Option";
import Styl from "../../Styl";

const SettingsPage = ({ navigation }) => {
  const { Logout, getUser, user, isSettingsLoading } = useContext(AuthContext);
  const { isDarkMode, setDarkMode } = useContext(ThemeContext);
  const [imageUri, setImageUri] = useState("");
  const [username, setUsername] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const toggleMode = () => setDarkMode(!isDarkMode);
  const [scaleAnim] = useState(new Animated.Value(0)); // Initial scale
  const openModal = () => {
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 100,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  const closeModal = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      friction: 100,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    setImageUri(
      user && user.ImageData
        ? `data:${user.ImageContentType};base64,${user.ImageData}`
        : "https://via.placeholder.com/100"
    );
    setUsername(user ? user.Username : "");
  }, [user]);

  const onChangeMode = async () => {
    toggleMode();
  };
  return isSettingsLoading ? (
    <Loader />
  ) : (
    <>
      <Modal
        transparent={true} // Set transparent to false for a full-screen modal
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalBackground]}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Button title="Close" onPress={closeModal} color="#fff" />
            </View>
            <Image source={{ uri: imageUri }} style={[styles.fullImage]} />
          </Animated.View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={[
            styles.container,
            isDarkMode ? Styl.darkSimpleStyle : "#F0F0F5",
          ]}
        >
          <View
            style={[
              styles.profileHeader,
              isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
            ]}
          >
            <View
              style={[
                styles.profileImageContainer,
                isDarkMode ? {} : styles.shadowLight,
              ]}
            >
              {imageUri ? (
                <TouchableOpacity onPress={openModal}>
                  <Image
                    source={{
                      uri: imageUri,
                    }}
                    style={[
                      styles.profileImage,
                      isDarkMode ? styles.imgBorderDark : styles.imgBorderLight,
                    ]}
                  />
                </TouchableOpacity>
              ) : (
                <Avatar.Icon size={140} icon="account" />
              )}
            </View>
            <Text
              style={[
                styles.username,
                isDarkMode ? Styl.lightText : Styl.darkText,
              ]}
            >
              {username}
            </Text>
          </View>

          <View style={styles.settingsContainer}>
            <Option
              onPress={() => navigation.navigate("Account")}
              icon={"person"}
              title={"Account"}
              isFirst={true}
            />
            <Option
              icon={"notifications"}
              title={"Notifications"}
              onPress={() => navigation.navigate("NotificationManager")}
            />
            <Option
              onPress={() => navigation.navigate("securityPage")}
              icon={"security"}
              title={"Security"}
            />
            <Option icon={"edit-location"} title={"Location Settings"} />
            <Option
              onPress={() => navigation.navigate("ThemeOptions")}
              icon={isDarkMode ? "nightlight" : "wb-sunny"}
              title={isDarkMode ? "Dark Mode" : "Light Mode"}
              isSwitch={true}
              onChangeSwitch={onChangeMode}
            />
            <Option
              icon={"block"}
              title={"Blocked Users"}
              iconColor={
                isDarkMode ? "rgba(255, 77, 77, 0.6)" : "rgba(255, 0, 0, 0.55)"
              }
            />
            <Option
              onPress={() => Logout()}
              icon={"logout"}
              title={"Log out"}
              iconColor={
                isDarkMode ? "rgba(255, 77, 77, 0.6)" : "rgba(255, 0, 0, 0.55)"
              }
              isLast={true}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F0F5",
  },
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderRadius: 10,
  },
  profileImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 25,
  },
  shadowLight: {
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderColor: "#fff",
    borderWidth: 2,
    borderColor: "#333",
  },
  username: {
    fontSize: 17,
    color: "rgba(0, 0, 0, 0.7)",
    marginTop: 20,
  },
  settingsContainer: {
    paddingHorizontal: 15,
  },
  thumbnail: {
    width: 70,
    height: 70,
    margin: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  modalHeader: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  fullImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  imgBorderDark: {
    borderColor: "#fff",
  },
  imgBorderLight: {
    borderColor: "#aaa",
  },
});

export default SettingsPage;

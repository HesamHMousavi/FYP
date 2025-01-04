import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import Styl from "../../../Styl";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import { ChatContext } from "../../../context/Chat/ChatState";
import ModelYesNo from "../../Tools/ModelYesNo";
import { AlertContext } from "../../../context/Alert/AlertState";
import { RelationContext } from "../../../context/Relations/RelationState";
import Modal from "react-native-modal";
import ImageZoomViewer from "react-native-image-zoom-viewer";
import { MaterialIcons } from "@expo/vector-icons";
import Option from "../../Tools/Option";

const UserProfile = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { selectedChat, ClearChat, setChatPage } = useContext(ChatContext);
  const { ModelVisible, setModel } = useContext(AlertContext);
  const { DeleteRequest } = useContext(RelationContext);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [clearModel, setClearModel] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: selectedChat ? selectedChat.username : "Chat",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={30}
            color={isDarkMode ? "#fff" : "#000"}
          />
          <Text
            style={{
              marginLeft: 5,
              fontSize: 18,
              color: isDarkMode ? "#fff" : "#000",
            }}
          ></Text>
        </TouchableOpacity>
      ),
    });
  }, []);
  useEffect(() => {
    setChatPage(false);
  }, []);

  const onRemove = () => {
    setModel(true);
  };

  const onYes = () => {
    DeleteRequest(selectedChat.username);
    setModel(false);
    navigation.navigate("ChatsHome");
  };

  const onNo = () => {
    setModel(false);
  };

  const toggleImagePreview = () => {
    setPreviewVisible(!isPreviewVisible);
  };

  const onClearChat = () => {
    setClearModel(true);
  };

  const onYesClear = () => {
    setClearModel(false);
    ClearChat();
  };

  const onNoClear = () => {
    setClearModel(false);
  };

  const onScheduleMessagePress = () => {
    navigation.navigate("ScheduleMessagePage");
  };

  const imageSource = selectedChat?.ImageData
    ? {
        uri: `data:${selectedChat?.ImageContentType};base64,${selectedChat?.ImageData}`,
      }
    : { uri: "https://via.placeholder.com/100" };

  const imageUrls = [{ url: imageSource.uri }];

  return (
    <ScrollView
      style={[
        styles.container,
        isDarkMode ? Styl.darkSimpleStyle : { backgroundColor: "#F5F5F5" },
      ]}
    >
      {ModelVisible && (
        <ModelYesNo
          question={
            <Text>
              Are you sure you want to remove{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedChat.username}
              </Text>{" "}
              ?
            </Text>
          }
          title={
            <Text>
              Remove{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedChat.username}
              </Text>{" "}
              ?
            </Text>
          }
          onNo={onNo}
          onYes={onYes}
        />
      )}
      {clearModel && (
        <ModelYesNo
          title={"Clear Conversation"}
          question={
            <Text>
              Are you sure you want to clear the conversation between you and{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedChat.username}
              </Text>{" "}
              ?
            </Text>
          }
          onNo={onNoClear}
          onYes={onYesClear}
        />
      )}

      <View
        style={[
          styles.card,
          isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
        ]}
      >
        <TouchableOpacity onPress={toggleImagePreview}>
          <Image
            style={[
              styles.profileImage,
              isDarkMode ? { borderColor: "#aaa" } : { borderColor: "#333" },
            ]}
            source={imageSource}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.userName,
            isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
          ]}
        >
          {selectedChat?.username}
        </Text>
      </View>

      <View style={[styles.optionsContainer]}>
        <Option
          onPress={onScheduleMessagePress}
          title={"Schedule Message"}
          icon={"schedule-send"}
          isFirst={true}
        />
        <Option
          onPress={() => navigation.navigate("ChatNotificationManager")}
          title={"Edit Notifications"}
          icon={"edit-notifications"}
        />
        <Option
          onPress={onClearChat}
          title={"Clear Chat"}
          icon={"clear-all"}
          iconColor={
            isDarkMode ? "rgba(255, 77, 77, 0.6)" : "rgba(255, 0, 0, 0.55)"
          }
        />
        <Option
          onPress={onRemove}
          title={"Remove " + selectedChat.username}
          icon={"remove-circle"}
          iconColor={
            isDarkMode ? "rgba(255, 77, 77, 0.6)" : "rgba(255, 0, 0, 0.55)"
          }
        />

        <Option
          // onPress={onRemove}
          title={"Block " + selectedChat.username}
          icon={"block"}
          isLast={true}
          iconColor={
            isDarkMode ? "rgba(255, 77, 77, 0.6)" : "rgba(255, 0, 0, 0.55)"
          }
        />
      </View>

      <Modal
        isVisible={isPreviewVisible}
        style={styles.modal}
        onBackdropPress={toggleImagePreview}
      >
        <View style={styles.modalContent}>
          <ImageZoomViewer
            imageUrls={imageUrls}
            enableImageZoom={true}
            onCancel={toggleImagePreview}
            style={styles.imageZoom}
            renderIndicator={() => null}
          />
          <TouchableOpacity
            onPress={toggleImagePreview}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 20,
    marginVertical: 10,
    marginTop: 40,

    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    borderWidth: 1.5,
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    color: "#555",
  },
  optionsContainer: {
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -25 }],
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 10,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 15,
    color: "#333", // Close button color
  },
  imageZoom: {
    width: "100%",
    height: "100%",
  },
});

export default UserProfile;

import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import { ChatContext } from "../../../context/Chat/ChatState";
import { AlertContext } from "../../../context/Alert/AlertState";
import DateTimePicker from "@react-native-community/datetimepicker";
import Styl from "../../../Styl";
import { AuthContext } from "../../../context/Auth/AuthState";
import CustomInput from "../../Tools/CustomInput";

const SchduleMessageModal = ({
  modalVisible,
  toggleModal,
  isEditModal,
  setEditModal,
  SelectedDate = null,
  editMessage = null,
  TaskID = null,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { SetAlert } = useContext(AlertContext);
  const { selectedChat, onScheduleMessage, updateTask } =
    useContext(ChatContext);
  const [message, setMessage] = useState("");
  const [corn, setCorn] = useState();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    if (isEditModal) {
      setDateTime(SelectedDate);
      setCorn(dateToCron(SelectedDate));
      setMessage(editMessage);
    } else setDateTime(new Date());
  }, []);

  // Listen to value change from datetimepicker component, and create nre corn expression
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateTime;
    setDateTime(currentDate);
    setCorn(dateToCron(currentDate));
  };

  // Set new schduled message in the datebase
  const scheduleMessage = () => {
    if (!message) {
      SetAlert("Please enter a message", "error");
      return;
    }
    if (!corn) {
      SetAlert("Please choose date & time", "error");
      return;
    }
    if (isEditModal) {
      updateTask({
        message: message,
        cornEx: corn,
        receiver: selectedChat.username,
        taskId: TaskID,
      });
    } else {
      onScheduleMessage({
        username: user.Username,
        message: message,
        userID: selectedChat.id,
        receiver: selectedChat.username,
        cornEx: corn,
      });
    }
    setMessage("");
    toggleModal(false);
    SetAlert(`Message${isEditModal ? " Res" : " S"}cheduled.`, "success");
  };

  const Cancel = () => {
    toggleModal(false);
    if (isEditModal) setEditModal(false);
  };

  const dateToCron = (date) => {
    const currentDate = date || dateTime;
    return `${currentDate.getMinutes()} ${currentDate.getHours()} ${currentDate.getDate()} ${
      currentDate.getMonth() + 1
    } *`;
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => toggleModal(false)}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.modalContent,
            isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
          ]}
        >
          <Text
            style={[
              modalStyles.modalTitle,
              isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
            ]}
          >
            {isEditModal ? "Edit Message" : "Schedule Message"}
          </Text>
          <CustomInput
            onChange={setMessage}
            value={message}
            placeholder={"Enter your message"}
          />
          {/* <TextInput
            style={[
              modalStyles.input,
              isDarkMode ? Styl.darkSimpleStyle2 : Styl.lightSimpleStyle,
            ]}
            placeholder="Enter your message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#888"
          /> */}
          <DateTimePicker
            value={dateTime}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={new Date()}
            textColor={isDarkMode ? "#fff" : "#333"}
          />
          <TouchableOpacity
            style={[
              modalStyles.set,
              modalStyles.btn,
              isDarkMode ? Styl.lightSimpleStyle : Styl.darkSimpleStyle2,
            ]}
            onPress={scheduleMessage}
          >
            <Text
              style={[
                modalStyles.setText,
                isDarkMode ? { color: "#333" } : { color: "#fff" },
                isDarkMode ? Styl.lightSimpleStyle : Styl.darkSimpleStyle2,
              ]}
            >
              {isEditModal ? "Reschedule Message" : "Schedule Message"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.cancel,
              modalStyles.btn,
              !isDarkMode ? { borderColor: "#aaa" } : { borderColor: "#555" },
            ]}
            onPress={() => Cancel()}
          >
            <Text
              style={[
                modalStyles.cancelText,
                isDarkMode ? { color: "#ddd" } : { color: "#333" },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent backdrop
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    marginVertical: 15,
  },
  btn: {
    minWidth: 160,
  },
  cancel: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.55)",
    padding: 13,
    borderRadius: 5,
  },
  set: {
    padding: 13,
    borderRadius: 5,
    marginVertical: 15,
  },
  setText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
  },
  cancelText: {
    fontSize: 15,
    textAlign: "center",
    color: "rgba(255, 0, 0, 0.55)",
  },
});

export default SchduleMessageModal;

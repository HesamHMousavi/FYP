import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import io from "socket.io-client";
import DateTimePicker from "@react-native-community/datetimepicker";

const socket = io("http://localhost:3000"); // Change this URL based on your server location

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [messages, setMessages] = useState([]);

  const scheduleMessage = () => {
    if (!message) {
      Alert.alert("Please enter a message");
      return;
    }

    const cronExpression = `${dateTime.getMinutes()} ${dateTime.getHours()} ${dateTime.getDate()} ${
      dateTime.getMonth() + 1
    } *`;

    socket.emit("scheduleMessage", { message, cronExpression });
    setMessage("");
    setShowPicker(false);
    setModalVisible(false);
    Alert.alert(
      "Message Scheduled!",
      `Your message will be sent at ${dateTime.toLocaleString()}.`
    );
  };

  socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateTime;
    setShowPicker(false);
    setDateTime(currentDate);
  };

  return (
    <View style={styles.container}>
      <Button
        title='Schedule a Message'
        onPress={() => setModalVisible(true)}
      />

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Schedule a Message</Text>
            <TextInput
              placeholder='Enter your message'
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>Pick Date & Time</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={dateTime}
                mode='datetime'
                display='default'
                onChange={handleDateChange}
                style={styles.dateTimePicker}
              />
            )}
            <Button title='Schedule Message' onPress={scheduleMessage} />
            <Button
              title='Cancel'
              onPress={() => setModalVisible(false)}
              color='red'
            />
          </View>
        </View>
      </Modal>

      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  modalContainer2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  datePickerButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  datePickerText: {
    color: "white",
    fontWeight: "bold",
  },
  message: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
  },
  messageList: {
    marginTop: 20,
  },
});

export default App;

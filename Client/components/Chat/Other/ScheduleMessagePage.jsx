import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Styl from "../../../Styl";
import { ThemeContext } from "../../../context/Theme/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import ModelYesNo from "../../Tools/ModelYesNo";
import { ChatContext } from "../../../context/Chat/ChatState";
import Loader from "../../Tools/Loader";
import { MaterialIcons } from "@expo/vector-icons";
import { format, isWithinInterval, addDays, isToday } from "date-fns";
import cronParser from "cron-parser";
import { AlertContext } from "../../../context/Alert/AlertState";
import SchduleMessageModal from "./SchduleMessageModal";
const generateRandomId = () => {
  return (
    "id-" +
    Math.random().toString(36).slice(2, 9) +
    "-" +
    Date.now().toString(36)
  );
};

const Option = ({ onDelete, onEdit, item }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { isTasksLoading } = useContext(AlertContext);

  const cornToDate = (cronExpression) => {
    try {
      // Parse the cron expression
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: new Date(), // Set the base date for parsing
      });

      // Get the next occurrence date
      const date = interval.next().toDate();

      // Check if the date is today
      if (isToday(date)) {
        return `Today, ${format(date, "HH:mm")}`;
      }

      // Check if the date is within the next 7 days
      const now = new Date();
      const withinNext7Days = isWithinInterval(date, {
        start: now,
        end: addDays(now, 7),
      });

      if (withinNext7Days) {
        // Format for dates within the next 7 days
        return format(date, "EEE d'th' HH:mm");
      } else {
        // Format for dates beyond 7 days
        return format(date, "MMM d'th' HH:mm");
      }
    } catch (error) {
      console.error("Invalid cron expression:", error.message);
      return null;
    }
  };

  return (
    <View
      style={[
        styles.optionButton,
        isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
      ]}
    >
      <View style={styles.textCon}>
        <Text
          style={[
            styles.optionText,
            isDarkMode ? Styl.darkSimpleStyle3 : Styl.lightSimpleStyle,
          ]}
        >
          {item.message}
        </Text>
        <Text style={styles.timeStamp}>{cornToDate(item.cornExpression)}</Text>
      </View>
      <View style={styles.iconCon}>
        <TouchableOpacity
          onPress={() => onEdit(item.message, item.cornExpression, item.taskId)}
        >
          <Icon name="edit" size={22} color="#77A0F2" style={styles.mgRight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.taskId)}>
          <Icon name="delete" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ScheduleMessagePage = ({ navigation }) => {
  const [editMessage, setEditMessage] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [isEditModal, setEditModal] = useState(false);
  const { getTasks, Tasks, onDeleteTask } = useContext(ChatContext);
  const { isTasksLoading } = useContext(AlertContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [ModelVisible, setModalVisible] = useState(false);
  const [TaskID, setTaskId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setScheduleModalVisible(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
          }}
        >
          <MaterialIcons
            name="add"
            size={35}
            color={isDarkMode ? "#fff" : "#000"}
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
      ),
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
    getTasks();
  }, []);

  const cornToDate = (cronExpression) => {
    try {
      const interval = cronParser.parseExpression(cronExpression);
      const nextDate = interval.next().toDate();
      return nextDate;
    } catch (error) {
      console.error("Error parsing cron expression:", error.message);
    }
  };

  const onEdit = (message, cornEx, taskId) => {
    setEditMessage(message);
    setTaskId(taskId);
    setDateTime(cornToDate(cornEx));
    setEditModal(true);
    setScheduleModalVisible(true);
  };

  const onDelete = (taskId) => {
    setModalVisible(true);
    setTaskId(taskId);
  };

  const onYes = () => {
    setModalVisible(false);
    onDeleteTask(TaskID);
  };

  const onNo = () => {
    setTaskId(null);
    setModalVisible(false);
  };

  return isTasksLoading ? (
    <Loader />
  ) : (
    <ScrollView
      style={[
        styles.container,
        isDarkMode ? Styl.darkSimpleStyle : { backgroundColor: "#eee" },
      ]}
    >
      <View style={[styles.optionsContainer]}>
        {Tasks.length > 0 ? (
          Tasks.map((item) => (
            <Option
              item={item}
              key={item.taskId || generateRandomId()}
              name={"Schedule Message"}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <View style={styles.center}>
            <Text
              style={[
                isDarkMode ? { color: "#ddd" } : { color: "#333" },
                { marginTop: 50, fontSize: 17 },
              ]}
            >
              No Scheduled Messages
            </Text>
          </View>
        )}
        {ModelVisible && (
          <ModelYesNo
            onNo={onNo}
            onYes={onYes}
            question={"Are you sure you want to delete this message?"}
          />
        )}
        {scheduleModalVisible && (
          <SchduleMessageModal
            modalVisible={scheduleModalVisible}
            toggleModal={setScheduleModalVisible}
            SelectedDate={dateTime}
            setEditModal={setEditModal}
            isEditModal={isEditModal}
            editMessage={editMessage}
            TaskID={TaskID}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginTop: 20,
  },
  timeStamp: {
    marginTop: 5,
    color: "#aaa",
  },
  mgRight: {
    marginTop: 2,
    marginRight: 10,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 3,
  },
  iconCon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ScheduleMessagePage;

import React, { useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl from "../../Styl";

const ModelYesNo = ({ title, question, onYes, onNo, visible }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const Flag = isDarkMode ? Styl.darkSimpleStyle2 : Styl.lightSimpleStyle;
  const FlagBtn = !isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle;
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, Flag]}>
          <Text style={[styles.title, Flag]}>{title}</Text>
          <Text style={[styles.question, Flag]}>{question}</Text>
          <View style={[styles.buttonContainer, Flag]}>
            <TouchableOpacity style={[styles.btn, FlagBtn]} onPress={onYes}>
              <Text style={[styles.btnText, FlagBtn]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                isDarkMode
                  ? { backgroundColor: "#333" }
                  : { backgroundColor: "#ddd" },
              ]}
              onPress={onNo}
            >
              <Text
                style={[
                  styles.btnText,
                  isDarkMode
                    ? { backgroundColor: "#333", color: "#ddd" }
                    : { backgroundColor: "#ddd", color: "#333p" },
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 4,
    alignItems: "center",
  },
  btnText: {
    fontSize: 15,
    // fontWeight: "",
  },
});

export default ModelYesNo;

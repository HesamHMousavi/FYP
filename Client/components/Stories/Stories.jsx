import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  Fragment,
} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";

import SafeAreaView from "react-native-safe-area-view";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import Styl, { darkTextColor, lightColor, lightTextColor } from "../../Styl";
import { Animated } from "react-native";
import CustomInput from "../Tools/CustomInput";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const Stack = createStackNavigator();
const StoriesPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StoriesPage"
        component={Stories}
        options={{
          title: "Stories",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};

const Stories = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [paused, setPaused] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [timer, setTimer] = useState(0);
  const [currentUri, setUri] = useState("");
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progressArray, setProgressArray] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentStoryIndexRef = useRef(currentStoryIndex);
  const progressArrayRef = useRef(progressArray);
  const currentUriRef = useRef(currentUri);
  const pausedRef = useRef(paused);
  const selectedRef = useRef(selectedStory);
  const timerRef = useRef(timer);

  const friendsStories = [
    {
      id: "1",
      name: "Friend 1",
      story: [
        "https://via.placeholder.com/400",
        "https://fakeimg.pl/600x400",
        "https://via.placeholder.com/400",
      ],
    },
    { id: "2", name: "Friend 2", story: ["https://via.placeholder.com/400"] },
    { id: "3", name: "Friend 3", story: ["https://via.placeholder.com/400"] },
    { id: "4", name: "Friend 4", story: ["https://via.placeholder.com/400"] },
    { id: "5", name: "Friend 5", story: ["https://via.placeholder.com/400"] },
    { id: "6", name: "Friend 6", story: ["https://via.placeholder.com/400"] },
    { id: "7", name: "Friend 7", story: ["https://via.placeholder.com/400"] },
  ];

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.launchImageLibraryAsync.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUserStory(result.assets[0].uri);
    }
  };

  const resetProgress = (story) => {
    setTimer(0);
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    setProgressArray(new Array(story.length).fill(0));
  };

  const viewStory = (story) => {
    resetProgress(story);
    setSelectedStory(story);
    setCurrentStoryIndex(0); // Start from the first story
    setUri(story[0]);
    currentUriRef.current = story[0];
  };

  // useEffect to handle subsequent actions after state update
  useEffect(() => {
    if (selectedStory && selectedStory.length > 0) {
      setCurrentStoryIndex(0); // Start from the first story
      setUri(selectedStory[0]); // Set the first story's URI
      animateProgressBar(0, selectedStory); // Start animation
    }
  }, [selectedStory]);

  const closeStory = () => {
    resetProgress(selectedStory);
    setSelectedStory(null);
  };

  const holdStory = () => {
    setPaused(true);
    progressAnim.stopAnimation((value) => {
      const updatedProgressArray = [...progressArray];
      updatedProgressArray[currentStoryIndexRef.current] = value;
      setProgressArray(updatedProgressArray);
      setTimer(((value - 0.02) * 3000) / 1000);
    });
  };

  const releaseStory = () => {
    setPaused(false);
    animateProgressBar(
      progressArray[currentStoryIndexRef.current],
      selectedRef.current
    );
  };

  useEffect(() => {
    currentStoryIndexRef.current = currentStoryIndex; // Sync ref with state
  }, [currentStoryIndex]);

  useEffect(() => {
    pausedRef.current = paused; // Sync ref with state
  }, [paused]);

  useEffect(() => {
    currentUriRef.current = currentUri; // Sync ref with state
  }, [currentUri]);

  useEffect(() => {
    selectedRef.current = selectedStory; // Sync ref with state
  }, [selectedStory]);

  useEffect(() => {
    timerRef.current = timer; // Sync ref with state
  }, [timer]);

  useEffect(() => {
    const updatedProgressArray = [...progressArray];
    updatedProgressArray[currentStoryIndex] = progressAnim.__getValue(); // Access the current animated value
    setProgressArray(updatedProgressArray);
  }, [progressAnim]);

  useEffect(() => {
    if (selectedStory && !paused) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      if (timer >= 3 * selectedStory.length) {
        clearInterval(interval);
        closeStory();
      }
      if (timer % 3 == 0) {
        setUri(selectedStory[timer / 3]);
      }

      return () => clearInterval(interval);
    }
  }, [timer, selectedStory, paused]);

  useEffect(() => {
    progressArrayRef.current = progressArray; // Sync ref with state
  }, [progressArray]);

  const animateProgressBar = (startProgress, story) => {
    progressAnim.setValue(startProgress);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: (1 - startProgress) * 3000, // Duration for one story
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !pausedRef.current) {
        // Mark the current story's progress as completed
        const updatedProgressArray = [...progressArrayRef.current];
        updatedProgressArray[currentStoryIndexRef.current] = 1;
        setProgressArray(updatedProgressArray);
        // Move to the next story or close if it's the last one
        goToNextStory(story);
      }
    });
  };

  const goToNextStory = (story) => {
    const nextIndex = currentStoryIndexRef.current + 1; // Use the ref for up-to-date value
    if (nextIndex < story.length) {
      setCurrentStoryIndex(nextIndex); // Update state
      currentStoryIndexRef.current = nextIndex; // Update ref
      currentUriRef.current = selectedStory[nextIndex];
      setUri(story[nextIndex]);
      animateProgressBar(0, story); // Restart animation for the new story
    } else {
      closeStory(); // End of stories
    }
  };

  const prevStory = () => {
    // Mark the current story's progress as completed
    if (currentStoryIndexRef.current === 0) {
      resetProgress(selectedStory);
      animateProgressBar(0, selectedStory);
    } else {
      // setUri(currentStoryIndexRef.current);
      const updatedProgressArray = [...progressArrayRef.current];
      updatedProgressArray[currentStoryIndexRef.current] = 0;
      setProgressArray(updatedProgressArray);

      const nextIndex = currentStoryIndexRef.current - 1; // Use the ref for up-to-date value
      currentUriRef.current = selectedStory[currentStoryIndexRef.current - 1];
      if (nextIndex < selectedStory.length) {
        setCurrentStoryIndex(nextIndex); // Update state
        currentStoryIndexRef.current = nextIndex; // Update ref
        animateProgressBar(0, selectedStory);
      }
    }
    if (currentStoryIndexRef.current > 1) {
      setTimer(currentStoryIndexRef.current * 3000);
    } else {
      setTimer(0);
    }
  };

  const nextStory = () => {
    const updatedProgressArray = [...progressArrayRef.current];
    updatedProgressArray[currentStoryIndexRef.current] = 1;
    setProgressArray(updatedProgressArray);

    const nextIndex = currentStoryIndexRef.current + 1;
    if (nextIndex < selectedStory.length) {
      setCurrentStoryIndex(nextIndex); // Update state
      currentStoryIndexRef.current = nextIndex; // Update ref
      currentUriRef.current = selectedStory[nextIndex];
      setTimeout(() => animateProgressBar(0, selectedStory), 10);

      // setTimer(currentStoryIndexRef.current - 1 * 3000);
    } else {
      closeStory();
    }
  };
  if (currentStoryIndexRef.current > 1) {
    // setTimer(currentStoryIndexRef.current * 3000);
  } else {
    // setTimer(0);
  }

  const renderStoryItem = ({ item, isUser }) => (
    <View
      style={[
        styles.spaceBetween,
        isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        !isUser
          ? isDarkMode
            ? { borderBottomColor: "#222", borderBottomWidth: 1 }
            : { borderBottomWidth: 0 }
          : {},
      ]}
    >
      {isUser && (
        <View
          style={[
            styles.addIcon,
            isDarkMode ? { borderColor: "#222" } : { borderColor: "#fff" },
          ]}
        >
          <Ionicons name="add" size={18} color={isDarkMode ? "#222" : "#fff"} />
        </View>
      )}
      <View
        style={[
          styles.storyContainer,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <View style={[styles.activeStoryBorder]}>
          <Image
            source={{
              uri: "https://via.placeholder.com/400",
            }}
            style={[styles.profileImage]}
          />
        </View>
        <View>
          <Text
            style={[
              styles.storyName,
              isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
            ]}
          >
            {isUser ? "My Story" : item.name}
          </Text>
          {
            <Text style={[styles.subHeading]}>
              {isUser ? "Add your status" : "20:21"}
            </Text>
          }
        </View>
        {!isUser && (
          <TouchableOpacity
            style={styles.storyOverlay}
            onPress={() => viewStory(item.story)}
          />
        )}
      </View>
      {isUser && (
        <TouchableOpacity
          style={[
            styles.cameraIcon,
            isDarkMode
              ? { backgroundColor: "#333" }
              : { backgroundColor: "#ddd" },
          ]}
          onPress={openGallery}
        >
          <Ionicons
            name="camera"
            size={18}
            color={isDarkMode ? "#ddd" : "#777"}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Fragment>
      <StatusBar
        barStyle={
          selectedStory
            ? "light-content"
            : isDarkMode
            ? "light-content"
            : "dark-content"
        }
      />

      <View
        style={[
          styles.container,
          isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
        ]}
      >
        <CustomInput
          onChange={(text) => setSearchQuery(text)}
          value={searchQuery}
          placeholder={"Search"}
        />
        <View
          style={[
            styles.updateCon,
            isDarkMode
              ? { borderBottomColor: "#333" }
              : { borderBottomColor: "#ddd" },
          ]}
        >
          <Text
            style={[
              styles.updates,
              isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
            ]}
          >
            Status
          </Text>
        </View>
        {/* User's Story */}
        {renderStoryItem({ isUser: true })}
        <View
          style={[
            styles.updateCon,
            isDarkMode
              ? { borderBottomColor: "#333" }
              : { borderBottomColor: "#ddd" },
          ]}
        >
          <Text
            style={[
              styles.updates,
              isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
            ]}
          >
            Updates
          </Text>
        </View>

        {/* Friends' Stories */}
        <FlatList
          // scrollEnabled={false}
          data={friendsStories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderStoryItem({ item, isUser: false })}
          style={{
            paddingBottom: 50,
          }}
        />

        {/* Story Modal */}
        {selectedStory && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={!!selectedStory}
          >
            <SafeAreaView style={styles.modalContainer}>
              <TouchableWithoutFeedback
                onPressIn={holdStory}
                onPressOut={releaseStory}
              >
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    onPress={prevStory}
                    style={[styles.overlay, { left: 0 }]}
                  ></TouchableOpacity>

                  <TouchableOpacity
                    onPress={nextStory}
                    style={[styles.overlay, { right: 0 }]}
                  ></TouchableOpacity>
                  <View style={styles.fullStoryProfile}>
                    <Image
                      source={{ uri: currentUriRef.current }}
                      style={styles.fullStoryProfilePic}
                    />
                    <Text style={[styles.fullStoryProfileText]}>Name</Text>
                    <Text
                      style={[
                        styles.fullStoryProfileText,
                        { color: "#aaa", marginLeft: 5 },
                      ]}
                    >
                      14h
                    </Text>
                  </View>
                  <Image
                    source={{ uri: currentUriRef.current }}
                    style={styles.fullStory}
                  />
                  <View style={styles.timelineWrapper}>
                    {selectedStory.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.timelineContainer,
                          { flex: index === currentStoryIndex ? 1 : 0.95 },
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.timelineProgress,
                            {
                              width:
                                index === currentStoryIndex
                                  ? progressAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: ["0%", "100%"],
                                    })
                                  : progressArray[index] * 100 + "%",
                            },
                          ]}
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.closeStory}
                      onPress={closeStory}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color="#aaa"
                        style={styles.searchIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <View style={[styles.searchBarContainer, styles.commentSection]}>
                <TextInput
                  style={[styles.searchBar, styles.commentSectionTextInput]}
                  placeholder="Add a comment"
                  placeholderTextColor={"#666"}
                ></TextInput>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </View>
    </Fragment>
    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#333",
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchBarContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 5,
    height: 35,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  searchIcon: {
    marginLeft: 5,
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storyContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    marginVertical: 10,
    position: "relative",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  cameraIcon: {
    backgroundColor: "#ddd",
    borderRadius: 18,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  storyName: {
    marginLeft: 20,
    marginTop: 5,
    fontSize: 16,
    color: "#333",
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  modalContainer: {
    flex: 1, // Take up the full screen space
    backgroundColor: "black",
  },
  modalContent: {
    position: "relative",
    flexGrow: 1,
    backgroundColor: "rgba(0, 0, 0, 1)", // Slightly darkened background for the modal
    justifyContent: "center",
    alignItems: "center",
    maxHeight: screenHeight,
  },
  fullStory: {
    width: screenWidth, // The image will be as wide as the screen
    height: undefined, // Let the height be calculated based on the aspect ratio
    maxHeight: screenHeight,
    aspectRatio: 1, // Set the aspect ratio based on the image's width/height ratio
    resizeMode: "cover",
  },
  timelineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    width: "100%",
    paddingHorizontal: 5,
  },
  timelineContainer: {
    flex: 1, // 95% for the progress bar
    height: 5,
    backgroundColor: "#333",
    borderRadius: 2.5,
    marginRight: 5,
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2.5,
  },
  closeStory: {
    width: "auto", // 5% for the close button
    height: 30, // Adjust the height for better alignment
    justifyContent: "center",
    alignItems: "center",
  },
  closeStoryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  updates: {
    fontSize: 30,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  updateCon: {
    marginHorizontal: 10,
    // paddingTop: 10,
    borderBottomWidth: 1, // Adds bottom border
    borderBottomColor: "#ddd",
  },
  subHeading: {
    marginLeft: 20,
    marginTop: 2.5,
    fontSize: 12,
    color: "#999",
  },

  activeStoryBorder: {
    borderColor: "#77A0F2",
    borderRadius: "50%",
    borderWidth: 1.5,
    padding: 1.5,
  },
  inactiveStoryBorder: {
    borderColor: "#aaa",
    borderRadius: "50%",
    borderWidth: 1.5,
    padding: 1.5,
  },
  addIcon: {
    position: "absolute",
    zIndex: 20,
    top: 55,
    left: 45,
    backgroundColor: "#77A0F2",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    height: 20,
    width: 20,
    borderWidth: 1.4,
    borderColor: "#222",
  },
  fullStoryProfile: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 55,
    left: 10,
  },
  fullStoryProfilePic: {
    height: 40,
    width: 40,
    borderRadius: "50%",
  },
  fullStoryProfileText: {
    color: "#ddd",
    marginTop: 5,
    marginLeft: 10,
  },
  commentSection: {
    marginHorizontal: 10,
    backgroundColor: "#333",
  },
  commentSectionTextInput: {
    backgroundColor: "#333",
    color: "#ddd",
    placeholderTextColor: "#ddd",
  },
  overlay: {
    top: 0,
    position: "absolute",
    // backgroundColor: "rgba(0, 0, 0, 0.1)",
    height: "100%",
    width: "25%",
    zIndex: 100,
  },
});

export default StoriesPage;

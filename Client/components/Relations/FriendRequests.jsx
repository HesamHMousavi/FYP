import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Styl from "../../Styl";
import { RelationContext } from "../../context/Relations/RelationState";
import RenderRequest from "./RenderRequest";
import CustomInput from "../Tools/CustomInput";

const FriendRequests = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const {
    GetFriendRequests,
    Requests,
    isFriendsLoading,
    GetFriendReqCount,
    ReqCounter,
  } = useContext(RelationContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [counter, SetCounter] = useState(ReqCounter);

  useEffect(() => {
    GetFriendRequests();
    GetCounter();
  }, []);

  useEffect(() => {
    GetCounter();
    navigation.setOptions({
      headerRight: () => (
        <View
          style={[
            styles.counterCon,
            isDarkMode ? Styl.lightSimpleStyle : Styl.darkSimpleStyle3,
          ]}
        >
          <Text
            style={[
              styles.counterText,
              !isDarkMode ? { color: "#fff" } : { color: "#111" },
            ]}
          >
            {counter.toString()}
          </Text>
        </View>
      ),
    });
  }, [isFriendsLoading]);

  useEffect(() => {
    SetCounter(ReqCounter);
  }, [ReqCounter]);

  const GetCounter = async () => {
    await GetFriendReqCount();
  };

  const onRefresh = () => {
    GetFriendRequests();
    GetCounter();
  };

  const filteredRequests = Requests.filter((request) =>
    request.Username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      style={[
        { flex: 1 },
        isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle,
      ]}
    >
      <CustomInput
        placeholder="Search"
        onChange={(text) => setSearchQuery(text)}
        value={searchQuery}
        style={[{ marginHorizontal: 10 }]}
      />
      <FlatList
        style={isDarkMode ? Styl.darkSimpleStyle : Styl.lightSimpleStyle}
        data={filteredRequests}
        renderItem={({ item }) => <RenderRequest item={item} />}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isFriendsLoading}
            onRefresh={onRefresh}
            colors={["#6200EE", "#03DAC6"]}
            tintColor={isDarkMode ? "#ddd" : "#222"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  counterCon: {
    height: 30,
    width: 30,
    marginHorizontal: 20,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    borderRadius: 5,
  },
  counterText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  container: {
    padding: 10,
  },
});

export default FriendRequests;

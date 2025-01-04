import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import SearchItem from "./SearchItem";
import { AuthContext } from "../../context/Auth/AuthState";
import { RelationContext } from "../../context/Relations/RelationState";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import FriendRequests from "./FriendRequests";
import Styl, { darkTextColor, lightColor, lightTextColor } from "../../Styl";
import CustomInput from "../Tools/CustomInput";

const SearchHome = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { UserSearch, isSearchLoading, UsersFound } = useContext(AuthContext);
  const { isFriendsLoading, GetFriendRequests } = useContext(RelationContext);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("FriendRequests")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
          }}
        >
          <MaterialIcons
            name="group-add"
            size={30}
            color={isDarkMode ? lightTextColor : darkTextColor}
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
      ),
    });
  });

  useEffect(() => {
    GetFriendRequests();
    if (searchQuery.length > 0) {
      UserSearch(searchQuery);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  return (
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
        style={[{ marginHorizontal: 10 }]}
      />
      {isSearchLoading || isFriendsLoading ? (
        <ActivityIndicator
          size="large"
          color="#333"
          style={{ marginTop: "70%" }}
        />
      ) : (
        <FlatList
          data={searchQuery.length > 0 ? UsersFound : []}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <SearchItem
              id={item._id.toString()}
              username={item.Username}
              email={item.email}
              image={
                item.ImageData
                  ? `data:${item.ImageContentType};base64,${item.ImageData}`
                  : "https://via.placeholder.com/100"
              }
              ImageContentType={item.ImageContentType}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>No users found</Text>
            </View>
          }
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: isDarkMode ? "#444" : "#ddd" },
              ]}
            />
          )}
        />
      )}
    </View>
  );
};

const SearchPage = () => {
  const Stack = createStackNavigator();
  const { isDarkMode } = useContext(ThemeContext);
  const { GetFriendReqCount, ReqCounter } = useContext(RelationContext);
  const [counter, SetCounter] = useState(ReqCounter);
  useEffect(() => {
    GetCounter();
  }, []);
  const GetCounter = async () => {
    await GetFriendReqCount();
  };
  useEffect(() => {
    SetCounter(ReqCounter);
  }, [ReqCounter]);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchHome"
        component={SearchHome}
        options={{
          title: "Search",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
      <Stack.Screen
        name="FriendRequests"
        component={FriendRequests}
        options={{
          title: "Friend Requests",
          headerTintColor: isDarkMode ? lightTextColor : darkTextColor,
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : lightColor,
            shadowOpacity: isDarkMode ? 0 : 0.2,
          },
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    color: "gray",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    marginTop: "70%",
    color: "gray",
  },
});

export default SearchPage;

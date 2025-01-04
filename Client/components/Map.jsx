import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { ChatContext } from "../context/Chat/ChatState";
import { AuthContext } from "../context/Auth/AuthState";

const Map = () => {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { shareLocation, CoordsArray } = useContext(ChatContext);
  const [coords, setCoords] = useState(CoordsArray);
  const { user } = useContext(AuthContext);
  const [userLocation, setUserLocation] = useState(null); 

  // Function to handle location updates
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMessage("Permission to access location was denied");
      setLoading(false);
      return;
    }

    // Get current location once
    const userLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = userLocation.coords;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    setUserLocation({ latitude, longitude });
    setLoading(false);

    // Start watching for location updates
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    let arr = [];
    for (let i = 0; i < user.Friends?.length; i++) {
      if (user.Friends[i].isConnected) {
        const obj = {
          username: user.Friends[i].Username,
          lat: user.Friends[i].latitude,
          long: user.Friends[i].longitude,
        };
        arr = [...arr, obj];
      }
    }
    setCoords(arr);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#77A0F2" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        provider={MapView.PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion} // Allow map to be manually moved
      >
        {coords &&
          coords.map((item, idx) => (
            <Marker
              key={idx}
              coordinate={{
                latitude: item.lat,
                longitude: item.long,
              }}
              title={item.username}
            />
          ))}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title={user.Username}
            pinColor="blue" // Customize user's marker color
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  map: {
    flex: 1,
  },
});

export default Map;

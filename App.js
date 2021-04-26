import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  TextInput,
  Keyboard,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [seconds, setSeconds] = useState("");

  let time = Number(seconds) * 60;

  if (Number(seconds) === 0) {
    time = Number(seconds) + 1;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 20 }}>DRINK WATER 🥤</Text>

      <View style={{ height: 100 }} />

      <Text style={{ fontSize: 15, width: "75%", alignSelf: "center" }}>
        After how much time do you want me to remind you to drink water? Please
        enter that below in the input field.
      </Text>

      <View style={{ height: 20 }} />

      <TextInput
        placeholder="Enter the time in minutes"
        style={{
          height: 60,
          borderColor: "black",
          borderWidth: 1,
          padding: 20,
        }}
        value={seconds}
        onChangeText={(text) => setSeconds(text)}
        keyboardType="number-pad"
        onSubmitEditing={async () => {
          await schedulePushNotification(time, setSeconds);
        }}
      />

      <View style={{ height: 20 }} />

      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification(time, setSeconds);
        }}
        disabled={
          seconds[0] === "." ||
          seconds[0] === "-" ||
          seconds[0] === "," ||
          seconds[0] === " " ||
          !seconds
        }
      />
    </View>
  );
}

async function schedulePushNotification(value, blank) {
  if (
    value[0] === "." ||
    value[0] === "-" ||
    value[0] === "," ||
    value[0] === " " ||
    !value
  ) {
    return function reject() {
      blank("");
      Keyboard.dismiss();
    };
  }

  Keyboard.dismiss();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "DRINK WATER 🥤",
      body: "Please take a minute and drink some water!!",
      data: { data: "goes here" },
    },
    trigger: { seconds: value },
    // 3600 = 1 hour
  });
  blank("");
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const {
      status: existingStatus,
    } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

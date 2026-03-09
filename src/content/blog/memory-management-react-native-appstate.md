---
title: "Memory management in React Native using AppState"
description: "Learn how to optimize React Native app performance using AppState API. Discover techniques for managing memory usage, handling app state changes, and implementing user status tracking to create more efficient mobile applications."
pubDate: "Oct 11 2021"
---

Knowing the current state of an app is crucial for a variety of reasons, most notably memory management. Constant updates to an app's state can consume a lot of energy, and sometimes it's better to pause them when the user is not interacting with the app.

This is where the React Native AppState API comes in. AppState tells you when an app is inactive or in the background so you can stop nonessential processes, save memory, and improve the performance of your React Native app.

## What is AppState in React Native?

In React Native, [AppState](https://reactnative.dev/docs/appstate) represents the current state of the app — i.e., whether the app is in the foreground or background.

AppState is useful for collecting data on app usage — for example, the time a user spends in the app before putting it in the background or closing the app. Analyzing this data helps you understand the way users interact with your app so you can make changes if necessary to boost engagement.

There are countless SDKs designed to help you generate this type of insight, but AppState enables you to monitor state changes on your own without relying on any third-party tools.

## What is AppState used for?

As stated above, AppState is most commonly used for memory management and user status management. Let's dive deeper.

### Memory management

AppState can help you avoid unnecessary state changes when the user is not interacting with an app.

It's a good practice to create an `isMounted` property that changes according to the state of the app. If we take class components into consideration, `isMounted` is set to `true` once the `componentDidMount` is fired and `false` when `componentWillUnmount` is fired.

You can use the `isMounted` property of `this` throughout the components to only call `this.setState` if the component is mounted.

```jsx
this.isMounted && this.setState(...)
```

You can use AppState's functionality to limit the state updates accordingly — e.g., to pause them when the app is in background or inactive (in iOS) and resume when the user returns to the app.

### User status management

When it comes to analytics, AppState enables you to update the database on user interactions — e.g., when the user returns to the app or puts it in background, this data tells you how the user is interacting with your app.

AppState can also help you determine whether the user is online or offline, which is particularly important for chat applications. You might have seen the "online" and "last seen at…" in WhatsApp, Telegram, and other applications that provide a chat feature.

You can easily update the user status according to the change in the AppState — e.g., online when the user is interacting with the app, when the app is currently active, or when the app is in the foreground, and offline when the user puts the app in the background or closes it.

## How to use AppState in React Native

To see AppState in action, we'll create a React Native chat application that shows the online status of the user. We'll use AppState to indicate when the user is online when the app is open or in the foreground and when the app is in the background or closed.

AppState is the part of the `react-native` library and can be easily imported:

```jsx
import { AppState } from "react-native";
```

The most basic use case for AppState is to get the state of the app using the `currentState` property:

```jsx
AppState.currentState;
```

We can get two states from the above property: `active` and `background`.

- `active` means the app is currently running and is in foreground
- `background` means the app is running but is currently in background — i.e., the user is either on another app or viewing their home screen

The above states are given on both Android and iOS, but iOS supports an additional AppState called `inactive`, which occurs when the user transitions between two apps, opens the Notification Center, or receives an incoming call.

## Listening for changes in AppState

AppState comes with the listeners for the changes in the state. The `change` listener is supported on both Android and iOS.

To add a new listener:

```jsx
AppState.addEventListener;
```

Then add the `change` event listener:

```jsx
const appStateListener = AppState.addEventListener("change", (nextAppState) => {
  console.log("Next AppState is: ", nextAppState);
  setAppState(nextAppState);
});
```

It's always a good practice to clean up the listeners for the sake of performance:

```jsx
appStateListener.remove();
```

Below is the full code for our example:

```jsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, AppState } from "react-native";

const App = () => {
  const [aState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        console.log("Next AppState is: ", nextAppState);
        setAppState(nextAppState);
      }
    );
    return () => {
      appStateListener?.remove();
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.txt}>
        Current App State is: <Text style={styles.aState}>{aState}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  txt: {
    color: "#d9d9d9",
    fontSize: 18,
  },
  aState: {
    color: "#fff",
  },
});
export default App;
```

There are two more Android-specific listeners you can use:

- `focus` for when a user interacts with an app
- `blur` for when the user pulls down the Notification Center

## Conclusion

Now you have the basic understanding of the AppState tool and how to use it in a React Native app. You can use it to change the user status in an app (from online to offline or vice versa), to collect analytics on app usage, and play or pause the AV content in your app, depending on the type of project you're working on.

Thanks for reading!

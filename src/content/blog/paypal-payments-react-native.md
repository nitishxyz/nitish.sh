---
title: "How to integrate PayPal payments with React Native"
description: "A step-by-step guide to implementing PayPal payments in React Native using WebView. Learn how to create a payment interface, set up Firebase hosting for the web component, and handle payment callbacks between web and native environments."
pubDate: "Feb 08 2021"
---

There aren't many ways to add a payment interface to a React Native app natively. As a result, many mobile developers opt to build their own payment interface using the [PayPal SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/).

[PayPal](https://www.paypal.com/us/home) is one of the first and biggest internet payment services in the world. Its availability in 200 countries makes it a reliable payment interface for both businesses and individuals. PayPal has a huge library for integration with various programming languages, including Python, Java, JavaScript, PHP, etc.

In this tutorial, we'll show you how to build a payment interface by interlinking web and native technologies with each other using the PayPal SDK for JavaScript.

We'll start by building basic React Native and React apps. We'll use PayPal's Integration API for JavaScript for web. We'll build the payment interface in React as a single-page app and host it on Firebase Hosting. Finally, we'll use React Native WebView to create the link between the React Native app and the React web app.

## Basic setup

First, we'll create a basic React Native app:

```bash
$ npx react-native init myPayPalApp
```

We'll need to create a React app also:

```bash
npx create-react-app my-paypal-web
```

As these apps are initializing, use your PayPal developer account to create new app credentials at [developer.paypal.com](https://developer.paypal.com).

After creating the app, you'll get a client ID which we need for this tutorial. For testing, create sandbox customer accounts under **Sandbox > Accounts**.

## Building the payment interface

For the payment interface, we'll make changes to the React project (`my-paypal-web`). Copy the client ID and paste it into `public/index.html`:

```html
<script src="https://www.paypal.com/sdk/js?client-id=[your-client-id]&currency=USD"></script>
```

Edit `App.js`. First, create a reference to the PayPal Button:

```jsx
const PayPalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });
```

Your `App.js` should look like this:

```jsx
import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
const PayPalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });
function App() {
  function _createOrder(data, actions) {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: "1",
          },
        },
      ],
    });
  }
  return (
    <div className="App">
      <PayPalButton
        createOrder={(data, actions) => _createOrder(data, actions)}
      />
    </div>
  );
}
export default App;
```

For callbacks, create an `_onApprove` function:

```jsx
async function _onApprove(data, actions) {
  let order = await actions.order.capture();
  console.log(order);
  return order;
}
```

And an `_onError` function:

```jsx
function _onError(err) {
  console.log(err);
}
```

Your PayPal Button with all props:

```jsx
<PayPalButton
  createOrder={(data, actions) => _createOrder(data, actions)}
  onApprove={(data, actions) => _onApprove(data, actions)}
  onCancel={() => _onError("Canceled")}
  onError={(err) => _onError(err)}
/>
```

## Setting up Firebase Hosting

Sign up for Firebase, create a project, then install firebase-tools:

```bash
$ npm install -g firebase-tools
$ firebase login
$ firebase init
```

Select **Hosting**, use your existing project, and configure:

```bash
? What do you want to use as your public directory? build
? Configure as a single-page app? Yes
? Set up automatic builds and deploys with GitHub? No
```

Deploy:

```bash
$ yarn build
$ firebase deploy
```

## Building the WebView in React Native

Install the WebView module:

```bash
yarn add react-native-webview
```

Create a button to show the web view in a modal:

```jsx
const [showGateway, setShowGateway] = useState(false);
```

```jsx
<View style={styles.btnCon}>
  <TouchableOpacity style={styles.btn} onPress={() => setShowGateway(true)}>
    <Text style={styles.btnTxt}>Pay Using PayPal</Text>
  </TouchableOpacity>
</View>
```

Create the modal with WebView:

```jsx
{showGateway ? (
  <Modal
    visible={showGateway}
    onDismiss={() => setShowGateway(false)}
    onRequestClose={() => setShowGateway(false)}
    animationType={"fade"}
    transparent
  >
    <View style={styles.webViewCon}>
      <View style={styles.wbHead}>
        <TouchableOpacity
          style={{ padding: 13 }}
          onPress={() => setShowGateway(false)}
        >
          <Feather name={"x"} size={24} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#00457C" }}>
          PayPal GateWay
        </Text>
        <View style={{ padding: 13, opacity: prog ? 1 : 0 }}>
          <ActivityIndicator size={24} color={progClr} />
        </View>
      </View>
      <WebView
        source={{ uri: "https://my-pay-web.web.app/" }}
        style={{ flex: 1 }}
        onLoadStart={() => { setProg(true); setProgClr("#000"); }}
        onLoadProgress={() => { setProg(true); setProgClr("#00457C"); }}
        onLoadEnd={() => { setProg(false); }}
        onLoad={() => { setProg(false); }}
        onMessage={onMessage}
      />
    </View>
  </Modal>
) : null}
```

## Connecting the PayPal interface to React Native

To receive data from WebView, update the web app's `_onApprove` and `_onError`:

```jsx
async function _onApprove(data, actions) {
  let order = await actions.order.capture();
  console.log(order);
  window.ReactNativeWebView &&
    window.ReactNativeWebView.postMessage(JSON.stringify(order));
  return order;
}
function _onError(err) {
  console.log(err);
  let errObj = { err: err, status: "FAILED" };
  window.ReactNativeWebView &&
    window.ReactNativeWebView.postMessage(JSON.stringify(errObj));
}
```

On the React Native side, handle the message:

```jsx
function onMessage(e) {
  let data = e.nativeEvent.data;
  setShowGateway(false);
  console.log(data);
  let payment = JSON.parse(data);
  if (payment.status === "COMPLETED") {
    alert("PAYMENT MADE SUCCESSFULLY!");
  } else {
    alert("PAYMENT FAILED. PLEASE TRY AGAIN.");
  }
}
```

## Conclusion

You've successfully set up a test payment gateway for React Native using PayPal. Although the code above should suffice for the basic payment system, you can change it according to your own needs. You can also refer to the official [PayPal guide](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/) for further reference.

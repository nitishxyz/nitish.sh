---
title: "The complete guide to using Atomic Design in React Native"
description: "A comprehensive guide to implementing Atomic Design methodology in React Native applications. Learn how to organize components into atoms, molecules, organisms, templates, and pages to create a scalable and maintainable component architecture."
pubDate: "Aug 30 2022"
---

Organizing modules is one of the most important things for any project in development. A file structure is a way of arranging various files, i.e. components, classes, etc. in a specific way in order to ensure development processes are as efficient as they can be.

One of the most popular ways of organizing and maintaining components and modules that is used by design teams today is Atomic Design — it is one of the most popular approaches of organizing components by frontend and design teams, today.

## What is Atomic Design?

Atomic Design is a specific way of organizing the components of a project; it is directly inspired by Atomic concepts of chemistry, hence the name.

Atomic Design takes inspiration from the concept of an atom being the smallest unit; followed by molecule being the combination of atoms; and finally organisms being made of molecules.

To take an example, atoms may specify the smallest components like Buttons, Inputs etc.; molecules signify the combination of these atoms (i.e. forms); and the entire page that consists of these molecules can be considered the organism comprised of all elements.

In essence, atomic design is used to build user interfaces in a modular manner, with a primary focus on creating components.

## The methodology of Atomic Design in React Native

As we discussed above, atomic design takes inspiration from chemistry's concept of atoms and molecules. It consists of these five distinct levels:

1. Atoms: These are the building blocks, which cannot be further broken down
2. Molecules: Atoms grouped together form a single molecule
3. Organisms: Molecules joined together to create a part of the interface
4. Templates: The content structure
5. Pages: Interfaces built as instances of templates

## ATOMS

Atoms are the fundamental units of a project. They are the basic building blocks the whole atomic design depends upon. These can be Inputs, Buttons, as well as color palettes and animations.

These are the smallest possible units which can be used throughout the project in molecules, organisms, and templates.

They should be easily and globally accessible and built in a way that make them usable any where throughout the project (due to having many states, e.g a Button or Input with disabled, different sizes for different use cases.)

**Text.tsx**

```jsx
import React, { ReactElement } from "react";
import { View, StyleSheet, ViewProps, StyleProp, TextStyle } from "react-native";
import { Text as UKText, TextProps } from "@ui-kitten/components";

type Props = {
  [key: string]: any;
};

const Text = ({ style, ...props }: Props) => {
  return (
    <UKText style={StyleSheet.flatten([styles.txt, style])} {...props}>
      {props.children}
    </UKText>
  );
};

const styles = StyleSheet.create({
  txt: {
    fontFamily: "Inter",
  },
});

export default Text;
```

**LoaderGrad.tsx**

```jsx
import MaskedView from "@react-native-masked-view/masked-view";
import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type Props = {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
} & ActivityIndicatorProps;

const LoaderGrad = ({ colors, start, end, ...props }: Props) => {
  return (
    <MaskedView maskElement={<ActivityIndicator {...props} />}>
      <LinearGradient colors={colors} start={start} end={end}>
        <ActivityIndicator {...props} style={[props.style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
};

export default LoaderGrad;
```

## MOLECULES

As we know when two or more Atoms bind together, they form a molecule that gives out new combined qualities.

Similarly, molecules in Atomic Designs are combination of various atomic components to build a whole new Component.

For example, an Input group built using a View, Input and a Button. Combining these three atomic components allows us to build the grouped component for the Password Input section, which enables a user to press on the eye to show or hide their password.

Here we have the example of custom button with a loading indicator:

```jsx
import { Layout } from "@ui-kitten/components";
import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  PressableProps,
  ViewStyle,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GLOBAL_STYLE } from "../../../assets/theme";
import { HAPTICS } from "../../../utils";
import { LoaderGrad } from "../Activity";
import { Text, TextGrad } from "../Typography";

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  noShadow?: boolean;
  noBg?: boolean;
  loading?: boolean;
  color?: string;
} & PressableProps;

const PrimeBtn = ({
  style,
  title,
  noShadow,
  noBg,
  loading,
  color,
  onPress,
  disabled,
  ...props
}: Props) => {
  const onPressIn = () => { HAPTICS.heavy(); };
  const onPressOut = () => { HAPTICS.heavy(); };

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={GLOBAL_STYLE.gradients.prime_btn}
          style={StyleSheet.flatten([
            styles.container,
            { opacity: disabled ? 0.5 : 1 },
          ])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.5 }}
        >
          <Layout
            style={{
              ...StyleSheet.flatten([
                styles.btn,
                style,
                { opacity: pressed ? 0.95 : 1 },
                noBg && { backgroundColor: "transparent" },
              ]),
            }}
          >
            {loading ? (
              <LoaderGrad
                colors={noBg ? ["#fff", "#fff"] : GLOBAL_STYLE.gradients.prime_btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            ) : (
              <TextGrad
                colors={noBg ? (color ? [color, color] : ["#fff", "#fff"]) : GLOBAL_STYLE.gradients.prime_btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  ...StyleSheet.flatten([
                    styles.txt,
                    { opacity: pressed ? 0.9 : 1 },
                    color && { color: color },
                  ]),
                }}
              >
                {title || ""}
              </TextGrad>
            )}
          </Layout>
        </LinearGradient>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 55,
    padding: 1,
    borderRadius: 15,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  txt: {
    fontWeight: "bold",
  },
});

export default PrimeBtn;
```

## ORGANISMS

Again, as we go up the chain, and group together multiple molecules, we get an organism. Organisms still can't be considered a whole structure of the project as they are supposed to be independent and reusable on various parts any given project.

At this stage, we start to see a somewhat formed structure of the UI. Various molecules are combined together for headers, music controls, etc. Headers are reusable on various pages of a project, as on most pages they hold the same structure.

Here we have the example of a Basic Header:

```jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Layout } from "@ui-kitten/components";
import { RoundBtn } from "../../atoms/Buttons";
import { Text } from "../../atoms/Typography";

type Props = {
  title?: string;
};

const BasicHeader = ({ title }: Props) => {
  return (
    <View style={styles.container}>
      <RoundBtn noShadow />
      <View style={styles.mid}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <RoundBtn style={{ opacity: 0 }} active={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    paddingHorizontal: 10,
  },
  mid: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "600",
  },
});

export default BasicHeader;
```

## TEMPLATES

These are multiple organisms grouped together to form the skeleton of a page or layout. This is where all the aspects collectively come together in terms of design — it's like a blueprint for the pages. These do not hold any data to show on their own, other than the defaults required by the UI designs.

## PAGES

Pages are the instances of the templates. They are the complete form of the design that comes into shape in templates. The data is combined with the templates and the desired result is what we get in the form of pages.

Pages also demonstrate the feasibility of the templates. For example, how the designs will react when more data is added to them — chat as one example can have multiple forms of data as messages. There can be a lot of messages containing either text, images, or videos — we get to see all these things rendered on the screen with pages.

Here at last, we have a registration page built using the atoms and molecules we created:

```jsx
import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Input, Layout } from "@ui-kitten/components";
import { PrimeBtn, SecBtn } from "../../molecules/Buttons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Keypad, PhoneInput } from "../../molecules/Inputs";
import { BasicHeader } from "../../molecules/Headers";
import { Text } from "../../atoms/Typography";
import { GLOBAL_STYLE } from "../../../assets/theme";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const nav = useNavigation<any>();
  const _signUp = () => {
    nav.navigate("OTP_SCREEN");
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <Layout
        style={StyleSheet.flatten([
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ])}
      >
        <BasicHeader title={"get started"} />
        <View style={styles.topCon}>
          <View style={styles.infoCon}>
            <Text style={styles.infoTxt}>
              please enter your phone number to continue
            </Text>
          </View>
          <View style={styles.inputCon}>
            <PhoneInput
              size={"large"}
              placeholder={"phone number"}
              value={phone}
            />
          </View>
        </View>
        <View style={styles.bottomCon}>
          <PrimeBtn
            title={"Continue"}
            boxStyle={{ marginBottom: 10, marginHorizontal: 20 }}
            noBg={true}
            disabled={phone?.length != 10}
            onPress={_signUp}
          />
          <Keypad onChangeValue={setPhone} />
        </View>
      </Layout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topCon: { flex: 1 },
  infoCon: {
    alignSelf: "stretch",
    paddingHorizontal: 35,
    paddingVertical: 15,
  },
  infoTxt: { textAlign: "center", fontSize: 16 },
  inputCon: { paddingHorizontal: 20, flex: 1, justifyContent: "center" },
  bottomCon: {},
});

export default Register;
```

## Conclusion

There are a lot of different ways you can use to structure your project. Even on the official website of React.JS, it's noted that there is no standard for how files and folders are managed. The approach of atomic design for organizing your project files helps address any issues that might arise from a development cycle due to a lack of proper structure.

Atomic Design is my primary method for organizing my projects and I hope this approach helps you the way it has helped me and many other developers.

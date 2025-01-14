import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Image, ImageBackground, TextInput, KeyboardAvoidingView } from "react-native";
import { Colors, Images } from "../constants";
import Feather from "react-native-vector-icons/Feather";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AuthContext } from '../providers/AuthProvider';
import AsyncStorage from "@react-native-async-storage/async-storage";
// import ViewSlider from 'react-native-view-slider';


const backgroundImage = require("../Images/bg-grn.jpg");


const LogInScreen = ({ navigation }) => {

  //Initializing the login variables
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { signin } = useContext(AuthContext);


  useEffect(() => {
   
    const loadStoredCredentials = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      console.log('storedEmail: ', storedEmail);
      const storedPassword = await AsyncStorage.getItem("password");
      console.log('storedPassword: ', storedPassword);
      if (storedEmail) setEmail(JSON.parse(storedEmail));
      if (storedPassword) setPassword(JSON.parse(storedPassword));
    };

    loadStoredCredentials();
  }, []);


  // Validation function
  const validateInputs = () => {
    let isValid = true;

    if (!email) {
      setUsernameError("Username is required.");
      isValid = false;
    } else {
      setUsernameError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  // Sign-in function
  const handleSignin = async () => {
    if (validateInputs()) {
      const response = await signin(email, password);
      return response;
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} resizeMode="stretch" style={styles.inputSection}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.Greens_Red} translucent />
        <Image
          source={Images.DELIVERY}
          resizeMode="contain"
          style={styles.Image} />
        <View style={styles.spacingTop}></View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inner}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputSubcontainer}>


              {/* Email input */}
              <Feather
                name="user"
                size={16}
                color={Colors.Greens_White}
                style={{ marginRight: 7 }} />

              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="Username"
                placeholderTextColor={Colors.Greens_White}
                style={styles.inputText}
              />

            </View>
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

            <View style={styles.inputSubcontainer}>

              {/* Password input */}
              <Feather
                name="lock"
                size={14} color={Colors.Greens_White}
                style={{ marginRight: 7 }} />

              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                placeholderTextColor={Colors.Greens_White}
                style={styles.inputText} />

            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          </View>

          <View style={styles.spacing}></View>
        </KeyboardAvoidingView>


        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.signinButton}
            onPress={() => handleSignin()}
          >
            <Text style={styles.signinButtonText}>Log In</Text>
          </TouchableOpacity>
          <View style={styles.socialmediaSection}>

            <View style={styles.socialIcons}>
              <Text style={{ color: Colors.Greens_Black }}>Please login to your account. v 2.0</Text>
            </View>

          </View>
        </View>
      </ImageBackground>

    </View>

  );
};

const styles = StyleSheet.create({


  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "space-around"
  },

  container: {
    flexDirection: "column",
    flex: 1,
  },

  flash: {

    paddingTop: 15
  },

  socialmediaSection: {
    flexDirection: "row",
    flex: 1
  },

  socialIcons: {
    flex: 1,
    alignItems: 'center'
  },

  inputSection: {

    flex: 4,
    alignItems: 'center',
    paddingTop: 10
  },

  buttonSection: {

    backgroundColor: "white",
    alignItems: 'center',
    height: 40,
    flex: 1,
    marginTop: 200

  },

  Image: {
    height: 130,
    width: 280,
    marginBottom: 50,
    top: 50,
  },

  inputContainer: {
    width: 340,
    justifyContent: "center",
  },

  inputSubcontainer: {
    marginHorizontal: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.Greens_White,
    marginBottom: 15,
    justifyContent: "flex-start",
    height: 55
  },

  spacing: {
    marginBottom: 10,
  },
  spacingTop: {
    marginTop: 50,
  },

  signinButton: {
    backgroundColor: Colors.Greens_White,
    borderRadius: 20,
    marginHorizontal: 20,
    width: 300,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.Greens_Green,
    borderWidth: 1,
    top: -15,
  },
  signinButtonText: {

    fontWeight: "600",
    fontSize: 20,
    color: Colors.Greens_Black,
  },

  inputText: {

    color: '#fff',
    padding: 15,
    width: '100%'
  },
  errorText: {
    color: Colors.dark_red,
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 10,
  },

});

export default LogInScreen;
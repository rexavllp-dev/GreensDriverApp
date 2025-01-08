import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, } from 'react-native';
import { Colors, } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from '../providers/AuthProvider';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";

const UserLanding = ({ navigation }) => {

    const { user, logout, checkLoggin } = useContext(AuthContext);

    useEffect(() => {

        checkLoggin();

        const unsubscribe = NetInfo.addEventListener(state => {

            if (state.isConnected == false) {

                alert('Network unavailable/unstable');
            }
        });

        return () => { unsubscribe }

    }, []);


    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.welcomeContainer}>
                <View style={{ alignItems: 'flex-end' }}>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Icon size={28} color="white" name="power" />
                    </TouchableOpacity>

                </View>
                <View style={styles.TextHolder}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 50, padding: 10, }}>

                        <Feather size={70} color="#327F40" name="user" />
                    </View>
                    <Text style={styles.UserTxt}>Welcome, <Text style={styles.UserTxt}>{(user) ? user.first_name : ''}</Text></Text>
                    <Text style={{ color: Colors.Greens_White, marginTop: 15 }}>Version 2.0</Text>
                </View>
                <View style={styles.Btnview}>
                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('verifyorders')} >
                        <Text style={styles.signinButtonText}>Verify Boxes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('orders')} >
                        <Text style={styles.signinButtonText}>Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('delivery_returns')} >
                        <Text style={styles.signinButtonText}>Delivery Returns</Text>
                    </TouchableOpacity>


                </View>
            </ImageBackground>

        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1
    },
    welcomeContainer: {
        flex: 1
    },
    UserTxt: {
        color: Colors.Greens_White,
        fontSize: 24,
        fontWeight: "600",
        bottom: 5,
        top: 15,
    },
    TextHolder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        paddingHorizontal: 20,
        marginHorizontal: 20,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.Greens_Green,
        justifyContent: "center",
        marginBottom: 15,
        width: 280,
        top: -25,
        backgroundColor: Colors.Greens_White,
    },
    inputSubcontainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    inputText: {
        fontSize: 14,
        fontWeight: "300",
        color: Colors.Greens_Black,
        width: '100%',
        alignSelf: 'flex-start'
    },
    signinButton: {
        borderRadius: 20,
        marginHorizontal: 20,
        width: 280,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#fff',
        marginTop: 20
    },
    signinButtonText: {
        fontWeight: "600",
        fontSize: 20,
        color: 'green',
    },
    Btnview: {
        top: -100,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        borderRadius: 20,
        marginHorizontal: 20,
        width: 50,
        height: 50,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 45,
    },
});

export default UserLanding;
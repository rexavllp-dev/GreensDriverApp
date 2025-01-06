import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground } from "react-native";
import { Colors } from "../constants";
import SwipeItem from "../components/SwipeItem";

const VerifyOrders = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground
                source={require("../Images/orders-bg.png")}
                style={styles.welcomeContainer}
                resizeMode="cover"
            >
                <View style={styles.headerOverlay}>
                    <Text style={styles.UserTxt}>Verify Orders</Text>
                </View>
            </ImageBackground>
            <View style={styles.ContentHolder}>
                <SwipeItem />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    welcomeContainer: {
        height: 250,
        width: '100%',
        justifyContent: 'center',
    },
    headerOverlay: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingTop: 40, // To account for status bar
    },
    UserTxt: {
        color: Colors.Greens_White,
        fontSize: 34,
        fontWeight: "600",
        textAlign: 'left',
    },
    ContentHolder: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
});

export default VerifyOrders;
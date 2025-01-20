import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, } from 'react-native';
import { Colors, } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from '../providers/AuthProvider';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";

const UserLanding = ({ navigation }) => {

    const { user, logout, checkLoggin, deliveryReturnCount, setDeliveryReturnCount, verifyCount, setVerifyCount } = useContext(AuthContext);

    useEffect(() => {

        checkLoggin();
        getReturnOrders();
        verifyOrders();

        const unsubscribe = NetInfo.addEventListener(state => {

            if (state.isConnected == false) {

                alert('Network unavailable/unstable');
            }
        });

        return () => { unsubscribe }

    }, []);

    // update the delivery count 
    const getReturnOrders = async () => {
        try {
            checkLoggin();
            const token = await AsyncStorage.getItem('userSession');
            const response = await axios.get('driver/get_returned_replaced_orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeliveryReturnCount(response.data.result.length);
        } catch (error) {
            console.error('Error fetching return orders:', error);
        } finally {
        }
    };

    // update verify order count
    const verifyOrders = async () => {
        try {
            checkLoggin();
            const token = await AsyncStorage.getItem('userSession');
            if (!token) {
                throw new Error("User session token not found");
            }
            const userId = await AsyncStorage.getItem('userId');

            const response = await axios.get(
                `driver/driver_unverified_orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            if (response.data.success) {
                setVerifyCount(response.data.result.length);
            }

        } catch (error) {
            console.error("Error fetching unverified orders:", error.message);
        } finally {
        }
    };









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
                    <Text style={styles.UserTxt}>  Welcome, {user ? user.first_name?.replace(/"/g, '') : ''} </Text>
                    <Text style={{ color: Colors.Greens_White, marginTop: 15 }}>Version 2.0</Text>
                </View>
                <View style={styles.Btnview}>
                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('verifyorders')} >
                        <Text style={styles.signinButtonText}>Verify Boxes</Text>
                        <View style={styles.deliveryCountHolder}>
                            <Text style={styles.deliveryCount}>{verifyCount}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('orders')} >
                        <Text style={styles.signinButtonText}>Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('delivery_returns')} >
                        <Text style={styles.signinButtonText}>Delivery Returns</Text>
                        <View style={styles.deliveryCountHolder}>
                            <Text style={styles.deliveryCount}>{deliveryReturnCount}</Text>
                        </View>
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
    deliveryCountHolder: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Ensures the text is centered vertically
        right: 10,
        top: 10,
        width: 30, // Ensures it is perfectly round with equal width and height
        height: 30,
        backgroundColor: 'red',
        borderRadius: 50, // Half of the width/height for a perfect circle

    },
    deliveryCount: {

        color: '#fff',
        textAlign: 'center', // Centers the text horizontally
        fontSize: 14, // Adjust font size for a better fit

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
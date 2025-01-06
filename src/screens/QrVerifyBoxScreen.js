import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, StatusBar, TextInput } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import { Colors } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { showMessage, hideMessage } from "react-native-flash-message";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { AuthContext } from '../providers/AuthProvider';

const QrVerifyBox = ({ route, navigation }) => {

    const [scanner, setScanner] = useState();
    const [bottommsg, setBottommsg] = useState();
    const { setSpinner } = useContext(AuthContext);

    const onSuccess = async (e) => {
        setSpinner(true);

        const verifycontroller = new AbortController();

        try {
            const token = await AsyncStorage.getItem("userSession");
            const user_id = await AsyncStorage.getItem("userId");

            const response = await axios.get(
                `/qr_verify_box/${route.params.orderId}/${e.data}/${user_id}`,
                {
                    signal: verifycontroller.signal,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setBottommsg(response.data.msg);
            showMessage({
                message: "",
                description: response.data.msg,
                type: response.data.status,
                textStyle: { fontSize: 20, padding: 10 },
            });

            setSpinner(false);

            if (scannerRef.current) {
                scannerRef.current.reactivate();
            }

            if (response.data.status === "success") {
                setTimeout(() => {
                    navigation.replace("verifyorders");
                }, 1000);
            }
        } catch (error) {
            console.error(error);

            showMessage({
                message: "",
                description: "Invalid QR code",
                type: "error",
                style: { fontSize: 30 },
            });

            setBottommsg("Invalid QR code");
            setSpinner(false);
        }

        return () => verifycontroller.abort();
    };

    return (

        <View style={styles.container}>


            <QRCodeScanner

                showMarker={true}
                ref={(node) => { setScanner(node) }}
                onRead={onSuccess}
                topContent={
                    <Text style={styles.centerText}>
                        Scan and Verify
                    </Text>
                }
                bottomContent={
                    <Text style={styles.bottomText}>{bottommsg}</Text>
                }
            />


        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        flex: 1,
        marginTop: 32,
    },
    orderDetail: {
        padding: 10,
        top: 25,
        bottom: 25,
    },
    spacing: {
        marginTop: 85,
        marginBottom: 30
    },
    headText: {
        fontSize: 25,
        fontWeight: '600',
        textAlign: 'center',
        top: 85,
        color: Colors.Greens_Black
    },
    signinButton: {
        backgroundColor: Colors.Greens_Green,
        borderRadius: 20,
        marginHorizontal: 20,
        width: 220,
        height: 50,
        height: 50,
        justifyContent: 'center',
        alignSelf: 'center',
        borderColor: Colors.Greens_Green,
        borderWidth: 1,

    },
    signinButtonText: {
        fontWeight: "600",
        fontSize: 20,
        color: Colors.Greens_White,
        textAlign: 'center',
    },

    inputContainer: {

        paddingHorizontal: 0,
        marginHorizontal: 50,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.Greens_Green,
        justifyContent: "center",
        marginBottom: 15,
        width: 280,
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

    centerText: {

        color: Colors.Greens_Black,
        fontSize: 30,
        fontWeight: "600",
    },

    bottomText: {

        color: Colors.Greens_Black,
        fontSize: 20,
    }
});
export default QrVerifyBox;

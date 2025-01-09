import React, { useState, useContext, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../instance/axios-instance";
import { showMessage } from "react-native-flash-message";
import QRCodeScanner from "react-native-qrcode-scanner";
import { AuthContext } from "../providers/AuthProvider";

const QrVerifyBox = ({ route, navigation }) => {
    const [bottomMessage, setBottomMessage] = useState("");
    const { setSpinner } = useContext(AuthContext);
    const scannerRef = useRef(null);

    const onSuccess = async (e) => {
        setSpinner(true);

        const verifyController = new AbortController();

        try {
            const token = await AsyncStorage.getItem("userSession");
            // const userId = await AsyncStorage.getItem("userId");

            const response = await axios.post(
                `driver/verify_qr_box/${route.params.orderId}`,
                { qrCode: e.data },
                {
                    signal: verifyController.signal,
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // console.log("response verify", response);


            setBottomMessage(response.data.message);

        

            if (response.data.success) {
                showMessage({
                    message: "",
                    description: response.data.message,
                    type: "success",
                    textStyle: { fontSize: 20, padding: 10 },
                });
                setTimeout(() => navigation.replace("verifyorders"), 1000);
            } else {
                showMessage({
                    message: "",
                    description: response.data.message,
                    type: "error",
                    textStyle: { fontSize: 20, padding: 10 },
                });
            }

            scannerRef.current?.reactivate();
        } catch (error) {
            console.error(error);

            setBottomMessage("Invalid QR code");
            showMessage({
                message: "",
                description: "Invalid QR code",
                type: "error",
                textStyle: { fontSize: 20 },
            });
        } finally {
            setSpinner(false);
        }

        return () => verifyController.abort();
    };

    return (
        <View style={styles.container}>
            <QRCodeScanner
                showMarker
                ref={scannerRef}
                onRead={onSuccess}
                topContent={<Text style={styles.centerText}>Scan and Verify</Text>}
                bottomContent={<Text style={styles.bottomText}>{bottomMessage}</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 32,
    },
    centerText: {
        color: Colors.Greens_Black,
        fontSize: 30,
        fontWeight: "600",
    },
    bottomText: {
        color: Colors.Greens_Black,
        fontSize: 20,
    },
});

export default QrVerifyBox;

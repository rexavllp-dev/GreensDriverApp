import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Button, ImageBackground } from "react-native";
import { Colors } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../instance/axios-instance";
import { AuthContext } from "../providers/AuthProvider";
import { showMessage } from "react-native-flash-message";
import { useFocusEffect } from "@react-navigation/native";

const CashPaymentScreen = ({ route, navigation }) => {
    const { setSpinner } = useContext(AuthContext);
    const [amount, setAmount] = useState("");
    const [rvnumber, setRvnumber] = useState("");

    // Handle back button press
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If we're going back, reset the scanner
            if (e.data.action.type === 'GO_BACK') {
                if (route.params?.onScanReset) {
                    route.params.onScanReset();
                }
            }
        });

        return unsubscribe;
    }, [navigation, route.params]);

    const handleCashReceived = async () => {
        try {
            if (amount && rvnumber) {
                setSpinner(true);
                const token = await AsyncStorage.getItem("userSession");
                const response = await axios.post(
                    `driver/update_order_driver/${route.params.orderId}`,
                    {
                        ord_rv_number: rvnumber,
                        ord_amount_received: amount,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("response cash received", response);
                if (response.data.success) {
                    alert("Order has been marked as paid successfully");
                    navigation.replace("orders"); // Navigate to the orders screen
                } else {
                    alert(response.data.message);
                }
            } else {
                alert("Enter Amount / RV Number");
            }
        } catch (error) {
            console.error(error);
            showMessage({
                message: "Error",
                description: "Error processing payment",
                type: "danger",
            });
        } finally {
            setSpinner(false);
        }
    };

    return (
        <ImageBackground
            source={require("../Images/orders-bg.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Cash On Delivery</Text>
                <Text style={styles.subtitle}>
                    Total: <Text style={styles.totalHighlight}>{route.params.total}</Text>
                </Text>

                <Text style={styles.label}>Amount</Text>
                <TextInput
                    onChangeText={setAmount}
                    placeholder="Enter Amount"
                    placeholderTextColor={Colors.Greens_White}
                    value={amount}
                    style={styles.inputText}
                />

                <Text style={styles.label}>RV Number</Text>
                <TextInput
                    onChangeText={setRvnumber}
                    placeholder="Enter RV Number"
                    placeholderTextColor={Colors.Greens_White}
                    value={rvnumber}
                    style={styles.inputText}
                />

                <Button title="Proceed" onPress={handleCashReceived} color={Colors.Greens_Green} />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        textAlign: "center",
        color: "white",
        marginBottom: 20,
    },
    totalHighlight: {
        color: Colors.Greens_Green,
        fontWeight: "bold",
        fontSize: 24,
    },
    label: {
        fontSize: 18,
        color: "white",
        marginBottom: 10,
    },
    inputText: {
        fontSize: 16,
        borderColor: "#bdbdbd",
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        color: "white",
        backgroundColor: "rgba(255,255,255,0.1)",
    },
});

export default CashPaymentScreen;

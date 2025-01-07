import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../providers/AuthProvider";
import { showMessage } from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../instance/axios-instance";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";

const PendingScreen = ({ navigation }) => {
    const [state, setState] = useState({
        pendingOrders: [],
        alertShow: false,
        orderObject: [],
    });

    const { setSpinner, checkLoggin, setPendingcount } = useContext(AuthContext);

    const setStatus = async (order) => {
        console.log("checking order", order);
        try {
            setState((prev) => ({ ...prev, alertShow: false }));
            setSpinner(true);

            const token = await AsyncStorage.getItem("userSession");
            console.log("token", token);
            const userId = await AsyncStorage.getItem("userId");

            const response = await axios.put(`driver/update_out_for_delivery/${order}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("response", response);

            // setState((prev) => ({ ...prev, pendingOrders: response.data.result }));
            // setPendingcount(response.data.result.length);
            setSpinner(false);
            if (response.data.success) {
                alert("Order has been moved to Ongoing Tab");
                getPendingOrders();
            }
            // showMessage({
            //     message: "",
            //     description: "Order has been moved to Ongoing Tab",
            //     type: "success",
            //     textStyle: { fontSize: 16, padding: 10 },
            // });

        } catch (error) {
            setSpinner(false);
            console.error("Error setting status:", error);
        }
    };

    const setDeliveryStatus = (order) => {
        setState((prev) => ({
            ...prev,
            orderObject: order,
            alertShow: true,
        }));
    };

    const handleStatusClose = () => {
        setState((prev) => ({ ...prev, alertShow: false }));
    };

    const getPendingOrders = async () => {
        try {
            setSpinner(true);
            const token = await AsyncStorage.getItem("userSession");
            const userId = await AsyncStorage.getItem("userId");

            const response = await axios.get(`driver/get_pending_orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("response pending", response.data.result);

            setState((prev) => ({ ...prev, pendingOrders: response.data.result }));
            setPendingcount(response?.data.result.length);
            setSpinner(false);
        } catch (error) {
            setSpinner(false);
            console.error("Error fetching pending orders:", error);
        }
    };

    useEffect(() => {
        checkLoggin();
        getPendingOrders();

        const unsubscribe = navigation.addListener("tabPress", () => {
            checkLoggin();
            getPendingOrders();
        });

        return unsubscribe;
    }, []);

    const handleWhatsAppPress = (phone) => {
        Linking.openURL(`whatsapp://send?text=Hi, Greetings from greens&phone=+971${phone}`);
    };

    const handleCallPress = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const renderOrderItem = (item) => (
        <View key={item.orderId} style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderIdText}>Order ID: #{item.orderId}</Text>
                <View style={styles.paymentMethod}>
                    <Icon size={24} color="#0f766e" name="cash" />
                    <Text style={styles.paymentText}>
                        {item.ord_payment_method === "Cash On Delivery"
                            ? item.ord_payment_method
                            : "Card Payment"}
                    </Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.customerName}>{item.orderCustomerName}</Text>
                <Text style={styles.customerDetails}>Phone: {item.orderCustomerPhone}</Text>
                <Text style={styles.customerDetails}>
                    No. of boxes: <Text style={styles.bold}>{item.no_boxes}</Text>
                </Text>
                <Text style={styles.price}>AED {item.ord_grand_total}</Text>
            </View>
            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setDeliveryStatus(item.orderId)}
                >
                    <Text style={styles.primaryButtonText}>Out for Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsAppPress(item.orderCustomerPhone)}
                >
                    <Icon size={20} color="#fff" name="whatsapp" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallPress(item.orderCustomerPhone)}
                >
                    <Icon size={20} color="#fff" name="phone" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <SCLAlert
                theme="warning"
                show={state.alertShow}
                cancellable={true}
                onRequestClose={handleStatusClose}
                title="Are you sure?"
                subtitle="Press YES to move this to out for delivery"
            >
                <SCLAlertButton theme="success" onPress={() => setStatus(state.orderObject)}>
                    YES
                </SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>
                    NO
                </SCLAlertButton>
            </SCLAlert>
            {state?.pendingOrders?.map(renderOrderItem)}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f9fafb",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#374151",
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
    },
    paymentText: {
        marginLeft: 8,
        color: "#0f766e",
        fontSize: 14,
    },
    cardBody: {
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
    },
    customerDetails: {
        fontSize: 14,
        color: "#6b7280",
    },
    bold: {
        fontWeight: "bold",
    },
    price: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f766e",
        marginTop: 8,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    primaryButton: {
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    whatsappButton: {
        backgroundColor: "#25d366",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    callButton: {
        backgroundColor: "#3b82f6",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default PendingScreen;

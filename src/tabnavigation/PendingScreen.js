import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    TouchableOpacity,
    Alert,
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

    const [phoneNumbers, setPhoneNumbers] = useState({ phone1: "", phone2: "32423242" });
    const [alertshow, setAlertshow] = useState(false);
    const { setSpinner, checkLoggin, setPendingcount, setOnGoingCount } = useContext(AuthContext);

    const setStatus = async (order) => {
        // console.log("checking order", order);
        try {
            setState((prev) => ({ ...prev, alertShow: false }));
            setSpinner(true);

            const token = await AsyncStorage.getItem("userSession");
            // console.log("token", token);
            const userId = await AsyncStorage.getItem("userId");

            const response = await axios.put(`driver/update_out_for_delivery/${order}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // console.log("response", response);

            // setState((prev) => ({ ...prev, pendingOrders: response.data.result }));
            // setPendingcount(response.data.result.length);
            setSpinner(false);
            if (response.data.success) {
                // alert("Order has been moved to Ongoing Tab");
                showMessage({
                    message: "",
                    description: "Order has been moved to Ongoing Tab",
                    type: "success",
                    textStyle: { fontSize: 16, padding: 10 },
                });
                getPendingOrders();
                getOngoingOrders();
            }


        } catch (error) {
            setSpinner(false);
            console.error("Error setting status:", error);
        }
    };

    // to update the ongoing orders count in the header
    const getOngoingOrders = async () => {
        try {
            checkLoggin();
            const token = await AsyncStorage.getItem('userSession');
            const response = await axios.get(`driver/get_out_for_delivery`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOnGoingCount(response.data.result.length);
        } catch (error) {
            console.error(error);
        } finally {
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

    const handleCloseCall = () => {
        setAlertshow(false);
    };

    const getPendingOrders = async () => {
        try {
            setSpinner(true);
            const token = await AsyncStorage.getItem("userSession");
            const userId = await AsyncStorage.getItem("userId");

            const response = await axios.get(`driver/get_pending_orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log("response pendingeee", response.data.result);

            setState((prev) => ({ ...prev, pendingOrders: response.data.result }));
            setPendingcount(response?.data.result.length);
            setSpinner(false);
        } catch (error) {
            setSpinner(false);
            console.error("Error fetching pending orders:", error);
        }
    };

    useEffect(() => {
        // Initial load
        getPendingOrders();

        // Listen for both focus and tabPress events
        const unsubscribeFocus = navigation.addListener('focus', () => {
            getPendingOrders();
            checkLoggin();
        });

        const unsubscribeTabPress = navigation.addListener('tabPress', () => {
            getPendingOrders();
            checkLoggin();
        });

        // Cleanup function
        return () => {
            unsubscribeFocus();
            unsubscribeTabPress();
        };
    }, [navigation]);

    const handleWhatsAppPress = (phone) => {
        const message = `Hi, this is from Greens International. Could you please share your location here? I am on the way with your delivery and will arrive soon.`;
        // const url = `https://wa.me/+971${phone}?text=${encodeURIComponent(message)}`;
        const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=+971${phone}`;

        Linking.openURL(url);

    };


    // const handleCallPress = (phone) => {
    //     Linking.openURL(`tel:${phone}`);
    // };

    const handleCallPress = (phone1, phone2) => {
        // Show the alert with both numbers
        const trimmedPhone1 = phone1?.startsWith('0') ? phone1?.slice(1) : phone1;
        const trimmedPhone2 = phone2?.startsWith('0') ? phone2?.slice(1) : phone2;
        setAlertshow(true);
        setPhoneNumbers({ phone1: '+971' + trimmedPhone1, phone2: trimmedPhone2 ? ('+971' + trimmedPhone2) : null });
    };

    const handleNumberSelect = (phone) => {
        // Check if the phone number starts with '0' and trim it
        const trimmedPhone = phone;
        // Close the alert and call the selected phone number
        Linking.openURL(`tel:${trimmedPhone}`);
        setAlertshow(false);
    };

    const renderOrderItem = (item) => (
        <View key={item.orderId} index={item.orderId} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdText}>ORDER #{item.orderId}</Text>
                </View>
                <View style={styles.paymentMethod}>
                    <Icon size={24} color="#333" name="cash" />
                    <Text style={styles.paymentText}>
                        {item.ord_payment_method === "Cash on Delivery"
                            ? "COD"
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
                    onPress={() => handleCallPress(item.orderCustomerPhone, item?.ord_delivery_address?.alternate_mobile_number)}
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

            <SCLAlert
                theme="warning"
                show={alertshow}
                cancellable={true}
                onRequestClose={handleStatusClose}
                title="Choose a number "
                subtitle="Please choose one of the numbers below to call"
            >
                <View style={styles.phoneNumberContainer}>
                    {/* Display phone1 with label */}
                    <Text style={styles.phoneLabel}>Mobile Number:</Text>
                    <Text style={styles.phoneNumber} onPress={() => handleNumberSelect(phoneNumbers.phone1)}>
                        {phoneNumbers?.phone1}
                    </Text>
                </View>

                {/* Conditionally display the alternative number if it exists */}
                {phoneNumbers?.phone2 && (
                    <View style={styles.phoneNumberContainer}>
                        <Text style={styles.phoneLabel}>Alt Mobile Number:</Text>
                        <Text style={styles.phoneNumber} onPress={() => handleNumberSelect(phoneNumbers.phone2)}>
                            {phoneNumbers?.phone2}
                        </Text>
                    </View>
                )}

                <SCLAlertButton theme="danger" onPress={handleCloseCall}>
                    Cancel
                </SCLAlertButton>
            </SCLAlert>

            {state.pendingOrders.length > 0 ? (
                state.pendingOrders.map(renderOrderItem)
            ) : (
                <View style={styles.noOrdersContainer}>
                    <Text style={styles.noOrdersText}>No Pending Orders</Text>
                </View>
            )}
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
    orderIdContainer: {
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        // paddingVertical: 2,
        borderRadius: 8,
    },
    orderIdText: {

        fontSize: 16,
        fontWeight: "bold",
        color: "black",

    },
    paymentMethod: {
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    paymentText: {
        marginLeft: 8,
        color: '#c61116',
        fontSize: 14,
        fontWeight: "bold",
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
        color: "black",
        fontSize: 18,
    },
    price: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
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
    phoneNumberContainer: {
        flexDirection: 'column',
        marginBottom: 10,
        width: "100%",

    },
    phoneLabel: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    phoneNumber: {
        fontSize: 18,
        marginLeft: 5,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    noOrdersContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    noOrdersText: {
        fontSize: 18,
        color: "#6b7280",
        fontWeight: "bold",
    },
});

export default PendingScreen;

import React, { useState, useContext, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../instance/axios-instance";
import { Colors } from "../constants";
import { AuthContext } from "../providers/AuthProvider";
import RBSheet from "react-native-raw-bottom-sheet";
import DatePicker from "react-native-neat-date-picker";

const CompletedScreen = ({ navigation }) => {
    const refRBSheet = useRef();
    const [completedOrders, setCompletedOrders] = useState([]);
    const { setSpinner, checkLoggin } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState();

    const getAllCompletedOrders = async () => {
        try {
            checkLoggin();
            setSpinner(true);
            const token = await AsyncStorage.getItem("userSession");
            const response = await axios.get(`driver/get_delivered_orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setCompletedOrders(response.data.result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSpinner(false);
        }
    };

    useEffect(() => {
        getAllCompletedOrders();
        const unsubscribeFocus = navigation.addListener("focus", getAllCompletedOrders);
        const unsubscribeTabPress = navigation.addListener("tabPress", getAllCompletedOrders);
        return () => {
            unsubscribeFocus();
            unsubscribeTabPress();
        };
    }, [navigation]);

    const onCancel = () => setOpen(false);

    const onConfirm = async (date) => {
        setDate(date);
        setOpen(false);
        setSpinner(true);
        try {
            const token = await AsyncStorage.getItem("userSession");
            const response = await axios.get(
                `driver/get_delivered_by_date?date=${date.dateString}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("response date data", response);
            if (response.data.success) {
                setCompletedOrders(response.data.result);
            }
        } catch (error) {
            alert("Network unavailable/unstable");
        } finally {
            setSpinner(false);
        }
    };

    return (
        <View style={styles.container}>
            <DatePicker isVisible={open} mode="single" onCancel={onCancel} onConfirm={onConfirm} />

            {/* <RBSheet
                ref={refRBSheet}
                closeOnDragDown
                closeOnPressMask
                customStyles={{
                    wrapper: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                    draggableIcon: { backgroundColor: Colors.Greens_Green },
                }}
            >
                <View style={styles.sheetContent}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setOpen(true)}>
                        <Text style={styles.filterButtonText}>Filter by Date</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet> */}

            {/* Sticky Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}> Filter by date</Text>
                {/* Directly opening DatePicker on icon click */}
                <TouchableOpacity
                    style={styles.filterIcon}
                    onPress={() => setOpen(true)}
                >
                    <Icon name="filter-variant" size={22} color={Colors.Greens_White} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {completedOrders.length > 0 ? (
                    completedOrders.map((item) => (
                        <View key={item.orderId} index={item.orderId} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>ORDER #{item.orderId}</Text>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => navigation.navigate("orderdetails", { order: item })}
                                >
                                    <Icon name="eye" size={18} color={Colors.Greens_White} />
                                    <Text style={styles.viewButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.customerName}>{item.ord_customer_name}</Text>
                            <Text style={styles.customerInfo}>Phone: {item.ord_customer_phone}</Text>
                            <Text style={styles.orderTotal}>Total: {item.ord_grand_total} AED</Text>
                            <Text style={styles.paymentMethod}>
                                Payment: {item.ord_payment_method}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noOrdersText}>No completed orders to show.</Text>
                )}
            </ScrollView>
        </View>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Greens_White,
    },
    header: {
        backgroundColor: Colors.Greens_Green,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
        position: "absolute", // Make header sticky
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // Ensure it stays on top of the content
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,

    },
    headerText: {
        fontSize: 16,
        color: Colors.Greens_White,
        fontWeight: "bold",
    },
    filterIcon: {
        padding: 4,
        backgroundColor: Colors.Greens_Red,
        borderRadius: 8,
    },
    scrollContainer: {
        padding: 15,
        paddingTop: 80, // Add padding to prevent content overlap with sticky header
    },
    orderCard: {
        backgroundColor: Colors.Greens_White,
        borderRadius: 12,
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderId: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.Greens_Black,
        backgroundColor: '#E1C340',
        padding: 5,
        borderRadius: 6
    },
    customerName: {
        fontSize: 16,
        marginTop: 10,
        color: Colors.Greens_Black,
        fontWeight: "600",
    },
    customerInfo: {
        fontSize: 14,
        marginTop: 5,
        color: Colors.Greens_Black,
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
        color: Colors.Greens_Black,
    },
    paymentMethod: {
        fontSize: 16,
        marginTop: 5,
        color: Colors.Greens_Red,
        fontWeight: "bold",
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.Greens_Green,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    viewButtonText: {
        marginLeft: 5,
        color: Colors.Greens_White,
        fontSize: 14,
        fontWeight: "bold",
    },
    sheetContent: {
        padding: 20,
    },
    filterButton: {
        backgroundColor: Colors.Greens_Green,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    filterButtonText: {
        fontSize: 16,
        color: Colors.Greens_White,
        fontWeight: "bold",
    },
    noOrdersText: {
        textAlign: "center",
        color: Colors.Greens_Black,
        fontSize: 16,
        marginTop: 20,
    },
});

export default CompletedScreen;

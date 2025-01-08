import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ImageBackground } from "react-native";
import { Colors } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from '../providers/AuthProvider';
import { showMessage } from "react-native-flash-message";
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';

const DeliveryReturn = ({ navigation }) => {
    const { setSpinner } = useContext(AuthContext);
    const [returnorders, setReturnOrders] = useState([]);
    const [alertshow, setAlertshow] = useState(false);
    const [orderobject, setOrderobject] = useState([]);
    const [itemId, setItemId] = useState(null);
    const [orderUpdated, setOrderUpdated] = useState(0);

    const setStatus = async (order) => {
        console.log('order: ', order);

        setAlertshow(false);
        setSpinner(true);
        try {
            const token = await AsyncStorage.getItem('userSession');
            const response = await axios.put(`driver/update_return_pickup_status/${order}?itemId=${itemId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            // setReturnOrders(response.data);
            setOrderUpdated((prev) => prev + 1)
            showMessage({
                message: "",
                description: 'Order has been collected',
                type: 'success',
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSpinner(false);
        }
    };

    const setDeliveryStatus = (order) => {
        setOrderobject(order);
        setAlertshow(true);
    };

    const handleStatusClose = () => {
        setAlertshow(false);
    };

    useEffect(() => {
        const getReturnOrders = async () => {
            try {
                setSpinner(true);
                const token = await AsyncStorage.getItem('userSession');
                const response = await axios.get('driver/get_returned_replaced_orders', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReturnOrders(response.data.result);
            } catch (error) {
                console.error('Error fetching return orders:', error);
            } finally {
                setSpinner(false);
            }
        };

        getReturnOrders();
        const unsubscribe = navigation.addListener('tabPress', getReturnOrders);

        return unsubscribe;
    }, [navigation, orderUpdated]);

    return (
        <View style={styles.container}>
            <SCLAlert
                theme="warning"
                show={alertshow}
                cancellable={true}
                onRequestClose={handleStatusClose}
                title="Are your sure?"
                subtitle="Press YES to confirm this return as collected"
            >
                <SCLAlertButton theme="success" onPress={() => setStatus(orderobject)}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.welcomeContainer}>
                <View style={styles.TextHolder}>
                    <Text style={styles.UserTxt}>Delivery Returns</Text>
                </View>
            </ImageBackground>

            <ScrollView>
                <View style={styles.ordersContainer}>
                    {Array.isArray(returnorders) && returnorders.length === 0 ? (
                        <Text style={styles.noOrdersText}>No return and replace orders</Text>
                    ) : (
                        Array.isArray(returnorders) && returnorders?.map((item) => (
                            <View key={item.order_id} style={styles.orderCard}>
                                {/* Top Section */}
                                <View style={styles.cardHeader}>
                                    <Text style={styles.highlightText}>Order ID: #{item.order_id}</Text>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => navigation.navigate('orderdetails', { order: { ...item, orderId: item.order_id } })}
                                    >
                                        <Icon size={18} color="white" name="eye" />
                                    </TouchableOpacity>
                                </View>

                                {/* Middle Section */}
                                <View style={styles.detailsSection}>
                                    <Text style={styles.detailText}>Name: {item.ord_customer_name}</Text>
                                    <Text style={styles.detailText}>
                                        Phone: {item.ord_delivery_address?.customer_phone_country_code} {item.ord_customer_phone}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        Alt Phone: {item.ord_delivery_address?.alternate_country_code || ""} {item.ord_delivery_address?.alternate_mobile_number || 'Nill'}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        Payment Method: {(item.ord_payment_method === 'Cash on Delivery') ? "COD" : 'Card'}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        Product Name: {item.prd_name}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        {item.order_type === 'replace'
                                            ? `Replace Quantity: ${item.return_qty}`
                                            : item.order_type === 'return'
                                                ? `Return Quantity: ${item.return_qty}`
                                                : null}
                                    </Text>



                                    {/* <Text style={styles.detailText}>Total: {item.ord_grand_total}</Text> */}
                                </View>

                                {/* Footer Section */}
                                <View style={styles.cardFooter}>
                                    <Text
                                        style={[
                                            styles.typeText,
                                            {
                                                backgroundColor: item.order_type === 'return' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 128, 0, 0.2)',
                                                color: item.order_type === 'return' ? 'red' : 'green',
                                                borderWidth: 1,
                                                borderColor: item.order_type === 'return' ? 'red' : 'green',
                                            }
                                        ]}
                                    >
                                        {item.order_type.toUpperCase()}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.statusButton}
                                        onPress={() => {
                                            setDeliveryStatus(item.order_id);
                                            setItemId(item.order_item_id);
                                        }
                                        }
                                    >
                                        <Text style={styles.statusButtonText}>Collect</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcomeContainer: {
        width: '100%',
        height: 200
    },
    TextHolder: {
        top: 120,
        left: 30,
    },
    ordersContainer: {
        padding: 15,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    UserTxt: {
        color: Colors.Greens_White,
        fontSize: 34,
        fontWeight: "600",
        bottom: 50,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space between title and icon
        alignItems: 'center',
        marginBottom: 10,
    },
    highlightText: {
        fontWeight: '700',
        fontSize: 20,
        color: Colors.Greens_Black,
    },
    viewButton: {
        backgroundColor: '#327F40',
        height: 30,
        width: 30,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
    },
    noOrdersText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.Greens_Black,
        textAlign: 'center',
        marginTop: 20,
    },

    detailsSection: {
        marginVertical: 10,
    },
    detailText: {
        color: Colors.Greens_Black,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space between type and button
        alignItems: 'center',
        marginTop: 10,
    },
    typeText: {
        color: '#fff',
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 50,
        fontSize: 16,
    },
    statusButton: {
        backgroundColor: Colors.Greens_Green,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    statusButtonText: {
        fontWeight: "600",
        fontSize: 14,
        color: '#fff',
        textAlign: "center",
        width: 100
    },
});


export default DeliveryReturn;
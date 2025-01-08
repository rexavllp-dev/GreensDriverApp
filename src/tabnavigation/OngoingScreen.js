import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from "react-native-flash-message";
import { Colors } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { AuthContext } from '../providers/AuthProvider';
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';

const OnGoingScreen = ({ navigation }) => {
    const [ongoingorders, setOngoingorders] = useState([]);
    const { setSpinner, checkLoggin, user } = useContext(AuthContext);
    const [alertshow, setAlertshow] = useState(false);
    const [orderobject, setOrderobject] = useState([]);
    const [statusobject, setStatusobject] = useState('');

    const getOngoingOrders = async () => {
        try {
            checkLoggin();
            setSpinner(true);
            const token = await AsyncStorage.getItem('userSession');
            const response = await axios.get(`driver/get_out_for_delivery`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setOngoingorders(response.data.result);
        } catch (error) {
            console.error(error);
        } finally {
            setSpinner(false);
        }
    };

    useEffect(() => {
        getOngoingOrders();
        const unsubscribeFocus = navigation.addListener('focus', () => {
            getOngoingOrders();
            checkLoggin();
        });
        const unsubscribeTabPress = navigation.addListener('tabPress', () => {
            getOngoingOrders();
            checkLoggin();
        });
        return () => {
            unsubscribeFocus();
            unsubscribeTabPress();
        };
    }, [navigation]);

    const handleCurrentStatus = async (status, order) => {
        setOrderobject(order);
        setStatusobject(status);
        setAlertshow(true);
    }

    const handleStatusClose = async () => {
        setAlertshow(false);
    }

    const setStatus = async (status, order) => {
        console.log("checking order ongoing", order);
        setAlertshow(false);
        const token = await AsyncStorage.getItem('userSession');

        try {
            let endpoint = '';
            let successMessage = '';

            switch (status) {
                case 'delay':
                    endpoint = 'driver/update_delay';
                    successMessage = 'Order marked as delayed';
                    break;
                case 'attempt':
                    endpoint = 'driver/update_attempt';
                    successMessage = 'Delivery attempt recorded';
                    break;
                case 'complete':
                    endpoint = 'driver/update_delivered';
                    successMessage = 'Order marked as complete';
                    break;
                default:
                    console.error('Unsupported status:', status);
                    return;
            }

            const response = await axios.put(`${endpoint}/${order}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('response update status', response);
            console.log('response update status', response.data.success);

            if (response.data.success) {
                alert(successMessage);
                // showMessage({
                //     message: "",
                //     description: successMessage,
                //     type: 'success',
                //     fontStyle: { fontSize: 20 }
                // });
            }

            // Refresh the orders list after status update
            getOngoingOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Network unavailable/unstable');
        }
    };


    return (
        <View style={styles.container}>
            <SCLAlert
                theme="warning"
                show={alertshow}
                cancellable={true}
                onRequestClose={handleStatusClose}
                title="Are you sure?"
                subtitle="Press YES to update the order status"
            >
                <SCLAlertButton theme="success" onPress={() => setStatus(statusobject, orderobject)}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            <ScrollView>
                <View style={styles.bgrey}>
                    {Array.isArray(ongoingorders) && ongoingorders?.map((item) => (
                        <View key={item.orderId}>
                            <View style={styles.orders}>
                                <View style={styles.orderRow}>
                                    <View style={styles.greenbox}>
                                        <Text style={styles.ordertxt}>Order ID</Text>
                                        <Text style={styles.ordertxt}>
                                            # {item.orderId}
                                            {item.ord_contactless_delivery &&
                                                <Icon size={18} color="red" name="bell-off" />
                                            }
                                        </Text>
                                        <View style={styles.payment}>
                                            <Icon size={24} color="black" name="cash" />
                                            <View style={styles.payment_content}>
                                                <Text style={styles.typtxt}>
                                                    {item.ord_payment_method == 'Cash on Delivery'
                                                        ? item.ord_payment_method
                                                        : 'Credit Card/ Debit Card'
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.content_box}>
                                        <View style={styles.viewmain}>
                                            <TouchableOpacity
                                                style={styles.viewButton}
                                                onPress={() => navigation.navigate('orderdetails', { order: item })}
                                            >
                                                <Text style={styles.viewButtonText}>View</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.customerDetail}>
                                            <Text style={styles.customerName}>{item.ord_customer_name}</Text>
                                            <Text style={styles.customerPhone}>Phone: {item.ord_customer_phone}</Text>
                                            <Text style={styles.boxCount}>
                                                No. of boxes: <Text style={styles.textBox}>{item.no_boxes}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.orderPrice}>AED {item.ord_grand_total}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.statusButtonCall}
                                        onPress={() => Linking.openURL(`tel:${item.ord_customer_phone}`)}
                                    >
                                        <Text style={styles.statusButtonText}>
                                            <Icon size={18} color="white" name="phone" /> Call
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.statusButtonWhats}
                                        onPress={() => Linking.openURL(
                                            `whatsapp://send?text=Hi, this is ${user?.first_name?.replace(/"/g, "")} from Greens International delivery. Could you please share your location here? I am on the way with your delivery and will arrive soon.&phone=+971${item.customer_phone}`
                                        )}
                                    >
                                        <Text style={styles.statusButtonText}>
                                            <Icon size={18} color="white" name="whatsapp" /> Chat
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.statusButtonsContainer}>
                                    <View style={styles.statusButtonsRow}>
                                        <TouchableOpacity
                                            style={[styles.statusButton, styles.delayButton]}
                                            onPress={() => handleCurrentStatus('delay', item.orderId)}
                                        >
                                            <Text style={styles.statusButtonText}>
                                                <Icon size={18} color="white" name="clock-outline" /> Delay
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statusButton, styles.attemptButton]}
                                            onPress={() => handleCurrentStatus('attempt', item.orderId)}
                                        >
                                            <Text style={styles.statusButtonText}>
                                                <Icon size={18} color="white" name="refresh" /> Attempt
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.completeButton]}
                                        onPress={() => handleCurrentStatus('complete', item.orderId)}
                                    >
                                        <Text style={styles.statusButtonText}>
                                            <Icon size={18} color="white" name="check" /> Complete
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};



const styles = StyleSheet.create({
    // ... existing styles remain the same ...
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    bgrey: {
        padding: 15,
        paddingBottom: 0,
        borderRadius: 20,
    },
    orders: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 12,
        marginBottom: 15,
        marginTop: 15,
        shadowColor: Colors.Greens_Black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    orderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    greenbox: {
        backgroundColor: '#E1C340',
        height: 100,
        width: 130,
        borderRadius: 10,
        padding: 8,
        marginRight: 8,
    },
    ordertxt: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: 'bold',
    },
    content_box: {
        flex: 1,
        paddingLeft: 8,
        flexDirection: 'column',
    },
    viewmain: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    viewButton: {
        backgroundColor: '#327F40',
        height: 32,
        width: 80,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        elevation: 2,
    },
    viewButtonText: {
        color: Colors.Greens_White,
        fontWeight: '600',
    },
    customerDetail: {
        width: '100%',
        marginTop: 4,
    },
    customerName: {
        color: Colors.Greens_Black,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    customerPhone: {
        color: Colors.Greens_Black,
        fontSize: 14,
        marginBottom: 2,
    },
    boxCount: {
        color: Colors.Greens_Black,
        fontSize: 14,
    },
    textBox: {
        fontSize: 23,
        fontWeight: '600',
        color: Colors.Greens_Black,
    },
    payment: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 12,
        flexDirection: "row",
        padding: 5,
        alignItems: 'center',
    },
    payment_content: {
        marginLeft: 5,
        flex: 1,
    },
    typtxt: {
        fontSize: 12,
        color: '#c61116',
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        alignItems: 'center',
    },
    priceContainer: {
        flex: 1,
    },
    orderPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.Greens_Black,
    },
    statusButtonCall: {
        backgroundColor: 'green',
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
        marginHorizontal: 4,
    },
    statusButtonWhats: {
        backgroundColor: '#128C7E',
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
        marginHorizontal: 4,
    },
    statusButtonText: {
        fontWeight: "600",
        fontSize: 16,
        color: '#fff',
    },
    // New styles for status buttons
    statusButtonsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    statusButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
        paddingHorizontal: 20, // Added padding to give space on sides
    },
    statusButton: {
        width: 120, // Increased fixed width
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
        marginLeft: 2,

    },
    delayButton: {
        backgroundColor: '#FFA500',
    },
    attemptButton: {
        backgroundColor: '#4169E1',
    },
    completeButton: {
        backgroundColor: '#32CD32',
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
    },
});

export default OnGoingScreen;
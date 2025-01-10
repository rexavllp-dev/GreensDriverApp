import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from "react-native";
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
    console.log('ongoingorders: ', ongoingorders);
    const { setSpinner, checkLoggin, user } = useContext(AuthContext);
    const [alertshow, setAlertshow] = useState(false);
    const [callAlertshow, setCallAlertshow] = useState(false);
    const [orderobject, setOrderobject] = useState(null);
    const [statusobject, setStatusobject] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState({ phone1: "", phone2: "" });

    const getOngoingOrders = async () => {
        try {
            checkLoggin();
            setSpinner(true);
            const token = await AsyncStorage.getItem('userSession');
            const response = await axios.get(`driver/get_out_for_delivery`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

    const handleCurrentStatus = (status, order) => {
        setOrderobject(order);
        setStatusobject(status);
        setAlertshow(true);
    };

    const handleCompleteOrder = (order) => {
        setOrderobject(order);
        setStatusobject('complete');
        setAlertshow(true);
    };

    const handleStatusClose = () => {
        setAlertshow(false);
        setCallAlertshow(false);
    };

    const setStatus = async () => {
        setAlertshow(false);
        const token = await AsyncStorage.getItem('userSession');
        const { statusobject: status, orderobject: order } = { statusobject, orderobject };

        try {
            let endpoint = '';
            let successMessage = '';

            switch (status) {
                case 'delay':
                    endpoint = 'driver/update_delay';
                    successMessage = 'Order marked as delayed successfully';
                    break;
                case 'attempt':
                    endpoint = 'driver/update_attempt';
                    successMessage = 'Delivery attempt recorded successfully';
                    break;
                case 'complete':
                    // Navigate to `qrscan` without API request
                    navigation.replace('qrscan', { order });
                    return;
                default:
                    console.error('Unsupported status:', status);
                    return;
            }

            const response = await axios.put(`${endpoint}/${order}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                alert(successMessage);
                getOngoingOrders();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Network unavailable/unstable');
        }
    };

    const handleCallPress = (phone1, phone2) => {
        // Show the alert with both numbers
        setCallAlertshow(true);
        setPhoneNumbers({ phone1, phone2 });
    };

    const handleNumberSelect = (phone) => {
        // Close the alert and call the selected phone number
        Linking.openURL(`tel:${phone}`);
        setCallAlertshow(false);
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
                <SCLAlertButton theme="success" onPress={setStatus}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            {/* number select alert */}
            <SCLAlert
                theme="warning"
                show={callAlertshow}
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

                <SCLAlertButton theme="danger" onPress={handleStatusClose}>
                    Cancel
                </SCLAlertButton>
            </SCLAlert>

            <ScrollView>
                <View style={styles.ordersList}>
                    {Array.isArray(ongoingorders) && ongoingorders.map((item) => (
                        <View key={item.orderId} style={styles.orderCard}>
                            {/* Header Section */}
                            <View style={styles.orderHeader}>
                                <View style={styles.orderIdContainer}>
                                    <Text style={styles.orderIdText}>ORDER #{item.orderId}</Text>

                                    {item.ord_contactless_delivery === "dont ring the bell" ? (
                                        <Icon size={20} color="#FF4444" name="bell-off" style={styles.bellIcon} />
                                    ) : null}
                                    {item.ord_contactless_delivery && item.ord_contactless_delivery !== "dont ring the bell" ? (
                                        <Icon size={20} color="#000000" name="clipboard-text-outline" style={styles.bellIcon} />
                                    ) : null}
                                </View>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => navigation.navigate('orderdetails', { order: item })}
                                >
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Customer Info Section */}
                            <View style={styles.customerSection}>
                                <View style={styles.customerInfo}>
                                    <Text style={styles.customerName}>{item.ord_customer_name}</Text>
                                    <Text style={styles.customerPhone}>
                                        <Icon name="phone" size={16} color="#666" /> {item.ord_customer_phone}
                                    </Text>
                                    <Text style={styles.boxCount}>
                                        Boxes: <Text style={styles.boxNumber}>{item.no_boxes}</Text>
                                    </Text>
                                    <Text style={styles.DeliveryInstractions}>Delivery Instractions: {item.ord_contactless_delivery || 'No Instructions'}</Text>
                                </View>
                                <View style={styles.paymentBadge}>
                                    <Icon size={24} color="#333" name="cash" />
                                    <Text style={styles.paymentMethod}>
                                        {item.ord_payment_method === 'Cash on Delivery' ? 'COD' : 'CARD'}
                                    </Text>
                                </View>
                            </View>

                            {/* Price Section */}
                            <View style={styles.priceSection}>
                                <Text style={styles.priceText}>AED {item.ord_grand_total}</Text>
                            </View>

                            {/* Action Buttons Row */}
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.iconButton, styles.callButton]}
                                    onPress={() => handleCallPress(item.ord_customer_phone, item?.ord_delivery_address?.alternate_mobile_number)}
                                >
                                    <Icon name="phone" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.iconButton, styles.whatsappButton]}
                                    onPress={() => {
                                        const message = `Hi, this is ${user?.first_name?.replace(/"/g, '') || 'Driver'} from Greens International delivery. Could you please share your location here? I am on the way with your delivery and will arrive soon.`;
                                        const phone = `+971${item.ord_customer_phone}`;
                                        const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phone}`;

                                        Linking.canOpenURL(url).then((supported) => {
                                            if (supported) {
                                                Linking.openURL(url);
                                            } else {
                                                Alert.alert('Error', 'WhatsApp is not installed on this device.');
                                            }
                                        }).catch((err) => console.error('An error occurred', err));
                                    }}
                                >
                                    <Icon name="whatsapp" size={24} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.delayButton]}
                                    onPress={() => handleCurrentStatus('delay', item.orderId)}
                                >
                                    <Icon name="clock-outline" size={20} color="white" />
                                    <Text style={styles.actionButtonText}>Delay</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.attemptButton]}
                                    onPress={() => handleCurrentStatus('attempt', item.orderId)}
                                >
                                    <Icon name="refresh" size={20} color="white" />
                                    <Text style={styles.actionButtonText}>Attempt</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Complete Button */}
                            <TouchableOpacity
                                style={styles.completeButton}
                                onPress={() => handleCompleteOrder(item)}
                            >
                                <Icon name="check" size={24} color="white" />
                                <Text style={styles.completeButtonText}>Complete Delivery</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    ordersList: {
        padding: 12,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdContainer: {
        flexDirection: 'row',
        backgroundColor: '#E1C340',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    orderIdText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bellIcon: {
        marginLeft: 8,
    },
    viewButton: {
        backgroundColor: '#327F40',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    customerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        width: '100%',
    },
    customerInfo: {
        flex: 1,
        width: '100%',
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    DeliveryInstractions: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
        marginTop: 8,
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
        padding: 8,
        borderRadius: 10,
        width: '100%',
    },
    customerPhone: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    boxCount: {
        fontSize: 14,
        color: '#666',
    },
    boxNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    paymentBadge: {
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    paymentMethod: {
        marginLeft: 6,
        fontWeight: '800',
        color: '#c61116',
    },
    priceSection: {
        marginBottom: 16,
    },
    priceText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        marginBottom: 16,
        width: "100%",
    },
    iconButton: {
        width: 45,
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    callButton: {
        backgroundColor: '#22C55E',
    },
    whatsappButton: {
        backgroundColor: '#128C7E',
    },
    delayButton: {
        backgroundColor: '#F59E0B',
        // width: "50",

    },
    attemptButton: {
        backgroundColor: '#3B82F6',
        // width: "100%",
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    completeButton: {
        backgroundColor: '#22C55E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
        marginTop: 4,
    },
    completeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },

    phoneNumberContainer: {
        flexDirection: 'row',
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
});



export default OnGoingScreen;
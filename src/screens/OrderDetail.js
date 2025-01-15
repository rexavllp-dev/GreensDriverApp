import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, ScrollView, Image, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from '../providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { Colors } from '../constants';


const { width } = Dimensions.get('window'); // Get screen width
const OrderDetail = ({ route, navigation }) => {
    console.log('route: ', route);

    const [remarks, setRemarks] = useState([]);
    const { setSpinner } = useContext(AuthContext);

    const [orderDetails, setOrderDetails] = useState({});
    console.log('orderDetails: ', orderDetails);
    console.log('orderDetails items: ', orderDetails.orderitems);
    const [maplatitude, setMaplatitude] = useState(null);
    const [maplongitude, setMaplongitude] = useState(null);



    useEffect(() => {
        const abortController = new AbortController();

        const getRemarks = async () => {
            try {
                setSpinner(true);
                const token = await AsyncStorage.getItem('userSession');
                const response = await axios.get(`driver/get_remarks/${route.params.order.orderId}`, {
                    signal: abortController.signal,
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.data.success) {
                    setRemarks(response.data.result);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setSpinner(false);
            }
        };

        getRemarks();
        return () => abortController.abort();
    }, [route.params.order.orderId]);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {

                const response = await axios.get(`driver/get_order_details/${route.params.order.orderId}`);
                console.log('response fetch order details', response);
                if (response.data.success) {
                    setOrderDetails(response.data.result);
                    setMaplatitude(response.data.result?.ord_delivery_address.latitude);
                    setMaplongitude(response.data.result?.ord_delivery_address.longitude);
                };

                // console.log("orderItems", orderDetails.orderitems);

            } catch (error) {
                console.error(error);
            }
        }

        fetchOrderDetails();
    }, [route.params.order.orderId]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Green} translucent />
            {maplatitude && maplongitude ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    region={{
                        latitude: parseFloat(maplatitude),
                        longitude: parseFloat(maplongitude),
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}
                    style={styles.map}
                >
                    <Marker coordinate={{ latitude: parseFloat(maplatitude), longitude: parseFloat(maplongitude) }} />
                </MapView>
            ) : (
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.placeholderText}>Loading Map...</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        <Feather name="truck" size={16} color={Colors.Greens_Green} /> Shipping Address
                    </Text>
                    {orderDetails && orderDetails.ord_delivery_address ? (
                        <>
                            <Text style={styles.text}>
                                <Text style={styles.label}>Flat/Villa:</Text> {orderDetails.ord_delivery_address.flat_villa}
                            </Text>
                            <Text style={styles.text}>
                                <Text style={styles.label}>Address:</Text> {orderDetails.ord_delivery_address.address_line_1} {orderDetails.ord_delivery_address.address_line_2}
                            </Text>
                            <Text style={styles.text}>
                                <Text style={styles.label}>Emirate:</Text> {orderDetails.ord_delivery_address.emirates}
                            </Text>
                            <Text style={styles.text}>
                                <Text style={styles.label}>Zipcode:</Text> {orderDetails.ord_delivery_address.zip_code}
                            </Text>
                            <Text style={[styles.text, { backgroundColor: '#CCFFCC', padding: 5, borderRadius: 5, fontWeight: 'bold' }]}>
                                <Text style={styles.label}>Delivery Instructions:</Text> {orderDetails.contactless_delivery || 'No Instructions'}
                            </Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]} >
                                <Text style={styles.label}>Delivery Remarks:</Text> {orderDetails.ord_delivery_comments || 'Nil'}
                            </Text>
                        </>
                    ) : (
                        <Text>Loading Order Details...</Text>
                    )}

                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        <Feather name="user" size={16} color={Colors.Greens_Green} /> Customer Details
                    </Text>

                    {orderDetails && orderDetails.ord_delivery_address ? (
                        <>
                            <Text style={styles.text}><Text style={styles.label}>Name:</Text> {orderDetails?.ord_customer_name}</Text>
                            <Text style={styles.text}><Text style={styles.label}>Phone:</Text> {orderDetails?.ord_customer_phone}</Text>
                            <Text style={styles.text}><Text style={styles.label}>Email:</Text> {orderDetails?.ord_customer_email}</Text>
                            <Text style={styles.text}><Text style={styles.label}>Alt Phone:</Text> {orderDetails?.ord_delivery_address?.alternate_mobile_number || 'Nil'}</Text>

                        </>
                    ) : (
                        <Text>Loading Order Details...</Text>
                    )}

                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        <Feather name="shopping-bag" size={16} color={Colors.Greens_Green} /> Items Ordered
                    </Text>
                    <View style={styles.listHeader}>
                        <Text style={styles.headerText}>Product Name</Text>
                        <Text style={styles.headerText}>Quantity</Text>
                    </View>
                    {orderDetails && orderDetails.orderitems && orderDetails.orderitems?.length > 0 ? (
                        orderDetails.orderitems.map((item) => {
                            // Determine the background color based on conditions
                            let backgroundColor = null;
                            let label = '';
                            if (item.returnId && item.return_status === 3) {
                                backgroundColor = '#FFCCCC'; // Light Red for returns
                                label = 'Return ';
                            } else if (item.replaceId && item.replace_status === 3) {
                                backgroundColor = '#CCFFCC'; // Light Green for replacements
                                label = 'Replace';
                            }

                            return (
                                <View
                                    key={item.order_item_id}
                                    style={[styles.item, backgroundColor ? { backgroundColor, borderRadius: 10, padding: 5 } : null]}
                                >
                                    <Text style={styles.itemText}>{item.prd_name}</Text>
                                    <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 5, marginRight: 2 }}>
                                        <Text style={[styles.itemQty, width < 360 ? styles.itemQtySmall : styles.itemQtyLarge]}>{item.item_quantity}</Text>
                                        {label ? (
                                            <View style={[
                                                styles.labelContainer,
                                                {
                                                    backgroundColor: item.returnId && item.return_status === 3 ? '#FF6347' : '#32CD32', // Red for returns, Medium Green for replacements
                                                    borderColor: item.returnId && item.return_status === 3 ? '#E74C3C' : '#228B22', // Darker shade for border
                                                },
                                            ]}>
                                                <Text style={styles.labelText}>{label}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text>Loading Order Items...</Text>
                    )}
                </View>



                {/* <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        <Feather name="message-square" size={16} color={Colors.Greens_Green} /> Order Remarks
                    </Text>
                    {remarks.map((item) => (
                        <Text key={item.id} style={styles.text}><Text style={styles.label}>Remark:</Text> {item.admin_remarks}</Text>
                    ))}
                </View> */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.Greens_White },
    map: { height: 300, width: '100%', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
    mapPlaceholder: { height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.Greens_LightGray },
    placeholderText: { color: Colors.Greens_DarkGray, fontSize: 16 },
    scrollContainer: { padding: 15 },
    card: { backgroundColor: Colors.Greens_White, borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.Greens_Black, marginBottom: 10 },
    text: { fontSize: 16, color: Colors.Greens_Black, marginBottom: 5 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: Colors.Greens_LightGray,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.Greens_Black,
    },
    itemQty: {
        fontSize: 14,
        // width: 50,
        // height: 30,
        color: Colors.Greens_White,
        backgroundColor: Colors.Greens_Green,
        fontWeight: '500',
        padding: 5,
        borderRadius: 50,
        flex: 1,
        textAlign: 'center',
        marginBottom: 8
    },

    itemQtySmall: {
        width: 40, // Adjust width for smaller screens
        height: 30,
        fontSize: 12,
    },
    itemQtyLarge: {
        width: 50, // Default width
        height: 35,
        fontSize: 14,
    },

    labelContainer: {
        backgroundColor: '#FF6347', // Eye-catching Tomato Red
        paddingVertical: 3, // Reduced padding for compact badge style
        paddingHorizontal: 12, // Wider horizontal padding for better shape
        borderRadius: 20, // Rounded badge shape
        shadowColor: '#000', // Add a shadow for depth
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4, // Elevation for Android shadow
        borderWidth: 1, // Optional: Adds a slight border for definition
        borderColor: '#FF4500', // Slightly darker red for border
    },

    labelText: {
        color: '#FFF', // White text for contrast
        fontSize: 12, // Compact font size
        fontWeight: '700', // Bold text for readability
        textTransform: 'uppercase', // Make text uppercase for badge-like appearance
        letterSpacing: 0.5, // Slight spacing for better readability
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.Greens_LightGray,
        marginBottom: 5,
    },
    label: { fontWeight: '600' },
    // item: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, alignItems: 'center', padding: 10, borderRadius: 5, marginBottom: 5, backgroundColor: Colors.Greens_LightGray },
    itemReturned: { backgroundColor: Colors.Greens_Red },
    // itemText: { fontSize: 16, color: Colors.Greens_Black, fontWeight: '500' },
    itemText: {
        fontSize: 16,
        color: Colors.Greens_Black,
        fontWeight: '500',
        flex: 2,
    },
    // itemQty: { fontSize: 14, color: Colors.Greens_White, backgroundColor: Colors.Greens_Green, fontWeight: '500', padding: 8, borderRadius: 50 },
    itemReturnedText: { color: Colors.Greens_White },
    divider: { height: 1, backgroundColor: Colors.Greens_LightGray, marginVertical: 5 },
});

export default OrderDetail;

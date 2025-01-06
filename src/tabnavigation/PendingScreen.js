import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../providers/AuthProvider';
import { showMessage, hideMessage } from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { Colors } from '../constants';
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';

const PendingScreen = ({ navigation }) => {



    const [pendingorders, setPendingorders] = useState([]);
    const [alertshow, setAlertshow] = useState(false);
    const [orderobject, setOrderobject] = useState([]);

    const { setSpinner, checkLoggin, setPendingcount } = useContext(AuthContext);


    const setStatus = async (order) => {

        setAlertshow(false);
        setSpinner(true);
        const token = await AsyncStorage.getItem('userSession');
        const user_id = await AsyncStorage.getItem('userId');

        const statuscontroller = new AbortController();

        await axios.get('/accept_delivery/' + order + '/' + user_id, { signal: statuscontroller.signal }, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (response) {

                setPendingorders(response.data);
                setPendingcount(response.data.length);
                setSpinner(false);
                showMessage({

                    message: "",
                    description: 'Order has been moved to Ongoing Tab',
                    type: 'success',
                    textStyle: { fontSize: 16, padding: 10 },

                });


            })
            .catch(function (error) {

                setSpinner(false);

            });

        statuscontroller.abort()

    }

    const setDeliveryStatus = async (order) => {

        setOrderobject(order);
        setAlertshow(true);

    }

    const handleStatusClose = async () => {
        setAlertshow(false);
    }

    useEffect(() => {


        checkLoggin();
        const peindingController = new AbortController();
        const getPendingOrders = async () => {


            setSpinner(true);
            const token = await AsyncStorage.getItem('userSession');
            const user_id = await AsyncStorage.getItem('userId');

            await axios.get('/get_orders/pending/' + user_id, { signal: peindingController.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(function (response) {

                    setPendingorders(response.data);
                    setPendingcount(response.data.length);
                    setSpinner(false);

                })
                .catch(function (error) {

                    setSpinner(false);
                    console.log(error);

                });

        }

        getPendingOrders();

        const unsubscribe = navigation.addListener('tabPress', e => {
            checkLoggin();
            getPendingOrders();
        });


        return () => { unsubscribe, peindingController.abort() }



    }, []);

    return (
        <View style={styles.container}>


            {/* Alerts */}
            <SCLAlert
                theme="warning"
                show={alertshow}
                cancellable={true}
                onRequestClose={handleStatusClose}
                title="Are your sure?"
                subtitle="Press YES to move this to out for delivery"
            >
                <SCLAlertButton theme="success" onPress={() => setStatus(orderobject)}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            {/* End Alerts */}


            <ScrollView>
                <View style={styles.bgrey}>
                    {
                        Array.isArray(pendingorders) && pendingorders?.map((item) => {

                            return (
                                <View key={item.id}>
                                    <View style={styles.orders}>
                                        <View style={styles.greenbox}>
                                            <Text style={styles.ordertxt}>Order ID</Text>
                                            <Text style={styles.ordertxt}># {item.id}</Text>
                                            <View style={styles.payment}>
                                                <Icon size={24} color="black" name="cash" />
                                                <View style={styles.payment_content}>
                                                    <Text style={styles.typtxt}>{(item.payment_method == 'Cash On Delivery') ? item.payment_method : 'Card Payment'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.content_box}>
                                            <View style={styles.viewmain}>
                                                <TouchableOpacity
                                                    style={styles.viewButton}
                                                    onPress={() => navigation.navigate('orderdetails', { order: item })}
                                                >
                                                    <Text style={{ color: Colors.Greens_White }}>View</Text>

                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.customerDetail}>
                                                <Text style={{ color: Colors.Greens_Black }}>{item.customer_first_name} {item.customer_last_name}</Text>
                                                <Text style={{ color: Colors.Greens_Black }}>Phone: {item.customer_phone} </Text>
                                                <Text style={{ color: Colors.Greens_Black }}>No. of boxes : <Text style={styles.textBox}>{item.box} </Text></Text>
                                                <Text style={{ color: Colors.Greens_Black }}>No. of boxes : <Text style={styles.textBox}>{item.box} </Text></Text>
                                                <Text style={styles.orderPrice}>{item.total.formatted}</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ flex: 3 }}>
                                            <TouchableOpacity
                                                style={styles.statusButton}
                                                onPress={() => setDeliveryStatus(item.id)}
                                            >
                                                <Text style={styles.statusButtonText}>Out for Delivery</Text>

                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                style={styles.statusButtonWp}
                                                onPress={() => Linking.openURL('whatsapp://send?text=Hi, Greetings from greens&phone=+971' + item.customer_phone)}
                                            >
                                                <Text style={styles.statusButtonText}>
                                                    <Icon size={18} color="white" name="whatsapp" /></Text>

                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                style={styles.statusButtonCall}
                                                onPress={() => Linking.openURL(`tel:${item.customer_phone}`)}
                                            >
                                                <Text style={styles.statusButtonText}>
                                                    <Icon size={18} color="white" name="phone" /> Call</Text>

                                            </TouchableOpacity>
                                        </View>
                                    </View>


                                </View>
                            )
                        })

                    }

                </View>






            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    textBox: {

        fontSize: 23,
        fontWeight: '600',
        color: Colors.Greens_Black
    },

    bgrey: {

        padding: 15,
        paddingBottom: 0,
        borderRadius: 20
    },
    orders: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        marginBottom: 15,
        marginTop: 15,
        flexDirection: "row",
        shadowColor: Colors.Greens_Black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 9.51,
        elevation: 4,
    },
    greenbox: {
        backgroundColor: Colors.Greens_Red,
        height: 100,
        width: 140,
        borderRadius: 10,
    },
    ordertxt: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        top: 10,
        fontWeight: 'bold'
    },
    statusButton: {
        backgroundColor: '#c61116',
        borderBottomLeftRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#c61116',
        top: -14,
    },
    statusButtonCall: {

        backgroundColor: '#128C7E',
        borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#c61116',
        top: -14,
    },
    statusButtonWp: {

        backgroundColor: 'green',
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#c61116',
        top: -14,
    },
    statusButtonText: {
        fontWeight: "600",
        fontSize: 16,
        color: '#fff',
    },
    payment: {
        backgroundColor: '#fff',
        borderRadius: 10,
        top: 20,
        flexDirection: "row",
        padding: 5,
        marginLeft: 3,
        marginRight: 3,
    },
    pmtxt: {
        fontSize: 10,
        textAlign: 'center',
    },
    typtxt: {
        fontSize: 12,
        color: '#c61116',
        fontWeight: "600",
        textAlign: 'center',
    },
    payment_content: {
        marginLeft: 5,
    },
    content_box: {
        marginLeft: 10,
        width: '58%'
    },
    viewButton: {

        backgroundColor: '#327F40',
        height: 30,
        width: 70,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        right: 10,
    },
    viewmain: {
        alignItems: 'flex-end',
    },
    customerDetail: {
        maxWidth: 140,
        bottom: 15,
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: '600',
        top: 10,
        color: Colors.Greens_Black
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        width: 200,
        alignSelf: "flex-end",
    },
    picker: {
        width: 200,
        height: 30,
        bottom: 20,
        marginTop: 30,
    },
});
export default PendingScreen;

import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage, hideMessage } from "react-native-flash-message";
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




    useEffect(() => {

        const ongoingController = new AbortController();

        const getOngoingOrders = async () => {

            checkLoggin();
            setSpinner(true);
            const token = await AsyncStorage.getItem('userSession');
            const user_id = await AsyncStorage.getItem('userId');

            await axios.get('/get_orders/ongoing/' + user_id, { signal: ongoingController.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(function (response) {
                    console.log(response);
                    setOngoingorders(response.data);
                    setSpinner(false);
                })
                .catch(function (error) {
                    console.log(error)
                    setSpinner(false);

                });
        }
        const unsubscribe = navigation.addListener('tabPress', e => {
            getOngoingOrders();
            checkLoggin();
        });

        return () => { unsubscribe, ongoingController.abort() }

    }, []);

    const handleCurrentStatus = async (status, order) => {

        setOrderobject(order);
        setStatusobject(status);
        setAlertshow(true);

    }

    const handleStatusClose = async () => {
        setAlertshow(false);
    }

    const setStatus = async (status, order) => {

        setAlertshow(false);
        if (status == 'delay') {

            const delayController = new AbortController();
            const token = await AsyncStorage.getItem('userSession');
            await axios.get('/order_postponed/' + order, { signal: delayController.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(function (response) {

                    showMessage({

                        message: "",
                        description: 'Notified Customer',
                        type: 'success',
                        fontStyle: { fontSize: 20 }


                    });
                })
                .catch(function (error) {

                    alert('Network unavailable/unstable');

                });

            delayController.abort();
        }

        if (status == 'arrived') {

            const arrivedController = new AbortController();
            const token = await AsyncStorage.getItem('userSession');

            await axios.get('/notifyarrival/' + order, { signal: arrivedController.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(function (response) {

                    showMessage({

                        message: "",
                        description: 'Notified Customer',
                        type: 'success',
                        fontStyle: { fontSize: 20 }

                    });
                })
                .catch(function (error) {

                    alert('Network unavailable/unstable');

                });

            arrivedController.abort();
        }


    }



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
                <SCLAlertButton theme="success" onPress={() => setStatus(statusobject, orderobject)}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            {/* End Alerts */}


            <ScrollView>

                <View style={styles.bgrey}>
                    {
                        Array.isArray(ongoingorders) && ongoingorders?.map((item) => {

                            return (<View key={item.id}>
                                <View style={styles.orders}>
                                    <View style={{ flexDirection: "row" }}>


                                        <View style={styles.greenbox}>
                                            <Text style={styles.ordertxt}>Order ID</Text>
                                            <Text style={styles.ordertxt}># {item.id} <Text>  {(item.contactless_delivery == 1) ? <Icon size={18} color="red" name="bell-off" /> : ''} </Text></Text>

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
                                                <Text style={{ color: Colors.Greens_Black }}>Phone: {item.customer_phone}</Text>
                                                <Text style={{ color: Colors.Greens_Black }}>No. of boxes : <Text style={styles.textBox}>{item.box} </Text></Text>

                                            </View>
                                        </View>

                                    </View>

                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.orderPrice}>{item.total.formatted}</Text>
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
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                style={styles.statusButtonWhats}
                                                onPress={() => Linking.openURL(`whatsapp://send?text=Hi, this is ${user?.first_name?.replace(/"/g, "")} from Greens International delivery. Could you please share your location here? I am on the way with your delivery and will arrive soon.&phone=+971` + item.customer_phone)}
                                            >
                                                <Text style={styles.statusButtonText}>
                                                    <Icon size={18} color="white" name="whatsapp" /> Chat</Text>

                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row" }}>
                                    <View style={{ flex: 1 }}>
                                        <TouchableOpacity
                                            style={styles.statusButtonDelay}
                                            onPress={() => handleCurrentStatus('delay', item.id)}
                                        >
                                            <Text style={styles.statusButtonText}>Delay</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TouchableOpacity
                                            style={styles.statusButtonArrival}
                                            onPress={() => handleCurrentStatus('arrived', item.id)}
                                        >
                                            <Text style={styles.statusButtonText}>Attempt</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TouchableOpacity
                                            style={styles.statusButton}
                                            onPress={() => navigation.replace('qrscan', { order: item })}
                                        >
                                            <Text style={styles.statusButtonText}>Complete</Text>
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
    statusButtonCall: {
        backgroundColor: 'green',
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 5,
    },

    statusButtonWhats: {

        backgroundColor: '#128C7E',
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        height: 40,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 5,
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
        backgroundColor: '#E1C340',
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
        backgroundColor: '#00A300',
        //borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
        top: -14,
    },

    statusButtonDelay: {
        backgroundColor: Colors.Greens_Red,
        borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
        top: -14,
    },

    statusButtonArrival: {

        backgroundColor: '#FAD02C',
        //borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
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
    call: {

        flexDirection: "row",
        top: 20,
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
        top: 4
    },
    payment_content: {
        marginLeft: 5,
    },
    content_box: {
        marginLeft: 10,
        width: '58%',
        paddingBottom: 10
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
export default OnGoingScreen;

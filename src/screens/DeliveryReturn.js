import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, StatusBar, ImageBackground } from "react-native";
import { Colors } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from '../providers/AuthProvider';
import { showMessage, hideMessage } from "react-native-flash-message";
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';

const DeliveryReturn = ({ navigation }) => {

    const { setSpinner, user, logout } = useContext(AuthContext);
    const [returnorders, setReturnOrders] = useState([]);

    const [alertshow, setAlertshow] = useState(false);
    const [orderobject, setOrderobject] = useState([]);


    const setStatus = async (order) => {

        const statuscontroller = new AbortController();
        setAlertshow(false);
        setSpinner(true);
        const token = await AsyncStorage.getItem('userSession');
        const source = await axios.get('/return_collect/' + order, { signal: statuscontroller.signal }, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (response) {

                setReturnOrders(response.data);
                setSpinner(false);
                showMessage({

                    message: "",
                    description: 'Order has been collected',
                    type: 'success',
                    fontStyle: { fontSize: 20 }

                });

            })
            .catch(function (error) {

                console.log(error);

            });

        statuscontroller.abort();

    }

    const setDeliveryStatus = async (order) => {

        setOrderobject(order);
        setAlertshow(true);
    }


    const handleStatusClose = async () => {
        setAlertshow(false);
    }

    useEffect(() => {

        const returncontroller = new AbortController();

        const getReturnOrders = async () => {
            setSpinner(true);

            const token = await AsyncStorage.getItem('userSession');
            const user_id = await AsyncStorage.getItem('userId');

            await axios.get('/get_orders/return/' + user_id, { signal: returncontroller.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(function (response) {

                    setReturnOrders(response.data);
                    setSpinner(false);

                })
                .catch(function (error) {

                    console.log(error);

                });

        }
        getReturnOrders();

        const unsubscribe = navigation.addListener('tabPress', e => {
            getReturnOrders();
        });
        return () => { unsubscribe, returncontroller.abort() };

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
                subtitle="Press YES to confirm this return as collected"
            >
                <SCLAlertButton theme="success" onPress={() => setStatus(orderobject)}>YES</SCLAlertButton>
                <SCLAlertButton theme="danger" onPress={handleStatusClose}>NO</SCLAlertButton>
            </SCLAlert>

            {/* End Alerts */}



            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.welcomeContainer}>

                <View style={styles.TextHolder}>
                    <Text style={styles.UserTxt}>Delivery Returns</Text>

                </View>

            </ImageBackground>

            <ScrollView>

                <View style={styles.bgrey}>
                    {

                        Array.isArray(returnorders) && returnorders?.map((item) => {
                            return <View key={item.id}>
                                <View style={styles.orders}>
                                    <View style={styles.greenbox}>
                                        <View>
                                            <Text style={styles.ordertxt}>Order ID</Text>
                                            <Text style={styles.ordertxt}># {item.id}</Text>
                                        </View>
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
                                                <Icon size={18} color="white" name="eye" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.customerDetail}>
                                            <Text style={{ color: Colors.Greens_Black }}>{item.customer_first_name}</Text>
                                            <Text style={{ color: Colors.Greens_Black }}>Phone: {item.customer_phone}</Text>
                                            <Text style={styles.orderPrice}>{item.total.formatted}</Text>
                                        </View>
                                        <View style={{...styles.returnTypeBox, backgroundColor: item.products[0]?.product_status == 'return_request' ? '#c61116' : '#1e90ff'}}>
                                            <Text style={styles.returnTypeTxt}>{(item.products[0]?.product_status == 'return_request') ? ("Return Item") : (item.products[0]?.product_status == 'replace_request' ? "Replacement Item" : "")}</Text>
                                        </View>
                                    </View>

                                </View>

                                <TouchableOpacity
                                    style={styles.statusButton}
                                    onPress={() => setDeliveryStatus(item.id)}
                                >
                                    <Text style={styles.statusButtonText}>Collect</Text>

                                </TouchableOpacity>

                            </View>
                        })

                    }

                </View>

            </ScrollView>

        </View>


    );
};

const styles = StyleSheet.create({
    container: {

        flexDirection: 'column',
        flex: 1
    },
    welcomeContainer: {

        flex: 1

    },
    inputSection: {

        flex: 1,
        alignItems: 'center'
    },

    UserTxt: {
        color: Colors.Greens_White,
        fontSize: 34,
        fontWeight: "600",
        bottom: 5,
    },
    TextHolder: {
        top: 120,
        left: 30,
    },
    inputContainer: {

        paddingHorizontal: 20,
        marginHorizontal: 20,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.Greens_Green,
        justifyContent: "center",
        marginBottom: 15,
        width: 280,
        top: -25,
        backgroundColor: Colors.Greens_White,
    },
    inputSubcontainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    inputText: {
        fontSize: 14,
        fontWeight: "300",
        color: Colors.Greens_Black,
        width: '100%',
        alignSelf: 'flex-start'
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
        height: 148,
        width: 140,
        borderRadius: 10,
        justifyContent: "space-around",
        paddingBottom: 20
    },
    ordertxt: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        top: 10,
        fontWeight: 'bold'
    },
    statusButton: {
        backgroundColor: Colors.Greens_Green,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
        alignItems: 'center',
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
        width: 30,
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
        fontSize: 20,
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
    returnTypeBox: {
        top: 10,
        height: 40,
        marginRight: 10,
        borderRadius: 10,
        justifyContent: 'center'
    },
    returnTypeTxt: {
        color: 'white',
        fontSize: 15,
        textAlign: 'center',
    }
});
export default DeliveryReturn;

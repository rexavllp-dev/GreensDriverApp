import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { Colors } from '../constants';
import { AuthContext } from '../providers/AuthProvider';
import RBSheet from "react-native-raw-bottom-sheet";
import DatePicker from 'react-native-neat-date-picker'

const CompletedScreen = ({ navigation }) => {

    const refRBSheet = useRef();
    const [completedorders, setCompletedorders] = useState([]);
    const { setSpinner } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState();


    useEffect(() => {

        const completeController = new AbortController();
        const getCompletedOrders = async () => {
            setSpinner(true);

            const token = await AsyncStorage.getItem('userSession');
            const user_id = await AsyncStorage.getItem('userId');

            await axios.get('/get_orders/completed/' + user_id, { signal: completeController.signal }, {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            })
                .then(function (response) {

                    setCompletedorders(response.data);
                    setSpinner(false);
                })
                .catch(function (error) {

                    setSpinner(false);

                });
        }


        const unsubscribe = navigation.addListener('tabPress', e => {
            getCompletedOrders();
        });

        return () => { unsubscribe, completeController.abort() }

    }, []);

    const onCancel = () => {
        // You should close the modal in here
        setOpen(false);
    }

    const onConfirm = async (date) => {

        setDate(date);
        // You should close the modal in here
        setOpen(false)
        // The parameter 'date' is a Date object so that you can use any Date prototype method.
        setSpinner(true);
        const token = await AsyncStorage.getItem('userSession');
        const user_id = await AsyncStorage.getItem('userId');

        axios.get('/get_ordersc_ompleted_bydate/' + date.dateString + '/' + user_id, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (response) {

                setCompletedorders(response.data);
                setSpinner(false);
            })
            .catch(function (error) {

                setSpinner(false);
                alert('Network unavailable/unstable');

            });



    }



    return (
        <View style={styles.container}>

            <DatePicker
                isVisible={open}
                mode={'single'}
                onCancel={onCancel}
                onConfirm={onConfirm}
            />

            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    draggableIcon: {
                        backgroundColor: "#c61116"
                    }
                }}
            >
                <View style={styles.FilterContent}>

                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <Pressable
                            style={styles.FilterButton}
                            onPress={() => setOpen(true)}
                        >
                            <Text style={styles.FilterButtonText}>Completed by Date</Text>

                        </Pressable>

                    </View>
                </View>
            </RBSheet>


            <ScrollView>
                <View style={styles.FilterDiv}>
                    <TouchableOpacity style={styles.signinButton} onPress={() => refRBSheet.current.open()}>
                        <Text style={styles.FilterTxt}><Icon size={20} color="black" name="filter-variant" /> Options</Text>
                    </TouchableOpacity>
                </View>





                <View style={styles.bgrey}>
                    {
                        Array.isArray(completedorders) && completedorders?.map((item) => {

                            return <View key={item.id}>
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
                                                <Icon size={18} color="white" name="eye" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.customerDetail}>
                                            <Text style={{ color: Colors.Greens_Black }}>{item.customer_first_name}</Text>
                                            <Text style={{ color: Colors.Greens_Black }}>Phone: {item.customer_phone}</Text>
                                            <Text style={styles.orderPrice}>{item.total.formatted}</Text>
                                        </View>
                                    </View>

                                </View>


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
        padding: 10,
    },
    bgrey: {

        padding: 15,
        paddingBottom: 0,
        borderRadius: 20
    },
    orders: {
        backgroundColor: '#fff',
        borderRadius: 20,
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
        backgroundColor: '#3e6f63',
        height: 100,
        width: 140,
        borderRadius: 10,
    },
    ordertxt: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        top: 10,
    },
    statusButton: {
        backgroundColor: '#c61116',
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

    FilterDiv: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "flex-end",
        alignItems: "flex-end",
        backgroundColor: "#f2f2f2",
        width: 200,
        alignSelf: "flex-end",
        padding: 10,
    },
    FilterTxt: {
        fontWeight: '400',
        color: "#000",
        fontSize: 18,
    },
    FilterContent: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    FilterButton: {
        padding: 10,
        backgroundColor: '#ccc6',
        borderRadius: 10,
        marginLeft: 5,
        top: 10,
        height: 40
    },
    FilterButtonText: {
        color: '#0006',
        fontSize: 12,
    }
});
export default CompletedScreen;

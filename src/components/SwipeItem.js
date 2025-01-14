import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Text, StatusBar, FlatList } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from '../providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { Colors } from '../constants';
import NetInfo from "@react-native-community/netinfo";

const Separator = () => <View style={styles.itemSeparator} />;

const LeftSwipeActions = () => {
    return (
        <View style={styles.verifyOrder}>
            <View style={styles.iconBgVerify}>
                <Icon style={styles.iconVerify} name="check" size={24} />
            </View>
            <Text style={styles.verifyText}>Verify Order</Text>
        </View>
    );
};

const OrderCard = ({ item, onPress, navigation }) => (
    <View style={styles.swipableStyle}>
        <View style={styles.orderHeader}>
            <View style={styles.iconContainer}>
                <Icon style={styles.icon} name="card-text-outline" size={24} />
            </View>
            <View style={styles.orderInfo}>
                <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
                <View style={styles.statusContainer}>
                    <Text style={[
                        styles.statusText,
                        item.ord_package_verified ? styles.verifiedStatus : styles.pendingStatus
                    ]}>
                        {item.ord_package_verified ? (
                            <>
                                <Icon size={16} color="#327F40" name="check" />
                                {' Verified'}
                            </>
                        ) : (
                            <>
                                <Icon size={16} color="#327F40" name="gesture-swipe-right" />
                                {' Swipe to verify'}
                            </>
                        )}
                    </Text>
                </View>
            </View>
        </View>

        <View style={styles.addressContainer}>
            <Icon size={18} color="#666" name="map-marker" />
            <Text style={styles.addressText} numberOfLines={2}>
                {[
                    item.address_title,
                    item.flat_villa,
                    item.address_line_1,
                    item.address_line_2,
                    item.zip_code
                ].filter(Boolean).join(', ')}
            </Text>
        </View>

        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('orderdetails', { order: item })}
            >
                <Text style={styles.buttonText}>View Map</Text>
            </TouchableOpacity>
            <View style={styles.packageCount}>
                <Text style={styles.packageLabel}>Packages:</Text>
                <Text style={styles.packageNumber}>{item.no_boxes}</Text>
            </View>
        </View>
    </View>
);


const SwipeItem = () => {

    const navigation = useNavigation();
    const [unverifiedorders, setUnverifiedorders] = useState([]);
    const { setSpinner, checkLoggin } = useContext(AuthContext);

    useEffect(() => {
        const verifyController = new AbortController();

        const loadOrders = async () => {
            try {
                checkLoggin();
                setSpinner(true);

                const token = await AsyncStorage.getItem('userSession');
                const password = await AsyncStorage.getItem('password');
                console.log('password: ', password);
                

                // console.log("token", token);
                if (!token) {
                    throw new Error("User session token not found");
                }
                const userId = await AsyncStorage.getItem('userId');

                const response = await axios.get(
                    `driver/driver_unverified_orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: verifyController.signal
                    }
                );


                // console.log("response verify", response);

                if (response.data.success) {
                    setUnverifiedorders(response.data.result);
                }
                // console.log(unverifiedorders.map(order => order));

            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Error fetching unverified orders:", error.message);
                }
            } finally {
                setSpinner(false);
            }
        };

        loadOrders();

        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                alert('Network unavailable/unstable');
            }
        });

        return () => {
            verifyController.abort();
            unsubscribe();
        };
    }, [navigation]);


    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.container}>
                <FlatList
                    key={item => item.id}
                    data={unverifiedorders}
                    keyExtractor={(item) => item.orderId}
                    indexExtractor={(item) => item.orderId}
                    renderItem={({ item }) => (
                        <Swipeable
                            renderLeftActions={LeftSwipeActions}
                            onSwipeableLeftOpen={() =>
                                navigation.replace('qrverifybox', { orderId: item.orderId })
                            }
                        >
                            <OrderCard item={item} navigation={navigation} />
                        </Swipeable>
                    )}
                    ItemSeparatorComponent={Separator}
                    contentContainerStyle={styles.listContainer}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    itemSeparator: {
        height: 12,
    },
    swipableStyle: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: Colors.Greens_Green,
        borderRadius: 8,
        padding: 8,
    },
    icon: {
        color: 'white',
    },
    orderInfo: {
        flex: 1,
        marginLeft: 12,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.Greens_Black,
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    verifiedStatus: {
        color: '#327F40',
    },
    pendingStatus: {
        color: '#327F40',
    },
    addressContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addressText: {
        flex: 1,
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewButton: {
        backgroundColor: Colors.Greens_Green,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    packageCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    packageLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 4,
    },
    packageNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.Greens_Black,
    },
    verifyOrder: {
        backgroundColor: '#327F40',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        margin: 4,
        borderRadius: 12,
    },
    iconBgVerify: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        marginBottom: 4,
    },
    iconVerify: {
        color: '#327F40',
    },
    verifyText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default SwipeItem;

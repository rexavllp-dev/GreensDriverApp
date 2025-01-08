import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { AuthContext } from '../providers/AuthProvider';
import { Colors } from "../constants";

const { width } = Dimensions.get('window');

const SearchResults = ({ route, navigation }) => {
    const { logout, setSpinner, checkLoggin } = useContext(AuthContext);
    const [searchResults, setSearchResults] = useState([]);
    const [resultMessage, setResultMessage] = useState('Searching...');

    const fetchSearchResults = async () => {
        try {
            checkLoggin();
            setSpinner(true);
            const token = await AsyncStorage.getItem("userSession");
            const response = await axios.get(`/driver/search_orders?orderId=${route.params.query}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.data.success && response.data.result.length > 0) {
                setSearchResults(response.data.result);
            } else {
                setSearchResults([]);
                setResultMessage("No results found");
            }
        } catch (error) {
            setSearchResults([]);
            setResultMessage("An error occurred. Please try again.");
        } finally {
            setSpinner(false);
        }
    };

    useEffect(() => {
        fetchSearchResults();
        const unsubscribeFocus = navigation.addListener("focus", fetchSearchResults);
        return () => unsubscribeFocus();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Red} />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Search Results</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Icon name="logout" size={24} color={Colors.Greens_White} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <View style={styles.content}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {searchResults.length > 0 ? (
                        searchResults.map((item) => (
                            <View key={item.orderId} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Order ID: #{item.orderId}</Text>
                                    <Text style={styles.paymentMethod}>
                                        {item.ord_payment_method === 'Cash on Delivery' ? 'Cash on delivery' : 'Card Payment'}
                                    </Text>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.customerInfo}>
                                        <Text style={styles.infoText}>Customer: {item.ord_customer_name}</Text>
                                        <Text style={styles.infoText}>Phone: {item.ord_customer_phone}</Text>
                                        <Text style={styles.infoPrice}>Total: {item.ord_grand_total}</Text>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => navigation.navigate('orderdetails', { order: item })}
                                    >
                                        <Icon name="eye" size={20} color={Colors.Greens_White} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.resultMessage}>{resultMessage}</Text>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Greens_LightGray,
    },
    header: {
        height: 220,
        justifyContent: "flex-end",
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: "hidden",
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 30,
        color: Colors.Greens_White,
        fontWeight: "700",
    },
    logoutButton: {
        backgroundColor: Colors.Greens_Red,
        borderRadius: 20,
        padding: 10,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    card: {
        backgroundColor: Colors.Greens_White,
        borderRadius: 15,
        marginBottom: 20,
        padding: 20,
        shadowColor: Colors.Greens_Black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.Greens_LightGray,
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.Greens_Black,
    },
    paymentMethod: {
        fontSize: 14,
        color: Colors.Greens_Red,
        fontWeight: "600",
        marginTop: 5,
    },
    cardBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    customerInfo: {
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        color: Colors.Greens_Black,
        marginBottom: 5,
    },
    infoPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.Greens_Red,
        marginTop: 10,
    },
    viewButton: {
        backgroundColor: Colors.Greens_Red,
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    resultMessage: {
        fontSize: 18,
        color: Colors.Greens_Black,
        textAlign: "center",
        marginTop: 20,
    },
});

export default SearchResults;

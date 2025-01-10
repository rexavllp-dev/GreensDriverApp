import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from "../constants";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from '../providers/AuthProvider';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Tabs from '../tabnavigation/Tabs';

const Orders = ({ navigation }) => {

    const { logout, user } = useContext(AuthContext);
    const [search, setSearch] = useState();

    const handleSearchOrder = () => {
        if (isNaN(search)) {
            alert('Please Enter numbers only');
        } else {
            navigation.navigate('searchresults', { query: search });
        }
    }

    return (
        <View style={styles.container}>

            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.Greens_Red}
                translucent
            />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.backgroundImage}>

                {/* User Greeting */}
                <View style={styles.userGreeting}>
                    <Text style={styles.greetingText}>Hi, <Text style={styles.userName}>{(user) ? user.first_name.replace(/"/g, '') : ''}</Text></Text>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutButton}>
                    <TouchableOpacity onPress={logout}>
                        <Icon name="power" size={28} color="white" />
                    </TouchableOpacity>
                </View>

            </ImageBackground>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Feather
                        name="search"
                        size={18}
                        color={Colors.Greens_Black}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        keyboardType='numeric'
                        placeholder="Search Orders"
                        placeholderTextColor={Colors.Greens_Black}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        onSubmitEditing={handleSearchOrder}
                    />
                </View>
            </View>

            {/* Bottom Tabs */}
            <Tabs />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 2,
        justifyContent: 'flex-end',
        padding: 20,
        // height:250
    },
    userGreeting: {
        paddingBottom: 40,
    },
    greetingText: {
        fontSize: 28,
        color: Colors.Greens_White,
        fontWeight: '600',
    },
    userName: {
        fontWeight: '700',
    },
    logoutButton: {
        position: 'absolute',
        top: 30,
        right: 20,
    },
    searchContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.Greens_White,
        borderRadius: 25,
        paddingHorizontal: 15,
        width: '85%',
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.Greens_Black,
        paddingVertical: 0,
    },
});

export default Orders;

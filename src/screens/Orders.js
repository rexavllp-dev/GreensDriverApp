import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, TextInput } from 'react-native';
import { Colors, } from "../constants";
import Feather from "react-native-vector-icons/Feather";
import Tabs from '../tabnavigation/Tabs';
import { TouchableOpacity } from "react-native-gesture-handler";
import { AuthContext } from '../providers/AuthProvider';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
                backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.welcomeContainer}>

                <View style={styles.TextHolder}>
                    <Text style={styles.UserTxt}>Hi, <Text style={styles.UserTxt}>{user ? user.first_name.replace(/"/g, '') : ''}</Text></Text>
                    {/*                     
                    <TouchableOpacity onPress={logout}>
                        <Text>Logout</Text>
                    </TouchableOpacity> */}
                </View>
                <View style={{ flex: 1, alignItems: "flex-end", padding: 15 }}>
                    <TouchableOpacity style={styles.signinButton} onPress={logout}>
                        <Icon size={28} color="white" name="power" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputSubcontainer}>
                        <Feather
                            name="search"
                            size={18}
                            color={Colors.Greens_Black}
                            style={{ marginRight: 7 }} />
                        <TextInput
                            keyboardType='numeric'
                            placeholder="Seach Orders"
                            placeholderTextColor={Colors.Greens_Black}
                            onChangeText={setSearch}
                            style={styles.inputText}
                            onSubmitEditing={() => handleSearchOrder()}
                        />
                    </View>
                </View>
            </View>
            <Tabs />
        </View>


    );
};

const styles = StyleSheet.create({
    container: {

        flexDirection: 'column',
        flex: 1
    },
    welcomeContainer: {

        flex: 3

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
});

export default Orders;
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from '../constants';

const Upload = () => {
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.Greens_Red} translucent />


            <View style={styles.orderDetail}>
                <Text style={styles.headText}>Upload Package Photo</Text>
            </View>
            <View style={styles.spacing}></View>
            <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('Upload')} >
                <Text style={styles.signinButtonText}> <Feather
                    name="camera"
                    size={20}
                    color={Colors.Greens_White}
                    style={{ marginRight: 10 }} /> Open Camera</Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        flex: 1,
    },
    orderDetail: {
        padding: 10,
        top: 25,
        bottom: 25,
    },
    spacing: {
        marginTop: 85,
    },
    headText: {
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center',
        top: 85,
    },
    signinButton: {
        backgroundColor: Colors.Greens_Green,
        borderRadius: 20,
        marginHorizontal: 20,
        width: 220,
        height: 50,
        height: 50,
        justifyContent: 'center',
        alignSelf: 'center',
        borderColor: Colors.Greens_Green,
        borderWidth: 1,
        top: 40,
    },
    signinButtonText: {
        fontWeight: "600",
        fontSize: 20,
        color: Colors.Greens_White,
        textAlign: 'center',
    },
});
export default Upload;
